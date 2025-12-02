import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "../utils/style";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number;
}

export default function Progress({
  className,
  value,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-[1.5rem] w-full overflow-hidden rounded-xs bg-black/70 outline-1 outline-black",
        className
      )}
      {...props}
      style={{
        transform: "translateZ(0)",
      }}
      value={value}
    >
      <div className="text-text-primary absolute top-0 left-[50%] z-9999 flex h-full -translate-x-1/2 items-center text-sm font-medium">
        {value}%
      </div>
      <ProgressPrimitive.Indicator
        className={cn(
          "size-full transition-transform duration-1000 ease-in-out",
          "animate-shimmer bg-gradient-to-r from-sky-500 from-0% via-purple-500 via-50% to-sky-500 bg-[length:200%_100%] saturate-150",
          `translate-x-[-${100 - value}%]`,
          className
        )}
        style={{
          transform: `translateX(-${100 - value}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}
