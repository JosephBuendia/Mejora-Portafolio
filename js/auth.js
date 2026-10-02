// js/auth.js
import { sql } from "./neon-config.js";

// 1. MODAL DE ALERTAS DINÁMICAS
export function mostrarAlertaModal({ titulo = 'Atención', mensaje, textoBoton = 'Aceptar', redirigirA = null, esConfirmacion = false, onConfirm = null }) {
  let overlay = document.getElementById('custom-modal-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'custom-modal-overlay';
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
      <div class="custom-modal-card">
        <h3 id="custom-modal-title" class="custom-modal-title"></h3>
        <p id="custom-modal-body" class="custom-modal-body"></p>
        <div id="custom-modal-actions" class="custom-modal-actions"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const titleElem = document.getElementById('custom-modal-title');
  const bodyElem = document.getElementById('custom-modal-body');
  const actionsElem = document.getElementById('custom-modal-actions');

  titleElem.textContent = titulo;
  bodyElem.textContent = mensaje;
  actionsElem.innerHTML = '';

  if (esConfirmacion) {
    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'btn btn-outline';
    btnCancelar.type = 'button';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.onclick = () => overlay.classList.remove('active');
    actionsElem.appendChild(btnCancelar);

    const btnAceptar = document.createElement('button');
    btnAceptar.className = 'btn btn-alert';
    btnAceptar.type = 'button';
    btnAceptar.textContent = textoBoton;
    btnAceptar.onclick = () => {
      overlay.classList.remove('active');
      if (typeof onConfirm === 'function') onConfirm();
    };
    actionsElem.appendChild(btnAceptar);
  } else {
    const btnAceptar = document.createElement('button');
    btnAceptar.className = 'btn btn-alert';
    btnAceptar.type = 'button';
    btnAceptar.textContent = textoBoton;
    btnAceptar.onclick = () => {
      overlay.classList.remove('active');
      if (redirigirA) window.location.href = redirigirA;
    };
    actionsElem.appendChild(btnAceptar);
  }

  setTimeout(() => overlay.classList.add('active'), 10);
}

// 2. AUTENTICACIÓN Y REGISTRO
export async function registrarUsuario(nombre, correo, contrasena) {
  try {
    const existe = await sql`SELECT id FROM usuarios WHERE correo = ${correo};`;
    if (existe.length > 0) {
      return { exito: false, mensaje: "El correo ya se encuentra registrado." };
    }

    await sql`
      INSERT INTO usuarios (nombre, correo, contrasena, rol, turno)
      VALUES (${nombre}, ${correo}, ${contrasena}, 'cliente', '24/7');
    `;
    return { exito: true, mensaje: "Cuenta creada exitosamente. Ahora puedes iniciar sesión." };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { exito: false, mensaje: "Error de conexión con la base de datos." };
  }
}

export async function iniciarSesion(correo, contrasena) {
  try {
    const filas = await sql`
      SELECT id, nombre, correo, rol, turno 
      FROM usuarios
      WHERE correo = ${correo} AND contrasena = ${contrasena};
    `;

    if (filas.length === 0) {
      return { exito: false, mensaje: "Correo o contraseña incorrectos." };
    }

    const usuario = filas[0];
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.removeItem('usuario');
    actualizarNavegacion();
    return { exito: true, usuario };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { exito: false, mensaje: "Error de conexión con el servidor." };
  }
}

// 3. OBTENCIÓN DE SESIÓN
export function obtenerUsuarioActual() {
  const usuarioGuardado = sessionStorage.getItem('usuario');
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

export function exigirSesion() {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'index.html';
    return null;
  }
  return usuario;
}

export function cerrarSesion() {
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('usuario');
  actualizarNavegacion();
  window.location.reload();
}

// 4. EVALUACIÓN DE TURNOS OPERATIVOS PARA EMPLEADOS
export function evaluarTurnoEmpleado(turno) {
  if (!turno || turno === '24/7') return { enTurno: true, nombreTurno: 'Acceso Total (24/7)' };

  const horaActual = new Date().getHours();

  if (turno === 'manana' && horaActual >= 7 && horaActual < 15) {
    return { enTurno: true, nombreTurno: 'Mañana (07:00 - 15:00)' };
  }
  if (turno === 'tarde' && horaActual >= 15 && horaActual < 23) {
    return { enTurno: true, nombreTurno: 'Tarde (15:00 - 23:00)' };
  }
  if (turno === 'noche' && (horaActual >= 23 || horaActual < 7)) {
    return { enTurno: true, nombreTurno: 'Noche (23:00 - 07:00)' };
  }

  let rangoTexto = 'Asignado';
  if (turno === 'manana') rangoTexto = 'Mañana (07:00 - 15:00)';
  if (turno === 'tarde') rangoTexto = 'Tarde (15:00 - 23:00)';
  if (turno === 'noche') rangoTexto = 'Noche (23:00 - 07:00)';

  return { enTurno: false, nombreTurno: rangoTexto };
}

// 5. FUNCIÓN AUXILIAR PARA ABRIR EL MODAL DE AUTENTICACIÓN
export function abrirModalAuth(modo = 'login') {
  const modal = document.getElementById('auth-modal-overlay');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-modal-login');
  const formRegister = document.getElementById('form-modal-register');

  if (modal) {
    if (modo === 'register') {
      tabLogin?.classList.remove('active');
      tabRegister?.classList.add('active');
      if (formLogin) formLogin.style.display = 'none';
      if (formRegister) formRegister.style.display = 'block';
    } else {
      tabLogin?.classList.add('active');
      tabRegister?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
    }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  } else {
    window.location.href = 'index.html';
  }
}

export function abrirModalLoginDirecto() {
  abrirModalAuth('login');
}

// 6. ACTUALIZACIÓN DE INTERFAZ DE NAVEGACIÓN
export function actualizarNavegacion() {
  const navAuthContainer = document.getElementById('nav-auth-container');
  const userDisplay = document.getElementById('userNameDisplay');
  const usuario = obtenerUsuarioActual();

  if (navAuthContainer) {
    if (usuario) {
      const linkAcceso = usuario.rol === 'cliente'
        ? `<a href="actualizar.html" class="btn-outline-yellow">Mis Registros / Actualizar</a>`
        : `<a href="panel.html" class="btn-outline-yellow">Panel CRUD Global</a>`;

      const rolTag = usuario.rol && usuario.rol !== 'cliente' ? ` (${usuario.rol.toUpperCase()})` : '';

      navAuthContainer.innerHTML = `
        ${linkAcceso}
        <div class="user-badge-dark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#a78bfa">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>${usuario.nombre}${rolTag}</span>
        </div>
        <button type="button" id="btnLogout" class="btn-outline-orange">Cerrar sesión</button>
      `;
    } else {
      navAuthContainer.innerHTML = `
        <button type="button" id="btn-open-login" class="btn-dark-outline">Iniciar sesión</button>
        <button type="button" id="btn-open-register" class="btn-solid-orange">Crear cuenta</button>
      `;
    }
  }

  if (usuario && userDisplay) {
    const rolTexto = usuario.rol ? usuario.rol.toUpperCase() : 'OPERADOR';
    userDisplay.textContent = `${usuario.nombre} (${rolTexto})`;
  }
}

export function verificarSesionActivaSinRedireccion() {
  return obtenerUsuarioActual() !== null;
}

export function formatearRolUsuario(rol) {
  if (!rol) return 'Invitado';
  switch (rol.toLowerCase()) {
    case 'admin':
    case 'administrador':
      return 'Administrador General';
    case 'empleado':
    case 'sereno':
      return 'Personal Operativo';
    case 'cliente':
    case 'vecino':
      return 'Ciudadano / Vecino';
    default:
      return rol;
  }
}

// 7. LISTENERS GLOBALES
document.addEventListener('DOMContentLoaded', () => {
  actualizarNavegacion();
});

document.addEventListener('click', (e) => {
  const btnLogout = e.target.closest('#btnLogout, #btn-cerrar-sesion, .btn-logout');
  if (btnLogout) {
    e.preventDefault();
    cerrarSesion();
    return;
  }

  const btnLoginModal = e.target.closest('#btn-open-login');
  if (btnLoginModal) {
    e.preventDefault();
    abrirModalAuth('login');
    return;
  }

  const btnRegisterModal = e.target.closest('#btn-open-register');
  if (btnRegisterModal) {
    e.preventDefault();
    abrirModalAuth('register');
    return;
  }

  const tabClick = e.target.closest('.auth-tab, .tab-btn');
  if (tabClick) {
    if (tabClick.id === 'tab-login') {
      abrirModalAuth('login');
    } else if (tabClick.id === 'tab-register') {
      abrirModalAuth('register');
    }
    return;
  }

  const modal = document.getElementById('auth-modal-overlay');
  if (modal) {
    const btnCerrar = e.target.closest('#btn-close-auth-modal, .btn-close-modal, .auth-modal-close');
    if (btnCerrar || e.target === modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      return;
    }
  }
});