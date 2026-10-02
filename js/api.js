// js/api.js
import { sql } from "./neon-config.js";

const MOCK_INCIDENCIAS = [
  { id: 1,  codigo: 'INC-2026-001', fecha_registro: '01/10/2026 18:00', cliente: 'Juan Carlos Quispe',     dni: '45892103', suministro_zona: 'Av. Real / Jr. Ayacucho - Huancayo Centro', tipo_incidencia: 'Robo / Asalto',          unidad: 'Móvil-01', estado: 'PENDIENTE',  sustento: 'Sujeto en actitud sospechosa intentó sustraer pertenencias a transeúnte.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 2,  codigo: 'INC-2026-002', fecha_registro: '01/10/2026 17:15', cliente: 'María Elena Flores',     dni: '71234982', suministro_zona: 'Jr. Huancavelica - El Tambo',               tipo_incidencia: 'Alteración del Orden',  unidad: 'Móvil-03', estado: 'EN PROCESO', sustento: 'Grupo de jóvenes consumiendo bebidas alcohólicas en la vía pública.', respuesta: 'Unidad Móvil-03 en desplazamiento a la zona.' },
  { id: 3,  codigo: 'INC-2026-003', fecha_registro: '01/10/2026 16:30', cliente: 'Carlos Eduardo Mendoza', dni: '10482930', suministro_zona: 'Av. 9 de Diciembre - Chilca',               tipo_incidencia: 'Violencia Familiar',    unidad: 'Móvil-02', estado: 'ATENDIDO',   sustento: 'Discusión fuerte y agresión verbal reportada por vecinos.', respuesta: 'Personal intervino y derivó caso a la comisaría de Chilca.' },
  { id: 4,  codigo: 'INC-2026-004', fecha_registro: '01/10/2026 15:45', cliente: 'Rosa Luz Gómez',         dni: '42918234', suministro_zona: 'Jr. Puno - San Carlos',                     tipo_incidencia: 'Accidente de Tránsito', unidad: 'Móvil-05', estado: 'ATENDIDO',   sustento: 'Choque leve entre auto particular y mototaxi sin heridos de gravedad.', respuesta: 'Se prestó auxilio y se despejó la vía.' },
  { id: 5,  codigo: 'INC-2026-005', fecha_registro: '01/10/2026 15:00', cliente: 'Jorge Luis Rojas',       dni: '73849102', suministro_zona: 'Av. Ferrocarril / Jr. Cajamarca',           tipo_incidencia: 'Sospechosos / Pandillaje', unidad: 'Móvil-01', estado: 'RECHAZADO',  sustento: 'Llamada de alerta sobre posible robo. Se constató persona esperando transporte.', respuesta: 'Falsa alarma verificada en cámaras.' },
  { id: 6,  codigo: 'INC-2026-006', fecha_registro: '01/10/2026 14:20', cliente: 'Ana Karina Torres',      dni: '48291039', suministro_zona: 'Pio Pato - El Tambo',                       tipo_incidencia: 'Ruidos Molestos',       unidad: 'Móvil-04', estado: 'PENDIENTE',  sustento: 'Fiesta clandestina con alto volumen pasadas las 11:00 PM.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 7,  codigo: 'INC-2026-007', fecha_registro: '01/10/2026 13:50', cliente: 'Pedro Pablo Huamán',     dni: '09382104', suministro_zona: 'Jr. Ancash - Huancayo Centro',              tipo_incidencia: 'Comercio Ambulatorio',  unidad: 'Móvil-06', estado: 'EN PROCESO', sustento: 'Bloqueo de veredas por comerciantes no autorizados.', respuesta: 'Inspectores y Serenazgo realizando despeje.' },
  { id: 8,  codigo: 'INC-2026-008', fecha_registro: '01/10/2026 13:10', cliente: 'Lucía Fernanda Ramos',   dni: '72910482', suministro_zona: 'Av. Girbal - San Carlos',                   tipo_incidencia: 'Robo / Asalto',          unidad: 'Móvil-02', estado: 'ATENDIDO',   sustento: 'Arrebato de celular a estudiante universitaria.', respuesta: 'Se interceptó al sujeto a dos cuadras y se recuperó el bien.' },
  { id: 9,  codigo: 'INC-2026-009', fecha_registro: '01/10/2026 12:40', cliente: 'Luz Marina Aliaga',      dni: '41029384', suministro_zona: 'Jr. Moquegua - Chilca',                     tipo_incidencia: 'Persona Extraviada',    unidad: 'Móvil-03', estado: 'ATENDIDO',   sustento: 'Menor de edad desorientado encontrado en la plaza principal de Chilca.', respuesta: 'Menor reunido exitosamente con sus padres.' },
  { id: 10, codigo: 'INC-2026-010', fecha_registro: '01/10/2026 12:00', cliente: 'Víctor Manuel Soto',     dni: '10928374', suministro_zona: 'Parra del Riego - El Tambo',               tipo_incidencia: 'Sospechosos / Pandillaje', unidad: 'Móvil-04', estado: 'PENDIENTE',  sustento: 'Vehículo sospechoso estacionado por más de 3 horas con vidrios polarizados.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 11, codigo: 'INC-2026-011', fecha_registro: '01/10/2026 11:15', cliente: 'Juan Carlos Quispe',     dni: '45892103', suministro_zona: 'Jr. Libertad - Ocopilla',                   tipo_incidencia: 'Violencia Familiar',    unidad: 'Móvil-01', estado: 'EN PROCESO', sustento: 'Llamada de auxilio por conflicto doméstico.', respuesta: 'Unidad acudiendo al predio.' },
  { id: 12, codigo: 'INC-2026-012', fecha_registro: '01/10/2026 10:30', cliente: 'María Elena Flores',     dni: '71234982', suministro_zona: 'Av. Coronel Parra - Pilcomayo',             tipo_incidencia: 'Accidente de Tránsito', unidad: 'Móvil-05', estado: 'ATENDIDO',   sustento: 'Despiste de motocicleta por calzada mojada.', respuesta: 'Paramédicos atendieron lesiones leves en el lugar.' },
  { id: 13, codigo: 'INC-2026-013', fecha_registro: '01/10/2026 09:50', cliente: 'Carlos Eduardo Mendoza', dni: '10482930', suministro_zona: 'Jr. Arequipa - Huancayo Centro',            tipo_incidencia: 'Ruidos Molestos',       unidad: 'Móvil-06', estado: 'RECHAZADO',  sustento: 'Reclamo por música alta en local comercial.', respuesta: 'Local cuenta con autorización y horario vigente.' },
  { id: 14, codigo: 'INC-2026-014', fecha_registro: '01/10/2026 09:10', cliente: 'Rosa Luz Gómez',         dni: '42918234', suministro_zona: 'Av. Huancavelica / Jr. Tarapacá',           tipo_incidencia: 'Robo / Asalto',          unidad: 'Móvil-02', estado: 'PENDIENTE',  sustento: 'Sujeto forzando la chapa de un vehículo estacionado.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 15, codigo: 'INC-2026-015', fecha_registro: '01/10/2026 08:30', cliente: 'Jorge Luis Rojas',       dni: '73849102', suministro_zona: 'Jr. Cusco - Huancayo Centro',               tipo_incidencia: 'Alteración del Orden',  unidad: 'Móvil-03', estado: 'ATENDIDO',   sustento: 'Gresca entre parroquianos a la salida de discoteca.', respuesta: 'Sujetos disuadidos y retirados del lugar.' },
  { id: 16, codigo: 'INC-2026-016', fecha_registro: '01/10/2026 08:00', cliente: 'Ana Karina Torres',      dni: '48291039', suministro_zona: 'Urbanización La Merced',                    tipo_incidencia: 'Sospechosos / Pandillaje', unidad: 'Móvil-01', estado: 'PENDIENTE',  sustento: 'Presencia de motorizados merodeando viviendas.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 17, codigo: 'INC-2026-017', fecha_registro: '01/10/2026 07:20', cliente: 'Pedro Pablo Huamán',     dni: '09382104', suministro_zona: 'Jr. Huancas - San Carlos',                  tipo_incidencia: 'Comercio Ambulatorio',  unidad: 'Móvil-06', estado: 'EN PROCESO', sustento: 'Venta informal de pirotécnicos sin medidas de seguridad.', respuesta: 'Fiscalización en camino.' },
  { id: 18, codigo: 'INC-2026-018', fecha_registro: '01/10/2026 06:40', cliente: 'Lucía Fernanda Ramos',   dni: '72910482', suministro_zona: 'Av. San Carlos / Jr. Junín',                tipo_incidencia: 'Accidente de Tránsito', unidad: 'Móvil-05', estado: 'ATENDIDO',   sustento: 'Colisión frontal leve entre dos autos de transporte público.', respuesta: 'Transacciones privadas entre partes, vía liberada.' },
  { id: 19, codigo: 'INC-2026-019', fecha_registro: '01/10/2026 06:00', cliente: 'Luz Marina Aliaga',      dni: '41029384', suministro_zona: 'Jr. Tarapacá - Chilca',                     tipo_incidencia: 'Ruidos Molestos',       unidad: 'Móvil-04', estado: 'RECHAZADO',  sustento: 'Reporte de trabajo de construcción fuera de horario.', respuesta: 'Construcción contaba con permiso especial de la municipalidad.' },
  { id: 20, codigo: 'INC-2026-020', fecha_registro: '01/10/2026 05:15', cliente: 'Víctor Manuel Soto',     dni: '10928374', suministro_zona: 'Jr. Lima - Huancayo Centro',                tipo_incidencia: 'Robo / Asalto',          unidad: 'Móvil-02', estado: 'ATENDIDO',   sustento: 'Hurto de cartera dentro de establecimiento comercial.', respuesta: 'Imágenes de cámaras entregadas a la Policía Nacional.' },
  { id: 21, codigo: 'INC-2026-021', fecha_registro: '01/10/2026 04:30', cliente: 'Juan Carlos Quispe',     dni: '45892103', suministro_zona: 'Av. Mariscal Castilla - El Tambo',           tipo_incidencia: 'Alteración del Orden',  unidad: 'Móvil-03', estado: 'PENDIENTE',  sustento: 'Personas libando en parque infantil.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 22, codigo: 'INC-2026-022', fecha_registro: '01/10/2026 03:50', cliente: 'María Elena Flores',     dni: '71234982', suministro_zona: 'Jr. Breña - Huancayo Centro',               tipo_incidencia: 'Violencia Familiar',    unidad: 'Móvil-01', estado: 'ATENDIDO',   sustento: 'Agresión física denunciada por la víctima.', respuesta: 'Acompañamiento a la víctima hacia la Comisaría de la Mujer.' },
  { id: 23, codigo: 'INC-2026-023', fecha_registro: '01/10/2026 03:10', cliente: 'Carlos Eduardo Mendoza', dni: '10482930', suministro_zona: 'Jr. Real - Chilca',                         tipo_incidencia: 'Sospechosos / Pandillaje', unidad: 'Móvil-02', estado: 'EN PROCESO', sustento: 'Reunión de barristas lanzando arengas en vía pública.', respuesta: 'Unidades de patrullaje preventivo desplegadas.' },
  { id: 24, codigo: 'INC-2026-024', fecha_registro: '01/10/2026 02:30', cliente: 'Rosa Luz Gómez',         dni: '42918234', suministro_zona: 'Jr. Calixto - Huancayo Centro',             tipo_incidencia: 'Comercio Ambulatorio',  unidad: 'Móvil-06', estado: 'ATENDIDO',   sustento: 'Ocupación de vía peatonal con mercadería.', respuesta: 'Mercadería retirada pacíficamente tras exhortación.' },
  { id: 25, codigo: 'INC-2026-025', fecha_registro: '01/10/2026 01:45', cliente: 'Jorge Luis Rojas',       dni: '73849102', suministro_zona: 'Av. Evitamiento - El Tambo',                tipo_incidencia: 'Accidente de Tránsito', unidad: 'Móvil-05', estado: 'PENDIENTE',  sustento: 'Atropello de canino en la vía rápida.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 26, codigo: 'INC-2026-026', fecha_registro: '01/10/2026 01:10', cliente: 'Ana Karina Torres',      dni: '48291039', suministro_zona: 'Jr. Ica - Huancayo Centro',                 tipo_incidencia: 'Robo / Asalto',          unidad: 'Móvil-02', estado: 'EN PROCESO', sustento: 'Intento de asalto con arma blanca.', respuesta: 'Patrullaje intensivo en los alrededores.' },
  { id: 27, codigo: 'INC-2026-027', fecha_registro: '01/10/2026 00:30', cliente: 'Pedro Pablo Huamán',     dni: '09382104', suministro_zona: 'Jr. Nemesio Raez - El Tambo',               tipo_incidencia: 'Ruidos Molestos',       unidad: 'Móvil-04', estado: 'ATENDIDO',   sustento: 'Alarma de inmueble activada por fallo mecánico.', respuesta: 'Propietarios contactados para apagar la alarma.' },
  { id: 28, codigo: 'INC-2026-028', fecha_registro: '30/09/2026 23:50', cliente: 'Lucía Fernanda Ramos',   dni: '72910482', suministro_zona: 'Jr. Arterial - Chilca',                     tipo_incidencia: 'Alteración del Orden',  unidad: 'Móvil-03', estado: 'RECHAZADO',  sustento: 'Reporte de invasión de predio.', respuesta: 'Se constató que era un trabajo de delimitación con propiedad legal.' },
  { id: 29, codigo: 'INC-2026-029', fecha_registro: '30/09/2026 23:10', cliente: 'Luz Marina Aliaga',      dni: '41029384', suministro_zona: 'Av. Cantuta - San Carlos',                  tipo_incidencia: 'Sospechosos / Pandillaje', unidad: 'Móvil-01', estado: 'PENDIENTE',  sustento: 'Jóvenes realizando maniobras peligrosas en motocicleta.', respuesta: 'Alerta recepcionada por la central.' },
  { id: 30, codigo: 'INC-2026-030', fecha_registro: '30/09/2026 22:30', cliente: 'Víctor Manuel Soto',     dni: '10928374', suministro_zona: 'Jr. Pachitea - Huancayo Centro',            tipo_incidencia: 'Robo / Asalto',          unidad: 'Móvil-02', estado: 'ATENDIDO',   sustento: 'Robo de autopartes a vehículo estacionado.', respuesta: 'Diligencias iniciadas junto con la PNP.' }
];

export const API = {
  // Obtener todas las 30 incidencias
  async obtenerIncidencias() {
    try {
      const filas = await sql`
        SELECT 
          i.id,
          i.codigo,
          to_char(i.fecha_registro, 'DD/MM/YYYY HH24:MI') AS fecha_registro,
          COALESCE(u.nombre, i.cliente) AS cliente,
          COALESCE(u.dni, i.dni) AS dni,
          i.suministro_zona,
          i.tipo_incidencia,
          i.unidad,
          UPPER(i.estado) AS estado,
          i.sustento,
          i.respuesta
        FROM incidencias i
        LEFT JOIN usuarios u ON i.usuario_id = u.id
        ORDER BY i.id DESC;
      `;
      return filas.length > 0 ? filas : MOCK_INCIDENCIAS;
    } catch (error) {
      console.warn("Neon DB no disponible o sin tabla, mostrando respaldo con las 30 incidencias:", error);
      return MOCK_INCIDENCIAS;
    }
  },

  // Registrar una nueva incidencia
  async crearIncidencia(nuevaAlerta) {
    try {
      await sql`
        INSERT INTO incidencias (
          codigo, cliente, dni, suministro_zona, tipo_incidencia, unidad, estado, sustento, respuesta, fecha_registro
        ) VALUES (
          ${nuevaAlerta.codigo},
          ${nuevaAlerta.cliente},
          ${nuevaAlerta.dni},
          ${nuevaAlerta.suministro_zona},
          ${nuevaAlerta.tipo_incidencia},
          'Móvil-01',
          'PENDIENTE',
          ${nuevaAlerta.sustento},
          'Alerta recepcionada por la central.',
          NOW()
        );
      `;
      return { exito: true };
    } catch (error) {
      console.warn("No se pudo insertar en Neon DB, registrando localmente:", error);
      MOCK_INCIDENCIAS.unshift({
        id: Date.now(),
        codigo: nuevaAlerta.codigo,
        fecha_registro: new Date().toLocaleString('es-PE'),
        cliente: nuevaAlerta.cliente,
        dni: nuevaAlerta.dni,
        suministro_zona: nuevaAlerta.suministro_zona,
        tipo_incidencia: nuevaAlerta.tipo_incidencia,
        unidad: 'Móvil-01',
        estado: 'PENDIENTE',
        sustento: nuevaAlerta.sustento,
        respuesta: 'Alerta recepcionada por la central.'
      });
      return { exito: true };
    }
  },

  // Actualizar el estado y dictamen de una incidencia
  async actualizarEstadoIncidencia(codigo, nuevoEstado, respuesta) {
    try {
      await sql`
        UPDATE incidencias
        SET estado = ${nuevoEstado.toUpperCase()}, respuesta = ${respuesta}
        WHERE codigo = ${codigo};
      `;
      return { exito: true };
    } catch (error) {
      console.warn("Error actualizando en Neon DB, modificando localmente:", error);
      const item = MOCK_INCIDENCIAS.find(i => i.codigo === codigo);
      if (item) {
        item.estado = nuevoEstado.toUpperCase();
        item.respuesta = respuesta;
      }
      return { exito: true };
    }
  },

  // Eliminar una incidencia
  async eliminarIncidencia(codigo) {
    try {
      await sql`DELETE FROM incidencias WHERE codigo = ${codigo};`;
      return { exito: true };
    } catch (error) {
      const idx = MOCK_INCIDENCIAS.findIndex(i => i.codigo === codigo);
      if (idx !== -1) MOCK_INCIDENCIAS.splice(idx, 1);
      return { exito: true };
    }
  }
};