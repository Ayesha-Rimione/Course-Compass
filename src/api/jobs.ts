import { JobRecommendation } from "@/types";
import { initialJobRecommendations } from "@/data/mock";

export async function getJobRecommendations(): Promise<JobRecommendation[]> {
  // Simulates FastAPI GET /api/v1/jobs
  return [...initialJobRecommendations];
}
