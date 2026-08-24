import { useEffect, useState } from "react";
import { Plus, Trash2, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Certification } from "@/types";
import { getCertifications, addCertification, deleteCertification } from "@/api/certifications";

export function CertificationsSection() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [skillsLearned, setSkillsLearned] = useState("");

  useEffect(() => {
    getCertifications().then(setCerts);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const skillsArray = skillsLearned.split(",").map((s) => s.trim()).filter(Boolean);
    const newCert = await addCertification({
      name: name.trim(),
      provider: provider.trim() || "Online Course",
      completionDate: completionDate.trim() || "2025",
      certificateUrl: certificateUrl.trim() || undefined,
      skillsLearned: skillsArray,
    });
    setCerts((prev) => [...prev, newCert]);
    setName("");
    setProvider("");
    setCompletionDate("");
    setCertificateUrl("");
    setSkillsLearned("");
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    setCerts((prev) => prev.filter((c) => c.id !== id));
    await deleteCertification(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Certifications & External Learning</h3>
          <p className="text-xs text-ink-soft">Track verified credentials, online courses, and external workshops.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="rounded-xl gap-2">
          <Plus className="size-4" /> Add Certification
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="card-soft p-5 space-y-4 animate-in fade-in duration-200">
          <h4 className="font-display text-sm font-bold">New Certification Details</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-ink-soft">Certification / Course Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AWS Certified Cloud Practitioner"
                required
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft">Provider / Organization</label>
              <Input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Coursera / Udemy / AWS / HackerRank"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-ink-soft">Completion Date</label>
              <Input
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                placeholder="e.g. May 2025"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft">Certificate Verification URL</label>
              <Input
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                placeholder="https://coursera.org/verify/..."
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-soft">Skills Learned (comma separated)</label>
            <Input
              value={skillsLearned}
              onChange={(e) => setSkillsLearned(e.target.value)}
              placeholder="Docker, SQL Tuning, System Design"
              className="mt-1 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button type="submit" className="rounded-xl">Save Certification</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {certs.map((cert) => (
          <div key={cert.id} className="card-soft p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-amber shrink-0" />
                  <div>
                    <h4 className="font-display text-base font-bold">{cert.name}</h4>
                    <p className="text-xs text-ink-soft">{cert.provider} · {cert.completionDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="text-ink-soft hover:text-destructive transition-colors p-1"
                  title="Delete Certification"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cert.skillsLearned.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-amber-soft text-ink text-[0.68rem] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {cert.certificateUrl && (
              <div className="pt-2 border-t border-border/60 flex items-center justify-end text-xs">
                <a href={cert.certificateUrl} target="_blank" rel="noreferrer" className="text-amber hover:underline flex items-center gap-1 font-display">
                  <ExternalLink className="size-3.5" /> Verify Credential
                </a>
              </div>
            )}
          </div>
        ))}
        {certs.length === 0 && (
          <p className="text-sm text-ink-soft col-span-2 py-6 text-center">No certifications added yet.</p>
        )}
      </div>
    </div>
  );
}
