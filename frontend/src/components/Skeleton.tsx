export function ProductSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
      <div className="aspect-[3/4] skeleton rounded-none" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    </div>
  );
}

export function RowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
