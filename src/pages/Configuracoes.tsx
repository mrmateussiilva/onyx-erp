import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";
import {
    Plus,
    Trash2,
    Truck,
    CreditCard,
    Users,
    Search,
    UserPlus,
    Shield,
    Lock,
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
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    const [isNewUserOpen, setIsNewUserOpen] = useState(false);

    const [shipName, setShipName] = useState("");
    const [shipFee, setShipFee] = useState("");
    const [payName, setPayName] = useState("");

    // User Form
    const [userName, setUserName] = useState("");
    const [userUsername, setUserUsername] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userRole, setUserRole] = useState("operador");

    // Edit States
    const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);
    const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editPassword, setEditPassword] = useState("");
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isEditShippingOpen, setIsEditShippingOpen] = useState(false);
    const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [s, pay, u] = await Promise.all([
                invoke<ShippingMethod[]>("get_shipping_methods"),
                invoke<PaymentMethod[]>("get_payment_methods"),
                invoke<User[]>("get_users")
            ]);
            setShippingMethods(s);
            setPaymentMethods(pay);
            setUsers(u);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateUser = async () => {
        try {
            await invoke("create_user", {
                name: userName,
                username: userUsername,
                passwordPlain: userPassword,
                role: userRole
            });
            setIsNewUserOpen(false);
            setUserName(""); setUserUsername(""); setUserPassword(""); setUserRole("operador");
            loadData();
        } catch (err) {
            alert("Erro ao criar usuário: " + err);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm("Tem certeza que deseja remover este usuário?")) return;
        try {
            await invoke("delete_user", { id });
            loadData();
        } catch (err) {
            alert("Erro ao remover usuário: " + err);
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

    const handleUpdateShipping = async () => {
        if (!editingShipping) return;
        try {
            await invoke("update_shipping_method", {
                id: editingShipping.id,
                name: editingShipping.name,
                fee: parseFloat(editingShipping.fee.toString())
            });
            setIsEditShippingOpen(false);
            loadData();
        } catch (err) {
            alert("Erro ao atualizar frete: " + err);
        }
    };

    const handleDeleteShipping = async (id: number) => {
        if (!confirm("Tem certeza que deseja remover este frete?")) return;
        try {
            await invoke("delete_shipping_method", { id });
            loadData();
        } catch (err) {
            alert("Erro ao remover frete: " + err);
        }
    };

    const handleUpdatePayment = async () => {
        if (!editingPayment) return;
        try {
            await invoke("update_payment_method", { id: editingPayment.id, name: editingPayment.name });
            setIsEditPaymentOpen(false);
            loadData();
        } catch (err) {
            alert("Erro ao atualizar pagamento: " + err);
        }
    };

    const handleDeletePayment = async (id: number) => {
        if (!confirm("Tem certeza que deseja remover este pagamento?")) return;
        try {
            await invoke("delete_payment_method", { id });
            loadData();
        } catch (err) {
            alert("Erro ao remover pagamento: " + err);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            await invoke("update_user", {
                id: editingUser.id,
                name: editingUser.name,
                username: editingUser.username,
                role: editingUser.role,
                passwordPlain: editPassword || null
            });
            setIsEditUserOpen(false);
            setEditPassword("");
            loadData();
        } catch (err) {
            alert("Erro ao atualizar usuário: " + err);
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
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground"
                                                    onClick={() => {
                                                        setEditingShipping(m);
                                                        setIsEditShippingOpen(true);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 rotate-45" /> {/* Simulating an edit icon with tilted plus or better just use a generic icon */}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleDeleteShipping(m.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground"
                                                    onClick={() => {
                                                        setEditingPayment(m);
                                                        setIsEditPaymentOpen(true);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 rotate-45" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleDeletePayment(m.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usuarios" className="mt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Buscar usuário..." className="pl-9 h-9 text-xs" />
                        </div>
                        <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Novo Usuário
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Novo Operador</DialogTitle>
                                    <DialogDescription>Cadastre um novo usuário e defina as permissões de acesso.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Nome Completo</Label>
                                        <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Ex: Lucas Santos" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Usuário (Login)</Label>
                                            <Input value={userUsername} onChange={(e) => setUserUsername(e.target.value)} placeholder="lucas.santos" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Senha</Label>
                                            <Input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="********" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Cargo / Permissão</Label>
                                        <Select value={userRole} onValueChange={setUserRole}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="operador">Operador (Apenas Vendas)</SelectItem>
                                                <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateUser} className="w-full">Criar Usuário</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card className="card-shadow border-border/60">
                        <CardContent className="p-0">
                            <table className="w-full text-left">
                                <thead className="border-b bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3">Nome</th>
                                        <th className="px-6 py-3">Usuário</th>
                                        <th className="px-6 py-3">Cargo</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{u.username}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded",
                                                    u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground"
                                                    onClick={() => {
                                                        setEditingUser(u);
                                                        setIsEditUserOpen(true);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 rotate-45" />
                                                </Button>
                                                {u.username !== "admin" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteUser(u.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Shipping Dialog */}
            <Dialog open={isEditShippingOpen} onOpenChange={setIsEditShippingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Forma de Envio</DialogTitle>
                    </DialogHeader>
                    {editingShipping && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Nome</Label>
                                <Input
                                    value={editingShipping.name}
                                    onChange={(e) => setEditingShipping({ ...editingShipping, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Taxa (R$)</Label>
                                <Input
                                    type="number"
                                    value={editingShipping.fee}
                                    onChange={(e) => setEditingShipping({ ...editingShipping, fee: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleUpdateShipping}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Payment Dialog */}
            <Dialog open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Forma de Pagamento</DialogTitle>
                    </DialogHeader>
                    {editingPayment && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Nome do Método</Label>
                                <Input
                                    value={editingPayment.name}
                                    onChange={(e) => setEditingPayment({ ...editingPayment, name: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleUpdatePayment}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>Altere os dados do operador. Deixe a senha em branco para manter a atual.</DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Nome Completo</Label>
                                <Input
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Usuário (Login)</Label>
                                    <Input
                                        value={editingUser.username}
                                        disabled={editingUser.username === "admin"}
                                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Nova Senha</Label>
                                    <Input
                                        type="password"
                                        value={editPassword}
                                        onChange={(e) => setEditPassword(e.target.value)}
                                        placeholder="Min 6 caracteres"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Cargo / Permissão</Label>
                                <Select
                                    value={editingUser.role}
                                    onValueChange={(val) => setEditingUser({ ...editingUser, role: val })}
                                    disabled={editingUser.username === "admin"}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operador">Operador (Apenas Vendas)</SelectItem>
                                        <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleUpdateUser} className="w-full">Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Configuracoes;
