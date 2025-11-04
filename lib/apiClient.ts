interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is missing in .env.local");
}

export async function apiClient(
  endpoint: string,
  { requiresAuth = false, ...options }: FetchOptions = {}
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // JWT if needed
  if (requiresAuth) {
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // for refreshToken cookie
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const response = await fetch(url, config);

  // Handle non-JSON errors (e.g. 404 HTML)
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Expected JSON, got ${contentType}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
}
