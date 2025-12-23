export default function RevenueByBranchTable({ rows }) {
    return (
        <div className="bg-white border rounded shadow-sm">
            <div className="p-4 border-b font-semibold">
                Doanh thu theo chi nhánh
            </div>

            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-600">
                        <th className="px-3 py-2">Chi nhánh</th>
                        <th className="px-3 py-2">Tổng</th>
                        <th className="px-3 py-2">KB</th>
                        <th className="px-3 py-2">TP</th>
                        <th className="px-3 py-2">MH</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.MaCN} className="border-t">
                            <td className="px-3 py-2">{r.TenCN}</td>
                            <td className="px-3 py-2">{r.Total?.toLocaleString()}</td>
                            <td className="px-3 py-2">{r.KB?.toLocaleString()}</td>
                            <td className="px-3 py-2">{r.TP?.toLocaleString()}</td>
                            <td className="px-3 py-2">{r.MH?.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
