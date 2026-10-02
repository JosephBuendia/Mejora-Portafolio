// js/actualizar.js
import { exigirSesion, actualizarNavegacion, mostrarAlertaModal } from './auth.js';
import { sql } from './neon-config.js';

let usuarioSesion = null;
let misRegistrosFiltrados = [];

// Exponer la función globalmente en window por si se llama desde Inline HTML
window.abrirEdicion = function(codigo) {
  const registro = misRegistrosFiltrados.find(r => r.codigo === codigo);
  if (!registro) return;

  const estado = (registro.estado || '').toUpperCase().trim();

  if (estado === 'ATENDIDO') {
    mostrarAlertaModal({ 
      titulo: 'Acción No Permitida', 
      mensaje: 'Este reporte ya fue atendido por nuestras unidades y su información no se puede modificar.' 
    });
    return;
  }

  const editCodigo = document.getElementById('editCodigo');
  const editDescripcion = document.getElementById('editDescripcion');
  const modal = document.getElementById('modalEditar');

  if (editCodigo) editCodigo.value = registro.codigo;
  if (editDescripcion) editDescripcion.value = registro.descripcion || '';
  if (modal) modal.classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
  usuarioSesion = exigirSesion();
  if (!usuarioSesion) return;

  actualizarNavegacion();

  const tituloNombre = document.getElementById('nombreUsuarioTitulo');
  if (tituloNombre) tituloNombre.textContent = usuarioSesion.nombre;

  cargarDatosDelUsuario();
  configurarModal();
  configurarDelegacionTabla();
});

function configurarDelegacionTabla() {
  const tbody = document.getElementById('tabla-registros-body');
  if (!tbody) return;

  // Garantiza que los botones dentro de la tabla funcionen sin importar problemas con inline onclick
  tbody.addEventListener('click', (e) => {
    const btnEdit = e.target.closest('.btn-action.edit');
    if (btnEdit) {
      const codigo = btnEdit.getAttribute('data-codigo');
      if (codigo) window.abrirEdicion(codigo);
    }
  });
}

async function cargarDatosDelUsuario() {
  const tbody = document.getElementById('tabla-registros-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: #9ca3af;">Cargando incidencias desde la base de datos...</td></tr>`;

  try {
    const palabras = (usuarioSesion.nombre || '').split(/[\s.]+/).filter(Boolean);
    const p1 = palabras[0] ? `%${palabras[0]}%` : '%';
    const p2 = palabras[1] ? `%${palabras[1]}%` : p1;

    const registros = await sql`
      SELECT 
        codigo, 
        cliente, 
        to_char(fecha_registro, 'DD/MM/YYYY') as fecha, 
        tipo_incidencia as tipo, 
        suministro_zona as ubicacion, 
        sustento as descripcion, 
        respuesta,
        estado 
      FROM incidencias 
      WHERE cliente ILIKE ${p1} AND cliente ILIKE ${p2}
      ORDER BY fecha_registro DESC
    `;

    misRegistrosFiltrados = registros;
    renderizarTabla();
  } catch (error) {
    console.error("Error conectando a Neon:", error);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: #dc2626;">Error al conectar con la base de datos. Verifica la consola.</td></tr>`;
  }
}

function renderizarTabla() {
  const tbody = document.getElementById('tabla-registros-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (misRegistrosFiltrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: #9ca3af;">No tienes incidentes reportados actualmente.</td></tr>`;
    return;
  }

  misRegistrosFiltrados.forEach(registro => {
    const tr = document.createElement('tr');
    const estado = (registro.estado || '').toUpperCase().trim();
    
    let badgeHtml = '';
    let actionButton = '';

    switch (estado) {
      case 'ATENDIDO':
        badgeHtml = `<span class="badge atendido" style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 6px 12px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-check-circle"></i> Atendido</span>`;
        actionButton = `<button class="btn-action locked" disabled title="El caso ya fue atendido y no se puede modificar"><i class="fas fa-lock"></i> Caso Cerrado</button>`;
        break;

      case 'EN PROCESO':
        badgeHtml = `<span class="badge en-proceso" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 6px 12px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-spinner fa-spin"></i> En Proceso</span>`;
        actionButton = `<button class="btn-action edit" data-codigo="${registro.codigo}" onclick="window.abrirEdicion('${registro.codigo}')"><i class="fas fa-pen"></i> Actualizar</button>`;
        break;

      case 'RECHAZADO':
        badgeHtml = `<span class="badge rechazado" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 6px 12px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-times-circle"></i> Rechazado</span>`;
        actionButton = `<button class="btn-action edit" data-codigo="${registro.codigo}" onclick="window.abrirEdicion('${registro.codigo}')"><i class="fas fa-pen"></i> Actualizar</button>`;
        break;

      case 'PENDIENTE':
      default:
        badgeHtml = `<span class="badge pendiente" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 6px 12px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;"><i class="fas fa-clock"></i> Pendiente</span>`;
        actionButton = `<button class="btn-action edit" data-codigo="${registro.codigo}" onclick="window.abrirEdicion('${registro.codigo}')"><i class="fas fa-pen"></i> Actualizar</button>`;
        break;
    }

    const tieneRespuesta = Boolean(registro.respuesta && registro.respuesta.trim() !== '' && registro.respuesta.trim().toLowerCase() !== 'null');
    
    const textoSustento = tieneRespuesta
      ? `<div style="font-weight: 500; color: #f3f4f6;"><i class="fas fa-comment-dots" style="color: #3b82f6; margin-right: 5px;"></i>${registro.respuesta}</div><div style="font-size: 0.75rem; color: #9ca3af; margin-top: 4px;"><strong>Reporte inicial:</strong> ${registro.descripcion || ''}</div>`
      : (registro.descripcion || 'Sin descripción');

    tr.innerHTML = `
      <td class="code-highlight">${registro.codigo}</td>
      <td>${registro.fecha}</td>
      <td>${registro.tipo}</td>
      <td>${registro.ubicacion}</td>
      <td class="desc-text" id="desc-${registro.codigo}">${textoSustento}</td>
      <td>${badgeHtml}</td>
      <td>${actionButton}</td>
    `;

    tbody.appendChild(tr);
  });
}

function configurarModal() {
  const modal = document.getElementById('modalEditar');
  const formEditar = document.getElementById('formEditar');
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
  
  const cerrarModal = () => {
    if (modal) modal.classList.remove('active');
  };
  
  if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
  if (btnCancelarEdicion) btnCancelarEdicion.addEventListener('click', cerrarModal);

  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const codigoElem = document.getElementById('editCodigo');
      const descElem = document.getElementById('editDescripcion');
      if (!codigoElem || !descElem) return;

      const codigo = codigoElem.value;
      const nuevaDescripcion = descElem.value.trim();
      const btnGuardar = formEditar.querySelector('button[type="submit"]');

      let textoOriginal = '';
      if (btnGuardar) {
        textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btnGuardar.disabled = true;
      }

      try {
        await sql`
          UPDATE incidencias 
          SET sustento = ${nuevaDescripcion} 
          WHERE codigo = ${codigo} AND estado != 'ATENDIDO'
        `;
        
        await cargarDatosDelUsuario(); 
        cerrarModal();
        
        mostrarAlertaModal({ 
          titulo: 'Reporte Actualizado', 
          mensaje: `Los detalles de la alerta ${codigo} han sido actualizados exitosamente.` 
        });

      } catch (error) {
        console.error("Error al guardar en Neon:", error);
        mostrarAlertaModal({ 
          titulo: 'Error', 
          mensaje: 'Hubo un problema al guardar los cambios en la base de datos.' 
        });
      } finally {
        if (btnGuardar) {
          btnGuardar.innerHTML = textoOriginal;
          btnGuardar.disabled = false;
        }
      }
    });
  }
}