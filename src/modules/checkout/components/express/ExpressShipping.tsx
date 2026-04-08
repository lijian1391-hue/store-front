import { addShippingMethod } from "@lib/stores/cart";
import { sdk } from "@lib/sdk";
import { convertToLocale } from "@lib/utils/money";
import type { StoreCart } from "@medusajs/types";
import { useEffect, useState } from "react";
import { ExpressCheckoutCard } from "./ExpressCheckoutCard";

interface ExpressShippingProps {
  cart: StoreCart;
  isActive: boolean;
}

export const ExpressShipping = ({ cart, isActive }: ExpressShippingProps) => {
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>(
    cart.shipping_methods?.[0]?.shipping_option_id || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isActive || !cart.id) return;

    sdk.store.fulfillment.listCartOptions({ cart_id: cart.id })
      .then(({ shipping_options }) => {
        setShippingOptions(shipping_options);
        if (shipping_options.length > 0 && !cart.shipping_methods?.length) {
          setSelectedOption(shipping_options[0].id);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch shipping options:", error);
      });
  }, [isActive, cart.id, cart.shipping_methods]);

  const handleSelectOption = async (optionId: string) => {
    setSelectedOption(optionId);
    setIsSaving(true);

    try {
      await addShippingMethod(optionId);
    } catch (error) {
      console.error("Failed to add shipping method:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) return;

    setIsSaving(true);
    window.location.href = `/${cart.items?.[0]?.variant?.product?.region_id ? cart.items[0].variant.product.region_id : 'us'}/checkout?step=payment`;
  };

  if (!isActive) return null;

  return (
    <ExpressCheckoutCard
      title="Shipping"
      isActive={isActive}
      isDone={!!cart.shipping_methods?.length}
      path={`/${cart.items?.[0]?.variant?.product?.region_id ? cart.items[0].variant.product.region_id : 'us'}/checkout?step=shipping`}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Select a shipping method</p>

        {isLoading && <p className="text-sm text-gray-500">Loading shipping options...</p>}

        {!isLoading && shippingOptions.length === 0 && (
          <p className="text-sm text-gray-500">No shipping options available</p>
        )}

        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${
              selectedOption === option.id
                ? "border-black bg-gray-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping_option"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => handleSelectOption(option.id)}
                className="w-4 h-4 accent-black"
              />
              <span className="font-medium">{option.name}</span>
            </div>
            <span className="font-medium">
              {option.amount === 0
                ? "Free"
                : convertToLocale({
                    amount: option.amount,
                    currencyCode: cart.currency_code,
                  })}
            </span>
          </label>
        ))}

        <button
          onClick={handleSubmit}
          disabled={!selectedOption || isSaving}
          className="w-full py-3 px-6 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Continue to payment"}
        </button>
      </div>
    </ExpressCheckoutCard>
  );
};
