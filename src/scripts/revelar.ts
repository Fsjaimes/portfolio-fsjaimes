// Marca como visibles los bloques [data-revelar] cuando entran en pantalla.
// La animación (títulos y texto que suben desde abajo) vive en global.css.
const bloques = document.querySelectorAll<HTMLElement>('[data-revelar]');

if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -18% 0px', threshold: 0.05 },
  );
  bloques.forEach((b) => observador.observe(b));
} else {
  bloques.forEach((b) => b.classList.add('visible'));
}
