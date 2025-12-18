import React from "react";

export default function PetInfoCard({ pet }) {
    if (!pet) return null;

    return (
        <div className="bg-white border rounded-md shadow-sm p-4 mb-6">
            <h3 className="text-base font-semibold mb-3">Thông tin thú cưng</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                <p><strong>Mã thú cưng:</strong> {pet.MaTC}</p>
                <p><strong>Tên thú cưng:</strong> {pet.TenTC}</p>
                <p><strong>Loài:</strong> {pet.Loai}</p>
                <p><strong>Giống:</strong> {pet.Giong}</p>

                <p>
                    <strong>Ngày sinh:</strong>{" "}
                    {pet.NgaySinh
                        ? new Date(pet.NgaySinh).toLocaleDateString()
                        : "-"}
                </p>

                <p><strong>Giới tính:</strong> {pet.GioiTinh}</p>
                <p><strong>Tình trạng sức khoẻ:</strong> {pet.TinhTrangSucKhoe}</p>
            </div>
        </div>
    );
}
