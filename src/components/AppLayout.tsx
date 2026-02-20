import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Package,
  Droplets,
  Plus,
  UserPlus,
  LogOut,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
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
  { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredItems = navItems.filter(item => {
    if (item.path === "/configuracoes") return isAdmin;
    return true;
  });

  return (
    <div className="flex min-h-screen w-full bg-background/50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar-bg transition-all duration-300 ease-in-out border-r border-sidebar-hover shadow-xl",
          isCollapsed ? "w-[80px]" : "w-[260px]"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-hover bg-sidebar-bg text-sidebar-fg hover:text-sidebar-fg-active shadow-md transition-all z-50 group"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 transition-transform group-hover:scale-110" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Logo */}
        <div className={cn(
          "flex h-20 items-center border-b border-sidebar-hover transition-all duration-300",
          isCollapsed ? "px-0 justify-center" : "px-6"
        )}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 shrink-0">
            <Gem className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col ml-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-base font-bold text-sidebar-fg-active leading-tight tracking-tight">Onyx ERP</span>
              <span className="text-xs text-sidebar-fg leading-tight opacity-70">Soluções Corporativas</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 group relative",
                  isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-4",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active"
                )}
              >
                <Icon className={cn(
                  "shrink-0 transition-transform group-hover:scale-110",
                  isCollapsed ? "h-6 w-6" : "h-[22px] w-[22px]",
                  isActive ? "text-primary-foreground" : "text-sidebar-fg group-hover:text-primary"
                )} />

                {!isCollapsed && (
                  <span className="text-sm font-semibold tracking-wide whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 hidden group-hover:block z-50">
                    <div className="bg-sidebar-bg border border-sidebar-hover text-sidebar-fg px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                      {item.label}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "mt-auto border-t border-sidebar-hover py-4 flex flex-col gap-3 transition-all duration-300",
          isCollapsed ? "px-2 items-center" : "px-4"
        )}>
          {/* User Profile Info */}
          <div className={cn(
            "flex items-center gap-3 mb-2 transition-all group/profile relative",
            isCollapsed ? "justify-center px-0" : "px-2"
          )}>
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-primary-foreground font-bold shadow-md border-2 border-primary/20">
              {(user.username || "A").charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-sm font-bold text-sidebar-fg-active truncate capitalize">{user.username || "Admin"}</span>
                <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                  {user.role || "operador"}
                </span>
              </div>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 hidden group-hover/profile:block z-50">
                <div className="bg-sidebar-bg border border-sidebar-hover text-sidebar-fg px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                  {user.username} ({user.role})
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start text-sidebar-fg hover:bg-destructive/10 hover:text-destructive h-12 transition-all group",
              isCollapsed ? "px-0 justify-center" : "gap-4 px-4"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn(
              "shrink-0 transition-transform group-hover:scale-110",
              isCollapsed ? "h-6 w-6" : "h-[20px] w-[20px]"
            )} />
            {!isCollapsed && (
              <span className="text-sm font-semibold animate-in fade-in slide-in-from-left-2 duration-300">Sair do Sistema</span>
            )}

            {isCollapsed && (
              <div className="absolute left-full ml-4 hidden group-hover:block z-50">
                <div className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                  Sair
                </div>
              </div>
            )}
          </Button>
          {!isCollapsed && (
            <div className="px-4 pt-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-[10px] text-sidebar-fg/60 uppercase tracking-widest font-black">AquaGás Flow v0.0.1</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "pl-[80px]" : "pl-[260px]"
        )}
      >
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
