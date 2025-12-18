import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/ui/Header.jsx";
import Navbar from "../../components/ui/Navbar.jsx";
import PageTitle from "../../components/ui/PageTitle.jsx";
import CategoryBar from "../../components/ui/CategoryBar.jsx";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DocServiceHistory() {
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    
    const [type, setType] = useState("all");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!maTK || !token) return;

        const fetchServiceHistory = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/doctor/history`, {
                    params: { type: type, page: page, limit: limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    setTotalPages(res.data.data.totalPages || 1);
                } else {
                    setError("Failed to fetch service history.");
                }
            } catch (err) {
                console.error("Error fetching service history:", err);
                setError("An error occurred while fetching service history.");
            } finally {
                setLoading(false);
            }
        };

        fetchServiceHistory();
    }, [maTK, token, type, page, limit]);

    const handleViewDetails = (loaiDV, maSDDV) => {
        switch (loaiDV) {
            case "KB":
                navigate(`/staff/doctor/khambenh/${maSDDV}`);
                break;
            case "TP":
                navigate(`/staff/doctor/tiemphong/${maSDDV}`);
                break;
            default:
                break;
        }
    }

  return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Khám bệnh & tiêm phòng" />

      <CategoryBar
        active={type}
        onChange={(t) => {
          setType(t);
          setPage(1);
        }}
          types={[
            { key: "all", label: "Tất cả" },
            { key: "KB", label: "Khám bệnh" },
            { key: "TP", label: "Tiêm phòng" }
        ]}
      />

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
          {/* table header */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold">Lịch sử khám bệnh & tiêm phòng</h3>
          </div>

          {/* table content */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-10">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-6">{error}</div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Không tìm thấy lịch sử.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left">
                  <thead>
                    <tr className="text-xs text-gray-600">
                      <th className="px-3 py-2">Mã SDDV</th>
                      <th className="px-3 py-2">Ngày SDDV</th>
                      <th className="px-3 py-2">Loại DV</th>
                      <th className="px-3 py-2">Mã KH</th>
                      <th className="px-3 py-2">Tên KH</th>
                      <th className="px-3 py-2">Tên thú cưng</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.MaSDDV}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-3 text-sm">{r.MaSDDV}</td>
                        <td className="px-3 py-3 text-sm">{r.NgaySuDung}</td>
                        <td className="px-3 py-3 text-sm">{r.LoaiDV || "-"}</td>
                        <td className="px-3 py-3 text-sm">{r.MaTKKH || "-"}</td>
                        <td className="px-3 py-3 text-sm">{r.HoTen || "-"}</td>
                        <td className="px-3 py-3 text-sm">{r.TenTC || "-"}</td>
                        <td className="px-3 py-3 text-sm text-right">
                          <button
                            onClick={() => handleViewDetails(r.LoaiDV, r.MaSDDV)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100"
                            title="Xem chi tiết và chỉnh sửa"
                          >
                            <Eye size={16} />
                            <span className="sr-only">Xem chi tiết và chỉnh sửa</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* pagination */}
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị trang {page} / {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded disabled:opacity-50"
                title="Trang trước"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="text-sm px-2">
                {/* optional: page input or display */}
                <span>{page}</span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded disabled:opacity-50"
                title="Trang sau"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}