import React from "react";
import { cn } from "../utils/style";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({
  children,
  className = "",
  ...props
}: ButtonProps): React.ReactNode => {
  return (
    <button
      className={cn(
        "bg-black-700 text-gray-100 h-fit min-h-8 w-fit min-w-24 rounded-md border px-6 py-1",
        !props.disabled &&
          "hover:bg-black-500 border-cyan-300 hover:cursor-pointer hover:border-cyan-200",
        props.disabled &&
          "hover:bg-black-700 border-cyan-400 text-gray-300 hover:cursor-default",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
