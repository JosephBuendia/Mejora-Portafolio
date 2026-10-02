// js/como-funciona.js
import { actualizarNavegacion, iniciarSesion, registrarUsuario, mostrarAlertaModal } from "./auth.js";

// Base de datos local con la información detallada de cada tarjeta
const requisitosData = {
  emergencia: {
    titulo: "Emergencia en curso",
    badge: "Atención Inmediata",
    badgeClass: "badge-alert",
    imagen: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    descripcion: "Plataforma digital optimizada para el despacho prioritario de patrullas y serenos en tiempo real. Al reportar, se genera un ticket de alerta instantáneo para despliegue prioritario.",
    requisitos: [
      "Ubicación exacta con referencias claras de calle, manzana o intersección.",
      "Número de teléfono de contacto activo para comunicación directa con la Central.",
      "Descripción breve y precisa del riesgo o delito en curso.",
      "No se requiere DNI de forma obligatoria para realizar el reporte inicial."
    ]
  },
  patrullaje: {
    titulo: "Solicitud de patrullaje preventivo",
    badge: "Atención Programada",
    badgeClass: "badge-warning",
    imagen: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    descripcion: "Programación estratégica de rondas periódicas de unidades móviles y motorizadas en sectores residenciales o zonas comerciales de alta vulnerabilidad.",
    requisitos: [
      "Nombre completo y DNI del solicitante o representante vecinal.",
      "Dirección exacta del sector, junta vecinal o manzana requerida.",
      "Rango de horario en el que se solicita mayor presencia operativa de la unidad.",
      "Breve sustento o antecedentes de incidencias en la zona."
    ]
  },
  nocturno: {
    titulo: "Acompañamiento nocturno",
    badge: "Resguardo Vecinal Nocturno",
    badgeClass: "badge-info",
    imagen: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    descripcion: "Servicio de resguardo preventivo diseñado para ciudadanos que se desplazan durante la madrugada o retornos en horarios de alto riesgo dentro de la jurisdicción.",
    requisitos: [
      "Documento Nacional de Identidad (DNI) físico o digital.",
      "Punto de partida y destino final dentro de la provincia de Huancayo.",
      "Horario aproximado del recorrido y confirmación telefónica activa.",
      "Solicitud registrada con un mínimo de 30 minutos de anticipación."
    ]
  }
};

// ==========================================
// 1. CONTROL DEL MODAL DE REQUISITOS (TARJETAS)
// ==========================================
function abrirReqModal(id) {
  const data = requisitosData[id];
  if (!data) return;

  const modal = document.getElementById('req-modal-overlay');
  const imgEl = document.getElementById('info-modal-img');
  const badgeEl = document.getElementById('info-modal-badge');
  const titleEl = document.getElementById('info-modal-title');
  const descEl = document.getElementById('info-modal-desc');
  const listEl = document.getElementById('info-modal-list');

  if (!modal) return;

  imgEl.src = data.imagen;
  imgEl.alt = data.titulo;
  
  badgeEl.textContent = data.badge;
  badgeEl.className = `req-card-badge ${data.badgeClass}`;
  
  titleEl.textContent = data.titulo;
  descEl.textContent = data.descripcion;

  // Limpiar e insertar la lista de requisitos con checks
  listEl.innerHTML = '';
  data.requisitos.forEach(req => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="check-icon">✓</span> <span>${req}</span>`;
    listEl.appendChild(li);
  });

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function cerrarReqModal() {
  const modal = document.getElementById('req-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function initReqModalHandlers() {
  const modal = document.getElementById('req-modal-overlay');
  const btnClose = document.getElementById('btn-close-req-modal');
  const cards = document.querySelectorAll('.req-card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-req');
      abrirReqModal(id);
    });
  });

  btnClose?.addEventListener('click', cerrarReqModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) cerrarReqModal();
  });
}

// ==========================================
// 2. CONTROL DEL MODAL DE AUTENTICACIÓN
// ==========================================
export function abrirAuthModal(modo = 'login') {
  const modal = document.getElementById('auth-modal-overlay');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-modal-login');
  const formRegister = document.getElementById('form-modal-register');

  if (!modal) return;

  if (modo === 'login') {
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    if (formLogin) formLogin.style.display = 'block';
    if (formRegister) formRegister.style.display = 'none';
  } else {
    tabRegister?.classList.add('active');
    tabLogin?.classList.remove('active');
    if (formRegister) formRegister.style.display = 'block';
    if (formLogin) formLogin.style.display = 'none';
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

export function cerrarAuthModal() {
  const modal = document.getElementById('auth-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function initAuthModalHandlers() {
  const modal = document.getElementById('auth-modal-overlay');
  const btnClose = document.getElementById('btn-close-auth-modal');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-modal-login');
  const formRegister = document.getElementById('form-modal-register');

  tabLogin?.addEventListener('click', () => abrirAuthModal('login'));
  tabRegister?.addEventListener('click', () => abrirAuthModal('register'));

  btnClose?.addEventListener('click', cerrarAuthModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) cerrarAuthModal();
  });

  // Delegación de eventos para botones de login/registro
  document.addEventListener('click', (e) => {
    const loginBtn = e.target.closest('#btn-open-login, .btn-nav-login');
    if (loginBtn) {
      e.preventDefault();
      abrirAuthModal('login');
      return;
    }

    const registerBtn = e.target.closest('#btn-open-register, .btn-nav-register');
    if (registerBtn) {
      e.preventDefault();
      abrirAuthModal('register');
      return;
    }
  });

  // Submit Login
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('modal-login-correo')?.value.trim();
    const pass = document.getElementById('modal-login-pass')?.value.trim();

    if (!correo || !pass) return;

    const btnSubmit = formLogin.querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.disabled = true;

    const res = await iniciarSesion(correo, pass);
    if (btnSubmit) btnSubmit.disabled = false;

    if (res.exito) {
      cerrarAuthModal();
      actualizarNavegacion();
      mostrarAlertaModal({
        titulo: '¡Bienvenido!',
        mensaje: `Hola ${res.usuario.nombre}, has ingresado correctamente.`
      });
    } else {
      mostrarAlertaModal({
        titulo: 'Error de Autenticación',
        mensaje: res.mensaje || 'Correo o contraseña incorrectos.'
      });
    }
  });

  // Submit Registro
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('modal-reg-nombre')?.value.trim();
    const correo = document.getElementById('modal-reg-correo')?.value.trim();
    const pass = document.getElementById('modal-reg-pass')?.value.trim();

    if (!nombre || !correo || !pass) return;

    const btnSubmit = formRegister.querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.disabled = true;

    const res = await registrarUsuario(nombre, correo, pass);
    if (btnSubmit) btnSubmit.disabled = false;

    if (res.exito) {
      abrirAuthModal('login');
      mostrarAlertaModal({
        titulo: 'Cuenta Creada',
        mensaje: res.mensaje || 'Cuenta creada con éxito. Ya puedes iniciar sesión.'
      });
    } else {
      mostrarAlertaModal({
        titulo: 'Error de Registro',
        mensaje: res.mensaje || 'No se pudo crear la cuenta.'
      });
    }
  });
}

// Escuchar tecla Escape para cerrar cualquier modal abierto
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarReqModal();
    cerrarAuthModal();
  }
});

// Inicialización de la página
document.addEventListener('DOMContentLoaded', () => {
  actualizarNavegacion();
  initReqModalHandlers();
  initAuthModalHandlers();
});