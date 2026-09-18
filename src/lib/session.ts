const SESSION_KEY = "shop_session_id";
const INVOICE_KEY = "shop_comment_invoice";
const NAME_KEY = "shop_comment_name";

export function getShopSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getSavedInvoiceNumber() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(INVOICE_KEY) || "";
}

export function saveInvoiceNumber(value: string) {
  sessionStorage.setItem(INVOICE_KEY, value.trim());
}

export function getSavedCommentName() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(NAME_KEY) || "";
}

export function saveCommentName(value: string) {
  sessionStorage.setItem(NAME_KEY, value.trim());
}
