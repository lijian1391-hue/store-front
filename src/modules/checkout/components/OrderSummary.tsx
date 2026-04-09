import { convertToLocale } from "@lib/utils/money";
import type { StoreCart } from "@medusajs/types";

interface OrderSummaryProps {
  cart: StoreCart;
}

export const OrderSummary = ({ cart }: OrderSummaryProps) => {
  const currencyCode = cart.currency_code || "USD";

  return (
    <div className="jumia-sticky jumia-top-8">
      <h2 className="jumia-text-2xl jumia-font-bold jumia-mb-6">In your Cart</h2>

      <div className="jumia-space-y-3 jumia-mb-6">
        <div className="jumia-flex jumia-justify-between jumia-text-sm">
          <span className="jumia-text-gray-600">
            Subtotal (excl. shipping and taxes)
          </span>
          <span>
            {convertToLocale({ amount: cart.item_subtotal || 0, currencyCode })}
          </span>
        </div>

        <div className="jumia-flex jumia-justify-between jumia-text-sm">
          <span className="jumia-text-gray-600">Shipping</span>
          <span>
            {convertToLocale({
              amount: cart.shipping_total || 0,
              currencyCode,
            })}
          </span>
        </div>

        <div className="jumia-flex jumia-justify-between jumia-text-sm">
          <span className="jumia-text-gray-600">Taxes</span>
          <span>
            {convertToLocale({ amount: cart.tax_total || 0, currencyCode })}
          </span>
        </div>

        <div className="jumia-pt-4 jumia-border-t jumia-border-gray-200 jumia-flex jumia-justify-between jumia-font-bold jumia-text-base">
          <span>Total</span>
          <span>
            {convertToLocale({ amount: cart.total || 0, currencyCode })}
          </span>
        </div>
      </div>

      <div className="jumia-border-t jumia-border-gray-200 jumia-pt-4 jumia-space-y-4">
        {cart.items?.map((item) => {
          const thumbnailUrl =
            item.variant?.product?.thumbnail ||
            item.variant?.product?.images?.[0]?.url;
          const productTitle = item.variant?.product?.title || "Product";
          const variantTitle = item.variant?.title || "";
          const unitPrice = item.unit_price || 0;
          const quantity = item.quantity || 1;
          const lineTotal = unitPrice * quantity;

          return (
            <div key={item.id} className="jumia-flex jumia-gap-3">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={productTitle}
                  className="jumia-w-14 jumia-h-14 jumia-object-cover jumia-rounded jumia-border jumia-border-gray-200 jumia-flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="jumia-w-14 jumia-h-14 jumia-bg-gray-100 jumia-rounded jumia-border jumia-border-gray-200 jumia-flex-shrink-0" />
              )}

              <div className="jumia-flex-1 jumia-min-w-0">
                <p className="jumia-font-medium jumia-text-sm jumia-truncate">{productTitle}</p>
                {variantTitle && (
                  <p className="jumia-text-xs jumia-text-gray-500">
                    Variant: {variantTitle}
                  </p>
                )}
                <div className="jumia-flex jumia-justify-between jumia-mt-1 jumia-text-sm">
                  <span className="jumia-text-gray-500">
                    {quantity}x{" "}
                    {convertToLocale({ amount: unitPrice, currencyCode })}
                  </span>
                  <span className="jumia-font-medium">
                    {convertToLocale({ amount: lineTotal, currencyCode })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
