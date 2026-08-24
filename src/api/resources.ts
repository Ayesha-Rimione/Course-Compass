import { apiFetch } from "./client";
import { LearningResource } from "@/types";

export async function getLearningResources(): Promise<LearningResource[]> {
  try {
    const list = await apiFetch<any[]>("/students/me/resources");
    return list.map((r: any) => ({
      id: r.id,
      name: r.title,
      provider: r.provider,
      url: r.url,
      isFree: r.is_free ?? true,
      price: r.price || undefined,
      category: r.category || "General",
      difficulty: r.difficulty || "Beginner",
      duration: r.estimated_hours ? `${r.estimated_hours} hrs` : "Self-paced",
    }));
  } catch {
    const catalog = await apiFetch<any[]>("/resources");
    return catalog.map((r: any) => ({
      id: r.id,
      name: r.title,
      provider: r.provider,
      url: r.url,
      isFree: r.is_free ?? true,
      price: r.price || undefined,
      category: r.category || "General",
      difficulty: r.difficulty || "Beginner",
      duration: r.estimated_hours ? `${r.estimated_hours} hrs` : "Self-paced",
    }));
  }
}
