import { useState } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle";
import CategoryBar from "../../components/ui/CategoryBar";

import SystemRevenueTable from "../../components/ui/manager/SystemRevenueTable";
import RevenueByBranchTable from "../../components/ui/manager/RevenueByBranchTable";

export default function ManagerRevenue() {
    const [type, setType] = useState("overview");

    return (
        <div className="min-h-screen bg-white text-sm">
            <Header />
            <Navbar />
            <PageTitle title="Doanh thu hệ thống" />

            <CategoryBar
                active={type}
                onChange={setType}
                types={[
                    { key: "overview", label: "Toàn hệ thống" },
                    { key: "branch", label: "Theo chi nhánh" }
                ]}
            />

            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <>
                    {type === "overview" && (
                        <SystemRevenueTable />
                    )}

                    {type === "branch" && (
                        <RevenueByBranchTable />
                    )}
                </>
            </div>
        </div>
    );
}
