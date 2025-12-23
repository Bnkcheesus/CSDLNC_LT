export default function TopProductTable({ data }) {
    if (!data) return null;

    const renderTable = (title, rows) => (
        <div className="bg-white border rounded shadow-sm mb-6">
            <div className="p-4 border-b font-semibold">{title}</div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-600">
                        <th className="px-3 py-2">Sản phẩm</th>
                        <th className="px-3 py-2">Số lượng</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.MaSP} className="border-t">
                            <td className="px-3 py-2">{r.TenSP}</td>
                            <td className="px-3 py-2">{r.SoLuong}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
            {renderTable("Thuốc kê nhiều nhất", data.thuoc)}
            {renderTable("Vaccine tiêm nhiều nhất", data.vaccine)}
            {renderTable("Sản phẩm bán lẻ bán chạy", data.banle)}
        </>
    );
}
