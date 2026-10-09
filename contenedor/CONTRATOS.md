# Contratos de Comunicación y Ciclo de Vida — SaborUPC 2.0

## Tabla de Eventos del Bus Global (`window`)

| Evento                | Publicador | Consumidores | Propiedad `detail`                            | Versión | Compatibilidad hacia atrás               |
| :-------------------- | :--------- | :----------- | :-------------------------------------------- | :-----: | :--------------------------------------- |
| `carrito:agregar`     | Catálogo   | Carrito      | `{ id, nombre, precio }`                      |  `1.0`  | Nuevos campos no rompen al carrito.      |
| `carrito:actualizado` | Carrito    | Contenedor   | `{ cantidad, total }`                         |  `1.0`  | El contenedor solo lee `cantidad`.       |
| `usuario:cambio`      | Perfil     | Contenedor   | `{ nombre }`                                  |  `1.0`  | Actualiza la barra superior.             |
| `pedido:confirmado`   | Carrito    | Pedidos      | `{ id, items, total, fecha, version: "1.0" }` |  `1.0`  | Incluye versión explícita en payload.    |
| `pedido:estado`       | Pedidos    | Contenedor   | `{ id, estado, version: "1.0" }`              |  `1.0`  | Desencadena notificación Toast en shell. |

## Contrato de Integración de Micro Frontends

### Tipo 1: Funciones de Montaje (`catalogo`, `carrito`, `pedidos`)

- **Exposición:** `window.render<Nombre>(idContenedor)` y `window.unmount<Nombre>(idContenedor)`
- **Contrato:** La función `render` debe inyectar su interfaz dentro de `document.getElementById(idContenedor)` de forma idempotente. `unmount` debe limpiar listeners y vaciar el contenedor.

### Tipo 2: Custom Element (`perfil`)

- **Exposición:** Etiqueta HTML `<mfe-perfil>` registrada vía `customElements.define`.
- **Contrato:** Utiliza Shadow DOM encapsulado para evitar fugas de CSS.
