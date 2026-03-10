import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PartnerLink {
  label: string;
  url: string;
}

const STORAGE_KEY = "partner_custom_links";
const MAX_LINKS = 5;

function loadLinks(): PartnerLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function saveLinks(links: PartnerLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function PartnerLinksSection() {
  const [links, setLinks] = useState<PartnerLink[]>(loadLinks);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [labelError, setLabelError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    saveLinks(links);
  }, [links]);

  function validate(): boolean {
    let valid = true;
    if (!label.trim()) {
      setLabelError("Label is required");
      valid = false;
    } else {
      setLabelError("");
    }
    if (!url.trim()) {
      setUrlError("URL is required");
      valid = false;
    } else if (!/^https?:\/\//i.test(url.trim())) {
      setUrlError("URL must start with http:// or https://");
      valid = false;
    } else {
      setUrlError("");
    }
    return valid;
  }

  function handleAdd() {
    if (!validate()) return;
    if (links.length >= MAX_LINKS) {
      toast.error("You can only add up to 5 links.");
      return;
    }
    const newLinks = [...links, { label: label.trim(), url: url.trim() }];
    setLinks(newLinks);
    setLabel("");
    setUrl("");
    toast.success("Link added!");
  }

  function handleDelete(idx: number) {
    const newLinks = links.filter((_, i) => i !== idx);
    setLinks(newLinks);
    toast.success("Link removed.");
  }

  function handleCopy(idx: number) {
    navigator.clipboard.writeText(links[idx].url).then(() => {
      setCopiedIdx(idx);
      toast.success("Link copied!");
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  }

  const atLimit = links.length >= MAX_LINKS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-card border border-border rounded-lg p-5 hover:border-gold/30 transition-colors"
      data-ocid="partner.links.section"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
          <Globe className="text-gold w-5 h-5" />
        </div>
        <div>
          <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-0.5">
            Partner Links
          </p>
          <p className="font-body text-sm text-foreground font-medium">
            Share your website, social & contact links
          </p>
        </div>
        <span className="ml-auto font-body text-xs text-muted-foreground">
          {links.length}/{MAX_LINKS}
        </span>
      </div>

      {/* Saved links list */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {links.map((link, idx) => (
            <motion.div
              key={`link-${idx}-${link.label}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 py-2"
              data-ocid={`partner.links.item.${idx + 1}`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs font-semibold text-foreground truncate">
                  {link.label}
                </p>
                <p className="font-body text-xs text-muted-foreground truncate">
                  {link.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(idx)}
                className="p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0"
                title="Copy link"
                data-ocid={`partner.links.copy_button.${idx + 1}`}
              >
                {copiedIdx === idx ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="p-1.5 rounded hover:bg-destructive/10 transition-colors flex-shrink-0"
                title="Remove link"
                data-ocid={`partner.links.delete_button.${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {links.length === 0 && (
          <p className="font-body text-xs text-muted-foreground text-center py-3">
            No links yet. Add up to 5 links below.
          </p>
        )}
      </div>

      {/* Add link form */}
      {atLimit ? (
        <p className="font-body text-xs text-amber-500 text-center py-2 border border-amber-500/20 rounded-md bg-amber-500/5">
          Maximum of 5 links reached. Delete one to add another.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">
                Label
              </Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. My Instagram"
                className="font-body text-sm h-8"
                data-ocid="partner.links.input"
              />
              {labelError && (
                <p className="font-body text-xs text-destructive mt-1">
                  {labelError}
                </p>
              )}
            </div>
            <div>
              <Label className="font-body text-xs text-muted-foreground mb-1 block">
                URL
              </Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                className="font-body text-sm h-8"
                data-ocid="partner.links.url_input"
              />
              {urlError && (
                <p className="font-body text-xs text-destructive mt-1">
                  {urlError}
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAdd}
            className="w-full border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground font-body text-xs"
            data-ocid="partner.links.add_button"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Link
          </Button>
        </div>
      )}
    </motion.div>
  );
}
