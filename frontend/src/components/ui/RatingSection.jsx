import { useState, useEffect } from "react";
import axios from "axios";

const radioOptionsA = ["Rất tốt", "Tốt", "Bình thường", "Tệ", "Rất tệ"];
const radioOptionsB = ["Rất hài lòng", "Hài lòng", "Bình thường", "Không hài lòng", "Rất không hài lòng"];

export default function RatingSection({ maSDDV }) {
    const token = localStorage.getItem("token");
    const [rated, setRated] = useState(false);
    const [rating, setRating] = useState({
        diem: "",
        thaiDoNhanVien: "",
        mucDoHaiLong: "",
        binhLuan: ""
    });

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/rating/${maSDDV}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.data.data) {
                    setRating({
                        diem: res.data.data.Diem,
                        thaiDoNhanVien: res.data.data.ThaiDoNhanVien,
                        mucDoHaiLong: res.data.data.MucDoHaiLong,
                        binhLuan: res.data.data.BinhLuan
                    });
                    setRated(true);
                }
            } catch (err) {
                console.error("Error fetching rating:", err);
            }
        };
        fetchRating();
    }, [maSDDV, token]);

    const handleRating = async (e) => {
        e.preventDefault();
        if (!rating.diem) {
            alert("Vui lòng chọn điểm đánh giá.");
            return;
        }
        try {
            await axios.post(`http://localhost:5000/api/customer/rating/${maSDDV}`, rating, {
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

    return (
        <div>
            {rated ? (
                <RatedView rating={rating} />
            ) : (
                <RateForm rating={rating} setRating={setRating} handleRating={handleRating} />
            )}
        </div>
    );
}

function RatedView({ rating }) {
    return (
        <div className="space-y-2">
            <Info label="Điểm" value={`${rating.diem} ⭐`} />
            <Info label="Thái độ nhân viên" value={rating.thaiDoNhanVien?radioOptionsA[5 - rating.thaiDoNhanVien]:'-'} />
            <Info label="Mức độ hài lòng" value={rating.mucDoHaiLong?radioOptionsB[5 - rating.mucDoHaiLong]:'-'} />
            <Info label="Bình luận" value={rating.binhLuan?rating.binhLuan:'-'} />
        </div>
    );
}

function RateForm({ rating, setRating, handleRating }) {
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
                onClick={handleRating}
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

function Info({ label, value }) {
    return (
        <div>
            <p className="font-medium">{label}</p>
            <p className="border p-2 rounded bg-gray-50">{value || "—"}</p>
        </div>
    );
}