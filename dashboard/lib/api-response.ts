export async function readApiResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      response.ok
        ? "Server mengembalikan response yang tidak valid."
        : `Server gagal memproses permintaan (${response.status}). Coba lagi sebentar.`,
    );
  }
}
