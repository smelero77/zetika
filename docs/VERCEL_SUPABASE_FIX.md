# Fix de Conectividad Vercel + Supabase (IPv6 → IPv4)

## Problema Identificado

**Vercel no soporta IPv6**, pero Supabase usa IPv6 por defecto. Esto causa errores como:
```
Can't reach database server at db.qdsvtdkunixdjvncdjit.supabase.co:5432
```

## Solución: Usar Supavisor Transaction Mode

### 1. Obtener Nueva URL de Conexión

1. Ve a tu **Dashboard de Supabase**
2. Haz clic en **"Connect"** (botón verde arriba)
3. Selecciona **"Transaction Mode"** 
4. Copia la URL que se ve así:

```
postgres://postgres.qdsvtdkunixdjvncdjit:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Nota importante**: El puerto es `:6543` en lugar de `:5432`

### 2. Actualizar Variable en Vercel

1. Ve a tu proyecto en **Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. **Editar** la variable `DATABASE_URL`
4. **Reemplazar** con la nueva URL (transaction mode)
5. **Save**

### 3. Redesplegar

1. Ve a **Deployments**
2. Haz clic en **"Redeploy"** en el último deployment
3. O hacer un nuevo commit/push para activar redepliegue automático

## Por Qué Funciona

- **IPv6**: Conexión directa (puerto 5432) - No funciona en Vercel
- **IPv4 + IPv6**: Supavisor pooler (puerto 6543) - Funciona en Vercel
- **Optimizado**: Para serverless/edge functions como Vercel

## Problema Adicional: Caracteres Especiales en Contraseña

Si después del cambio a transaction mode ves este error:
```
invalid domain character in database URL
```

Significa que tu contraseña tiene **caracteres especiales** que necesitan ser **URL-encoded**.

### Diagnosticar URL
```
GET https://tu-dominio.vercel.app/api/debug-database-url
```

### Generar Contraseña Encoded
```
POST https://tu-dominio.vercel.app/api/encode-password
Content-Type: application/json

{
  "password": "tu_contraseña_actual"
}
```

### Caracteres Problemáticos Comunes
- `@` → `%40`
- `#` → `%23` 
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- Espacio → `%20`

## Verificación

Una vez aplicados los cambios, probar:
```
GET https://tu-dominio.vercel.app/api/test-db-connection
```

Debería devolver `success: true`.

## Referencias

- [Supabase Docs: Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase: Serverless Drivers](https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers)
- Vercel listado como servicio "IPv4 only" en documentación oficial de Supabase 