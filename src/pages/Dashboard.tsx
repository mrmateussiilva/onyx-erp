import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Gem,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";

interface DashboardData {
  revenue: string;
  sales_count: number;
  client_count: number;
  alerts: number;
}

interface Sale {
  id: number;
  client_id: number;
  items: string;
  total: number;
  created_at: string;
  // Mock client name since we don't have the JOIN yet
  client_name?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardData>({
    revenue: "R$ 0,00",
    sales_count: 0,
    client_count: 0,
    alerts: 0,
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const statsData = await invoke<DashboardData>("get_dashboard_stats");
      const salesData = await invoke<Sale[]>(
        "get_recent_sales"
      );
      setStats(statsData);
      setRecentSales(salesData);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      label: "Vendas Hoje",
      value: stats.revenue,
      change: "+0%",
      icon: DollarSign,
    },
    {
      label: "Pedidos Hoje",
      value: stats.sales_count.toString(),
      change: "+0",
      icon: ShoppingCart,
    },
    {
      label: "Total de Clientes",
      value: stats.client_count.toString(),
      change: "+0",
      icon: Users,
    },
    {
      label: "Alertas",
      value: stats.alerts.toString(),
      change: "pendentes",
      icon: AlertTriangle,
      alert: stats.alerts > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão estratégica e monitoramento em tempo real
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link to="/nova-venda">
            <ShoppingCart className="h-4 w-4" />
            Nova Venda
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="card-shadow border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.alert ? "bg-status-expiring/15" : "bg-primary/10"
                    }`}
                >
                  <stat.icon
                    className={`h-5 w-5 ${stat.alert ? "text-status-expiring" : "text-primary"
                      }`}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {!stat.alert && (
                  <TrendingUp className="h-3 w-3 text-status-ok" />
                )}
                <span
                  className={stat.alert ? "text-status-expiring" : "text-status-ok"}
                >
                  {stat.change}
                </span>
                {!stat.alert && (
                  <span className="text-muted-foreground">vs ontem</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Sales */}
        <Card className="lg:col-span-3 card-shadow border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Vendas Recentes
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-primary"
              >
                <Link to="/relatorios">
                  Ver todas <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {sale.client_name || `Cliente #${sale.client_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sale.items}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-foreground">
                      R$ {sale.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <p className="p-6 text-sm text-center text-muted-foreground">
                  Nenhuma venda encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallon Alerts */}
        <Card className="lg:col-span-2 card-shadow border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-status-expiring" />
                Galões Vencendo
              </CardTitle>
              <span className="rounded-full bg-status-expiring/15 px-2 py-0.5 text-xs font-semibold text-status-expiring">
                0
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <p className="p-6 text-sm text-center text-muted-foreground">
                Nenhum alerta no momento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Products */}
      <Card className="card-shadow border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Produtos Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Água Mineral 20L",
                price: "R$ 18,00",
                icon: Gem,
                stock: 142,
              },
              { name: "Gás GLP P13", price: "R$ 60,00", icon: Flame, stock: 38 },
              { name: "Gás GLP P45", price: "R$ 135,00", icon: Flame, stock: 12 },
              {
                name: "Água Mineral 10L",
                price: "R$ 12,00",
                icon: Gem,
                stock: 85,
              },
            ].map((prod) => (
              <div
                key={prod.name}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <prod.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {prod.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {prod.price} • Estoque: {prod.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
