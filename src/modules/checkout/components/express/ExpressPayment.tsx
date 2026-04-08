import { completeCart, initPaymentSession } from "@lib/stores/cart";
import { sdk } from "@lib/sdk";
import { convertToLocale } from "@lib/utils/money";
import type { StoreCart } from "@medusajs/types";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { ExpressCheckoutCard } from "./ExpressCheckoutCard";

interface ExpressPaymentProps {
  cart: StoreCart;
  countryCode: string;
  isActive: boolean;
}

export const ExpressPayment = ({ cart, countryCode, isActive }: ExpressPaymentProps) => {
  const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    cart.payment_collection?.payment_sessions?.[0]?.provider_id || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!isActive || !cart.region_id) return;

    sdk.store.payment.listPaymentProviders({ region_id: cart.region_id })
      .then(({ payment_providers }) => {
        setPaymentProviders(payment_providers);
        if (payment_providers.length > 0 && !cart.payment_collection?.payment_sessions?.length) {
          setSelectedProvider(payment_providers[0].id);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch payment providers:", error);
      });
  }, [isActive, cart.region_id, cart.payment_collection]);

  const handleSelectProvider = async (providerId: string) => {
    setSelectedProvider(providerId);
    setIsSaving(true);

    try {
      await initPaymentSession(providerId);
    } catch (error) {
      console.error("Failed to initialize payment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) {
      setError("Payment system not ready");
      return;
    }

    setIsPlacing(true);
    setError("");

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        setIsPlacing(false);
        return;
      }

      const completeResult = await completeCart();
      if (completeResult.type === "order" || completeResult.type === "already_completed") {
        window.location.href = `/${countryCode}/order/confirmed`;
      } else {
        setError(completeResult.error?.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Failed to place order:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (!isActive) return null;

  const isStripe = selectedProvider?.startsWith("pp_stripe_");

  return (
    <ExpressCheckoutCard
      title="Payment"
      isActive={isActive}
      isDone={!!cart.payment_collection?.payment_sessions?.length}
      path={`/${countryCode}/checkout?step=payment`}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          {paymentProviders.map((provider) => (
            <label
              key={provider.id}
              className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${
                selectedProvider === provider.id
                  ? "border-black bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment_provider"
                  value={provider.id}
                  checked={selectedProvider === provider.id}
                  onChange={() => handleSelectProvider(provider.id)}
                  className="w-4 h-4 accent-black"
                />
                <span className="font-medium">
                  {provider.id === "pp_system_default"
                    ? "Cash on Delivery"
                    : provider.id.replace(/^pp_/, "").replace(/_/g, " ")}
                </span>
              </div>
            </label>
          ))}
        </div>

        {isStripe && cart.payment_collection?.payment_sessions?.some((s) => s.provider_id === selectedProvider) && (
          <div className="p-4 border border-gray-200 rounded-md">
            <PaymentElement />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              {convertToLocale({
                amount: cart.item_subtotal || 0,
                currencyCode: cart.currency_code,
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {convertToLocale({
                amount: cart.shipping_total || 0,
                currencyCode: cart.currency_code,
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxes</span>
            <span className="font-medium">
              {convertToLocale({
                amount: cart.tax_total || 0,
                currencyCode: cart.currency_code,
              })}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>
              {convertToLocale({
                amount: cart.total || 0,
                currencyCode: cart.currency_code,
              })}
            </span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={!selectedProvider || isSaving || isPlacing}
          className="w-full py-3 px-6 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPlacing ? "Placing order..." : `Pay ${convertToLocale({
            amount: cart.total || 0,
            currencyCode: cart.currency_code,
          })}`}
        </button>
      </div>
    </ExpressCheckoutCard>
  );
};
