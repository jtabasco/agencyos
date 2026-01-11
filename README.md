# AgencyOS

A modern agency management platform built with Next.js 16, Supabase, and AI-powered project reports.

## Features

- **Role-based Access Control**: Owner, Project Manager, Developer, and Client roles with RLS
- **Project Management**: Create, track, and manage client projects
- **Kanban Board**: Drag-and-drop task management with 5 status columns
- **AI Reports**: Generate intelligent project reports using Google Gemini
- **Team Management**: Invite and manage team members
- **Billing Dashboard**: Track invoices and subscriptions
- **Modern UI**: Deep space purple design system with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth with SSR
- **AI**: Vercel AI SDK with Google Gemini
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

The app requires the following Supabase migrations:
- `agencyos_core_schema`: Core tables (profiles, projects, tasks, updates, project_members)
- `agencyos_rls_policies`: Row Level Security policies for role-based access

## User Roles

| Role | Access |
|------|--------|
| Owner | Full access to all data and settings |
| PM | Manage assigned projects and tasks |
| Dev | View assigned projects, manage own tasks |
| Client | Read-only access to their projects |

## Deployment

This app is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and configure the environment variables.

## License

Private - All rights reserved
