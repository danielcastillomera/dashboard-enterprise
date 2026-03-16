/* ============================================
   RIDE PDF GENERATOR — SRI Ecuador
   
   Genera el PDF de la factura electrónica en
   formato RIDE (Representación Impresa del
   Documento Electrónico) según normativa SRI.
   ============================================ */

import React from "react";
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

/* ---- Types ---- */
interface RideData {
  // Company
  companyName: string;
  tradeName?: string;
  ruc: string;
  mainAddress: string;
  branchAddress?: string;
  specialTaxpayer?: string;
  keepAccounting: boolean;
  rimpe?: boolean;

  // Invoice
  invoiceNumber: string;
  claveAcceso: string;
  issueDate: string;
  environment: string;
  emissionType: string;

  // Customer
  customerName: string;
  customerId: string;
  customerIdType: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;

  // Items
  items: {
    code: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
  }[];

  // Totals
  subtotal12: number;
  subtotal0: number;
  subtotalNoTax: number;
  subtotalExempt: number;
  totalDiscount: number;
  iva: number;
  total: number;

  // Payment
  paymentMethod: string;
  paymentAmount: number;
}

/* ---- Styles ---- */
const s = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 8, color: "#1a1a1a" },
  // Header
  headerRow: { flexDirection: "row", marginBottom: 12 },
  headerLeft: { flex: 1, paddingRight: 10 },
  headerRight: { width: 240, border: "1.5pt solid #1a1a1a", borderRadius: 4, padding: 8 },
  companyName: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  tradeName: { fontSize: 9, color: "#444", marginBottom: 4 },
  companyDetail: { fontSize: 7.5, color: "#333", marginBottom: 1.5 },
  rideTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center" as const, marginBottom: 6, color: "#1a1a1a" },
  invoiceLabel: { fontSize: 7.5, color: "#555", marginBottom: 1 },
  invoiceValue: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  claveLabel: { fontSize: 6.5, color: "#555", marginTop: 4, marginBottom: 1 },
  claveValue: { fontSize: 6.5, fontFamily: "Courier", letterSpacing: 0.3 },
  // Divider
  divider: { borderBottom: "0.5pt solid #ccc", marginVertical: 8 },
  dividerBold: { borderBottom: "1pt solid #1a1a1a", marginVertical: 8 },
  // Customer section
  sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 6, textTransform: "uppercase" as const, color: "#333" },
  customerRow: { flexDirection: "row", marginBottom: 2 },
  customerLabel: { width: 90, fontSize: 7.5, color: "#555" },
  customerValue: { flex: 1, fontSize: 7.5 },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#f0f0f0", borderBottom: "1pt solid #1a1a1a", paddingVertical: 4 },
  tableRow: { flexDirection: "row", borderBottom: "0.5pt solid #e0e0e0", paddingVertical: 3, minHeight: 16 },
  // Table columns
  colCode: { width: 55, paddingHorizontal: 3 },
  colDesc: { flex: 1, paddingHorizontal: 3 },
  colQty: { width: 40, paddingHorizontal: 3, textAlign: "right" as const },
  colPrice: { width: 55, paddingHorizontal: 3, textAlign: "right" as const },
  colDisc: { width: 50, paddingHorizontal: 3, textAlign: "right" as const },
  colTotal: { width: 60, paddingHorizontal: 3, textAlign: "right" as const },
  thText: { fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase" as const },
  tdText: { fontSize: 7.5 },
  // Totals
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalsBox: { width: 220 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2, paddingHorizontal: 6 },
  totalLabel: { fontSize: 7.5, color: "#555" },
  totalValue: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  grandTotalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, paddingHorizontal: 6, backgroundColor: "#1a1a1a", borderRadius: 2, marginTop: 2 },
  grandTotalLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#fff" },
  grandTotalValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#fff" },
  // Payment
  paymentBox: { marginTop: 10, border: "0.5pt solid #ccc", borderRadius: 3, padding: 6 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between" },
  // Footer
  footer: { position: "absolute" as const, bottom: 20, left: 30, right: 30, textAlign: "center" as const, fontSize: 6, color: "#999", borderTop: "0.5pt solid #e0e0e0", paddingTop: 6 },
  // Badges
  badge: { fontSize: 6, paddingHorizontal: 4, paddingVertical: 1.5, borderRadius: 2, backgroundColor: "#e0f7e0", color: "#166534", alignSelf: "flex-start" as const },
  badgeEnv: { fontSize: 6, paddingHorizontal: 4, paddingVertical: 1.5, borderRadius: 2, backgroundColor: "#fef3c7", color: "#92400e" },
});

const fmt = (n: number) => `$${n.toFixed(2)}`;

const ID_TYPES: Record<string, string> = {
  "04": "RUC", "05": "Cédula", "06": "Pasaporte", "07": "Consumidor Final", "08": "Exterior",
};

/* ---- PDF Document ---- */
function RideDocument({ data }: { data: RideData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* HEADER */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.companyName}>{data.companyName}</Text>
            {data.tradeName && <Text style={s.tradeName}>{data.tradeName}</Text>}
            <Text style={s.companyDetail}>RUC: {data.ruc}</Text>
            <Text style={s.companyDetail}>Dir. Matriz: {data.mainAddress}</Text>
            {data.branchAddress && <Text style={s.companyDetail}>Dir. Sucursal: {data.branchAddress}</Text>}
            {data.specialTaxpayer && <Text style={s.companyDetail}>Contribuyente Especial No.: {data.specialTaxpayer}</Text>}
            <Text style={s.companyDetail}>Obligado a llevar contabilidad: {data.keepAccounting ? "SÍ" : "NO"}</Text>
            {data.rimpe && <Text style={s.companyDetail}>Contribuyente Régimen RIMPE</Text>}
          </View>
          <View style={s.headerRight}>
            <Text style={s.rideTitle}>F A C T U R A</Text>
            <Text style={s.invoiceLabel}>No.</Text>
            <Text style={s.invoiceValue}>{data.invoiceNumber}</Text>
            <Text style={s.invoiceLabel}>Ambiente: {data.environment === "PRODUCCION" ? "PRODUCCIÓN" : "PRUEBAS"}</Text>
            <Text style={s.invoiceLabel}>Emisión: {data.emissionType}</Text>
            <Text style={s.claveLabel}>CLAVE DE ACCESO</Text>
            <Text style={s.claveValue}>{data.claveAcceso}</Text>
          </View>
        </View>

        <View style={s.dividerBold} />

        {/* CUSTOMER INFO */}
        <Text style={s.sectionTitle}>Datos del Cliente</Text>
        <View style={s.customerRow}>
          <Text style={s.customerLabel}>Razón Social:</Text>
          <Text style={s.customerValue}>{data.customerName}</Text>
        </View>
        <View style={s.customerRow}>
          <Text style={s.customerLabel}>{ID_TYPES[data.customerIdType] || "Identificación"}:</Text>
          <Text style={s.customerValue}>{data.customerId}</Text>
        </View>
        <View style={s.customerRow}>
          <Text style={s.customerLabel}>Fecha Emisión:</Text>
          <Text style={s.customerValue}>{data.issueDate}</Text>
        </View>
        {data.customerAddress && (
          <View style={s.customerRow}>
            <Text style={s.customerLabel}>Dirección:</Text>
            <Text style={s.customerValue}>{data.customerAddress}</Text>
          </View>
        )}

        <View style={s.divider} />

        {/* ITEMS TABLE */}
        <View style={s.tableHeader}>
          <Text style={[s.thText, s.colCode]}>Código</Text>
          <Text style={[s.thText, s.colDesc]}>Descripción</Text>
          <Text style={[s.thText, s.colQty]}>Cant.</Text>
          <Text style={[s.thText, s.colPrice]}>P. Unit.</Text>
          <Text style={[s.thText, s.colDisc]}>Desc.</Text>
          <Text style={[s.thText, s.colTotal]}>Total</Text>
        </View>
        {data.items.map((item, idx) => (
          <View key={idx} style={s.tableRow}>
            <Text style={[s.tdText, s.colCode]}>{item.code}</Text>
            <Text style={[s.tdText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdText, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.tdText, s.colPrice]}>{fmt(item.unitPrice)}</Text>
            <Text style={[s.tdText, s.colDisc]}>{fmt(item.discount)}</Text>
            <Text style={[s.tdText, s.colTotal]}>{fmt(item.subtotal)}</Text>
          </View>
        ))}

        {/* TOTALS */}
        <View style={s.totalsRow}>
          <View style={s.totalsBox}>
            <View style={s.totalLine}><Text style={s.totalLabel}>SUBTOTAL 15%</Text><Text style={s.totalValue}>{fmt(data.subtotal12)}</Text></View>
            <View style={s.totalLine}><Text style={s.totalLabel}>SUBTOTAL 0%</Text><Text style={s.totalValue}>{fmt(data.subtotal0)}</Text></View>
            {data.subtotalNoTax > 0 && <View style={s.totalLine}><Text style={s.totalLabel}>SUBTOTAL NO OBJETO IVA</Text><Text style={s.totalValue}>{fmt(data.subtotalNoTax)}</Text></View>}
            {data.subtotalExempt > 0 && <View style={s.totalLine}><Text style={s.totalLabel}>SUBTOTAL EXENTO IVA</Text><Text style={s.totalValue}>{fmt(data.subtotalExempt)}</Text></View>}
            <View style={s.totalLine}><Text style={s.totalLabel}>DESCUENTO</Text><Text style={s.totalValue}>{fmt(data.totalDiscount)}</Text></View>
            <View style={s.totalLine}><Text style={s.totalLabel}>IVA 15%</Text><Text style={s.totalValue}>{fmt(data.iva)}</Text></View>
            <View style={s.grandTotalLine}><Text style={s.grandTotalLabel}>VALOR TOTAL</Text><Text style={s.grandTotalValue}>{fmt(data.total)}</Text></View>
          </View>
        </View>

        {/* PAYMENT */}
        <View style={s.paymentBox}>
          <Text style={s.sectionTitle}>Forma de Pago</Text>
          <View style={s.paymentRow}>
            <Text style={s.tdText}>{data.paymentMethod}</Text>
            <Text style={[s.tdText, { fontFamily: "Helvetica-Bold" }]}>{fmt(data.paymentAmount)}</Text>
          </View>
        </View>

        {/* INFO ADICIONAL */}
        {(data.customerEmail || data.customerPhone) && (
          <View style={{ marginTop: 8 }}>
            <Text style={s.sectionTitle}>Información Adicional</Text>
            {data.customerEmail && <View style={s.customerRow}><Text style={s.customerLabel}>Email:</Text><Text style={s.customerValue}>{data.customerEmail}</Text></View>}
            {data.customerPhone && <View style={s.customerRow}><Text style={s.customerLabel}>Teléfono:</Text><Text style={s.customerValue}>{data.customerPhone}</Text></View>}
          </View>
        )}

        {/* FOOTER */}
        <Text style={s.footer}>
          Documento generado electrónicamente — Desarrollado por Daniel Fernando Castillo Mera
        </Text>
      </Page>
    </Document>
  );
}

/* ---- Public API ---- */
export async function generateRidePDF(data: RideData): Promise<Buffer> {
  const buffer = await renderToBuffer(<RideDocument data={data} />);
  return Buffer.from(buffer);
}

export type { RideData };
