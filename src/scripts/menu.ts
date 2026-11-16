// Menú de pantalla completa para móvil: se abre desde el botón de la cabecera,
// se cierra con el mismo botón, con Escape, al elegir una sección o al pasar a escritorio.
const boton = document.querySelector<HTMLButtonElement>('[data-menu-boton]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const texto = document.querySelector<HTMLElement>('[data-menu-texto]');

if (boton && menu && texto) {
  const enlaces = [...menu.querySelectorAll<HTMLAnchorElement>('a')];
  const escritorio = window.matchMedia('(min-width: 48rem)');
  let cierre = 0;

  const abierto = () => boton.getAttribute('aria-expanded') === 'true';

  const abrir = (conTeclado: boolean) => {
    window.clearTimeout(cierre);
    menu.hidden = false;
    // Un fotograma con el menú visible pero cerrado, para que la transición arranque.
    void menu.offsetWidth;
    menu.classList.add('abierto');
    boton.setAttribute('aria-expanded', 'true');
    texto.textContent = 'Cerrar';
    document.documentElement.style.overflow = 'hidden';
    // Con teclado el foco pasa al primer enlace; con toque o ratón se queda en el botón.
    if (conTeclado) enlaces[0]?.focus({ preventScroll: true });
  };

  const cerrar = (devolverFoco = true) => {
    if (!abierto()) return;
    menu.classList.remove('abierto');
    boton.setAttribute('aria-expanded', 'false');
    texto.textContent = 'Menú';
    document.documentElement.style.overflow = '';
    const duracion = parseFloat(getComputedStyle(menu).transitionDuration) * 1000 || 0;
    cierre = window.setTimeout(() => (menu.hidden = true), duracion);
    if (devolverFoco) boton.focus({ preventScroll: true });
  };

  // detail === 0 indica que el clic vino del teclado (Enter o Espacio).
  boton.addEventListener('click', (e) => (abierto() ? cerrar() : abrir(e.detail === 0)));

  enlaces.forEach((enlace) => enlace.addEventListener('click', () => cerrar(false)));

  document.addEventListener('keydown', (e) => {
    if (!abierto()) return;
    if (e.key === 'Escape') {
      cerrar();
      return;
    }
    // Mantiene el foco dentro del menú y el botón mientras está abierto.
    if (e.key === 'Tab') {
      const ciclo = [boton, ...enlaces];
      const actual = ciclo.indexOf(document.activeElement as HTMLAnchorElement);
      const siguiente = e.shiftKey ? actual - 1 : actual + 1;
      if (actual === -1 || siguiente < 0 || siguiente >= ciclo.length) {
        e.preventDefault();
        ciclo[e.shiftKey ? ciclo.length - 1 : 0].focus();
      }
    }
  });

  escritorio.addEventListener('change', (e) => {
    if (e.matches) cerrar(false);
  });
}
