"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { GlassCard, GlassPageHeader } from "@/components/ui/GlassCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert, Shield, UserIcon, Eye, Trash2, KeyRound, Plus, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserRole, Personnel } from "@/types";

interface SafeUser {
    id: string;
    username: string;
    fullName?: string;
    role: UserRole;
    level?: 1 | 2 | 3 | 4;
    isActive: boolean;
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<SafeUser[]>([]);
    const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ username: "", role: "User", fullName: "", level: 1 as 1 | 2 | 3 | 4 });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/admin/users");
        } else if (status === "authenticated" && session?.user?.role !== "Admin") {
            router.push("/");
        } else if (status === "authenticated") {
            fetchData();
        }
    }, [status, session, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, personnelRes] = await Promise.all([
                fetch("/api/users"),
                fetch("/api/personnel")
            ]);

            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data);
            }
            if (personnelRes.ok) {
                const data = await personnelRes.json();
                setPersonnelList(data);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill full name based on selected ID (Tài khoản)
    useEffect(() => {
        if (formData.username && personnelList.length > 0 && !editingUserId) {
            const person = personnelList.find(p => p.id === formData.username || p.id.toLowerCase() === formData.username.toLowerCase());
            if (person) {
                setFormData(prev => ({ ...prev, fullName: person.fullName }));
            }
        }
    }, [formData.username, personnelList, editingUserId]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Bạn có chắc muốn thay đổi quyền người dùng này thành ${newRole}?`)) return;

        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, action: "update_role", role: newRole }),
            });

            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as UserRole } : u));
                alert("Cập nhật quyền thành công!");

                if (userId === session?.user?.id && newRole !== "Admin") {
                    router.push("/");
                }
            } else {
                alert("Cập nhật thất bại.");
            }
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi.");
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!confirm(`Bạn có chắc muốn đặt lại mật khẩu cho người dùng này về mặc định (MTELAB#2026Reset)?`)) return;

        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, action: "reset_password" }),
            });

            if (res.ok) {
                alert("Đã đặt lại mật khẩu thành công!");
            } else {
                alert("Đặt lại mật khẩu thất bại.");
            }
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === session?.user?.id) {
            alert("Không thể tự xóa tài khoản của chính mình!");
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này?`)) return;

        try {
            const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });

            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                alert("Đã xóa người dùng thành công!");
            } else {
                alert("Xóa người dùng thất bại.");
            }
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi.");
        }
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingUserId) {
                // Update
                const res = await fetch("/api/users", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: editingUserId,
                        action: "update_info",
                        role: formData.role,
                        fullName: formData.fullName,
                        level: formData.role === "User" ? formData.level : undefined
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setUsers(prev => prev.map(u => u.id === editingUserId ? data.user : u));
                    alert("Cập nhật thông tin thành công!");
                    setIsDialogOpen(false);
                } else {
                    const errorData = await res.json();
                    alert(`Lỗi: ${errorData.error}`);
                }
            } else {
                // Create
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    const data = await res.json();
                    setUsers(prev => [...prev, data.user]);
                    alert("Tạo người dùng thành công! Mật khẩu mặc định là: MTELAB#2026Reset");
                    setIsDialogOpen(false);
                } else {
                    const errorData = await res.json();
                    alert(`Lỗi: ${errorData.error}`);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi kết nối.");
        }
    };

    const openAddModal = () => {
        setEditingUserId(null);
        setFormData({ username: "", role: "User", fullName: "", level: 1 });
        setIsDialogOpen(true);
    };

    const openEditModal = (user: SafeUser) => {
        setEditingUserId(user.id);
        setFormData({
            username: user.username,
            role: user.role,
            fullName: user.fullName || "",
            level: user.level || 1
        });
        setIsDialogOpen(true);
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex flex-col space-y-6 animate-fade-in w-full h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#3a0ca3]" />
                <p className="text-muted-foreground font-medium">Đang tải danh sách người dùng...</p>
            </div>
        );
    }

    if (session?.user?.role !== "Admin") {
        return (
            <div className="flex flex-col space-y-6 animate-fade-in w-full h-[60vh] items-center justify-center">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Truy cập bị từ chối</h2>
                <p className="text-muted-foreground font-medium">Bạn không có quyền quản trị viên để xem trang này.</p>
            </div>
        );
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'Admin': return <Shield className="w-4 h-4 mr-1 inline-block" />;
            case 'User': return <UserIcon className="w-4 h-4 mr-1 inline-block" />;
            case 'Viewer': return <Eye className="w-4 h-4 mr-1 inline-block" />;
            default: return null;
        }
    };

    return (
        <div className="w-full animate-fade-in space-y-6">
            <div className="flex justify-between items-start md:items-center">
                <GlassPageHeader
                    title="Quản lý Người Dùng (Admin)"
                    description="Quản lý tài khoản, mật khẩu và phân quyền (Admin, User, Viewer)."
                />
                <Button onClick={openAddModal} className="bg-[#3a0ca3] hover:bg-[#3a0ca3]/90 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Thêm người dùng
                </Button>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">Tài khoản</TableHead>
                                <TableHead>Họ và tên</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead className="text-right">Phân quyền nhanh</TableHead>
                                <TableHead className="text-center w-[150px]">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.fullName || "---"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : ''}
                                                ${user.role === 'User' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                                                ${user.role === 'Viewer' ? 'bg-slate-100 text-slate-800 border-slate-200' : ''}
                                            `}
                                        >
                                            <div className="flex items-center">
                                                {getRoleIcon(user.role)}
                                                {user.role} {user.role === "User" && user.level ? `- Mức ${user.level}` : ''}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end pr-2">
                                            <Select
                                                value={user.role}
                                                onValueChange={(val) => handleRoleChange(user.id, val)}
                                            >
                                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                                    <SelectValue placeholder="Đổi quyền" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Admin">
                                                        <div className="flex items-center"><Shield className="w-3 h-3 mr-1" />Admin</div>
                                                    </SelectItem>
                                                    <SelectItem value="User">
                                                        <div className="flex items-center"><UserIcon className="w-3 h-3 mr-1" />User</div>
                                                    </SelectItem>
                                                    <SelectItem value="Viewer">
                                                        <div className="flex items-center"><Eye className="w-3 h-3 mr-1" />Viewer</div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} title="Sửa thông tin">
                                                <Pencil className="w-4 h-4 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleResetPassword(user.id)} title="Reset Mật khẩu">
                                                <KeyRound className="w-4 h-4 text-orange-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} title="Xóa người dùng">
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmitForm}>
                        <DialogHeader>
                            <DialogTitle>{editingUserId ? "Sửa thông tin Người dùng" : "Thêm Người dùng mới"}</DialogTitle>
                            <DialogDescription>
                                {editingUserId
                                    ? "Chỉnh sửa tên và vai trò của người dùng."
                                    : "Nhập Mã Nhân Sự vào ô 'Tài khoản' để hệ thống tự động tải Họ và tên."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                    Tài khoản
                                </Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Ví dụ: NS001"
                                    disabled={!!editingUserId} // Khóa ô tài khoản nếu đang ở chế độ sửa
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullName" className="text-right">
                                    Họ và tên
                                </Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Vai trò
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">Admin (Toàn quyền)</SelectItem>
                                        <SelectItem value="User">User (Sửa/Xóa chính chủ)</SelectItem>
                                        <SelectItem value="Viewer">Viewer (Chỉ xem)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.role === "User" && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="level" className="text-right">
                                        Mức độ (Level)
                                    </Label>
                                    <Select
                                        value={String(formData.level)}
                                        onValueChange={(val) => setFormData({ ...formData, level: Number(val) as 1 | 2 | 3 | 4 })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Chọn mức phân quyền" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Mức 1 (Tất cả modules)</SelectItem>
                                            <SelectItem value="2">Mức 2 (Nhân sự, Hợp đồng, Xe, Lịch, Đề cương)</SelectItem>
                                            <SelectItem value="3">Mức 3 (Quản lý Thử nghiệm: Nhân sự, Máy, CAPA)</SelectItem>
                                            <SelectItem value="4">Mức 4 (Chỉ Báo cáo cá nhân & hoàn thành CAPA)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                            <Button type="submit" className="bg-[#3a0ca3] text-white hover:bg-[#3a0ca3]/90">
                                {editingUserId ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
