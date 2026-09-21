export const QA_ITEM_STATUSES = [
  "aberto",
  "em_correcao",
  "pendencia",
  "em_homologacao",
  "finalizado",
] as const

export type QAItemStatus = (typeof QA_ITEM_STATUSES)[number]

export const QA_ITEM_STATUS_LABELS: Record<QAItemStatus, string> = {
  aberto: "Aberto",
  em_correcao: "Em Correção",
  pendencia: "Pendência",
  em_homologacao: "Homologação",
  finalizado: "Finalizado",
}

export const QA_ITEM_STATUS_BADGE: Record<QAItemStatus, string> = {
  aberto: "bg-red-500/10 text-red-500 border-red-500/30",
  em_correcao: "bg-amarelo/10 text-amarelo border-amarelo/30",
  pendencia: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  em_homologacao: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  finalizado: "bg-green-500/10 text-green-500 border-green-500/30",
}

export const QA_ITEM_STATUS_ICON: Record<QAItemStatus, string> = {
  aberto: "text-red-500",
  em_correcao: "text-amarelo",
  pendencia: "text-orange-500",
  em_homologacao: "text-blue-500",
  finalizado: "text-green-500",
}

export function isQAItemStatus(value: string | null | undefined): value is QAItemStatus {
  return Boolean(value && (QA_ITEM_STATUSES as readonly string[]).includes(value))
}

export function qaStatusLabel(status: string | null | undefined) {
  if (isQAItemStatus(status)) return QA_ITEM_STATUS_LABELS[status]
  return (status || "").replaceAll("_", " ")
}

export function qaStatusBadge(status: string | null | undefined) {
  if (isQAItemStatus(status)) return QA_ITEM_STATUS_BADGE[status]
  return "bg-gray-100 text-gray-800"
}

export function qaStatusIconClass(status: string | null | undefined) {
  if (isQAItemStatus(status)) return QA_ITEM_STATUS_ICON[status]
  return "text-muted-foreground"
}
