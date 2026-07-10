const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json();
}
