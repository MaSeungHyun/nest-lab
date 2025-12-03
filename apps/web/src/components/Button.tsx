import React, { forwardRef } from "react";
import { cn } from "../utils/style";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        className={cn(
          "bg-black text-gray-100  w-fit min-w-24 rounded-md border px-3 py-1 text-sm",
          !props.disabled &&
            "hover:bg-black-500 border-cyan-300 hover:cursor-pointer hover:border-cyan-200",
          props.disabled &&
            "hover:bg-black-700 border-cyan-400 text-gray-300 hover:cursor-default",
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);
