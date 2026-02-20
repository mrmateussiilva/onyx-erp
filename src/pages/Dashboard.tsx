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
  revenue_change: string;
  sales_count: number;
  sales_change: string;
  client_count: number;
  client_change: string;
  alerts: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  category: string;
}

interface ExpiringGallon {
  id: number;
  client_name: string;
  brand: string;
  expiration_date: string;
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
    revenue_change: "+0%",
    sales_count: 0,
    sales_change: "+0",
    client_count: 0,
    client_change: "+0",
    alerts: 0,
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [expiringGallons, setExpiringGallons] = useState<ExpiringGallon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, salesData, productsData, gallonsData] = await Promise.all([
        invoke<DashboardData>("get_dashboard_stats"),
        invoke<Sale[]>("get_recent_sales"),
        invoke<Product[]>("get_popular_products"),
        invoke<ExpiringGallon[]>("get_expiring_gallons")
      ]);
      setStats(statsData);
      setRecentSales(salesData);
      setPopularProducts(productsData);
      setExpiringGallons(gallonsData);
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
      change: stats.revenue_change,
      icon: DollarSign,
    },
    {
      label: "Pedidos Hoje",
      value: stats.sales_count.toString(),
      change: stats.sales_change,
      icon: ShoppingCart,
    },
    {
      label: "Total de Clientes",
      value: stats.client_count.toString(),
      change: stats.client_change,
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
                {expiringGallons.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {expiringGallons.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {g.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {g.brand}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-semibold text-status-expiring">
                      Vence em:
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(g.expiration_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
              {expiringGallons.length === 0 && (
                <p className="p-6 text-sm text-center text-muted-foreground">
                  Nenhum galão vencendo em breve
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Products */}
      <Card className="card-shadow border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Produtos em Destaque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularProducts.map((prod) => {
              const combined = `${prod.name} ${prod.category}`.toLowerCase();
              const Icon = (combined.includes("gás") || combined.includes("glp")) ? Flame : Gem;

              return (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                      {prod.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      R$ {prod.price.toFixed(2)} • Estoque: {prod.stock_quantity}
                    </p>
                  </div>
                </div>
              );
            })}
            {popularProducts.length === 0 && (
              <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
                Nenhum produto cadastrado no momento
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
