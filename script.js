/* =========================================================
   PREGUNTA 1 · DOM API
   crearPecera(x): construye un tablero de x por x celdas.
   ========================================================= */
function crearPecera(x) {
  const tablero = document.getElementById("tablero");
  tablero.replaceChildren();                                    // limpia si ya existía
  tablero.style.gridTemplateColumns = `repeat(${x}, 1fr)`;
  tablero.style.gridTemplateRows = `repeat(${x}, 1fr)`;

  for (let i = 0; i < x * x; i++) {
    const celda = document.createElement("div");
    celda.classList.add("celda");
    tablero.appendChild(celda);
  }
}

/* =========================================================
   PREGUNTA 2 · Web Storage API
   Nemo  -> localStorage   (persiste entre pestañas y sesiones)
   Dory  -> sessionStorage (solo vive en su pestaña y se borra al recargar, ver arranque)
   ========================================================= */
const almacenes = { nemo: localStorage, dory: sessionStorage };

function leerContador(pez) {
  return parseInt(almacenes[pez].getItem("contador_" + pez), 10) || 0;
}

function pintarContador(pez) {
  document.getElementById("cont-" + pez).textContent = leerContador(pez);
}

function sumarPez(pez) {
  almacenes[pez].setItem("contador_" + pez, leerContador(pez) + 1);
  pintarContador(pez);
}

document.getElementById("btn-nemo").addEventListener("click", () => sumarPez("nemo"));
document.getElementById("btn-dory").addEventListener("click", () => sumarPez("dory"));

// Color del agua: de azul claro a verde, un paso por segundo.
// Es una variable en memoria (no se guarda): al recargar la página vuelve al color original.
const SEGUNDOS_HASTA_VERDE = 60;
let segundos = 0;
setInterval(() => {
  segundos = Math.min(segundos + 1, SEGUNDOS_HASTA_VERDE);
  const t = segundos / SEGUNDOS_HASTA_VERDE;                    // 0 -> 1
  const hue = 195 - 75 * t;                                     // 195 (azul) -> 120 (verde)
  const sat = 53 - 8 * t;
  const lum = 79 - 9 * t;
  document.documentElement.style.setProperty("--agua", `hsl(${hue}, ${sat}%, ${lum}%)`);
}, 1000);

/* =========================================================
   PREGUNTA 3 · Drag and Drop API
   Cada 2 s nace una burbuja arriba. Se suelta sobre la zona de su pez.
   ========================================================= */
const capaBurbujas = document.getElementById("burbujas");
const MAX_BURBUJAS = 15;

function crearBurbuja() {
  if (capaBurbujas.children.length >= MAX_BURBUJAS) capaBurbujas.firstElementChild.remove();

  const pez = Math.random() < 0.5 ? "nemo" : "dory";
  const b = document.createElement("div");
  b.className = "burbuja " + pez;
  b.draggable = true;
  b.dataset.pez = pez;
  b.style.left = Math.random() * (capaBurbujas.clientWidth - 44) + "px";

  b.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", pez);
    e.dataTransfer.effectAllowed = "move";
    window.burbujaArrastrada = b;
  });

  // Si al terminar el arrastre la burbuja sigue ahí (zona equivocada o fuera del tablero),
  // vuelve a su posición inicial reiniciando su animación desde arriba.
  b.addEventListener("dragend", () => {
    if (b.isConnected) {
      b.style.animation = "none";
      void b.offsetWidth;                                       // fuerza reflow
      b.style.animation = "";
    }
    window.burbujaArrastrada = null;
  });

  b.addEventListener("animationend", () => b.remove());         // salió por abajo
  capaBurbujas.appendChild(b);
}
setInterval(crearBurbuja, 2000);

document.querySelectorAll(".zona").forEach((zona) => {
  zona.addEventListener("dragover", (e) => { e.preventDefault(); zona.classList.add("sobre"); });
  zona.addEventListener("dragleave", () => zona.classList.remove("sobre"));
  zona.addEventListener("drop", (e) => {
    e.preventDefault();
    zona.classList.remove("sobre");
    const duenio = e.dataTransfer.getData("text/plain");
    if (duenio === zona.dataset.pez && window.burbujaArrastrada) {
      window.burbujaArrastrada.remove();                        // aterrizó bien: desaparece
      sumarPez(duenio);                                         // y sube su contador personal
    }
    // zona equivocada: no se hace nada, dragend la devuelve al inicio
  });
});

/* ---------- Arranque ---------- */
crearPecera(6);
// Limpiar la pecera (recargar la página) hace que Dory olvide todo.
// Nemo no se toca: su contador sigue en localStorage.
sessionStorage.removeItem("contador_dory");
pintarContador("nemo");
pintarContador("dory");
