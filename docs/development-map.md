# Mapa de Desarrollo

## 1. Resumen

Este documento consolida el estado actual del proyecto `food-commerce-api` con:

- Estructura de carpetas
- Modulos utilizados
- Organizacion interna por modulo
- Script SQL de tablas comprometidas y constraints
- Dependencias necesarias para levantar el proyecto

## 2. Estructura General del Proyecto

```text
food-commerce-api/
├── certs/
├── contracts/
├── dist/
├── migrations/
├── node_modules/
├── src/
├── test/
├── .env
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── tsconfig.build.json
```

## 3. Estructura Principal de `src`

```text
src/
├── common/
├── infrastructure/
├── modules/
├── security/
├── app.module.ts
└── main.ts
```

## 4. Modulos Cargados en AppModule

El archivo principal [`app.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/app.module.ts#L1) registra:

- `AuthModule`
- `CatalogModule`
- `ProductsModule`
- `InventoryModule`
- `CartModule`
- `OrdersModule`
- `CustomersModule`
- `LoyaltyModule`
- `ThrottlerModule`

Tambien aplica guards globales:

- `ThrottlerGuard`
- `JwtAuthGuard`
- `OptionalJwtAuthGuard`

## 5. Estructura de Modulos

### 5.1 Patron general observado

La mayoria de modulos siguen una estructura similar:

```text
modules/<modulo>/
├── admin/
├── api/
├── application/
├── domain/
├── infrastructure/
└── <modulo>.module.ts
```

Excepciones:

- `auth/` incluye ademas `constants/`, `dto/`, `interface/`
- `pricing/` usa `application/`, `constants/`, `domain/`

### 5.2 Modulos detectados

| Modulo | Estructura interna | Rol principal |
|---|---|---|
| `auth` | `api`, `application`, `constants`, `domain`, `dto`, `infrastructure`, `interface` | Autenticacion, sesiones, login email/OAuth |
| `cart` | `api`, `application`, `domain`, `infrastructure` | Carrito de compras |
| `catalog` | `admin`, `api`, `application`, `domain`, `infrastructure` | Catalogos |
| `customers` | `admin`, `api`, `application`, `domain`, `infrastructure` | Clientes |
| `inventory` | `admin`, `api`, `application`, `domain`, `infrastructure` | Inventario |
| `loyalty` | `admin`, `api`, `application`, `domain`, `infrastructure` | Fidelizacion / puntos |
| `orders` | `admin`, `api`, `application`, `domain`, `infrastructure` | Ordenes |
| `pricing` | `application`, `constants`, `domain` | Motor de pricing |
| `products` | `admin`, `api`, `application`, `domain`, `infrastructure` | Productos |

## 6. Mapa por Modulo

### AuthModule

Archivo: [`auth.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/auth/auth.module.ts#L1)

- Importa:
  - `JwtModule`
  - `CustomersModule`
  - `CartModule`
- Controllers:
  - `AuthController`
- Providers principales:
  - `AuthService`
  - `SessionService`
  - `SignupEmailUseCase`
  - `LoginEmailUseCase`
  - `LoginOAuthUseCase`
  - `RefreshSessionUseCase`
  - `LogoutUseCase`
  - `OAuthProviderFactory`
  - `GoogleOAuthProvider`
  - `FacebookOAuthProvider`
  - `AppleOAuthProvider`
  - `JwtStrategy`
- Adaptadores/Repositorios:
  - `PostgresUserRepository`
  - `PostgresAuthIdentityRepository`
  - `PostgresSessionRepository`
  - `BcryptPasswordHasher`

Estructura interna relevante:

```text
modules/auth/
├── api/
│   ├── dto/
│   └── auth.controller.ts
├── application/
│   ├── ports/
│   │   └── password-hasher.ts
│   ├── use-cases/
│   │   ├── signup-email.usecase.ts
│   │   ├── login-email.usecase.ts
│   │   ├── login-oauth.usecase.ts
│   │   ├── refresh-session.usecase.ts
│   │   └── logout.usecase.ts
│   ├── auth.service.ts
│   └── session.service.ts
├── constants/
├── domain/
│   ├── entities/
│   ├── oauth/
│   ├── repositories/
│   ├── services/
│   └── strategies/
├── dto/
├── infrastructure/
│   ├── oauth/
│   ├── persistence/
│   ├── security/
│   └── session/
└── auth.module.ts
```

### CatalogModule

Archivo: [`catalog.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/catalog/catalog.module.ts#L1)

- Controllers:
  - `CatalogController`
  - `AdminCatalogController`
- Providers:
  - `CatalogService`
  - `CatalogRepository -> PostgresCatalogRepository`

### ProductsModule

Archivo: [`products.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/products/products.module.ts#L1)

- Controllers:
  - `ProductsController`
  - `AdminProductsController`
- Providers:
  - `ProductsService`
  - `ProductsRepository -> PostgresProductRepository`

### InventoryModule

Archivo: [`inventory.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/inventory/inventory.module.ts#L1)

- Controllers:
  - `InventoryController`
  - `AdminInventoryController`
- Providers:
  - `InventoryService`
  - `InventoryRepository -> PostgresInventoryRepository`
- Exports:
  - `InventoryRepository`

### CartModule

Archivo: [`cart.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/cart/cart.module.ts#L1)

- Imports:
  - `PricingModule`
- Controllers:
  - `CartController`
- Providers:
  - `CartService`
  - `CartRepository -> PostgresCartRepository`
- Exports:
  - `CartRepository`
  - `CartService`

### OrdersModule

Archivo: [`orders.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/orders/orders.module.ts#L1)

- Imports:
  - `InventoryModule`
  - `PricingModule`
- Controllers:
  - `OrdersController`
- Providers:
  - `OrdersService`
  - `UnitOfWork`
  - `OrderRepository -> PostgresOrderRepository`
  - `CartRepository -> PostgresCartRepository`
  - `LoyaltyRepository -> PostgresLoyaltyRepository`
  - `LoyaltyService`

### CustomersModule

Archivo: [`customers.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/customers/customers.module.ts#L1)

- Controllers:
  - `CustomersController`
  - `AdminCustomersController`
- Providers:
  - `CustomersService`
  - `CustomerRepository -> PostgresCustomerRepository`
- Exports:
  - `CustomerRepository`

### LoyaltyModule

Archivo: [`loyalty.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/loyalty/loyalty.module.ts#L1)

- Controllers:
  - `LoyaltyController`
  - `AdminLoyaltyController`
- Providers:
  - `LoyaltyService`
  - `LoyaltyRepository -> PostgresLoyaltyRepository`
- Exports:
  - `LoyaltyService`

### PricingModule

Archivo: [`pricing.module.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/modules/pricing/pricing.module.ts#L1)

- Providers:
  - `PricingService`
  - `PricingContext`
  - `BasePriceStrategy`
  - `PercentageDiscountStrategy`
  - `PointsDiscountStrategy`
  - `PRICING_STRATEGIES` via `useFactory`
- Exports:
  - `PricingService`

## 7. Script SQL Consolidado

Fuente principal: [`schema.sql`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/infrastructure/database/schema.sql#L1)

```sql
-- =========================
-- Auth
-- =========================
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_identities (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('email', 'google', 'facebook', 'apple')),
  provider_user_id VARCHAR(255),
  email VARCHAR(255),
  password_hash TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auth_identity_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_auth_identity_provider_user
  ON auth_identities(provider, provider_user_id);

CREATE UNIQUE INDEX uq_auth_identity_email_provider
  ON auth_identities(provider, email);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  refresh_token TEXT NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auth_session_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE UNIQUE INDEX uq_auth_sessions_refresh_token ON auth_sessions(refresh_token);

-- =========================
-- Catalogs
-- =========================
CREATE TABLE catalogs (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL
);

-- =========================
-- Products
-- =========================
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  active BOOLEAN NOT NULL,
  catalog_id UUID NOT NULL,
  CONSTRAINT fk_products_catalog
    FOREIGN KEY (catalog_id)
    REFERENCES catalogs(id)
);

CREATE INDEX idx_products_catalog_id ON products(catalog_id);

-- =========================
-- Inventory
-- =========================
CREATE TABLE inventory (
  product_id UUID PRIMARY KEY,
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  reserved_quantity INTEGER NOT NULL CHECK (reserved_quantity >= 0),
  CONSTRAINT fk_inventory_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

-- =========================
-- Customers
-- =========================
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address TEXT
);

-- =========================
-- Carts
-- =========================
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL,
  CONSTRAINT fk_carts_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
);

CREATE INDEX idx_carts_customer_id ON carts(customer_id);

-- =========================
-- Cart Items
-- =========================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- =========================
-- Orders
-- =========================
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- =========================
-- Order Items
-- =========================
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =========================
-- Loyalty Accounts
-- =========================
CREATE TABLE loyalty_accounts (
  customer_id UUID PRIMARY KEY,
  points INTEGER NOT NULL CHECK (points >= 0),
  CONSTRAINT fk_loyalty_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
);
```

## 8. Constraints e Indices Identificados

### Primary Keys

- `users.id`
- `auth_identities.id`
- `auth_sessions.id`
- `catalogs.id`
- `products.id`
- `inventory.product_id`
- `customers.id`
- `carts.id`
- `cart_items.id`
- `orders.id`
- `order_items.id`
- `loyalty_accounts.customer_id`

### Foreign Keys

- `auth_identities.user_id -> users.id`
- `auth_sessions.user_id -> users.id`
- `products.catalog_id -> catalogs.id`
- `inventory.product_id -> products.id`
- `carts.customer_id -> customers.id`
- `cart_items.cart_id -> carts.id`
- `cart_items.product_id -> products.id`
- `orders.customer_id -> customers.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`
- `loyalty_accounts.customer_id -> customers.id`

### Unique Constraints / Unique Indexes

- `users.email`
- `customers.email`
- `uq_auth_identity_provider_user`
- `uq_auth_identity_email_provider`
- `uq_auth_sessions_refresh_token`

### Check Constraints

- `auth_identities.provider IN ('email', 'google', 'facebook', 'apple')`
- `inventory.available_quantity >= 0`
- `inventory.reserved_quantity >= 0`
- `cart_items.quantity > 0`
- `order_items.quantity > 0`
- `loyalty_accounts.points >= 0`

## 9. Observaciones Tecnicas

- El proyecto usa NestJS con una organizacion modular por dominio.
- `auth` es actualmente el modulo mas cercano a un enfoque de Clean Architecture.
- El documento SQL consolidado proviene de `schema.sql`, por lo que refleja la definicion base comprometida en el repositorio.
- Existen carpetas y artefactos heredados dentro de `auth/` que parecen convivir con la nueva version del flujo.

## 10. Recomendacion

Este documento puede servirte como base para:

- documentacion funcional del backend
- onboarding tecnico
- auditoria de entidades y relaciones
- preparacion de diagramas ER y diagramas de arquitectura

Siguiente mejora recomendada:

- generar una segunda version de este documento con diagrama de relaciones entre modulos y entidades

## 11. Dependencias para levantar el proyecto

Fuente principal: [`package.json`](/c:/Users/USER/Documents/api-food/food-commerce-api/package.json#L1)

### Comando de instalacion

```bash
npm install
```

### Dependencias de runtime

Estas librerias son necesarias para ejecutar la API:

- `@aws-sdk/client-secrets-manager`
- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/jwt`
- `@nestjs/passport`
- `@nestjs/platform-express`
- `@nestjs/swagger`
- `@nestjs/throttler`
- `bcryptjs`
- `better-sqlite3`
- `class-transformer`
- `class-validator`
- `dotenv`
- `google-auth-library`
- `js-yaml`
- `jwk-to-pem`
- `passport`
- `passport-jwt`
- `pg`
- `reflect-metadata`
- `rxjs`
- `sqlite3`
- `swagger-ui-express`
- `uuid`

### Dependencias de desarrollo

Estas librerias son necesarias para compilar, testear y desarrollar localmente:

- `@eslint/eslintrc`
- `@eslint/js`
- `@nestjs/cli`
- `@nestjs/schematics`
- `@nestjs/testing`
- `@types/express`
- `@types/jest`
- `@types/node`
- `@types/supertest`
- `@types/swagger-ui-express`
- `@types/uuid`
- `copyfiles`
- `eslint`
- `eslint-config-prettier`
- `eslint-plugin-prettier`
- `globals`
- `jest`
- `prettier`
- `source-map-support`
- `supertest`
- `ts-jest`
- `ts-loader`
- `ts-node`
- `tsconfig-paths`
- `typescript`
- `typescript-eslint`

### Scripts disponibles

- `npm run build`: compila el proyecto
- `npm run start`: inicia la aplicacion
- `npm run start:dev`: inicia en modo watch
- `npm run start:debug`: inicia en modo debug
- `npm run start:prod`: ejecuta `dist/main`
- `npm run lint`: corre eslint
- `npm run test`: corre pruebas unitarias
- `npm run test:watch`: corre pruebas en watch mode
- `npm run test:cov`: corre pruebas con coverage
- `npm run test:e2e`: corre pruebas end-to-end
- `npm run format`: aplica formato con Prettier

### Prerrequisitos recomendados del entorno

- Node.js instalado
- npm instalado
- archivo `.env` configurado
- certificado `certs/global-bundle.pem` disponible si se usa Postgres
- credenciales de acceso para la base de datos PostgreSQL
- credenciales OAuth configuradas para Google, Facebook y Apple si se probaran esos flujos

### Nota operativa

Segun [`main.ts`](/c:/Users/USER/Documents/api-food/food-commerce-api/src/main.ts#L1), en entorno `development` se intenta inicializar Postgres, y adicionalmente se ejecuta `initSchema()` para cargar el esquema definido en `src/infrastructure/database/schema.sql`.
