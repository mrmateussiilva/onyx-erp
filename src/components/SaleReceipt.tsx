import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import {
    CompanySettings,
    defaultCompanySettings,
    loadCompanySettings,
} from "@/lib/companySettings";

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 8,
        flexDirection: "row",
        padding: 10,
        gap: 8,
    },
    via: {
        flex: 1,
        border: "1pt solid #000",
    },
    headerRow: {
        flexDirection: "row",
        borderBottom: "1pt solid #000",
    },
    logoCell: {
        flex: 3,
        padding: 4,
        borderRight: "1pt solid #000",
    },
    logoTitle: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
    },
    logoSubtitle: {
        fontSize: 10,
        fontFamily: "Helvetica-Oblique",
    },
    addressCell: {
        flex: 2,
        padding: 4,
        fontSize: 6,
    },
    viaTitle: {
        textAlign: "center",
        padding: 3,
        borderBottom: "1pt solid #000",
        fontSize: 7,
    },
    infoRow: {
        flexDirection: "row",
        borderBottom: "1pt solid #000",
    },
    infoLabel: {
        width: 45,
        padding: 3,
        fontFamily: "Helvetica-Bold",
        borderRight: "1pt solid #000",
        fontSize: 7,
    },
    infoValue: {
        flex: 1,
        padding: 3,
        fontSize: 7,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottom: "1pt solid #000",
        backgroundColor: "#f0f0f0",
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "0.5pt solid #ccc",
    },
    tableRowEmpty: {
        flexDirection: "row",
        borderBottom: "0.5pt solid #eee",
    },
    colProduto: { flex: 5, padding: "2 3", borderRight: "0.5pt solid #ccc" },
    colQty: { width: 28, padding: "2 3", textAlign: "center", borderRight: "0.5pt solid #ccc" },
    colUnit: { width: 38, padding: "2 3", textAlign: "right", borderRight: "0.5pt solid #ccc" },
    colTotal: { width: 38, padding: "2 3", textAlign: "right" },
    thText: { fontFamily: "Helvetica-Bold", fontSize: 7 },
    totalsRow: {
        flexDirection: "row",
        borderTop: "1pt solid #000",
    },
    totalsLabel: {
        flex: 1,
        padding: 3,
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        textAlign: "center",
        borderRight: "1pt solid #000",
    },
    totalsQty: {
        width: 28,
        padding: 3,
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        textAlign: "center",
        borderRight: "1pt solid #000",
    },
    totalsValue: {
        width: 76,
        padding: 3,
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        textAlign: "right",
    },
    footer: {
        padding: 4,
        textAlign: "center",
        fontSize: 6,
        borderTop: "1pt solid #000",
    },
    signatureLine: {
        textAlign: "center",
        fontSize: 6,
        marginTop: 6,
        borderTop: "0.5pt solid #000",
        paddingTop: 2,
    },
});

export interface SaleItem {
    name: string;
    qty: number;
    price: number;
}

interface SaleReceiptProps {
    clientName: string;
    items: SaleItem[];
    total: number;
    saleNumber: number;
    date: string;
    company?: CompanySettings;
}

const MAX_ROWS = 12;

const ViaContent = ({
    title,
    clientName,
    items,
    total,
    saleNumber,
    date,
    company,
}: {
    title: string;
    clientName: string;
    items: SaleItem[];
    total: number;
    saleNumber: number;
    date: string;
    company: CompanySettings;
}) => {
    const emptyRows = Math.max(0, MAX_ROWS - items.length);
    const totalQty = items.reduce((acc, i) => acc + i.qty, 0);

    return (
        <View style={styles.via}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.logoCell}>
                    {company.logoBase64 ? (
                        <Image
                            src={company.logoBase64}
                            style={{ maxHeight: 42, objectFit: "contain" }}
                        />
                    ) : (
                        <>
                            <Text style={styles.logoTitle}>{company.name}</Text>
                            <Text style={styles.logoSubtitle}>{company.tagline}</Text>
                        </>
                    )}
                </View>
                <View style={styles.addressCell}>
                    <Text>{company.name} {company.tagline}</Text>
                    <Text>{company.addressLine1}</Text>
                    <Text>{company.addressLine2}</Text>
                    <Text>Tel.: {company.phone}</Text>
                </View>
            </View>

            {/* Via Title */}
            <Text style={styles.viaTitle}>
                {title} - Nota de controle N.º: {String(saleNumber).padStart(4, "0")}
            </Text>

            {/* Client Row */}
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CLIENTE:</Text>
                <Text style={styles.infoValue}>{clientName}</Text>
            </View>

            {/* Date Row */}
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>DATA:</Text>
                <Text style={styles.infoValue}>{date}</Text>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.colProduto, styles.thText]}>Produto</Text>
                <Text style={[styles.colQty, styles.thText]}>Qtd.</Text>
                <Text style={[styles.colUnit, styles.thText]}>Unitário</Text>
                <Text style={[styles.colTotal, styles.thText]}>Total</Text>
            </View>

            {/* Items */}
            {items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                    <Text style={styles.colProduto}>{item.name}</Text>
                    <Text style={styles.colQty}>{item.qty}</Text>
                    <Text style={styles.colUnit}>R$ {item.price.toFixed(2)}</Text>
                    <Text style={styles.colTotal}>R$ {(item.price * item.qty).toFixed(2)}</Text>
                </View>
            ))}

            {/* Empty Rows */}
            {Array.from({ length: emptyRows }).map((_, idx) => (
                <View key={`empty-${idx}`} style={styles.tableRowEmpty}>
                    <Text style={styles.colProduto}> </Text>
                    <Text style={styles.colQty}> </Text>
                    <Text style={styles.colUnit}> </Text>
                    <Text style={styles.colTotal}> </Text>
                </View>
            ))}

            {/* Totals */}
            <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TOTAIS</Text>
                <Text style={styles.totalsQty}>{totalQty}</Text>
                <Text style={styles.totalsValue}>R$ {total.toFixed(2)}</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.signatureLine}>ASSINATURA: _______________________________</Text>
                <Text style={{ marginTop: 2, fontFamily: "Helvetica-Oblique", fontSize: 6 }}>
                    {company.footerMessage}
                </Text>
            </View>
        </View>
    );
};

export const SaleReceiptDocument = ({
    clientName,
    items,
    total,
    saleNumber,
    date,
    company = defaultCompanySettings,
}: SaleReceiptProps) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <ViaContent
                title="1ª Via - Distribuidora"
                clientName={clientName}
                items={items}
                total={total}
                saleNumber={saleNumber}
                date={date}
                company={company}
            />
            <ViaContent
                title="2ª Via - Cliente"
                clientName={clientName}
                items={items}
                total={total}
                saleNumber={saleNumber}
                date={date}
                company={company}
            />
        </Page>
    </Document>
);

function printPdfBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
        "position:fixed;inset:0;width:100%;height:100%;border:none;z-index:99999;background:white;";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
        window.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
        }, 10000);
    };
}

export async function generateAndPrintBlankPDF() {
    const company = loadCompanySettings();
    const blob = await pdf(
        <SaleReceiptDocument
            clientName="____________________________________________________"
            items={[]}
            total={0}
            saleNumber={0}
            date="__/__/____"
            company={company}
        />
    ).toBlob();
    printPdfBlob(blob);
}
