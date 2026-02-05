# Food Commerce API

Backend monolítico modular para una plataforma de e-commerce enfocada en venta de comida saludable. El sistema implementa buenas prácticas de arquitectura limpia, contratos API-First, persistencia en PostgreSQL sobre AWS RDS, y está diseñado para evolucionar hacia un entorno productivo escalable.

---

## Descripción General

Food Commerce API es una aplicación backend construida con:

- NestJS  
- TypeScript  
- PostgreSQL (AWS RDS)  
- Arquitectura Hexagonal (Clean Architecture)  
- Diseño API-First mediante OpenAPI  
- Patrón Repository  
- Preparado para Unit Of Work y control de concurrencia  
- Backoffice administrativo integrado  
- Persistencia cloud ready  

El sistema permite gestionar:

- Catálogo de productos  
- Carrito de compras  
- Órdenes  
- Inventario  
- Clientes  
- Programa de fidelización  
- Administración operativa  

---

## Arquitectura

El proyecto utiliza un Monolito Modular con Arquitectura Hexagonal, lo que permite desacoplamiento entre dominio, infraestructura y capa de exposición.

Controller → Service → Domain → Repository → Database


### Principios Aplicados

- Clean Architecture  
- SOLID  
- DDD táctico  
- Repository Pattern  
- API First  
- Separation of Concerns  
- Transaction boundaries en capa de aplicación  
- Diseño preparado para microservicios  

---

## Estructura del Proyecto

src/
│
├── infrastructure/
│ └── database/
│ ├── postgres.connection.ts
│ ├── schema.sql
│ └── unit-of-work.ts (en progreso)
│
├── modules/
│ ├── catalog/
│ ├── products/
│ ├── inventory/
│ ├── cart/
│ ├── orders/
│ ├── customers/
│ └── loyalty/
│
└── main.ts


Cada módulo contiene:

module/
├── api/
├── admin/
├── application/
├── domain/
├── infrastructure/
└── module.ts


---

## Módulos del Sistema

### Catalog
Gestión de categorías de productos.

### Products
Gestión de productos disponibles.

### Inventory
Control de stock y disponibilidad.

### Cart
Gestión del carrito del cliente.

### Orders
Proceso completo de checkout.

### Customers
Gestión de perfiles de clientes.

### Loyalty
Sistema de acumulación de puntos.

---

## Backoffice Administrativo

Incluye endpoints para:

- Activar / desactivar productos  
- Ajustar inventario  
- Gestionar órdenes  
- Consultar clientes  
- Administrar puntos  

---

## API First

La API fue diseñada previamente mediante OpenAPI, garantizando:

- Contratos claros  
- Documentación consistente  
- Integración sencilla con frontend  

---

## Persistencia

El sistema utiliza:

- PostgreSQL  
- AWS RDS  
- Driver pg  

Actualmente se usa bootstrap con `schema.sql` para desarrollo.  
El proyecto está preparado para migrar hacia migraciones versionadas.

---

## Infraestructura Cloud

- AWS RDS PostgreSQL  
- AWS Secrets Manager para credenciales  
- SSL habilitado para conexiones seguras  

---

## Transacciones

Las operaciones críticas (checkout) están diseñadas para ejecutarse en una sola transacción para mantener consistencia ACID.

---

## Seguridad (Planificada)

El sistema está preparado para implementar:

- OAuth 2.0 (Google / Apple)  
- JWT  
- Guards por roles  
- Separación de endpoints públicos y administrativos  

---

## Estrategia de Pruebas

Pruebas manuales mediante Postman.

Flujos cubiertos:

- Catálogo  
- Productos  
- Inventario  
- Carrito  
- Checkout  
- Backoffice  
- Programa de fidelización  

---

## Instalación

### Requisitos

- Node.js 18+
- npm
- PostgreSQL (RDS o local)
- Cuenta AWS
- DBeaver o cliente SQL opcional

### 1. Clonar repositorio

```bash
git clone <repo>
cd food-commerce-api
```
### 2. Instalar dependencias
```
npm install
```
### 3. Configurar variables de entorno

Crear archivo .env
```
AWS_REGION=us-east-2
DB_SECRET_NAME=food-commerce/postgres
```
### 4. Crear Secret en AWS

Formato:
```
{
  "username": "app_admin",
  "password": "*****",
  "host": "RDS_ENDPOINT",
  "port": 5432,
  "dbname": "food_db"
}
```
### 5. Ejecutar proyecto
```
npm run start:dev
```

## Pruebas API

Importar colección Postman incluida en el repositorio.

### Endpoints Principales
### Públicos
```bash
GET /catalogs
GET /products
GET /products/{id}
GET /inventory/{productId}
POST /cart
POST /orders/{customerId}
GET /loyalty/{customerId}
```

### Backoffice
```
POST /admin/catalogs
PATCH /admin/products/{id}/price
PATCH /admin/inventory/{productId}/adjust
PATCH /admin/orders/{orderId}/status
GET /admin/customers/{customerId}
```


### Identificadores

Se utilizan UUID para:
- Customers
-Orders
-Products
-Catalogs
-Cart


### Flujo de Negocio
```powershell
Cliente → Catálogo → Carrito → Checkout → Orden → Puntos
```
