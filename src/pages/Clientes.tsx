import { useState } from "react";
import {
  Search,
  UserPlus,
  Phone,
  MapPin,
  Droplets,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";

const clients = [
  {
    id: 1,
    name: "Maria Silva",
    phone: "(11) 98765-4321",
    address: "Rua A, 123 - Centro",
    since: "Jan 2024",
    totalPedidos: 48,
    galoes: [
      { id: "G001", vencimento: "15/03/2026", status: "expiring" as const },
      { id: "G002", vencimento: "20/06/2026", status: "ok" as const },
      { id: "G003", vencimento: "01/03/2026", status: "expired" as const },
    ],
    historico: [
      { data: "18/02/2026", items: "2x Água 20L", total: "R$ 36,00", pagamento: "PIX" },
      { data: "15/02/2026", items: "1x Gás P13", total: "R$ 60,00", pagamento: "Dinheiro" },
      { data: "10/02/2026", items: "3x Água 20L", total: "R$ 54,00", pagamento: "PIX" },
      { data: "05/02/2026", items: "1x Água 20L, 1x Gás P13", total: "R$ 78,00", pagamento: "Cartão" },
    ],
  },
  {
    id: 2,
    name: "João Santos",
    phone: "(11) 91234-5678",
    address: "Av. B, 456 - Jardins",
    since: "Mar 2024",
    totalPedidos: 32,
    galoes: [{ id: "G004", vencimento: "10/03/2026", status: "expiring" as const }],
    historico: [
      { data: "17/02/2026", items: "1x Gás P45", total: "R$ 135,00", pagamento: "Dinheiro" },
      { data: "12/02/2026", items: "2x Água 20L", total: "R$ 36,00", pagamento: "PIX" },
    ],
  },
  {
    id: 3,
    name: "Ana Costa",
    phone: "(11) 99876-5432",
    address: "Rua C, 789 - Vila Nova",
    since: "Jun 2024",
    totalPedidos: 19,
    galoes: [
      { id: "G005", vencimento: "20/07/2026", status: "ok" as const },
    ],
    historico: [
      { data: "16/02/2026", items: "1x Água 20L", total: "R$ 18,00", pagamento: "PIX" },
    ],
  },
  {
    id: 4,
    name: "Restaurante Boa Mesa",
    phone: "(11) 3333-4444",
    address: "Av. Central, 1000 - Centro",
    since: "Nov 2023",
    totalPedidos: 125,
    galoes: [
      { id: "G006", vencimento: "01/03/2026", status: "expired" as const },
      { id: "G007", vencimento: "01/03/2026", status: "expired" as const },
      { id: "G008", vencimento: "15/05/2026", status: "ok" as const },
      { id: "G009", vencimento: "15/05/2026", status: "ok" as const },
      { id: "G010", vencimento: "10/03/2026", status: "expiring" as const },
    ],
    historico: [
      { data: "18/02/2026", items: "5x Água 20L, 2x Gás P13", total: "R$ 210,00", pagamento: "Fiado" },
      { data: "14/02/2026", items: "5x Água 20L", total: "R$ 90,00", pagamento: "PIX" },
    ],
  },
];

const Clientes = () => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number>(1);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = clients.find((c) => c.id === selectedId) || clients[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
        </div>
        <Button className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client List */}
        <Card className="card-shadow border-border/60">
          <CardContent className="p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              {filtered.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedId(client.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selectedId === client.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.totalPedidos} pedidos</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Detail */}
        <Card className="lg:col-span-2 card-shadow border-border/60">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg">{selected.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Cliente desde {selected.since}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>

            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {selected.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {selected.address}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            <Tabs defaultValue="dados">
              <TabsList className="w-full justify-start bg-muted/50">
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="galoes">Galões</TabsTrigger>
              </TabsList>

              <TabsContent value="dados" className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total de Pedidos", value: selected.totalPedidos.toString() },
                    { label: "Galões em Posse", value: selected.galoes.length.toString() },
                    {
                      label: "Alertas",
                      value: selected.galoes
                        .filter((g) => g.status !== "ok")
                        .length.toString(),
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg bg-muted/50 p-4 text-center"
                    >
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border/60 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Informações</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium">{selected.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Endereço</p>
                      <p className="font-medium">{selected.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente desde</p>
                      <p className="font-medium">{selected.since}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total de Pedidos</p>
                      <p className="font-medium">{selected.totalPedidos}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="historico" className="mt-4">
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Data</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Itens</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Pagamento</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selected.historico.map((h, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-2.5 text-sm flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {h.data}
                          </td>
                          <td className="px-4 py-2.5 text-sm">{h.items}</td>
                          <td className="px-4 py-2.5 text-sm text-muted-foreground">{h.pagamento}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-right">{h.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="galoes" className="mt-4">
                <div className="space-y-2">
                  {selected.galoes.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Droplets className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Galão {g.id}</p>
                          <p className="text-xs text-muted-foreground">Vencimento: {g.vencimento}</p>
                        </div>
                      </div>
                      <StatusBadge status={g.status} />
                    </div>
                  ))}
                  {selected.galoes.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nenhum galão registrado</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Clientes;
