"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/constants";
import { useProfileImageUrl } from "@/components/providers/profile-provider";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  alt: string;
  className?: string;
  size?: "hero" | "about";
};

const sizeClasses = {
  hero: "h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-48 lg:w-48",
  about: "h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32",
};

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function ProfileAvatar({
  alt,
  className,
  size = "hero",
}: ProfileAvatarProps) {
  const profileUrl = useProfileImageUrl();
  const fallback = siteConfig.profileImageFallback;
  const [src, setSrc] = useState(profileUrl || fallback);

  useEffect(() => {
    setSrc(profileUrl || fallback);
  }, [profileUrl, fallback]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative shrink-0", className)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-full border-2 border-emerald-800/50 bg-neutral-950 shadow-[0_0_60px_-12px_rgba(16,185,129,0.45)]",
          sizeClasses[size]
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 144px, 192px"
          className="object-cover"
          unoptimized={isExternalUrl(src)}
          onError={() => setSrc(fallback)}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent"
      />
    </motion.div>
  );
}
