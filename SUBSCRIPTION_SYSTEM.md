# Sistema de Suscripciones — Tebusco Frontend

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Modelos e Interfaces](#2-modelos-e-interfaces)
3. [Servicios](#3-servicios)
4. [Componentes y Páginas](#4-componentes-y-páginas)
5. [Rutas del Sistema](#5-rutas-del-sistema)
6. [Flujos de Usuario](#6-flujos-de-usuario)
7. [Sistema de Créditos](#7-sistema-de-créditos)
8. [Cupones y Descuentos](#8-cupones-y-descuentos)
9. [Extras (Paquetes Adicionales)](#9-extras-paquetes-adicionales)
10. [Guards y Validaciones de Navegación](#10-guards-y-validaciones-de-navegación)
11. [Persistencia y Estado](#11-persistencia-y-estado)
12. [Métodos de Pago](#12-métodos-de-pago)
13. [Manejo de Errores](#13-manejo-de-errores)
14. [Endpoints API](#14-endpoints-api)
15. [Mapa de Archivos](#15-mapa-de-archivos)

---

## 1. Visión General

El sistema de suscripciones de Tebusco permite a los **profesionales** registrarse, elegir un plan, realizar el pago y acceder a funcionalidades según su tier. Los **solicitantes** no tienen suscripción; el sistema está orientado exclusivamente al perfil profesional.

El flujo principal involucra:

- **Planes** — BASIC, PREMIUM, ENTERPRISE con intervalos de pago configurables.
- **Suscripciones** — Gestión del estado activo/cancelado/expirado del profesional.
- **Créditos** — Moneda interna que puede usarse como descuento en pagos.
- **Cupones** — Descuentos por código aplicables a planes, extras y anuncios.
- **Extras** — Paquetes adicionales (como cobertura por ciudad) comprables por separado.

---

## 2. Modelos e Interfaces

### 2.1 Plan

```typescript
// src/app/models/plan.model.ts

interface Plan {
  id: number;
  code: string;           // 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  name: string;
  description: string;
  status: string;
  intervals: PlanInterval[];
  createdAt: string;
  updatedAt: string;
}

interface PlanInterval {
  id: number;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalDisplay: string;
  pricePerPeriod: number;
  currency: string;
  daysPerPeriod: number;
  features: PlanFeature[];
}

interface PlanFeature {
  id: number;
  featureName: string;
  featureKey: string;     // 'offers' | 'categories'
  description: string;
  limitValue: number | null;
  isUnlimited: boolean;
}
```

**Planes disponibles:** BASIC, PREMIUM (recomendado), ENTERPRISE.
**Intervalos disponibles:** daily, weekly, monthly, yearly.
**Features principales:** `offers` (límite de ofertas) y `categories` (límite de categorías), ambos pueden ser `isUnlimited: true`.

---

### 2.2 Suscripción

```typescript
// src/app/models/subscription.model.ts  /  src/app/services/subscription.service.ts

interface Subscription {
  id: number;
  userId: number;
  planIntervalId: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  nextResetAt: string;
  autoRenew: boolean;
  plan: {
    id: number;
    name: string;
    interval: 'monthly' | 'yearly';
    price: number;
  };
  usages: SubscriptionUsage[];
}

interface SubscriptionUsage {
  id?: number;
  featureKey: 'offers' | 'categories';
  featureName: string;
  usedCount: number;
  currentLimit: number | null;
  isUnlimited: boolean;
  percentage?: number;
}

interface SubscriptionRequest {
  planId: number;
  professionalId: number;
}

interface CancelSubscriptionRequest {
  reason?: string;
}
```

**Estados de suscripción:**
| Estado | Descripción |
|--------|-------------|
| `active` | Suscripción activa y vigente |
| `cancelled` | Cancelada manualmente por el usuario |
| `expired` | Venció su fecha de fin |

---

### 2.3 Información de Suscripción en Perfil Completo

```typescript
// src/app/models/professional-complete.model.ts

interface SubscriptionInfo {
  id: number;
  planName: string;
  planCode: string;
  interval: string;            // 'monthly' | 'yearly'
  status: string;
  startDate: string;
  endDate: string;
  nextResetAt: string;
  currentPeriodNumber: number;
  periodsPurchased: number;
  autoRenew: boolean;
}

interface UsageInfo {
  categories: UsageDetail;
  offers: UsageDetail;
}

interface UsageDetail {
  limit: number | string;    // número o 'unlimited'
  used: number;
  available: number | string;
}

interface RegistrationStatus {
  isProfessional: boolean;
  status: 'pending' | 'approved' | 'rejected';
  currentStep: 'profile' | 'documents' | 'categories' | 'payment' | 'complete';
  canProceed: boolean;
  message: string;
  categoriesConfigured: number;
  hasActiveSubscription: boolean;
  documentsUploaded?: number;
  documentsRequired?: number;
}
```

---

### 2.4 Créditos

```typescript
// src/app/models/credit.model.ts

interface CreditBalance {
  availableCredits: number;
  currency: string;
  expiringCredits: number;
  nextExpirationDate: Date | null;
}

interface UserCredit {
  id: number;
  userId: number;
  totalCredits: number;
  availableCredits: number;
  usedCredits: number;
  currency: string;
  expiringCredits: number;
  nextExpirationDate: Date | null;
  nextExpirationAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreditTransaction {
  id: number;
  type: 'earned' | 'used' | 'expired' | 'refunded';
  amount: number;
  source: 'referral' | 'admin_grant' | 'promotion' | 'refund' | null;
  description: string;
  relatedTo: {
    type: 'referral' | 'subscription' | 'extra' | 'ad_subscription' | null;
    id: number;
    description: string;
  };
  expiresAt: Date | null;
  isExpired: boolean;
  createdAt: Date;
}

interface CreditStats {
  userId: number;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
  totalRefunded: number;
  currentBalance: number;
  currency: string;
  earnedBySource: {
    referral: number;
    adminGrant: number;
    promotion: number;
    refund: number;
  };
  usedByType: {
    subscriptions: number;
    extras: number;
    ads: number;
  };
}
```

---

### 2.5 Cupones

```typescript
// src/app/services/coupon.service.ts

interface CouponResponseDTO {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountPercent: number | null;
  maxDiscountAmount: number | null;
  appliesTo: 'plan' | 'extra' | 'ad';
  specificPlanIds: number[] | null;
  specificExtraIds: number[] | null;
  specificAdPlanIds: number[] | null;
  validFrom: Date | null;
  validUntil: Date | null;
  maxTotalUses: number | null;
  maxUsesPerUser: number | null;
  minPurchaseAmount: number | null;
  currency: string;
  restrictedToUserIds: number[] | null;
  isStackable: boolean;
  isActive: boolean;
  isReferralCoupon: boolean;
  referralType: string | null;
  timesUsed: number;
  totalDiscountGiven: number;
  usesRemaining: number | null;
}

interface CouponValidationResult {
  valid: boolean;
  coupon?: CouponResponseDTO;
  totalAmount?: number;
  totalDiscountAmount?: number;
  totalFinalAmount?: number;
  itemsDetail?: CouponItemDetail[];
  reason?: string;
  error?: string;
}

interface CouponValidationItem {
  type: 'plan' | 'extra' | 'ad';
  id: number;
  amount: number;
  quantity?: number;
}
```

---

### 2.6 Extras (Paquetes Adicionales)

```typescript
// src/app/services/extras.service.ts

interface ExtraFeature {
  id: number;
  name: string;
  key: string;               // 'extra_city_1' | 'extra_city_3' | 'national_visibility'
  displayName: string;
  isAccumulable: boolean;
}

interface ExtraPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  isActive: boolean;
  sortOrder: number;
  featureId: number;
  feature: ExtraFeature;
}

interface PurchasedExtra {
  id: number;
  subscriptionId: number;
  packageId: number;
  quantity: number;
  pricePaid: number;
  currency: string;
  status: string;
  purchasedAt: string;
  expiresAt: string;
}

type CityExtraType = 'single_city' | 'multi_city' | 'national';
```

---

## 3. Servicios

### 3.1 SubscriptionService

**Archivo:** `src/app/services/subscription.service.ts`
**Base URL:** `{environment.apiUrl}/subscriptions`

| Método | Descripción |
|--------|-------------|
| `getPaymentMethods()` | Retorna los métodos de pago activos |
| `createSubscription(planIntervalId, paymentMethodId, autoRenew, extras?, options?)` | Crea una nueva suscripción |
| `getMySubscription()` | Obtiene la suscripción activa del usuario autenticado |
| `getMySubscriptionUsage()` | Retorna el uso actual de features (categorías, ofertas) |
| `getMyTransactions()` | Lista las transacciones del usuario |
| `getSubscriptionById(id)` | Obtiene suscripción por ID |
| `cancelSubscription(id, reason?)` | Cancela la suscripción activa |

**Parámetros de `createSubscription`:**

```typescript
createSubscription(
  planIntervalId: number,
  paymentMethodId: number,
  autoRenew: boolean = true,
  extras?: { packageId: number; quantity: number }[],
  options?: {
    couponCode?: string;
    useCreditAmount?: number;
  }
)
```

---

### 3.2 PlansService

**Archivo:** `src/app/services/plans.service.ts`
**Base URL:** `{environment.apiUrl}/plans`

| Método | Descripción |
|--------|-------------|
| `loadActivePlans()` | Carga y cachea todos los planes activos |
| `getAllPlans()` | Retorna Observable con todos los planes |
| `getPlanById(id)` | Obtiene plan por ID desde caché |
| `getPlansByInterval(interval)` | Filtra planes por intervalo |
| `getPlanIntervalById(planIntervalId)` | Obtiene un interval específico |
| `findPlanByFeature(featureKey, isUnlimited)` | Busca planes por característica |

Los planes se cachean en un `BehaviorSubject` al hacer `loadActivePlans()`, evitando llamadas repetidas al servidor.

---

### 3.3 CreditService

**Archivo:** `src/app/services/credit.service.ts`
**Base URL:** `{environment.apiUrl}/credits`

| Método | Descripción |
|--------|-------------|
| `getMyBalance()` | Retorna el balance disponible y créditos por expirar |
| `getMyCredit()` | Retorna información completa del objeto crédito del usuario |
| `getMyTransactions(filters?)` | Historial paginado de transacciones de créditos |
| `getMyStats()` | Estadísticas detalladas de uso de créditos |
| `validateCredit(amount)` | Verifica si el usuario puede usar N créditos |

**Filtros disponibles para `getMyTransactions`:**

```typescript
interface CreditTransactionFilters {
  page?: number;
  limit?: number;
  type?: 'earned' | 'used' | 'expired' | 'refunded';
  source?: 'referral' | 'admin_grant' | 'promotion' | 'refund';
  dateFrom?: string;
  dateTo?: string;
  isExpired?: boolean;
}
```

---

### 3.4 CouponService

**Archivo:** `src/app/services/coupon.service.ts`
**Base URL:** `{environment.apiUrl}/coupons`

| Método | Descripción |
|--------|-------------|
| `validateCoupon(code, items, totalAmount)` | Valida un cupón contra los items del carrito |
| `getCouponPublicInfo(code)` | Obtiene información pública de un cupón |
| `calculateDiscountPercentage(original, discount)` | Utilidad para calcular % de descuento |
| `formatDiscountDisplay(coupon)` | Formatea la representación del descuento |

---

### 3.5 ExtrasService

**Archivo:** `src/app/services/extras.service.ts`
**Base URL:** `{environment.apiUrl}/extras`

| Método | Descripción |
|--------|-------------|
| `getPackages()` | Lista paquetes extras disponibles |
| `purchasePackage(data)` | Compra un paquete extra |
| `selectCities(purchasedExtraId, cityIds)` | Asigna ciudades a un extra comprado |
| `selectNational(purchasedExtraId, countryId)` | Asigna cobertura nacional |
| `getCoverage()` | Retorna cobertura actual del profesional |
| `getAvailableCities()` | Lista ciudades disponibles para seleccionar |
| `getPendingExtras()` | Extras comprados pendientes de configurar |
| `isCityExtra(pkg)` | Utilidad: determina si un paquete es de tipo City Extra |
| `getCityExtraType(pkg)` | Retorna el tipo de city extra |
| `calculateExtrasTotal(extras)` | Suma el precio total de los extras seleccionados |

---

### 3.6 ProfessionalUpgradeStateService

**Archivo:** `src/app/services/professional-upgrade-state.service.ts`

Gestiona el estado del flujo de conversión de usuario normal a profesional. Persiste en `localStorage`.

| Método | Descripción |
|--------|-------------|
| `getState()` | Observable del estado completo |
| `getCurrentState()` | Valor sincrónico del estado |
| `setProfessional(professional)` | Guarda datos del paso 1 |
| `setDocumentsCompleted()` | Marca paso 2 como completo |
| `setSelectedPlan(plan)` | Guarda el plan elegido |
| `setSubscriptionConfirmed()` | Marca el pago como confirmado |
| `setSelectedCategories(categories)` | Guarda categorías elegidas |
| `setCategoriesConfigured()` | Marca configuración de categorías lista |
| `isStepCompleted(step)` | Verifica si un paso está completo |
| `canAccessStep(step)` | Verifica si el usuario puede navegar a ese paso |
| `getNextStep()` | Calcula el siguiente paso disponible |
| `resetState()` | Limpia el estado de upgrade |
| `completeUpgrade()` | Finaliza el flujo |

---

## 4. Componentes y Páginas

### 4.1 Flujo de Upgrade Profesional

**Ruta base:** `src/app/components/professional-upgrade/`

| Paso | Componente | Descripción |
|------|-----------|-------------|
| 1 | `step-1-professional-info` | Información personal y profesional |
| 2 | `step-2-documents` | Carga de documentos requeridos |
| 3 | `step-3-select-plan` | Selección de plan (BASIC/PREMIUM/ENTERPRISE) e intervalo |
| 4 | `step-4-confirm-subscription` | Confirmación, acepta términos y procesa pago |
| 5 | `step-5-select-categories` | Selección de categorías de especialización |
| 6 | `step-6-configure-categories` | Portfolio, certificados, CV por categoría |

El paso 3 muestra los planes agrupados por tipo y permite elegir el intervalo de duración. Por defecto se resalta PREMIUM.

El paso 4 calcula automáticamente `fechaFin = hoy + daysPerPeriod` y llama a `subscriptionService.createSubscription()`.

---

### 4.2 Página de Planes

**Archivo:** `src/app/pages/professional/plans/professional-plans.component.ts`

- Carga todos los planes via `PlansService`.
- Detecta los intervalos disponibles y selecciona `monthly` por defecto.
- Muestra ahorros comparativos entre intervalos.
- Opcionalmente presenta la sección de Extras antes del checkout.
- Al continuar, guarda `planIntervalId` en `localStorage` y navega a `/professional/payment`.

---

### 4.3 Página de Pago

**Archivo:** `src/app/pages/professional/payment/professional-payment.component.ts`

Recibe `planIntervalId` via `queryParams`. Orquesta todos los elementos del checkout:

1. Carga el intervalo del plan desde `PlansService`.
2. Carga métodos de pago desde `SubscriptionService`.
3. Carga extras seleccionados desde `localStorage`.
4. Permite aplicar cupón (`CouponService.validateCoupon`).
5. Permite usar créditos (`CreditService.validateCredit` + `ApplyCreditWidget`).
6. Toggle de autoRenew.
7. Acepta términos y condiciones.
8. Al confirmar llama `subscriptionService.createSubscription(...)`.

**Cálculo del total:**

```
subtotal       = precioDelPlan + totalExtras
discountAmount = descuentoAplicadoPorCupón
totalPrice     = subtotal - discountAmount
newTotal       = totalPrice - creditosUsados
```

---

### 4.4 Página de Pago Exitoso

**Archivo:** `src/app/pages/professional/payment-success/professional-payment-success.component.ts`

- Muestra confirmación visual del pago.
- Recarga los datos actualizados del profesional.
- Actualiza el estado en `AuthService` y `StorageService`.
- Redirige a `/professional/dashboard`.

---

### 4.5 Componente de Suscripción en Perfil

**Archivo:** `src/app/components/profile-subscription-component/profile-subscription-component.ts`

Recibe `@Input() data: ProfessionalCompleteData` y muestra:

- Plan actual con estado visual (active/cancelled/expired).
- Días restantes hasta el vencimiento.
- Barra de progreso de uso de **categorías** y **ofertas**.
- Tabla de últimas transacciones de facturación.
- Información de renovación automática.

---

### 4.6 Componente de Balance de Créditos (Widget)

**Archivo:** `src/app/components/credit-balance-widget/credit-balance-widget.component.ts`

- Muestra el balance disponible.
- Alerta visual si hay créditos próximos a expirar (umbral: 30 días).
- Color rojo si expiran hoy.
- Tooltip con detalles.
- Método `refresh()` para actualizar manualmente.

---

### 4.7 Componente Aplicar Créditos (Widget)

**Archivo:** `src/app/components/apply-credit-widget/apply-credit-widget.component.ts`

Integrado dentro de la página de pago.

- `@Input() totalAmount: number` — total sobre el que se puede aplicar crédito.
- Checkbox para activar/desactivar uso de créditos.
- Input numérico para cantidad a usar.
- Botones rápidos: Todo, 75%, 50%, 25%.
- Valida localmente (no superar balance) y en servidor (`validateCredit`).
- Emite `@Output() creditApplied: EventEmitter<number>`.
- Emite `@Output() creditRemoved: EventEmitter<void>`.

---

### 4.8 Página Mis Créditos

**Archivo:** `src/app/pages/my-credits/my-credits.component.ts`

- Balance disponible y créditos por expirar.
- Alerta con severidad según días hasta expiración:
  - `info` — más de 7 días
  - `warning` — entre 3 y 7 días
  - `danger` — menos de 3 días
- Estadísticas: ganados, usados, expirados, reembolsados.
- Botones de navegación a historial y estadísticas.
- Estado vacío si el usuario no tiene créditos.

---

### 4.9 Historial de Créditos

**Archivo:** `src/app/pages/my-credits/credit-history/credit-history.component.ts`

- Tabla paginada (10 transacciones por página).
- Icono y color según tipo: `earned` (verde +), `used` (rojo −), `expired` (gris), `refunded` (azul +).
- Filtros:
  - Por tipo: earned / used / expired / refunded
  - Por fuente: referral / admin_grant / promotion
  - Por rango de fechas (predefinido: hoy, 7d, 30d, 90d — o custom)
- Scroll to top automático al paginar.

---

### 4.10 Compra de Extras

**Archivo:** `src/app/pages/extras/purchase/purchase.component.ts`

- Carga el paquete extra por ID (desde ruta `/extras/purchase/:id`).
- Carga métodos de pago.
- Input de cantidad.
- Si el extra es un **City Extra**, detecta el tipo y redirige:
  - `nextStep === 'select_cities'` → `/extras/select-cities/:purchasedExtraId`
  - `nextStep === 'select_country'` → `/extras/select-national/:purchasedExtraId`

---

## 5. Rutas del Sistema

### 5.1 Flujo Profesional

| Ruta | Descripción |
|------|-------------|
| `/professional/upgrade` | Inicio del flujo de upgrade |
| `/professional/documents` | Paso 2: Subir documentos |
| `/professional/plans` | Paso 3: Seleccionar plan |
| `/professional/payment` | Paso 4: Procesar pago |
| `/professional/categories` | Paso 5: Seleccionar categorías |
| `/professional/complete` | Paso 6: Completar registro |
| `/professional/payment-success` | Confirmación de pago exitoso |
| `/professional/profile/subscription` | Ver detalle de suscripción activa |

### 5.2 Créditos

| Ruta | Descripción |
|------|-------------|
| `/my-credits` | Balance, resumen y estadísticas |
| `/my-credits/history` | Historial paginado de transacciones |
| `/my-credits/stats` | Estadísticas detalladas |

### 5.3 Extras

| Ruta | Descripción |
|------|-------------|
| `/extras` | Listar paquetes extras disponibles |
| `/extras/purchase/:id` | Comprar un paquete extra |
| `/extras/select-cities/:id` | Seleccionar ciudades para City Extra |
| `/extras/select-national/:id` | Seleccionar cobertura nacional |
| `/extras/coverage` | Ver cobertura actual del profesional |

---

## 6. Flujos de Usuario

### 6.1 Flujo de Suscripción Inicial (Profesional Nuevo)

```
Usuario no profesional visita /professional/upgrade
    ↓
Step 1 — Información personal y profesional
    ↓
Step 2 — Carga de documentos requeridos
    ↓
Step 3 — Selecciona plan (BASIC / PREMIUM / ENTERPRISE)
         Elige intervalo: daily / weekly / monthly / yearly
    ↓
Step 4 — Confirma suscripción
         Calcula fechas (hoy + daysPerPeriod)
         Acepta términos
         Llama createSubscription()
    ↓
Step 5 — Selecciona categorías de especialización
    ↓
Step 6 — Configura cada categoría
         (portfolio, certificados, CV, descripción)
    ↓
Redirección a /professional/dashboard
```

### 6.2 Flujo de Pago desde Página de Planes

```
/professional/plans
    ↓
Usuario selecciona plan e intervalo
Extras opcionales guardados en localStorage
    ↓
Navega a /professional/payment?planIntervalId=XX
    ↓
Página de pago carga:
  - Detalles del plan seleccionado
  - Métodos de pago disponibles
  - Extras del localStorage
    ↓
Usuario configura:
  - Método de pago
  - Cupón (opcional)
  - Créditos a usar (opcional)
  - autoRenew on/off
  - Acepta términos
    ↓
Confirma pago → createSubscription(...)
    ↓
Éxito: /professional/payment-success → /professional/dashboard
Error: muestra mensaje según código de error
```

### 6.3 Flujo de Aplicación de Cupón

```
Usuario ingresa código en /professional/payment
    ↓
validateCoupon(code, items, totalAmount)
  items = [
    { type: 'plan', id: planIntervalId, amount: planPrice },
    { type: 'extra', id: packageId, amount: extraPrice, quantity: qty }
  ]
    ↓
Backend verifica:
  - Código activo y no expirado
  - Dentro del límite de usos (global y por usuario)
  - Aplica a los items seleccionados
  - Respeta minPurchaseAmount
  - Aplica tope de descuento máximo
    ↓
UI actualiza:
  - Muestra descuento aplicado ($ o %)
  - Recalcula total final
```

### 6.4 Flujo de Uso de Créditos

```
Usuario activa "Usar créditos" en /professional/payment
    ↓
ApplyCreditWidget carga balance: getMyBalance()
    ↓
Usuario elige monto (manual o quick button: 25%/50%/75%/Todo)
    ↓
validateCredit(amount) — verificación en servidor
    ↓
Si válido:
  - Emite creditApplied(amount)
  - UI descuenta del total: newTotal = totalPrice - credits
    ↓
Al confirmar pago:
  - options.useCreditAmount = amount enviado al backend
  - Backend deduce del balance del usuario
```

### 6.5 Flujo de City Extras

```
/extras → Usuario selecciona paquete con feature 'extra_city_1' o 'extra_city_3'
    ↓
/extras/purchase/:id
  - Compra el paquete via purchasePackage(data)
  - Backend responde con cityExtraInfo
    ↓
cityExtraInfo.nextStep === 'select_cities'
  → Redirige a /extras/select-cities/:purchasedExtraId?max=N&type=Y
    ↓
Usuario selecciona ciudades (máx = 1 o 3)
  → extrasService.selectCities(purchasedExtraId, cityIds)
    ↓
Para cobertura nacional (feature 'national_visibility'):
  → /extras/select-national/:purchasedExtraId
  → extrasService.selectNational(purchasedExtraId, countryId)
```

---

## 7. Sistema de Créditos

Los créditos son una moneda interna de Tebusco.

### 7.1 Formas de obtener créditos

| Fuente (`source`) | Descripción |
|-------------------|-------------|
| `referral` | Invitar a otro usuario que se registra |
| `admin_grant` | Asignados manualmente por un administrador |
| `promotion` | Campañas o promociones activas |
| `refund` | Reembolso de una compra anterior |

### 7.2 Formas de usar créditos

| Destino (`relatedTo.type`) | Descripción |
|---------------------------|-------------|
| `subscription` | Descuento en suscripción de plan |
| `extra` | Descuento en compra de extras |
| `ad_subscription` | Descuento en publicidad |

### 7.3 Expiración

- Los créditos pueden tener fecha de expiración (`expiresAt`).
- El widget y la página muestran alertas según urgencia (info / warning / danger).
- Las transacciones tipo `expired` registran los créditos que se perdieron.

---

## 8. Cupones y Descuentos

### 8.1 Tipos de descuento

| Tipo (`discountType`) | Descripción |
|-----------------------|-------------|
| `percentage` | Descuento porcentual sobre el monto |
| `fixed` | Descuento de monto fijo |

### 8.2 Aplicabilidad

Los cupones pueden aplicarse a:
- `plan` — Planes de suscripción (con opción a IDs específicos en `specificPlanIds`)
- `extra` — Paquetes extras (`specificExtraIds`)
- `ad` — Publicidad (`specificAdPlanIds`)

### 8.3 Restricciones configurables

- `validFrom` / `validUntil` — Rango de fechas válidas
- `maxTotalUses` — Límite global de usos
- `maxUsesPerUser` — Límite por usuario
- `minPurchaseAmount` — Monto mínimo de compra requerido
- `restrictedToUserIds` — Solo ciertos usuarios pueden usarlo
- `isStackable` — Si puede combinarse con otros cupones

### 8.4 Cupones de referido

Los cupones marcados `isReferralCoupon: true` están vinculados al sistema de referidos. Se generan automáticamente y tienen `referralType` para identificar su origen.

---

## 9. Extras (Paquetes Adicionales)

Los extras son paquetes comprables por separado que amplían las capacidades del profesional más allá de su plan base.

### 9.1 Tipos de extras

| Feature Key | Descripción |
|-------------|-------------|
| `extra_city_1` | Visibilidad en 1 ciudad adicional |
| `extra_city_3` | Visibilidad en hasta 3 ciudades adicionales |
| `national_visibility` | Cobertura nacional completa |

### 9.2 City Extras

Son un tipo especial de extra que requiere una configuración posterior a la compra:

1. El usuario compra el extra.
2. El backend responde con `cityExtraInfo` indicando el siguiente paso.
3. El usuario selecciona las ciudades (o país) en una pantalla dedicada.
4. El extra queda activo con la cobertura configurada.

### 9.3 Extras acumulables

Si `isAccumulable: true`, el usuario puede comprar múltiples unidades del mismo extra.

---

## 10. Guards y Validaciones de Navegación

### 10.1 ProfessionalUpgradeGuard

**Archivo:** `src/app/guards/professional-upgrade.guard.ts`

- Permite el acceso a `/professional/upgrade` solo si el usuario **no** es profesional activo.
- Si ya es profesional activo, redirige a `/professional/dashboard`.

### 10.2 UpgradeStepGuard

**Archivo:** `src/app/guards/upgradeStep.guard.ts`

Protege cada paso del flujo de upgrade. Solo permite avanzar si el paso anterior fue completado.

| Ruta | Paso |
|------|------|
| `/professional/info` | 1 |
| `/professional/documents` | 2 |
| `/professional/plan` | 3 |
| `/professional/confirm` | 4 |
| `/professional/categories` | 5 |
| `/professional/configure` | 6 |
| `/professional/complete` | 7 |

El paso 1 siempre es accesible. Si el usuario intenta acceder a un paso sin completar los anteriores, es redirigido al primer paso pendiente.

---

## 11. Persistencia y Estado

### 11.1 localStorage

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `selectedPlanIntervalId` | `number` | ID del intervalo de plan seleccionado |
| `selectedExtras` | `SelectedExtra[]` (JSON) | Extras añadidos antes del checkout |
| `professional_upgrade_state` | `UpgradeState` (JSON) | Estado completo del flujo de upgrade |
| `current_view` | `'pl'` \| `'ap'` | Vista activa: profesional o solicitante |

### 11.2 BehaviorSubjects en servicios

| Servicio | Subject | Descripción |
|---------|---------|-------------|
| `PlansService` | `plansCache$` | Caché de planes para evitar requests repetidos |
| `ProfessionalUpgradeStateService` | `upgradeState$` | Estado reactivo del flujo de upgrade |

### 11.3 AuthService / StorageService

Tras un pago exitoso se llama a `updateProfessionalState()` para refrescar los datos del usuario en toda la aplicación.

---

## 12. Métodos de Pago

Los métodos de pago son cargados dinámicamente desde el backend (`GET /subscriptions/payment-methods`).

| Tipo (`type`) | Descripción |
|---------------|-------------|
| `card` | Tarjeta de crédito o débito |
| `qr` | Pago mediante código QR |
| `mobile_payment` | Pago por billetera móvil |

- El primer método con `isActive: true` se selecciona automáticamente.
- El procesamiento del pago es delegado completamente al backend; no hay integración directa con Stripe u otro gateway en el frontend.

---

## 13. Manejo de Errores

### 13.1 Errores en el proceso de pago

| Código de Error | Descripción |
|----------------|-------------|
| `SUBSCRIPTION_ALREADY_EXISTS` | El usuario ya tiene una suscripción activa |
| `INVALID_PLAN_INTERVAL` | El ID de intervalo de plan no es válido |
| `PAYMENT_FAILED` | El pago fue rechazado o falló |
| `INVALID_COUPON` | El cupón no es válido o está expirado |

### 13.2 Errores en cupones

- Código vacío → validación local
- Cupón inactivo, expirado o sin usos → `valid: false` con `reason`
- No aplica a los items del carrito → `valid: false`
- No cumple `minPurchaseAmount` → `valid: false`

### 13.3 Errores en créditos

- Saldo insuficiente → validación local + servidor
- Monto solicitado mayor al total → validación local
- Créditos expirados no contabilizan → reflejado en balance

---

## 14. Endpoints API

### Suscripciones

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `GET` | `/subscriptions/payment-methods` | Métodos de pago disponibles |
| `POST` | `/subscriptions` | Crear nueva suscripción |
| `GET` | `/subscriptions/me` | Suscripción activa del usuario |
| `GET` | `/subscriptions/me/usage` | Uso de features (ofertas/categorías) |
| `GET` | `/subscriptions/me/transactions` | Historial de transacciones |
| `GET` | `/subscriptions/:id` | Suscripción por ID |
| `POST` | `/subscriptions/:id/cancel` | Cancelar suscripción |

### Planes

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `GET` | `/plans` | Todos los planes activos con sus intervals |

### Créditos

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `GET` | `/credits/me/balance` | Balance disponible |
| `GET` | `/credits/me` | Información completa del crédito |
| `GET` | `/credits/me/transactions` | Historial paginado (con filtros) |
| `GET` | `/credits/me/stats` | Estadísticas por tipo y fuente |
| `POST` | `/credits/validate` | Validar si se puede usar N créditos |

### Cupones

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `POST` | `/coupons/validate` | Validar cupón con items y montos |
| `GET` | `/coupons/public/:code` | Información pública de un cupón |

### Extras

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `GET` | `/extras/packages` | Paquetes extras disponibles |
| `POST` | `/extras/purchase` | Comprar un paquete extra |
| `POST` | `/extras/city/select-cities` | Seleccionar ciudades para city extra |
| `POST` | `/extras/city/select-national` | Asignar cobertura nacional |
| `GET` | `/extras/city/coverage` | Cobertura actual del profesional |
| `GET` | `/extras/city/available` | Ciudades disponibles |
| `GET` | `/extras/city/pending` | Extras pendientes de configurar |

---

## 15. Mapa de Archivos

```
src/app/
│
├── models/
│   ├── subscription.model.ts          — Interfaces Subscription, SubscriptionUsage
│   ├── plan.model.ts                  — Interfaces Plan, PlanInterval, PlanFeature
│   ├── credit.model.ts                — Interfaces CreditBalance, CreditTransaction, CreditStats
│   └── professional-complete.model.ts — RegistrationStatus, SubscriptionInfo, UsageInfo
│
├── services/
│   ├── subscription.service.ts        — CRUD suscripciones + métodos de pago
│   ├── plans.service.ts               — Carga y caché de planes
│   ├── credit.service.ts              — Balance, historial y validación de créditos
│   ├── coupon.service.ts              — Validación de cupones
│   ├── extras.service.ts              — Paquetes extras y city extras
│   └── professional-upgrade-state.service.ts — Estado del flujo de upgrade
│
├── components/
│   ├── professional-upgrade/
│   │   ├── step-1-professional-info/
│   │   ├── step-2-documents/
│   │   ├── step-3-select-plan/
│   │   ├── step-4-confirm-subscription/
│   │   ├── step-5-select-categories/
│   │   └── step-6-configure-categories/
│   ├── profile-subscription-component/ — Vista de suscripción activa en perfil
│   ├── credit-balance-widget/          — Widget de balance de créditos
│   ├── apply-credit-widget/            — Widget para aplicar créditos en pago
│   └── plan-section/                   — Componente reutilizable de planes
│
├── pages/
│   ├── professional/
│   │   ├── plans/                      — Selección de plan
│   │   ├── payment/                    — Checkout y procesamiento de pago
│   │   └── payment-success/            — Confirmación de pago
│   ├── professional-profile/
│   │   └── subscription/               — Detalle de suscripción en perfil
│   ├── my-credits/
│   │   ├── my-credits.component.ts     — Balance y resumen de créditos
│   │   └── credit-history/             — Historial paginado de créditos
│   └── extras/
│       ├── purchase/                   — Compra de un extra
│       ├── select-cities/              — Selección de ciudades (city extra)
│       ├── select-national/            — Selección de cobertura nacional
│       └── city-coverage/              — Vista de cobertura actual
│
└── guards/
    ├── professional-upgrade.guard.ts   — Bloquea acceso si ya es profesional activo
    └── upgradeStep.guard.ts            — Valida orden de pasos en el upgrade
```
