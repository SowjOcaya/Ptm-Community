import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}

const sizeMap = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
  xl: "w-20 h-20 text-2xl",
};

const pxMap = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name[0].toUpperCase();
}

function getColorFromName(name?: string | null): string {
  const colors = [
    "from-ptm-accent to-ptm-purple",
    "from-ptm-purple to-ptm-pink",
    "from-ptm-pink to-ptm-amber",
    "from-ptm-green to-ptm-accent",
    "from-ptm-amber to-ptm-pink",
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Avatar({ src, name, size = "md", className, ring = false }: AvatarProps) {
  const px = pxMap[size];
  const initials = getInitials(name);
  const gradient = getColorFromName(name);

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 overflow-hidden relative",
        sizeMap[size],
        ring && "ring-2 ring-ptm-accent ring-offset-2 ring-offset-ptm-bg",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? "User"}
          width={px}
          height={px}
          className="object-cover w-full h-full"
          unoptimized
        />
      ) : (
        <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center font-semibold text-white", gradient)}>
          {initials}
        </div>
      )}
    </div>
  );
}
