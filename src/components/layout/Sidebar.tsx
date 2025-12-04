/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FolderKanban, ListTodo, Settings, LogOut, User } from 'lucide-react'
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
        title: 'Meus Itens',
        href: '/my-items',
        icon: ListTodo,
    },
    {
        title: 'Configurações',
        href: '/settings/profile',
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
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <div className="h-6 w-6 rounded-full bg-primary" />
                    <span>QAHub</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href || pathname.startsWith(item.href + '/')
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium">{user?.user_metadata?.name || 'Usuário'}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                </div>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    )
}
