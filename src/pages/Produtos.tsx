```
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
    Edit3,
    Droplets
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
        } catch (err) {
            alert("Erro ao criar produto: " + err);
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
                                                        <Droplets className="h-5 w-5 text-primary" />
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
                                            <span className={`text - sm font - bold ${ prod.stock_quantity < 10 ? 'text-destructive' : 'text-foreground' } `}>
                                                {prod.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
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
        </div>
    );
};

export default Produtos;
