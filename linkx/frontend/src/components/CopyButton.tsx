import { useState } from "react";
import { Button } from "./Button";

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in insecure contexts — fail silently, the
      // user can still select and copy the text manually.
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleCopy} className={className}>
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}
