// =============================================
// AgencyOS Database Types
// =============================================

// Enums
export type UserRole = 'owner' | 'pm' | 'dev' | 'client'
export type ProjectStatus = 'onboarding' | 'active' | 'paused' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'client_approval' | 'done'
export type UpdateType = 'milestone' | 'blocker' | 'delivery' | 'approval'

// Tables
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  client_id: string | null
  manager_id: string | null
  progress_percent: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  assigned_to: string | null
  title: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Update {
  id: string
  project_id: string
  author_id: string | null
  content: string
  type: UpdateType
  created_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  created_at: string
}

// Extended types with relations
export interface ProjectWithRelations extends Project {
  client?: Profile | null
  manager?: Profile | null
  tasks?: Task[]
  updates?: Update[]
  members?: ProjectMember[]
}

export interface TaskWithRelations extends Task {
  project?: Project
  assignee?: Profile | null
}

export interface UpdateWithRelations extends Update {
  project?: Project
  author?: Profile | null
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress_percent'> & {
          id?: string
          progress_percent?: number
        }
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
      updates: {
        Row: Update
        Insert: Omit<Update, 'id' | 'created_at'> & { id?: string }
        Update: never // Updates are immutable
      }
      project_members: {
        Row: ProjectMember
        Insert: Omit<ProjectMember, 'id' | 'created_at'> & { id?: string }
        Update: never // Members are add/remove only
      }
    }
    Enums: {
      user_role: UserRole
      project_status: ProjectStatus
      task_status: TaskStatus
      update_type: UpdateType
    }
  }
}

// Role permissions helper type
export interface RolePermissions {
  canViewAllProjects: boolean
  canCreateProjects: boolean
  canManageTeam: boolean
  canViewBilling: boolean
  canApproveDeliverables: boolean
  canMoveKanbanCards: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    canViewAllProjects: true,
    canCreateProjects: true,
    canManageTeam: true,
    canViewBilling: true,
    canApproveDeliverables: true,
    canMoveKanbanCards: true,
  },
  pm: {
    canViewAllProjects: false, // Only managed projects
    canCreateProjects: true,
    canManageTeam: true,
    canViewBilling: false,
    canApproveDeliverables: true,
    canMoveKanbanCards: true,
  },
  dev: {
    canViewAllProjects: false, // Only assigned projects
    canCreateProjects: false,
    canManageTeam: false,
    canViewBilling: false,
    canApproveDeliverables: false,
    canMoveKanbanCards: false, // Can only update their tasks
  },
  client: {
    canViewAllProjects: false, // Only their projects
    canCreateProjects: false,
    canManageTeam: false,
    canViewBilling: false,
    canApproveDeliverables: true, // Can approve their deliverables
    canMoveKanbanCards: false, // Read-only
  },
}
