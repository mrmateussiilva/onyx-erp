import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
    Plus,
    Trash2,
    Truck,
    CreditCard,
    Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

interface User {
    id: number;
    username: string;
    name: string;
    role: string;
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

const Configuracoes = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const [isNewShippingOpen, setIsNewShippingOpen] = useState(false);
    const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);

    const [shipName, setShipName] = useState("");
    const [shipFee, setShipFee] = useState("");
    const [payName, setPayName] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [s, pay] = await Promise.all([
                invoke<ShippingMethod[]>("get_shipping_methods"),
                invoke<PaymentMethod[]>("get_payment_methods")
            ]);
            setShippingMethods(s);
            setPaymentMethods(pay);
            // Usuários: Por enquanto não temos um 'get_users' comando completo,
            // mas a infra está pronta no backend se necessário.
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateShipping = async () => {
        try {
            await invoke("create_shipping_method", { name: shipName, fee: parseFloat(shipFee) });
            setIsNewShippingOpen(false);
            setShipName(""); setShipFee("");
            loadData();
        } catch (err) {
            alert("Erro ao criar forma de envio: " + err);
        }
    };

    const handleCreatePayment = async () => {
        try {
            await invoke("create_payment_method", { name: payName });
            setIsNewPaymentOpen(false);
            setPayName("");
            loadData();
        } catch (err) {
            alert("Erro ao criar forma de pagamento: " + err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Administração</h1>
                <p className="text-sm text-muted-foreground">Configurações globais do sistema</p>
            </div>

            <Tabs defaultValue="envio" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
                    <TabsTrigger value="envio" className="gap-2">
                        <Truck className="h-4 w-4" />
                        Fretes
                    </TabsTrigger>
                    <TabsTrigger value="pagamento" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pagamentos
                    </TabsTrigger>
                    <TabsTrigger value="usuarios" className="gap-2">
                        <Users className="h-4 w-4" />
                        Usuários
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="envio" className="mt-6">
                    <div className="mb-4 flex justify-end">
                        <Dialog open={isNewShippingOpen} onOpenChange={setIsNewShippingOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nova Forma
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nova Forma de Envio</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Nome</Label>
                                        <Input value={shipName} onChange={(e) => setShipName(e.target.value)} placeholder="Ex: Entrega VIP" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Taxa (R$)</Label>
                                        <Input type="number" value={shipFee} onChange={(e) => setShipFee(e.target.value)} placeholder="5.00" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateShipping}>Salvar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card className="card-shadow border-border/60">
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead className="border-b bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3">Método</th>
                                        <th className="px-6 py-3 text-right">Taxa (R$)</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {shippingMethods.map((m) => (
                                        <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium">{m.name}</td>
                                            <td className="px-6 py-4 text-sm text-right">R$ {m.fee.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pagamento" className="mt-6">
                    <div className="mb-4 flex justify-end">
                        <Dialog open={isNewPaymentOpen} onOpenChange={setIsNewPaymentOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nova Forma
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nova Forma de Pagamento</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Nome do Método</Label>
                                        <Input value={payName} onChange={(e) => setPayName(e.target.value)} placeholder="Ex: Vale Refeição" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreatePayment}>Salvar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card className="card-shadow border-border/60">
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead className="border-b bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3">Método</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paymentMethods.map((m) => (
                                        <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium">{m.name}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usuarios" className="mt-6">
                    <Card className="card-shadow border-border/60">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Usuários do Sistema</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-12">
                                Aqui você poderá gerenciar as permissões e cadastros de novos operadores em breve.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Configuracoes;
