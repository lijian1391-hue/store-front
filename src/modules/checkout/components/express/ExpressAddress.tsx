import { updateCartAddress } from "@lib/stores/cart";
import type { StoreCart } from "@medusajs/types";
import { useEffect, useState } from "react";
import { ExpressCheckoutCard } from "./ExpressCheckoutCard";

interface ExpressAddressProps {
  cart: StoreCart;
  countries: any[];
  countryCode: string;
  isActive: boolean;
}

export const ExpressAddress = ({ cart, countries, countryCode, isActive }: ExpressAddressProps) => {
  const [formData, setFormData] = useState({
    firstName: cart.shipping_address?.first_name || "",
    lastName: cart.shipping_address?.last_name || "",
    email: cart.email || "",
    phone: cart.shipping_address?.phone || "",
    address: cart.shipping_address?.address_1 || "",
    company: cart.shipping_address?.company || "",
    postalCode: cart.shipping_address?.postal_code || "",
    city: cart.shipping_address?.city || "",
    country: cart.shipping_address?.country_code || countryCode,
    province: cart.shipping_address?.province || "",
    billingSameAsShipping: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cart.shipping_address) {
      setFormData((prev) => ({
        ...prev,
        firstName: cart.shipping_address?.first_name || "",
        lastName: cart.shipping_address?.last_name || "",
        email: cart.email || "",
        phone: cart.shipping_address?.phone || "",
        address: cart.shipping_address?.address_1 || "",
        company: cart.shipping_address?.company || "",
        postalCode: cart.shipping_address?.postal_code || "",
        city: cart.shipping_address?.city || "",
        country: cart.shipping_address?.country_code || countryCode,
        province: cart.shipping_address?.province || "",
      }));
    }
  }, [cart.shipping_address, cart.email, countryCode]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.postalCode || !formData.city || !formData.country) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const shippingAddress = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        company: formData.company || undefined,
        postal_code: formData.postalCode,
        city: formData.city,
        country_code: formData.country,
        province: formData.province || undefined,
        phone: formData.phone || undefined,
      };

      await updateCartAddress({
        email: formData.email,
        shipping_address: shippingAddress,
        billing_address: formData.billingSameAsShipping ? shippingAddress : undefined,
      });

      window.location.href = `/${countryCode}/checkout?step=shipping`;
    } catch (err) {
      console.error("Failed to save address:", err);
      setError("Failed to save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isActive) return null;

  return (
    <ExpressCheckoutCard
      title="Delivery Address"
      isActive={isActive}
      isDone={!!cart.shipping_address?.first_name}
      path={`/${countryCode}/checkout?step=address`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Postal code</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black bg-white"
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.iso_2} value={c.iso_2}>
                {c.display_name || c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State / Province</label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => handleChange("province", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-black"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full py-3 px-6 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Continue to shipping"}
        </button>
      </div>
    </ExpressCheckoutCard>
  );
};
