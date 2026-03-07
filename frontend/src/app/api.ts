import { account } from "./appwrite";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
    try {
        const session = await account.getSession("current");
        // Appwrite sessions use session token, not a bearer JWT.
        // We pass the session ID as a custom header for server-side verification if needed.
        return { "X-Appwrite-Session": session.$id };
    } catch {
        return {};
    }
}

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const headers: Record<string, string> = {
        ...authHeaders,
    };
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

export const api = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
    upload: async <T>(path: string, file: File) => {
        const form = new FormData();
        form.append("file", file);
        return request<T>("POST", path, form);
    },
};
