# 🚀 Migraciones SQL - Listas para Copiar y Pegar

## ⚡ Instrucciones Rápidas (2 minutos)

1. **Abre** https://app.supabase.com/projects
2. **Login** con tu cuenta Supabase
3. **Selecciona** tu proyecto (ciclomaja)
4. **Ve a** "SQL Editor" en el lado izquierdo
5. **Haz clic** en "New Query"
6. **Copia TODO el código abajo** (Ctrl+A, Ctrl+C)
7. **Pega** en el editor (Ctrl+V)
8. **Presiona** "Run" o Ctrl+Enter
9. **Espera** 5-10 segundos
10. ✅ **¡Listo!**

---

## 📋 COPIA Y PEGA TODO ESTO EN SUPABASE SQL EDITOR

```sql
-- ============================================
-- MIGRATION 1: Agregar columna preferred_language
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
CHECK (preferred_language IN ('en', 'es', 'fr'));

CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
ON public.profiles(preferred_language);

-- ============================================
-- MIGRATION 2: Arreglar trigger de rol por defecto
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;

  INSERT INTO public.profiles (
    id, email, full_name, role, preferred_language, avatar_url, created_at, updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE WHEN user_count = 0 THEN 'owner'::text ELSE 'client'::text END,
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
  EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;

-- ============================================
-- VERIFICACIÓN: Verifica que todo funcionó
-- ============================================
-- Ejecuta esto después para confirmar:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name='profiles' AND column_name='preferred_language';
```

---

## ✅ Verificación Posterior (Opcional)

Después de ejecutar, puedes verificar que todo funcionó:

```sql
-- Verifica que la columna existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name='profiles'
ORDER BY ordinal_position;

-- Verifica que el trigger existe
SELECT trigger_name, event_object_table, trigger_definition
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## 🎯 ¿Qué hace?

1. **Migration 1:**
   - Agrega columna `preferred_language` a la tabla `profiles`
   - Valor por defecto: `'en'` (English)
   - Valores permitidos: `'en', 'es', 'fr'`
   - Crea índice para mejor performance

2. **Migration 2:**
   - Actualiza el trigger que crea perfiles automáticamente
   - **Primer usuario** → `owner`
   - **Todos los demás** → `client` (FIX: antes era owner para todos)
   - Soporta el campo `preferred_language`

---

## 🟢 Resultado Esperado

Deberías ver un mensaje como:
```
Query executed successfully
```

Si ves errores, copia el código nuevamente y asegúrate de pegar TODO (incluyendo comentarios).

---

## 💡 Notas

- Las migraciones son **idempotentes** (se pueden ejecutar múltiples veces sin problemas)
- Los datos existentes NO se borran
- Los usuarios existentes mantendrán su rol actual
- Solo los NUEVOS usuarios serán creados como `client`
