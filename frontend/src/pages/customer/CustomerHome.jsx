import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header.jsx";
import Navbar from "../../components/ui/Navbar.jsx";
import PageTitle from "../../components/ui/PageTitle.jsx";
import {
  MapPin, Phone, Clock8,
  Hourglass, Syringe, Gift, CreditCard,
  ChevronLeft, ChevronRight
} from "lucide-react";

function HorizontalScroller({ children }) {
    const ref = useRef(null);

    const scroll = (dir) => {
        if (!ref.current) return;
        const width = ref.current.clientWidth;
        ref.current.scrollBy({
            left: dir === "left" ? -width : width,
            behavior: "smooth"
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => scroll("left")}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1 shadow"
            >
                <ChevronLeft size={18} />
            </button>

            <div
                ref={ref}
                className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-2"
            >
                {children}
            </div>

            <button
                onClick={() => scroll("right")}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-1 shadow"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}

export default function CustomerHome() {
  const token = localStorage.getItem("token");
  const [branches, setBranches] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (!token) return;
    const fetchHomeData = async () => {
      setLoading(true);
      setError("");
      try {
        const resStats = await axios.get(`http://localhost:5000/api/customer/home-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const resBranches = await axios.get(`http://localhost:5000/api/user/branches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const resPackages = await axios.get(`http://localhost:5000/api/user/packages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        if (!resStats.data.success || !resBranches.data.success || !resPackages.data.success) {
          setError("Failed to fetch data");
          return;
        }
        setCards([
            { label: "Tổng số thú cưng", value: resStats.data.data.petCount || 0 },
            { label: "Tổng số hóa đơn", value: resStats.data.data.invoiceCount || 0 },
            { label: `Tổng chi tiêu năm (${new Date().getFullYear()})`, value: resStats.data.data.totalPayment || 0 },
        ]);
        setBranches(resBranches.data.data || []);
        setPackages(resPackages.data.data || []);
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [token]);

    const handleViewDetails = (maGoi) => {
        navigate(`/customer/packages/${maGoi}`);
    }

  return (
    <div className="min-h-screen bg-white text-sm"> {/* text-sm applies smaller font app-wide for this page */}
      <Header />
      <Navbar />

      <PageTitle title="Trang chủ" />

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {loading ? (
            <div className="text-center py-10">Đang tải...</div>
        ) : error ? (
            <div className="text-center text-red-600 py-6">{error}</div>
        ) : (
            <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cards.map((c) => (
                        <div
                            key={c.label}
                            className="bg-white border rounded shadow-sm p-4"
                        >
                            <p className="text-gray-500 text-xs">{c.label}</p>
                            <p className="text-lg font-semibold">
                                {c.label === "Tổng số thú cưng" ? c.value : c.label === "Tổng số hóa đơn" ? c.value : c.value.toLocaleString() + " đ"}
                            </p>
                        </div>
                    ))}
                </div>
                {/* ===== CHI NHÁNH ===== */}
                <div className="p-6">
                    <h3 className="text-base font-semibold mb-4">
                        Các chi nhánh
                    </h3>

                    {branches.length === 0 ? (
                        <p className="text-gray-500">
                            Không có dữ liệu chi nhánh.
                        </p>
                    ) : (
                        <HorizontalScroller>
                            {branches.map((b) => (
                                <div
                                    key={b.MaCN}
                                    className="min-w-[280px] bg-white border rounded shadow-sm p-4"
                                >
                                    <h4 className="font-semibold text-base mb-1">
                                        {b.TenCN}
                                    </h4>

                                    <p className="text-gray-600 text-xs mb-1">
                                        <MapPin className="inline-block w-3 h-3 mr-1 text-blue-700" /> {b.DiaChi}
                                    </p>
                                    <p className="text-gray-600 text-xs mb-1">
                                        <Phone className="inline-block w-3 h-3 mr-1 text-blue-700" /> {b.SDT}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                        <Clock8 className="inline-block w-3 h-3 mr-1 text-blue-700" /> {b.ThoiGianMoCua ? b.ThoiGianMoCua.slice(11, 16) : ''} - {b.ThoiGianDongCua ? b.ThoiGianDongCua.slice(11, 16) : ''}, T2 - CN
                                    </p>
                                </div>
                            ))}
                        </HorizontalScroller>
                    )}
                </div>

                {/* ===== GÓI TIÊM ===== */}

                <div className="p-6">
                    <h3 className="text-base font-semibold mb-4">
                        Các gói tiêm hiện có
                    </h3>

                    {packages.length === 0 ? (
                        <p className="text-gray-500">
                            Không có gói tiêm.
                        </p>
                    ) : (
                        <HorizontalScroller>
                            {packages.map((p) => (
                                <div
                                    key={p.MaGoi}
                                    className="min-w-[300px] bg-white border rounded shadow-sm p-4"
                                >
                                    <h4 className="font-semibold text-base mb-1">
                                        {p.MaGoi} - {p.TenGoi}
                                    </h4>

                                    <div className="text-xs text-gray-600 space-y-1 mt-2">
                                        <p><Hourglass className="inline-block w-3 h-3 mr-1 text-blue-700" /> Thời hạn: {p.ThoiHan}</p>
                                        <p><Syringe className="inline-block w-3 h-3 mr-1 text-blue-700" /> Số mũi: {p.SoMuiTiem}</p>
                                        <p><Gift className="inline-block w-3 h-3 mr-1 text-blue-700" /> Ưu đãi: {p.MucUuDai}%</p>
                                        <p className="font-medium text-gray-800">
                                            <CreditCard className="inline-block w-3 h-3 mr-1 text-blue-700" /> {p.TongTienGoi?.toLocaleString()} đ
                                        </p>
                                    </div>
                                    <div className="p-2"></div>
                                    <div className="text-center">
                                        <button
                                            onClick={() => handleViewDetails(p.MaGoi)}
                                            className="
                                            px-6 py-1
                                            bg-blue-500 text-white font-semibold
                                            rounded 
                                            shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6),inset_0px_-3px_6px_rgba(0,0,0,0.3)]
                                            hover:brightness-110
                                            active:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.4)]
                                            transition-all
                                            "
                                        >
                                            Xem chi tiết và đăng ký
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </HorizontalScroller>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
}