import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Save,
  Gem,
  Flame,
  User,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";

interface Client {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ShippingMethod {
  id: number;
  name: string;
  fee: number;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

const NovaVenda = () => {
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("");

  const loadData = async () => {
    try {
      const [p, s, pay] = await Promise.all([
        invoke<Product[]>("get_products"),
        invoke<ShippingMethod[]>("get_shipping_methods"),
        invoke<PaymentMethod[]>("get_payment_methods")
      ]);
      setProducts(p);
      setShippingMethods(s);
      setPaymentMethods(pay);
    } catch (err) {
      console.error(err);
    }
  };

  const searchClients = async () => {
    try {
      const allClients = await invoke<Client[]>("get_clients");
      setClients(allClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase())
      ));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showSuggestions) {
      searchClients();
    }
  }, [clientSearch, showSuggestions]);

  const filteredClients = clients;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = shippingMethods.find(m => m.name === selectedShipping)?.fee || 0;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = cart.map(i => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${i.qty}x ${i.name}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">R$ ${(i.price * i.qty).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Onyx ERP - Pedido</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #C6A75E; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #000; letter-spacing: -1px; }
            .subtitle { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .total-row { font-size: 20px; font-weight: bold; }
            .total-label { text-align: right; padding-right: 20px; }
            .total-value { color: #C6A75E; text-align: right; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            .info { margin-bottom: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Onyx ERP</div>
            <div class="subtitle">Soluções Corporativas</div>
          </div>
          
          <div class="info">
            <strong>Cliente:</strong> ${selectedClient?.name || 'Não informado'}<br>
            <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}<br>
            <strong>Pagamento:</strong> ${selectedPayment}<br>
            <strong>Entrega:</strong> ${selectedShipping}
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 2px solid #eee; padding-bottom: 10px;">Item</th>
                <th style="text-align: right; border-bottom: 2px solid #eee; padding-bottom: 10px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table>
            <tr class="total-row">
              <td class="total-label">TOTAL</td>
              <td class="total-value">R$ ${(subtotal + shippingFee).toFixed(2)}</td>
            </tr>
          </table>

          <div class="footer">
            Gerado por Onyx ERP - ${new Date().getFullYear()}
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveSale = async (shouldPrint: boolean = false) => {
    if (!selectedClient || cart.length === 0 || !selectedPayment || !selectedShipping) return;

    try {
      const itemsString = cart.map(i => `${i.qty}x ${i.name}`).join(", ");
      await invoke("create_sale", {
        clientId: selectedClient.id,
        items: itemsString,
        total: subtotal + shippingFee,
        paymentMethod: selectedPayment
      });

      if (shouldPrint) {
        handlePrint();
      }

      toast.success("Venda realizada com sucesso!");
      setCart([]);
      setSelectedClient(null);
      setClientSearch("");
      setSelectedPayment("");
      setSelectedShipping("");
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      toast.error("Erro ao salvar venda.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nova Venda</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-5">
          {/* Client */}
          <Card className="card-shadow border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente por nome..."
                  className="pl-9"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowSuggestions(true);
                    if (!e.target.value) setSelectedClient(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && clientSearch && !selectedClient && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-card shadow-lg">
                    {filteredClients.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">Nenhum cliente encontrado</div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => {
                            setSelectedClient(client);
                            setClientSearch(client.name);
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.phone} • {client.address}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedClient && (
                <div className="mt-3 flex items-center gap-3 rounded-lg bg-muted p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedClient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedClient.phone} • {selectedClient.address}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="card-shadow border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Adicionar Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => {
                  const Icon = product.category === "gás" ? Flame : Gem;
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-3 rounded-lg border border-border/60 p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-sm font-semibold text-primary">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
                {products.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                    Carregue o catálogo em Gestão para vender.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart / Summary */}
        <div className="lg:col-span-2">
          <Card className="card-shadow border-border/60 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCartEmpty />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum item adicionado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {item.price.toFixed(2)} un.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <p className="w-20 text-right text-sm font-semibold">
                        R$ {(item.price * item.qty).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Payment and Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Pagamento</Label>
                  <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                    <SelectTrigger className="mt-1.5 h-9 text-xs">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(m => (
                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Entrega</Label>
                  <Select value={selectedShipping} onValueChange={setSelectedShipping}>
                    <SelectTrigger className="mt-1.5 h-9 text-xs">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingMethods.map(m => (
                        <SelectItem key={m.id} value={m.name}>{m.name} (+R${m.fee.toFixed(2)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Subtotal</span>
                  <span className="text-xs font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Taxa de Entrega</span>
                  <span className="text-xs font-medium">R$ {shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">R$ {(subtotal + shippingFee).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full gap-2 h-11 text-sm font-semibold"
                  disabled={cart.length === 0 || !selectedClient || !selectedPayment || !selectedShipping}
                  onClick={() => handleSaveSale(true)}
                >
                  <Printer className="h-4 w-4" />
                  Salvar e Imprimir
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-sm"
                  disabled={cart.length === 0 || !selectedClient || !selectedPayment || !selectedShipping}
                  onClick={() => handleSaveSale(false)}
                >
                  <Save className="h-4 w-4" />
                  Salvar sem Imprimir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function ShoppingCartEmpty() {
  return (
    <div className="flex justify-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ShoppingCartIcon className="h-6 w-6 text-muted-foreground" />
      </div>
    </div>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

export default NovaVenda;
