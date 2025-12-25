import { useEffect, useState } from "react";
import axios from "axios";

export default function AddServiceBox({ maCN, maTKKH, onAdd }) {
    const token = localStorage.getItem("token");

    const [doctors, setDoctors] = useState([]);
    const [pets, setPets] = useState([]);

    const [form, setForm] = useState({
        LoaiDV: "KB",
        MaBS: "",
        MaTC: ""
    });

    useEffect(() => {
        if (!maCN) return;

        axios.get(`http://localhost:5000/api/user/doctors/${maCN}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.success) setDoctors(res.data.data);
        });
    }, [maCN, token]);

    useEffect(() => {
        if (!maTKKH) return;

        axios.get(`http://localhost:5000/api/user/pets/${maTKKH}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.success) setPets(res.data.data);
        });
    }, [maTKKH, token]);

    const handleAdd = () => {
        if (!form.MaBS || !form.MaTC) {
            alert("Vui lòng chọn đầy đủ thông tin.");
            return;
        }

        const bs = doctors.find(d => d.MaTKNV === form.MaBS);
        const tc = pets.find(p => p.MaTC === form.MaTC);

        onAdd({
            ...form,
            TenBS: bs?.HoTen,
            TenTC: tc?.TenTC
        });

        setForm({ LoaiDV: "KB", MaBS: "", MaTC: "" });
    };

    return (
        <div className="p-6 border-b grid grid-cols-4 gap-4">
            <select
                value={form.LoaiDV}
                onChange={e => setForm({ ...form, LoaiDV: e.target.value })}
                className="p-2 border rounded"
            >
                <option value="KB">Khám bệnh</option>
                <option value="TP">Tiêm phòng</option>
            </select>

            <select
                value={form.MaBS}
                onChange={e => setForm({ ...form, MaBS: e.target.value })}
                className="p-2 border rounded"
            >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map(d => (
                    <option key={d.MaTKNV} value={d.MaTKNV}>{d.HoTen}</option>
                ))}
            </select>

            <select
                value={form.MaTC}
                onChange={e => setForm({ ...form, MaTC: e.target.value })}
                className="p-2 border rounded"
            >
                <option value="">-- Chọn thú cưng --</option>
                {pets.map(p => (
                    <option key={p.MaTC} value={p.MaTC}>{p.MaTC + " - " + p.TenTC}</option>
                ))}
            </select>

            <button
                onClick={handleAdd}
                className=" px-6 py-2 bg-blue-500 text-white font-medium rounded
                shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6),inset_0px_-3px_6px_rgba(0,0,0,0.3)]
                hover:brightness-110 active:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.4)]
                transition-all "
            >
                Thêm dịch vụ
            </button>
        </div>
    );
}
