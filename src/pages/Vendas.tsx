import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
    Search,
    Printer,
    Trash2,
    FilePlus,
    Eye,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovaVendaForm } from "@/components/NovaVendaForm";
import { generateAndPrintBlankPDF } from "@/components/SaleReceipt";
import { PrintPreviewModal } from "@/components/PrintPreviewModal";

interface Sale {
    id: number;
    client_id: number;
    client_name: string;
    items: string;
    total: number;
    payment_method: string;
    created_at: string;
}

const Vendas = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("historico");

    // States for Modals
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<number | null>(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    // Print preview modal state
    const [printSale, setPrintSale] = useState<Sale | null>(null);

    useEffect(() => {
        loadSales();
    }, []);

    useEffect(() => {
        const term = search.toLowerCase();
        setFilteredSales(
            sales.filter(s =>
                s.client_name.toLowerCase().includes(term) ||
                s.id.toString().includes(term)
            )
        );
    }, [search, sales]);

    const loadSales = async () => {
        try {
            setIsLoading(true);
            const start = new Date();
            start.setFullYear(start.getFullYear() - 1);

            const data = await invoke<any>("get_sales_report", {
                startIso: start.toISOString(),
                endIso: new Date().toISOString(),
                paymentMethod: "todos"
            });
            setSales(data.sales_list);
            setFilteredSales(data.sales_list);
        } catch (e) {
            console.error(e);
            toast.error("Erro ao carregar vendas");
        } finally {
            setIsLoading(false);
        }
    };

    const formatItemsString = (itemsJson: string) => {
        try {
            const items = JSON.parse(itemsJson);
            if (Array.isArray(items)) {
                return items.map((i: any) => `${i.name} (x${i.qty})`).join(", ");
            }
            return itemsJson;
        } catch (e) {
            return itemsJson;
        }
    };

    const handlePrint = (sale: Sale) => {
        setPrintSale(sale);
    };

    const handlePrintBlank = async () => {
        try {
            await generateAndPrintBlankPDF();
        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar nota branca");
        }
    };

    const handleDelete = async () => {
        if (!saleToDelete) return;
        try {
            await invoke("delete_sale", { id: saleToDelete });
            toast.success("Venda excluída com sucesso");
            loadSales();
        } catch (e) {
            console.error(e);
            toast.error("Erro ao excluir venda");
        } finally {
            setIsDeleteDialogOpen(false);
            setSaleToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestão de Vendas</h1>
                    <p className="text-sm text-muted-foreground">Gerencie o histórico de pedidos e notas</p>
                </div>
                <Button onClick={handlePrintBlank} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
                    <FilePlus className="h-4 w-4" />
                    Imprimir Nota Branca
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                    <TabsTrigger value="nova">Nova Venda</TabsTrigger>
                </TabsList>

                <TabsContent value="historico" className="animate-in fade-in duration-500">
                    <Card className="card-shadow border-border/60">
                        <CardHeader className="p-4 pb-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por cliente ou código da venda..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 pt-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-[80px]">ID</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Itens</TableHead>
                                            <TableHead>Pagamento</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-center">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">Carregando...</TableCell>
                                            </TableRow>
                                        ) : filteredSales.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">Nenhuma venda encontrada</TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredSales.map((sale) => (
                                                <TableRow key={sale.id} className="hover:bg-muted/20 transition-colors">
                                                    <TableCell className="font-bold">#{sale.id}</TableCell>
                                                    <TableCell className="text-xs">
                                                        {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{sale.client_name}</TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                        {formatItemsString(sale.items)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                                                            {sale.payment_method}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-primary">
                                                        R$ {sale.total.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                                                                setSelectedSale(sale);
                                                                setIsViewOpen(true);
                                                            }}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handlePrint(sale)}>
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => {
                                                                setSaleToDelete(sale.id);
                                                                setIsDeleteDialogOpen(true);
                                                            }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="nova">
                    <NovaVendaForm onSuccess={() => {
                        loadSales();
                        setActiveTab("historico");
                    }} />
                </TabsContent>
            </Tabs>

            {/* View/Details Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Venda #{selectedSale?.id}</DialogTitle>
                        <DialogDescription>
                            Realizada em {selectedSale && format(new Date(selectedSale.created_at), "PPP 'às' p", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSale && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4 border-b pb-2">
                                <Label className="text-right text-muted-foreground">Cliente</Label>
                                <div className="col-span-3 font-semibold">{selectedSale.client_name}</div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4 border-b pb-2">
                                <Label className="text-right text-muted-foreground">Itens</Label>
                                <div className="col-span-3 text-sm">
                                    {JSON.parse(selectedSale.items).map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{item.name} x{item.qty}</span>
                                            <span>R$ {(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 pt-2">
                                <Label className="text-right text-muted-foreground">Total</Label>
                                <div className="col-span-3 text-lg font-bold text-primary">R$ {selectedSale.total.toFixed(2)}</div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Fechar</Button>
                        {selectedSale && (
                            <Button onClick={() => handlePrint(selectedSale)} className="gap-2">
                                <Printer className="h-4 w-4" />
                                Imprimir Novamente
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a venda **#{saleToDelete}**? Esta ação não pode ser desfeita e o registro será removido permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir Venda
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Print Preview Modal */}
            {printSale && (() => {
                let parsedItems: { name: string; qty: number; price: number }[] = [];
                try { parsedItems = JSON.parse(printSale.items); } catch { /* ignore */ }
                return (
                    <PrintPreviewModal
                        open={!!printSale}
                        onClose={() => setPrintSale(null)}
                        clientName={printSale.client_name}
                        items={parsedItems}
                        total={printSale.total}
                        saleNumber={printSale.id}
                        date={new Date(printSale.created_at).toLocaleDateString("pt-BR")}
                    />
                );
            })()}
        </div>
    );
};

export default Vendas;
