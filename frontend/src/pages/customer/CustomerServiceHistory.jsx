import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import CategoryBar from "../../components/ui/CategoryBar.jsx";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerServiceHistory() {
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
                const res = await axios.get(`http://localhost:5000/api/customer/history`, {
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

    const handleTypeChange = (newType) => {
        setType(newType);
        setPage(1); // Reset to first page on type change
    }

    const handleViewDetails = (loaiDV, maSDDV) => {
        switch (loaiDV) {
            case "KB":
                navigate(`/customer/khambenh/${maSDDV}`);
                break;
            case "TP":
                navigate(`/customer/tiemphong/${maSDDV}`);
                break;
            case "MH":
                navigate(`/customer/muahang/${maSDDV}`);
                break;
            default:
                break;
        }
    }

    const handleMakeAppointment = () => {
        navigate("/customer/appointment");
    }

    return (
      <div className="min-h-screen bg-white text-sm">
        <Header />
        <Navbar />
        <PageTitle title="Dịch vụ" />

        <CategoryBar active={type} onChange={handleTypeChange} />

        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="p-6 text-right">
            <button
              onClick={handleMakeAppointment}
              className="
                px-6 py-2 
                bg-blue-500 text-white font-medium
                rounded 
                shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6),inset_0px_-3px_6px_rgba(0,0,0,0.3)]
                hover:brightness-110
                active:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.4)]
                transition-all
              "
            >
              + Đặt lịch hẹn
            </button>
          </div>
          <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
            {/* table header */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-base font-semibold">Lịch sử sử dụng dịch vụ</h3>
            </div>

            {/* table content */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-10">Đang tải...</div>
              ) : error ? (
                <div className="text-center text-red-600 py-6">{error}</div>
              ) : rows.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  Không tìm thấy lịch sử dịch vụ.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-left">
                    <thead>
                      <tr className="text-xs text-gray-600">
                        <th className="px-3 py-2">Mã SDDV</th>
                        <th className="px-3 py-2">{type === "app" ? "Ngày hẹn" : "Ngày SDDV"}</th>
                        <th className="px-3 py-2">Loại dịch vụ</th>
                        <th className="px-3 py-2">Chi nhánh</th>
                        <th className="px-3 py-2">Thú cưng</th>
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
                          <td className="px-3 py-3 text-sm">
                            {r.NgaySuDung
                              ? new Date(r.NgaySuDung).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-3 py-3 text-sm">{r.LoaiDV || "-"}</td>
                          <td className="px-3 py-3 text-sm">{r.TenCN || "-"}</td>
                          <td className="px-3 py-3 text-sm">{r.MaTC ? r.MaTC + " - " + r.TenTC : "-"}</td>
                          <td className="px-3 py-3 text-sm text-right">
                            <button
                              disabled={type === "app"}
                              onClick={() => handleViewDetails(r.LoaiDV, r.MaSDDV)}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 ${type === "app" ? "opacity-40 cursor-not-allowed" : ""}`}
                              title="Xem chi tiết và đánh giá"
                            >
                              <Eye size={16} />
                              <span className="sr-only">Xem chi tiết và đánh giá</span>
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