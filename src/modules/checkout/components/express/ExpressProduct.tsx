import { sdk } from "@lib/sdk";
import { addToCart } from "@lib/stores/cart";
import { isProductInStock } from "@lib/utils/is-product-in-stock";
import { convertToLocale } from "@lib/utils/money";
import type { StoreCart, StoreProduct } from "@medusajs/types";
import { useEffect, useMemo, useState } from "react";
import { ExpressCheckoutCard } from "./ExpressCheckoutCard";

interface ExpressProductProps {
  cart: StoreCart;
  countryCode: string;
  isActive: boolean;
}

export const ExpressProduct = ({ cart, countryCode, isActive }: ExpressProductProps) => {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const productId = cart.items?.[0]?.variant?.product_id;

  useEffect(() => {
    if (!productId || product) return;

    sdk.store.product.retrieve(productId, {
      region_id: cart.region_id,
      fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.options",
    })
      .then(({ product }) => {
        setProduct(product);
        if (product.variants?.[0]) {
          setSelectedVariant(product.variants[0].id);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch product:", error);
        setIsLoading(false);
      });
  }, [productId, product, cart.region_id]);

  const selectedOption = useMemo(() => {
    if (!product || !selectedVariant) return null;
    return product.variants?.find((v) => v.id === selectedVariant);
  }, [product, selectedVariant]);

  const isInStock = useMemo(() => {
    if (!selectedOption) return false;
    return selectedOption.manage_inventory === false || (selectedOption.inventory_quantity || 0) > 0;
  }, [selectedOption]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !isInStock) return;

    setIsLoading(true);
    try {
      await addToCart(selectedVariant, quantity);
      window.location.href = `/${countryCode}/checkout?step=address`;
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
  };

  if (!isActive) return null;

  return (
    <ExpressCheckoutCard
      title="Product"
      isActive={isActive}
      isDone={cart.items?.length > 0}
      path={`/${countryCode}/checkout?step=product`}
    >
      {isLoading && <div className="jumia-text-sm jumia-text-gray">Loading product...</div>}
      {!isLoading && !product && <div className="jumia-text-sm jumia-text-gray">Product not found</div>}
      {!isLoading && product && (
        <div className="jumia-flex jumia-flex-col jumia-gap-6">
          <div className="jumia-flex jumia-gap-4">
            <img
              src={product.thumbnail || "/placeholder.png"}
              alt={product.title}
              className="jumia-w-32 jumia-h-32 jumia-object-cover jumia-rounded jumia-border jumia-border-gray-200"
            />
            <div className="jumia-flex jumia-flex-col jumia-gap-2">
              {product.categories?.[0] && (
                <span className="jumia-text-xs jumia-text-gray">{product.categories[0].name}</span>
              )}
              <h3 className="jumia-text-xl jumia-font-bold">{product.title}</h3>
              {selectedOption && (
                <p className="jumia-text-lg jumia-font-medium">
                  {convertToLocale({
                    amount: selectedOption.calculated_price?.calculated_amount || 0,
                    currencyCode: cart.currency_code,
                  })}
                </p>
              )}
            </div>
          </div>

          {product.description && (
            <p className="jumia-text-sm jumia-text-gray-600">{product.description}</p>
          )}

          {product.options?.length > 0 && (
            <div className="jumia-space-y-4">
              {product.options.map((option) => (
                <div key={option.id}>
                  <span className="jumia-text-sm jumia-font-medium">{option.title}</span>
                  <div className="jumia-mt-2 jumia-flex jumia-flex-wrap jumia-gap-2">
                    {option.values?.map((value) => {
                      const variant = product.variants?.find((v) =>
                        v.options?.some((o) => o.option_id === option.id && o.value === value.value)
                      );
                      const isSelected = selectedVariant === variant?.id;

                      return (
                        <button
                          key={value.id}
                          onClick={() => variant && handleVariantChange(variant.id)}
                          className={`jumia-px-4 jumia-py-2 jumia-rounded jumia-text-sm jumia-border jumia-transition-colors ${
                            isSelected
                              ? "jumia-border-black jumia-bg-black jumia-text-white"
                              : "jumia-border-gray-300 jumia-hover:border-gray-500"
                          }`}
                        >
                          {value.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="jumia-flex jumia-items-center jumia-gap-4">
            <label className="jumia-text-sm jumia-font-medium">Quantity</label>
            <input
              type="number"
              min="1"
              max={selectedOption?.inventory_quantity || 99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="jumia-w-20 jumia-px-3 jumia-py-2 jumia-border jumia-border-gray-300 jumia-rounded jumia-text-center"
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || !isInStock || isLoading}
            className={`jumia-w-full jumia-py-3 jumia-px-6 jumia-rounded jumia-text-white jumia-font-medium jumia-transition-colors ${
              !selectedVariant || !isInStock
                ? "jumia-bg-gray-400 jumia-cursor-not-allowed"
                : "jumia-bg-black jumia-hover:bg-gray-800"
            }`}
          >
            {isLoading
              ? "Adding..."
              : !selectedVariant
              ? "Select variant"
              : !isInStock
              ? "Out of stock"
              : "Add to cart"}
          </button>
        </div>
      )}
    </ExpressCheckoutCard>
  );
};
