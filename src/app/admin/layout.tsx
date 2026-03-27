'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Package,
  Settings,
  MapPin,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/agents', label: 'Agents', icon: Users, roles: ['ADMIN', 'MARKETING_MANAGER'] },
  { href: '/admin/locations', label: 'Locations', icon: MapPin, roles: ['ADMIN', 'MARKETING_MANAGER'] },
  { href: '/admin/users', label: 'Users', icon: UserCircle, roles: ['ADMIN'] },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['ADMIN'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['ADMIN', 'MARKETING_MANAGER'] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepSkyBlue" />
      </div>
    );
  }

  if (!session) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/images/soreti-logo.png" 
                alt="Soreti Logo" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-xl tracking-tight text-gray-900">Soreti <span className="text-gray-400 text-xs font-medium tracking-normal">Admin</span></span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(session.user.role))
              .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-deepSkyBlue/10 text-deepSkyBlue'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
             <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-sm font-semibold text-gray-900 capitalize hidden sm:block">
              {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pl-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-medium text-gray-700 hidden md:block">
                    {session.user?.name}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-deepSkyBlue text-white text-xs font-bold uppercase">
                      {session.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-gray-400 mr-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-gray-200 p-1">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                  Account
                </DropdownMenuLabel>
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem className="p-2 rounded-lg text-gray-700 focus:bg-gray-50 cursor-pointer">
                  <Settings className="w-4 h-4 mr-2 text-gray-400" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem onClick={handleLogout} className="p-2 rounded-lg text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
