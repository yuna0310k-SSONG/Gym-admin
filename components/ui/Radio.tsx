import { InputHTMLAttributes, forwardRef } from "react";

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  name?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
        <input
          ref={ref}
          type="radio"
          className="w-4 h-4 text-blue-500 bg-[#111827] border-[#374151] focus:ring-2 focus:ring-blue-500"
          {...props}
        />
        <span className="text-[#e5e7eb]">{label}</span>
      </label>
    );
  }
);

Radio.displayName = "Radio";

export default Radio;
