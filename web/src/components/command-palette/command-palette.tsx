'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, ArrowRight, Folder, CheckSquare, Users, Settings, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  description?: string
  href: string
  icon: React.ReactNode
  category: string
}

const defaultResults: SearchResult[] = [
  { id: 'overview', title: 'Overview', description: 'Dashboard home', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Navigation' },
  { id: 'projects', title: 'Projects', description: 'Manage projects', href: '/dashboard/projects', icon: <Folder className="w-4 h-4" />, category: 'Navigation' },
  { id: 'tasks', title: 'Tasks', description: 'Track work', href: '/dashboard/tasks', icon: <CheckSquare className="w-4 h-4" />, category: 'Navigation' },
  { id: 'team', title: 'Team', description: 'Manage members', href: '/dashboard/team', icon: <Users className="w-4 h-4" />, category: 'Navigation' },
  { id: 'settings', title: 'Settings', description: 'Account settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" />, category: 'Navigation' },
  { id: 'new-project', title: 'Create Project', description: 'Start a new project', href: '/dashboard/projects/new', icon: <Folder className="w-4 h-4" />, category: 'Actions' },
  { id: 'new-task', title: 'Create Task', description: 'Add a new task', href: '/dashboard/tasks/new', icon: <CheckSquare className="w-4 h-4" />, category: 'Actions' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Filter results
  const results = query.trim()
    ? defaultResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description?.toLowerCase().includes(query.toLowerCase())
      )
    : defaultResults

  // Group by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  // Keyboard shortcut to open (Cmd+K or Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  // Navigate results with arrow keys
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        router.push(results[selectedIndex].href)
        setOpen(false)
      }
    },
    [results, selectedIndex, router]
  )

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 z-50 w-full max-w-lg animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
              onKeyDown={handleKeyDown}
              className="flex-1 py-4 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              placeholder="Search pages, actions..."
            />
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[320px] overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {category}
                  </p>
                  {items.map((item) => {
                    const globalIndex = results.indexOf(item)
                    return (
                      <button
                        key={item.id}
                        onClick={() => { router.push(item.href); setOpen(false) }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm',
                          globalIndex === selectedIndex
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <span className="shrink-0 text-muted-foreground">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          )}
                        </div>
                        {globalIndex === selectedIndex && (
                          <ArrowRight className="w-3.5 h-3.5 shrink-0 text-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
