import { ReactNode, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CirclePlus as PlusCircle, Users, Bell, LogOut, Menu, X, ChevronDown, Printer, Building2, Wrench, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/solicitudes', label: 'Solicitudes', icon: FileText },
  { to: '/nueva', label: 'Nueva Solicitud', icon: PlusCircle },
];

const TECH_NAV = [
  { to: '/equipos', label: 'Equipos', icon: Printer },
  { to: '/historial', label: 'Historial Servicios', icon: Wrench },
  { to: '/lecturas', label: 'Lecturas', icon: BookOpen },
];

const ADMIN_NAV = [
  { to: '/equipos', label: 'Equipos', icon: Printer },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
  { to: '/historial', label: 'Historial Servicios', icon: Wrench },
  { to: '/lecturas', label: 'Lecturas', icon: BookOpen },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
];

const roleBadge = (role: string) => {
  const map: Record<string, string> = { admin: '👑 Admin', tecnico: '🔧 Técnico', usuario: '👤 Usuario' };
  return map[role] || role;
};

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout, unreadCount } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const extraNav = user.role === 'admin' ? ADMIN_NAV : user.role === 'tecnico' ? TECH_NAV : [];
  const allNav = [...NAV, ...extraNav];

  const NavItem = ({ n, onClick }: { n: typeof allNav[0]; onClick?: () => void }) => (
    <Link to={n.to} onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        location.pathname === n.to
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}>
      <n.icon className="h-4 w-4 shrink-0" />
      {n.label}
    </Link>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Printer className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight leading-none">Mongar</h1>
              <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">Renta & Venta de Impresoras</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {allNav.map(n => <NavItem key={n.to} n={n} />)}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{roleBadge(user.role)}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button className="lg:hidden p-1" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Printer className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-base">Mongar</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1">
            <Link to="/notificaciones" className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4.5 w-4.5" />
              </Button>
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 p-0 flex items-center justify-center text-[9px] bg-destructive text-destructive-foreground border-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hidden lg:flex h-9 px-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout} className="text-destructive gap-2">
                  <LogOut className="h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
                  <Printer className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-extrabold">Mongar</span>
              </div>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
              {allNav.map(n => <NavItem key={n.to} n={n} onClick={() => setMobileOpen(false)} />)}
            </nav>
            <div className="p-4 border-t border-sidebar-border text-sm">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{roleBadge(user.role)}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
