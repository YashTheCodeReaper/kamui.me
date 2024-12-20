const lenis = new Lenis();
window.lenis = lenis;
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
window.addEventListener("load", () => {
});
