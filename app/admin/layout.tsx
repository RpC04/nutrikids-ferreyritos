import { AdminSidebar } from '@/components/admin/sidebar'
import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isLoginRoute = pathname.startsWith('/admin/login')

  if (isLoginRoute) {
    return <>{children}</>
  }

  const session = await verifySession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
