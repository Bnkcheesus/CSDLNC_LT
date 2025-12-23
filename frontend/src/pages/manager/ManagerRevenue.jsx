import { useState } from "react";
import Header from "../../components/ui/Header";
import Navbar from "../../components/ui/Navbar";
import PageTitle from "../../components/ui/PageTitle";
import CategoryBar from "../../components/ui/CategoryBar";

import RevenueSummaryCards from "../../components/ui/manager/RevenueSummaryCards";
import RevenueByBranchTable from "../../components/ui/manager/RevenueByBranchTable";
import RevenueByServiceTable from "../../components/ui/manager/RevenueByServiceTable";
import TopProductTable from "../../components/ui/manager/TopProductTable";

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
                    { key: "overview", label: "Tổng quan" },
                    { key: "branch", label: "Theo chi nhánh" },
                    { key: "service", label: "Theo dịch vụ" },
                    { key: "product", label: "Top sản phẩm" }
                ]}
            />

            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <>
                    {type === "overview" && (
                        <RevenueSummaryCards />
                    )}

                    {type === "branch" && (
                        <RevenueByBranchTable />
                    )}

                    {type === "service" && (
                        <RevenueByServiceTable />
                    )}

                    {type === "product" && (
                        <TopProductTable />
                    )}
                </>
            </div>
        </div>
    );
}
