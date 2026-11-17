// The single API client: every call goes to the GEN REST API (see adapters/rest).

import { restApi } from "./adapters/rest/index";
import type { ApiClient } from "./types";

export const api: ApiClient = restApi;
