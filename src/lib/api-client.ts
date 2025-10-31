const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, "");

async function getToken(): Promise<string | null> {
  try {
    const { storage } = await import("@/src/lib/storage");
    return await storage.getItem("token");
  } catch {
    return null;
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: any) => request<T>(p, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(p: string, body?: any) => request<T>(p, { method: "PUT",  body: JSON.stringify(body) }),
  del: <T>(p: string)           => request<T>(p, { method: "DELETE" }),
};
