import { useState, useEffect } from "react";
import axios from "axios";

export default function RevenueByBranchTable() {
    const token = localStorage.getItem("token");
    const [yearData, setYearData] = useState(null);
    const [branchData, setBranchData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;
        
        const fetchRevenueByBranches = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axios.get(
                    `http://localhost:5000/api/manager/revenue/branches?year=${selectedYear}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.data.success) {
                    setYearData(res.data.data.yearRevenue);
                    setBranchData(res.data.data.branchRevenue || []);
                } else {
                    setError("Failed to fetch revenue by branches.");
                }
            } catch (err) {
                console.error("Error fetching revenue by branches:", err);
                setError("An error occurred while fetching revenue by branches.");
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueByBranches();
    }, [token, selectedYear]);

    useEffect(() => {
        if (!token) return;

        const fetchYears = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/manager/years",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.data.success) {
                    setYears(res.data.data || []);
                }
            } catch (err) {
                console.error("Error fetching years:", err);
            }
        };

        fetchYears();
    }, [token]);

    if (!yearData) return null;

    const cards = [
        { label: `Tổng doanh thu (${selectedYear})`, value: yearData.TongDoanhThu },
        { label: "Khám bệnh", value: yearData.DoanhThuKB },
        { label: "Tiêm phòng", value: yearData.DoanhThuTP },
        { label: "Bán hàng", value: yearData.DoanhThuMH }
    ];

    return (
        <>
            {loading ? (
                <div className="text-center py-10">Đang tải...</div>
                ) : error ? (
                <div className="text-center text-red-600 py-6">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {cards.map((c) => (
                                <div
                                    key={c.label}
                                    className="bg-white border rounded shadow-sm p-4"
                                >
                                    <p className="text-gray-500 text-xs">{c.label}</p>
                                    <p className="text-lg font-semibold">
                                        {c.value?.toLocaleString()} đ
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 bg-white border rounded shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <h3 className="font-semibold text-base">
                                    Doanh thu theo chi nhánh ({selectedYear})
                                </h3>

                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 text-xs">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Chi nhánh</th>
                                        <th className="px-3 py-2 text-right">Tổng</th>
                                        <th className="px-3 py-2 text-right">Khám bệnh</th>
                                        <th className="px-3 py-2 text-right">Tiêm phòng</th>
                                        <th className="px-3 py-2 text-right">Bán hàng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branchData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        branchData.map((b) => (
                                            <tr
                                                key={b.TenCN}
                                                className="border-t hover:bg-gray-50"
                                            >
                                                <td className="px-3 py-2">
                                                    {b.TenCN}
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium">
                                                    {b.TongDoanhThu?.toLocaleString()} đ
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {b.DoanhThuKB?.toLocaleString()} đ
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {b.DoanhThuTP?.toLocaleString()} đ
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {b.DoanhThuMH?.toLocaleString()} đ
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
            )}
        </>
        
    );
}
