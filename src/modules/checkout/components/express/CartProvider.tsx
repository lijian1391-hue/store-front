import { sdk } from "@lib/sdk";
import { createContext, useContext, useEffect, useState } from "react";
import type { StoreCart } from "@medusajs/types";

interface CartContextType {
  cart?: StoreCart;
  refreshCart: () => Promise<StoreCart | undefined>;
  updateCart: (data: {
    updateData?: any;
    shippingMethodData?: any;
  }) => Promise<StoreCart | undefined>;
  unsetCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<StoreCart | undefined>();
  const [region, setRegion] = useState<any>();

  useEffect(() => {
    if (cart) {
      localStorage.setItem("cart_id", cart.id);
      return;
    }

    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      refreshCart();
    } else {
      sdk.store.cart.retrieve(cartId, {
        fields: "*items,*items.variant,*items.variant.product,*items.variant.product.images,*items.variant.product.thumbnail,*shipping_address,*billing_address,*shipping_methods,*payment_collection,*payment_collection.payment_sessions",
      })
        .then(({ cart: dataCart }) => {
          setCart(dataCart);
        })
        .catch(() => {
          refreshCart();
        });
    }
  }, [cart]);

  useEffect(() => {
    if (region && cart && cart.region_id !== region.id) {
      sdk.store.cart.update(cart.id, {
        region_id: region.id,
      })
        .then(({ cart: dataCart }) => {
          setCart(dataCart);
        });
    }
  }, [region, cart]);

  const refreshCart = async () => {
    if (!region) return;

    const { cart: dataCart } = await sdk.store.cart.create({
      region_id: region.id,
    });

    localStorage.setItem("cart_id", dataCart.id);
    setCart(dataCart);
    return dataCart;
  };

  const updateCart = async ({
    updateData,
    shippingMethodData,
  }: {
    updateData?: any;
    shippingMethodData?: any;
  }) => {
    if (!cart) return;

    let returnedCart = cart;
    if (updateData) {
      returnedCart = (await sdk.store.cart.update(cart.id, updateData)).cart;
    }

    if (shippingMethodData) {
      returnedCart = (await sdk.store.cart.addShippingMethod(cart.id, shippingMethodData)).cart;
    }

    setCart(returnedCart);
    return returnedCart;
  };

  const unsetCart = () => {
    localStorage.removeItem("cart_id");
    setCart(undefined);
  };

  const value = {
    cart,
    refreshCart,
    updateCart,
    unsetCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
