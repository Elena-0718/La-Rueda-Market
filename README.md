# La Rueda Market

Plataforma web para la gestión de pedidos, abastecimiento programado y administración comercial de un supermercado rural ubicado en la vereda El Espinal, municipio de Los Santos, Santander.

El sistema busca mejorar el acceso de la comunidad a productos básicos y frescos mediante una solución tecnológica orientada a pedidos en línea, domicilios, control administrativo y gestión de proveedores.

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
Responsable de la lógica de negocio, autenticación, gestión de productos, pedidos, pagos y proveedores.

### Base de datos
Almacena la información de usuarios, productos, categorías, pedidos, pagos y domicilios.

---

# Funcionalidades iniciales

- Catálogo de productos
- Carrito de compras
- Gestión de pedidos
- Domicilios
- Gestión de clientes
- Gestión de proveedores
- Panel administrativo
- Pagos por Nequi y efectivo

---

# Estado del proyecto

Proyecto en fase inicial de arquitectura y desarrollo.

---
