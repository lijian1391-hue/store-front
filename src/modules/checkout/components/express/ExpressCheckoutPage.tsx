import { $cart } from "@lib/stores/cart";
import { useStore } from "@nanostores/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { type RegionCountry } from "../AddressFields";
import { ExpressProduct } from "./ExpressProduct";
import { ExpressAddress } from "./ExpressAddress";
import { ExpressShipping } from "./ExpressShipping";
import { ExpressPayment } from "./ExpressPayment";
import { OrderSummary } from "../OrderSummary";

interface ExpressCheckoutPageProps {
  countryCode: string;
  countries: RegionCountry[];
}

type CheckoutStep = "product" | "address" | "shipping" | "payment";

const VALID_STEPS: CheckoutStep[] = ["product", "address", "shipping", "payment"];

const stripePromise = import.meta.env.PUBLIC_STRIPE_KEY
  ? loadStripe(import.meta.env.PUBLIC_STRIPE_KEY)
  : null;

function readStepFromUrl(): CheckoutStep {
  const params = new URLSearchParams(window.location.search);
  const s = params.get("step");
  return VALID_STEPS.includes(s as CheckoutStep) ? (s as CheckoutStep) : "product";
}

function validateStep(step: CheckoutStep, cart: NonNullable<ReturnType<typeof $cart.get>>): CheckoutStep {
  if (step === "address" && !cart.shipping_address?.first_name) return "product";
  if (step === "shipping" && !cart.shipping_address?.first_name) return "address";
  if (step === "payment" && (!cart.shipping_address?.first_name || !cart.shipping_methods?.length)) {
    return step === "payment" ? "shipping" : "address";
  }
  return step;
}

export const ExpressCheckoutPage = ({ countryCode, countries }: ExpressCheckoutPageProps) => {
  const cart = useStore($cart);
  const [step, setStep] = useState(() => readStepFromUrl());

  useEffect(() => {
    const onPopState = () => setStep(readStepFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goToStep = (next: CheckoutStep) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", next);
    history.pushState(null, "", url.toString());
    setStep(next);
  };

  const currentStep = cart ? validateStep(step, cart) : "product";

  if (!cart || !cart.items?.length) {
    return (
      <div className="jumia-max-w-7xl jumia-mx-auto jumia-px-4 jumia-py-16 jumia-text-center">
        <h1 className="jumia-text-3xl jumia-font-bold jumia-mb-4">Your cart is empty</h1>
        <p className="jumia-text-gray-600 jumia-mb-6">Add items before checking out.</p>
        <a
          href={`/${countryCode}/store`}
          className="jumia-inline-block jumia-bg-black jumia-text-white jumia-py-3 jumia-px-8 jumia-rounded jumia-hover:bg-gray-800 jumia-transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  const stripeSession = cart.payment_collection?.payment_sessions?.find((s) =>
    s.provider_id?.startsWith("pp_stripe_"),
  );
  const stripeClientSecret = stripeSession?.data?.client_secret as string | undefined;

  const checkoutContent = (
    <div className="jumia-max-w-7xl jumia-mx-auto jumia-px-8 jumia-py-8">
      <div className="jumia-grid jumia-grid-1 jumia-lg:grid-cols-3 jumia-gap-12">
        <div className="jumia-lg:col-span-2 jumia-space-y-8">
          <ExpressProduct cart={cart} countryCode={countryCode} isActive={currentStep === "product"} />
          <ExpressAddress cart={cart} countries={countries} countryCode={countryCode} isActive={currentStep === "address"} />
          <ExpressShipping cart={cart} isActive={currentStep === "shipping"} />
          <ExpressPayment cart={cart} countryCode={countryCode} isActive={currentStep === "payment"} />
        </div>
        <div className="jumia-lg:col-span-1">
          <OrderSummary cart={cart} />
        </div>
      </div>
    </div>
  );

  return (
    <Elements
      key={stripeClientSecret ?? "no-stripe"}
      stripe={stripePromise}
      options={stripeClientSecret ? { clientSecret: stripeClientSecret } : undefined}
    >
      {checkoutContent}
    </Elements>
  );
};
