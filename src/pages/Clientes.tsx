import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
// ... (outros imports)

interface Client {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  // Temporariamente mockados enquanto não criamos as tabelas relacionadas
  since?: string;
  totalPedidos?: number;
  galoes?: any[];
  historico?: any[];
}

const Clientes = () => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await invoke<Client[]>("get_clients");
      // Mapear dados do Rust para o formato esperado pelo frontend (com fallbacks)
      const mappedData = data.map(client => ({
        ...client,
        since: new Date(client.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        totalPedidos: client.totalPedidos || 0,
        galoes: client.galoes || [],
        historico: client.historico || []
      }));

      setClients(mappedData);
      if (mappedData.length > 0 && selectedId === null) {
        setSelectedId(mappedData[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = clients.find((c) => c.id === selectedId) || {
    id: 0,
    name: "Carregando...",
    phone: "",
    address: "",
    since: "-",
    totalPedidos: 0,
    galoes: [],
    historico: []
  };

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
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${selectedId === client.id
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
