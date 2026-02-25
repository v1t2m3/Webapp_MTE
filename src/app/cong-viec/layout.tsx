import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Công việc | MTE-LAB",
    description: "Quản lý công việc: Lịch công tác, Đề cương, Báo cáo.",
};

export default function CongViecLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="p-6">{children}</div>;
}
