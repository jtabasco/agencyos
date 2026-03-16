# Supabase Migrations: Fix Default User Role + Multilingual Support

## Problemas a Resolver

1. **Rol por defecto incorrecto**: Los nuevos usuarios se crean con rol `owner` en lugar de `client`
   - **Riesgo de Seguridad**: Cualquier usuario nuevo obtiene permisos completos de administrador

2. **Campo de idioma faltante**: Necesario para generar AI Reports en el idioma del usuario
   - Error: "Could not find the 'preferred_language' column"

---

## Solución

### Opción 1: Usando Supabase Dashboard (Recomendado)

#### Paso 1: Agregar campo de idioma

1. **Abre Supabase Dashboard** → Tu Proyecto
2. **Ve a SQL Editor** (izquierda) → **New Query**
3. **Copia y ejecuta este SQL**:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
CHECK (preferred_language IN ('en', 'es', 'fr'));

CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
ON public.profiles(preferred_language);
```
4. **Haz clic en "Run"** o presiona `Ctrl+Enter`

#### Paso 2: Arreglar el rol por defecto

1. En el mismo **SQL Editor**, crea una **New Query**
2. **Copia el contenido** de este archivo: `supabase/migrations/fix_default_user_role.sql`
3. **Pega** el SQL en el editor
4. **Haz clic en "Run"** o presiona `Ctrl+Enter`

✅ Listo. Los nuevos usuarios ahora serán `client` por defecto y el idioma está soportado.

---

### Opción 2: Usando Supabase CLI

```bash
# En la raíz del proyecto
supabase db push
```

Esto ejecutará automáticamente todas las migraciones pendientes.

---

## ¿Qué hace esta migración?

1. **Reemplaza el trigger `on_auth_user_created`** que crea perfiles automáticamente
2. **Establece la lógica**:
   - Primer usuario del sistema → `owner`
   - Todos los demás usuarios → `client`
3. **Agrega soporte para `preferred_language`** en los nuevos perfiles

---

## Después de ejecutar

### Ver cambios inmediatos
- Los **nuevos registros** tendrán rol `client`
- El **primer usuario** seguirá siendo `owner`

### Usuarios creados incorrectamente
Si ya tienes usuarios creados con rol `owner`, puedes cambiarlos manualmente:

1. **Ve a** Team Management en la app
2. **Selecciona el usuario**
3. **Cambia el rol** a `client` desde el dropdown

O ejecuta este SQL en Supabase (opcional):

```sql
-- Solo para usuarios creados recientemente
UPDATE profiles
SET role = 'client'
WHERE role = 'owner'
AND created_at > NOW() - INTERVAL '7 days'
AND email != 'tu@email.com';  -- Protege tu cuenta
```

---

## Verificación

Para verificar que la migración funcionó:

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT id, email, role, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;
```

Deberías ver:
- Tu usuario original: `owner`
- Cualquier usuario nuevo: `client`

---

## Soporte
Si tienes problemas, verifica:
1. ✅ Eres dueño del proyecto Supabase
2. ✅ Ejecutaste el SQL completo sin errores
3. ✅ El trigger está enabled en Supabase
