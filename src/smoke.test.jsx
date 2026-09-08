// @vitest-environment happy-dom
//
// Test de humo: monta la aplicación de verdad en un DOM.
//
// No comprueba ninguna regla de negocio: comprueba que la app ARRANCA. Cubre el
// fallo más caro de todos —que un error al cargar un módulo, en el arranque de
// Firebase o en el primer render deje la pantalla en blanco— y que ese fallo se
// detecte aquí y no en la tienda un domingo por la mañana.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "./App.jsx";

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  container.id = "root";
  document.body.appendChild(container);
});

afterEach(() => {
  if (root) act(() => root.unmount());
  container.remove();
  root = undefined;
});

describe("arranque de la aplicación", () => {
  it("monta sin lanzar y pinta algo en pantalla", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<StrictMode><App /></StrictMode>);
    });
    // Si el módulo o el primer render fallaran, esto quedaría vacío.
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("acaba en un estado de arranque conocido, nunca en pantalla blanca ni reventada", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<StrictMode><App /></StrictMode>);
    });
    const texto = container.textContent;

    // El arranque depende del entorno (si hay VITE_FIREBASE_* o no, y de si el
    // SDK puede inicializarse), así que no fijamos una pantalla concreta: lo que
    // se comprueba es que termina en alguno de los estados PREVISTOS y no en una
    // página en blanco.
    const estadosValidos = [
      "Pastelería Pardilla",                  // configuración inicial o login
      "No se pudo iniciar Firebase",          // error de arranque controlado
      "Iniciando",                            // cargando
    ];
    expect(estadosValidos.some(e => texto.includes(e))).toBe(true);

    // Y sobre todo: que no haya saltado el ErrorBoundary, que es la señal de que
    // algo lanzó una excepción durante el render.
    expect(texto).not.toContain("Algo ha fallado");
  });

  it("inyecta la hoja de estilos propia de la app", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<StrictMode><App /></StrictMode>);
    });
    const style = document.getElementById("pardilla-styles");
    expect(style).not.toBeNull();
    // Comprobamos que la corrección de la v6.1 sigue puesta: la pantalla de
    // login se apila en columna. Antes era una fila y encogía la tarjeta,
    // dejando los campos de email y contraseña cortados.
    expect(style.textContent).toContain("flex-direction: column");
  });

  it("no deja rastro del CSS de plantilla que encajonaba la app", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<StrictMode><App /></StrictMode>);
    });
    const style = document.getElementById("pardilla-styles");
    expect(style.textContent).not.toContain("1126px");
  });
});
