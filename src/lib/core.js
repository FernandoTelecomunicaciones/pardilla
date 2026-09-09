// ─────────────────────────────────────────────────────────────────────────────
// Lógica pura de Pastelería Pardilla: fechas, rotación de turnos y versiones.
//
// Se extrajo de src/App.jsx en la v6.1 para poder cubrirla con tests. Aquí solo
// deben vivir funciones SIN efectos secundarios y sin dependencias de React,
// Firebase, localStorage ni del DOM.
// ─────────────────────────────────────────────────────────────────────────────

// FIX #8: parseo de fechas YYYY-MM-DD a fecha LOCAL (evita bug UTC)
export function parseLocalDate(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const result = new Date(y, m - 1, d, 12, 0, 0);
  return result.getFullYear() === y && result.getMonth() === m - 1 && result.getDate() === d ? result : null;
}

export function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// FIX #9: lunes de la semana correcto (también en domingo)
export function getMondayOfWeek(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay(); // 0=dom..6=sab
  const diff = (day + 6) % 7; // distancia al lunes anterior
  d.setDate(d.getDate() - diff);
  return d;
}

// Temporada de verano: 1 de junio – 31 de agosto
export function isSummerPeriod(date) {
  const d = date instanceof Date ? date : parseLocalDate(date);
  if (!d) return false;
  const m = d.getMonth() + 1; // 1-12
  return m >= 6 && m <= 8;
}

// Rotación semanal genérica: cuántas semanas han pasado desde la referencia.
function semanasDesde(referenceDate, d) {
  const refMonday = getMondayOfWeek(parseLocalDate(referenceDate));
  const currMonday = getMondayOfWeek(d);
  return Math.round((currMonday - refMonday) / (7 * 24 * 60 * 60 * 1000));
}

export function getCurrentShift(employeeId, date, rotationConfig) {
  const d = date instanceof Date ? date : parseLocalDate(date);
  if (!d || !rotationConfig) return null;

  // Modo 2 dependientes (baja, vacante...): rotación semanal Especial A / B.
  // Manda sobre todo lo demás, incluido el verano, porque lo activa el dueño a
  // propósito cuando falta gente. Quien no esté asignado no tiene turno de
  // tienda: es justo el hueco que hay que cubrir.
  if (rotationConfig.specialMode) {
    const ea = rotationConfig.specialAssignments?.[employeeId];
    if (ea === undefined || ea === null) return null;
    const idx = ((Number(ea) + semanasDesde(rotationConfig.referenceDate, d)) % 2 + 2) % 2;
    return ["EA", "EB"][idx];
  }

  // Temporada de verano: rotación semanal V1/V2 (igual que A/B/C pero módulo 2)
  if (isSummerPeriod(d)) {
    const sa = rotationConfig.summerAssignments?.[employeeId];
    if (sa === undefined || sa === null) return null;
    const idx = ((Number(sa) + semanasDesde(rotationConfig.referenceDate, d)) % 2 + 2) % 2;
    return ["V1", "V2"][idx];
  }

  // Resto del año: rotación semanal A/B/C
  if (!rotationConfig.assignments) return null;
  const base = rotationConfig.assignments[employeeId];
  if (base === undefined) return null;
  const idx = ((base + semanasDesde(rotationConfig.referenceDate, d)) % 3 + 3) % 3;
  return ["A", "B", "C"][idx];
}

// FIX #23: comparar versiones semver ("6.10" es más nueva que "6.9")
export function isNewerVersion(remote, local) {
  if (!remote || !local) return false;
  const r = remote.split(".").map(n => parseInt(n) || 0);
  const l = local.split(".").map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const a = r[i] || 0, b = l[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}
