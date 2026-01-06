interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const variants = {
    success: "bg-green-900/30 text-green-400 border border-green-800",
    warning: "bg-yellow-900/30 text-yellow-400 border border-yellow-800",
    danger: "bg-red-900/30 text-red-400 border border-red-800",
    info: "bg-blue-900/30 text-blue-400 border border-blue-800",
    default: "bg-[#374151] text-[#9ca3af] border border-[#4b5563]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

