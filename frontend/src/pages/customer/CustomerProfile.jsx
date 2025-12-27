import { useState, useEffect } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import axios from "axios";

export default function CustomerProfile() {
    const maTK = localStorage.getItem("maTK");
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        cccd: "",
        gender: "",
        dob: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    const [isEditingPassword, setIsEditingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:5000/api/customer/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setForm((prevForm) => ({
                    ...prevForm,
                    name: res.data.data.HoTen ? res.data.data.HoTen : "",
                    phone: res.data.data.SDT ? res.data.data.SDT : "",
                    email: res.data.data.Email ? res.data.data.Email : "",
                    cccd: res.data.data.CCCD ? res.data.data.CCCD : "",
                    gender: res.data.data.GioiTinh ? res.data.data.GioiTinh : "",
                    dob: res.data.data.NgaySinh ? res.data.data.NgaySinh.slice(0, 10) : ""
                }));
            } catch (err) {
                console.error("Error fetching customer profile:", err);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (isEditingPassword && (!form.currentPassword || !form.newPassword || !form.confirmNewPassword)) {
                alert("Vui lòng điền đầy đủ thông tin mật khẩu.");
                return;
            }

            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/customer/profile`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (isEditingPassword) {
                await axios.put(`http://localhost:5000/api/user/password`, {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmNewPassword: form.confirmNewPassword
              }, {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });
            }
            alert("Cập nhật thông tin thành công!");
            setForm((prevForm) => ({
                ...prevForm,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            }));
            setIsEditingPassword(false);
        } catch (err) {
            console.error("Error updating customer profile:", err);
            alert("Cập nhật thông tin thất bại.");
        }
    };

  return (
    <div className="min-h-screen bg-white text-sm">
      <Header />
      <Navbar />
      <PageTitle title="Thông tin cá nhân" />

      <div className="max-w-[700px] mx-auto mt-6 bg-white shadow-sm border border-gray-300 rounded-md">
        <div className="bg-blue-200 px-6 py-3 text-center border-b border-gray-300">
          <h3 className="text-base font-semibold text-gray-800">Thông tin cá nhân</h3>
        </div>

        <div className="p-6 grid grid-cols-1 gap-4">
          {/* ID */}
          <div>
            <label className="block font-medium mb-1">Mã khách hàng</label>
            <input
              type="text"
              value={maTK}
              disabled
              className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Họ tên */}
          <div>
            <label className="block font-medium mb-1">Họ tên</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium mb-1">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* CCCD */}
          <div>
            <label className="block font-medium mb-1">CCCD</label>
            <input
              type="text"
              name="cccd"
              value={form.cccd}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-medium mb-1">Giới tính</label>
            <div className="flex items-center gap-6">
              {["Nam", "Nữ"].map((g) => (
                <label key={g} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block font-medium mb-1">Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <input
              type="checkbox"
              checked={isEditingPassword}
              onChange={(e) => {
                  setIsEditingPassword(e.target.checked);
                  if (!e.target.checked) {
                      setForm((prevForm) => ({
                          ...prevForm,
                          currentPassword: "",
                          newPassword: "",
                          confirmNewPassword: ""
                      }));
                  }
              }}
            />
            <span> Thay đổi mật khẩu</span>
          </div>

          {isEditingPassword && (
            <>
              {/* Current Password */}
              <div>
                <label className="block font-medium mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block font-medium mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block font-medium mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={form.confirmNewPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}

          {/* Update button */}
          <button
            onClick={handleUpdate}
            className="
              mt-4 py-2 px-6 
              bg-blue-500 text-white font-medium
              rounded 
              shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6),inset_0px_-3px_6px_rgba(0,0,0,0.3)]
              hover:brightness-110
              active:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.4)]
              transition-all
            "
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}