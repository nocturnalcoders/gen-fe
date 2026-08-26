// Adapter selector.
// VITE_API_BASE_URL empty  -> cloud adapter (current Lovable Cloud backend)
// VITE_API_BASE_URL set    -> rest adapter (your own API)

import { cloudApi } from "./adapters/cloud/index";
import { restApi } from "./adapters/rest/index";
import type { ApiClient } from "./types";

const baseUrl = (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.trim() ?? "";

export const apiMode: "cloud" | "rest" = baseUrl ? "rest" : "cloud";

export const api: ApiClient = apiMode === "rest" ? restApi : cloudApi;
