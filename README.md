# La Rueda Market

Plataforma web para la gestión de pedidos, abastecimiento programado y administración comercial de un supermercado rural ubicado en la vereda El Espinal, municipio de Los Santos, Santander.

El sistema busca mejorar el acceso de la comunidad a productos básicos y frescos mediante una solución tecnológica orientada a pedidos en línea, domicilios y control administrativo.

---

# Tecnologías utilizadas

## Backend
- Node.js
- TypeScript
- Express.js / NestJS
- PostgreSQL
- JWT Authentication

## Frontend
- React
- Vite
- Tailwind CSS
- Axios

## Herramientas
- Git
- GitHub
- Visual Studio Code

---

# Estructura del proyecto

```bash
LA-RUEDA-MARKET
│
├── backend
├── frontend
├── docs
├── README.md
└── .gitignore
```

---

# Instalación del proyecto

## Clonar repositorio

```bash
git clone https://github.com/Elena-0718/La-Rueda-Market.git
```

## Ingresar al proyecto

```bash
cd La-Rueda-Market
```

---

# Instalación backend

```bash
cd backend
npm install
```

---

# Instalación frontend

```bash
cd frontend
npm install
```

---

# Ejecución del proyecto

## Backend

```bash
npm run start:dev
```

## Frontend

```bash
npm run dev
```

---

# Arquitectura inicial del sistema

La aplicación se desarrollará bajo una arquitectura cliente-servidor separando frontend, backend y base de datos para facilitar escalabilidad, mantenimiento y modularidad.

```txt
┌─────────────────────┐
│     Frontend Web     │
│   React + Tailwind   │
└──────────┬──────────┘
           │ HTTP API
           ▼
┌─────────────────────┐
│      Backend API     │
│ Node.js + TypeScript │
└──────────┬──────────┘
           │ ORM
           ▼
┌─────────────────────┐
│    PostgreSQL DB     │

 └─────────────────────┘
```

## Componentes principales

### Frontend
Encargado de la interfaz gráfica, navegación, carrito de compras y consumo de la API.

### Backend
Responsable de la lógica de negocio, autenticación, gestión de productos, pedidos, pagos.

### Base de datos
Almacena la información de usuarios, productos, categorías, pedidos, pagos y domicilios.

---

# Funcionalidades iniciales

- Catálogo de productos
- Carrito de compras
- Gestión de pedidos
- Domicilios
- Gestión de clientes
- Panel administrativo
- Pagos por Nequi y efectivo


## Estado actual del proyecto

El proyecto se encuentra en una fase de desarrollo funcional, con backend y frontend integrados para los módulos principales definidos en este avance.

En esta entrega se amplió la base construida en el avance anterior, incorporando la gestión de productos, categorías, usuarios, credenciales, autenticación y panel administrativo. Además, se implementó el frontend con React, Vite, Tailwind CSS y Axios, conectado a la API desarrollada en NestJS.

## Avance de funcionalidades implementadas

### Backend

En el backend se completaron y probaron los módulos necesarios para la operación base del sistema:

* Módulo de autenticación, con inicio de sesión, registro y protección mediante JWT.
* Módulo de credenciales, con recuperación de contraseña, cambio de contraseña, activación, desactivación y cambio de rol.
* Módulo de usuarios, con consulta de perfil, actualización de datos y gestión administrativa.
* Módulo de productos, con creación, consulta, actualización, activación, desactivación lógica y visualización administrativa.
* Módulo de categorías, con creación, consulta, actualización, activación y desactivación lógica.
* Módulo de uploads, para subir imágenes de productos y fotos de perfil de usuario.
* Documentación de endpoints mediante Swagger.

Los endpoints públicos permiten consultar el catálogo de productos y categorías activas. Los endpoints administrativos están protegidos por token y rol de administrador.

### Frontend

En el frontend se implementó la interfaz web del sistema, con separación entre experiencia de cliente y panel administrativo.

#### Experiencia del cliente

El usuario puede:

* Consultar el catálogo de productos.
* Buscar productos por nombre.
* Filtrar productos por categoría.
* Ver productos con imagen, precio, unidad de medida, disponibilidad y estado de pedido.
* Registrarse como cliente con foto de perfil opcional.
* Iniciar sesión.
* Recuperar contraseña.
* Consultar y actualizar su perfil.
* Cambiar su foto de perfil.
* Cambiar su contraseña.
* Cerrar sesión de forma segura.

Cuando un usuario intenta comprar o pedir un producto, el sistema lo redirige al login si no ha iniciado sesión. El módulo de compra, carrito y pedidos queda definido para el siguiente ciclo de desarrollo.

#### Panel administrativo

El administrador puede acceder a un panel diferenciado y protegido por rol. Desde este panel puede gestionar:

**Productos**

* Listar productos activos e inactivos.
* Crear productos con imagen.
* Editar información del producto.
* Cambiar imagen del producto.
* Activar productos.
* Desactivar productos con borrado lógico.

**Categorías**

* Listar categorías activas e inactivas.
* Crear categorías.
* Editar categorías.
* Activar categorías.
* Desactivar categorías con borrado lógico.

**Usuarios**

* Listar usuarios registrados.
* Ver estado del perfil de usuario.
* Ver estado de la credencial.
* Activar y desactivar cuentas.
* Cambiar rol entre `CLIENT` y `ADMIN`.

## Integración entre frontend y backend

El frontend se comunica con el backend mediante Axios y consume los endpoints expuestos por la API REST. Las rutas protegidas utilizan el token JWT almacenado en el cliente para autorizar operaciones administrativas y funciones de usuario autenticado.

La integración se validó en los siguientes flujos:

* Registro de usuario con foto opcional.
* Login de cliente y administrador.
* Consulta del catálogo público.
* Filtrado de productos por categoría.
* Gestión de perfil del usuario.
* Subida de imágenes al backend.
* Creación y edición de productos con imagen.
* Activación y desactivación de productos.
* Gestión de categorías.
* Activación, desactivación y cambio de rol de usuarios.

## Gestión del repositorio

El proyecto se trabajó en GitHub utilizando ramas y commits descriptivos. Para este avance se usó la rama `developer`, donde se integraron los cambios del backend y del frontend de forma progresiva.

Se realizaron commits por funcionalidad, por ejemplo:

* Ingreso de Datos- entidades product & category
* Inicializar frontend con React Vite Tailwind y Axios
* Organizar estructura base del frontend
* Mostrar imagenes de productos desde el backend
* Agregar busqueda y filtro por categorias


## Funcionalidades pendientes para el siguiente avance

Para el siguiente ciclo de desarrollo se plantea implementar los módulos transaccionales del sistema:

* Carrito de compras.
* Detalle del carrito.
* Pedidos.
* Detalle de pedidos.
* Pagos.
* Domicilios.


Estos módulos permitirán completar el flujo de compra, desde la selección de productos hasta la entrega del pedido al cliente.

## URLs de prueba local

Backend:

```bash
http://localhost:3000/api
```

Documentación Swagger:

```bash
http://localhost:3000/api/docs
```

Frontend:

```bash
http://localhost:5173
```

## Usuario administrador de prueba

El sistema crea un usuario administrador inicial para probar las rutas protegidas:

```text
Celular: 3186844954
Contraseña: Admin1234*
Rol: ADMIN
```

## Conclusión del avance

En este avance se logró una integración funcional entre backend y frontend, cumpliendo con los módulos principales del MVP. El sistema ya permite la navegación del cliente, la autenticación, la gestión de perfil, la administración de productos, categorías y usuarios, así como la carga de imágenes.

El proyecto queda preparado para continuar con los módulos de carrito, pedidos, pagos y domicilios en la siguiente entrega.
