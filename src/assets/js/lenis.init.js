const lenis = new Lenis({
  lerp: 0.04,
});
window.lenis = lenis;
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
window.addEventListener("load", () => {
});
