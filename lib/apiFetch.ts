const API_SECRET = `${process.env.EXPO_PUBLIC_API_SECRET}`;

export async function apiFetch<T>(
    url: string,
): Promise<T> {
    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Always add Authorization header with API_SECRET
        if (API_SECRET) {
            headers.Authorization = `Bearer ${API_SECRET}`;
        }

        const fetchOptions: RequestInit = {
            headers,
        };

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const error: Error & { status?: number } = new Error(`Failed to fetch: ${response.statusText}`);
            error.status = response.status;
            throw error;
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}