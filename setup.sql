-- =============================================
-- AgencyOS: Setup de Base de Datos (Schema: AgencyOS)
-- =============================================

-- 1. Crear el esquema si no existe
CREATE SCHEMA IF NOT EXISTS "AgencyOS";

-- Establecer el esquema para esta sesion
SET search_path TO "AgencyOS", public;

-- 2. Tipos Enumerados (Enums) en el esquema AgencyOS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'user_role' AND n.nspname = 'AgencyOS') THEN
        CREATE TYPE "AgencyOS".user_role AS ENUM ('owner', 'pm', 'dev', 'client');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'project_status' AND n.nspname = 'AgencyOS') THEN
        CREATE TYPE "AgencyOS".project_status AS ENUM ('onboarding', 'active', 'paused', 'completed');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'task_status' AND n.nspname = 'AgencyOS') THEN
        CREATE TYPE "AgencyOS".task_status AS ENUM ('todo', 'in_progress', 'review', 'client_approval', 'done');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'update_type' AND n.nspname = 'AgencyOS') THEN
        CREATE TYPE "AgencyOS".update_type AS ENUM ('milestone', 'blocker', 'delivery', 'approval');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tablas en el esquema AgencyOS

-- Profiles
CREATE TABLE IF NOT EXISTS "AgencyOS".profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role "AgencyOS".user_role DEFAULT 'dev' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Projects
CREATE TABLE IF NOT EXISTS "AgencyOS".projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status "AgencyOS".project_status DEFAULT 'onboarding' NOT NULL,
  client_id UUID REFERENCES "AgencyOS".profiles(id),
  manager_id UUID REFERENCES "AgencyOS".profiles(id),
  progress_percent INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tasks
CREATE TABLE IF NOT EXISTS "AgencyOS".tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES "AgencyOS".projects(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES "AgencyOS".profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status "AgencyOS".task_status DEFAULT 'todo' NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Updates
CREATE TABLE IF NOT EXISTS "AgencyOS".updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES "AgencyOS".projects(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES "AgencyOS".profiles(id),
  content TEXT NOT NULL,
  type "AgencyOS".update_type DEFAULT 'milestone' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Project Members
CREATE TABLE IF NOT EXISTS "AgencyOS".project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES "AgencyOS".projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES "AgencyOS".profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, user_id)
);

-- 4. Funciones y Triggers

CREATE OR REPLACE FUNCTION "AgencyOS".handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON "AgencyOS".profiles FOR EACH ROW EXECUTE PROCEDURE "AgencyOS".handle_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "AgencyOS".projects FOR EACH ROW EXECUTE PROCEDURE "AgencyOS".handle_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON "AgencyOS".tasks FOR EACH ROW EXECUTE PROCEDURE "AgencyOS".handle_updated_at();

-- Trigger para crear perfil al registrarse un usuario (Vincula auth.users con AgencyOS.profiles)
CREATE OR REPLACE FUNCTION "AgencyOS".handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "AgencyOS".profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si ya existe para evitar errores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE "AgencyOS".handle_new_user();

-- 5. Row Level Security (RLS) en AgencyOS

ALTER TABLE "AgencyOS".profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencyOS".projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencyOS".tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencyOS".updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencyOS".project_members ENABLE ROW LEVEL SECURITY;

-- Funciones auxiliares para RLS
CREATE OR REPLACE FUNCTION "AgencyOS".get_my_role() RETURNS "AgencyOS".user_role AS $$
  SELECT role FROM "AgencyOS".profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Politicas para PROFILES
CREATE POLICY "Profiles are viewable by authenticated users" ON "AgencyOS".profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON "AgencyOS".profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owners can manage all profiles" ON "AgencyOS".profiles ALL USING ("AgencyOS".get_my_role() = 'owner');

-- Politicas para PROJECTS
CREATE POLICY "Owner: Full access to projects" ON "AgencyOS".projects ALL USING ("AgencyOS".get_my_role() = 'owner');

CREATE POLICY "PM: Manage assigned projects" ON "AgencyOS".projects ALL USING (
  "AgencyOS".get_my_role() = 'pm' AND (manager_id = auth.uid() OR EXISTS (SELECT 1 FROM "AgencyOS".project_members WHERE project_id = "AgencyOS".projects.id AND user_id = auth.uid()))
);

CREATE POLICY "Dev: View assigned projects" ON "AgencyOS".projects FOR SELECT USING (
  "AgencyOS".get_my_role() = 'dev' AND EXISTS (SELECT 1 FROM "AgencyOS".project_members WHERE project_id = "AgencyOS".projects.id AND user_id = auth.uid())
);

CREATE POLICY "Client: Read-only access to their projects" ON "AgencyOS".projects FOR SELECT USING (
  "AgencyOS".get_my_role() = 'client' AND client_id = auth.uid()
);

-- Politicas para TASKS
CREATE POLICY "Owner: Full access to tasks" ON "AgencyOS".tasks ALL USING ("AgencyOS".get_my_role() = 'owner');

CREATE POLICY "PM: Manage project tasks" ON "AgencyOS".tasks ALL USING (
  "AgencyOS".get_my_role() = 'pm' AND EXISTS (SELECT 1 FROM "AgencyOS".projects WHERE id = "AgencyOS".tasks.project_id AND (manager_id = auth.uid() OR EXISTS (SELECT 1 FROM "AgencyOS".project_members WHERE project_id = "AgencyOS".projects.id AND user_id = auth.uid()))))
);

CREATE POLICY "Dev: View project tasks" ON "AgencyOS".tasks FOR SELECT USING (
  "AgencyOS".get_my_role() = 'dev' AND EXISTS (SELECT 1 FROM "AgencyOS".project_members WHERE project_id = "AgencyOS".tasks.project_id AND user_id = auth.uid())
);

CREATE POLICY "Dev: Update assigned tasks" ON "AgencyOS".tasks FOR UPDATE USING (
  "AgencyOS".get_my_role() = 'dev' AND assigned_to = auth.uid()
);

CREATE POLICY "Client: View project tasks" ON "AgencyOS".tasks FOR SELECT USING (
  "AgencyOS".get_my_role() = 'client' AND EXISTS (SELECT 1 FROM "AgencyOS".projects WHERE id = "AgencyOS".tasks.project_id AND client_id = auth.uid())
);

-- Politicas para UPDATES
CREATE POLICY "Owner: Full access to updates" ON "AgencyOS".updates ALL USING ("AgencyOS".get_my_role() = 'owner');

CREATE POLICY "PM/Dev: Create updates in project" ON "AgencyOS".updates FOR INSERT WITH CHECK (
  "AgencyOS".get_my_role() IN ('pm', 'dev') AND EXISTS (SELECT 1 FROM "AgencyOS".project_members WHERE project_id = "AgencyOS".updates.project_id AND user_id = auth.uid())
);

CREATE POLICY "All members can view updates" ON "AgencyOS".updates FOR SELECT USING (
  EXISTS (SELECT 1 FROM "AgencyOS".project_members WHERE project_id = "AgencyOS".updates.project_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM "AgencyOS".projects WHERE id = "AgencyOS".updates.project_id AND (client_id = auth.uid() OR manager_id = auth.uid()))
  OR "AgencyOS".get_my_role() = 'owner'
);
