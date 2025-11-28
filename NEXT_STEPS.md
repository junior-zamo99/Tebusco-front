# Próximos Pasos - TEBUSCO Frontend

## Componentes Pendientes

### 1. Componentes de Visualización

- **professional-card**: Tarjeta para mostrar profesionales en listados
  - Foto de perfil
  - Nombre y categoría
  - Calificación y reseñas
  - Ubicación
  - Descuentos (si aplica)
  - Badge de plan (destacado, verificado, etc.)
  - Botón de contacto

- **category-card**: Tarjeta para mostrar categorías
  - Ícono de categoría
  - Nombre
  - Número de profesionales
  - Link a listado de profesionales

- **request-card**: Tarjeta para mostrar solicitudes
  - Título de la solicitud
  - Descripción breve
  - Ubicación
  - Fecha preferida
  - Presupuesto
  - Estado (abierta, en progreso, completada)
  - Número de ofertas recibidas

- **search-bar**: Barra de búsqueda avanzada
  - Búsqueda por palabra clave
  - Filtros por categoría
  - Filtros por ubicación
  - Filtros por rango de precio
  - Filtros por calificación

### 2. Páginas de la Aplicación

#### Categories Page
- Listado de todas las categorías
- Grid con tarjetas de categoría
- Búsqueda y filtrado
- Categorías destacadas

#### Category Detail Page
- Listado de profesionales de una categoría específica
- Filtros avanzados (ubicación, precio, calificación)
- Ordenamiento (más relevantes, mejor calificados, más cercanos)
- Mapa con ubicaciones
- Paginación

#### Professional Profile Page
- Información completa del profesional
- Galería de fotos
- Portfolio de trabajos
- Certificaciones
- Calificaciones y reseñas
- Información de contacto
- Disponibilidad
- Precios
- Botones de contacto (WhatsApp, teléfono, redes sociales)

#### Requests Page
- Listado de solicitudes públicas
- Filtros por categoría y ubicación
- Para profesionales: enviar ofertas
- Para solicitantes: ver ofertas recibidas

#### Create Request Page
- Formulario para crear solicitud
- Selección de categoría
- Descripción del problema
- Subir fotos
- Selección de ubicación (mapa)
- Fecha preferida
- Presupuesto estimado

#### Auth Pages
- **Login**: Inicio de sesión
- **Register**: Registro como solicitante
- **Professional Register**: Registro como profesional/empresa
  - Formulario extendido
  - Subir documentos (CV, carnet, selfie)
  - Selección de plan

#### Dashboard Pages
- **Solicitante Dashboard**:
  - Mis solicitudes
  - Profesionales guardados
  - Historial

- **Profesional Dashboard**:
  - Mis perfiles
  - Solicitudes recibidas
  - Ofertas enviadas
  - Estadísticas
  - Gestión de suscripción

### 3. Servicios (Angular Services)

- **AuthService**: Autenticación y gestión de sesión
- **UserService**: Gestión de usuarios
- **ProfessionalService**: Gestión de profesionales y perfiles
- **CategoryService**: Gestión de categorías
- **RequestService**: Gestión de solicitudes
- **OfferService**: Gestión de ofertas
- **SubscriptionService**: Gestión de suscripciones
- **LocationService**: Gestión de ubicaciones y mapas
- **NotificationService**: Notificaciones en tiempo real

### 4. Guards

- **AuthGuard**: Proteger rutas que requieren autenticación
- **RoleGuard**: Proteger rutas por rol (solicitante, profesional, empresa)
- **SubscriptionGuard**: Verificar suscripción activa para profesionales

### 5. Interceptors

- **AuthInterceptor**: Agregar token de autenticación a las peticiones
- **ErrorInterceptor**: Manejo centralizado de errores
- **LoadingInterceptor**: Mostrar indicador de carga

## Integraciones Necesarias

### Backend API
- Implementar servicio de backend (Node.js, Python, etc.)
- Diseñar y crear base de datos
- Endpoints RESTful o GraphQL
- Autenticación JWT

### Servicios Externos
- **Mapas**: Google Maps o Mapbox para ubicaciones
- **Almacenamiento**: AWS S3 o similar para fotos/documentos
- **Pagos**: Stripe o PayPal para suscripciones
- **Notificaciones**: Firebase Cloud Messaging o similar
- **Email**: SendGrid o similar para notificaciones por email

## Mejoras Futuras

1. **Chat en Tiempo Real**: Sistema de mensajería integrado
2. **Video Perfiles**: Permitir videos en perfiles profesionales
3. **Sistema de Reseñas**: Implementar sistema completo de calificaciones
4. **Analíticas**: Dashboard con estadísticas para profesionales
5. **App Móvil**: Versión nativa para iOS y Android
6. **Notificaciones Push**: Notificaciones en tiempo real
7. **Sistema de Referencias**: Programa de referidos
8. **Verificación en 2 Pasos**: Mayor seguridad

## Comandos Útiles

### Generar Componentes
```bash
cd src/app/components
ng generate component professional-card --standalone
ng generate component category-card --standalone
ng generate component request-card --standalone
ng generate component search-bar --standalone
```

### Generar Páginas
```bash
cd src/app/pages
ng generate component categories --standalone
ng generate component category-detail --standalone
ng generate component professional-profile --standalone
ng generate component requests --standalone
ng generate component create-request --standalone
```

### Generar Servicios
```bash
cd src/app/services
ng generate service auth
ng generate service user
ng generate service professional
ng generate service category
ng generate service request
```

## Notas de Desarrollo

- Mantener la arquitectura de componentes standalone
- Seguir la guía de estilo definida en `styles.css`
- Usar las clases de utilidad de Tailwind definidas
- Mantener la paleta de colores consistente
- Documentar componentes complejos
- Escribir tests unitarios para servicios críticos
- Optimizar imágenes antes de subir
- Implementar lazy loading en rutas
