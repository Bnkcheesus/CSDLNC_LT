import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle.jsx";
import CategoryBar from "../../components/ui/CategoryBar.jsx";
import PetInfoCard from "../../components/ui/PetInfoCard.jsx";
import PetHistoryTable from "../../components/ui/PetHistoryTable.jsx";

export default function CustomerPetHistory() {
    const { maTC } = useParams();
    const maTK = localStorage.getItem("maTK");
    const token = localStorage.getItem("token");

    const [pet, setPet] = useState(null);
    const [type, setType] = useState("all");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [rowDetails, setRowDetails] = useState({});

    useEffect(() => {
        if (!token || !maTC) return;

        const fetchPetProfile = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/pets/${maTC}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setPet(res.data.data);
                } else {
                    setError("Failed to fetch pet profile.");
                }
            } catch (err) {
                console.error("Error fetching pet profile:", err);
                setError("An error occurred while fetching pet profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchPetProfile();
    }, [token, maTC]);

    useEffect(() => {
        if (!maTK || !token || !maTC) return;

        const fetchPetHistory = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`http://localhost:5000/api/customer/pets/${maTC}/history`, {
                    params: { type: type, page: page, limit: limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (res.data.success) {
                    setRows(res.data.data.rows || []);
                    setTotalPages(res.data.data.totalPages || 1);
                }
                else {
                    setError("Failed to fetch pet history.");
                }
            } catch (err) {
                console.error("Error fetching pet history:", err);
                setError("An error occurred while fetching pet history.");
            } finally {
                setLoading(false);
            }
        };

        fetchPetHistory();
    }, [maTK, token, maTC, type, page, limit]);

    const handleToggleRow = async (r) => {
        if (openRow === r.MaSDDV) {
            setOpenRow(null);
            return;
        }

        if (!rowDetails[r.MaSDDV]) {
            try {
                let res;
                if (r.LoaiDV === "KB") {
                    res = await axios.get(`http://localhost:5000/api/customer/khambenh/${r.MaSDDV}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                } else if (r.LoaiDV === "TP") {
                    res = await axios.get(`http://localhost:5000/api/customer/tiemphong/${r.MaSDDV}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                }

                if (res?.data?.success) {
                    setRowDetails(prev => ({ ...prev, [r.MaSDDV]: res.data.data }));
                }
            } catch (err) {
                console.error("Error fetching service details:", err);
            }
        }

        setOpenRow(r.MaSDDV);
    };

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title="Thú cưng" />

            {/* ---------------- PET INFORMATION ---------------- */}
            <div className="max-w-[1200px] mx-auto px-4 mt-6">
                <PetInfoCard pet={pet} />
            </div>

            {/* ---------------- SERVICE TYPE BAR ---------------- */}
            <CategoryBar
                active={type}
                onChange={(t) => {
                    setType(t);
                    setPage(1);
                }}
                types={[
                    { key: "all", label: "Tất cả dịch vụ" },
                    { key: "KB", label: "Khám bệnh" },
                    { key: "TP", label: "Tiêm phòng" }
                ]}
            />

            {/* ---------------- HISTORY TABLE ---------------- */}
            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <PetHistoryTable
                    rows={rows}
                    loading={loading}
                    error={error}
                    page={page}
                    totalPages={totalPages}
                    openRow={openRow}
                    rowDetails={rowDetails}
                    onToggleRow={handleToggleRow}
                    onPrevPage={() => setPage(p => Math.max(1, p - 1))}
                    onNextPage={() => setPage(p => Math.min(totalPages, p + 1))}
                />
            </div>
        </div>
    );
}