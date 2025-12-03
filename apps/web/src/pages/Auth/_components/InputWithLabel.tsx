import React from "react";
import Input from "../../../components/Input";
import { cn } from "../../../utils/style";

type InputWithLableProps = React.ComponentProps<typeof Input> & {
  label: string;
  className?: string;
  children?: React.ReactNode;
};

export default function InputWithLabel({
  label,
  className,
  children,
  ...props
}: InputWithLableProps) {
  return (
    <div className="flex flex-col gap-2 flex-1 relative">
      <label className="text-xs -tracking-normal font-medium text-gray-200">
        {label}
      </label>
      <div className="relative">
        <Input className={cn("w-full", className)} {...props} />
        {children}
      </div>
    </div>
  );
}
