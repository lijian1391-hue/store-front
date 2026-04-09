import {
  $cartItemCount,
  $regionId,
  initCart,
  toggleCartSidebar,
} from "@lib/stores/cart";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import "./JumiaNav.css";

interface NavProps {
  countryCode: string;
  regionId: string | null;
}

export const Nav = ({ countryCode, regionId }: NavProps) => {
  const cartItemCount = useStore($cartItemCount);

  useEffect(() => {
    if (regionId) {
      $regionId.set(regionId);
      initCart();
    }
  }, [regionId]);

  const handleCartClick = () => {
    toggleCartSidebar();
  };

  return (
    <header className="jumia-header">
      <div className="jumia-container jumia-max-w-7xl jumia-px-4 jumia-mx-auto">
        <div className="jumia-flex jumia-items-center jumia-justify-between jumia-h-16">
          <div className="jumia-flex jumia-items-center jumia-gap-8">
            <a
              href={`/${countryCode}/store`}
              className="jumia-text-sm jumia-font-medium jumia-text-black jumia-hover:text-orange jumia-transition-colors"
            >
              Products
            </a>
          </div>

          <a
            href={`/${countryCode}`}
            className="jumia-text-xl jumia-font-black jumia-tracking-wider jumia-text-black"
          >
            Astro<span className="jumia-text-orange">Medusa</span>
          </a>

          <div className="jumia-flex jumia-items-center jumia-gap-4">
            <button
              onClick={handleCartClick}
              className="jumia-relative jumia-text-sm jumia-font-medium jumia-text-black jumia-hover:text-orange jumia-transition-colors"
              aria-label={`Shopping cart with ${cartItemCount} item${cartItemCount !== 1 ? "s" : ""}`}
            >
              <svg
                className="jumia-w-6 jumia-h-6 jumia-inline jumia-mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span aria-live="polite" aria-atomic="true">
                Cart ({cartItemCount})
              </span>
              {cartItemCount > 0 && (
                <span className="jumia-cart-count">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};