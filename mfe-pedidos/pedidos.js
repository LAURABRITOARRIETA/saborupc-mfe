(function () {
  const VERSION = "1.0.0";
  const pedidosMemoria = [];
  let appVue = null;

  const CSS = `
    .ped-contenedor { font-family: var(--fuente-base); }
    .ped-titulo { color: var(--color-primario); margin: 0 0 4px; }
    .ped-version { font-size: 12px; color: var(--color-texto-suave); }
    .ped-vacio { margin-top: 16px; color: var(--color-texto-suave); }
    .ped-tarjeta { background: var(--color-tarjeta); border: 1px solid #dde3ea; border-radius: var(--radio-borde); padding: 16px; margin-top: 12px; box-shadow: var(--sombra-tarjeta); }
    .ped-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .ped-badge { padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 13px; }
    .est-recibido { background: #e3f2fd; color: #0d47a1; }
    .est-preparacion { background: #fff8e1; color: #f57f17; }
    .est-camino { background: #e8f5e9; color: #1b5e20; }
    .est-entregado { background: #e0e0e0; color: #424242; }
  `;

  function asegurarEstilos() {
    if (document.getElementById("ped-estilos")) return;
    const s = document.createElement("style");
    s.id = "ped-estilos";
    s.textContent = CSS;
    document.head.appendChild(s);
  }


  window.addEventListener("pedido:confirmado", function (e) {
    const nuevoPedido = {
      id: e.detail.id,
      items: e.detail.items || [],
      total: e.detail.total,
      fecha: e.detail.fecha,
      estado: "Recibido",
    };
    pedidosMemoria.unshift(nuevoPedido);
    iniciarMaquinaEstados(nuevoPedido);
  });

  function iniciarMaquinaEstados(pedido) {
    const flujo = ["Recibido", "En preparación", "En camino", "Entregado"];
    let paso = 0;

    const timer = setInterval(() => {
      paso++;
      if (paso < flujo.length) {
        pedido.estado = flujo[paso];
        window.dispatchEvent(
          new CustomEvent("pedido:estado", {
            detail: { id: pedido.id, estado: pedido.estado, version: "1.0" },
          }),
        );
      } else {
        clearInterval(timer);
      }
    }, 6000); // Avanza cada 6 segundos
  }

  function cargarVueCDN() {
    if (window.Vue) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/vue@3/dist/vue.global.js";
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("No se pudo cargar Vue 3 desde CDN"));
      document.head.appendChild(script);
    });
  }

  window.renderPedidos = async function (idContenedor) {
    asegurarEstilos();
    await cargarVueCDN();
    const contenedor = document.getElementById(idContenedor);
    contenedor.innerHTML = '<div id="vue-pedidos-root"></div>';

    const { createApp, ref } = window.Vue;

    appVue = createApp({
      setup() {
        const listado = ref(pedidosMemoria);
        const formatearMoneda = (v) =>
          new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(v);

        const claseEstado = (estado) => {
          switch (estado) {
            case "Recibido":
              return "est-recibido";
            case "En preparación":
              return "est-preparacion";
            case "En camino":
              return "est-camino";
            case "Entregado":
              return "est-entregado";
            default:
              return "";
          }
        };

        return { listado, VERSION, formatearMoneda, claseEstado };
      },
      template: `
        <div class="ped-contenedor">
          <h2 class="ped-titulo">Seguimiento de Pedidos</h2>
          <span class="ped-version">mfe-pedidos v{{ VERSION }} · Desarrollado en Vue 3 (CDN)</span>

          <div v-if="listado.length === 0" class="ped-vacio">
            No tienes pedidos en curso. Realiza una compra desde el Carrito.
          </div>

          <div v-else>
            <div v-for="p in listado" :key="p.id" class="ped-tarjeta">
              <div class="ped-header">
                <strong>Pedido #{{ p.id }} <small>({{ p.fecha }})</small></strong>
                <span :class="['ped-badge', claseEstado(p.estado)]">{{ p.estado }}</span>
              </div>
              <p style="margin: 8px 0 0;">Total: <strong>{{ formatearMoneda(p.total) }}</strong></p>
            </div>
          </div>
        </div>
      `,
    });

    appVue.mount("#vue-pedidos-root");
  };

  window.unmountPedidos = function (idContenedor) {
    if (appVue) {
      appVue.unmount();
      appVue = null;
    }
    const contenedor = document.getElementById(idContenedor);
    if (contenedor) contenedor.innerHTML = "";
  };
})();
