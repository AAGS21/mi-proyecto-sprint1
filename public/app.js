// Capa de comunicación con el servidor (cliente API).
export const api = {
  get: (url) => fetch(url, { credentials: 'include' }).then(handle),
  post: (url, body) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  }).then(handle),
  del: (url) => fetch(url, { method: 'DELETE', credentials: 'include' }).then(handle),
};

async function handle(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}