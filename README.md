# LA RUEDA MARKET

La Rueda Market es una plataforma web desarrollada como Producto Mínimo Viable (PMV) para apoyar la operación de un supermercado rural.

El sistema permite a los clientes consultar productos, agregarlos al carrito, crear pedidos, seleccionar forma de entrega, registrar pagos y ver recetas recomendadas desde productos principales como carnes.  
Desde el panel administrativo, permite gestionar productos, categorías, usuarios, pedidos, pagos, domicilios, inventario y recetas.

---

## Objetivo del proyecto

Desarrollar una solución web funcional que integre el proceso de compra y administración de La Rueda Market:

```text
Cliente → Catálogo → Carrito → Pedido → Pago → Entrega
```

Además, el proyecto incluye control administrativo de inventario y recetas comerciales para apoyar la venta cruzada de productos.

---

## Tecnologías utilizadas

### Backend

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Swagger

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Herramientas

- Git
- GitHub
- Visual Studio Code
- PostgreSQL / pgAdmin

---

## Estructura del proyecto

```text
La-Rueda-Market
│
├── backend
│   ├── src
│   │   ├── auth
│   │   ├── users
│   │   ├── credentials
│   │   ├── products
│   │   ├── categories
│   │   ├── cart
│   │   ├── cart-detail
│   │   ├── orders
│   │   ├── order-detail
│   │   ├── payments
│   │   ├── deliveries
│   │   ├── inventory
│   │   ├── inventory-movement
│   │   ├── recipes
│   │   └── entities
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── features
│   │   ├── layouts
│   │   ├── pages
│   │   └── routes
│   └── package.json
│
├── README.md
├── .gitignore
└── LICENSE
```

---

## Instalación y ejecución

### Clonar el repositorio

```bash
git clone https://github.com/Elena-0718/La-Rueda-Market.git
cd La-Rueda-Market
```

---

## Backend

### Instalar dependencias

```bash
cd backend
npm install
```

### Configurar variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend`.

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=la_rueda_market

JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1d
```

### Ejecutar backend

```bash
npm run start:dev
```

Backend:

```text
http://localhost:3000/api
```

Swagger:

```text
http://localhost:3000/api/docs
```
 
---

## Frontend

### Instalar dependencias

```bash
cd frontend
npm install
```

### Ejecutar frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Roles del sistema

### CLIENT

Usuario cliente de la tienda.

Puede:

- Registrarse e iniciar sesión.
- Consultar productos.
- Buscar y filtrar por categoría.
- Agregar productos al carrito.
- Modificar cantidades.
- Crear pedidos.
- Seleccionar recogida en tienda o domicilio programado.
- Registrar pagos.
- Consultar sus pedidos.
- Ver recetas recomendadas.
- Elegir productos desde una receta y agregarlos al carrito.

### ADMIN

Usuario administrador del sistema.

Puede:

- Gestionar productos.
- Gestionar categorías.
- Gestionar usuarios.
- Gestionar pedidos.
- Confirmar o rechazar pagos.
- Gestionar domicilios.
- Controlar inventario.
- Registrar movimientos de inventario.
- Crear y administrar recetas.

---

# Módulos principales

## Autenticación y usuarios

Permite registro, inicio de sesión, cierre de sesión, protección con JWT y control de acceso por roles.

Incluye:

- Registro de clientes.
- Login.
- Perfil de usuario.
- Gestión administrativa de usuarios.
- Roles `CLIENT` y `ADMIN`.

---

## Productos y categorías

Permite gestionar el catálogo de la tienda.

Incluye:

- Creación y edición de productos.
- Activación y desactivación de productos.
- Asociación de productos a categorías.
- Carga de imágenes.
- Búsqueda por nombre.
- Filtro por categoría.
- Visualización de productos activos para clientes.

Categorías usadas:

- Abarrotes.
- Aseo.
- Frutas y verduras.
- Carnes.
- Papelería e impresiones.

---

## Carrito

Permite que el cliente construya su compra antes de generar el pedido.

Incluye:

- Agregar productos.
- Actualizar cantidades.
- Eliminar productos.
- Vaciar carrito.
- Calcular subtotales y total.

Flujo:

```text
Producto → Agregar al carrito → Mi carrito → Finalizar pedido
```

---

## Pedidos y entregas

Permite convertir el carrito en un pedido y seleccionar la forma de entrega.

Formas de entrega:

```text
PICKUP
El cliente recoge en tienda.
Costo de domicilio: $0.

SCHEDULED_DELIVERY
Domicilio programado según ruta.
Costo de domicilio: $2.000.
```

Incluye:

- Creación de pedidos.
- Consulta de pedidos del cliente.
- Consulta de detalle del pedido.
- Cancelación de pedidos.
- Gestión administrativa de estados.
- Gestión de entregas para domicilio programado.

---

## Pagos

Permite registrar y administrar pagos de pedidos.

Formas de pago:

```text
CASH
Pago en efectivo.

TRANSFER
Pago por transferencia.
```

Estados:

```text
PENDING
CONFIRMED
REJECTED
CANCELLED
```

Incluye:

- Registro de pago por cliente.
- Referencia para transferencia.
- Confirmación de pago por administrador.
- Rechazo de pago.
- Consulta de pagos.

---

## Inventario

Permite controlar el stock físico de los productos desde el panel administrativo.

Incluye:

- Crear inventario por producto.
- Registrar stock actual.
- Definir stock mínimo.
- Registrar proveedor.
- Registrar precio de compra.
- Marcar producto perecedero.
- Definir fecha de vencimiento.
- Consultar resumen de inventario.

Alertas:

```text
NORMAL
BAJO STOCK
PRÓXIMO A VENCER
VENCIDO
SIN CONTROL
```

El stock exacto es administrativo y no se muestra al cliente.

---

## Movimientos de inventario

Permite registrar entradas y salidas de productos.

Tipos:

```text
IN
Entrada de inventario.

OUT
Salida de inventario.
```

Motivos principales:

```text
SUPPLIER_PURCHASE
STORE_SALE
ONLINE_SALE
LOSS
EXPIRATION
POSITIVE_ADJUSTMENT
NEGATIVE_ADJUSTMENT
RETURN
```

Regla importante:

```text
No se permite registrar una salida mayor al stock actual.
```

---

## Recetas

El módulo de recetas permite recomendar preparaciones desde productos principales y apoyar la venta cruzada.

Incluye:

- Crear recetas desde administrador.
- Agregar video.
- Definir título, descripción, categoría, dificultad, tiempo y porciones.
- Agregar notas de ingredientes.
- Agregar pasos de preparación.
- Agregar ingredientes extra.
- Agregar consejos.
- Activar o desactivar recetas.
- Marcar recetas como destacadas.
- Asociar productos principales.
- Asociar productos recomendados.

### Productos principales

Son los productos que activan el botón:

```text
VER RECETAS
```

Ejemplo:

```text
Carne molida
Pechuga de pollo
Carne de cerdo
```

### Productos recomendados

Son los productos que aparecen dentro de la receta para que el cliente pueda elegirlos y agregarlos al carrito.

Ejemplo:

```text
Carne molida
Pan hamburguesa
Tomate
Cebolla
Queso
```

Flujo:

```text
Producto principal → Ver recetas → Receta → Producto recomendado → Elegir cantidad → Agregar al carrito
```

---

# Experiencia de usuario

La interfaz fue diseñada para ser clara y fácil de usar.

Incluye:

- Navegación simple.
- Header con acceso a productos, recetas, carrito y usuario.
- Panel administrativo separado.
- Tarjetas de producto.
- Botones claros.
- Mensajes de carga.
- Mensajes de éxito.
- Mensajes de error.
- Filtros por categoría.
- Búsqueda por nombre.
- Flujo guiado para finalizar pedido.
- Diseño responsivo.

---

# Rutas principales del frontend

## Cliente y público

```text
/
 /login
 /registro
 /perfil
 /carrito
 /finalizar-pedido
 /pagar-pedido/:uuid
 /mis-pedidos
 /mis-pedidos/:uuid
 /recetas
 /recetas/:uuid
 /productos/:uuid/comprar
```

## Administrador

```text
/admin
/admin/productos
/admin/productos/nuevo
/admin/productos/:uuid/editar
/admin/categorias
/admin/categorias/nueva
/admin/categorias/:uuid/editar
/admin/usuarios
/admin/pedidos
/admin/inventario
/admin/recetas
```

---

# Endpoints principales del backend

## Auth

```text
POST /api/auth/login
POST /api/auth/register
```

## Products

```text
GET    /api/products
GET    /api/products/:uuid
GET    /api/products/admin/all
POST   /api/products
PATCH  /api/products/:uuid
PUT    /api/products/activate/:uuid
DELETE /api/products/:uuid
```

## Categories

```text
GET    /api/categories
GET    /api/categories/admin/all
POST   /api/categories
PATCH  /api/categories/:uuid
PUT    /api/categories/activate/:uuid
DELETE /api/categories/:uuid
```

## Cart

```text
GET    /api/cart
DELETE /api/cart/empty
DELETE /api/cart/cancel
```

## Cart Details

```text
POST   /api/cart-details/add-product
PUT    /api/cart-details/update-product-quantity/:uuid
DELETE /api/cart-details/delete-product/:uuid
```

## Orders

```text
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders/:uuid
PATCH  /api/orders/:uuid/cancel
GET    /api/orders/admin/all
PATCH  /api/orders/admin/:uuid/status
DELETE /api/orders/admin/:uuid
```

## Payments

```text
POST   /api/payments/checkout
GET    /api/payments/admin/all
GET    /api/payments/:uuid
PUT    /api/payments/admin/confirm/:uuid
PUT    /api/payments/admin/status/:uuid
DELETE /api/payments/admin/reject/:uuid
```

## Deliveries

```text
GET  /api/deliveries/admin/all
POST /api/deliveries/admin
GET  /api/deliveries/:uuid
PUT  /api/deliveries/admin/:uuid/status
```

## Inventory

```text
POST   /api/inventory/admin
GET    /api/inventory/admin
GET    /api/inventory/admin/summary
GET    /api/inventory/admin/:uuid
PATCH  /api/inventory/admin/:uuid
DELETE /api/inventory/admin/:uuid
GET    /api/inventory/admin/:uuid/movements
```

## Inventory Movements

```text
POST   /api/inventory-movements/admin
GET    /api/inventory-movements/admin
GET    /api/inventory-movements/admin/:uuid
GET    /api/inventory-movements/admin/inventory/:inventoryUuid
PATCH  /api/inventory-movements/admin/:uuid
DELETE /api/inventory-movements/admin/:uuid
```

## Recipes

```text
POST   /api/recipes/admin
GET    /api/recipes/admin/all
GET    /api/recipes/admin/:uuid
PATCH  /api/recipes/admin/:uuid
DELETE /api/recipes/admin/:uuid

GET    /api/recipes
GET    /api/recipes?productUuid=UUID_PRODUCTO_PRINCIPAL
GET    /api/recipes/:uuid
```

---

# Estado actual del PMV

El proyecto integra los módulos principales necesarios para demostrar el funcionamiento del PMV:

- Autenticación.
- Usuarios.
- Categorías.
- Productos.
- Carrito.
- Pedidos.
- Pagos.
- Domicilios.
- Inventario.
- Movimientos de inventario.
- Recetas.
- Panel administrativo.
- Interfaz cliente.

El sistema permite evidenciar un flujo completo de compra y administración.

---

# Repositorio

```text
https://github.com/Elena-0718/La-Rueda-Market.git
```

---


# Autora

```text
Nórida Elena Rueda Peña
Análisis y Desarrollo de Software - ADSO
SENA
```

---


