import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ReportData {
  summary: {
    revenue: { value: string; change: string };
    sales_count: { value: string; change: string };
    average_ticket: { value: string; change: string };
    unique_clients: { value: string; change: string };
  };
  chart_data: { date: string; revenue: number }[];
  sales_list: {
    id: number;
    client_name: string;
    items: string;
    payment_method: string;
    total: number;
    created_at: string;
  }[];
}

const Relatorios = () => {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [paymentMethods, setPaymentMethods] = useState<{ id: number, name: string }[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const methods = await invoke<{ id: number, name: string }[]>("get_payment_methods");
      setPaymentMethods(methods);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo, paymentFilter]);

  const loadReport = async () => {
    try {
      setIsLoading(true);

      // Ajuste de Fuso Horário Local -> ISO UTC
      const start = new Date(dateFrom + 'T00:00:00');
      const end = new Date(dateTo + 'T23:59:59');

      const data = await invoke<ReportData>("get_sales_report", {
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        paymentMethod: paymentFilter
      });
      setReportData(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!reportData) return <div className="p-8 text-center">Carregando relatório...</div>;

  const stats = [
    { label: "Faturamento", ...reportData.summary.revenue, icon: DollarSign },
    { label: "Total de Vendas", ...reportData.summary.sales_count, icon: ShoppingCart },
    { label: "Ticket Médio", ...reportData.summary.average_ticket, icon: TrendingUp },
    { label: "Clientes Únicos", ...reportData.summary.unique_clients, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Análise inteligente de performance</p>
        </div>
        <Button variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <Card className="card-shadow border-border/60">
          <CardHeader className="p-4 pb-0">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full items-center justify-between p-0 hover:bg-transparent">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Filtros Avançados</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isFiltersOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-4 pt-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Período Inicial</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-xs w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Período Final</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 text-xs w-40" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Método de Pagamento</Label>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="h-9 text-xs w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Métodos</SelectItem>
                      {paymentMethods.map(m => (
                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="card-shadow border-none bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded",
                  s.change.startsWith('+') ? "bg-status-ok/10 text-status-ok" : "bg-destructive/10 text-destructive"
                )}>
                  {s.change}
                </span>
                <span className="text-[10px] text-muted-foreground">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="card-shadow border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Evolução do Faturamento</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reportData.chart_data}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(str) => new Date(str + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(str) => new Date(str).toLocaleDateString('pt-BR')}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="card-shadow border-border/60 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-base font-semibold">Listagem Detalhada</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/10 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Itens do Pedido</th>
                  <th className="px-6 py-4">Pagamento</th>
                  <th className="px-6 py-4 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {reportData.sales_list.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-xs">
                      {new Date(sale.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold">{sale.client_name}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                      {sale.items}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] bg-muted px-2 py-1 rounded-full font-medium">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-primary">
                      R$ {sale.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {reportData.sales_list.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      Nenhuma venda encontrada para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
