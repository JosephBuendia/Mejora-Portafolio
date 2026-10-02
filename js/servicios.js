// js/servicios.js
import { actualizarNavegacion } from "./auth.js";

// Base de Datos Local de Información de Servicios
const SERVICES_DATA = {
  auxilio: {
    title: "Botón de auxilio en línea",
    meta: "Atención de Emergencia Inmediata",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000&q=80",
    description: "Plataforma digital optimizada para el despacho prioritario de patrullas y serenos en tiempo real. Al presionar el botón de auxilio, se genera un ticket de alerta instantáneo con tu ubicación registrada.",
    features: [
      "Geolocalización referencial directa a la Central de Cómputo",
      "Asignación automática de la unidad móvil o motorizada más cercana",
      "Comunicación directa con el radio operador de turno",
      "Disponible las 24 horas del día, los 365 días del año"
    ],
    actionText: "Reportar Emergencia Ahora",
    actionLink: "formulario.html"
  },
  patrullaje: {
    title: "Patrullaje motorizado y a pie",
    meta: "Prevención y Disuasión en Campo",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3VvmKqZOLNcpbsL5IRANWflcq3WR57iGuGjvEu342kQ&s=10",
    description: "Unidades móviles (camionetas), motocicletas y serenos caminantes patrullan estratégicamente todos los sectores de Huancayo para prevenir ilícitos, ordenar el espacio público y brindar seguridad a los vecinos.",
    features: [
      "Rutas de supervisión continua e intinerante en los 5 sectores",
      "Refuerzo preventivo en horarios nocturnos de mayor concurrencia",
      "Patrullaje integrado coordinado con la Policía Nacional del Perú (PNP)",
      "Intervención inmediata en alteración del orden público y ruidos molestos"
    ],
    actionText: "Ver Cobertura por Zonas",
    actionLink: null
  },
  accidentes: {
    title: "Apoyo en accidentes de tránsito",
    meta: "Primera Respuesta y Traslado Médico",
    image: "https://static.vecteezy.com/system/resources/thumbnails/056/711/038/small/ambulance-on-duty-on-the-expressway-photo.jpg",
    description: "Ante emergencias viales o choques de gravedad, las unidades de Serenazgo actúan como primeros respondedores asegurando el perímetro, desviando el tráfico y coordinando auxilio médico especializado.",
    features: [
      "Aislamiento y cercado de la escena del accidente para seguridad vial",
      "Primeros auxilios básicos brindados por personal capacitado",
      "Traslado de emergencia de heridos a hospitales y clínicas cercanas",
      "Coordinación y traspaso directo a la Comisaría del sector y PNP Tránsito"
    ],
    actionText: "Contactar a la Central",
    actionLink: "contacto.html"
  }
};

const ZONES_DATA = {
  "zona-1": {
    title: "Zona 1 — Huancayo Centro",
    meta: "Nivel de Incidencia: Alta",
    sectors: "Parque Constitución, Calle Real, Av. Giráldez, Paseo de la Breña y Damero Central.",
    schedule: "Horario reforzado nocturno: 19:00 – 02:00 hrs",
    details: [
      "3 Camionetas móviles permanentes y 6 motocicletas de respuesta rápida.",
      "Patrullaje a pie en zonas comerciales, agencias bancarias y plazas públicas.",
      "Punto focal de videovigilancia monitoreado desde la Central Central de Monitoreo."
    ]
  },
  "zona-2": {
    title: "Zona 2 — El Tambo",
    meta: "Nivel de Incidencia: Alta",
    sectors: "Av. Real, Mercado Mayorista, Mercado Malecón, San Carlos y alrededores.",
    schedule: "Horario reforzado nocturno: 18:00 – 01:00 hrs",
    details: [
      "Enfoque especial en control de comercio informal y prevención de hurtos.",
      "Coordinación directa con la Comisaría de El Tambo.",
      "4 Unidades patrulleras asignadas al sector."
    ]
  },
  "zona-3": {
    title: "Zona 3 — Chilca",
    meta: "Nivel de Incidencia: Media",
    sectors: "Chilca Centro, Av. Jacinto Ibarra, Auquimarca y Av. Arterial.",
    schedule: "Horario reforzado nocturno: 19:00 – 00:00 hrs",
    details: [
      "Operativos de fiscalización en locales nocturnos y canchitas deportivas.",
      "Presencia disuasiva constante en accesos y avenidas principales.",
      "2 Unidades camionetas y cuadrilla de serenos a pie."
    ]
  },
  "zona-4": {
    title: "Zona 4 — Pilcomayo",
    meta: "Nivel de Incidencia: Baja",
    sectors: "Pilcomayo Centro, Umuto, Av. Las Rosas y accesos al puente.",
    schedule: "Horario reforzado nocturno: 20:00 – 23:00 hrs",
    details: [
      "Rondas periódicas de vigilancia en zonas residenciales y agrícolas.",
      "Atención prioritaria a emergencias por llamadas telefónicas.",
      "Patrullaje perimetral de enlace con distritos vecinos."
    ]
  },
  "zona-5": {
    title: "Zona 5 — San Agustín de Cajas",
    meta: "Nivel de Incidencia: Baja",
    sectors: "San Agustín, Cajas Chico, Prolongación Huancavelica.",
    schedule: "Horario reforzado nocturno: 20:00 – 23:00 hrs",
    details: [
      "Patrullaje disuasivo preventivo en avenidas conectoras.",
      "Apoyo a Juntas Vecinales de Seguridad Ciudadana.",
      "Supervisión nocturna de la vía pública y parque de la zona."
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  actualizarNavegacion();

  const modalOverlay = document.getElementById("info-modal-overlay");
  const modalContent = document.getElementById("info-modal-content");
  const btnCloseModal = document.getElementById("btn-close-info-modal");

  document.querySelectorAll(".service-card").forEach(card => {
    card.addEventListener("click", () => {
      const serviceId = card.getAttribute("data-service-id");
      const data = SERVICES_DATA[serviceId];
      if (!data) return;

      const featuresHtml = data.features.map(f => `<li>${f}</li>`).join("");

      modalContent.innerHTML = `
        <img class="modal-header-img" src="${data.image}" alt="${data.title}">
        <div class="modal-body-padding">
          <span class="modal-meta-tag">${data.meta}</span>
          <h2>${data.title}</h2>
          <p class="modal-description">${data.description}</p>
          
          <h3 style="font-size:1rem; margin-bottom:0.6rem; color:var(--paper-100);">Características clave del servicio:</h3>
          <ul class="modal-feature-list">
            ${featuresHtml}
          </ul>

          <div class="modal-actions-bar">
            ${data.actionLink ? 
              `<a href="${data.actionLink}" class="btn btn-alert">${data.actionText}</a>` : 
              `<button type="button" class="btn btn-alert" id="btn-scroll-zones">${data.actionText}</button>`
            }
          </div>
        </div>
      `;

      openModal();

      const btnScroll = document.getElementById("btn-scroll-zones");
      if (btnScroll) {
        btnScroll.addEventListener("click", () => {
          closeModal();
          document.querySelector(".zones-section").scrollIntoView({ behavior: "smooth" });
        });
      }
    });
  });

  document.querySelectorAll(".zone-card").forEach(card => {
    card.addEventListener("click", () => {
      const zoneId = card.getAttribute("data-zone-id");
      const data = ZONES_DATA[zoneId];
      if (!data) return;

      const detailsHtml = data.details.map(d => `<li>${d}</li>`).join("");

      modalContent.innerHTML = `
        <div class="modal-body-padding">
          <span class="modal-meta-tag">${data.meta}</span>
          <h2>${data.title}</h2>
          <p class="modal-description"><strong>Sectores cubiertos:</strong> ${data.sectors}</p>
          <p class="modal-description" style="color:var(--signal-400); font-weight:600;">${data.schedule}</p>
          
          <h3 style="font-size:1rem; margin-bottom:0.6rem; color:var(--paper-100);">Detalles de despliegue operacional:</h3>
          <ul class="modal-feature-list">
            ${detailsHtml}
          </ul>

          <div class="modal-actions-bar">
            <button type="button" class="btn btn-outline" id="btn-modal-close-inner">Entendido</button>
          </div>
        </div>
      `;

      openModal();

      document.getElementById("btn-modal-close-inner")?.addEventListener("click", closeModal);
    });
  });

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add("active");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", closeModal);
  }

  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay?.classList.contains("active")) {
      closeModal();
    }
  });
});