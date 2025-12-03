import { ComponentProps } from "react";
import { cn } from "../utils/style";
import Icon from "./Icon";
import useControllableState from "../hooks/useControllabelState";

type CheckboxProps = ComponentProps<"input"> & {
  className?: string;
  label?: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
};

function Checkbox({
  label,
  className,
  value,
  onChange,
  ...props
}: CheckboxProps): JSX.Element {
  const [checked, setChecked] = useControllableState({
    prop: value,
    onChange: onChange,
    defaultProp: false,
  });

  const handleClickCheck = (): void => {
    setChecked(!checked);
  };
  return (
    <section
      className="flex items-center gap-2 cursor-pointer hover:brightness-110"
      {...props}
      onClick={handleClickCheck}
    >
      <input type="checkbox" className="w-3 h-3 hidden" />
      <div
        className={cn(
          "w-4 h-4 rounded-xs flex items-center justify-center bg-black-500 border border-gray-200",
          checked && "border-cyan-400 text-white bg-black-300",
          className
        )}
      >
        {checked && (
          <Icon icon="Check" size={12} className="stroke-gray-100 stroke-2" />
        )}
      </div>
      <label className={cn("text-gray-300", checked && "text-white")}>
        {label}
      </label>
    </section>
  );
}

export default Checkbox;
