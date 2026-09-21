"use client";

import { useState } from "react";
import { MobileTopBar, Sidebar } from "@/components/layout/Sidebar";

function ShellBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="ambient-blob-roxo absolute top-1/4 right-[18%] h-[520px] w-[520px] rounded-full" />
      <div className="ambient-blob-amarelo absolute bottom-1/4 left-[10%] h-[380px] w-[380px] rounded-full" />
      <div className="ambient-blob-rosa absolute top-1/2 right-[4%] h-[280px] w-[280px] rounded-full" />
      <div className="ambient-grid absolute inset-0" />
      <div className="absolute top-0 left-1/2 h-px w-full -translate-x-1/2 bg-linear-to-r from-transparent via-roxo/40 to-transparent" />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <ShellBackground />
      <div className="hidden h-full lg:block">
        <Sidebar />
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 h-full">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <MobileTopBar onOpen={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
