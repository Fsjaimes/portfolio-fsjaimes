// Fondo 3D: campo de puntos fijo detrás de la página que se desplaza y gira con el scroll.
import * as THREE from 'three';

function crearPuntos(cantidad: number, color: number, tamano: number, opacidad: number) {
  const posiciones = new Float32Array(cantidad * 3);
  for (let i = 0; i < cantidad; i++) {
    posiciones[i * 3] = (Math.random() - 0.5) * 34;
    posiciones[i * 3 + 1] = (Math.random() - 0.5) * 60;
    posiciones[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
  const material = new THREE.PointsMaterial({
    color,
    size: tamano,
    sizeAttenuation: true,
    transparent: true,
    opacity: opacidad,
    depthWrite: false,
  });
  return new THREE.Points(geometria, material);
}

function montarFondo(lienzo: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: false });
  } catch {
    lienzo.remove();
    return;
  }

  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camara.position.z = 14;

  const grupo = new THREE.Group();
  grupo.add(crearPuntos(520, 0xf7fafc, 0.05, 0.45));
  grupo.add(crearPuntos(46, 0xdbff00, 0.11, 0.9));
  escena.add(grupo);

  const ajustar = () => {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  };

  let scrollSuave = window.scrollY;
  let cuadro = 0;
  let anterior = performance.now();

  const pintar = (ahora: number) => {
    cuadro = 0;
    const dt = Math.min((ahora - anterior) / 1000, 0.05);
    anterior = ahora;
    const quieto = sinMovimiento.matches;

    scrollSuave += (window.scrollY - scrollSuave) * (quieto ? 1 : 1 - Math.pow(1 - 0.08, dt * 60));
    camara.position.y = -scrollSuave * 0.0045;
    grupo.rotation.y = scrollSuave * 0.00035;
    if (!quieto) grupo.rotation.z += dt * 0.008;

    renderer.render(escena, camara);

    const sigueMoviendose = Math.abs(window.scrollY - scrollSuave) > 0.5;
    if (!document.hidden && (!quieto || sigueMoviendose)) pedir();
  };

  const pedir = () => {
    if (!cuadro) cuadro = requestAnimationFrame(pintar);
  };

  ajustar();
  pedir();

  window.addEventListener('resize', () => {
    ajustar();
    pedir();
  });
  window.addEventListener('scroll', pedir, { passive: true });
  document.addEventListener('visibilitychange', () => {
    anterior = performance.now();
    if (!document.hidden) pedir();
  });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(cuadro);
    grupo.children.forEach((hijo) => {
      const puntos = hijo as THREE.Points;
      puntos.geometry.dispose();
      (puntos.material as THREE.Material).dispose();
    });
    renderer.dispose();
  });
}

const lienzo = document.querySelector<HTMLCanvasElement>('canvas[data-fondo]');
if (lienzo) montarFondo(lienzo);
