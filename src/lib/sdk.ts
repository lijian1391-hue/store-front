import Medusa from "@medusajs/js-sdk";

const MEDUSA_BACKEND_URL = import.meta.env.PUBLIC_MEDUSA_BACKEND_URL;

const MEDUSA_PUBLISHABLE_KEY = import.meta.env.PUBLIC_MEDUSA_PUBLISHABLE_KEY;

const isDevEnvironment = import.meta.env.DEV;

if (!MEDUSA_BACKEND_URL) {
  console.warn("PUBLIC_MEDUSA_BACKEND_URL environment variable is not set. Using fallback mode.");
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL || "https://api.example.com",
  publishableKey: MEDUSA_PUBLISHABLE_KEY || "pk_test_1234567890",
  debug: isDevEnvironment,
});
