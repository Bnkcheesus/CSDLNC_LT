import React from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

export default function PetHistoryTable({
    rows,
    loading,
    error,
    page,
    totalPages,
    openRow,
    rowDetails,
    onToggleRow,
    onPrevPage,
    onNextPage,
}) {
    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
            {/* HEADER */}
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-base font-semibold">
                    Lịch sử khám & tiêm phòng
                </h3>
            </div>

            {/* TABLE BODY */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-10">Đang tải...</div>
                ) : error ? (
                    <div className="text-center text-red-600 py-6">{error}</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                        Không có lịch sử cho thú cưng này.
                    </div>
                ) : (
                    <table className="w-full table-auto text-left">
                        <thead>
                            <tr className="text-xs text-gray-600">
                                <th className="px-3 py-2">Mã SDDV</th>
                                <th className="px-3 py-2">Ngày sử dụng</th>
                                <th className="px-3 py-2">Loại dịch vụ</th>
                                <th className="px-3 py-2">Chi nhánh</th>
                                <th className="px-3 py-2">Bác sĩ</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((r) => (
                                <React.Fragment key={r.MaSDDV}>
                                    <tr className="border-t hover:bg-gray-50">
                                        <td className="px-3 py-3">{r.MaSDDV}</td>
                                        <td className="px-3 py-3">
                                            {r.NgaySuDung
                                                ? new Date(r.NgaySuDung).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="px-3 py-3">{r.LoaiDV}</td>
                                        <td className="px-3 py-3">{r.TenCN}</td>
                                        <td className="px-3 py-3">{r.TenBS}</td>

                                        <td className="px-3 py-3 text-right">
                                            <button
                                                className="p-2 rounded hover:bg-gray-200"
                                                onClick={() => onToggleRow(r)}
                                            >
                                                {openRow === r.MaSDDV ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* EXPANDED ROW */}
                                    {openRow === r.MaSDDV && (
                                        <tr className="bg-gray-50 border-t">
                                            <td colSpan="6" className="p-4">
                                                {!rowDetails[r.MaSDDV] ? (
                                                    <div>Đang tải chi tiết...</div>
                                                ) : r.LoaiDV === "KB" ? (
                                                    <KBDetail data={rowDetails[r.MaSDDV]} />
                                                ) : (
                                                    <TPDetail data={rowDetails[r.MaSDDV]} />
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* PAGINATION */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Trang {page} / {totalPages}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={onPrevPage}
                        className="p-2 rounded disabled:opacity-50"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        disabled={page >= totalPages}
                        onClick={onNextPage}
                        className="p-2 rounded disabled:opacity-50"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -------- SUB COMPONENTS -------- */

function KBDetail({ data }) {
    return (
        <div>
            <h4 className="font-medium mb-2">Toa thuốc</h4>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-gray-600">
                        <th className="px-2 py-1">Tên thuốc</th>
                        <th className="px-2 py-1">Số lượng</th>
                        <th className="px-2 py-1">Liều lượng</th>
                        <th className="px-2 py-1">Cách dùng</th>
                    </tr>
                </thead>
                <tbody>
                    {data.toaThuoc ? data.toaThuoc : data.map((d) => (
                        <tr key={d.MaSP ? d.MaSP : d.MaThuoc} className="text-xs border-t">
                            <td className="px-2 py-1">{d.TenSP || d.TenThuoc}</td>
                            <td className="px-2 py-1">{d.SoLuong}</td>
                            <td className="px-2 py-1">{d.LieuLuong}</td>
                            <td className="px-2 py-1">{d.CachDung}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TPDetail({ data }) {
    return (
        <div>
            <h4 className="font-medium mb-2">Chi tiết tiêm phòng</h4>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-gray-600">
                        <th className="px-2 py-1">Tên vaccine</th>
                        <th className="px-2 py-1">Liều lượng</th>
                        <th className="px-2 py-1">Mã gói tiêm</th>
                    </tr>
                </thead>
                <tbody>
                    {data.toaTiem ? data.toaTiem : data.map((d) => (
                        <tr key={d.MaSP ? d.MaSP : d.MaThuoc} className="text-xs border-t">
                            <td className="px-2 py-1">{d.TenSP || d.TenThuoc}</td>
                            <td className="px-2 py-1">{d.LieuLuong}</td>
                            <td className="px-2 py-1">{d.MaGoi || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
