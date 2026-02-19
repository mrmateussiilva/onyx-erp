import {
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Droplets,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";

const statsCards = [
  { label: "Vendas Hoje", value: "R$ 2.450", change: "+12%", icon: DollarSign },
  { label: "Pedidos Hoje", value: "34", change: "+5", icon: ShoppingCart },
  { label: "Novos Clientes", value: "8", change: "+3", icon: Users },
  { label: "Alertas", value: "5", change: "pendentes", icon: AlertTriangle, alert: true },
];

const recentSales = [
  { id: 1, client: "Maria Silva", items: "2x Água 20L, 1x Gás P13", total: "R$ 89,00", time: "14:32" },
  { id: 2, client: "João Santos", items: "1x Gás P45", total: "R$ 135,00", time: "13:15" },
  { id: 3, client: "Ana Costa", items: "3x Água 20L", total: "R$ 54,00", time: "12:45" },
  { id: 4, client: "Pedro Lima", items: "1x Água 20L, 1x Gás P13", total: "R$ 67,00", time: "11:20" },
  { id: 5, client: "Carla Mendes", items: "2x Gás P13", total: "R$ 120,00", time: "10:50" },
];

const galonAlerts = [
  { client: "Maria Silva", galoes: 3, vencimento: "15/03/2026", status: "expiring" as const },
  { client: "João Santos", galoes: 1, vencimento: "10/03/2026", status: "expiring" as const },
  { client: "Restaurante Boa Mesa", galoes: 5, vencimento: "01/03/2026", status: "expired" as const },
  { client: "Padaria Central", galoes: 2, vencimento: "28/02/2026", status: "expired" as const },
  { client: "Ana Costa", galoes: 1, vencimento: "20/03/2026", status: "expiring" as const },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da distribuidora</p>
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
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    stat.alert ? "bg-status-expiring/15" : "bg-primary/10"
                  }`}
                >
                  <stat.icon
                    className={`h-5 w-5 ${stat.alert ? "text-status-expiring" : "text-primary"}`}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {!stat.alert && <TrendingUp className="h-3 w-3 text-status-ok" />}
                <span className={stat.alert ? "text-status-expiring" : "text-status-ok"}>
                  {stat.change}
                </span>
                {!stat.alert && <span className="text-muted-foreground">vs ontem</span>}
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
              <CardTitle className="text-base font-semibold">Vendas Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs text-primary">
                <Link to="/relatorios">
                  Ver todas <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{sale.client}</p>
                    <p className="text-xs text-muted-foreground truncate">{sale.items}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-foreground">{sale.total}</p>
                    <p className="text-xs text-muted-foreground">{sale.time}</p>
                  </div>
                </div>
              ))}
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
                {galonAlerts.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {galonAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.client}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Droplets className="h-3 w-3" /> {alert.galoes} galões
                      </span>
                      <span className="text-xs text-muted-foreground">• {alert.vencimento}</span>
                    </div>
                  </div>
                  <StatusBadge status={alert.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Products */}
      <Card className="card-shadow border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Produtos Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Água Mineral 20L", price: "R$ 18,00", icon: Droplets, stock: 142 },
              { name: "Gás GLP P13", price: "R$ 60,00", icon: Flame, stock: 38 },
              { name: "Gás GLP P45", price: "R$ 135,00", icon: Flame, stock: 12 },
              { name: "Água Mineral 10L", price: "R$ 12,00", icon: Droplets, stock: 85 },
            ].map((prod) => (
              <div
                key={prod.name}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <prod.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{prod.name}</p>
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
