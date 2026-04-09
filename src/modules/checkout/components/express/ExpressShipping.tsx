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
      <div className="jumia-space-y-4">
        <p className="jumia-text-sm jumia-text-gray-600">Select a shipping method</p>

        {isLoading && <p className="jumia-text-sm jumia-text-gray">Loading shipping options...</p>}

        {!isLoading && shippingOptions.length === 0 && (
          <p className="jumia-text-sm jumia-text-gray">No shipping options available</p>
        )}

        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`jumia-flex jumia-items-center jumia-justify-between jumia-p-4 jumia-border jumia-rounded jumia-cursor-pointer jumia-transition-colors ${
              selectedOption === option.id
                ? "jumia-border-black jumia-bg-gray-50"
                : "jumia-border-gray-300 jumia-hover:border-gray-400"
            }`}
          >
            <div className="jumia-flex jumia-items-center jumia-gap-3">
              <input
                type="radio"
                name="shipping_option"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => handleSelectOption(option.id)}
                className="jumia-w-4 jumia-h-4 jumia-accent-black"
              />
              <span className="jumia-font-medium">{option.name}</span>
            </div>
            <span className="jumia-font-medium">
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
          className="jumia-w-full jumia-py-3 jumia-px-6 jumia-bg-black jumia-text-white jumia-rounded jumia-font-medium jumia-hover:bg-gray-800 jumia-transition-colors jumia-disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Continue to payment"}
        </button>
      </div>
    </ExpressCheckoutCard>
  );
};
