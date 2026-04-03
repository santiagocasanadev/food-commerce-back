# Platform Bootstrap

Use this to bootstrap the platform database from zero.

## 1. Apply schema

Run [schema.platform.sql](C:\Users\USER\Documents\api-food\food-commerce-api\src\infrastructure\database\schema.platform.sql) in the platform database.

## 2. Seed initial platform admin

Run [seed.platform.sql](C:\Users\USER\Documents\api-food\food-commerce-api\src\infrastructure\database\seed.platform.sql) in the same platform database.

Default bootstrap credentials from the seed:

- email: `platform@example.com`
- password: `Password123`

These credentials are suitable only for local/dev bootstrap. Change them immediately in shared or persistent environments.

## 3. Log in

Use:

- `POST /api/v1/platform/auth/login`

Request body:

```json
{
  "email": "platform@example.com",
  "password": "Password123"
}
```

## 4. Optional: create a different hash

If you want a different bootstrap password, generate a bcrypt hash with:

```powershell
node -e "const {hashSync}=require('./food-commerce-api/node_modules/bcryptjs'); console.log(hashSync('YourNewPassword123',12));"
```

Then replace `password_hash` in [seed.platform.sql](C:\Users\USER\Documents\api-food\food-commerce-api\src\infrastructure\database\seed.platform.sql).
