/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  Users,
  Download,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const sidebarItems = [
  { title: "Painel", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projetos", href: "/projects", icon: FolderKanban },
  { title: "Times", href: "/teams", icon: Users },
  { title: "Configurações", href: "/settings/profile", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.user_metadata?.name || "Minha Conta";

  return (
    <aside className="flex h-full min-h-0 w-[260px] flex-col border-r border-sidebar-border bg-sidebar/95">
      <div className="border-b border-border px-5 py-6">
        <Link href="/dashboard" onClick={onNavigate} className="block">
          <BrandLogo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-semibold tracking-[0.12em] uppercase transition-colors ${
                isActive
                  ? "bg-roxo text-white"
                  : "text-foreground/65 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="lu-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-amarelo" />
            <h4 className="text-xs font-semibold tracking-[0.16em] uppercase">Extensão QA</h4>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-foreground/65">
            Capture bugs mais rápido com a extensão do time.
          </p>
          <Link href="/tutorial" onClick={onNavigate} className="lu-btn-rosa w-full px-3 py-2">
            <span className="lu-btn-inner">
              <Download size={14} />
              Baixar
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            router.push("/settings/profile");
          }}
          className="mb-3 flex w-full items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rosa text-xs font-bold text-white">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-[11px] text-foreground/65">{user?.email}</p>
          </div>
        </button>
        <div className="space-y-2">
          <ThemeToggle />
          <button type="button" onClick={handleLogout} className="lu-btn-ghost w-full px-3 py-2">
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <ClipboardCheck size={16} className="text-amarelo" />
        <span className="font-mona text-xl tracking-[0.16em]">QA Hub</span>
      </div>
      <button type="button" onClick={onOpen} className="lu-btn-ghost px-3 py-2">
        Menu
      </button>
    </div>
  );
}
