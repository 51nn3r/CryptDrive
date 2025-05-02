import { apiFetch } from './api';

export async function ensureSuperUser() {
    const info = await apiFetch('/core/login/');
    if (!info.is_superuser) {
        throw new Error('Forbidden: superuser only');
    }
    return true;
}
