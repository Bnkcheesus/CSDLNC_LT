import { useState, useEffect } from "react";
import { Check, Pencil } from "lucide-react";
import axios from "axios";

export default function PetInfoCard({ pet, role='' }) {
    const isBSTY = role === "BSTY";
    const token = localStorage.getItem("token");

    const [editing, setEditing] = useState(false);
    const [tinhTrang, setTinhTrang] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pet) {
            setTinhTrang(pet.TinhTrangSucKhoe || "");
            setEditing(false);
        }
    }, [pet]);

    if (!pet) return null;

    const handleSave = async () => {
        try {
            setLoading(true);
            await axios.put(`http://localhost:5000/api/doctor/pet/${pet.MaTC}`, { TinhTrangSucKhoe: tinhTrang }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setEditing(false);
            alert("Cập nhật tình trạng sức khoẻ thành công!");
        } catch (err) {
            console.error("Error updating pet health status:", err);
            alert("Cập nhật tình trạng sức khoẻ thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border rounded-md shadow-sm p-4 mb-6">
            <h3 className="text-base font-semibold mb-3">Thông tin thú cưng</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                <p><strong>Mã thú cưng:</strong> {pet.MaTC}</p>
                <p><strong>Tên thú cưng:</strong> {pet.TenTC}</p>
                <p><strong>Loài:</strong> {pet.Loai || "-"}</p>
                <p><strong>Giống:</strong> {pet.Giong || "-"}</p>
        
                <p>
                    <strong>Ngày sinh:</strong>{" "}
                    {pet.NgaySinh
                        ? new Date(pet.NgaySinh).toLocaleDateString()
                        : "-"}
                </p>

                <p><strong>Giới tính:</strong> {pet.GioiTinh || "-"}</p>

                {/* Tình trạng sức khoẻ */}
                <div className="col-span-2 md:col-span-3 flex items-center gap-2">
                    <strong className="whitespace-nowrap">
                        Tình trạng sức khoẻ:
                    </strong>

                    {isBSTY ? (
                        <>
                            <input
                                type="text"
                                value={tinhTrang}
                                onChange={(e) => setTinhTrang(e.target.value)}
                                disabled={!editing}
                                className={`flex-1 px-2 py-1 border rounded text-sm
                                    ${editing ? "bg-white" : "bg-gray-100"}
                                `}
                            />

                            {editing ? (
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    title="Lưu"
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Check size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    title="Chỉnh sửa"
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Pencil size={18} />
                                </button>
                            )}
                        </>
                    ) : (
                        <span>{pet.TinhTrangSucKhoe || "-"}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
