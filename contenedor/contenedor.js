(function () {
  const RUTA_INICIAL = "/catalogo";
  const ID_RAIZ = "app-root";
  const raiz = document.getElementById(ID_RAIZ);
  const scripts = {};
  let montado = null;
  let turno = 0;

  function cargarScript(url) {
    if (!scripts[url]) {
      scripts[url] = new Promise(function (resolve, reject) {
        const s = document.createElement("script");
        s.src = url + "?v=" + Date.now();
        s.onload = resolve;
        s.onerror = function () {
          delete scripts[url];
          reject(new Error("No se pudo descargar el recurso: " + url));
        };
        document.head.appendChild(s);
      });
    }
    return scripts[url];
  }

  function montar(entrada) {
    if (entrada.tipo === "funcion") {
      window["render" + entrada.nombre](ID_RAIZ);
    } else if (entrada.tipo === "webcomponent") {
      raiz.appendChild(document.createElement(entrada.etiqueta));
    }
    montado = entrada;
  }

  function desmontarActual() {
    if (montado && montado.tipo === "funcion") {
      const desmontar = window["unmount" + montado.nombre];
      if (typeof desmontar === "function") desmontar(ID_RAIZ);
    }
    raiz.innerHTML = "";
    montado = null;
  }

  async function navegar() {
    const miTurno = ++turno;
    const ruta = location.hash.replace("#", "") || RUTA_INICIAL;
    const entrada = window.REGISTRO_MFE[ruta];
    marcarEnlaceActivo(ruta);
    desmontarActual();

    if (!entrada) {
      raiz.innerHTML = '<p class="app-aviso">Página no encontrada.</p>';
      return;
    }
    raiz.innerHTML =
      '<p class="app-aviso">Cargando ' + entrada.nombre + "…</p>";

    const t0 = performance.now();
    try {
      await cargarScript(entrada.url);
      const t1 = performance.now();
      console.log(
        `[Observabilidad] MFE ${entrada.nombre} cargado en ${(t1 - t0).toFixed(2)} ms`,
      );

      if (miTurno !== turno) return;
      raiz.innerHTML = "";
      montar(entrada);
    } catch (e) {
      if (miTurno !== turno) return;
      console.error(`[Error de Carga] ${entrada.nombre}:`, e);
      raiz.innerHTML = `
        <div class="app-error-card">
          <h3>Error al cargar el micro frontend: ${entrada.nombre}</h3>
          <p>El servicio no está disponible o la conexión ha fallado.</p>
          <button class="app-btn-retry" onclick="window.reintentarNavegacion()">Reintentar</button>
        </div>`;
    }
  }

  window.reintentarNavegacion = function () {
    navegar();
  };

  function mostrarToast(mensaje) {
    const toasts = document.getElementById("app-toasts");
    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = mensaje;
    toasts.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function marcarEnlaceActivo(ruta) {
    document.querySelectorAll(".app-nav a").forEach(function (a) {
      a.classList.toggle("activo", a.dataset.ruta === ruta);
    });
  }

  // Bus de Eventos Global
  window.addEventListener("carrito:actualizado", function (e) {
    document.getElementById("app-contador").textContent = e.detail.cantidad;
  });

  window.addEventListener("usuario:cambio", function (e) {
    document.getElementById("app-saludo").textContent =
      "Hola, " + e.detail.nombre;
  });

  window.addEventListener("pedido:estado", function (e) {
    mostrarToast(
      `🔔 Pedido #${e.detail.id} actualizó estado: ${e.detail.estado}`,
    );
  });

  // Precarga
  Object.values(window.REGISTRO_MFE)
    .filter(function (m) {
      return m.precargar;
    })
    .forEach(function (m) {
      cargarScript(m.url).catch(console.error);
    });

  window.addEventListener("hashchange", navegar);
  navegar();
})();
