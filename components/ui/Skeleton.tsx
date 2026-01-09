interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular";
}

export default function Skeleton({
  className = "",
  width,
  height,
  variant = "rectangular",
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-[#1a1d24] rounded";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// 테이블 행 스켈레톤
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton height={20} />
        </td>
      ))}
    </tr>
  );
}

// 카드 스켈레톤
export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} width="100%" />
      <Skeleton height={16} width="80%" />
    </div>
  );
}


