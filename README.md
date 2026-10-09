# SaborUPC 2.0 — Arquitectura de Micro Frontends

Sistema de comercio electrónico modular construido bajo la arquitectura de **Micro Frontends (MFE)** en tiempo de ejecución, con soporte para resiliencia ante fallos, heterogeneidad tecnológica y comunicación desacoplada por eventos.

---

## Diagrama de Arquitectura

```mermaid
flowchart TD
    subgraph Origen_8085 [Sistema de Diseño - 8085]
        TOKENS[tokens.css]
    end

    subgraph Origen_8080 [Contenedor / Shell - 8080]
        SHELL[Shell App / Router Hash]
        BUS[Bus Global - window]
    end

    subgraph MFEs [Micro Frontends]
        CATALOGO[Catálogo - 8081 / Vanilla JS]
        CARRITO[Carrito - 8082 / Vanilla JS]
        PERFIL[Perfil - 8083 / Custom Element]
        PEDIDOS[Pedidos - 8084 / Vue 3 CDN]
    end

    TOKENS -.-> SHELL & CATALOGO & CARRITO & PERFIL & PEDIDOS
    CATALOGO & CARRITO & PERFIL & PEDIDOS -->|Carga Dinámica| SHELL
    CATALOGO & CARRITO & PERFIL & PEDIDOS <-->|Eventos| BUS

Puertos y ServidoresMFE / ComponentePuertoTecnologíaEstrategia de CargaContenedor (Host)8080Vanilla JS / ShellRouter Hash (#/)MFE Catálogo8081Vanilla JSFunciones render / unmountMFE Carrito8082Vanilla JSPrecargado en backgroundMFE Perfil8083Web ComponentCustom Element (Shadow DOM)MFE Pedidos8084Vue 3 (CDN)Funciones render / unmountSistema de Diseño8085CSS TokensInyección <link> globalEventos del Bus Global (window)EventoEmisorReceptorDescripcióncarrito:agregarCatálogoCarritoAgrega un producto al carritocarrito:actualizadoCarritoShellActualiza contador de la barra superiorusuario:cambioPerfilShellActualiza saludo de usuariopedido:confirmadoCarritoPedidosCrea una nueva orden de pedidopedido:estadoPedidosShellMuestra notificación Toast en pantallaPasos de Ejecución Local1. Estructura de CarpetasVerifica que las carpetas estén al mismo nivel:Plaintextsaborupc-2.0/
├── sistema-diseno/
├── contenedor/
├── mfe-catalogo/
├── mfe-carrito/
├── mfe-perfil/
└── mfe-pedidos/
2. Iniciar Servidores (6 Terminales)Abre 6 terminales y ejecuta los siguientes comandos con soporte CORS:Bash# Terminal 1 — Sistema de Diseño
cd sistema-diseno && npx http-server -p 8085 --cors

# Terminal 2 — Contenedor Principal
cd contenedor && npx http-server -p 8080 --cors

# Terminal 3 — MFE Catálogo
cd mfe-catalogo && npx http-server -p 8081 --cors

# Terminal 4 — MFE Carrito
cd mfe-carrito && npx http-server -p 8082 --cors

# Terminal 5 — MFE Perfil
cd mfe-perfil && npx http-server -p 8083 --cors

# Terminal 6 — MFE Pedidos
cd mfe-pedidos && npx http-server -p 8084 --cors
3. Abrir la AplicaciónNavega en tu explorador a: http://localhost:8080Resiliencia y PruebasManejo de Fallos: Si detienes cualquier servidor (por ejemplo, el puerto 8084), el Contenedor capturará la falla, mantendrá la navegación activa y desplegará un mensaje de error con botón de Reintentar.Prueba Aislada: Puedes probar el MFE de Pedidos de forma independiente abriendo http://localhost:8084/contrato.html.