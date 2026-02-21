import { useRef } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { SaleReceiptDocument, SaleItem } from "@/components/SaleReceipt";
import { loadCompanySettings } from "@/lib/companySettings";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintPreviewModalProps {
    open: boolean;
    onClose: () => void;
    clientName: string;
    items: SaleItem[];
    total: number;
    saleNumber: number;
    date: string;
}

export function PrintPreviewModal({
    open,
    onClose,
    clientName,
    items,
    total,
    saleNumber,
    date,
}: PrintPreviewModalProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const company = loadCompanySettings();

    const handlePrint = () => {
        const iframe = viewerRef.current?.querySelector("iframe") as HTMLIFrameElement | null;
        if (iframe?.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } else {
            // Fallback: generate fresh blob
            pdf(
                <SaleReceiptDocument
                    clientName={clientName}
                    items={items}
                    total={total}
                    saleNumber={saleNumber}
                    date={date}
                    company={company}
                />
            )
                .toBlob()
                .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const el = document.createElement("iframe");
                    el.style.cssText = "display:none;";
                    el.src = url;
                    document.body.appendChild(el);
                    el.onload = () => {
                        el.contentWindow?.print();
                        setTimeout(() => {
                            document.body.removeChild(el);
                            URL.revokeObjectURL(url);
                        }, 10000);
                    };
                });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
                    <DialogTitle className="text-base font-semibold">
                        Pré-visualização — #{String(saleNumber).padStart(4, "0")}
                    </DialogTitle>
                    <Button size="sm" onClick={handlePrint} className="gap-2 mr-6">
                        <Printer className="h-4 w-4" />
                        Imprimir
                    </Button>
                </DialogHeader>

                <div ref={viewerRef} className="flex-1 overflow-hidden">
                    {open && (
                        <PDFViewer
                            width="100%"
                            height="100%"
                            style={{ border: "none" }}
                            showToolbar={false}
                        >
                            <SaleReceiptDocument
                                clientName={clientName}
                                items={items}
                                total={total}
                                saleNumber={saleNumber}
                                date={date}
                                company={company}
                            />
                        </PDFViewer>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
