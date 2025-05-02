export async function apiFetch(url, options = {}) {
    const opts = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
        },
        ...options,
    };

    const res = await fetch(url, opts);
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Fetch ${url} -> ${res.status}: ${txt}`);
    }

    return res.json();
}
