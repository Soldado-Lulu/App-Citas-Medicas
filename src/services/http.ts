const BASE_URL = __DEV__
  ? "http://172.21.20.101:8080" // IP de tu PC si pruebas en celular
  : "https://tu-dominio-api";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error de servidor");
  return data;
}
