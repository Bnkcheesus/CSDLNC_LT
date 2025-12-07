import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function CustomerExaminationDetail() {
    const { maSDDV } = useParams();
    const token = localStorage.getItem("token");
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toaThuoc, setToaThuoc] = useState([]);
    const [rated, setRated] = useState(false);
    const [rating, setRating] = useState({
        diem: "",
        thaiDoNhanVien: "",
        mucDoHaiLong: "",
        binhLuan: ""
    });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/khambenh/${maSDDV}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setDetail(res.data.data.general);
                    setToaThuoc(res.data.data.toaThuoc);

                    if (res.data.data.rating) {
                        setRated(true);
                        setRating({
                            diem: res.data.data.rating.Diem,
                            thaiDoNhanVien: res.data.data.rating.ThaiDoNhanVien,
                            mucDoHaiLong: res.data.data.rating.MucDoHaiLong,
                            binhLuan: res.data.data.rating.BinhLuan
                        });
                    }
                } else {
                    console.error("Failed to fetch examination detail:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching examination detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [maSDDV, token]);

    const handleRate = async (e) => {
        e.preventDefault();
        if (!rating.diem) {
            alert("Vui lòng chọn điểm đánh giá.");
            return;
        }
        try {
            await axios.post(`http://localhost:5000/api/customer/khambenh/${maSDDV}/rating`, rating, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            alert("Cảm ơn bạn đã đánh giá dịch vụ!");
            setRated(true);
        } catch (err) {
            console.error("Error submitting rating:", err);
            alert("Không thể gửi đánh giá.");
        }
    };

    if (loading) {
        return <p className="p-4">Đang tải...</p>;
    }

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title={`Chi tiết khám bệnh #${maSDDV}`} />

            <div className="max-w-[1200px] mx-auto mt-6 px-4 grid grid-cols-3 gap-4">

                {/* LEFT BOX — EXAMINATION DETAILS */}
                <div className="col-span-2 bg-white shadow-sm border rounded-md">
                    <div className="bg-blue-200 px-6 py-3 text-center border-b">
                        <h3 className="text-base font-semibold text-gray-800">Thông tin khám bệnh</h3>
                    </div>

                    <div className="p-6 space-y-3">

                        {/* General Information */}
                        <section>
                            <h4 className="font-semibold text-gray-700 mb-2">Thông tin chung</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Info label="Mã khám bệnh" value={detail.MaSDDV} />
                                <Info label="Mã hoá đơn" value={detail.MaHD} />
                                <Info label="Ngày khám" value={detail.NgayLap} />
                                <Info label="Chi nhánh" value={detail.TenCN} />
                                <Info label="Thú cưng" value={detail.TenTC} />
                                <Info label="Bác sĩ" value={detail.TenBS} />
                                <Info label="Triệu chứng" value={detail.TrieuChung} />
                                <Info label="Chuẩn đoán" value={detail.ChuanDoan} />
                                <Info label="Ngày tái khám" value={detail.NgayTaiKham} />
                                <Info label="Tổng tiền" value={`${detail.TongTienDV} VND`} />
                            </div>
                        </section>

                        {/* Prescription Table */}
                        <section className="mt-6">
                            <h4 className="font-semibold text-gray-700 mb-2">Toa thuốc</h4>
                            <table className="w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2">Tên thuốc</th>
                                        <th className="border p-2">Số lượng</th>
                                        <th className="border p-2">Liều lượng</th>
                                        <th className="border p-2">Cách dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {toaThuoc.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center p-3">Không có toa thuốc</td></tr>
                                    ) : (
                                        toaThuoc.map((item) => (
                                            <tr key={item.MaSP}>
                                                <td className="border p-2">{item.TenSP}</td>
                                                <td className="border p-2">{item.SoLuong}</td>
                                                <td className="border p-2">{item.LieuLuong}</td>
                                                <td className="border p-2">{item.CachDung}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </section>
                    </div>
                </div>

                {/* RIGHT BOX — RATING */}
                <div className="bg-white shadow-sm border rounded-md h-fit">
                    <div className="bg-blue-200 px-6 py-3 text-center border-b">
                        <h3 className="text-base font-semibold text-gray-800">Đánh giá dịch vụ</h3>
                    </div>

                    <div className="p-6 space-y-4">

                        {/* Already Rated → Display Only */}
                        {rated ? (
                            <RatedView rating={rating} />
                        ) : (
                            <RateForm rating={rating} setRating={setRating} handleRate={handleRate} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="font-medium">{label}</p>
            <p className="border p-2 rounded bg-gray-50">{value || "—"}</p>
        </div>
    );
}

function RatedView({ rating }) {
    const radioOptionsA = ["Rất tốt", "Tốt", "Bình thường", "Tệ", "Rất tệ"];
    const radioOptionsB = ["Rất hài lòng", "Hài lòng", "Bình thường", "Không hài lòng", "Rất không hài lòng"];
    return (
        <div className="space-y-2">
            <Info label="Điểm" value={`${rating.diem} ⭐`} />
            <Info label="Thái độ nhân viên" value={rating.thaiDoNhanVien?radioOptionsA[5 - rating.thaiDoNhanVien]:'-'} />
            <Info label="Mức độ hài lòng" value={rating.mucDoHaiLong?radioOptionsB[5 - rating.mucDoHaiLong]:'-'} />
            <Info label="Bình luận" value={rating.binhLuan?rating.binhLuan:'-'} />
        </div>
    );
}

function RateForm({ rating, setRating, handleRate }) {
    const radioOptionsA = ["Rất tốt", "Tốt", "Bình thường", "Tệ", "Rất tệ"];
    const radioOptionsB = ["Rất hài lòng", "Hài lòng", "Bình thường", "Không hài lòng", "Rất không hài lòng"];

    return (
        <div className="space-y-4">
            {/* Diem */}
            <div>
                <label className="font-medium">Điểm (1–5 ⭐)</label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    className="border p-2 rounded w-full"
                    value={rating.diem}
                    onChange={(e) => setRating({ ...rating, diem: e.target.value })}
                />
            </div>

            {/* Thai do nhan vien */}
            <div>
                <label className="font-medium block mb-1">Thái độ nhân viên</label>
                {radioOptionsA.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 mb-1">
                        <input
                            type="radio"
                            name="thaiDo"
                            value={5 - idx}
                            onChange={(e) =>
                                setRating({ ...rating, thaiDoNhanVien: e.target.value })
                            }
                        />
                        {opt}
                    </label>
                ))}
            </div>

            {/* Muc do hai long */}
            <div>
                <label className="font-medium block mb-1">Mức độ hài lòng</label>
                {radioOptionsB.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 mb-1">
                        <input
                            type="radio"
                            name="haiLong"
                            value={5 - idx}
                            onChange={(e) =>
                                setRating({ ...rating, mucDoHaiLong: e.target.value })
                            }
                        />
                        {opt}
                    </label>
                ))}
            </div>

            {/* Binh luan */}
            <div>
                <label className="font-medium">Bình luận</label>
                <textarea
                    className="border p-2 rounded w-full h-24"
                    value={rating.binhLuan}
                    onChange={(e) => setRating({ ...rating, binhLuan: e.target.value })}
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleRate}
                className="
                    w-full py-2 text-white font-medium rounded
                    bg-blue-500
                    shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6),inset_0px_-3px_6px_rgba(0,0,0,0.3)]
                    hover:brightness-110
                    active:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.4)]
                    transition-all
                "
            >
                Đánh giá
            </button>
        </div>
    );
}