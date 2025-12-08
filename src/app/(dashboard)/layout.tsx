import { Sidebar } from '@/components/layout/Sidebar' // Ajuste o import conforme seu projeto

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 1. Container Pai: Ocupa 100% da altura da tela e trava o scroll geral
    <div className="flex h-screen w-full overflow-hidden bg-background">
      
      {/* 2. Sidebar: Fica fixa naturalmente pois o pai não rola */}
      {/* Certifique-se que o componente Sidebar não tenha altura fixa menor que 100% */}
      <Sidebar />

      {/* 3. Área Principal: Ocupa o resto do espaço e TEM SCROLL PRÓPRIO */}
      <main className="flex-1 p-7 overflow-y-auto h-full">
        {/* Adicione padding aqui se necessário, ex: p-6 */}
        {children}
      </main>
    </div>
  )
}