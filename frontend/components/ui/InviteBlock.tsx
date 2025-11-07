"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState } from "react";
import clsx from "clsx";

interface InviteBlockProps {
  inviteCode?: string;
  inviteLink?: string;
  className?: string;
}

export function InviteBlock({ inviteCode, inviteLink, className }: InviteBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = inviteCode || "SPAWN-ABC123";
  const link = inviteLink || (typeof window !== "undefined" ? `${window.location.origin}/squad?invite=${code}` : `/squad?invite=${code}`);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card className={clsx("bg-[#1a1a1a] border border-[#2b2b2b]", className)}>
      <CardBody className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Invite Code</h3>
          <div className="flex items-center gap-2">
            <Input
              value={code}
              readOnly
              className="flex-1"
              classNames={{
                input: "text-white font-mono",
                inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
              }}
              aria-label="Invite code"
            />
            <Button
              color="primary"
              className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
              onPress={() => copyToClipboard(code)}
              aria-label="Copy invite code"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Invite Link</h3>
          <div className="flex items-center gap-2">
            <Input
              value={link}
              readOnly
              className="flex-1"
              classNames={{
                input: "text-white text-sm",
                inputWrapper: "bg-[#0d0d0d] border-[#2b2b2b]",
              }}
              aria-label="Invite link"
            />
            <Button
              color="primary"
              className="bg-[#ff7a00] text-white hover:bg-[#ff8a20]"
              onPress={() => copyToClipboard(link)}
              aria-label="Copy invite link"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

