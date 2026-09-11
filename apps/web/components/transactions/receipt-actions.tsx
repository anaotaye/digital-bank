"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Share2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  transactionId: string;
  amount: number;
  recipientName?: string | null;
};

async function fetchReceiptFile(transactionId: string): Promise<File> {
  const res = await fetch(`/api/receipt/${transactionId}`);
  if (!res.ok) throw new Error("Couldn't generate the receipt");
  const blob = await res.blob();
  return new File([blob], `receipt-${transactionId}.png`, {
    type: "image/png",
  });
}

function downloadFile(file: File, filename: string) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ReceiptActions({
  transactionId,
  amount,
  recipientName,
}: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const onShare = async () => {
    setIsSharing(true);
    try {
      const file = await fetchReceiptFile(transactionId);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt for ₦${amount.toLocaleString("en-NG")}`,
          text: `Payment receipt from Ann's Bank${recipientName ? ` — to ${recipientName}` : ""}`,
        });
      } else {
        downloadFile(file, `anns-bank-receipt-${transactionId}.png`);
        toast.success("Receipt downloaded — share it from your files");
      }
    } catch (err) {
      // AbortError means the user dismissed the native share sheet — not a failure.
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        toast.error("Couldn't share the receipt");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const onDownload = async () => {
    setIsDownloading(true);
    try {
      const file = await fetchReceiptFile(transactionId);
      downloadFile(file, `anns-bank-receipt-${transactionId}.png`);
    } catch {
      toast.error("Couldn't download the receipt");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex w-full gap-2">
      <Button
        variant="outline"
        size="lg"
        className="flex-1"
        disabled={isSharing}
        onClick={onShare}
      >
        {isSharing ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Share2 className="h-4 w-4" strokeWidth={2} />
        )}
        Share
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="w-13 shrink-0 px-0"
        aria-label="Download receipt"
        disabled={isDownloading}
        onClick={onDownload}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Download className="h-4 w-4" strokeWidth={2} />
        )}
      </Button>
    </div>
  );
}
