const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getPageContent(page: string) {
  try {
    const res = await fetch(`${API_URL}/api/page-content/${page}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.sections) {
        return json.data.sections;
      }
    }
  } catch (err) {
    console.warn(`Could not fetch page content for ${page}:`, err);
  }
  return null;
}
