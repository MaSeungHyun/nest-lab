import { cn } from "../utils/style";
import { icons, type LucideProps } from "lucide-react";
import React from "react";

type TransformIconProps = LucideProps & {
  icon: keyof typeof icons;
  className?: string;
  fill?: string;
  size?: number;
  onClick?: () => void;
};

export default function Icon({
  className,
  icon,
  size = 16,
  onClick,
  ...props
}: TransformIconProps): React.ReactNode {
  const Icon = icons[icon as keyof typeof icons];

  return (
    <Icon className={cn(className)} size={size} onClick={onClick} {...props} />
  );
}
