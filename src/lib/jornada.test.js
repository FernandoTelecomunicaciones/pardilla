import { describe, it, expect } from "vitest";
import {
  minutosDeHora,
  analizarJornada,
  jornadasSinCerrar,
  esRegularizacion,
  formatearDuracion,
} from "./jornada.js";

const e = (time, extra = {}) => ({ type: "entrada", time, ...extra });
const s = (time, extra = {}) => ({ type: "salida", time, ...extra });

describe("minutosDeHora", () => {
  it("convierte horas válidas", () => {
    expect(minutosDeHora("00:00")).toBe(0);
    expect(minutosDeHora("09:30")).toBe(570);
    expect(minutosDeHora("23:59")).toBe(1439);
  });

  it("rechaza horas imposibles y basura", () => {
    for (const v of ["24:00", "12:60", "", "9:5", "abc", null, undefined, 930, {}]) {
      expect(minutosDeHora(v)).toBeNull();
    }
  });
});

describe("analizarJornada — turno partido normal", () => {
  it("empareja los dos tramos del día y suma las horas", () => {
    const r = analizarJornada([e("09:00"), s("14:00"), e("17:00"), s("20:45")]);
    expect(r.pares).toHaveLength(2);
    expect(r.abiertas).toHaveLength(0);
    expect(r.huerfanas).toHaveLength(0);
    expect(r.minutos).toBe(300 + 225); // 5 h + 3 h 45
  });

  it("ordena por hora real aunque lleguen desordenados", () => {
    const r = analizarJornada([s("20:45"), e("17:00"), s("14:00"), e("09:00")]);
    expect(r.pares).toHaveLength(2);
    expect(r.abiertas).toHaveLength(0);
  });

  it("una jornada intensiva de un solo tramo también cuadra", () => {
    const r = analizarJornada([e("07:00"), s("14:00")]);
    expect(r.pares).toHaveLength(1);
    expect(r.minutos).toBe(420);
  });
});

describe("analizarJornada — el olvido de fichar salida", () => {
  it("detecta la entrada que nunca se cerró", () => {
    const r = analizarJornada([e("09:00"), s("14:00"), e("17:00")]);
    expect(r.pares).toHaveLength(1);
    expect(r.abiertas).toHaveLength(1);
    expect(r.abiertas[0].time).toBe("17:00");
    // Solo cuentan las horas del tramo cerrado: no se inventa la salida.
    expect(r.minutos).toBe(300);
  });

  it("dos entradas seguidas dejan la primera abierta", () => {
    const r = analizarJornada([e("09:00"), e("17:00")]);
    expect(r.abiertas.map(x => x.time)).toEqual(["09:00", "17:00"]);
    expect(r.minutos).toBe(0);
  });

  it("una salida sin entrada previa se marca como anomalía, no como tramo", () => {
    const r = analizarJornada([s("14:00")]);
    expect(r.huerfanas).toHaveLength(1);
    expect(r.pares).toHaveLength(0);
    expect(r.minutos).toBe(0);
  });

  it("un día sin fichajes no da error", () => {
    const r = analizarJornada([]);
    expect(r).toEqual({ pares: [], abiertas: [], huerfanas: [], minutos: 0 });
    expect(analizarJornada(null).minutos).toBe(0);
  });
});

describe("analizarJornada — no inventa duraciones", () => {
  it("si la salida es anterior a la entrada, la duración queda sin calcular", () => {
    const r = analizarJornada([e("17:00"), s("09:00")]);
    // Ordena por hora, así que la salida de las 09:00 va primero y queda huérfana.
    expect(r.huerfanas).toHaveLength(1);
    expect(r.abiertas).toHaveLength(1);
    expect(r.minutos).toBe(0);
  });

  it("con una hora corrupta el tramo no suma minutos falsos", () => {
    const r = analizarJornada([e("09:00"), s("no-es-hora")]);
    expect(r.pares).toHaveLength(1);
    expect(r.pares[0].minutos).toBeNull();
    expect(r.minutos).toBe(0);
  });
});

describe("jornadasSinCerrar", () => {
  const hoy = "2026-09-09";

  it("avisa de los días pasados que quedaron abiertos", () => {
    const abiertas = jornadasSinCerrar([
      { ...e("09:00"), date: "2026-09-07" },
      { ...e("17:00"), date: "2026-09-07" },
      { ...s("14:00"), date: "2026-09-07" },
    ], hoy);
    expect(abiertas).toHaveLength(1);
    expect(abiertas[0].fecha).toBe("2026-09-07");
    expect(abiertas[0].abiertas[0].time).toBe("17:00");
  });

  it("NO avisa del día de hoy: una entrada abierta hoy es alguien trabajando", () => {
    expect(jornadasSinCerrar([{ ...e("09:00"), date: hoy }], hoy)).toEqual([]);
  });

  it("ignora días completos", () => {
    expect(jornadasSinCerrar([
      { ...e("09:00"), date: "2026-09-07" },
      { ...s("14:00"), date: "2026-09-07" },
    ], hoy)).toEqual([]);
  });

  it("devuelve los días del más reciente al más antiguo", () => {
    const r = jornadasSinCerrar([
      { ...e("09:00"), date: "2026-09-01" },
      { ...e("09:00"), date: "2026-09-08" },
      { ...e("09:00"), date: "2026-09-04" },
    ], hoy);
    expect(r.map(d => d.fecha)).toEqual(["2026-09-08", "2026-09-04", "2026-09-01"]);
  });

  it("aguanta registros sin fecha sin romperse", () => {
    expect(() => jornadasSinCerrar([{ ...e("09:00") }, null], hoy)).not.toThrow();
  });
});

describe("esRegularizacion", () => {
  it("distingue un apunte corregido de un fichaje hecho en el momento", () => {
    expect(esRegularizacion({ regularizacion: true })).toBe(true);
    expect(esRegularizacion({ retroactivo: true })).toBe(true);
    expect(esRegularizacion({ type: "entrada" })).toBe(false);
    expect(esRegularizacion(null)).toBe(false);
  });
});

describe("formatearDuracion", () => {
  it("da formato legible", () => {
    expect(formatearDuracion(0)).toBe("0 min");
    expect(formatearDuracion(45)).toBe("45 min");
    expect(formatearDuracion(120)).toBe("2 h");
    expect(formatearDuracion(525)).toBe("8 h 45 min");
  });

  it("no inventa nada si no hay dato", () => {
    expect(formatearDuracion(null)).toBe("—");
    expect(formatearDuracion(-10)).toBe("—");
    expect(formatearDuracion(undefined)).toBe("—");
  });
});
