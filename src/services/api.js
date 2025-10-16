//const BASE_URL = "http://192.168.1.10:8080";
const BASE_URL = __DEV__ ? "http://192.168.1.100:8080" : "http://localhost:8080";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return await res.json();
}
