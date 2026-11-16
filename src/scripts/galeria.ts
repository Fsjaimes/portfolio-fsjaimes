// Galería 3D de proyectos: una fila de tarjetas separadas en profundidad que se
// recorre con el scroll de la página. La tarjeta seleccionada queda de frente; las
// vecinas se alejan arriba y abajo. Las tarjetas se flexionan con la velocidad del
// scroll y quedan planas al detenerse.
import * as THREE from 'three';

interface Proyecto {
  titulo: string;
  resumen: string;
  stack: string[];
  portada?: string;
}

const ANCHO = 4.492;
const ALTO = ANCHO / 1.6;
const SUAVIZADO = 0.047;
const ESPERA_AJUSTE = 160;
const FUENTE = '"Bricolage Grotesque Variable", system-ui, sans-serif';

const TEMAS = [
  { fondo: '#f7fafc', texto: '#102c40', marca: '#dbff00' },
  { fondo: '#dbff00', texto: '#102c40', marca: '#102c40' },
  { fondo: '#0b2233', texto: '#f7fafc', marca: '#dbff00' },
];

const suave = THREE.MathUtils.smoothstep;

/** Portada generada con el título del proyecto, para los que aún no tienen imagen. */
function dibujarPortada(proyecto: Proyecto, indice: number): HTMLCanvasElement {
  const lienzo = document.createElement('canvas');
  lienzo.width = 1600;
  lienzo.height = 1000;
  const ctx = lienzo.getContext('2d')!;
  const tema = TEMAS[indice % TEMAS.length];

  ctx.fillStyle = tema.fondo;
  ctx.fillRect(0, 0, 1600, 1000);

  ctx.fillStyle = tema.marca;
  ctx.fillRect(110, 110, 150, 26);

  ctx.fillStyle = tema.texto;
  ctx.textBaseline = 'alphabetic';
  let cuerpo = 250;
  do {
    ctx.font = `800 ${cuerpo}px ${FUENTE}`;
    cuerpo -= 10;
  } while (ctx.measureText(proyecto.titulo).width > 1380 && cuerpo > 80);
  ctx.fillText(proyecto.titulo, 104, 640);

  if (proyecto.stack.length) {
    ctx.font = `500 46px ${FUENTE}`;
    ctx.fillText(proyecto.stack.join('  /  '), 110, 880);
  }

  if (tema.fondo === '#0b2233') {
    ctx.strokeStyle = 'rgba(247, 250, 252, 0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 1594, 994);
  }
  return lienzo;
}

function montarGaleria(seccion: HTMLElement) {
  const escenario = seccion.querySelector<HTMLElement>('.escenario')!;
  const lienzo = seccion.querySelector<HTMLCanvasElement>('canvas')!;
  const proyectos: Proyecto[] = JSON.parse(seccion.dataset.proyectos ?? '[]');
  const n = proyectos.length;
  if (!n) return;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: true });
  } catch {
    seccion.classList.add('sin-webgl');
    return;
  }
  renderer.setClearColor(0x000000, 0);

  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escena = new THREE.Scene();
  const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camara.position.set(20, 12.1, 16.6);
  camara.lookAt(-7, -2.1, 1.3);

  const pista = new THREE.Group();
  pista.position.set(4.3, 2.1, 5.1);
  pista.rotation.set(-0.0215, 2.2884, 0.2884, 'XYZ');
  escena.add(pista);

  const geometria = new THREE.PlaneGeometry(ANCHO, ALTO, 12, 32);
  const velocidad = { value: 0 };
  const texturas: THREE.Texture[] = [];
  const cargador = new THREE.TextureLoader();

  const tarjetas = proyectos.map((proyecto, i) => {
    const textura = proyecto.portada
      ? cargador.load(proyecto.portada)
      : new THREE.CanvasTexture(dibujarPortada(proyecto, i));
    textura.colorSpace = THREE.SRGBColorSpace;
    textura.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texturas.push(textura);

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: { uMapa: { value: textura }, uVelocidad: velocidad },
      vertexShader: /* glsl */ `
        uniform float uVelocidad;
        varying vec2 vUv;
        void main() {
          // La pista muestra el reverso del plano: se invierte U para que el texto se lea.
          vUv = vec2(1.0 - uv.x, uv.y);
          vec3 p = position;
          p.z += -sin(uv.y * 2.0) * 0.4 * clamp(uVelocidad * 2.0, -2.0, 2.0) * 2.25;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMapa;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(uMapa, vUv);
          #include <colorspace_fragment>
        }
      `,
    });
    const malla = new THREE.Mesh(geometria, material);
    malla.matrixAutoUpdate = false;
    pista.add(malla);
    return malla;
  });

  // Las portadas generadas se redibujan cuando la tipografía termina de cargar.
  document.fonts?.load(`800 100px ${FUENTE}`).then(() => {
    proyectos.forEach((proyecto, i) => {
      if (proyecto.portada) return;
      const textura = texturas[i] as THREE.CanvasTexture;
      textura.image = dibujarPortada(proyecto, i);
      textura.needsUpdate = true;
    });
  });

  // --- Estado -------------------------------------------------------------
  let fase = 0;
  let objetivo = 0;
  let ultimaEntrada = 0;
  let visible = false;
  let cuadro = 0;
  let anterior = performance.now();

  const m = new THREE.Matrix4();
  const aux = new THREE.Matrix4();

  const colocar = () => {
    tarjetas.forEach((malla, i) => {
      const relativo = ((((i - fase + n / 2) % n) + n) % n) - n / 2;
      const d = Math.abs(relativo);
      malla.visible = d <= 3.2;
      if (!malla.visible) return;

      const desplazamiento = relativo + Math.sign(relativo) * 7 * suave(d, 0.1, 0.9);
      const peso = suave(1 - suave(d, 0, 0.8), 0, 1);

      // Giro de enfoque alrededor del pivote (ANCHO/2, 0, 0) del espacio de la pista,
      // aplicado sobre la posición base de la tarjeta.
      m.makeTranslation(ANCHO / 2, 0, 0)
        .multiply(aux.makeRotationX(-0.06681 * peso))
        .multiply(aux.makeRotationY(0.36331 * peso))
        .multiply(aux.makeRotationZ(-0.51318 * peso))
        .multiply(aux.makeTranslation(-ANCHO / 2, 0, 0))
        .multiply(aux.makeTranslation(desplazamiento, 0, -ANCHO / 2 - 1))
        .multiply(aux.makeRotationY(Math.PI / 2));
      malla.matrix.copy(m);
      malla.matrixWorldNeedsUpdate = true;
    });
  };

  const ajustar = () => {
    const ancho = escenario.clientWidth;
    const alto = escenario.clientHeight;
    if (!ancho || !alto) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(ancho, alto, false);
    const aspecto = ancho / alto;
    // En pantallas estrechas se abre el encuadre para que la tarjeta quepa entera.
    const altura = Math.max(ancho < 640 ? 12.5 : 10.8, 6.6 / aspecto);
    camara.top = altura / 2;
    camara.bottom = -altura / 2;
    camara.right = (altura * aspecto) / 2;
    camara.left = -camara.right;
    camara.updateProjectionMatrix();
  };

  // --- Entrada: el scroll de la página mueve la fase -----------------------
  const recorrido = () => Math.max(seccion.offsetHeight - window.innerHeight, 1);

  const leerScroll = () => {
    const avance = THREE.MathUtils.clamp(-seccion.getBoundingClientRect().top / recorrido(), 0, 1);
    return avance * (n - 1);
  };

  const alScroll = () => {
    objetivo = leerScroll();
    ultimaEntrada = performance.now();
  };

  const irA = (indice: number) => {
    const destino = THREE.MathUtils.clamp(indice, 0, n - 1);
    const y = seccion.getBoundingClientRect().top + window.scrollY + (destino / (n - 1 || 1)) * recorrido();
    window.scrollTo({ top: y, behavior: sinMovimiento.matches ? 'auto' : 'smooth' });
  };

  const alTeclado = (e: KeyboardEvent) => {
    const actual = Math.round(objetivo);
    if (e.key === 'ArrowDown') irA(actual + 1);
    else if (e.key === 'ArrowUp') irA(actual - 1);
    else if (e.key === 'Home') irA(0);
    else return;
    e.preventDefault();
  };

  // Arrastre vertical con ratón o lápiz; el táctil usa el scroll nativo.
  let arrastre: { id: number; y: number } | null = null;

  const alPulsar = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    arrastre = { id: e.pointerId, y: e.clientY };
    escenario.setPointerCapture(e.pointerId);
    escenario.classList.add('arrastrando');
  };

  const alMover = (e: PointerEvent) => {
    if (!arrastre || e.pointerId !== arrastre.id) return;
    const dy = THREE.MathUtils.clamp(e.clientY - arrastre.y, -120, 120);
    arrastre.y = e.clientY;
    window.scrollBy({ top: -dy * 1.6, behavior: 'instant' });
  };

  const alSoltar = (e: PointerEvent) => {
    if (!arrastre || e.pointerId !== arrastre.id) return;
    if (escenario.hasPointerCapture(e.pointerId)) escenario.releasePointerCapture(e.pointerId);
    arrastre = null;
    escenario.classList.remove('arrastrando');
  };

  // --- Bucle ---------------------------------------------------------------
  const pintar = (ahora: number) => {
    cuadro = 0;
    const dt = Math.min((ahora - anterior) / 1000, 0.05);
    anterior = ahora;
    const quieto = sinMovimiento.matches;

    // Tras 160 ms sin entrada, la fase se asienta en el proyecto más cercano.
    const meta = ahora - ultimaEntrada > ESPERA_AJUSTE ? Math.round(objetivo) : objetivo;
    const previa = fase;
    fase += (meta - fase) * (quieto ? 1 : 1 - Math.pow(1 - SUAVIZADO, dt * 60));
    if (Math.abs(meta - fase) < 0.0004) fase = meta;

    const cambio = dt > 0 ? (fase - previa) / (dt * 60) : 0;
    velocidad.value = quieto || Math.abs(cambio) < 0.0002 ? 0 : cambio * 9;

    colocar();
    renderer.render(escena, camara);
    if (visible && !document.hidden) pedir();
  };

  const pedir = () => {
    if (!cuadro) {
      cuadro = requestAnimationFrame(pintar);
    }
  };

  const reanudar = () => {
    anterior = performance.now();
    if (visible && !document.hidden) pedir();
  };

  const observadorVista = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    reanudar();
  });
  observadorVista.observe(seccion);

  const observadorTamano = new ResizeObserver(() => {
    ajustar();
    objetivo = leerScroll();
    reanudar();
  });
  observadorTamano.observe(escenario);

  window.addEventListener('scroll', alScroll, { passive: true });
  document.addEventListener('visibilitychange', reanudar);
  escenario.addEventListener('keydown', alTeclado);
  escenario.addEventListener('pointerdown', alPulsar);
  escenario.addEventListener('pointermove', alMover);
  escenario.addEventListener('pointerup', alSoltar);
  escenario.addEventListener('pointercancel', alSoltar);
  lienzo.addEventListener('webglcontextlost', () => seccion.classList.add('sin-webgl'));

  ajustar();
  objetivo = fase = Math.round(leerScroll());
  colocar();
  renderer.render(escena, camara);

  window.addEventListener(
    'pagehide',
    () => {
      cancelAnimationFrame(cuadro);
      observadorVista.disconnect();
      observadorTamano.disconnect();
      window.removeEventListener('scroll', alScroll);
      document.removeEventListener('visibilitychange', reanudar);
      geometria.dispose();
      texturas.forEach((t) => t.dispose());
      tarjetas.forEach((malla) => (malla.material as THREE.Material).dispose());
      renderer.dispose();
    },
    { once: true },
  );
}

document.querySelectorAll<HTMLElement>('[data-galeria]').forEach(montarGaleria);
