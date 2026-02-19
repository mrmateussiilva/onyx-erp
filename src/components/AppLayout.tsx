import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Package,
  Droplets,
  Search,
  Plus,
  UserPlus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Nova Venda", icon: ShoppingCart, path: "/nova-venda" },
  { label: "Clientes", icon: Users, path: "/clientes" },
  { label: "Produtos", icon: Package, path: "/produtos" },
  { label: "Relatórios", icon: BarChart3, path: "/relatorios" },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col bg-sidebar-bg">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-hover">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-fg-active leading-tight">AquaGás</span>
            <span className="text-[10px] text-sidebar-fg leading-tight">Distribuidora</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-hover px-2 py-3 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-sidebar-fg hover:bg-destructive/10 hover:text-destructive h-10"
            onClick={handleLogout}
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span className="text-sm">Sair do Sistema</span>
          </Button>
          <div className="px-3 pt-2">
            <p className="text-[10px] text-sidebar-fg/60 uppercase tracking-wider font-semibold">AquaGás Flow v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col pl-[220px]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6 card-shadow">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes, produtos..."
              className="pl-9 bg-muted border-0 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-sm">
              <Link to="/clientes">
                <UserPlus className="h-4 w-4" />
                Novo Cliente
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-sm">
              <Link to="/nova-venda">
                <Plus className="h-4 w-4" />
                Nova Venda
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
