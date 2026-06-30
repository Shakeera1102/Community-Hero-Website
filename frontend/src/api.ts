/* Thin wrapper around fetch. Reads VITE_API_URL, attaches JWT. */
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function token() {
  return localStorage.getItem("token") || "";
}

export const api = {
  base: BASE,
  asset: (path: string) => (path?.startsWith("http") ? path : `${BASE}${path}`),

  async get(path: string) {
    const r = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!r.ok) throw new Error((await r.text()) || r.statusText);
    return r.json();
  },

  async post(path: string, body?: any) {
    const r = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error((await r.text()) || r.statusText);
    return r.json();
  },

  async postForm(path: string, form: FormData) {
    const r = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: form,
    });
    if (!r.ok) throw new Error((await r.text()) || r.statusText);
    return r.json();
  },
  async delete(path: string) {
    const r = await fetch(`${BASE}${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    });

    if (!r.ok) throw new Error((await r.text()) || r.statusText);

    return r.json();
  },
};



