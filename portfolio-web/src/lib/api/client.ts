const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        message = Array.isArray(errorBody.message)
          ? errorBody.message.join(', ')
          : String(errorBody.message);
      }
    } catch {
      // ignore JSON parse errors for error bodies
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}
