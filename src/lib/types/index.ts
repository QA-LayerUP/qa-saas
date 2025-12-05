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

export interface QACategory {
    id: string;
    project_id: string;
    title: string;
    team_id?: string | null;
    created_at: string;
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
