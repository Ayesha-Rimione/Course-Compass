import { Certification } from "@/types";
import { initialCertifications } from "@/data/mock";

let currentCertifications: Certification[] = [...initialCertifications];

export async function getCertifications(): Promise<Certification[]> {
  // Simulates FastAPI GET /api/v1/certifications
  return [...currentCertifications];
}

export async function addCertification(cert: Omit<Certification, "id">): Promise<Certification> {
  // Simulates FastAPI POST /api/v1/certifications
  const newCert: Certification = {
    ...cert,
    id: `cert-${Date.now()}`,
  };
  currentCertifications = [...currentCertifications, newCert];
  return newCert;
}

export async function updateCertification(id: string, updates: Partial<Certification>): Promise<Certification> {
  // Simulates FastAPI PUT /api/v1/certifications/{id}
  const index = currentCertifications.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Certification not found");
  currentCertifications[index] = { ...currentCertifications[index], ...updates };
  return { ...currentCertifications[index] };
}

export async function deleteCertification(id: string): Promise<void> {
  // Simulates FastAPI DELETE /api/v1/certifications/{id}
  currentCertifications = currentCertifications.filter((c) => c.id !== id);
}
