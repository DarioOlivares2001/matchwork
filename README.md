# MatchWork – Frontend Angular

MatchWork es una plataforma web que conecta profesionales con empresas mediante un sistema de coincidencia inteligente. Esta aplicación Angular actúa como cliente para consumir los microservicios del backend y entregar una experiencia fluida, moderna y centrada en el usuario.

## Tecnologías principales

- Angular 18 (standalone + SSR)
- Angular Router
- Bootstrap 5 (UI responsiva)
- AWS Amplify (Cognito para autenticación)
- RxJS
- JWT
- Vercel (despliegue)

## URL de producción

🔗 https://matchwork-wo14.vercel.app/

## Funcionalidades

### Profesionales
- Registro y login con AWS Cognito
- Edición de perfil profesional
- Subida de foto de perfil y currículum
- Vista de empleos según habilidades (matching)
- Postulación a ofertas
- Chat con empresas (en tiempo real)
- Videollamadas Jitsi

### Empresas
- Registro de empresa
- Publicación y edición de ofertas laborales
- Visualización de postulantes
- Acceso al perfil completo de cada postulante
- Comunicación por chat y videollamada

## Seguridad

- Login y registro gestionado vía AWS Cognito
- Tokens JWT guardados y enviados al API Gateway
- Acceso controlado según tipo de usuario: empresa o profesional

## Desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/DarioOlivares2001/matchwork.git
cd matchwork

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve


Pruebas

# Ejecutar pruebas unitarias
ng test

# Ejecutar pruebas end-to-end (si están configuradas)
ng e2e


src/
│
├── app/
│   ├── auth/              → Registro y login
│   ├── dashboard-empresa/ → Funcionalidades para empresas
│   ├── dashboard-profesional/ → Funcionalidades para profesionales
│   ├── services/          → Servicios API y auth
│   ├── shared/            → Componentes reutilizables
│
├── assets/
├── environments/
├── index.html
├── main.ts
└── styles.css


Despliegue

- Proyecto desplegado en Vercel

- Cada push a main dispara automáticamente una nueva build y redeploy

- La URL base del backend es manejada por variables de entorno y apunta al API Gateway en AWS