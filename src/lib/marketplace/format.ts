const marketplacePriceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatMarketplacePrice(price: number) {
  return marketplacePriceFormatter.format(price);
}
