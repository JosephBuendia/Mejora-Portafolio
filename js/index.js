// js/index.js
import { abrirModalAuth, obtenerUsuarioActual, mostrarAlertaModal, actualizarNavegacion } from "./auth.js";

// ==========================================
// 1. CONTROL DE NAVEGACIÓN Y SESIÓN
// ==========================================
function estaAutenticado() {
  return Boolean(obtenerUsuarioActual());
}

function initAuthModal() {
  // Interceptar clics en botones del Hero que requieren inicio de sesión
  document.addEventListener('click', (e) => {
    // Botón "Botón de auxilio" (Hero)
    const auxilioBtn = e.target.closest('.btn-auxilio');
    if (auxilioBtn) {
      if (!estaAutenticado()) {
        e.preventDefault();
        abrirModalAuth('login');
        return;
      }
    }

    // Botón "Cómo funciona" (Hero)
    const comoFuncionaBtn = e.target.closest('.btn-como-funciona, .hero-actions a[href="como-funciona.html"]');
    if (comoFuncionaBtn) {
      if (!estaAutenticado()) {
        e.preventDefault();
        abrirModalAuth('login');
        return;
      }
    }
  });
}

// ==========================================
// 2. CARRUSEL FOTOGRÁFICO CONTINUO
// ==========================================
function iniciarCarrusel() {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.dot');
  let currentSlide = 0;

  if (slides.length === 0) return;

  function mostrarSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      if (dots[i]) dots[i].classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => mostrarSlide(index));
  });

  setInterval(() => {
    let proximoIndex = (currentSlide + 1) % slides.length;
    mostrarSlide(proximoIndex);
  }, 4500);
}

// ==========================================
// 3. CONTEO ANIMADO DE INDICADORES
// ==========================================
function animarContadores() {
  const contadores = document.querySelectorAll('.stat-number');
  if (contadores.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';

        let valorActual = 0;
        const duracionTotalMs = 2000;
        const fps = 30;
        const totalPasos = Math.round((duracionTotalMs / 1000) * fps);
        const incrementoPorPaso = target / totalPasos;
        let pasoActual = 0;

        const timer = setInterval(() => {
          pasoActual++;
          valorActual += incrementoPorPaso;

          if (pasoActual >= totalPasos || valorActual >= target) {
            valorActual = target;
            clearInterval(timer);
          }

          el.textContent = `${prefix}${Math.floor(valorActual)}${suffix}`;
        }, 1000 / fps);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  contadores.forEach(c => observer.observe(c));
}

// ==========================================
// 4. VENTANA EMERGENTE (MODAL) DE INCIDENTES
// ==========================================
const INCIDENTS_DATA = {
  'boton-auxilio': {
    badge: 'Atención de Emergencia Inmediata',
    title: 'Botón de auxilio en línea',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    description: 'Plataforma digital optimizada para el despacho prioritario de patrullas y serenos en tiempo real. Al presionar el botón de auxilio, se genera un ticket de alerta instantáneo con tu ubicación registrada.',
    details: [
      'Geolocalización referencial directa a la Central de Cómputo',
      'Asignación automática de la unidad móvil o motorizada más cercana',
      'Comunicación directa con el radio operador de turno',
      'Disponible las 24 horas del día, los 365 días del año'
    ],
    btnText: 'Reportar emergencia',
    link: 'formulario.html',
    requiresAuth: false
  },
  'patrullaje-zonas': {
    badge: 'Patrullaje Sectorizado',
    title: 'Patrullaje por zonas y cuadrantes',
    image: 'https://images.unsplash.com/photo-1569974498991-d3c12a504f95?auto=format&fit=crop&w=800&q=80',
    description: 'Consulta el recorrido, horarios y cuadrantes asignados a tu sector. Despliegue constante de unidades vehiculares y patrullaje a pie para la prevención del delito en zonas urbanas.',
    details: [
      'Rutas programadas en cuadrantes urbanos y zonas periurbanas',
      'Monitoreo permanente en coordinación con serenos motorizados',
      'Presencia física preventiva en puntos de mayor afluencia',
      'Atención y respuesta directa a comités vecinales de seguridad'
    ],
    btnText: 'Ver Zonas de Patrullaje',
    link: 'servicios.html',
    requiresAuth: false
  },
  'central-radio': {
    badge: 'Central de Comunicaciones 24/7',
    title: 'Central de radio y mando operativo',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    description: 'Mesa de control e interconexión telefónica y de radio para coordinar la respuesta rápida de patrullas, ambulancias, bomberos y la Policía Nacional del Perú.',
    details: [
      'Línea directa (064) 123-4567 activa de forma permanente',
      'Red de radiocomunicación integrada de alta cobertura provincial',
      'Articulación inmediata con la Policía Nacional (105) y SAMU',
      'Atención y asistencia guiada por operadores capacitados'
    ],
    btnText: 'Ver Ubicación y Contacto',
    link: 'contacto.html',
    requiresAuth: false
  }
};

function initIncidentModal() {
  const overlay = document.getElementById('incident-modal-overlay');
  const btnClose = document.getElementById('btn-close-incident-modal');
  const modalImg = document.getElementById('incident-modal-img');
  const modalBadge = document.getElementById('incident-modal-badge');
  const modalTitle = document.getElementById('incident-modal-title');
  const modalDesc = document.getElementById('incident-modal-desc');
  const modalList = document.getElementById('incident-modal-list');
  const actionBtn = document.getElementById('incident-modal-action-btn');

  let currentTargetLink = '';
  let currentRequiresAuth = false;

  document.querySelectorAll('.incident-card').forEach(card => {
    card.addEventListener('click', () => {
      const incidentId = card.getAttribute('data-incident-id');
      const data = INCIDENTS_DATA[incidentId];

      if (!data) return;

      if (modalImg) modalImg.src = data.image;
      if (modalBadge) modalBadge.textContent = data.badge;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalDesc) modalDesc.textContent = data.description;

      if (modalList) {
        modalList.innerHTML = data.details.map(item => `<li>${item}</li>`).join('');
      }

      if (actionBtn) {
        actionBtn.textContent = data.btnText;
      }

      currentTargetLink = data.link;
      currentRequiresAuth = Boolean(data.requiresAuth);
      openModal();
    });
  });

  actionBtn?.addEventListener('click', () => {
    closeModal();
    if (currentTargetLink) {
      if (currentRequiresAuth && !estaAutenticado()) {
        abrirModalAuth('login');
      } else {
        window.location.href = currentTargetLink;
      }
    }
  });

  function openModal() {
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btnClose?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('active')) {
      closeModal();
    }
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  actualizarNavegacion();
  initAuthModal();
  iniciarCarrusel();
  animarContadores();
  initIncidentModal();
});