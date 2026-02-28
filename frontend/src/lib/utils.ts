export function formatPrice(cents: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function getStatusBadge(status: string, totalFunded: number, price: number): { label: string; color: string } {
  const pct = price > 0 ? totalFunded / price : 0;

  switch (status) {
    case "FULLY_FUNDED":
      return { label: "Fully funded", color: "bg-green-100 text-green-800" };
    case "PARTIALLY_FUNDED":
      if (pct > 0.5) return { label: "Almost funded", color: "bg-yellow-100 text-yellow-800" };
      return { label: "Funding in progress", color: "bg-blue-100 text-blue-800" };
    default:
      return { label: "Available", color: "bg-gray-100 text-gray-800" };
  }
}
