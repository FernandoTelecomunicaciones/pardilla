// ─────────────────────────────────────────────────────────────────────────────
// Análisis del registro horario (RDL 8/2019).
//
// Los fichajes son INMUTABLES: no se corrigen editando, se corrigen añadiendo un
// apunte nuevo que dice a cuál corrige, quién lo hizo y cuándo. Por eso aquí solo
// se LEE: estas funciones emparejan entradas con salidas y detectan lo que quedó
// sin cerrar. Nada de esto modifica un registro.
// ─────────────────────────────────────────────────────────────────────────────

// "HH:MM" -> minutos desde medianoche. null si no es una hora válida.
export function minutosDeHora(hora) {
  if (typeof hora !== "string" || !/^\d{1,2}:\d{2}$/.test(hora)) return null;
  const [h, m] = hora.split(":").map(Number);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

// Orden cronológico dentro de un día. Se ordena por la hora declarada (`time`),
// no por `timestamp`: una salida regularizada al día siguiente se apuntó después,
// pero ocurrió antes. Para el registro legal manda la hora real.
function ordenCronologico(registros) {
  return [...registros].sort((a, b) => {
    const ma = minutosDeHora(a.time), mb = minutosDeHora(b.time);
    if (ma === null && mb === null) return 0;
    if (ma === null) return 1;
    if (mb === null) return -1;
    return ma - mb;
  });
}

/**
 * Empareja los fichajes de UN día. El horario es partido, así que lo normal son
 * dos pares (mañana y tarde).
 *
 * Devuelve:
 *  - pares:     [{ entrada, salida, minutos }] tramos completos
 *  - abiertas:  entradas que nunca se cerraron  ← el problema del olvido
 *  - huerfanas: salidas sin entrada previa      ← anomalía a revisar
 *  - minutos:   total trabajado en tramos completos
 */
export function analizarJornada(registros) {
  const pares = [];
  const abiertas = [];
  const huerfanas = [];
  let pendiente = null;

  for (const r of ordenCronologico((registros || []).filter(Boolean))) {
    if (r.type === "entrada") {
      // Dos entradas seguidas: la primera se quedó sin cerrar.
      if (pendiente) abiertas.push(pendiente);
      pendiente = r;
    } else if (r.type === "salida") {
      if (pendiente) {
        const ini = minutosDeHora(pendiente.time);
        const fin = minutosDeHora(r.time);
        pares.push({
          entrada: pendiente,
          salida: r,
          // Si la salida es anterior a la entrada la hora está mal puesta:
          // no inventamos una duración negativa.
          minutos: ini !== null && fin !== null && fin >= ini ? fin - ini : null,
        });
        pendiente = null;
      } else {
        huerfanas.push(r);
      }
    }
  }
  if (pendiente) abiertas.push(pendiente);

  const minutos = pares.reduce((s, p) => s + (p.minutos || 0), 0);
  return { pares, abiertas, huerfanas, minutos };
}

/**
 * Días con jornada sin cerrar, para avisar al trabajador y al responsable.
 *
 * El día de HOY se excluye a propósito: una entrada abierta hoy no es un olvido,
 * es alguien que sigue trabajando. Solo es incidencia cuando el día ya pasó.
 *
 * Devuelve [{ fecha, abiertas }] ordenado de más reciente a más antiguo.
 */
export function jornadasSinCerrar(registros, hoy) {
  const porFecha = {};
  for (const r of registros || []) {
    // Un registro corrupto no puede tumbar la detección: si esto fallara, las
    // incidencias dejarían de verse y nadie se enteraría.
    if (!r || !r.date || r.date >= hoy) continue;
    (porFecha[r.date] = porFecha[r.date] || []).push(r);
  }
  return Object.entries(porFecha)
    .map(([fecha, regs]) => ({ fecha, abiertas: analizarJornada(regs).abiertas }))
    .filter(d => d.abiertas.length > 0)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// Un apunte es una corrección posterior, no un fichaje hecho en el momento.
// Se marca aparte porque el registro tiene que dejar ver la diferencia.
export function esRegularizacion(registro) {
  return !!(registro?.regularizacion || registro?.retroactivo);
}

// "8 h 15 min" a partir de minutos. Devuelve "—" si no hay dato.
export function formatearDuracion(minutos) {
  if (!Number.isFinite(minutos) || minutos < 0) return "—";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
