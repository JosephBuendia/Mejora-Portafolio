// =======================================================
// JS UBICACIÓN Y CONTACTO INTEGRADO CON NEON POSTGRESQL Y AUTH.JS
// =======================================================

import { sql } from "./neon-config.js";
import { 
  obtenerUsuarioActual,
  iniciarSesion, 
  registrarUsuario, 
  actualizarNavegacion,
  cerrarSesion,
  mostrarAlertaModal 
} from "./auth.js";

// 1. RESTRICCIONES EN LOS INPUTS DEL FORMULARIO
function aplicarRestriccionesInputs() {
  const dniInput = document.getElementById("contact-dni");
  const phoneInput = document.getElementById("contact-telefono");
  const nombresInput = document.getElementById("contact-nombres");
  const apellidosInput = document.getElementById("contact-apellidos");

  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  };
  if (nombresInput) nombresInput.addEventListener("input", soloLetras);
  if (apellidosInput) apellidosInput.addEventListener("input", soloLetras);

  if (dniInput) {
    dniInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "");
      if (val.length > 0 && val.charAt(0) !== "9") {
        val = "9" + val.slice(0, 8);
      }
      e.target.value = val.slice(0, 9);
    });
  }
}

// 2. ENFOQUE Y SCROLL EN ERRORES DE FORMULARIO
function enfocarCampoConError(inputElement) {
  if (!inputElement) return;

  inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
  inputElement.classList.add("input-error");

  setTimeout(() => inputElement.focus(), 300);

  const limpiarError = () => {
    inputElement.classList.remove("input-error");
    inputElement.removeEventListener("input", limpiarError);
    inputElement.removeEventListener("change", limpiarError);
  };
  inputElement.addEventListener("input", limpiarError);
  inputElement.addEventListener("change", limpiarError);
}

// 3. ENVIAR FORMULARIO DE CONTACTO Y GUARDAR EN NEON POSTGRESQL
function inicializarFormularioContacto() {
  const form = document.getElementById("contact-message-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = obtenerUsuarioActual();
    if (!usuario) {
      abrirAuthModal("login");
      return;
    }

    const nombresInput = document.getElementById("contact-nombres");
    const apellidosInput = document.getElementById("contact-apellidos");
    const dniInput = document.getElementById("contact-dni");
    const telefonoInput = document.getElementById("contact-telefono");
    const correoInput = document.getElementById("contact-correo");
    const asuntoSelect = document.getElementById("contact-asunto");
    const mensajeInput = document.getElementById("contact-mensaje");

    if (!nombresInput.value.trim() || nombresInput.value.trim().length < 2) {
      mostrarAlertaModal({ titulo: "Nombres Inválidos", mensaje: "Por favor ingresa un nombre válido de al menos 2 letras." });
      enfocarCampoConError(nombresInput);
      return;
    }

    if (!apellidosInput.value.trim() || apellidosInput.value.trim().length < 2) {
      mostrarAlertaModal({ titulo: "Apellidos Inválidos", mensaje: "Por favor ingresa tus apellidos completos." });
      enfocarCampoConError(apellidosInput);
      return;
    }

    const dniVal = dniInput.value.trim();
    if (dniVal.length > 0 && dniVal.length !== 8) {
      mostrarAlertaModal({ titulo: "DNI Incorrecto", mensaje: "El número de DNI debe contener exactamente 8 dígitos." });
      enfocarCampoConError(dniInput);
      return;
    }

    const telVal = telefonoInput.value.trim();
    if (!telVal || telVal.length !== 9 || !telVal.startsWith("9")) {
      mostrarAlertaModal({ titulo: "Teléfono Inválido", mensaje: "El teléfono debe empezar obligatoriamente con 9 y tener 9 dígitos." });
      enfocarCampoConError(telefonoInput);
      return;
    }

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correoInput.value.trim())) {
      mostrarAlertaModal({ titulo: "Correo Electrónico Inválido", mensaje: "Ingresa un formato de correo válido (ejemplo@dominio.com)." });
      enfocarCampoConError(correoInput);
      return;
    }

    if (!asuntoSelect.value) {
      mostrarAlertaModal({ titulo: "Asunto Requerido", mensaje: "Por favor selecciona el motivo de tu contacto." });
      enfocarCampoConError(asuntoSelect);
      return;
    }

    if (!mensajeInput.value.trim() || mensajeInput.value.trim().length < 10) {
      mostrarAlertaModal({ titulo: "Mensaje Muy Corto", mensaje: "El mensaje debe tener al menos 10 caracteres explicativos." });
      enfocarCampoConError(mensajeInput);
      return;
    }

    const btnSubmit = document.getElementById("btn-submit-contact");
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Guardando en Central...";

    try {
      await sql`
        INSERT INTO mensajes_contacto (usuario_id, nombres, apellidos, dni, telefono, correo, asunto, mensaje)
        VALUES (
          ${usuario.id || null},
          ${nombresInput.value.trim()},
          ${apellidosInput.value.trim()},
          ${dniVal || null},
          ${"+51 " + telVal},
          ${correoInput.value.trim()},
          ${asuntoSelect.value},
          ${mensajeInput.value.trim()}
        );
      `;

      mostrarAlertaModal({
        titulo: "¡Mensaje Enviado!",
        mensaje: "Tu consulta ha sido registrada exitosamente en la base de datos de Serenazgo. Nos comunicaremos contigo en breve."
      });

      form.reset();
      prellenarCamposUsuario();

    } catch (error) {
      console.error("Error al guardar mensaje en Neon:", error);
      mostrarAlertaModal({
        titulo: "Error de Conexión",
        mensaje: "No se pudo registrar el mensaje en la base de datos. Verifica tu conexión a internet e inténtalo nuevamente."
      });
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Enviar mensaje";
    }
  });
}

// 4. MODALES EMERGENTES Y EVENTOS
function abrirAuthModal(tab = "login") {
  const modal = document.getElementById("auth-modal-overlay");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-modal-login");
  const formRegister = document.getElementById("form-modal-register");

  if (!modal) return;

  if (tab === "login") {
    tabLogin?.classList.add("active");
    tabRegister?.classList.remove("active");
    if (formLogin) formLogin.style.display = "block";
    if (formRegister) formRegister.style.display = "none";
  } else {
    tabRegister?.classList.add("active");
    tabLogin?.classList.remove("active");
    if (formRegister) formRegister.style.display = "block";
    if (formLogin) formLogin.style.display = "none";
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function cerrarAuthModal() {
  const modal = document.getElementById("auth-modal-overlay");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function inicializarEventosAuth() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("#btn-open-login")) abrirAuthModal("login");
    if (e.target.closest("#btn-open-register")) abrirAuthModal("register");
  });

  document.getElementById("btn-close-auth-modal")?.addEventListener("click", cerrarAuthModal);
  document.getElementById("auth-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("auth-modal-overlay")) cerrarAuthModal();
  });

  document.getElementById("tab-login")?.addEventListener("click", () => abrirAuthModal("login"));
  document.getElementById("tab-register")?.addEventListener("click", () => abrirAuthModal("register"));

  // Iniciar Sesión desde el Modal
  document.getElementById("form-modal-login")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("modal-login-correo").value.trim();
    const pass = document.getElementById("modal-login-pass").value.trim();

    const res = await iniciarSesion(correo, pass);
    if (res.exito) {
      cerrarAuthModal();
      actualizarNavegacion();
      prellenarCamposUsuario();
      mostrarAlertaModal({
        titulo: "Bienvenido",
        mensaje: `Has iniciado sesión correctamente como ${res.usuario.nombre}.`
      });
    } else {
      mostrarAlertaModal({
        titulo: "Error de Ingreso",
        mensaje: res.mensaje
      });
    }
  });

  // Registrar Usuario desde el Modal
  document.getElementById("form-modal-register")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("modal-reg-nombre").value.trim();
    const correo = document.getElementById("modal-reg-correo").value.trim();
    const pass = document.getElementById("modal-reg-pass").value.trim();

    if (pass.length < 4) {
      mostrarAlertaModal({
        titulo: "Contraseña Corta",
        mensaje: "La contraseña debe tener mínimo 4 caracteres."
      });
      return;
    }

    const res = await registrarUsuario(nombre, correo, pass);
    if (res.exito) {
      mostrarAlertaModal({
        titulo: "Cuenta Registrada",
        mensaje: res.mensaje
      });
      abrirAuthModal("login");
    } else {
      mostrarAlertaModal({
        titulo: "Error de Registro",
        mensaje: res.mensaje
      });
    }
  });
}

function prellenarCamposUsuario() {
  const usuario = obtenerUsuarioActual();
  if (usuario) {
    const nombresInput = document.getElementById("contact-nombres");
    const correoInput = document.getElementById("contact-correo");

    if (nombresInput && !nombresInput.value) nombresInput.value = usuario.nombre || "";
    if (correoInput && !correoInput.value) correoInput.value = usuario.correo || "";
  }
}

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  actualizarNavegacion();
  aplicarRestriccionesInputs();
  inicializarFormularioContacto();
  inicializarEventosAuth();
  prellenarCamposUsuario();
});