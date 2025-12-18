/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
    LayoutDashboard, 
    FolderKanban, 
    Settings, 
    LogOut, 
    User, 
    Users,
    Download,
    Sparkles
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
        title: 'Times',
        href: '/teams',
        icon: Users,
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
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card/95 text-card-foreground backdrop-blur-sm">
            {/* Header com Logo e Theme Toggle */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image 
                        src="/LOGO-LAYER.png" 
                        alt="Layer Up" 
                        width={100} 
                        height={28} 
                        className="h-6 w-auto object-contain dark:hidden"
                        priority
                    />
                    <Image 
                        src="/LOGO-LAYER-DARK.png" 
                        alt="Layer Up" 
                        width={100} 
                        height={28} 
                        className="hidden h-6 w-auto object-contain dark:block"
                        priority
                    />
                </Link>
                <ThemeToggle />
            </div>
            
            {/* Faixa de gradiente Layer Up */}
            <div className="h-1 w-full bg-linear-to-r from-[#7900E5] via-[#7900E5] to-[#ffcc00]" />

            {/* Navigation */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start gap-1 px-3 text-sm font-medium">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                                    isActive
                                        ? "bg-[#7900E5]/10 font-semibold"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-4 w-4 transition-transform group-hover:scale-110"
                                )} />
                                <span className={cn(isActive && "font-montserrat")}>{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Card da Extensão */}
            <div className="px-3 pb-3">
                <div className="relative overflow-hidden rounded-xl border border-[#7900E5]/20 bg-linear-to-br from-[#7900E5]/10 via-[#7900E5]/5 to-transparent p-4 shadow-sm">
                    {/* Efeito de brilho decorativo */}
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#7900E5]/20 blur-2xl" />
                    
                    <div className="relative z-10 mb-2 flex items-center gap-2">
                        <div className="rounded-md bg-[#7900E5]/10 p-1.5 text-[#7900E5]">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <h4 className="font-montserrat text-sm font-semibold">Extensão QA</h4>
                    </div>
                    
                    <p className="relative z-10 mb-3 text-xs leading-relaxed text-muted-foreground">
                        Capture bugs 10x mais rápido instalando nossa extensão.
                    </p>
                    
                    <Link href="/tutorial" className="relative z-10 block">
                        <Button 
                            size="sm" 
                            className="h-8 w-full bg-[#7900E5] text-xs font-semibold text-white shadow-none hover:bg-[#ff28c6]"
                        >
                            <Download className="mr-1.5 h-3 w-3" />
                            Baixar Agora
                        </Button>
                    </Link>
                </div>
            </div>

            {/* User Footer */}
            <div className="border-t border-border p-3">
                <div 
                    className="group mb-3 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50" 
                    onClick={() => router.push('/settings/profile')}
                >
                    <Avatar className="h-9 w-9 border-2 border-[#7900E5]/20 transition-all group-hover:border-[#7900E5]/50">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-linear-to-br from-[#7900E5]/10 to-[#7900E5]/10 text-[#7900E5]">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium transition-colors group-hover:text-[#7900E5]">
                            {user?.user_metadata?.name || 'Minha Conta'}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </span>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    className="h-9 w-full justify-start gap-2 border-red-200/50 text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    )
}