// =======================================================
// JS ACCESO AL SISTEMA (LOGIN / REGISTRO)
// INTEGRADO CON AUTH.JS Y NEON POSTGRESQL
// =======================================================

import { 
  iniciarSesion, 
  registrarUsuario, 
  obtenerUsuarioActual, 
  mostrarAlertaModal 
} from "./auth.js";

// Función auxiliar para garantizar que las alertas mantengan siempre el diseño corporativo y se cierren al hacer clic
function mostrarAlertaConEstilo(opciones) {
  // Limpiar cualquier modal previo que haya quedado activo
  const modalesPrevios = document.querySelectorAll('.custom-modal-overlay, .modal-overlay');
  modalesPrevios.forEach(m => m.remove());

  if (typeof mostrarAlertaModal === 'function') {
    mostrarAlertaModal(opciones);
    
    // Garantizar que el botón Aceptar cierre la ventana modal
    setTimeout(() => {
      const modalActual = document.querySelector('.custom-modal-overlay, .modal-overlay, div[class*="modal"]');
      if (modalActual) {
        const botones = modalActual.querySelectorAll('button');
        botones.forEach(btn => {
          btn.onclick = () => {
            modalActual.remove();
            if (opciones.redirigirA) {
              window.location.href = opciones.redirigirA;
            }
          };
        });
      }
    }, 50);
    return;
  }

  // Fallback de alerta estilizada en caso de independencia
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';
  
  overlay.innerHTML = `
    <div class="custom-modal-card">
      <h3>${opciones.titulo || 'Atención'}</h3>
      <p>${opciones.mensaje || ''}</p>
      <button type="button" id="btn-cerrar-alerta-custom">${opciones.textoBoton || 'Aceptar'}</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnCerrar = overlay.querySelector('#btn-cerrar-alerta-custom');
  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => {
      overlay.remove();
      if (opciones.redirigirA) {
        window.location.href = opciones.redirigirA;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  
  // Si ya existe una sesión iniciada, redirigir automáticamente
  const usuarioSesion = obtenerUsuarioActual();
  if (usuarioSesion) {
    if (usuarioSesion.rol === 'cliente') {
      window.location.href = 'index.html';
    } else {
      window.location.href = 'panel.html';
    }
    return;
  }

  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");

  // Conmutación entre Pestañas Login / Registro
  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    formLogin.classList.add("active");
    formRegister.classList.remove("active");
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    formRegister.classList.add("active");
    formLogin.classList.remove("active");
  });

  // SUBMIT: INICIAR SESIÓN
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const btnSubmit = document.getElementById("btn-submit-login");

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "<span>Verificando...</span>";

    const resultado = await iniciarSesion(email, password);

    if (resultado.exito) {
      const usuario = resultado.usuario;
      const destino = (usuario.rol === 'cliente') ? 'index.html' : 'panel.html';

      mostrarAlertaConEstilo({
        titulo: '¡Bienvenido(a)!',
        mensaje: `Hola ${usuario.nombre}, has iniciado sesión correctamente.`,
        redirigirA: destino
      });
    } else {
      mostrarAlertaConEstilo({
        titulo: 'Error de Autenticación',
        mensaje: resultado.mensaje || 'Credenciales incorrectas. Verifica tu correo y contraseña.'
      });
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = "<span>Ingresar al Sistema</span>";
    }
  });

  // SUBMIT: CREAR CUENTA
  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("reg-nombre").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const btnSubmit = document.getElementById("btn-submit-register");

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "<span>Registrando...</span>";

    const resultado = await registrarUsuario(nombre, email, password);

    if (resultado.exito) {
      mostrarAlertaConEstilo({
        titulo: 'Registro Exitoso',
        mensaje: resultado.mensaje
      });

      // Limpiar formulario y cambiar a pestaña de login
      formRegister.reset();
      tabLogin.click();
      document.getElementById("login-email").value = email;
    } else {
      mostrarAlertaConEstilo({
        titulo: 'Atención',
        mensaje: resultado.mensaje || 'No se pudo crear la cuenta. Inténtalo de nuevo.'
      });
    }

    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "<span>Registrar Cuenta</span>";
  });

});