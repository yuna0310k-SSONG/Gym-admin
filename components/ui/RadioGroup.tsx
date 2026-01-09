import React, { ReactNode } from "react";

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export default function RadioGroup({
  name,
  value,
  onChange,
  children,
  className = "",
}: RadioGroupProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.isArray(children)
        ? children.map((child, index) => {
            if (child && typeof child === "object" && "props" in child) {
              return (
                <div key={index}>
                  {React.cloneElement(child as React.ReactElement, {
                    name,
                    checked: value === (child as React.ReactElement).props.value,
                    onChange: handleChange,
                  })}
                </div>
              );
            }
            return child;
          })
        : children}
    </div>
  );
}

