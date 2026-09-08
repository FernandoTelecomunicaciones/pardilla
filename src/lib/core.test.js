import { describe, it, expect } from "vitest";
import {
  parseLocalDate,
  toLocalDateStr,
  getMondayOfWeek,
  isSummerPeriod,
  getCurrentShift,
  isNewerVersion,
} from "./core.js";

// ── Fechas ───────────────────────────────────────────────────────────────────
describe("parseLocalDate / toLocalDateStr", () => {
  it("rechaza fechas imposibles, formatos ambiguos y entradas que no son texto", () => {
    for (const value of ["2026-02-30", "2026-13-01", "2026-00-01", "2026-01-00", "2026-1-1", "basura", 123, {}, null]) {
      expect(parseLocalDate(value)).toBeNull();
    }
    expect(toLocalDateStr(parseLocalDate("2028-02-29"))).toBe("2028-02-29");
  });
  it("hace ida y vuelta sin desplazar el día", () => {
    for (const s of ["2026-01-01", "2026-06-15", "2026-12-31", "2026-02-28"]) {
      expect(toLocalDateStr(parseLocalDate(s))).toBe(s);
    }
  });

  it("interpreta la fecha en horario LOCAL, no en UTC (bug FIX #8)", () => {
    // Con `new Date("2026-01-01")` el navegador asume UTC y en España (UTC+1)
    // la fecha se mostraría como 31 de diciembre.
    const d = parseLocalDate("2026-01-01");
    expect(d.getDate()).toBe(1);
    expect(d.getMonth()).toBe(0);
    expect(d.getFullYear()).toBe(2026);
  });

  it("fija la hora al mediodía para que los cambios de hora no muevan el día", () => {
    // Último domingo de marzo: cambio a horario de verano en España.
    expect(parseLocalDate("2026-03-29").getHours()).toBe(12);
    expect(toLocalDateStr(parseLocalDate("2026-03-29"))).toBe("2026-03-29");
    // Último domingo de octubre: vuelta a horario de invierno.
    expect(toLocalDateStr(parseLocalDate("2026-10-25"))).toBe("2026-10-25");
  });

  it("devuelve null con entrada vacía", () => {
    expect(parseLocalDate("")).toBeNull();
    expect(parseLocalDate(null)).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
  });

  it("rellena mes y día con cero a la izquierda", () => {
    expect(toLocalDateStr(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
  });

  it("da el día correcto justo antes y después de medianoche (bug del fichaje)", () => {
    // El fichaje toma la fecha del instante real; comprobamos que el corte de
    // día es exacto y no se va al día anterior por zona horaria.
    expect(toLocalDateStr(new Date(2026, 8, 8, 23, 59, 59))).toBe("2026-09-08");
    expect(toLocalDateStr(new Date(2026, 8, 9, 0, 0, 1))).toBe("2026-09-09");
  });
});

describe("getMondayOfWeek", () => {
  it("devuelve el lunes de esa misma semana de lunes a sábado", () => {
    // 2026-09-07 es lunes.
    for (let i = 0; i < 6; i++) {
      const d = parseLocalDate("2026-09-07");
      d.setDate(d.getDate() + i);
      expect(toLocalDateStr(getMondayOfWeek(d))).toBe("2026-09-07");
    }
  });

  it("en domingo devuelve el lunes ANTERIOR, no el siguiente (bug FIX #9)", () => {
    // 2026-09-13 es domingo: su semana empezó el lunes 7.
    expect(toLocalDateStr(getMondayOfWeek(parseLocalDate("2026-09-13")))).toBe("2026-09-07");
  });

  it("es idempotente: el lunes de un lunes es el mismo día", () => {
    const lunes = getMondayOfWeek(parseLocalDate("2026-09-09"));
    expect(toLocalDateStr(getMondayOfWeek(lunes))).toBe(toLocalDateStr(lunes));
  });
});

describe("isSummerPeriod", () => {
  it("cubre del 1 de junio al 31 de agosto incluidos", () => {
    expect(isSummerPeriod("2026-06-01")).toBe(true);
    expect(isSummerPeriod("2026-07-15")).toBe(true);
    expect(isSummerPeriod("2026-08-31")).toBe(true);
  });

  it("excluye el 31 de mayo y el 1 de septiembre", () => {
    expect(isSummerPeriod("2026-05-31")).toBe(false);
    expect(isSummerPeriod("2026-09-01")).toBe(false);
  });

  it("acepta tanto string como Date", () => {
    expect(isSummerPeriod(new Date(2026, 6, 1, 12))).toBe(true);
  });
});

// ── Rotación de turnos ───────────────────────────────────────────────────────
describe("getCurrentShift — rotación A/B/C", () => {
  // referenceDate 2026-04-06 es lunes. Empleado 1 arranca en A, el 2 en B, el 4 en C.
  const rotation = {
    referenceDate: "2026-04-06",
    assignments: { 1: 0, 2: 1, 4: 2 },
    summerAssignments: {},
  };

  it("asigna el turno base en la semana de referencia", () => {
    expect(getCurrentShift(1, "2026-04-06", rotation)).toBe("A");
    expect(getCurrentShift(2, "2026-04-06", rotation)).toBe("B");
    expect(getCurrentShift(4, "2026-04-06", rotation)).toBe("C");
  });

  it("mantiene el turno toda la semana, incluido el domingo", () => {
    expect(getCurrentShift(1, "2026-04-09", rotation)).toBe("A"); // jueves
    expect(getCurrentShift(1, "2026-04-12", rotation)).toBe("A"); // domingo
  });

  it("rota una posición por semana", () => {
    expect(getCurrentShift(1, "2026-04-13", rotation)).toBe("B");
    expect(getCurrentShift(1, "2026-04-20", rotation)).toBe("C");
    expect(getCurrentShift(1, "2026-04-27", rotation)).toBe("A"); // ciclo completo
  });

  it("rota correctamente hacia atrás en fechas anteriores a la referencia", () => {
    expect(getCurrentShift(1, "2026-03-30", rotation)).toBe("C");
    expect(getCurrentShift(1, "2026-03-23", rotation)).toBe("B");
  });

  it("nunca deja a dos empleados en el mismo turno la misma semana", () => {
    for (const fecha of ["2026-04-06", "2026-04-13", "2026-04-20", "2026-03-30"]) {
      const turnos = [1, 2, 4].map(id => getCurrentShift(id, fecha, rotation));
      expect(new Set(turnos).size).toBe(3);
    }
  });

  it("devuelve null si el empleado no está en la rotación", () => {
    expect(getCurrentShift(99, "2026-04-06", rotation)).toBeNull();
  });

  it("devuelve null sin configuración o sin fecha válida", () => {
    expect(getCurrentShift(1, "2026-04-06", null)).toBeNull();
    expect(getCurrentShift(1, "", rotation)).toBeNull();
  });
});

describe("getCurrentShift — rotación de verano V1/V2", () => {
  const rotation = {
    referenceDate: "2026-04-06",
    assignments: { 1: 0, 2: 1 },
    summerAssignments: { 1: 0, 2: 1 },
  };

  it("usa V1/V2 en verano en lugar de A/B/C", () => {
    const turno = getCurrentShift(1, "2026-07-06", rotation);
    expect(["V1", "V2"]).toContain(turno);
  });

  it("alterna cada semana con módulo 2", () => {
    const semana1 = getCurrentShift(1, "2026-07-06", rotation);
    const semana2 = getCurrentShift(1, "2026-07-13", rotation);
    const semana3 = getCurrentShift(1, "2026-07-20", rotation);
    expect(semana2).not.toBe(semana1);
    expect(semana3).toBe(semana1);
  });

  it("mantiene a los dos empleados en turnos distintos", () => {
    for (const fecha of ["2026-06-01", "2026-07-13", "2026-08-31"]) {
      expect(getCurrentShift(1, fecha, rotation)).not.toBe(getCurrentShift(2, fecha, rotation));
    }
  });

  it("acepta el índice 0 como asignación válida (no debe tratarse como ausente)", () => {
    expect(getCurrentShift(1, "2026-07-06", rotation)).not.toBeNull();
  });

  it("devuelve null si el empleado no tiene asignación de verano", () => {
    const sinVerano = { ...rotation, summerAssignments: { 2: 1 } };
    expect(getCurrentShift(1, "2026-07-06", sinVerano)).toBeNull();
  });
});

// ── Comparación de versiones (botón de actualizar) ───────────────────────────
describe("isNewerVersion", () => {
  it("detecta una versión remota más nueva", () => {
    expect(isNewerVersion("6.1", "6.0")).toBe(true);
    expect(isNewerVersion("7.0", "6.9")).toBe(true);
    expect(isNewerVersion("6.0.1", "6.0")).toBe(true);
  });

  it("no avisa si la versión es igual o anterior", () => {
    expect(isNewerVersion("6.1", "6.1")).toBe(false);
    expect(isNewerVersion("6.0", "6.1")).toBe(false);
    expect(isNewerVersion("5.9", "6.0")).toBe(false);
  });

  it("compara por número, no por texto ('6.10' es más nueva que '6.9')", () => {
    expect(isNewerVersion("6.10", "6.9")).toBe(true);
    expect(isNewerVersion("6.9", "6.10")).toBe(false);
  });

  it("tolera valores vacíos o nulos sin lanzar", () => {
    expect(isNewerVersion(null, "6.0")).toBe(false);
    expect(isNewerVersion("6.0", null)).toBe(false);
    expect(isNewerVersion("", "")).toBe(false);
  });

  it("soporta la lógica de 'versión descartada': no reavisa de una anterior", () => {
    // El usuario descartó la 6.3; si el servidor anuncia la 6.2, no debe avisar.
    const descartada = "6.3";
    expect(isNewerVersion("6.2", descartada)).toBe(false);
    // Pero sí debe avisar de una posterior a la descartada.
    expect(isNewerVersion("6.4", descartada)).toBe(true);
  });
});
