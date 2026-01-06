import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-[#374151] ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-[#1a1d24]">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableRow({ children, className = "", onClick }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? "cursor-pointer hover:bg-[#1a1d24]" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-[#e5e7eb] ${className}`}>
      {children}
    </td>
  );
}

export function TableHeaderCell({ children, className = "" }: TableCellProps) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

