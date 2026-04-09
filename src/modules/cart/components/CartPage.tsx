import {
  $cart,
  removeFromCart,
  updateLineItemQuantity,
} from "@lib/stores/cart";
import { convertToLocale } from "@lib/utils/money";
import { useStore } from "@nanostores/react";

const CartPage = ({ countryCode }: { countryCode: string }) => {
  const cart = useStore($cart);

  const handleQuantityChange = (lineId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(lineId);
    } else {
      updateLineItemQuantity(lineId, newQuantity);
    }
  };

  const handleRemoveItem = (lineId: string) => {
    removeFromCart(lineId);
  };

  if (!cart || !cart.items?.length) {
    return (
      <div className="jumia-max-w-7xl jumia-mx-auto jumia-px-4 jumia-py-16 jumia-text-center">
        <h1 className="jumia-text-3xl jumia-font-bold jumia-mb-4">Your cart is empty</h1>
        <p className="jumia-text-gray-600 jumia-mb-6">Add items to your cart before checking out.</p>
        <a
          href={`/${countryCode}/store`}
          className="jumia-inline-block jumia-bg-black jumia-text-white jumia-py-3 jumia-px-8 jumia-rounded jumia-hover:bg-gray-800 jumia-transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="jumia-max-w-7xl jumia-mx-auto jumia-px-4 jumia-py-8">
      <h1 className="jumia-text-2xl jumia-font-bold jumia-mb-6">Shopping Cart</h1>

      <div className="jumia-grid jumia-grid-cols-1 jumia-lg:grid-cols-4 jumia-gap-8">
        {/* Left column: Cart items */}
        <div className="jumia-lg:col-span-3">
          <div className="jumia-space-y-4">
            {cart.items?.map((item) => {
              const product = item.variant?.product;
              const variant = item.variant;
              const productTitle = product?.title || "Product";
              const variantTitle = variant?.title ? ` - ${variant.title}` : "";
              const title = `${productTitle}${variantTitle}`;
              const thumbnail = item.variant?.product?.thumbnail;
              const unitPrice = item.unit_price || 0;
              const quantity = item.quantity || 1;
              const lineTotal = item.line_total || 0;

              return (
                <div
                  key={item.id}
                  className="jumia-flex jumia-flex-col jumia-md:flex-row jumia-gap-4 jumia-p-4 jumia-bg-white jumia-rounded jumia-shadow-sm jumia-border jumia-border-gray-200"
                >
                  {/* Image */}
                  <div className="jumia-w-full jumia-md:w-24 jumia-h-24 jumia-flex-shrink-0">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={title}
                        className="jumia-w-full jumia-h-full jumia-object-cover jumia-rounded"
                      />
                    ) : (
                      <div className="jumia-w-full jumia-h-full jumia-bg-gray-200 jumia-flex jumia-items-center jumia-justify-center jumia-rounded">
                        <span className="jumia-text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="jumia-flex jumia-flex-1 jumia-flex-col jumia-justify-between">
                    <div>
                      <h3 className="jumia-text-sm jumia-font-medium jumia-text-gray-900">
                        {title}
                      </h3>
                      {variant?.title && (
                        <p className="jumia-text-xs jumia-text-gray-500 jumia-mt-1">
                          {variant.title}
                        </p>
                      )}
                    </div>

                    <div className="jumia-flex jumia-items-center jumia-gap-4 jumia-mt-2">
                      {/* Quantity */}
                      <div className="jumia-flex jumia-items-center jumia-gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, quantity - 1)
                          }
                          className="jumia-w-8 jumia-h-8 jumia-flex jumia-items-center jumia-justify-center jumia-border jumia-border-gray-300 jumia-rounded jumia-hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="jumia-w-8 jumia-text-center">{quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, quantity + 1)
                          }
                          className="jumia-w-8 jumia-h-8 jumia-flex jumia-items-center jumia-justify-center jumia-border jumia-border-gray-300 jumia-rounded jumia-hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="jumia-text-sm">
                        {convertToLocale({
                          amount: unitPrice,
                          currencyCode: cart.currency_code,
                        })}
                      </div>

                      {/* Total */}
                      <div className="jumia-text-sm jumia-font-medium">
                        {convertToLocale({
                          amount: lineTotal,
                          currencyCode: cart.currency_code,
                        })}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="jumia-text-red-600 jumia-hover:text-red-700 jumia-text-sm"
                        aria-label={`Remove ${title} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Order summary */}
        <div className="jumia-lg:col-span-1">
          <div className="jumia-sticky jumia-top-8">
            <h2 className="jumia-text-xl jumia-font-bold jumia-mb-6">Summary</h2>

            <div className="jumia-border jumia-border-gray-200 jumia-rounded jumia-p-6 jumia-space-y-4">
              <div className="jumia-space-y-3">
                <div className="jumia-flex jumia-justify-between jumia-text-sm">
                  <span className="jumia-text-gray-600">
                    Subtotal (excl. shipping and taxes)
                  </span>
                  <span>
                    {convertToLocale({
                      amount: cart?.item_subtotal || 0,
                      currencyCode: cart?.currency_code,
                    })}
                  </span>
                </div>

                <div className="jumia-flex jumia-justify-between jumia-text-sm">
                  <span className="jumia-text-gray-600">Shipping</span>
                  <span>
                    {convertToLocale({
                      amount: cart?.shipping_total || 0,
                      currencyCode: cart?.currency_code,
                    })}
                  </span>
                </div>

                <div className="jumia-flex jumia-justify-between jumia-text-sm">
                  <span className="jumia-text-gray-600">Taxes</span>
                  <span>
                    {convertToLocale({
                      amount: cart?.tax_total || 0,
                      currencyCode: cart?.currency_code,
                    })}
                  </span>
                </div>

                <div className="jumia-pt-4 jumia-border-t jumia-border-gray-200">
                  <div className="jumia-flex jumia-justify-between jumia-text-lg jumia-font-bold">
                    <span>Total</span>
                    <span>
                      {convertToLocale({
                        amount: cart?.total || 0,
                        currencyCode: cart?.currency_code,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={`/${countryCode}/checkout`}
                className="jumia-w-full jumia-block jumia-text-center jumia-bg-black jumia-text-white jumia-py-4 jumia-px-6 jumia-rounded jumia-hover:bg-gray-800 jumia-transition-colors jumia-mt-6"
              >
                Go to checkout
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
