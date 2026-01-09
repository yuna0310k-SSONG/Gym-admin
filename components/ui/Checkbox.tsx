import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          className="w-4 h-4 text-blue-500 bg-[#111827] border-[#374151] rounded focus:ring-2 focus:ring-blue-500"
          {...props}
        />
        <span className="text-[#e5e7eb]">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

