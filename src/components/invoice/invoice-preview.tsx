"use client";

/* ============================================
   INVOICE PREVIEW — Ecuador SRI / Guatemala SAT
   Matches real electronic invoice layout
   Reference: Multicines S.A. invoice format
   Used for: live preview + print/PDF
   ============================================ */

interface InvoicePreviewProps {
  business: {
    businessName: string; tradeName?: string; taxId: string;
    taxIdType: string; address: string; branchAddress?: string;
    specialTaxpayer?: string; keepAccounting: boolean;
    establishment: string; emissionPoint: string; logoUrl?: string;
    phone?: string; email?: string;
  } | null;
  invoice: {
    invoiceNumber: string;
    authorizationNumber?: string;
    accessKey?: string;
    clientName: string; clientTaxId: string;
    clientAddress?: string; clientPhone?: string; clientEmail?: string;
    issueDate: string;
    paymentMethod: string;
    ivaRate: number;
    items: {
      code?: string; description: string; quantity: number;
      unitPrice: number; discount: number; subtotal: number; ivaRate: number;
    }[];
  };
  compact?: boolean;
}

export function InvoicePreview({ business, invoice, compact }: InvoicePreviewProps) {
  const items = invoice.items;
  const subtotalIva = items.filter(i => i.ivaRate > 0).reduce((s, i) => s + i.subtotal, 0);
  const subtotalZero = items.filter(i => i.ivaRate === 0).reduce((s, i) => s + i.subtotal, 0);
  const subtotal = subtotalIva + subtotalZero;
  const totalDiscount = items.reduce((s, i) => s + i.discount, 0);
  const ivaAmount = +(subtotalIva * invoice.ivaRate / 100).toFixed(2);
  const total = +(subtotal + ivaAmount).toFixed(2);

  const fmt = (n: number) => n.toFixed(2);
  const taxLabel = business?.taxIdType === "RUC" ? "R.U.C." : "NIT";

  // Generate a display access key (49 digits)
  const displayAccessKey = invoice.accessKey || generateAccessKeyPlaceholder(invoice, business);
  const displayAuthNumber = invoice.authorizationNumber || displayAccessKey;

  return (
    <div
      id="invoice-preview"
      className={`bg-white text-black leading-tight w-full max-w-[720px] mx-auto font-[Arial,Helvetica,sans-serif] ${compact ? "text-[9px] p-3" : "text-[11px] p-6"}`}
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* ======== HEADER: Logo + Tax Box ======== */}
      <div className="flex gap-4 mb-4">
        {/* Left: Logo + Trade Name */}
        <div className="flex-1 min-w-0">
          {business?.logoUrl ? (
            <img
              src={business.logoUrl}
              alt="Logo empresa"
              className={`${compact ? "h-10" : "h-14"} mb-2 object-contain`}
              crossOrigin="anonymous"
            />
          ) : (
            <div className={`${compact ? "h-10 w-28 text-[8px]" : "h-14 w-40 text-[10px]"} bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2 rounded`}>
              LOGO EMPRESA
            </div>
          )}
          {business?.tradeName && (
            <div className={`${compact ? "text-sm" : "text-lg"} font-bold text-gray-800 leading-tight`}>
              {business.tradeName}
            </div>
          )}
        </div>

        {/* Right: Tax Info Box */}
        <div className={`border-2 border-gray-800 ${compact ? "p-2 w-[220px] text-[8px]" : "p-3 w-[290px] text-[10px]"} flex-shrink-0`}>
          <div className="mb-1">
            <span className="text-gray-500">{taxLabel}: </span>
            <span className="font-bold text-xs">{business?.taxId || "—"}</span>
          </div>
          <div className={`text-center ${compact ? "text-sm" : "text-base"} font-bold tracking-[0.3em] my-2`}>
            F A C T U R A
          </div>
          <div className="mb-2">
            <span className="text-gray-500">No.: </span>
            <span className="font-bold">{invoice.invoiceNumber || "001-001-000000001"}</span>
          </div>
          
          {/* Authorization Number */}
          <div className="mb-1">
            <div className="text-gray-500 font-semibold mb-0.5">NÚMERO DE AUTORIZACIÓN:</div>
            <div className="text-[7px] font-mono break-all leading-snug">{displayAuthNumber}</div>
          </div>

          {/* Environment & Emission */}
          <div className="flex gap-4 mb-1 mt-1">
            <div><span className="text-gray-500">AMBIENTE: </span><span className="font-semibold">PRODUCCION</span></div>
          </div>
          <div className="mb-2">
            <span className="text-gray-500">EMISIÓN: </span><span className="font-semibold">NORMAL</span>
          </div>

          {/* Access Key / Barcode */}
          <div>
            <div className="text-gray-500 font-semibold mb-1">CLAVE DE ACCESO:</div>
            <div className="bg-gray-50 border border-gray-200 p-1.5 rounded">
              <div className="flex items-center justify-center h-7 gap-[1px] overflow-hidden">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black flex-shrink-0"
                    style={{
                      width: (i * 7 + 3) % 3 === 0 ? "2px" : "1px",
                      height: "100%",
                      opacity: i % 4 === 0 ? 0 : 1,
                    }}
                  />
                ))}
              </div>
              <div className="text-[6px] font-mono text-center mt-0.5 break-all leading-tight text-gray-700">{displayAccessKey}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======== BUSINESS INFO BOX ======== */}
      <div className={`border border-gray-400 ${compact ? "p-2 mb-2 text-[8px]" : "p-2.5 mb-3 text-[10px]"}`}>
        <div className={`font-bold ${compact ? "text-[9px]" : "text-xs"} mb-1`}>
          {business?.businessName || "NOMBRE DE LA EMPRESA"}
        </div>
        <div className="text-gray-600 mb-0.5">
          <span className="font-semibold">Dir. Matriz: </span>
          {business?.address || "—"}
        </div>
        {business?.branchAddress && (
          <div className="text-gray-600 mb-0.5">
            <span className="font-semibold">Dir. Sucursal: </span>
            {business.branchAddress}
          </div>
        )}
        {business?.specialTaxpayer && (
          <div className="text-gray-600 mb-0.5">
            Contribuyente Especial No. {business.specialTaxpayer}
          </div>
        )}
        <div className="text-gray-600">
          Obligado a llevar Contabilidad: <span className="font-semibold">{business?.keepAccounting ? "SI" : "NO"}</span>
        </div>
      </div>

      {/* ======== CLIENT INFO ======== */}
      <div className={`border border-gray-400 ${compact ? "p-2 mb-2 text-[8px]" : "p-2.5 mb-3 text-[10px]"}`}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <span className="text-gray-500">Razón Social / Nombres y Apellidos: </span>
            <span className="font-medium">{invoice.clientName || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Identificación: </span>
            <span className="font-medium">{invoice.clientTaxId || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Fecha Emisión: </span>
            <span className="font-medium">{invoice.issueDate || new Date().toLocaleDateString("es-GT")}</span>
          </div>
          <div>
            <span className="text-gray-500">Guía Remisión: </span>
          </div>
        </div>
      </div>

      {/* ======== ITEMS TABLE ======== */}
      <table className={`w-full border border-gray-400 border-collapse ${compact ? "mb-2 text-[8px]" : "mb-3 text-[10px]"}`}>
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-1.5 py-1 text-left font-semibold w-16">Cod. Principal</th>
            <th className="border border-gray-300 px-1.5 py-1 text-center font-semibold w-10">Cant.</th>
            <th className="border border-gray-300 px-1.5 py-1 text-left font-semibold">Descripción</th>
            <th className="border border-gray-300 px-1.5 py-1 text-right font-semibold w-16">Precio Unitario</th>
            <th className="border border-gray-300 px-1.5 py-1 text-right font-semibold w-14">Descuento</th>
            <th className="border border-gray-300 px-1.5 py-1 text-right font-semibold w-16">Precio Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="border border-gray-300 px-2 py-6 text-center text-gray-400 italic">
                Agregue productos a la factura
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-1.5 py-1 font-mono text-[9px]">{item.code || "—"}</td>
                <td className="border border-gray-300 px-1.5 py-1 text-center">{Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}</td>
                <td className="border border-gray-300 px-1.5 py-1">{item.description}</td>
                <td className="border border-gray-300 px-1.5 py-1 text-right tabular-nums">{fmt(item.unitPrice)}</td>
                <td className="border border-gray-300 px-1.5 py-1 text-right tabular-nums">{fmt(item.discount)}</td>
                <td className="border border-gray-300 px-1.5 py-1 text-right font-medium tabular-nums">{fmt(item.subtotal)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ======== BOTTOM SECTION ======== */}
      <div className="flex gap-3">
        {/* Left: Additional Info + Payment */}
        <div className="flex-1 min-w-0">
          <div className={`border border-gray-400 ${compact ? "p-1.5 text-[8px]" : "p-2 text-[10px]"} mb-2`}>
            <div className="font-semibold mb-1 text-gray-800">Información Adicional</div>
            {invoice.clientAddress && (
              <div className="mb-0.5"><span className="text-gray-500 font-medium">Dirección</span> <span className="ml-4">{invoice.clientAddress}</span></div>
            )}
            {invoice.clientPhone && (
              <div className="mb-0.5"><span className="text-gray-500 font-medium">Teléfono</span> <span className="ml-4">{invoice.clientPhone}</span></div>
            )}
            {invoice.clientEmail && (
              <div className="mb-0.5"><span className="text-gray-500 font-medium">Email</span> <span className="ml-4">{invoice.clientEmail}</span></div>
            )}
            {!invoice.clientAddress && !invoice.clientPhone && !invoice.clientEmail && (
              <div className="text-gray-400 italic py-1">Sin información adicional</div>
            )}
          </div>

          <div className={`border border-gray-400 overflow-hidden ${compact ? "text-[8px]" : "text-[10px]"}`}>
            <div className="grid grid-cols-[1fr_auto_auto] bg-gray-50 font-semibold border-b border-gray-300">
              <div className="px-2 py-1 border-r border-gray-300">Forma de Pago</div>
              <div className="px-2 py-1 border-r border-gray-300 w-16 text-right">Total</div>
              <div className="px-2 py-1 w-14 text-center">Plazo</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto]">
              <div className="px-2 py-1 border-r border-gray-300 truncate">{invoice.paymentMethod}</div>
              <div className="px-2 py-1 border-r border-gray-300 w-16 text-right tabular-nums">{fmt(total)}</div>
              <div className="px-2 py-1 w-14 text-center">0</div>
            </div>
          </div>
        </div>

        {/* Right: Tax Summary */}
        <div className={`${compact ? "w-[180px] text-[8px]" : "w-[230px] text-[10px]"} border border-gray-400 flex-shrink-0`}>
          <TaxRow label={`SUBTOTAL ${invoice.ivaRate}%`} value={fmt(subtotalIva)} />
          <TaxRow label="SUBTOTAL 0%" value={fmt(subtotalZero)} />
          <TaxRow label="SUBTOTAL No objeto de IVA" value="0.00" />
          <TaxRow label="SUBTOTAL Exento de IVA" value="0.00" />
          <TaxRow label="SUBTOTAL SIN IMPUESTOS" value={fmt(subtotal)} />
          <TaxRow label="TOTAL Descuento" value={fmt(totalDiscount)} />
          <TaxRow label="ICE" value="0.00" />
          <TaxRow label={`IVA ${invoice.ivaRate}%`} value={fmt(ivaAmount)} />
          <TaxRow label="IRBPNR" value="0.00" />
          <TaxRow label="PROPINA" value="0.00" />
          <TaxRow label="VALOR TOTAL" value={fmt(total)} bold />
        </div>
      </div>
    </div>
  );
}

function TaxRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-gray-200 last:border-b-0 px-2 py-[3px] ${bold ? "font-bold bg-gray-50 text-[11px]" : ""}`}>
      <span className={bold ? "text-gray-800" : "text-gray-600"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function generateAccessKeyPlaceholder(
  invoice: { invoiceNumber: string },
  business: { taxId: string; establishment: string; emissionPoint: string } | null
): string {
  if (!business) return "0".repeat(49);
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = String(now.getFullYear());
  const dateStr = dd + mm + yyyy;
  const docType = "01";
  const ruc = business.taxId.padStart(13, "0").slice(0, 13);
  const env = "2";
  const est = business.establishment.padStart(3, "0");
  const emi = business.emissionPoint.padStart(3, "0");
  const parts = invoice.invoiceNumber.split("-");
  const seq = (parts[2] || "000000001").padStart(9, "0");
  const randomCode = "12345678";
  const emissionType = "1";
  const base = dateStr + docType + ruc + env + est + emi + seq + randomCode + emissionType;
  const checkDigit = calculateMod11(base);
  return base + checkDigit;
}

function calculateMod11(value: string): string {
  const weights = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  const digits = value.split("").reverse();
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i], 10) * weights[i % weights.length];
  }
  const remainder = sum % 11;
  const check = 11 - remainder;
  if (check === 11) return "0";
  if (check === 10) return "1";
  return String(check);
}
