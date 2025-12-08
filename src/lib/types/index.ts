/* eslint-disable @typescript-eslint/no-explicit-any */
export type ProjectStatus = 'em_qa' | 'corrigindo' | 'homologando' | 'finalizado';
export type UserRole = 'ux' | 'dev' | 'content' | 'qa' | 'admin';
export type QAItemPriority = 'alta' | 'media' | 'baixa';
export type QAItemStatus = 'aberto' | 'em_correcao' | 'em_homologacao' | 'finalizado';

export interface Project {
    id: string;
    name: string;
    client: string | null;
    status: ProjectStatus;
    site_url: string | null;
    created_at: string;
}

export interface TeamMember {
    id: string
    team_id: string
    user_id: string
    role?: string
    user?: UserRole // Join com a tabela users
    created_at: string
}

export interface Team {
    id: string
    // project_id: string  <-- REMOVIDO
    name: string
    description?: string | null
    created_at: string
    members?: any[] // opcional para joins
}

// Nova interface para o vinculo
export interface ProjectTeam {
    id: string
    project_id: string
    team_id: string
    team?: Team // Join
}

export interface QACategory {
    id: string;
    project_id: string;
    title: string;
    team_id?: string | null;
    created_at: string;
}

// Adicione junto com os outros tipos
export interface QALog {
    id: string
    qa_item_id: string
    user_id: string
    action: string
    details?: any
    created_at: string
    user?: UserRole // Join
}

export interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: UserRole;
    created_at: string;
}

export interface QAItem {
    id: string;
    category_id: string;
    team_id?: string | null;
    title: string;
    description: string | null;
    priority: QAItemPriority;
    status: QAItemStatus;
    assigned_to: string | null;
    assigned_role?: 'ux' | 'dev' | 'content' | 'qa';
    created_by: string | null;
    created_at: string;
    // Visual QA metadata
    page_url: string | null;
    scroll_position: number | null;
    viewport_size: { width: number; height: number } | null;
    // Joins
    assigned_user?: User;
    created_user?: User;
    evidences?: QAEvidence[];
}

export interface QAEvidence {
    id: string;
    qa_item_id: string;
    file_url: string;
    file_type: string;
    created_at: string;
}
