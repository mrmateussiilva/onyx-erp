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
} from "lucide-react";
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

interface Sale {
  id: number;
  client_id: number;
  items: string;
  total: number;
  payment_method?: string; // Mock por enquanto
  created_at: string;
  client_name?: string;
}

const Relatorios = () => {
  const [dateFrom, setDateFrom] = useState("2026-02-01");
  const [dateTo, setDateTo] = useState("2026-02-19");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo, paymentFilter]);

  const loadReport = async () => {
    try {
      const data = await invoke<Sale[]>("get_sales_report", {
        fromDate: dateFrom,
        toDate: dateTo,
        paymentMethod: paymentFilter
      });
      setSales(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const summaryCards = [
    {
      label: "Faturamento",
      value: `R$ ${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}`,
      icon: DollarSign,
      change: "+0%"
    },
    { label: "Total de Vendas", value: sales.length.toString(), icon: ShoppingCart, change: "+0%" },
    {
      label: "Ticket Médio",
      value: `R$ ${(sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0).toFixed(2)}`,
      icon: TrendingUp,
      change: "+0%"
    },
    { label: "Vendas Únicas", value: new Set(sales.map(s => s.client_id)).size.toString(), icon: Users, change: "+0" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Análise de vendas e faturamento</p>
        </div>
        <Button variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-shadow border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtros</span>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">De</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-9 w-40"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Até</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-9 w-40"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Pagamento</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartão">Cartão</SelectItem>
                  <SelectItem value="fiado">Fiado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((stat) => (
          <Card key={stat.label} className="card-shadow border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-status-ok">{stat.change} vs período anterior</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales table */}
      <Card className="card-shadow border-border/60">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">
            Vendas no Período
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({sales.length} registros)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground">Data</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground">Cliente</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground">Itens</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground">Pagamento</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 text-sm">
                      {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">
                      {sale.client_name || `Cliente #${sale.client_id}`}
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{sale.items}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {sale.payment_method || "Não inf."}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-right">
                      R$ {sale.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Nenhuma venda encontrada para o período selecionado
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
