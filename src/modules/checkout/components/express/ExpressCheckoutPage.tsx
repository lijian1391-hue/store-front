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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add items before checking out.</p>
        <a
          href={`/${countryCode}/store`}
          className="inline-block bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
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
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <ExpressProduct cart={cart} countryCode={countryCode} isActive={currentStep === "product"} />
          <ExpressAddress cart={cart} countries={countries} countryCode={countryCode} isActive={currentStep === "address"} />
          <ExpressShipping cart={cart} isActive={currentStep === "shipping"} />
          <ExpressPayment cart={cart} countryCode={countryCode} isActive={currentStep === "payment"} />
        </div>
        <div className="lg:col-span-1">
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
