// js/nav-auth.js

// 1. Alerta Modal Dinámica General
export function mostrarAlertaModal({ titulo = 'Atención', mensaje, textoBoton = 'Aceptar', redirigirA = null, esConfirmacion = false, onConfirm = null }) {
  const overlay = document.getElementById('custom-modal-overlay');
  const titleElem = document.getElementById('custom-modal-title');
  const bodyElem = document.getElementById('custom-modal-body');
  const actionsElem = document.getElementById('custom-modal-actions');

  if (!overlay || !titleElem || !bodyElem || !actionsElem) return;

  titleElem.textContent = titulo;
  bodyElem.textContent = mensaje;
  actionsElem.innerHTML = '';

  if (esConfirmacion) {
    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'btn btn-outline';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.onclick = () => overlay.classList.remove('active');
    actionsElem.appendChild(btnCancelar);

    const btnAceptar = document.createElement('button');
    btnAceptar.className = 'btn btn-alert';
    btnAceptar.textContent = textoBoton;
    btnAceptar.onclick = () => {
      overlay.classList.remove('active');
      if (typeof onConfirm === 'function') onConfirm();
    };
    actionsElem.appendChild(btnAceptar);
  } else {
    const btnAceptar = document.createElement('button');
    btnAceptar.className = 'btn btn-alert';
    btnAceptar.textContent = textoBoton;
    btnAceptar.onclick = () => {
      overlay.classList.remove('active');
      if (redirigirA) window.location.href = redirigirA;
    };
    actionsElem.appendChild(btnAceptar);
  }

  overlay.classList.add('active');
}

// 2. Renderizado de Barra de Navegación según Sesión (EXPORTADO)
export function renderizarNavbar() {
  const container = document.getElementById('nav-auth-container');
  // CAMBIO: Se lee exclusivamente de sessionStorage para mantener sesiones independientes por pestaña
  const usuarioGuardado = sessionStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  if (!container) return;

  if (usuario) {
    let linkAccesoDirecto = usuario.rol === 'cliente'
      ? `<a href="actualizar.html" class="btn-nav-login btn-registros" style="color: #ffc107; border-color: #ffc107; margin-right: 10px;">Mis Registros / Actualizar</a>`
      : `<a href="panel.html" class="btn-nav-login btn-registros">Panel CRUD Global</a>`;

    const rolTag = usuario.rol !== 'cliente' ? `<span class="user-role">${usuario.rol}</span>` : '';

    container.innerHTML = `
      ${linkAccesoDirecto}
      <div class="user-badge">
        <span class="user-icon">👤</span>
        <span style="font-weight:600;">${usuario.nombre}</span>
        ${rolTag}
      </div>
      <button type="button" id="btn-cerrar-sesion" class="btn-logout">Cerrar sesión</button>
    `;

    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => {
      sessionStorage.removeItem('usuario');
      localStorage.removeItem('usuario');
      mostrarAlertaModal({
        titulo: 'Sesión Finalizada',
        mensaje: 'Has cerrado sesión correctamente.',
        redirigirA: 'index.html'
      });
    });
  } else {
    container.innerHTML = `
      <button type="button" id="btn-open-login" class="btn-nav-login">Iniciar sesión</button>
      <button type="button" id="btn-open-register" class="btn-nav-register">Crear cuenta</button>
    `;
    vincularEventosModal();
  }
}

// 3. Control de Ventana Emergente Modal (EXPORTADO Y DELEGADO)
export function abrirModalAuth(tab = 'login') {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-modal-login');
  const formRegister = document.getElementById('form-modal-register');

  if (!modalOverlay) return;

  modalOverlay.classList.add('active');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (tab === 'login') {
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
}

export function cerrarModalAuth() {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

export function vincularEventosModal() {
  const btnClose = document.getElementById('btn-close-auth-modal');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  btnClose?.removeEventListener('click', cerrarModalAuth);
  btnClose?.addEventListener('click', cerrarModalAuth);

  if (tabLogin) tabLogin.onclick = () => abrirModalAuth('login');
  if (tabRegister) tabRegister.onclick = () => abrirModalAuth('register');
}

// Manejador Global para el inicio de sesión y registro (Cubre envíos por botón submit o teclado)
document.addEventListener('submit', (e) => {
  if (e.target && e.target.id === 'form-modal-login') {
    e.preventDefault();
    const elemCorreo = document.getElementById('modal-login-correo');
    const elemPass = document.getElementById('modal-login-pass');

    const correo = elemCorreo ? elemCorreo.value.trim() : '';
    const pass = elemPass ? elemPass.value.trim() : '';

    if (correo && pass) {
      const nombreUsuario = correo.split('@')[0];
      const usuarioDummy = {
        id: Date.now(),
        nombre: nombreUsuario.charAt(0).toUpperCase() + nombreUsuario.slice(1),
        correo: correo,
        rol: correo.includes('admin') ? 'administrador' : 'cliente'
      };

      // CAMBIO: Se usa unicamente sessionStorage
      sessionStorage.setItem('usuario', JSON.stringify(usuarioDummy));
      localStorage.removeItem('usuario');

      cerrarModalAuth();
      renderizarNavbar();

      mostrarAlertaModal({
        titulo: '¡Bienvenido!',
        mensaje: `Sesión iniciada correctamente como ${usuarioDummy.nombre}.`
      });
    }
  }

  if (e.target && e.target.id === 'form-modal-register') {
    e.preventDefault();
    const elemNombre = document.getElementById('modal-reg-nombre');
    const elemCorreo = document.getElementById('modal-reg-correo');

    const nombre = elemNombre ? elemNombre.value.trim() : '';
    const correo = elemCorreo ? elemCorreo.value.trim() : '';

    if (nombre && correo) {
      const nuevoUsuario = { id: Date.now(), nombre, correo, rol: 'cliente' };
      // CAMBIO: Se usa unicamente sessionStorage
      sessionStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
      localStorage.removeItem('usuario');

      cerrarModalAuth();
      renderizarNavbar();

      mostrarAlertaModal({
        titulo: 'Cuenta Creada',
        mensaje: `Tu cuenta ha sido registrada con éxito. ¡Bienvenido, ${nombre}!`
      });
    }
  }
});

// Delegación global de eventos Clic para apertura y cierre de Modales
document.addEventListener('click', (e) => {
  const btnLogin = e.target.closest('#btn-open-login');
  if (btnLogin) {
    e.preventDefault();
    abrirModalAuth('login');
    return;
  }

  const btnRegister = e.target.closest('#btn-open-register');
  if (btnRegister) {
    e.preventDefault();
    abrirModalAuth('register');
    return;
  }

  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (modalOverlay && e.target === modalOverlay) {
    cerrarModalAuth();
  }
});

// 4. Carrusel de Imágenes Suave
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

// 5. Conteo Animado de Números Más Lento y Fluido (2.5 segundos)
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
        const duracionTotalMs = 2500;
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

  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * contadores.length);
    const item = contadores[randomIndex];
    if (item) {
      item.classList.add('pulse');
      setTimeout(() => item.classList.remove('pulse'), 700);
    }
  }, 4000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  renderizarNavbar();
  iniciarCarrusel();
  animarContadores();

  // Bloqueo de acciones protegidas
  document.querySelectorAll('.auth-protected-link, .btn-auxilio').forEach(link => {
    link.addEventListener('click', (e) => {
      // CAMBIO: Se consulta sessionStorage
      const estaAutenticado = sessionStorage.getItem('usuario');
      if (!estaAutenticado) {
        e.preventDefault();
        abrirModalAuth('login');
      }
    });
  });
});