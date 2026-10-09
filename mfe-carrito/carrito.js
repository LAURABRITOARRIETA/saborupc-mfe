(function () {
  const VERSION = "1.0.0";
  const pesos = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const CSS = `
    .car-titulo { color: var(--color-primario, #0b4f8a); margin: 0 0 4px; }
    .car-version { font-size: 12px; color: var(--color-texto-suave, #888); }
    .car-tabla { width: 100%; border-collapse: collapse; margin: 16px 0; background: var(--color-tarjeta, #fff); }
    .car-tabla th, .car-tabla td { padding: 10px; border-bottom: 1px solid #e3e7ec; text-align: left; }
    .car-tabla th { background: #eaf3fb; }
    .car-quitar { background: none; border: 1px solid var(--color-alerta, #c0392b); color: var(--color-alerta, #c0392b); border-radius: 4px; cursor: pointer; padding: 4px 8px; }
    .car-total { font-size: 20px; font-weight: bold; text-align: right; }
    .car-confirmar { background: var(--color-primario, #0b4f8a); color: #fff; border: 0; padding: 10px 18px; border-radius: 4px; cursor: pointer; float: right; margin-top: 12px; }
    .car-vacio { color: var(--color-texto-suave, #777); }
    .car-exito { background: #eaf6ea; color: var(--color-exito, #1b7a3e); padding: 12px; border-radius: 4px; }
  `;

  const items = [];
  let idMontado = null;
  let mensaje = "";

  function asegurarEstilos() {
    if (document.getElementById("car-estilos")) return;
    const s = document.createElement("style");
    s.id = "car-estilos";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function total() {
    return items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  }

  function publicarEstado() {
    const cantidad = items.reduce((acc, it) => acc + it.cantidad, 0);
    window.dispatchEvent(
      new CustomEvent("carrito:actualizado", {
        detail: { cantidad: cantidad, total: total(), version: "1.0" },
      }),
    );
  }

  window.addEventListener("carrito:agregar", function (e) {
    const plato = e.detail;
    const existente = items.find((it) => it.id === plato.id);
    if (existente) existente.cantidad += 1;
    else
      items.push({
        id: plato.id,
        nombre: plato.nombre,
        precio: plato.precio,
        cantidad: 1,
      });
    mensaje = "";
    publicarEstado();
    if (idMontado) pintar();
  });

  function pintar() {
    const raiz = document.getElementById(idMontado);
    let html = `<h2 class="car-titulo">Tu carrito</h2>
                <span class="car-version">mfe-carrito v${VERSION}</span>`;
    if (mensaje) html += `<p class="car-exito">${mensaje}</p>`;
    if (items.length === 0) {
      html +=
        '<p class="car-vacio">El carrito está vacío. Agrega platos desde el catálogo.</p>';
    } else {
      html += `<table class="car-tabla">
        <tr><th>Plato</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
        ${items
          .map(
            (it) => `<tr>
            <td>${it.nombre}</td><td>${it.cantidad}</td>
            <td>${pesos.format(it.precio * it.cantidad)}</td>
            <td><button class="car-quitar" data-id="${it.id}">Quitar</button></td>
          </tr>`,
          )
          .join("")}
      </table>
      <div class="car-total">Total: ${pesos.format(total())}</div>
      <button class="car-confirmar">Confirmar pedido</button>`;
    }
    raiz.innerHTML = html;
  }

  function alHacerClic(e) {
    if (e.target.matches(".car-quitar")) {
      const i = items.findIndex((it) => it.id === Number(e.target.dataset.id));
      if (i >= 0) items.splice(i, 1);
      publicarEstado();
      pintar();
    } else if (e.target.matches(".car-confirmar")) {
      const pedidoObj = {
        id: Math.floor(1000 + Math.random() * 9000),
        items: [...items],
        total: total(),
        fecha: new Date().toLocaleTimeString(),
        version: "1.0",
      };

      // Publicar nuevo evento de contrato
      window.dispatchEvent(
        new CustomEvent("pedido:confirmado", { detail: pedidoObj }),
      );

      mensaje = `¡Pedido #${pedidoObj.id} confirmado por ${pesos.format(total())}! Puedes seguirlo en la sección Pedidos.`;
      items.length = 0;
      publicarEstado();
      pintar();
    }
  }

  window.renderCarrito = function (idContenedor) {
    asegurarEstilos();
    idMontado = idContenedor;
    document
      .getElementById(idContenedor)
      .addEventListener("click", alHacerClic);
    pintar();
  };

  window.unmountCarrito = function (idContenedor) {
    const raiz = document.getElementById(idContenedor);
    if (raiz) {
      raiz.removeEventListener("click", alHacerClic);
      raiz.innerHTML = "";
    }
    idMontado = null;
    mensaje = "";
  };
})();
