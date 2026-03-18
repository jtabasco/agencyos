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
-- 1. SOLUCIÓN DEFINITIVA DE PERMISOS PARA ESQUEMA "AgencyOS"
GRANT USAGE ON SCHEMA "AgencyOS" TO postgres, service_role, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA "AgencyOS" TO postgres, service_role, authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "AgencyOS" TO postgres, service_role, authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA "AgencyOS" GRANT ALL ON TABLES TO postgres, service_role, authenticated, anon;

-- 2. FUNCIÓN DE TRIGGER CORREGIDA
CREATE OR REPLACE FUNCTION "AgencyOS".handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = "AgencyOS", public
AS $$
BEGIN
  INSERT INTO "AgencyOS".profiles (id, email, full_name, role, preferred_language)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      new.raw_user_meta_data->>'role',
      CASE WHEN (SELECT COUNT(*) FROM "AgencyOS".profiles) = 0 THEN 'owner' ELSE 'client' END
    ),
    'en'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Evita bloquear el registro si falla la creación del perfil
  RETURN new;
END;
$$;

-- 3. RECREAR EL TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION "AgencyOS".handle_new_user();

-- 4. PERMISOS DE EJECUCIÓN
GRANT EXECUTE ON FUNCTION "AgencyOS".handle_new_user() TO postgres, service_role, authenticated, anon;
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
