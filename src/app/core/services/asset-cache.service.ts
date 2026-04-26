import { Injectable, OnDestroy } from '@angular/core';

import { ASSET_CACHE_VERSION, CACHED_ASSETS } from '../data/asset-manifest';

/**
 * Versioned IndexedDB asset cache.
 *
 *   1. On first visit, `prime()` fetches every asset listed in the
 *      manifest, stores each as a `Blob`, and writes the manifest version
 *      so subsequent visits short-circuit the download. A progress callback
 *      is invoked after each asset completes (or fails) so the splash
 *      progress bar can mirror real download state.
 *
 *   2. On repeat visits with a matching version, `prime()` resolves
 *      immediately with progress = 1 — every asset is already in IDB.
 *
 *   3. On a version mismatch (e.g. a new deploy bumped
 *      `ASSET_CACHE_VERSION`), the entire `assets` object store is wiped
 *      and step 1 runs again. This guarantees stale clients pick up new
 *      builds without manual cache busting.
 *
 *   4. Once primed, components ask for assets by their canonical path via
 *      `cachedUrl(path)`, which returns a `blob:` URL pointing at the
 *      stored Blob. Misses (asset not in manifest, IDB unavailable, fetch
 *      failed during priming) fall back to the original network path so
 *      no consumer has to handle the unhappy case.
 *
 * IDB unavailable (private mode in some browsers, opaque origin) is a
 * non-fatal degradation: every method silently falls back to network paths
 * and `prime()` resolves immediately.
 */

const DB_NAME = 'kamui-asset-cache';
const DB_VERSION = 1;
const STORE_ASSETS = 'assets';
const STORE_META = 'meta';
const META_VERSION_KEY = 'manifest-version';

/**
 * High-level state of the cache priming pipeline. Surfaced to the splash
 * so we can show "Downloading X" vs "Reading from cache" vs "Ready".
 */
export type CachePhase = 'idle' | 'downloading' | 'hydrating' | 'ready';

export interface CacheStatus {
  /** 0..1, suitable for a progress-bar width. */
  readonly progress: number;
  /** Assets fully processed so far (downloaded or hydrated from IDB). */
  readonly completed: number;
  /** Total assets the manifest declares. */
  readonly total: number;
  /** Path of the asset currently in flight, if any. */
  readonly current?: string;
  /** Bytes for `current` once its blob has been read. */
  readonly currentBytes?: number;
  readonly phase: CachePhase;
}

export type ProgressListener = (status: CacheStatus) => void;

interface AssetRecord {
  /** Canonical asset path, e.g. `'assets/videos/vader.mp4'`. */
  readonly path: string;
  readonly blob: Blob;
  readonly cachedAt: number;
}

@Injectable({ providedIn: 'root' })
export class AssetCacheService implements OnDestroy {
  /** Resolved blob URLs, keyed by asset path. Lazy-built on first lookup. */
  private readonly urlCache = new Map<string, string>();
  /** Blobs read out of IDB after `prime()`. */
  private readonly blobCache = new Map<string, Blob>();

  private dbPromise?: Promise<IDBDatabase | null>;
  private primed = false;

  ngOnDestroy(): void {
    // Free any object URLs we minted so the browser can GC the underlying
    // blobs. New URLs are minted lazily on next `cachedUrl()` call.
    for (const url of this.urlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
  }

  /**
   * Ensure every manifest asset is in IDB. Resolves once priming is done;
   * `progress` is invoked with rich status updates throughout.
   */
  async prime(progress: ProgressListener = () => {}): Promise<void> {
    const total = CACHED_ASSETS.length;

    if (this.primed) {
      progress({ progress: 1, completed: total, total, phase: 'ready' });
      return;
    }

    const db = await this.openDb();
    if (!db) {
      // No IDB → can't cache, but the app still works fine over the network.
      progress({ progress: 1, completed: total, total, phase: 'ready' });
      this.primed = true;
      return;
    }

    const storedVersion = await this.readMeta(db, META_VERSION_KEY);
    const isCacheValid = storedVersion === ASSET_CACHE_VERSION;

    if (isCacheValid && (await this.allAssetsPresent(db))) {
      // Cache hit — pull blobs into memory so `cachedUrl()` is sync.
      await this.hydrateBlobsFromDb(db, progress);
      progress({ progress: 1, completed: total, total, phase: 'ready' });
      this.primed = true;
      return;
    }

    // Cache miss or version drift → wipe and re-fill.
    if (!isCacheValid) {
      await this.clearStore(db, STORE_ASSETS);
    }

    await this.downloadManifest(db, progress);

    // Persist the new version *after* every asset has been written, so a
    // partial failure doesn't leave the cache marked-good with missing files.
    await this.writeMeta(db, META_VERSION_KEY, ASSET_CACHE_VERSION);
    progress({ progress: 1, completed: total, total, phase: 'ready' });
    this.primed = true;
  }

  /**
   * Resolve a path to a `blob:` URL when cached, falling back to the path
   * itself otherwise. Synchronous: every consumer can use it inline.
   */
  cachedUrl(path: string): string {
    const existing = this.urlCache.get(path);
    if (existing) return existing;

    const blob = this.blobCache.get(path);
    if (!blob) return path;

    const url = URL.createObjectURL(blob);
    this.urlCache.set(path, url);
    return url;
  }

  // ---- IDB plumbing --------------------------------------------------------

  private openDb(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase | null>(resolve => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch {
        resolve(null);
        return;
      }

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_ASSETS)) {
          db.createObjectStore(STORE_ASSETS, { keyPath: 'path' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });

    return this.dbPromise;
  }

  private readMeta(db: IDBDatabase, key: string): Promise<string | undefined> {
    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_META, 'readonly');
        const req = tx.objectStore(STORE_META).get(key);
        req.onsuccess = () => resolve(req.result as string | undefined);
        req.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });
  }

  private writeMeta(db: IDBDatabase, key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_META, 'readwrite');
        tx.objectStore(STORE_META).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  private clearStore(db: IDBDatabase, storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async allAssetsPresent(db: IDBDatabase): Promise<boolean> {
    for (const path of CACHED_ASSETS) {
      const exists = await this.assetExists(db, path);
      if (!exists) return false;
    }
    return true;
  }

  private assetExists(db: IDBDatabase, path: string): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_ASSETS, 'readonly');
        const req = tx.objectStore(STORE_ASSETS).count(path);
        req.onsuccess = () => resolve(req.result > 0);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  private async hydrateBlobsFromDb(
    db: IDBDatabase,
    progress: ProgressListener,
  ): Promise<void> {
    const total = CACHED_ASSETS.length;
    let completed = 0;
    for (const path of CACHED_ASSETS) {
      progress({
        progress: completed / total,
        completed,
        total,
        current: path,
        phase: 'hydrating',
      });
      const record = await this.readAsset(db, path);
      if (record) this.blobCache.set(path, record.blob);
      completed += 1;
      progress({
        progress: completed / total,
        completed,
        total,
        current: path,
        currentBytes: record?.blob.size,
        phase: 'hydrating',
      });
    }
  }

  private readAsset(db: IDBDatabase, path: string): Promise<AssetRecord | undefined> {
    return new Promise(resolve => {
      try {
        const tx = db.transaction(STORE_ASSETS, 'readonly');
        const req = tx.objectStore(STORE_ASSETS).get(path);
        req.onsuccess = () => resolve(req.result as AssetRecord | undefined);
        req.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });
  }

  private writeAsset(db: IDBDatabase, record: AssetRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_ASSETS, 'readwrite');
        tx.objectStore(STORE_ASSETS).put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // ---- Download orchestration ---------------------------------------------

  private async downloadManifest(
    db: IDBDatabase,
    progress: ProgressListener,
  ): Promise<void> {
    const total = CACHED_ASSETS.length;
    if (total === 0) {
      progress({ progress: 1, completed: 0, total: 0, phase: 'ready' });
      return;
    }

    let completed = 0;
    progress({ progress: 0, completed: 0, total, phase: 'downloading' });

    // Download in parallel with a small concurrency cap so a fast network
    // doesn't open 30+ sockets at once and choke the rest of the page.
    const CONCURRENCY = 4;
    const queue = [...CACHED_ASSETS];

    const worker = async (): Promise<void> => {
      while (queue.length > 0) {
        const path = queue.shift();
        if (!path) return;

        // Announce the start of this asset so the splash can show "fetching X"
        // even while the bytes are still in flight.
        progress({
          progress: completed / total,
          completed,
          total,
          current: path,
          phase: 'downloading',
        });

        try {
          const blob = await this.downloadOne(path);
          this.blobCache.set(path, blob);
          await this.writeAsset(db, { path, blob, cachedAt: Date.now() });
          completed += 1;
          progress({
            progress: completed / total,
            completed,
            total,
            current: path,
            currentBytes: blob.size,
            phase: 'downloading',
          });
        } catch (err) {
          // Failed downloads aren't fatal; the consumer falls back to the
          // network path on miss.
          console.warn(`[AssetCache] failed to cache ${path}`, err);
          completed += 1;
          progress({
            progress: completed / total,
            completed,
            total,
            current: path,
            phase: 'downloading',
          });
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, total) }, () => worker()),
    );
  }

  private async downloadOne(path: string): Promise<Blob> {
    const response = await fetch(path, { cache: 'reload' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${path}`);
    }
    return response.blob();
  }
}
