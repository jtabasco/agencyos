# 🚀 MIGRACIONES SQL - COPIAR Y PEGAR EN DOKPLOY

## ⚡ Pasos Rápidos

1. Ve a tu panel de Dokploy/Supabase
2. Abre **SQL Editor**
3. **Copia TODO el código SQL abajo** (Ctrl+A luego Ctrl+C)
4. **Pega** en el editor (Ctrl+V)
5. **Presiona Execute o Run**
6. ✅ **¡Listo!**

---

## 📋 COPIA Y PEGA TODO ESTO EN SQL EDITOR

```sql
-- ============================================
-- MIGRATION 1: Agregar columna preferred_language
-- ============================================
ALTER TABLE "AgencyOS".profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
CHECK (preferred_language IN ('en', 'es', 'fr'));

CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
ON "AgencyOS".profiles(preferred_language);

-- ============================================
-- MIGRATION 2: Arreglar trigger de rol por defecto
-- ============================================
CREATE OR REPLACE FUNCTION "AgencyOS".handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = "AgencyOS"
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM "AgencyOS".profiles;

  INSERT INTO "AgencyOS".profiles (
    id, email, full_name, role, preferred_language, avatar_url, created_at, updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      new.raw_user_meta_data->>'role',
      CASE WHEN user_count = 0 THEN 'owner' ELSE 'client' END
    ),
    'en',
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    NOW(),
    NOW()
  );

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION "AgencyOS".handle_new_user();

GRANT EXECUTE ON FUNCTION "AgencyOS".handle_new_user() TO authenticated, anon, service_role;
```

---

## ✅ Qué Hace Este SQL

### Migration 1: Soporte Multilingüe
- Agrega columna `preferred_language` a la tabla `profiles`
- Permite valores: `'en'` (English), `'es'` (Spanish), `'fr'` (French)
- Valor por defecto: `'en'`
- Crea índice para mejor performance

### Migration 2: Fix del Rol por Defecto
- **Problema actual**: Todos los nuevos usuarios se crean como `owner`
- **Solución**:
  - Primer usuario del sistema → `owner`
  - Todos los demás → `client`
- Actualiza el trigger `on_auth_user_created`
- Soporta el nuevo campo `preferred_language`

---

## 🎯 Resultado Esperado

Deberías ver un mensaje como:
```
Query executed successfully
```

Si ves errores, copia el código nuevamente y asegúrate de pegar TODO.

---

## 🔄 Después de Ejecutar

- ✅ Los **nuevos usuarios** serán creados como `client` automáticamente
- ✅ El **idioma** se guardará en la base de datos
- ✅ Los **reportes IA** se generarán en el idioma seleccionado
- ✅ El **Team Management** permitirá cambiar roles correctamente

---

## 💡 Datos Importantes

- Las migraciones son **idempotentes** (se pueden ejecutar múltiples veces sin problemas)
- Los datos existentes **NO se borran**
- Los usuarios existentes mantendrán su rol actual
- Solo los NUEVOS usuarios serán creados como `client`

---

## 🐛 Si Tienes Errores

1. **"Column already exists"** → Normal, significa que ya está hecha. Ignora.
2. **"Function already exists"** → Normal, solo se reemplaza. Ignora.
3. Cualquier otro error → Copia el SQL nuevamente e intenta una vez más

**Problema**: Si aún tienes errores, revisa que estés en la database correcta (agencyos o similar).
