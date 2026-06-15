const BASE_URL = "/api";

// Injected by UserContext on mount.
// Fired whenever a protected endpoint returns 401, so the user is automatically
// logged out and redirected to /login instead of seeing broken UI.
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Injected by UserContext when a demo session is active.
// Fired instead of making a write request, so demo viewers see the modal.
let onDemoBlocked = null;

export function setDemoBlockHandler(handler) {
  onDemoBlocked = handler;
}

// Write endpoints allowed even in demo mode (AI + auth housekeeping).
const DEMO_ALLOWED_WRITES = [
  "/auth/",
  "/chat",
  "/investments/analyze",
  "/investments/update-prices",
  "/my-notifications",
];

function isDemoBlocked(endpoint, method) {
  if (method === "GET" || !onDemoBlocked) return false;
  return !DEMO_ALLOWED_WRITES.some((prefix) => endpoint.startsWith(prefix));
}

async function request(endpoint, options = {}) {
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  if (isDemoBlocked(endpoint, config.method ?? "GET")) {
    onDemoBlocked();
    return { ok: false, status: 403, data: { demo: true } };
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Auth endpoints (login, register, verify-email) legitimately return 401
    // on bad input — never treat those as "session expired".
    const isAuthEndpoint = endpoint.startsWith("/auth/");
    if (response.status === 401 && !isAuthEndpoint && onUnauthorized) {
      onUnauthorized();
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { message: "Network error. Please try again." },
    };
  }
}

const api = {
  get:    (endpoint)           => request(endpoint, { method: "GET" }),
  post:   (endpoint, body)     => request(endpoint, { method: "POST", body }),
  put:    (endpoint, body)     => request(endpoint, { method: "PUT", body }),
  patch:  (endpoint, body)     => request(endpoint, { method: "PATCH", body }),
  delete: (endpoint)           => request(endpoint, { method: "DELETE" }),
  upload: (endpoint, formData) =>
    request(endpoint, {
      method: "POST",
      body: formData,
      headers: {}, // override to avoid setting Content-Type (browser sets it with boundary)
    }),
};

export default api;