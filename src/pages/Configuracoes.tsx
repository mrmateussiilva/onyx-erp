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
    Pencil,
    RefreshCw,
    Download,
    CheckCircle2,
    AlertCircle,
    Info,
    Tags,
    Building2,
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
import { toast } from "@/components/ui/sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useUpdater } from "@/hooks/use-updater";
import {
    CompanySettings,
    loadCompanySettings,
    saveCompanySettings,
} from "@/lib/companySettings";

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

interface Category {
    id: number;
    name: string;
    description: string | null;
}

const Configuracoes = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [isNewShippingOpen, setIsNewShippingOpen] = useState(false);
    const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
    const [isNewUserOpen, setIsNewUserOpen] = useState(false);
    const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);

    const [shipName, setShipName] = useState("");
    const [shipFee, setShipFee] = useState("");
    const [payName, setPayName] = useState("");
    const [catName, setCatName] = useState("");
    const [catDesc, setCatDesc] = useState("");
    const [catSearch, setCatSearch] = useState("");

    // User Form
    const [userName, setUserName] = useState("");
    const [userUsername, setUserUsername] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [userRole, setUserRole] = useState("operador");

    // Edit States
    const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);
    const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editPassword, setEditPassword] = useState("");
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isEditShippingOpen, setIsEditShippingOpen] = useState(false);
    const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
    const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

    const { ConfirmDialog, confirm: openConfirm } = useConfirm();
    const updater = useUpdater();

    // Company settings
    const [company, setCompany] = useState<CompanySettings>(loadCompanySettings);

    const handleSaveCompany = () => {
        saveCompanySettings(company);
        toast.success("Dados da empresa salvos!");
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [s, pay, u, c] = await Promise.all([
                invoke<ShippingMethod[]>("get_shipping_methods"),
                invoke<PaymentMethod[]>("get_payment_methods"),
                invoke<User[]>("get_users"),
                invoke<Category[]>("get_categories")
            ]);
            setShippingMethods(s);
            setPaymentMethods(pay);
            setUsers(u);
            setCategories(c);
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
            toast.success("Usuário criado com sucesso!");
        } catch (err) {
            toast.error("Erro ao criar usuário: " + err);
        }
    };

    const handleDeleteUser = async (id: number) => {
        const ok = await openConfirm(
            "Remover Usuário",
            "Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita."
        );
        if (!ok) return;
        try {
            await invoke("delete_user", { id });
            loadData();
            toast.success("Usuário removido com sucesso!");
        } catch (err) {
            toast.error("Erro ao remover usuário: " + err);
        }
    };

    const handleCreateShipping = async () => {
        try {
            await invoke("create_shipping_method", { name: shipName, fee: parseFloat(shipFee) });
            setIsNewShippingOpen(false);
            setShipName(""); setShipFee("");
            loadData();
            toast.success("Forma de envio criada!");
        } catch (err) {
            toast.error("Erro ao criar forma de envio: " + err);
        }
    };

    const handleCreatePayment = async () => {
        try {
            await invoke("create_payment_method", { name: payName });
            setIsNewPaymentOpen(false);
            setPayName("");
            loadData();
            toast.success("Forma de pagamento criada!");
        } catch (err) {
            toast.error("Erro ao criar forma de pagamento: " + err);
        }
    };

    const handleCreateCategory = async () => {
        try {
            await invoke("create_category", { name: catName, description: catDesc || null });
            setIsNewCategoryOpen(false);
            setCatName(""); setCatDesc("");
            loadData();
            toast.success("Categoria criada com sucesso!");
        } catch (err) {
            toast.error("Erro ao criar categoria: " + err);
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
            toast.success("Frete atualizado!");
        } catch (err) {
            toast.error("Erro ao atualizar frete: " + err);
        }
    };

    const handleDeleteShipping = async (id: number) => {
        const ok = await openConfirm(
            "Remover Frete",
            "Tem certeza que deseja remover esta forma de envio?"
        );
        if (!ok) return;
        try {
            await invoke("delete_shipping_method", { id });
            loadData();
            toast.success("Frete removido!");
        } catch (err) {
            toast.error("Erro ao remover frete: " + err);
        }
    };

    const handleUpdatePayment = async () => {
        if (!editingPayment) return;
        try {
            await invoke("update_payment_method", { id: editingPayment.id, name: editingPayment.name });
            setIsEditPaymentOpen(false);
            loadData();
            toast.success("Pagamento atualizado!");
        } catch (err) {
            toast.error("Erro ao atualizar pagamento: " + err);
        }
    };

    const handleDeletePayment = async (id: number) => {
        const ok = await openConfirm(
            "Remover Pagamento",
            "Tem certeza que deseja remover esta forma de pagamento?"
        );
        if (!ok) return;
        try {
            await invoke("delete_payment_method", { id });
            loadData();
            toast.success("Pagamento removido!");
        } catch (err) {
            toast.error("Erro ao remover pagamento: " + err);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory) return;
        try {
            await invoke("update_category", {
                id: editingCategory.id,
                name: editingCategory.name,
                description: editingCategory.description
            });
            setIsEditCategoryOpen(false);
            loadData();
            toast.success("Categoria atualizada!");
        } catch (err) {
            toast.error("Erro ao atualizar categoria: " + err);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        const ok = await openConfirm(
            "Remover Categoria",
            "Tem certeza que deseja remover esta categoria?"
        );
        if (!ok) return;
        try {
            await invoke("delete_category", { id });
            loadData();
            toast.success("Categoria removida!");
        } catch (err) {
            toast.error("Erro ao remover categoria: " + err);
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
            toast.success("Usuário atualizado com sucesso!");
        } catch (err) {
            toast.error("Erro ao atualizar usuário: " + err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Administração</h1>
                <p className="text-sm text-muted-foreground">Configurações globais do sistema</p>
            </div>

            <Tabs defaultValue="envio" className="w-full">
                <TabsList className="grid w-full grid-cols-6 max-w-[1020px]">
                    <TabsTrigger value="empresa" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Empresa
                    </TabsTrigger>
                    <TabsTrigger value="envio" className="gap-2">
                        <Truck className="h-4 w-4" />
                        Fretes
                    </TabsTrigger>
                    <TabsTrigger value="pagamento" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pagamentos
                    </TabsTrigger>
                    <TabsTrigger value="categorias" className="gap-2">
                        <Tags className="h-4 w-4" />
                        Categorias
                    </TabsTrigger>
                    <TabsTrigger value="usuarios" className="gap-2">
                        <Users className="h-4 w-4" />
                        Usuários
                    </TabsTrigger>
                    <TabsTrigger value="atualizacoes" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Atualizações
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="empresa" className="mt-6">
                    <Card className="card-shadow border-border/60 max-w-2xl">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                Dados da Empresa (Cabeçalho da Nota)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Logo Upload */}
                            <div className="grid gap-2">
                                <Label>Logo da Empresa (exibida na nota)</Label>
                                <div className="flex items-center gap-3">
                                    {company.logoBase64 ? (
                                        <img
                                            src={company.logoBase64}
                                            alt="Logo"
                                            className="h-12 w-auto rounded border border-border object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-24 items-center justify-center rounded border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                                            Sem logo
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <label className="cursor-pointer">
                                            <span className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                                                Escolher imagem
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        const result = ev.target?.result as string;
                                                        setCompany({ ...company, logoBase64: result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }}
                                            />
                                        </label>
                                        {company.logoBase64 && (
                                            <button
                                                onClick={() => setCompany({ ...company, logoBase64: undefined })}
                                                className="text-xs text-destructive hover:underline text-left"
                                            >
                                                Remover logo
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    PNG ou JPG recomendado. Quando não houver logo, o nome da empresa será exibido.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nome da Empresa</Label>
                                    <Input
                                        value={company.name}
                                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                        placeholder="Ex: MORAIS"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Subtítulo / Tipo</Label>
                                    <Input
                                        value={company.tagline}
                                        onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                                        placeholder="Ex: distribuidora"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Endereço - Linha 1</Label>
                                <Input
                                    value={company.addressLine1}
                                    onChange={(e) => setCompany({ ...company, addressLine1: e.target.value })}
                                    placeholder="Ex: Av. Tailândia - nº 127"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Endereço - Linha 2 (Bairro / Cidade)</Label>
                                <Input
                                    value={company.addressLine2}
                                    onChange={(e) => setCompany({ ...company, addressLine2: e.target.value })}
                                    placeholder="Ex: Bairro Columbia - Colatina - ES"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Telefone(s)</Label>
                                <Input
                                    value={company.phone}
                                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                                    placeholder="Ex: (27) 98893-2758"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Mensagem de Rodapé</Label>
                                <Input
                                    value={company.footerMessage}
                                    onChange={(e) => setCompany({ ...company, footerMessage: e.target.value })}
                                    placeholder="Ex: Deus é nossa fonte!"
                                />
                            </div>
                            <Button onClick={handleSaveCompany} className="w-full">
                                Salvar Dados da Empresa
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

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
                                                    <Pencil className="h-4 w-4" />
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
                                                    <Pencil className="h-4 w-4" />
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

                <TabsContent value="categorias" className="mt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar categoria..."
                                className="pl-9 h-9 text-xs"
                                value={catSearch}
                                onChange={(e) => setCatSearch(e.target.value)}
                            />
                        </div>
                        <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nova Categoria
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nova Categoria</DialogTitle>
                                    <DialogDescription>Crie uma nova classificação para seus produtos.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Nome da Categoria</Label>
                                        <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ex: Bebidas" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Descrição (Opcional)</Label>
                                        <Input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Ex: Todos os tipos de bebidas" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateCategory}>Criar Categoria</Button>
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
                                        <th className="px-6 py-3">Descrição</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {categories
                                        .filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
                                            (c.description && c.description.toLowerCase().includes(catSearch.toLowerCase())))
                                        .map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">{c.description || "–"}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground"
                                                        onClick={() => {
                                                            setEditingCategory(c);
                                                            setIsEditCategoryOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => handleDeleteCategory(c.id)}
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
                            <Input
                                placeholder="Buscar usuário..."
                                className="pl-9 h-9 text-xs"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
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
                                    {users
                                        .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                                            u.username.toLowerCase().includes(userSearch.toLowerCase()))
                                        .map((u) => (
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
                                                        <Pencil className="h-4 w-4" />
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

                {/* Aba Atualizações */}
                <TabsContent value="atualizacoes" className="mt-6">
                    <div className="max-w-2xl space-y-6">
                        {/* Card de versão atual */}
                        <Card className="card-shadow border-border/60">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    Informações do Sistema
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Versão instalada</span>
                                    <span className="font-mono font-semibold text-foreground">v0.1.0</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Última verificação</span>
                                    <span className="text-foreground">
                                        {updater.lastChecked
                                            ? updater.lastChecked.toLocaleTimeString("pt-BR")
                                            : "–"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card de status de atualização */}
                        <Card className="card-shadow border-border/60">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 text-primary" />
                                    Atualizações Disponíveis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {updater.isChecking ? (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Verificando atualizações...
                                    </div>
                                ) : updater.updateAvailable && updater.update ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 rounded-lg bg-primary/10 border border-primary/20 p-4">
                                            <Download className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">
                                                    Nova versão: v{updater.update.version}
                                                </p>
                                                {updater.update.body && (
                                                    <p className="text-xs text-muted-foreground whitespace-pre-line">
                                                        {updater.update.body}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => updater.installUpdate()}
                                            disabled={updater.isInstalling}
                                            className="w-full gap-2"
                                        >
                                            {updater.isInstalling ? (
                                                <><RefreshCw className="h-4 w-4 animate-spin" /> Instalando...</>
                                            ) : (
                                                <><Download className="h-4 w-4" /> Baixar e Instalar</>
                                            )}
                                        </Button>
                                    </div>
                                ) : updater.error ? (
                                    <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                                        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                                        <p className="text-xs text-destructive">
                                            Não foi possível verificar atualizações. Verifique sua conexão.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Você está usando a versão mais recente.
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => updater.checkForUpdates(false)}
                                    disabled={updater.isChecking || updater.isInstalling}
                                >
                                    <RefreshCw className={`h-4 w-4 ${updater.isChecking ? "animate-spin" : ""}`} />
                                    Verificar Agora
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
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

            {/* Edit Category Dialog */}
            <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Categoria</DialogTitle>
                    </DialogHeader>
                    {editingCategory && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Nome</Label>
                                <Input
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Descrição</Label>
                                <Input
                                    value={editingCategory.description || ""}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleUpdateCategory}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog />
        </div>
    );
};

export default Configuracoes;
