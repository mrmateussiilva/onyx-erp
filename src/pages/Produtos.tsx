import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
    Package,
    Plus,
    Search,
    Gem,
    Flame,
    LayoutGrid,
    List,
    Trash2,
    Edit3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface Product {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    category: string;
}

const Produtos = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isNewProductOpen, setIsNewProductOpen] = useState(false);

    // Form fields
    const [prodName, setProdName] = useState("");
    const [prodPrice, setProdPrice] = useState("");
    const [prodStock, setProdStock] = useState("");
    const [prodCategory, setProdCategory] = useState("água");

    // Edit states
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isEditProductOpen, setIsEditProductOpen] = useState(false);

    const { ConfirmDialog, confirm: openConfirm } = useConfirm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const p = await invoke<Product[]>("get_products");
            setProducts(p);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateProduct = async () => {
        try {
            await invoke("create_product", {
                name: prodName,
                price: parseFloat(prodPrice),
                stockQuantity: parseInt(prodStock),
                category: prodCategory
            });
            setIsNewProductOpen(false);
            setProdName(""); setProdPrice(""); setProdStock("");
            loadData();
            toast.success("Produto cadastrado com sucesso!");
        } catch (err) {
            toast.error("Erro ao criar produto: " + err);
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;
        try {
            await invoke("update_product", {
                id: editingProduct.id,
                name: editingProduct.name,
                price: parseFloat(editingProduct.price.toString()),
                stockQuantity: parseInt(editingProduct.stock_quantity.toString()),
                category: editingProduct.category
            });
            setIsEditProductOpen(false);
            loadData();
            toast.success("Produto atualizado com sucesso!");
        } catch (err) {
            toast.error("Erro ao atualizar produto: " + err);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        const ok = await openConfirm(
            "Remover Produto",
            "Tem certeza que deseja remover este produto do catálogo?"
        );
        if (!ok) return;
        try {
            await invoke("delete_product", { id });
            loadData();
            toast.success("Produto removido!");
        } catch (err) {
            toast.error("Erro ao remover produto: " + err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
                    <p className="text-sm text-muted-foreground">Catálogo e controle de estoque</p>
                </div>
                <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Produto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Novo Produto</DialogTitle>
                            <DialogDescription>
                                Adicione um novo item ao catálogo de vendas.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input id="name" value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Ex: Galão 20L Premium" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Preço (R$)</Label>
                                    <Input id="price" type="number" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="18.00" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Estoque Inicial</Label>
                                    <Input id="stock" type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} placeholder="100" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select value={prodCategory} onValueChange={setProdCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="água">Água</SelectItem>
                                        <SelectItem value="gás">Gás</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateProduct}>Cadastrar Produto</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="card-shadow border-border/60">
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Catálogo Ativo</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Buscar produto..." className="pl-9 h-9 text-xs" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                                    <th className="px-6 py-3">Produto</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3 text-right">Preço</th>
                                    <th className="px-6 py-3 text-right">Estoque</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                                    {prod.category === "água" ? (
                                                        <Gem className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <Flame className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium">{prod.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs capitalize bg-muted px-2 py-1 rounded-full">{prod.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-right">
                                            R$ {prod.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-bold ${prod.stock_quantity < 10 ? 'text-destructive' : 'text-foreground'}`}>
                                                {prod.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => {
                                                        setEditingProduct(prod);
                                                        setIsEditProductOpen(true);
                                                    }}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteProduct(prod.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Product Dialog */}
            <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Produto</DialogTitle>
                        <DialogDescription>
                            Altere as informações do produto no catálogo.
                        </DialogDescription>
                    </DialogHeader>
                    {editingProduct && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nome do Produto</Label>
                                <Input
                                    id="edit-name"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-price">Preço (R$)</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-stock">Estoque</Label>
                                    <Input
                                        id="edit-stock"
                                        type="number"
                                        value={editingProduct.stock_quantity}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">Categoria</Label>
                                <Select
                                    value={editingProduct.category}
                                    onValueChange={(val) => setEditingProduct({ ...editingProduct, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="água">Água</SelectItem>
                                        <SelectItem value="gás">Gás</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleUpdateProduct} className="w-full">Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog />
        </div>
    );
};

export default Produtos;
