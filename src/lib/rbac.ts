import { UserRole } from "@/types";

export type Action = "create" | "update" | "delete" | "view" | "download" | "complete";

export type Resource =
    | "bao-cao-ca-nhan"
    | "bao-cao-nguoi-khac"
    | "bao-cao-tuan-thang-hop-dong"
    | "quan-ly-nhan-su"
    | "quang-ly-hop-dong"
    | "xe-thiet-bi"
    | "lich-cong-tac"
    | "de-cuong"
    | "nhan-su-62"
    | "may-moc-64"
    | "capa-87"
    | "tai-lieu-83";

export function hasAccess(role: UserRole | undefined, level: number | undefined, action: Action, resource: Resource): boolean {
    if (!role) return false;

    // Admin có toàn quyền
    if (role === "Admin") return true;

    // Viewer chỉ được xem (view) một số tài liệu, không bao giờ có thể create/update/delete
    if (role === "Viewer") {
        if (action === "view") {
            // Viewer không được xem báo cáo người khác theo design ngầm định
            if (resource === "bao-cao-nguoi-khac") return false;
            return true;
        }
        return false;
    }

    if (role === "User") {
        const userLvl = level || 1; // Mặc định là Mức 1 nếu undef

        switch (resource) {
            case "bao-cao-ca-nhan":
                // Mọi User đều có thể tạo/sửa báo cáo của chính mình
                if (action === "create" || action === "update" || action === "view") return true;
                return false;

            case "bao-cao-nguoi-khac":
                // Chỉ Mức 1 mới mạn phép Chọn, Xem, và Tải báo cáo người khác
                if (userLvl === 1 && (action === "view" || action === "download")) return true;
                // Các Mức khác không được phép
                return false;

            case "bao-cao-tuan-thang-hop-dong":
                // Mức 1 được tạo, sửa. Mức 2, 3, 4 chỉ xem (Yêu cầu mới)
                if (userLvl === 1 && (action === "create" || action === "update")) return true;
                if (action === "view") return true;
                return false;

            case "quan-ly-nhan-su":
            case "quang-ly-hop-dong":
            case "xe-thiet-bi":
            case "lich-cong-tac":
            case "de-cuong":
                // Lvl 1 & 2: Có quyền Thêm, Sửa, Xoá, Tải
                if (userLvl === 1 || userLvl === 2) {
                    if (["create", "update", "delete", "download"].includes(action)) return true;
                }
                // Các cấp khác thì chỉ có quyền View
                if (action === "view") return true;
                return false;

            case "nhan-su-62":
            case "may-moc-64":
            case "capa-87":
            case "tai-lieu-83":
                // Lvl 1 & 3: Có quyền Thêm, Sửa, Xoá cho mảng Thử nghiệm (Mục 6.2, 6.4, 8.7)
                if (userLvl === 1 || userLvl === 3) {
                    if (action === "create" || action === "update" || action === "delete") return true;
                }

                // Chức năng Hoàn Thành CAPA: Bất kỳ User nào (1,2,3,4) là Người phụ trách đều đổi được
                // Quyền này cấp true, nhưng Component UI phải wrap với Check "Là chính chủ".
                if (resource === "capa-87" && action === "complete") {
                    return true;
                }

                // Các User còn lại thì chỉ View
                if (action === "view") return true;
                return false;

            default:
                return false;
        }
    }

    return false;
}
