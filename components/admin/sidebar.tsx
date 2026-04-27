'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, BookOpen, Calendar, FileText, Users, Settings } from 'lucide-react'
import { logoutAdmin } from '@/lib/auth/actions'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Settings },
  { href: '/admin/recipes', label: 'Recetas', icon: BookOpen },
  { href: '/admin/activities', label: 'Actividades', icon: Calendar },
  { href: '/admin/registrations', label: 'Registros', icon: Users },
  { href: '/admin/event-settings', label: 'Configuración', icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    const result = await logoutAdmin()
    if (result.success) {
      window.location.href = '/admin/login'
    }
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">NutriKids Admin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
