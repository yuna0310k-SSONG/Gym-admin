import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = "", title }: CardProps) {
  return (
    <div className={`rounded-lg shadow-md p-6 bg-[#0f1115] border border-[#374151] ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[#f9fafb] mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

