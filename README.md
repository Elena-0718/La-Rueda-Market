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

## Prueba de endpoints iniciales

La API se ejecuta localmente en:
http://localhost:3000/api

La documentación Swagger está disponible en:
http://localhost:3000/api/docs

Usuario administrador de prueba
Para probar rutas protegidas se crea automáticamente un usuario administrador inicial:
Celular: 3186844954
Contraseña: Admin123*
Rol: ADMIN

1. Verificar que la API está activa

Endpoint:

GET /api

Respuesta esperada:

La Rueda Market API 🚀

2. Iniciar sesión como administrador

Endpoint:

POST /api/auth/login

Body:

{
  "phone": "3186844954",
  "password": "Admin123*"
}

La respuesta devuelve un token.
En Swagger se debe hacer clic en Authorize y pegar únicamente el token, sin escribir la palabra Bearer.

3. Registrar un cliente

Endpoint:

POST /api/auth/sign-up

Body:

{
  "createCredentialDto": {
    "phone": "3186847856",
    "password": "Cliente123*",
    "confirmPassword": "Cliente123*"
  },
  "createUserDto": {
    "fullName": "Juan Lopez",
    "phone": "3186847856",
    "village": "Regadero",
    "birthDate": "1986-05-20"
  }
}
4. Iniciar sesión como cliente

Endpoint:

POST /api/auth/login

Body:

{
  "phone": "3186847856",
  "password": "Cliente123*"
}
5. Consultar usuarios registrados

Requiere token de administrador.

Endpoint:

GET /api/users/all

Instrucción:

Iniciar sesión como administrador.
Copiar el token.
Hacer clic en Authorize en Swagger.
Pegar el token.
Ejecutar el endpoint.

6. Consultar perfil autenticado

Requiere token.

Endpoint:

GET /api/users/my-profile

Este endpoint devuelve el perfil del usuario autenticado según el token enviado.

7. Actualizar perfil autenticado

Requiere token.

Endpoint:

PUT /api/users/update-my-profile

Body:

{
  "fullName": "Juan Lopez Actualizado",
  "phone": "3186847856",
  "village": "El Espinal",
  "birthDate": "1986-05-20"
}
8. Buscar usuario por UUID

Requiere token de administrador.

Endpoint:

GET /api/users/find/{uuid}

El {uuid} corresponde al identificador del usuario registrado.

9. Actualizar usuario como administrador

Requiere token de administrador.

Endpoint:

PUT /api/users/update/{uuid}

Body:

{
  "fullName": "Cliente Actualizado por Admin",
  "phone": "3186847856",
  "village": "Regadero",
  "birthDate": "1986-05-20",
  "isActive": true
}
10. Desactivar usuario

Requiere token de administrador.

Endpoint:

PUT /api/users/deactivate/{uuid}

Permite desactivar lógicamente el perfil de usuario.

11. Solicitar recuperación de contraseña

Endpoint:

POST /api/credentials/forgot-password

Body:

{
  "phone": "3186847856"
}

En esta fase académica, el código de recuperación se retorna en Swagger para simular el envío por SMS o WhatsApp.

12. Verificar código de recuperación

Endpoint:

POST /api/credentials/verify-reset-code

Body:

{
  "phone": "3186847856",
  "code": "123456"
}

El valor de code debe reemplazarse por el código generado en el paso anterior.

13. Restablecer contraseña

Endpoint:

PATCH /api/credentials/reset-password

Body:

{
  "phone": "3186847856",
  "code": "123456",
  "newPassword": "Nueva123*",
  "confirmNewPassword": "Nueva123*"
}
14. Consultar credenciales

Requiere token de administrador.

Endpoint:

GET /api/credentials/all

También se puede filtrar por celular:

GET /api/credentials/all?phone=3186847856
15. Consultar credencial por UUID

Requiere token de administrador.

Endpoint:

GET /api/credentials/{uuid}
16. Cambiar contraseña estando autenticado

Requiere token.

Endpoint:

PATCH /api/credentials/change-password/{uuid}

Body:

{
  "currentPassword": "Cliente123*",
  "newPassword": "Nueva123*",
  "confirmNewPassword": "Nueva123*"
}
17. Cambiar rol

Requiere token de administrador.

Endpoint:

PUT /api/credentials/change-role/{uuid}

Body:

{
  "role": "ADMIN"
}

Roles disponibles:

ADMIN
CLIENT
18. Desactivar cuenta

Requiere token.

Endpoint:

DELETE /api/credentials/deactivate/{uuid}

Permite desactivar una credencial y el perfil de usuario asociado.

19. Activar cuenta

Requiere token de administrador.

Endpoint:

PUT /api/credentials/activate/{uuid}

Permite reactivar una cuenta previamente desactivada.