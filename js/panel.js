// js/panel.js
import { API } from './api.js';
import { exigirSesion, actualizarNavegacion, mostrarAlertaModal, evaluarTurnoEmpleado } from './auth.js';

let todasLasIncidencias = [];
let incidenciaSeleccionada = null;
let usuarioSesion = null;
let puedeEditar = true;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Exigir inicio de sesión obligatorio (si no hay sesión, redirige a login.html)
  usuarioSesion = exigirSesion();
  if (!usuarioSesion) return;

  actualizarNavegacion();

  // 2. Evaluar turno operativo si es un empleado
  const statusBanner = document.getElementById('statusBanner');
  if (usuarioSesion.rol === 'empleado') {
    const evaluacion = evaluarTurnoEmpleado(usuarioSesion.turno);
    puedeEditar = evaluacion.enTurno;

    if (statusBanner) {
      if (evaluacion.enTurno) {
        statusBanner.className = 'status-banner success';
        statusBanner.innerHTML = `<i class="fas fa-check-circle"></i> <span><strong>En Turno Activo (${evaluacion.nombreTurno}):</strong> Tienes permisos para registrar, modificar y atender incidencias.</span>`;
      } else {
        statusBanner.className = 'status-banner warning';
        statusBanner.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span><strong>Fuera de Turno (${evaluacion.nombreTurno}):</strong> Tu acceso es únicamente de LECTURA. No puedes registrar ni modificar datos.</span>`;
      }
    }
  } else if (statusBanner) {
    statusBanner.className = 'status-banner success';
    statusBanner.innerHTML = `<i class="fas fa-user-shield"></i> <span><strong>Acceso Administrador (24/7):</strong> Control total sobre el sistema operativo.</span>`;
  }

  // 3. Cargar las 30 incidencias iniciales
  await cargarTablaIncidencias();

  // 4. Búsqueda instantánea mientras se digita
  const inputBuscar = document.getElementById('inputBuscar');
  const selectEstado = document.getElementById('selectEstado');

  if (inputBuscar) {
    inputBuscar.addEventListener('input', aplicarFiltros);
  }

  if (selectEstado) {
    selectEstado.addEventListener('change', aplicarFiltros);
  }

  // 5. Botón Actualizar (Recarga los datos de la BD o Mock)
  const btnActualizar = document.getElementById('btnActualizar');
  if (btnActualizar) {
    btnActualizar.addEventListener('click', async () => {
      btnActualizar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Cargando...`;
      await cargarTablaIncidencias();
      btnActualizar.innerHTML = `<i class="fas fa-sync-alt"></i> Actualizar`;
    });
  }

  // 6. Botón Limpiar Filtros
  const btnLimpiar = document.getElementById('btnLimpiarFiltros');
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      inputBuscar.value = '';
      selectEstado.value = 'TODOS';
      aplicarFiltros();
    });
  }

  // 7. Modal Registrar Nueva Alerta
  const btnNuevaAlerta = document.getElementById('btnNuevaAlerta');
  const modalNuevaAlerta = document.getElementById('modalNuevaAlerta');
  const btnCerrarModalNueva = document.getElementById('btnCerrarModalNueva');
  const btnCancelarNueva = document.getElementById('btnCancelarNueva');
  const formNuevaAlerta = document.getElementById('formNuevaAlerta');

  if (btnNuevaAlerta) {
    btnNuevaAlerta.addEventListener('click', () => {
      if (!puedeEditar) {
        mostrarAlertaModal({ titulo: 'Acceso Restringido', mensaje: 'No estás en tu turno asignado para registrar nuevas alertas.' });
        return;
      }
      formNuevaAlerta.reset();
      modalNuevaAlerta.classList.add('active');
    });
  }

  const cerrarModalNueva = () => modalNuevaAlerta.classList.remove('active');
  if (btnCerrarModalNueva) btnCerrarModalNueva.addEventListener('click', cerrarModalNueva);
  if (btnCancelarNueva) btnCancelarNueva.addEventListener('click', cerrarModalNueva);

  if (formNuevaAlerta) {
    formNuevaAlerta.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!puedeEditar) {
        mostrarAlertaModal({ titulo: 'Acceso Restringido', mensaje: 'Operación no permitida fuera de tu turno.' });
        return;
      }
      
      const dni = document.getElementById('nuevoDni').value.trim();
      const nombre = document.getElementById('nuevoNombre').value.trim();
      const ubicacion = document.getElementById('nuevaUbicacion').value.trim();
      const tipo = document.getElementById('nuevoTipo').value;
      const sustento = document.getElementById('nuevoSustento').value.trim();

      if (dni.length !== 8 || isNaN(dni)) {
        mostrarAlertaModal({ titulo: 'Validación', mensaje: 'El DNI debe contener exactamente 8 dígitos numéricos.' });
        return;
      }

      const nuevoCodigo = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
      
      const payload = {
        codigo: nuevoCodigo,
        cliente: nombre,
        dni: dni,
        suministro_zona: ubicacion,
        tipo_incidencia: tipo,
        sustento: sustento
      };

      const res = await API.crearIncidencia(payload);
      if (res.exito) {
        cerrarModalNueva();
        mostrarAlertaModal({ titulo: 'Registro Exitoso', mensaje: `Se registró correctamente la alerta ${nuevoCodigo}.` });
        await cargarTablaIncidencias();
      } else {
        mostrarAlertaModal({ titulo: 'Error', mensaje: 'No se pudo registrar la alerta en el sistema.' });
      }
    });
  }

  // 8. Modal Dictamen / Atender Incidencia
  const modalDictamen = document.getElementById('modalDictamen');
  const btnCerrarModalDictamen = document.getElementById('btnCerrarModalDictamen');
  if (btnCerrarModalDictamen) {
    btnCerrarModalDictamen.addEventListener('click', () => modalDictamen.classList.remove('active'));
  }

  document.getElementById('btnDictamenProceso')?.addEventListener('click', () => procesarDictamen('EN PROCESO'));
  document.getElementById('btnDictamenRechazar')?.addEventListener('click', () => procesarDictamen('RECHAZADO'));
  document.getElementById('btnDictamenAtender')?.addEventListener('click', () => procesarDictamen('ATENDIDO'));
});

// Cargar y pintar tabla
async function cargarTablaIncidencias() {
  todasLasIncidencias = await API.obtenerIncidencias();
  aplicarFiltros();
}

// Búsqueda en tiempo real
function aplicarFiltros() {
  const texto = document.getElementById('inputBuscar').value.toLowerCase().trim();
  const estado = document.getElementById('selectEstado').value;

  const filtradas = todasLasIncidencias.filter(item => {
    const cumpleTexto = (
      (item.codigo && item.codigo.toLowerCase().includes(texto)) ||
      (item.cliente && item.cliente.toLowerCase().includes(texto)) ||
      (item.dni && item.dni.includes(texto)) ||
      (item.suministro_zona && item.suministro_zona.toLowerCase().includes(texto)) ||
      (item.tipo_incidencia && item.tipo_incidencia.toLowerCase().includes(texto))
    );

    const cumpleEstado = (estado === 'TODOS' || item.estado.toUpperCase() === estado.toUpperCase());

    return cumpleTexto && cumpleEstado;
  });

  renderizarTabla(filtradas);
  actualizarMetricas(todasLasIncidencias);
  document.getElementById('contadorRegistros').textContent = `${filtradas.length} Registros`;
}

function renderizarTabla(lista) {
  const tbody = document.getElementById('tablaIncidenciasBody');
  tbody.innerHTML = '';

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px; color: #94a3b8;">No se encontraron registros de incidencias.</td></tr>`;
    return;
  }

  lista.forEach(item => {
    const tr = document.createElement('tr');
    
    let badgeClass = 'pendiente';
    const est = item.estado ? item.estado.toUpperCase() : 'PENDIENTE';
    if (est === 'EN PROCESO') badgeClass = 'en-proceso';
    if (est === 'ATENDIDO') badgeClass = 'atendido';
    if (est === 'RECHAZADO') badgeClass = 'rechazado';

    const deshabilitadoAttr = !puedeEditar ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : '';

    tr.innerHTML = `
      <td class="highlight-code">${item.codigo}</td>
      <td>${item.fecha_registro || '---'}</td>
      <td><strong>${item.cliente || 'Anónimo'}</strong></td>
      <td>${item.dni || '---'}</td>
      <td>${item.suministro_zona || '---'}</td>
      <td>${item.tipo_incidencia || 'Gobernanza'}</td>
      <td><span style="color:#38bdf8;">${item.unidad || 'Móvil-01'}</span></td>
      <td><span class="badge-estado ${badgeClass}">${est}</span></td>
      <td>
        <button class="action-btn btn-atender-row" ${deshabilitadoAttr} title="Gestionar / Atender"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete-btn btn-eliminar-row" ${deshabilitadoAttr} title="Eliminar"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;

    // Eventos
    const btnAtender = tr.querySelector('.btn-atender-row');
    const btnEliminar = tr.querySelector('.btn-eliminar-row');

    if (btnAtender) {
      btnAtender.addEventListener('click', () => {
        if (!puedeEditar) {
          mostrarAlertaModal({ titulo: 'Acceso Restringido', mensaje: 'No estás en tu turno asignado para modificar registros.' });
          return;
        }
        abrirModalDictamen(item);
      });
    }

    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => {
        if (!puedeEditar) {
          mostrarAlertaModal({ titulo: 'Acceso Restringido', mensaje: 'No estás en tu turno asignado para eliminar registros.' });
          return;
        }

        mostrarAlertaModal({
          titulo: 'Confirmar Eliminación',
          mensaje: `¿Estás seguro de eliminar permanentemente la incidencia ${item.codigo}?`,
          textoBoton: 'Sí, Eliminar',
          esConfirmacion: true,
          onConfirm: async () => {
            await API.eliminarIncidencia(item.codigo);
            await cargarTablaIncidencias();
          }
        });
      });
    }

    tbody.appendChild(tr);
  });
}

function actualizarMetricas(lista) {
  document.getElementById('cntTotal').textContent = lista.length;
  document.getElementById('cntPendientes').textContent = lista.filter(i => i.estado === 'PENDIENTE').length;
  document.getElementById('cntEnProceso').textContent = lista.filter(i => i.estado === 'EN PROCESO').length;
  document.getElementById('cntAtendidos').textContent = lista.filter(i => i.estado === 'ATENDIDO').length;
  document.getElementById('cntRechazados').textContent = lista.filter(i => i.estado === 'RECHAZADO').length;
}

function abrirModalDictamen(item) {
  incidenciaSeleccionada = item;
  document.getElementById('mCodigo').textContent = item.codigo;
  document.getElementById('mFecha').textContent = item.fecha_registro || '---';
  document.getElementById('mCliente').textContent = item.cliente || 'Anónimo';
  document.getElementById('mDni').textContent = item.dni || '---';
  document.getElementById('mSuministro').textContent = item.suministro_zona || '---';
  document.getElementById('mSustento').value = item.sustento || '';
  document.getElementById('mRespuesta').value = item.respuesta || '';

  const badge = document.getElementById('mEstadoBadge');
  badge.textContent = item.estado;
  badge.className = `badge-estado ${item.estado.toLowerCase().replace(/\s+/g, '-')}`;

  document.getElementById('modalDictamen').classList.add('active');
}

async function procesarDictamen(nuevoEstado) {
  if (!incidenciaSeleccionada || !puedeEditar) return;

  const respuesta = document.getElementById('mRespuesta').value.trim();
  if (!respuesta) {
    mostrarAlertaModal({ titulo: 'Campo Requerido', mensaje: 'Por favor, ingrese una respuesta u observación de la central.' });
    return;
  }

  const res = await API.actualizarEstadoIncidencia(incidenciaSeleccionada.codigo, nuevoEstado, respuesta);
  if (res.exito) {
    document.getElementById('modalDictamen').classList.remove('active');
    mostrarAlertaModal({ titulo: 'Actualización Exitosa', mensaje: `El estado de ${incidenciaSeleccionada.codigo} cambió a ${nuevoEstado}.` });
    await cargarTablaIncidencias();
  } else {
    mostrarAlertaModal({ titulo: 'Error', mensaje: 'No se pudo actualizar el estado de la incidencia.' });
  }
}