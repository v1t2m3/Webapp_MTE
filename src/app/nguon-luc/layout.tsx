import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nguồn lực | MTE-LAB",
    description: "Quản lý nguồn lực: Nhân sự, Xe & Thiết bị, Hợp đồng.",
};

export default function NguonLucLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="p-6">{children}</div>;
}
