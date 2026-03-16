/* ============================================
   CLAVE DE ACCESO — SRI Ecuador
   49-digit unique identifier for electronic invoices
   ============================================ */

function calcularModulo11(data: string): number {
  const weights = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = data.length - 1, w = 0; i >= 0; i--, w++) {
    sum += parseInt(data[i]) * weights[w % weights.length];
  }
  const remainder = sum % 11;
  const result = 11 - remainder;
  if (result === 11) return 0;
  if (result === 10) return 1;
  return result;
}

export function generateClaveAcceso(params: {
  fecha: Date;
  tipoComprobante: string; // "01" = Factura
  ruc: string; // 13 digits
  ambiente: string; // "1" = Pruebas, "2" = Producción
  establecimiento: string; // "001"
  puntoEmision: string; // "001"
  secuencial: string; // 9 digits zero-padded
  tipoEmision?: string; // "1" = Normal
}): string {
  const dd = String(params.fecha.getDate()).padStart(2, "0");
  const mm = String(params.fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = String(params.fecha.getFullYear());
  const fechaStr = `${dd}${mm}${yyyy}`;

  const codigoNumerico = String(Math.floor(Math.random() * 99999999)).padStart(8, "0");
  const tipoEmision = params.tipoEmision || "1";
  const ambienteCod = params.ambiente === "PRODUCCION" ? "2" : "1";

  const base = `${fechaStr}${params.tipoComprobante}${params.ruc}${ambienteCod}${params.establecimiento}${params.puntoEmision}${params.secuencial}${codigoNumerico}${tipoEmision}`;
  const dv = calcularModulo11(base);

  return `${base}${dv}`;
}

export function formatInvoiceNumber(estab: string, ptoEmi: string, seq: number): string {
  return `${estab}-${ptoEmi}-${String(seq).padStart(9, "0")}`;
}

export const FORMAS_PAGO: Record<string, string> = {
  "01": "EFECTIVO",
  "15": "COMPENSACIÓN DE DEUDAS",
  "16": "TARJETA DE DÉBITO",
  "17": "DINERO ELECTRÓNICO",
  "18": "TARJETA PREPAGO",
  "19": "TARJETA DE CRÉDITO",
  "20": "TRANSFERENCIA / DEPÓSITO BANCARIO",
  "21": "ENDOSO DE TÍTULOS",
};

export const TIPOS_IDENTIFICACION: Record<string, string> = {
  "04": "RUC",
  "05": "CÉDULA",
  "06": "PASAPORTE",
  "07": "CONSUMIDOR FINAL",
  "08": "IDENTIFICACIÓN DEL EXTERIOR",
};

export const IVA_CODES: Record<string, { label: string; rate: number }> = {
  "0": { label: "0%", rate: 0 },
  "4": { label: "15%", rate: 15 },
  "6": { label: "No Objeto de IVA", rate: 0 },
  "7": { label: "Exento de IVA", rate: 0 },
};
