"use client";

import { jsPDF } from "jspdf";
import { Branding, Order } from "@/lib/api";
import { money } from "@/lib/utils";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = (hex || "").replace("#", "").trim();
  if (cleaned.length !== 6 || Number.isNaN(parseInt(cleaned, 16))) return [31, 107, 74];
  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function paidLabel(order: Order) {
  if (order.payment_method === "cod") {
    if (order.status === "cancelled") return "Cancelled";
    if (order.status === "delivered") return "COD · Delivered";
    return "Cash on delivery";
  }
  if (order.status === "cancelled") return "Cancelled";
  if (order.status === "delivered") return "Paid · Delivered";
  if (order.status === "dispatched") return "Paid · Shipped";
  return "Paid";
}

async function loadLogo(url: string | null | undefined) {
  if (!url) return null;
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      const timer = window.setTimeout(() => reject(new Error("logo timeout")), 2500);
      el.onload = () => {
        window.clearTimeout(timer);
        resolve(el);
      };
      el.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("logo"));
      };
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/png"),
      w: image.naturalWidth,
      h: image.naturalHeight,
    };
  } catch {
    return null;
  }
}

function drawHairline(doc: jsPDF, y: number, gray = 200) {
  doc.setDrawColor(gray);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

function wrap(doc: jsPDF, text: string, width: number) {
  return doc.splitTextToSize(text, width) as string[];
}

export async function downloadOrderReceipt(order: Order, branding: Branding | null) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const brand = branding?.brandName || branding?.name || "Store";
  const accent = hexToRgb(branding?.primaryColor || "#1f6b4a");
  const currency = (order.currency || "usd").toUpperCase();
  const subtotal = order.subtotal_cents ?? order.total_cents;
  const logo = await loadLogo(branding?.logoUrl);

  doc.setFillColor(...accent);
  doc.rect(0, 0, PAGE_W, 6, "F");

  let y = 16;
  if (logo) {
    const maxW = 38;
    const maxH = 14;
    const scale = Math.min(maxW / logo.w, maxH / logo.h);
    const w = logo.w * scale;
    const h = logo.h * scale;
    const format = "PNG";
    try {
      doc.addImage(logo.dataUrl, format, MARGIN, y, w, h);
    } catch {
      // Fall through to the wordmark if the image format is unsupported.
    }
    y += h + 4;
  }

  doc.setTextColor(24, 22, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(brand, MARGIN, y);
  y += 5;
  if (branding?.tagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 84, 76);
    doc.text(branding.tagline, MARGIN, y);
    y += 4;
  }

  const contact = [branding?.address, branding?.phone, branding?.email].filter(Boolean) as string[];
  if (contact.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 104, 96);
    contact.forEach((line) => {
      doc.text(line, MARGIN, y);
      y += 3.6;
    });
  }

  const metaX = 122;
  let metaY = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...accent);
  doc.text("RECEIPT", PAGE_W - MARGIN, metaY, { align: "right" });
  metaY += 8;
  doc.setTextColor(24, 22, 18);

  const meta = [
    ["Invoice", order.invoice_number],
    ["Date", formatDate(order.created_at)],
    ["Status", paidLabel(order)],
    ["Order", order.id.slice(0, 8).toUpperCase()],
  ];
  meta.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 104, 96);
    doc.text(label, metaX, metaY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(24, 22, 18);
    doc.text(value, PAGE_W - MARGIN, metaY, { align: "right" });
    metaY += 5;
  });

  y = Math.max(y, metaY) + 8;
  drawHairline(doc, y);
  y += 8;

  const colW = CONTENT_W / 2 - 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 104, 96);
  doc.text("BILL TO", MARGIN, y);
  doc.text("SHIP TO", MARGIN + CONTENT_W / 2 + 4, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(24, 22, 18);
  doc.text(order.customer_name, MARGIN, y);
  doc.text(order.customer_name, MARGIN + CONTENT_W / 2 + 4, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 66, 60);
  const billLines = [order.customer_email, order.customer_phone].filter(Boolean) as string[];
  const shipLines = wrap(doc, order.shipping_address || "Same as billing", colW);
  const blockLines = Math.max(billLines.length, shipLines.length);
  for (let i = 0; i < blockLines; i += 1) {
    if (billLines[i]) doc.text(billLines[i], MARGIN, y);
    if (shipLines[i]) doc.text(shipLines[i], MARGIN + CONTENT_W / 2 + 4, y);
    y += 4;
  }

  y += 6;
  doc.setFillColor(247, 244, 239);
  doc.rect(MARGIN, y, CONTENT_W, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 104, 96);
  const qtyX = MARGIN + 118;
  const unitX = MARGIN + 148;
  const amtX = PAGE_W - MARGIN;
  doc.text("ITEM", MARGIN + 3, y + 5.2);
  doc.text("QTY", qtyX, y + 5.2, { align: "right" });
  doc.text("UNIT PRICE", unitX, y + 5.2, { align: "right" });
  doc.text("AMOUNT", amtX, y + 5.2, { align: "right" });
  y += 12;

  const ensureSpace = (needed: number) => {
    if (y + needed < PAGE_H - 28) return;
    doc.addPage();
    doc.setFillColor(...accent);
    doc.rect(0, 0, PAGE_W, 6, "F");
    y = 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(24, 22, 18);
    doc.text(`${brand}  ·  ${order.invoice_number}`, MARGIN, y);
    y += 8;
  };

  order.items.forEach((item, index) => {
    const nameLines = wrap(doc, item.name, 96);
    const rowH = Math.max(7, nameLines.length * 4 + 3);
    ensureSpace(rowH + 2);
    if (index % 2 === 1) {
      doc.setFillColor(252, 250, 246);
      doc.rect(MARGIN, y - 4, CONTENT_W, rowH, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(24, 22, 18);
    nameLines.forEach((line, lineIndex) => {
      doc.text(line, MARGIN + 3, y + lineIndex * 4);
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(String(item.quantity), qtyX, y, { align: "right" });
    doc.text(money(item.unit_price_cents, currency), unitX, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(money(item.unit_price_cents * item.quantity, currency), amtX, y, { align: "right" });
    y += rowH;
  });

  y += 2;
  drawHairline(doc, y);
  y += 8;
  ensureSpace(28);

  const totals = [
    ["Subtotal", money(subtotal, currency), false],
    ["Shipping", "Included", false],
    ["Total", money(order.total_cents, currency), true],
  ] as const;
  totals.forEach(([label, value, strong]) => {
    doc.setFont("helvetica", strong ? "bold" : "normal");
    doc.setFontSize(strong ? 12 : 9.5);
    doc.setTextColor(strong ? 24 : 90, strong ? 22 : 84, strong ? 18 : 76);
    doc.text(label, unitX - 18, y);
    doc.text(value, amtX, y, { align: "right" });
    y += strong ? 7 : 5.5;
  });

  y += 10;
  ensureSpace(24);
  drawHairline(doc, y, 220);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...accent);
  doc.text(`Thank you for shopping with ${brand}.`, MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 104, 96);
  doc.text("This is a computer-generated receipt. No signature is required.", MARGIN, y);
  y += 4;
  doc.text("Keep this invoice number if you need help with your order.", MARGIN, y);

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFillColor(...accent);
    doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 124, 116);
    doc.text(brand, MARGIN, PAGE_H - 8);
    doc.text(`Page ${page} of ${pages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  }

  doc.save(`${order.invoice_number}.pdf`);
}
