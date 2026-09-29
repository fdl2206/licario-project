import {
  GUIDE_SIZES,
  MEASUREMENT_NOTE,
  type SizeRow,
} from "@/lib/sizeGuide";

/**
 * Tabel ukuran yang sama persis dipakai di halaman `/size-guide` dan di modal
 * size guide pada halaman detail produk, sehingga angka dan gaya selalu sinkron.
 */
export function SizeGuideTable({
  title,
  caption,
  rows,
}: {
  title: string;
  caption: string;
  rows: SizeRow[];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-mist/20 bg-white shadow-card">
      <div className="border-b border-mist/20 bg-cream/40 px-6 py-5 sm:px-8">
        <h2 className="font-display text-lg font-medium text-charcoal">{title}</h2>
        <p className="mt-1 font-body text-xs text-charcoal/50">{MEASUREMENT_NOTE}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-mist/20">
              <th
                scope="col"
                className="px-6 py-4 font-body text-[11px] font-semibold uppercase tracking-luxe text-charcoal/50 sm:px-8"
              >
                Measurement
              </th>
              {GUIDE_SIZES.map((size) => (
                <th
                  key={size}
                  scope="col"
                  className="px-4 py-4 text-center font-body text-[11px] font-semibold uppercase tracking-luxe text-charcoal/50"
                >
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-mist/20">
            {rows.map((row, rowIndex) => (
              <tr key={row.label} className={rowIndex % 2 === 1 ? "bg-cream/20" : undefined}>
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-body text-sm font-medium text-charcoal sm:px-8"
                >
                  {row.label}
                </th>
                {row.values.map((value, valueIndex) => (
                  <td
                    key={`${row.label}-${GUIDE_SIZES[valueIndex]}`}
                    className="whitespace-nowrap px-4 py-4 text-center font-body text-sm tabular-nums text-charcoal/70"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
