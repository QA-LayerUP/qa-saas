'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [userId, setUserId] = useState('')
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                setEmail(user.email || '')

                const { data: profile } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setName(profile.name || '')
                }
            }
        }
        getProfile()
    }, [])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('users')
                .update({ name })
                .eq('id', userId)

            if (error) throw error

            router.refresh()
            alert('Perfil atualizado com sucesso!')
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Erro ao atualizar perfil.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Configurações</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>
                        Atualize suas informações pessoais.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdate}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={email} disabled />
                            <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome completo"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Salvar Alterações
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
