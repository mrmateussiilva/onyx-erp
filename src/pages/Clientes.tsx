import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Users,
  Plus,
  Search,
  History,
  Gem,
  Calendar,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Phone,
  MapPin,
  ShoppingCart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "@/components/ui/sonner";
import { maskCEP, maskCPFCNPJ, maskPhone } from "@/lib/utils/masks";

interface Client {
  id: number;
  name: string;
  phone: string | null;
  document: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  observations: string | null;
  created_at: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const handleCEPChange = async (value: string) => {
    const formatted = maskCEP(value);
    setCep(formatted);

    const pureCEP = formatted.replace(/\D/g, "");
    if (pureCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${pureCEP}/json/`);
        const data = await response.json();

        if (data.erro) {
          toast.error("CEP não encontrado");
          return;
        }

        setCity(data.localidade || "");
        setState(data.uf || "");
        if (data.logradouro) {
          setAddress(prev => {
            const complement = data.bairro ? `, ${data.bairro}` : "";
            return `${data.logradouro}${complement}`;
          });
        }
        toast.success("Endereço preenchido automaticamente!");
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  useEffect(() => {
    if (selectedId) {
      loadDetails();
    }
  }, [selectedId]);

  const handleSaveClient = async () => {
    if (!name) return toast.error("O nome é obrigatório");
    try {
      const payload = {
        name,
        phone: phone || null,
        document: document || null,
        cep: cep || null,
        city: city || null,
        state: state || null,
        address: address || null,
        observations: observations || null,
      };

      if (isEditing && editingId) {
        await invoke("update_client", { id: editingId, ...payload });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await invoke("create_client", payload);
        toast.success("Cliente cadastrado com sucesso!");
      }

      setIsDialogOpen(false);
      resetForm();
      loadClients();
    } catch (error) {
      toast.error("Erro ao salvar cliente: " + error);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setPhone("");
    setDocument("");
    setCep("");
    setCity("");
    setState("");
    setAddress("");
    setObservations("");
  };

  const handleEditClick = (client: Client) => {
    setIsEditing(true);
    setEditingId(client.id);
    setName(client.name || "");
    setPhone(client.phone || "");
    setDocument(client.document || "");
    setCep(client.cep || "");
    setCity(client.city || "");
    setState(client.state || "");
    setAddress(client.address || "");
    setObservations(client.observations || "");
    setIsDialogOpen(true);
  };

  const loadDetails = async () => {
    if (!selectedId) return;
    try {
      const details = await invoke<any>("get_client_details", { client_id: selectedId });

      // Verificação defensiva se o ID ainda é o mesmo após o await
      setClients(prev => {
        const index = prev.findIndex(c => c.id === selectedId);
        if (index === -1) return prev;

        const newClients = [...prev];
        newClients[index] = {
          ...newClients[index],
          totalPedidos: details.totalPedidos,
          historico: details.historico.map((h: any) => ({
            data: new Date(h.created_at).toLocaleDateString('pt-BR'),
            items: h.items,
            pagamento: h.payment_method || "Não informado", // Confirmando snake_case
            total: `R$ ${h.total.toFixed(2)} `
          })),
          galoes: details.galoes.map((g: any) => ({
            id: g.id,
            brand: g.brand,
            vencimento: new Date(g.expiration_date).toLocaleDateString('pt-BR'),
            status: new Date(g.expiration_date) < new Date() ? "expired" :
              new Date(g.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "expiring" : "ok",
          }))
        };
        return newClients;
      });
    } catch (e) {
      console.error("Erro ao carregar detalhes do cliente:", e);
    }
  };

  const loadClients = async () => {
    try {
      const data = await invoke<Client[]>("get_clients");
      setClients(prev => {
        return data.map(client => {
          const existing = prev.find(c => c.id === client.id);
          return {
            ...client,
            since: new Date(client.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            totalPedidos: existing?.totalPedidos || 0,
            galoes: existing?.galoes || [],
            historico: existing?.historico || []
          };
        });
      });

      if (data.length > 0 && selectedId === null) {
        setSelectedId(data[0].id);
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-1.5" onClick={() => setIsEditing(false)}>
              <UserPlus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Cliente" : "Cadastrar Novo Cliente"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Altere as informações do cliente abaixo." : "Insira as informações detalhadas para o novo cadastro."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="document">CPF ou CNPJ</Label>
                <Input
                  id="document"
                  value={document}
                  onChange={(e) => setDocument(maskCPFCNPJ(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Ex: SP"
                  maxLength={2}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="observations">Observações</Label>
                <Input
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveClient}>{isEditing ? "Salvar Alterações" : "Salvar Cliente"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                    } `}
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
              <Button variant="outline" size="sm" onClick={() => handleEditClick(selected as Client)}>
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
                <div className="rounded-lg border border-border/60 p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Informações Cadastrais</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">CPF / CNPJ</p>
                      <p className="font-medium">{selected.document || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Telefone</p>
                      <p className="font-medium">{selected.phone || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">CEP</p>
                      <p className="font-medium">{selected.cep || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Cidade / UF</p>
                      <p className="font-medium">{selected.city && selected.state ? `${selected.city} - ${selected.state}` : selected.city || selected.state || "Não informado"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Endereço Completo</p>
                      <p className="font-medium">{selected.address || "Não informado"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Observações</p>
                      <p className="font-medium text-xs leading-relaxed italic">{selected.observations || "Sem observações"}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="historico" className="mt-4">
                {!selected.historico || selected.historico.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed border-border/60 text-center">
                    <History className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">Nenhuma compra registrada</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">O histórico de pedidos aparecerá aqui</p>
                  </div>
                ) : (
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
                            <td className="px-4 py-2.5 text-sm">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {h.data}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-sm">{h.items}</td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">{h.pagamento}</td>
                            <td className="px-4 py-2.5 text-sm font-semibold text-right text-primary">{h.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="galoes" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold">Galões em Posse</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Gem className="h-3.5 w-3.5" /> Adicionar Galão
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Novo Galão</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Marca do Galão</Label>
                          <Input id="brand" placeholder="Ex: Indaiá, Minalba..." />
                        </div>
                        <div className="grid gap-2">
                          <Label>Data de Vencimento</Label>
                          <Input id="exp_date" type="date" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={async () => {
                          const brandElement = document.getElementById('brand') as HTMLInputElement;
                          const expDateElement = document.getElementById('exp_date') as HTMLInputElement;
                          const brand = brandElement.value;
                          const expDate = expDateElement.value;

                          if (!brand || !expDate) {
                            toast.error("Preencha todos os campos");
                            return;
                          }

                          try {
                            await invoke("add_client_gallon", {
                              clientId: selectedId,
                              brand,
                              expirationDate: new Date(expDate).toISOString()
                            });
                            loadDetails();
                            toast.success("Galão registrado com sucesso!");
                            // Limpar campos
                            brandElement.value = "";
                            expDateElement.value = "";
                          } catch (err) {
                            toast.error(String(err));
                          }
                        }}>Salvar Galão</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {selected.galoes.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Gem className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {g.brand ? `${g.brand} (#${g.id})` : `Galão #${g.id} `}
                          </p>
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
