import { useState, useEffect } from "react";
import axios from "axios";

export default function SystemProductsTable() {
    const token = localStorage.getItem("token");
    const [thuocData, setThuocData] = useState([]);
    const [vaccineData, setVaccineData] = useState([]);
    const [banleData, setBanleData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([]);
    
    const [cards, setCards] = useState([
        { label: "Thuốc", value: 0 },
        { label: "Vaccine", value: 0 },
        { label: "Bán lẻ", value: 0 }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;
        
        const fetchProductsSummary = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axios.get(
                    `http://localhost:5000/api/manager/products?year=${selectedYear}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (res.data.success) {
                    setThuocData(res.data.data.thuocData);
                    setVaccineData(res.data.data.vaccineData);
                    setBanleData(res.data.data.banleData);
                    setCards([
                        { label: "Thuốc", value: res.data.data.total[0].SoLuong },
                        { label: "Vaccine", value: res.data.data.total[1].SoLuong },
                        { label: "Bán lẻ", value: res.data.data.total[2].SoLuong }
                    ]);
                } else {
                    setError("Failed to fetch product summary.");
                }
            } catch (err) {
                console.error("Error fetching product summary:", err);
                setError("An error occurred while fetching product summary.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductsSummary();
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

    if (!thuocData || !vaccineData || !banleData) return null;

    return (
        <>
            {loading ? (
                <div className="text-center py-10">Đang tải...</div>
                ) : error ? (
                <div className="text-center text-red-600 py-6">{error}</div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
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
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {cards.map((c) => (
                                <div
                                    key={c.label}
                                    className="bg-white border rounded shadow-sm p-4"
                                >
                                    <p className="text-gray-500 text-xs">{c.label}</p>
                                    <p className="text-lg font-semibold">
                                        {c.value?.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* THUỐC TABLE */}
                            <div className="mt-6 bg-white border rounded shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600 text-xs">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Thuốc</th>
                                            <th className="px-3 py-2 text-right">Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {thuocData.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-center py-4 text-gray-500"
                                                >
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            thuocData.map((t) => (
                                                <tr
                                                    key={t.MaSP}
                                                    className="border-t hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-2">
                                                        {t.MaSP + " - " + t.TenSP}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {t.SoLuong?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* VACCINE TABLE */}
                            <div className="mt-6 bg-white border rounded shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600 text-xs">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Vaccine</th>
                                            <th className="px-3 py-2 text-right">Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vaccineData.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-center py-4 text-gray-500"
                                                >
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            vaccineData.map((t) => (
                                                <tr
                                                    key={t.MaSP}
                                                    className="border-t hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-2">
                                                        {t.MaSP + " - " + t.TenSP}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {t.SoLuong?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* BÁN LẺ TABLE */}
                            <div className="mt-6 bg-white border rounded shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600 text-xs">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Bán lẻ</th>
                                            <th className="px-3 py-2 text-right">Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {banleData.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-center py-4 text-gray-500"
                                                >
                                                    Không có dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            banleData.map((t) => (
                                                <tr
                                                    key={t.MaSP}
                                                    className="border-t hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-2">
                                                        {t.MaSP + " - " + t.TenSP}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {t.SoLuong?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
            )}
        </>
    );
}
