# 📝 MateCode — Proyecto Integrador M4 (FT77)

¡Bienvenido/a al repositorio de **MateCode**!

**MateCode** es una **Single Page Application (SPA)** desarrollada como Proyecto Integrador del Módulo 4 de Henry. La aplicación permite a usuarios autenticarse y gestionar sus propias tareas de manera persistente mediante **Firebase Authentication y Cloud Firestore**.

Además, incorpora el envío de un **resumen de tareas por correo electrónico utilizando AWS SES**, mediante una función serverless desplegada en Vercel.

El proyecto está desarrollado con **React + TypeScript + Vite**, aplicando separación de responsabilidades, rutas protegidas, persistencia en la nube, testing automatizado y variables de entorno para proteger información sensible.

---

## 🚀 Despliegue en Producción (Vercel)

La aplicación se encuentra desplegada y operativa en:

🌐 **URL Pública:**
https://proyecto-m4-juan-patricio-maydana-f.vercel.app

El proyecto está conectado a GitHub y Vercel realiza nuevos despliegues automáticamente cuando se actualiza la rama `main`.

---

## ✨ Características Destacadas

* **Registro e inicio de sesión:** autenticación mediante correo electrónico y contraseña.
* **Inicio de sesión con Google:** autenticación mediante OAuth utilizando Firebase Authentication.
* **Persistencia de sesión:** Firebase mantiene la sesión del usuario autenticado.
* **Rutas protegidas:** el Dashboard solamente puede ser utilizado por usuarios autenticados.
* **Gestión completa de tareas:** creación, edición, eliminación y cambio de estado.
* **Título obligatorio:** una tarea no puede crearse sin título.
* **Descripción opcional:** las tareas pueden incluir información adicional.
* **Persistencia en la nube:** las tareas se almacenan en Cloud Firestore.
* **Separación por usuario:** cada tarea queda asociada al `userId` del usuario autenticado.
* **Actualización en tiempo real:** Firestore permite mantener sincronizada la interfaz con los datos almacenados.
* **Estados de carga y errores:** la interfaz contempla situaciones de carga y errores durante las operaciones.
* **Resumen por correo:** permite enviar al usuario un resumen de sus tareas mediante AWS SES.
* **Feedback visual:** la aplicación informa al usuario cuando el resumen fue enviado correctamente o cuando ocurrió un error.
* **Diseño responsive:** interfaz adaptada a diferentes tamaños de pantalla.
* **Testing automatizado:** suite de pruebas desarrollada con Vitest y Testing Library.
* **Deploy continuo:** integración entre GitHub y Vercel.

---

## 🛠️ Tecnologías Utilizadas

### Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **React Router**
* **CSS3**

### Autenticación

* **Firebase Authentication**
* Email / Password
* Google OAuth

### Persistencia

* **Cloud Firestore**
* Firebase SDK

### Backend / Serverless

* **Vercel Serverless Functions**
* **AWS SES**
* `@aws-sdk/client-ses`

### Testing

* **Vitest**
* **Testing Library**
* **jsdom**

### Herramientas

* **Git**
* **GitHub**
* **Vercel**
* Variables de entorno

---

## 📂 Arquitectura del Proyecto


├── api/
│   └── send-email.ts             # Serverless Function para envío de correos mediante AWS SES
│
├── src/
│   ├── assets/                   # Recursos estáticos
│   │
│   ├── components/
│   │   ├── navbar.tsx            # Barra de navegación
│   │   └── todoForm.tsx          # Formulario de creación y edición de tareas
│   │
│   ├── context/
│   │   ├── AuthContext.context.ts # Definición del contexto de autenticación
│   │   └── AuthContext.tsx        # Provider y lógica de autenticación
│   │
│   ├── hooks/
│   │   └── useAuth.ts            # Hook para acceder al contexto de autenticación
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx         # Panel principal y gestión de tareas
│   │   ├── Login.tsx             # Inicio de sesión
│   │   └── Register.tsx          # Registro de usuarios
│   │
│   ├── routes/
│   │   └── ProtectedRoute.tsx    # Protección de rutas privadas
│   │
│   ├── services/
│   │   ├── firebase.ts           # Configuración e inicialización de Firebase
│   │   └── todoService.ts        # Suscripción y operaciones relacionadas con tareas
│   │
│   ├── types/
│   │   └── auth.ts               # Tipos relacionados con autenticación
│   │
│   ├── test/
│   │   ├── Dashboard.test.tsx
│   │   ├── ProtectedRoute.test.tsx
│   │   ├── todoForm.test.tsx
│   │   └── todoService.test.ts
│   │
│   ├── App.css                   # Estilos principales de la aplicación
│   ├── App.tsx                   # Configuración principal de la aplicación
│   ├── main.tsx                  # Punto de entrada
│   └── setupTests.ts             # Configuración de testing
│
├── .env                          # Variables de entorno locales (no versionado)
├── .env.example                  # Ejemplo de variables necesarias
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── vercel.json                   # Configuración de rutas SPA para Vercel
└── vite.config.ts

---

# 🔐 Autenticación

La autenticación se implementa mediante **Firebase Authentication**.

Los usuarios pueden:

* Registrarse utilizando correo electrónico y contraseña.
* Iniciar sesión utilizando correo electrónico y contraseña.
* Iniciar sesión mediante una cuenta de Google.
* Cerrar sesión.
* Mantener su sesión activa mediante la persistencia proporcionada por Firebase.

La lógica de autenticación se encuentra centralizada en `AuthContext.tsx` y es consumida mediante el hook personalizado `useAuth`.

La aplicación también utiliza `onAuthStateChanged` para detectar cambios en el estado de autenticación y mantener sincronizada la interfaz.

---

## 🔒 Rutas Protegidas

El Dashboard se encuentra protegido mediante:


src/routes/ProtectedRoute.tsx


Un usuario que no esté autenticado no puede acceder directamente a:


/dashboard


Si intenta acceder a una ruta privada sin sesión iniciada, es redirigido al inicio de sesión.

Esta protección también fue comprobada directamente en el entorno de producción de Vercel.

---

# 📋 Gestión de Tareas

Cada usuario dispone de su propio conjunto de tareas.

Una tarea contiene:

```text
title
description
completed
userId
```

### Operaciones disponibles

* Crear tarea.
* Editar tarea.
* Eliminar tarea.
* Marcar tarea como completada.
* Volver a marcarla como pendiente.
* Visualizar el estado actual.
* Visualizar la descripción cuando existe.

El título es obligatorio mientras que la descripción es opcional.

---

# ☁️ Persistencia con Cloud Firestore

Las tareas se almacenan en una colección:


todos


Cada documento contiene el identificador del usuario propietario:


userId


Esto permite asociar cada tarea con el usuario autenticado.

La aplicación utiliza una suscripción a Firestore para recibir automáticamente los cambios de las tareas y actualizar la interfaz.

---

## 🔐 Reglas de Seguridad de Firestore

Las reglas de Firestore restringen el acceso a las tareas de acuerdo con el usuario autenticado.

Las operaciones se permiten únicamente cuando el usuario autenticado coincide con el `userId` correspondiente a la tarea.

Esto evita que un usuario pueda consultar o modificar las tareas pertenecientes a otro usuario desde la aplicación.

---

# 📧 Envío de Resumen por Correo

MateCode incorpora una función para enviar al usuario un resumen de todas sus tareas.

El flujo es:

Usuario
   ↓
Dashboard
   ↓
POST /api/send-email
   ↓
Vercel Serverless Function
   ↓
AWS SES
   ↓
Correo electrónico del usuario


La función serverless se encuentra en:


api/send-email.ts


El frontend no se comunica directamente con AWS SES.

La función recibe:


to
todos


y genera un resumen que incluye:

* Cantidad total de tareas.
* Cantidad de tareas completadas.
* Cantidad de tareas pendientes.
* Detalle de las tareas y su estado.

Después utiliza AWS SES para realizar el envío.

---

## 🔐 Seguridad de AWS

Las credenciales y configuraciones sensibles de AWS se almacenan mediante variables de entorno.

No se incluyen claves privadas ni credenciales de AWS directamente en el código del frontend.

Las variables son utilizadas por la función serverless en el entorno de ejecución de Vercel.

---

# 🌐 Configuración de Vercel

El archivo:


vercel.json


se utiliza para permitir el funcionamiento correcto de las rutas de la SPA.

Esto permite que rutas como:


/login
/register
/dashboard


sean resueltas correctamente por la aplicación React incluso cuando el usuario accede directamente mediante la URL.

El proyecto se encuentra conectado a GitHub y Vercel realiza el despliegue automáticamente después de actualizar la rama `main`.

---

# ⚙️ Configuración e Instalación Local

## Prerrequisitos

* Node.js
* npm
* Una cuenta/proyecto de Firebase
* Configuración de Firebase Authentication
* Cloud Firestore
* Una cuenta/proyecto de AWS SES para el envío de correos

---

## 1. Clonar el repositorio


git clone https://github.com/jpatriciomaydana/Proyecto-M4_Juan-Patricio-Maydana_FT77.git


---

## 2. Instalar dependencias


npm install



## 3. Configurar variables de entorno

Copiar `.env.example` como `.env`:

cp .env.example .env


Luego completar las variables necesarias para Firebase y AWS.

> El archivo `.env` no debe subirse al repositorio.

---

## 4. Ejecutar el frontend


npm run dev

La aplicación estará disponible en la URL local indicada por Vite.

> El endpoint `/api/send-email` corresponde a una función serverless de Vercel. Por este motivo, el envío de correo fue validado principalmente en el entorno de producción de Vercel.

---

🧪 Testing Automatizado

El proyecto cuenta con una suite de pruebas desarrollada utilizando Vitest, Testing Library y jsdom.

Actualmente la suite contiene:

4 archivos de test y 15 pruebas aprobadas.

Test Files  4 passed (4)
Tests       15 passed (15)
Archivos testeados
Dashboard.test.tsx
ProtectedRoute.test.tsx
todoForm.test.tsx
todoService.test.ts

Las pruebas contemplan componentes, rutas protegidas, formulario y lógica relacionada con el servicio de tareas.

Tests de filtros de tareas

Como parte de las funcionalidades adicionales incorporadas al Dashboard, se agregaron pruebas específicas para verificar el sistema de filtros de tareas.

Los filtros disponibles son:

Todas: muestra todas las tareas.
Pendientes: muestra únicamente las tareas que todavía no fueron completadas.
Completadas: muestra únicamente las tareas que fueron completadas.

Los tests verifican que:

El filtro Todas muestre todas las tareas disponibles.
El filtro Pendientes muestre únicamente las tareas pendientes.
El filtro Completadas muestre únicamente las tareas completadas.

De esta manera, además de comprobar las funcionalidades principales de la aplicación, la suite también verifica el comportamiento del filtrado de tareas incorporado al Dashboard.

Resultado actual

La ejecución completa de la suite presenta:

Test Files  4 passed (4)
Tests       15 passed (15)

Todas las pruebas se encuentran aprobadas.

Ejecutar los tests

Para ejecutar la suite completa:

npm test

Para ejecutar los tests en modo watch:

npm run test:watch

---

# 🏗️ Build de Producción

El proyecto utiliza TypeScript y Vite para generar el build de producción.

Puede verificarse mediante:

npm run build

El build de producción fue ejecutado correctamente durante el desarrollo del proyecto.

---

# 🔎 Lint

Para ejecutar la comprobación de código:

npm run lint

--

# 🔑 Variables de Entorno

El proyecto utiliza variables de entorno para evitar almacenar información sensible directamente en el código.

El repositorio incluye:

.env.example

como referencia de las variables necesarias.

El archivo:

.env

se encuentra excluido mediante `.gitignore`.

Las variables utilizadas corresponden principalmente a:

### Firebase

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### AWS SES

```text
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SES_FROM_EMAIL

> Las variables reales no se incluyen en este README ni en el repositorio.


# 🤖 Declaración sobre el uso de Inteligencia Artificial

Durante el desarrollo de este Proyecto Integrador se utilizaron asistentes de Inteligencia Artificial como herramientas de apoyo técnico y aprendizaje.

La asistencia se utilizó principalmente para:

* Análisis y depuración de errores.
* Comprensión de conceptos de React y TypeScript.
* Revisión de arquitectura.
* Implementación y revisión de autenticación.
* Análisis de problemas relacionados con Firebase.
* Integración de AWS SES.
* Diseño y revisión de pruebas.
* Análisis de errores de despliegue.
* Revisión de configuración de Vercel.
* Documentación del proyecto.

> **Control y responsabilidad:** las soluciones desarrolladas con asistencia de IA fueron revisadas, ejecutadas y testeadas durante el desarrollo. El objetivo fue comprender el funcionamiento de cada parte de la aplicación y poder explicar las decisiones técnicas adoptadas.

---

# 📸 Evidencias

Durante el desarrollo se realizaron pruebas tanto en el entorno local como en producción.

Entre las funcionalidades verificadas se encuentran:

* Registro de usuarios.
* Login con email/password.
* Login mediante Google.
* Protección de `/dashboard`.
* Creación y edición de tareas.
* Persistencia en Firestore.
* Cambio de estado de tareas.
* Eliminación de tareas.
* Envío del resumen mediante AWS SES.
* Despliegue en Vercel.

En la carpeta screenshots se encuentran capturas de algunos ejemplos de prompts con la IA.


# 🚀 Flujo de Desarrollo

El proyecto utiliza Git y GitHub como sistema de control de versiones.

El flujo principal utilizado es:

```text
Desarrollo local
      ↓
Pruebas
      ↓
Git commit
      ↓
Git push
      ↓
GitHub
      ↓
Vercel
      ↓
Deploy automático

Esto permite mantener sincronizado el código fuente con el entorno de producción.

---

# 👤 Autor

**Juan Patricio Maydana**

Estudiante de Desarrollo Full Stack — FT77

Proyecto Integrador M4 — Henry


## 📝 Estado del proyecto

MateCode se encuentra desplegado en producción y cuenta con las funcionalidades principales requeridas para la gestión autenticada de tareas, persistencia en Firestore, envío de resúmenes mediante AWS SES, testing automatizado y protección de rutas.
