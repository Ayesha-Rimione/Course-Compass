import { useEffect, useState } from "react";
import { Plus, Trash2, Award, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Certification } from "@/types";
import { getCertifications, addCertification, deleteCertification } from "@/api/certifications";

export function CertificationsSection() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [skillsLearned, setSkillsLearned] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await getCertifications();
      setCerts(list);
      setLoading(false);
    }
    loadData();
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
    setCerts((prev) => [newCert, ...prev]);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Certifications & External Credentials</h3>
          <p className="text-xs text-ink-soft">
            Track verified credentials, online courses (Coursera, Udemy, AWS), and technical badges.
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-xl gap-2 font-display text-xs bg-amber hover:bg-amber-hover text-ink"
        >
          <Plus className="size-4" /> Add Certification
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="card-soft p-6 space-y-4 animate-in fade-in duration-200 border-2 border-amber/30">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-bold">New Certification Details</h4>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs text-ink-soft hover:text-ink font-semibold"
            >
              Close
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-ink-soft">Certification / Course Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meta Front-End Developer Certificate"
                required
                className="mt-1 rounded-xl"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft">Issuer / Platform</label>
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
              <label className="text-xs font-semibold text-ink-soft">Issue Date</label>
              <Input
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                placeholder="e.g. May 2025"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft">Verification URL</label>
              <Input
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                placeholder="https://coursera.org/verify/..."
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-soft">Skills Demonstrated (comma separated)</label>
            <Input
              value={skillsLearned}
              onChange={(e) => setSkillsLearned(e.target.value)}
              placeholder="React, CSS Grid, REST APIs, Git"
              className="mt-1 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" className="rounded-xl font-display">Save Certification</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
          </div>
        </form>
      )}

      {certs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((cert) => (
            <div key={cert.id} className="card-soft p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-amber shrink-0" />
                    <h4 className="font-display text-base font-bold">{cert.name}</h4>
                  </div>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="text-ink-soft hover:text-destructive transition-colors p-1"
                    title="Delete Certification"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs font-medium text-ink-soft">{cert.provider} · {cert.completionDate}</p>
                {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cert.skillsLearned.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-secondary text-[0.68rem] font-medium text-ink-soft border border-border/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {cert.certificateUrl && (
                <div className="pt-2 border-t border-border/60">
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-amber hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="size-3.5" /> Verify Credential
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Genuine Empty State (Senior Bhai Tone) */
        <div className="card-soft p-10 text-center space-y-4 border-dashed border-2 border-border/80">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-soft text-amber-800">
            <ShieldCheck className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-display text-lg font-bold text-ink">
              No certifications logged yet, bhai!
            </h4>
            <p className="mx-auto max-w-md text-xs text-ink-soft leading-relaxed">
              Completed an online course on Coursera, Udemy, or solved HackerRank tracks? Log it here to strengthen your profile verification.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              onClick={() => setShowAdd(true)}
              className="rounded-xl gap-2 font-display text-xs bg-amber hover:bg-amber-hover text-ink"
            >
              <Plus className="size-4" /> Add First Certification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
