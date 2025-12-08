/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
    LayoutDashboard, 
    FolderKanban, 
    Settings, 
    LogOut, 
    User, 
    User2,
    Puzzle, // Novo ícone para a extensão
    ExternalLink
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Projetos',
        href: '/projects',
        icon: FolderKanban,
    },
    {
        title: 'Times', // Reordenei para ficar agrupado
        href: '/teams',
        icon: User2,
    },
    {
        title: 'Configurações',
        href: '/settings/profile', // Ajustei para a rota que criamos no passo anterior (/settings/page.tsx)
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<SupabaseUser | null>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            {/* Header */}
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Puzzle className="h-4 w-4" />
                    </div>
                    <span>QA LayerUP</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-muted/50",
                                pathname === item.href || pathname.startsWith(item.href + '/')
                                    ? "bg-muted text-primary font-semibold"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* --- NOVO: Card da Extensão --- */}
            <div className="px-4 pb-2">
                <div className="rounded-xl border bg-muted/30 p-4 shadow-sm relative overflow-hidden">
                    {/* Efeito de fundo decorativo opcional */}
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5 blur-2xl" />
                    
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                            <Puzzle className="h-4 w-4" />
                        </div>
                        <h4 className="text-sm font-semibold">Extensão QA</h4>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed relative z-10">
                        Capture bugs 10x mais rápido instalando nossa extensão.
                    </p>
                    
                    <Link href="/tutorial" className="relative z-10 block">
                        <Button size="sm" className="w-full text-xs h-8 font-medium shadow-none" variant="default">
                            Baixar Agora
                        </Button>
                    </Link>
                </div>
            </div>

            {/* User Footer */}
            <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-4 group cursor-pointer" onClick={() => router.push('/settings/profile')}>
                    <Avatar className="h-9 w-9 border transition-all group-hover:border-primary/50">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden transition-all">
                        <span className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                            {user?.user_metadata?.name || 'Minha Conta'}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </span>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors" 
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    )
}