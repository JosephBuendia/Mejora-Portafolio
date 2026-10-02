// js/formulario.js
import { 
  obtenerUsuarioActual,
  mostrarAlertaModal, 
  actualizarNavegacion,
  abrirModalAuth
} from "./auth.js";

const STORAGE_KEY_REPORTS = "serenazgo_reportes_guardados";

// 1. RESTRICCIONES DE ENTRADA EN TIEMPO REAL
function aplicarRestriccionesInputs() {
  const dniInput = document.getElementById("dni-num");
  const phoneInput = document.getElementById("telefono-num");

  if (dniInput) {
    const filtrarDNI = (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
    };
    dniInput.addEventListener("input", filtrarDNI);
    dniInput.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      dniInput.value = text.replace(/\D/g, "").slice(0, 8);
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

    phoneInput.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      let digits = text.replace(/\D/g, "");
      if (digits.length > 0 && digits.charAt(0) !== "9") {
        digits = "9" + digits;
      }
      phoneInput.value = digits.slice(0, 9);
    });
  }
}

// 2. ENFOQUE AUTOMÁTICO Y DESPLAZAMIENTO AL CAMPO ERANEO
function enfocarCampoConError(inputElement) {
  if (!inputElement) return;

  inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
  inputElement.classList.add("input-error");

  setTimeout(() => {
    inputElement.focus();
  }, 300);

  const limpiarError = () => {
    inputElement.classList.remove("input-error");
    inputElement.removeEventListener("input", limpiarError);
    inputElement.removeEventListener("change", limpiarError);
  };
  inputElement.addEventListener("input", limpiarError);
  inputElement.addEventListener("change", limpiarError);
}

// 3. CONTROL DEL FORMULARIO Y VALIDACIONES
function inicializarFormulario() {
  const form = document.getElementById("incident-report-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = obtenerUsuarioActual();
    if (!usuario) {
      abrirModalAuth("login");
      return;
    }

    const nombreInput = document.getElementById("nombre-completo");
    const dniInput = document.getElementById("dni-num");
    const telefonoInput = document.getElementById("telefono-num");
    const tipoSelect = document.getElementById("tipo-incidente");
    const direccionInput = document.getElementById("direccion-exacta");
    const descripcionInput = document.getElementById("descripcion-incidente");

    if (!nombreInput.value.trim()) {
      mostrarAlertaModal({
        titulo: "Campo Obligatorio",
        mensaje: "Por favor ingresa tu nombre completo para procesar el reporte."
      });
      enfocarCampoConError(nombreInput);
      return;
    }

    const dniVal = dniInput.value.trim();
    if (dniVal.length > 0 && dniVal.length !== 8) {
      mostrarAlertaModal({
        titulo: "DNI Inválido",
        mensaje: "El número de DNI debe contener exactamente 8 dígitos numéricos."
      });
      enfocarCampoConError(dniInput);
      return;
    }

    const telVal = telefonoInput.value.trim();
    if (!telVal || telVal.length !== 9 || !telVal.startsWith("9")) {
      mostrarAlertaModal({
        titulo: "Teléfono Inválido",
        mensaje: "El teléfono es obligatorio, debe iniciar obligatoriamente con el número 9 y contener 9 dígitos."
      });
      enfocarCampoConError(telefonoInput);
      return;
    }

    if (!tipoSelect.value) {
      mostrarAlertaModal({
        titulo: "Selección Requerida",
        mensaje: "Por favor selecciona el tipo de incidente que deseas reportar."
      });
      enfocarCampoConError(tipoSelect);
      return;
    }

    if (!direccionInput.value.trim()) {
      mostrarAlertaModal({
        titulo: "Ubicación Requerida",
        mensaje: "Ingresa la dirección o una referencia exacta del suceso."
      });
      enfocarCampoConError(direccionInput);
      return;
    }

    if (!descripcionInput.value.trim()) {
      mostrarAlertaModal({
        titulo: "Descripción Requerida",
        mensaje: "Por favor describe brevemente lo ocurrido para orientar al personal de Serenazgo."
      });
      enfocarCampoConError(descripcionInput);
      return;
    }

    const nuevoReporte = {
      id: "REP-" + Math.floor(100000 + Math.random() * 900000),
      usuarioCorreo: usuario.correo,
      nombreContacto: nombreInput.value.trim(),
      dniContacto: dniVal || "No especificado",
      telefonoContacto: "+51 " + telVal,
      tipoIncidente: tipoSelect.value,
      direccion: direccionInput.value.trim(),
      zona: document.getElementById("zona-patrullaje").value,
      urgencia: form.querySelector('input[name="urgencia"]:checked')?.value || "Alta",
      descripcion: descripcionInput.value.trim(),
      fecha: new Date().toLocaleString("es-PE")
    };

    const reportesPrevios = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || "[]");
    reportesPrevios.unshift(nuevoReporte);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reportesPrevios));

    mostrarAlertaModal({
      titulo: "¡Reporte Registrado!",
      mensaje: `El reporte ${nuevoReporte.id} ha sido enviado con éxito a la Central de Serenazgo.`
    });

    form.reset();
    document.getElementById("autorizo-datos").checked = true;
    if (usuario.nombre) nombreInput.value = usuario.nombre;
  });
}

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  actualizarNavegacion();
  aplicarRestriccionesInputs();
  inicializarFormulario();

  const usuarioActivo = obtenerUsuarioActual();
  if (usuarioActivo && usuarioActivo.nombre) {
    const nombreInput = document.getElementById("nombre-completo");
    if (nombreInput) nombreInput.value = usuarioActivo.nombre;
  }
});