import { Certification } from "@/types";
import { apiFetch } from "./client";

export async function getCertifications(): Promise<Certification[]> {
  try {
    const raw = await apiFetch<any[]>("/students/me/certifications");
    if (Array.isArray(raw)) {
      return raw.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issue_date || "",
        expiryDate: c.expiry_date || undefined,
        credentialId: c.credential_id || undefined,
        credentialUrl: c.credential_url || undefined,
      }));
    }
    return [];
  } catch (err: any) {
    return [];
  }
}

export async function addCertification(
  cert: Omit<Certification, "id">
): Promise<Certification> {
  const payload = {
    name: cert.name,
    issuer: cert.issuer,
    issue_date: cert.issueDate,
    expiry_date: cert.expiryDate,
    credential_id: cert.credentialId,
    credential_url: cert.credentialUrl,
  };

  const created = await apiFetch("/students/me/certifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    id: created.id,
    name: created.name,
    issuer: created.issuer,
    issueDate: created.issue_date || "",
    expiryDate: created.expiry_date || undefined,
    credentialId: created.credential_id || undefined,
    credentialUrl: created.credential_url || undefined,
  };
}

export async function deleteCertification(id: string): Promise<void> {
  await apiFetch(`/students/me/certifications/${id}`, {
    method: "DELETE",
  });
}
