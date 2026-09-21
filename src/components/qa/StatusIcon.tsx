import { AlertCircle, Clock, CheckCircle2, PauseCircle, Ban } from 'lucide-react'
import { qaStatusIconClass } from '@/lib/qa-status'

export function StatusIcon({
  status,
  className = 'h-4 w-4',
}: {
  status: string
  className?: string
}) {
  const color = qaStatusIconClass(status)
  const iconClass = `${className} ${color}`

  switch (status) {
    case 'aberto':
      return <AlertCircle className={iconClass} />
    case 'em_correcao':
      return <Clock className={iconClass} />
    case 'pendencia':
      return <PauseCircle className={iconClass} />
    case 'em_homologacao':
      return <Clock className={iconClass} />
    case 'finalizado':
      return <CheckCircle2 className={iconClass} />
    case 'cancelado':
      return <Ban className={`${className} text-gray-400`} />
    default:
      return <AlertCircle className={iconClass} />
  }
}
