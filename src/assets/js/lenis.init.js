const lenis = new Lenis({
  lerp: 0.05,
});
window.lenis = lenis;
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
window.addEventListener("load", () => {
});
