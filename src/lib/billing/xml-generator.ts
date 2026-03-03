/* ============================================
   XML GENERATOR — SRI Ecuador Factura v2.1.0
   ============================================ */

interface XMLInvoiceData {
  // Info Tributaria
  ambiente: string;
  tipoEmision: string;
  razonSocial: string;
  nombreComercial?: string;
  ruc: string;
  claveAcceso: string;
  establecimiento: string;
  puntoEmision: string;
  secuencial: string;
  direccionMatriz: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad: boolean;
  // Info Factura
  fechaEmision: string; // dd/mm/yyyy
  direccionEstablecimiento?: string;
  tipoIdentificacionComprador: string;
  razonSocialComprador: string;
  identificacionComprador: string;
  totalSinImpuestos: number;
  totalDescuento: number;
  subtotal15: number;
  subtotal0: number;
  subtotalNoObjeto: number;
  subtotalExento: number;
  iva15: number;
  importeTotal: number;
  moneda: string;
  formaPago: string;
  formaPagoTotal: number;
  plazo: number;
  // Detalles
  items: {
    codigoPrincipal: string;
    codigoAuxiliar?: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    precioTotalSinImpuesto: number;
    ivaCode: string;
    ivaTarifa: number;
    ivaBaseImponible: number;
    ivaValor: number;
  }[];
  // Info Adicional
  infoAdicional?: Record<string, string>;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function n(val: number, decimals = 2): string {
  return val.toFixed(decimals);
}

export function generateInvoiceXML(data: XMLInvoiceData): string {
  const ambienteCod = data.ambiente === "PRODUCCION" ? "2" : "1";
  const tipoEmisionCod = "1";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>${ambienteCod}</ambiente>
    <tipoEmision>${tipoEmisionCod}</tipoEmision>
    <razonSocial>${escapeXml(data.razonSocial)}</razonSocial>`;

  if (data.nombreComercial) {
    xml += `\n    <nombreComercial>${escapeXml(data.nombreComercial)}</nombreComercial>`;
  }

  xml += `
    <ruc>${data.ruc}</ruc>
    <claveAcceso>${data.claveAcceso}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>${data.establecimiento}</estab>
    <ptoEmi>${data.puntoEmision}</ptoEmi>
    <secuencial>${data.secuencial}</secuencial>
    <dirMatriz>${escapeXml(data.direccionMatriz)}</dirMatriz>`;

  if (data.contribuyenteEspecial) {
    xml += `\n    <contribuyenteEspecial>${data.contribuyenteEspecial}</contribuyenteEspecial>`;
  }

  xml += `
    <obligadoContabilidad>${data.obligadoContabilidad ? "SI" : "NO"}</obligadoContabilidad>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${data.fechaEmision}</fechaEmision>`;

  if (data.direccionEstablecimiento) {
    xml += `\n    <dirEstablecimiento>${escapeXml(data.direccionEstablecimiento)}</dirEstablecimiento>`;
  }

  xml += `
    <tipoIdentificacionComprador>${data.tipoIdentificacionComprador}</tipoIdentificacionComprador>
    <razonSocialComprador>${escapeXml(data.razonSocialComprador)}</razonSocialComprador>
    <identificacionComprador>${data.identificacionComprador}</identificacionComprador>
    <totalSinImpuestos>${n(data.totalSinImpuestos)}</totalSinImpuestos>
    <totalDescuento>${n(data.totalDescuento)}</totalDescuento>
    <totalConImpuestos>`;

  // IVA 15%
  if (data.subtotal15 > 0) {
    xml += `
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>${n(data.subtotal15)}</baseImponible>
        <valor>${n(data.iva15)}</valor>
      </totalImpuesto>`;
  }

  // IVA 0%
  if (data.subtotal0 > 0) {
    xml += `
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>0</codigoPorcentaje>
        <baseImponible>${n(data.subtotal0)}</baseImponible>
        <valor>0.00</valor>
      </totalImpuesto>`;
  }

  // No objeto IVA
  if (data.subtotalNoObjeto > 0) {
    xml += `
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>6</codigoPorcentaje>
        <baseImponible>${n(data.subtotalNoObjeto)}</baseImponible>
        <valor>0.00</valor>
      </totalImpuesto>`;
  }

  // Exento IVA
  if (data.subtotalExento > 0) {
    xml += `
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>7</codigoPorcentaje>
        <baseImponible>${n(data.subtotalExento)}</baseImponible>
        <valor>0.00</valor>
      </totalImpuesto>`;
  }

  xml += `
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>${n(data.importeTotal)}</importeTotal>
    <moneda>${data.moneda}</moneda>
    <pagos>
      <pago>
        <formaPago>${data.formaPago}</formaPago>
        <total>${n(data.formaPagoTotal)}</total>
        <plazo>${data.plazo}</plazo>
        <unidadTiempo>dias</unidadTiempo>
      </pago>
    </pagos>
  </infoFactura>
  <detalles>`;

  for (const item of data.items) {
    xml += `
    <detalle>
      <codigoPrincipal>${escapeXml(item.codigoPrincipal)}</codigoPrincipal>`;
    if (item.codigoAuxiliar) {
      xml += `\n      <codigoAuxiliar>${escapeXml(item.codigoAuxiliar)}</codigoAuxiliar>`;
    }
    xml += `
      <descripcion>${escapeXml(item.descripcion)}</descripcion>
      <cantidad>${n(item.cantidad, 6)}</cantidad>
      <precioUnitario>${n(item.precioUnitario, 6)}</precioUnitario>
      <descuento>${n(item.descuento)}</descuento>
      <precioTotalSinImpuesto>${n(item.precioTotalSinImpuesto)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>${item.ivaCode}</codigoPorcentaje>
          <tarifa>${n(item.ivaTarifa)}</tarifa>
          <baseImponible>${n(item.ivaBaseImponible)}</baseImponible>
          <valor>${n(item.ivaValor)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`;
  }

  xml += `
  </detalles>`;

  if (data.infoAdicional && Object.keys(data.infoAdicional).length > 0) {
    xml += `
  <infoAdicional>`;
    for (const [key, value] of Object.entries(data.infoAdicional)) {
      if (value) {
        xml += `\n    <campoAdicional nombre="${escapeXml(key)}">${escapeXml(value)}</campoAdicional>`;
      }
    }
    xml += `
  </infoAdicional>`;
  }

  xml += `
</factura>`;

  return xml;
}
