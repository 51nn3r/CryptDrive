import { getCookie } from '../utils/csrf';


export async function deleteFile(fileId) {
    const res = await fetch(`/core/manage-file/${fileId}`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
}