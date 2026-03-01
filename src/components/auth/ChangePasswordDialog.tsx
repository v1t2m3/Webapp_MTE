"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Mật khẩu có độ khó gồm: ít nhất 8 ký tự; gồm có ký tự: chữ Hoa, chữ thường, số, ký tự đặc biệt.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới không khớp báo nhận lại.");
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm: chữ Hoa, chữ thường, số, và ký tự đặc biệt.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            if (res.ok) {
                alert("Đổi mật khẩu thành công!");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                onOpenChange(false);
            } else {
                const data = await res.json();
                setError(data.error || "Không thể đổi mật khẩu.");
            }
        } catch (err) {
            console.error(err);
            setError("Đã xảy ra lỗi mạng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Đổi Mật Khẩu</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để bảo vệ tài khoản của bạn.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

                        <div className="grid gap-2">
                            <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                            <Input
                                id="oldPassword"
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Mật khẩu mới</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground leading-tight">
                                Ít nhất 8 ký tự, 1 chữ Hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt (@$!%*?&).
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-[#3a0ca3] hover:bg-[#3a0ca3]/90 text-white" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
