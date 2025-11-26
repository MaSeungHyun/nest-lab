import React from "react";
import { cn } from "../utils/style";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};
export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border border-gray-400 px-2 bg-black text-white focus:border-cyan-300 outline-none text-sm h-8 rounded-xs",
        "placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  );
}
