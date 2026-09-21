"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

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

export function AuthShell({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <ShellBackground />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="icon" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <BrandLogo className="mx-auto h-10 w-auto" width={160} height={48} />
          </Link>
          <p className="mt-4 font-mona text-5xl tracking-[0.12em]">QA Hub</p>
          <p className="mt-2 text-sm text-foreground/65">
            {subtitle ?? "Gestão de qualidade dos projetos Layer Up."}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
