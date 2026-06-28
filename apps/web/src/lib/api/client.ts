export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("center_token") : null;
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json()).detail ?? msg; } catch {}
    throw new ApiError(msg, res.status);
  }
  return res.json() as Promise<T>;
}
