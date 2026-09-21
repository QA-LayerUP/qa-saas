export const PROJECT_STATUSES = ["em_andamento", "pausado", "cancelado", "concluido"] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  em_andamento: "Em andamento",
  pausado: "Pausado",
  cancelado: "Cancelado",
  concluido: "Concluído",
}

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  em_andamento: "border-roxo/30 bg-roxo/15 text-roxo",
  pausado: "border-amarelo/30 bg-amarelo/15 text-amarelo",
  cancelado: "border-rosa/30 bg-rosa/15 text-rosa",
  concluido: "border-border bg-foreground/10 text-foreground/80",
}

const LEGACY_STATUS: Record<string, ProjectStatus> = {
  em_qa: "em_andamento",
  em_desenvolvimento: "em_andamento",
  corrigindo: "em_andamento",
  homologando: "em_andamento",
  finalizado: "concluido",
}

export function normalizeProjectStatus(status: string | null | undefined): ProjectStatus {
  if (!status) return "em_andamento"
  if ((PROJECT_STATUSES as readonly string[]).includes(status)) {
    return status as ProjectStatus
  }
  return LEGACY_STATUS[status] ?? "em_andamento"
}
