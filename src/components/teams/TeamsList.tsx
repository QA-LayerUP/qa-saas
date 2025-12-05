'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Team {
  id: string
  name: string
  description?: string
}

interface TeamsListProps {
  projectId: string
}

export function TeamsList({ projectId }: TeamsListProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, description')
        .eq('project_id', projectId)
        .order('name')

      if (error) throw error
      setTeams(data || [])
    } catch (err) {
      console.error('Error fetching teams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const handleDelete = async (teamId: string) => {
    if (!confirm('Remover este time? Essa ação não pode ser desfeita.')) return
    setDeleting(teamId)
    try {
      const { error } = await supabase.from('teams').delete().eq('id', teamId)
      if (error) throw error
      setTeams((prev) => prev.filter((t) => t.id !== teamId))
    } catch (err) {
      console.error('Error deleting team:', err)
      alert('Erro ao excluir time. Verifique permissões.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Carregando times...</div>
  if (teams.length === 0) return <div className="text-sm text-muted-foreground">Nenhum time cadastrado.</div>

  return (
    <div className="space-y-2">
      {teams.map((team) => (
        <div key={team.id} className="flex items-center justify-between border rounded p-3 bg-white">
          <div>
            <div className="font-medium">{team.name}</div>
            {team.description && <div className="text-sm text-muted-foreground">{team.description}</div>}
          </div>
          <div>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(team.id)} disabled={deleting === team.id}>
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting === team.id ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
