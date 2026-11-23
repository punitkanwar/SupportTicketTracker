
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#1C1C1C] ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-[#222222] bg-[#121212] p-4 space-y-3">
      <Skeleton className="h-3 w-20 bg-[#1E1E1E]" />
      <Skeleton className="h-7 w-14 bg-[#242424]" />
      <Skeleton className="h-3 w-28 bg-[#181818]" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-[#1E1E1E]">
      <td className="px-4 py-3.5"><Skeleton className="h-3 w-16 bg-[#1A1A1A]" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-3.5 w-52 bg-[#202020]" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-3 w-20 bg-[#181818]" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded bg-[#1C1C1C]" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded bg-[#1C1C1C]" /></td>
      <td className="px-4 py-3.5"><Skeleton className="h-3 w-24 bg-[#181818]" /></td>
      <td className="px-4 py-3.5 text-right"><Skeleton className="h-6 w-6 ml-auto rounded bg-[#1C1C1C]" /></td>
    </tr>
  );
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </tbody>
  );
}
