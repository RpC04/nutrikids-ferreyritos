# NutriKids - Sistema Web de Nutrición Infantil

Plataforma web para gestionar recetas, actividades y registros de participantes en programas de nutrición infantil.

## Características

- **Página Pública**: Secciones dinámicas de recetas, actividades y formulario de registro
- **Panel Admin Protegido**: Gestión completa de contenido con CRUD
- **Base de Datos Flexible**: Soporta Supabase y Neon (PostgreSQL)
- **Autenticación Segura**: JWT con sesiones en cookies httpOnly
- **Selector de Fechas Global**: Cambiar fechas de eventos en toda la plataforma
- **Colores Personalizables**: Variables CSS para fácil personalización

## Estructura del Proyecto

```
/app
  /admin          # Rutas protegidas del panel admin
    /login        # Página de autenticación
    /dashboard    # Dashboard principal
    /recipes      # Gestión de recetas
    /activities   # Gestión de actividades
    /registrations # Visualización de registros
    /event-settings # Configuración de fechas
  /api            # API routes
    /auth         # Autenticación
    /recipes      # Recetas
    /activities   # Actividades
    /registrations # Registros
    /event-settings # Configuración de eventos
  
/components
  /admin          # Componentes del panel admin
  /public         # Componentes de la web pública
    /recipes
    /activities
    /registration

/lib
  /db             # Configuración de base de datos
    /types        # Tipos TypeScript
    /server-actions # Server actions para BD
    /client.ts    # Cliente DB flexible
  /auth           # Autenticación
    /session.ts   # Gestión de sesiones
    /actions.ts   # Server actions de auth
    /middleware.ts # Middleware de protección
  /constants.ts   # Constantes de la aplicación

/scripts
  /init-database.sql # Script de inicialización de BD
```

## Requisitos Previos

- Node.js 18+
- pnpm (recomendado) o npm
- Base de datos: Supabase o Neon (PostgreSQL)

## Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y configura:

```env
# Base de datos (Supabase)
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Autenticación
JWT_SECRET=tu_secreto_jwt_aleatorio
ADMIN_EMAIL=tu_email_admin@ejemplo.com

# Neon (opcional, alternativa a Supabase)
# DATABASE_URL=postgresql://user:password@host/database
```

## Instalación

1. **Instalar dependencias**:
```bash
pnpm install
```

2. **Configurar base de datos**:

Para **Supabase**:
- Crea una cuenta en supabase.com
- Crea un nuevo proyecto
- Copia las credenciales a `.env.local`
- Ejecuta el script SQL en el editor SQL de Supabase

Para **Neon**:
- Crea una cuenta en neon.tech
- Copia el DATABASE_URL a `.env.local`
- Ejecuta el script SQL usando tu cliente preferido

3. **Ejecutar migraciones**:
```bash
# Supabase - Ejecutar en el editor SQL del dashboard
# Copiar contenido de scripts/init-database.sql

# Neon - Usando psql o tu cliente SQL
psql $DATABASE_URL < scripts/init-database.sql
```

4. **Iniciar servidor de desarrollo**:
```bash
pnpm dev
```

Accede a http://localhost:3000

## Uso

### Página Pública
- **URL**: http://localhost:3000
- Visualiza recetas y actividades dinámicamente
- Registra participantes mediante el formulario

### Panel Admin
- **URL**: http://localhost:3000/admin/login
- **Email**: El que configuraste en ADMIN_EMAIL
- **Contraseña**: La que ingresaste en el primer login
- Gestiona recetas, actividades y fechas de eventos

## Colores Personalizables

Los colores están definidos como variables CSS en `app/globals.css`:

```css
--color-primary-orange: #FF8C42;    /* Naranja principal */
--color-primary-green: #4CAF50;     /* Verde principal */
--color-primary-teal: #00BCD4;      /* Teal/Cyan */
--color-light-bg: #FAFAFA;          /* Fondo claro */
--color-white: #FFFFFF;             /* Blanco */
```

Edita estos valores para cambiar la paleta de colores de toda la aplicación.

## Formulario de Registro

El formulario captura:
- Nombres y apellidos
- DNI
- Edad y sexo
- Celular y correo
- Jornada (mañana/tarde)
- Diagnóstico
- Cómo se enteró
- Comentarios adicionales

## Seguridad

- Las rutas `/admin/*` están protegidas con middleware de autenticación
- Las contraseñas se hashean con bcrypt
- Las sesiones se almacenan en cookies httpOnly
- Las credenciales de BD se usan solo en el servidor

## Soporte para Múltiples BD

La arquitectura está diseñada para funcionar con cualquier BD PostgreSQL:

1. Actualiza `lib/db/client.ts` con tu configuración
2. Ejecuta el script SQL en tu BD
3. Las funciones server-actions se adaptan automáticamente

## Próximos Pasos

1. Ejecuta la inicialización de BD
2. Accede al admin y crea usuario
3. Agrega recetas y actividades
4. Configura las fechas de eventos
5. Comparte la web pública con usuarios
