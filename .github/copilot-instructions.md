# NEXUS LMS - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
NEXUS is a comprehensive Learning Management System (LMS) designed for basic schools with a multi-role hierarchy system.

## Architecture & Tech Stack
- **Frontend**: Next.js 14+ with TypeScript, Material-UI (MUI), Tailwind CSS
- **Backend**: Next.js API Routes with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom ID/PIN-based system (no email/password)
- **Styling**: Material-UI components with responsive design

## Key Features & Requirements
1. **Multi-Role System**: Super Admin → School Admin → Teacher → Student
2. **Authentication**: ID and PIN only (8-digit admin IDs, 5-digit PINs)
3. **Sequential ID Generation**: Auto-generated sequential IDs for school admins
4. **Quiz Timer System**: Visual progress bar (green to red) with countdown timer
5. **Mobile-First Design**: Fully responsive for small screens
6. **Role-Based Dashboards**: Tailored UI for each user type

## User Roles & Permissions
- **Super Admin**: Creates schools, generates admin credentials
- **School Admin**: Manages classes, subjects, teachers, students for their school
- **Teacher**: Creates assignments, quizzes, announcements, resources
- **Student**: Views subjects, takes quizzes, accesses learning materials

## Code Style Guidelines
- Use TypeScript strictly with proper type definitions
- Follow Material-UI design patterns and theming
- Implement responsive design with mobile-first approach
- Use proper error handling and validation
- Follow Next.js best practices for API routes and server components
- Use proper MongoDB schema design with Mongoose

## Important Implementation Notes
- Quiz timer must have both numerical countdown AND color-changing progress bar
- All navigation should be role-based with proper authentication guards
- Database models should reflect the hierarchical relationship between roles
- Use Material-UI's theme system for consistent styling across all components
