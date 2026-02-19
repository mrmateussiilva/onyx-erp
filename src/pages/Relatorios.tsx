import { useState } from "react";
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

const summaryCards = [
  { label: "Faturamento", value: "R$ 18.450", icon: DollarSign, change: "+8%" },
  { label: "Total de Vendas", value: "312", icon: ShoppingCart, change: "+12%" },
  { label: "Ticket Médio", value: "R$ 59,13", icon: TrendingUp, change: "+3%" },
  { label: "Clientes Ativos", value: "87", icon: Users, change: "+5" },
];

const salesData = [
  { data: "18/02/2026", cliente: "Maria Silva", items: "2x Água 20L", pagamento: "PIX", total: "R$ 36,00" },
  { data: "18/02/2026", cliente: "Restaurante Boa Mesa", items: "5x Água 20L, 2x Gás P13", pagamento: "Fiado", total: "R$ 210,00" },
  { data: "17/02/2026", cliente: "João Santos", items: "1x Gás P45", pagamento: "Dinheiro", total: "R$ 135,00" },
  { data: "16/02/2026", cliente: "Ana Costa", items: "1x Água 20L", pagamento: "PIX", total: "R$ 18,00" },
  { data: "15/02/2026", cliente: "Maria Silva", items: "1x Gás P13", pagamento: "Dinheiro", total: "R$ 60,00" },
  { data: "15/02/2026", cliente: "Pedro Lima", items: "2x Água 20L, 1x Gás P13", pagamento: "Cartão", total: "R$ 96,00" },
  { data: "14/02/2026", cliente: "Restaurante Boa Mesa", items: "5x Água 20L", pagamento: "PIX", total: "R$ 90,00" },
  { data: "14/02/2026", cliente: "Carla Mendes", items: "2x Gás P13", pagamento: "Dinheiro", total: "R$ 120,00" },
  { data: "13/02/2026", cliente: "João Santos", items: "2x Água 20L", pagamento: "PIX", total: "R$ 36,00" },
  { data: "12/02/2026", cliente: "Ana Costa", items: "1x Gás P13", pagamento: "Cartão", total: "R$ 60,00" },
];

const Relatorios = () => {
  const [dateFrom, setDateFrom] = useState("2026-02-01");
  const [dateTo, setDateTo] = useState("2026-02-19");
  const [paymentFilter, setPaymentFilter] = useState("todos");

  const filtered = salesData.filter((s) => {
    if (paymentFilter !== "todos" && s.pagamento.toLowerCase() !== paymentFilter) return false;
    return true;
  });

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
              ({filtered.length} registros)
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
                {filtered.map((sale, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 text-sm">{sale.data}</td>
                    <td className="px-6 py-3 text-sm font-medium">{sale.cliente}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{sale.items}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {sale.pagamento}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-right">{sale.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
