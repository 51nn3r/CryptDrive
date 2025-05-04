import { getCookie } from '../utils/csrf';

export async function apiFetch(url, options = {}) {
    const csrf = getCookie('csrftoken');

    let opts = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
            'X-CSRFToken': csrf,
        },
        body: options.data !== undefined ? JSON.stringify(options.data) : undefined,
        ...options,
    };

    const res = await fetch(url, opts);
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Fetch ${url} -> ${res.status}: ${txt}`);
    }

    if (res.status === 204) {
        return null;
    }

    return res.json();
}

export function apiCreate(path, data) {
  return apiFetch(path, { method: 'POST', data });
}

export function apiUpdate(path, data) {
  return apiFetch(path, { method: 'PUT', data });
}

export function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}
