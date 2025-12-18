'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true
    
    const storedTheme = window.localStorage.getItem('theme')
    const shouldUseDark =
      storedTheme === 'dark' || (!storedTheme && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    
    return shouldUseDark
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement
    const nextIsDark = !isDark

    setIsDark(nextIsDark)

    if (nextIsDark) {
      root.classList.add('dark')
      window.localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      window.localStorage.setItem('theme', 'light')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'h-8 w-8 border-border bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground',
        'dark:bg-input/40 dark:text-foreground',
        className
      )}
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}

