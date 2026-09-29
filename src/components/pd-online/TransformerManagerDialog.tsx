"use client";

import { useEffect, useState } from "react";
import { Transformer110kV, PowerCompany, Substation110kV } from "@/types/pd-online";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Edit } from "lucide-react";

interface TransformerManagerDialogProps {
    open: boolean;
    onClose: () => void;
    transformer?: Transformer110kV | null; // Null for Create, object for Edit
    powerCompanies: PowerCompany[];
    substations: Substation110kV[];
    onSubmit: (payload: any, isEdit: boolean) => Promise<void>;
}

export function TransformerManagerDialog({
    open,
    onClose,
    transformer,
    powerCompanies,
    substations,
    onSubmit
}: TransformerManagerDialogProps) {
    const isEdit = !!transformer;

    const [id, setId] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [selectedSubstationId, setSelectedSubstationId] = useState("");
    const [substationName, setSubstationName] = useState("");
    const [isCustomSubstation, setIsCustomSubstation] = useState(false);

    const [code, setCode] = useState("T1");
    const [name, setName] = useState("");
    const [capacityMva, setCapacityMva] = useState("63");
    const [voltageRatio, setVoltageRatio] = useState("115/38,5/24kV");
    const [coolingType, setCoolingType] = useState("ONAF");
    const [manufacturer, setManufacturer] = useState("EEMC");
    const [oltcType, setOltcType] = useState("VACUUM");
    const [oltcManufacturer, setOltcManufacturer] = useState("MR");
    const [manufacturedYear, setManufacturedYear] = useState("2019");
    const [commissionedYear, setCommissionedYear] = useState("2019");
    const [lastTestedDate, setLastTestedDate] = useState("29/09/2026");
    const [pdTestType, setPdTestType] = useState<"Định kỳ" | "Lần đầu" | "Sửa chữa" | "Sự cố">("Định kỳ");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transformer) {
            setId(transformer.id);
            const targetSub = substations.find(s => s.id === transformer.substationId);
            const targetComp = targetSub
                ? powerCompanies.find(c => c.id === targetSub.powerCompanyId)
                : powerCompanies.find(c => c.name === transformer.powerCompanyName);

            const compId = targetComp ? targetComp.id : (powerCompanies[0]?.id || "");
            const compName = targetComp ? targetComp.name : (transformer.powerCompanyName || powerCompanies[0]?.name || "Điện lực Đà Nẵng");

            setSelectedCompanyId(compId);
            setCompanyName(compName);

            const subId = targetSub ? targetSub.id : (transformer.substationId || "");
            const subName = targetSub ? targetSub.name : (transformer.substationName || "TBA 110kV Liên Chiểu");

            setSelectedSubstationId(subId);
            setSubstationName(subName);

            setCode(transformer.code || "T1");
            setName(transformer.name || "");
            setCapacityMva(transformer.capacityMva?.toString() || "63");
            setVoltageRatio(transformer.voltageRatio || "115/38,5/24kV");
            setCoolingType(transformer.coolingType || "ONAF");
            setManufacturer(transformer.manufacturer || "EEMC");
            setOltcType(transformer.oltcType || "VACUUM");
            setOltcManufacturer(transformer.oltcManufacturer || "MR");
            setManufacturedYear(transformer.manufacturedYear?.toString() || "2019");
            setCommissionedYear(transformer.commissionedYear?.toString() || "2019");
            setLastTestedDate(transformer.lastTestedDate || "29/09/2026");
            setPdTestType(transformer.pdTestType || "Định kỳ");
        } else {
            // Defaults for Create
            const defaultId = `mba-${Math.floor(1000 + Math.random() * 9000)}-tsad-${Math.floor(10000 + Math.random() * 90000)}`;
            setId(defaultId);

            const defaultCompany = powerCompanies[0] || { id: "pc-da-nang", name: "Điện lực Đà Nẵng" };
            setSelectedCompanyId(defaultCompany.id);
            setCompanyName(defaultCompany.name);

            const companySubs = substations.filter(s => s.powerCompanyId === defaultCompany.id);
            const defaultSub = companySubs[0] || substations[0] || { id: "tba-lien-chieu", name: "TBA 110kV Liên Chiểu" };

            setSelectedSubstationId(defaultSub.id);
            setSubstationName(defaultSub.name);
            setIsCustomSubstation(false);

            setCode("T1");
            setName("Máy biến áp T1");
            setCapacityMva("63");
            setVoltageRatio("115/38,5/24kV");
            setCoolingType("ONAF");
            setManufacturer("EEMC");
            setOltcType("VACUUM");
            setOltcManufacturer("MR");
            setManufacturedYear("2019");
            setCommissionedYear("2019");

            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            setLastTestedDate(`${day}/${month}/${year}`);
            setPdTestType("Định kỳ");
        }
    }, [transformer, open, powerCompanies, substations]);

    // Handle Power Company Selection Change
    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        const comp = powerCompanies.find(c => c.id === companyId);
        if (comp) {
            setCompanyName(comp.name);
        }
        const companySubs = substations.filter(s => s.powerCompanyId === companyId);
        if (companySubs.length > 0) {
            setSelectedSubstationId(companySubs[0].id);
            setSubstationName(companySubs[0].name);
            setIsCustomSubstation(false);
        } else {
            setSelectedSubstationId("");
            setSubstationName("");
            setIsCustomSubstation(true);
        }
    };

    // Handle Substation Selection Change
    const handleSubstationChange = (subId: string) => {
        if (subId === "CUSTOM_NEW_SUBSTATION") {
            setIsCustomSubstation(true);
            setSelectedSubstationId("");
            setSubstationName("");
        } else {
            setIsCustomSubstation(false);
            setSelectedSubstationId(subId);
            const sub = substations.find(s => s.id === subId);
            if (sub) {
                setSubstationName(sub.name);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const finalSubstationName = substationName.trim() || "TBA 110kV Mới";
        const finalCompanyName = companyName.trim() || "Điện lực Đà Nẵng";

        const payload = {
            id: id.trim() || `mba-${Math.floor(1000 + Math.random() * 9000)}-tsad-${Math.floor(10000 + Math.random() * 90000)}`,
            substationId: selectedSubstationId,
            code: code.trim() || "T1",
            name: name.trim() || `Máy biến áp ${code} - ${finalSubstationName}`,
            capacityMva: parseFloat(capacityMva) || 63,
            voltageRatio: voltageRatio.trim() || "115/38,5/24kV",
            coolingType: coolingType.trim() || "ONAF",
            manufacturer: manufacturer.trim() || "EEMC",
            oltcType: oltcType.trim() || "VACUUM",
            oltcManufacturer: oltcManufacturer.trim() || "MR",
            manufacturedYear: parseInt(manufacturedYear) || 2019,
            commissionedYear: parseInt(commissionedYear) || 2019,
            lastTestedDate: lastTestedDate.trim() || "29/09/2026",
            pdTestType,
            status: "NORMAL",
            powerCompanyName: finalCompanyName,
            substationName: finalSubstationName
        };

        await onSubmit(payload, isEdit);
        setLoading(false);
        onClose();
    };

    const availableSubstations = substations.filter(s => s.powerCompanyId === selectedCompanyId);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-indigo-500/30 text-white">
                <DialogHeader className="border-b border-slate-800 pb-3">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-amber-300">
                        {isEdit ? <Edit className="h-5 w-5 text-indigo-400" /> : <Plus className="h-5 w-5 text-emerald-400" />}
                        {isEdit ? "Cập nhật Thông tin Máy biến áp 110kV" : "Thêm mới Thông tin Máy biến áp 110kV"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
                    {/* Row 1: ID, Công ty Điện lực, Trạm biến áp */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs text-amber-300 font-bold">ID (Mã MBA)</Label>
                            <Input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="mba-t1-bch"
                                className="bg-slate-950 border-slate-700 text-xs text-amber-300 font-mono font-bold"
                            />
                        </div>

                        <div>
                            <Label className="text-xs text-slate-300 font-semibold">Công ty Điện lực</Label>
                            <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                                <SelectTrigger className="bg-slate-950 border-slate-700 text-xs text-white">
                                    <SelectValue placeholder="Chọn Công ty Điện lực" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs max-h-60">
                                    {powerCompanies.map(pc => (
                                        <SelectItem key={pc.id} value={pc.id} className="text-xs cursor-pointer">
                                            {pc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs text-slate-300 font-semibold">Trạm biến áp 110kV</Label>
                            {!isCustomSubstation && availableSubstations.length > 0 ? (
                                <Select value={selectedSubstationId} onValueChange={handleSubstationChange}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-xs text-white">
                                        <SelectValue placeholder="Chọn Trạm biến áp" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs max-h-60">
                                        {availableSubstations.map(sub => (
                                            <SelectItem key={sub.id} value={sub.id} className="text-xs cursor-pointer">
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="CUSTOM_NEW_SUBSTATION" className="text-xs text-cyan-300 font-bold border-t border-slate-800 cursor-pointer">
                                            + Nhập tên Trạm biến áp mới...
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    type="text"
                                    value={substationName}
                                    onChange={(e) => setSubstationName(e.target.value)}
                                    placeholder="TBA 110kV Liên Chiểu"
                                    className="bg-slate-950 border-slate-700 text-xs text-white"
                                />
                            )}
                        </div>
                    </div>

                    {/* Row 2: Ký hiệu vận hành, Công suất, Tỉ số điện áp, Phương pháp làm mát */}
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <Label className="text-xs text-slate-300 font-semibold">Ký hiệu vận hành</Label>
                            <Input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="T1"
                                className="bg-slate-950 border-slate-700 text-xs text-white font-bold"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300 font-semibold">Công suất (MVA)</Label>
                            <Input
                                type="number"
                                value={capacityMva}
                                onChange={(e) => setCapacityMva(e.target.value)}
                                placeholder="63"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Tỉ số điện áp</Label>
                            <Input
                                type="text"
                                value={voltageRatio}
                                onChange={(e) => setVoltageRatio(e.target.value)}
                                placeholder="115/38,5/24kV"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Phương pháp làm mát</Label>
                            <Input
                                type="text"
                                value={coolingType}
                                onChange={(e) => setCoolingType(e.target.value)}
                                placeholder="ONAF / ONAN"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                    </div>

                    {/* Row 3: Hãng sản xuất MBA, OLTC, Hãng sản xuất OLTC */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs text-slate-300">Hãng sản xuất MBA</Label>
                            <Input
                                type="text"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                placeholder="VEE / EEMC / ABB"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Bộ điều áp OLTC</Label>
                            <Input
                                type="text"
                                value={oltcType}
                                onChange={(e) => setOltcType(e.target.value)}
                                placeholder="VVI / VACUUM / OIL"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Hãng sản xuất OLTC</Label>
                            <Input
                                type="text"
                                value={oltcManufacturer}
                                onChange={(e) => setOltcManufacturer(e.target.value)}
                                placeholder="MR / ABB"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                    </div>

                    {/* Row 4: Năm sản xuất, Năm vận hành, Lần PD online gần nhất, Tính chất PD online */}
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <Label className="text-xs text-slate-300">Năm sản xuất</Label>
                            <Input
                                type="number"
                                value={manufacturedYear}
                                onChange={(e) => setManufacturedYear(e.target.value)}
                                placeholder="2019"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-300">Năm vận hành</Label>
                            <Input
                                type="number"
                                value={commissionedYear}
                                onChange={(e) => setCommissionedYear(e.target.value)}
                                placeholder="2019"
                                className="bg-slate-950 border-slate-700 text-xs text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-amber-300 font-semibold">Lần PD gần nhất</Label>
                            <Input
                                type="text"
                                value={lastTestedDate}
                                onChange={(e) => setLastTestedDate(e.target.value)}
                                placeholder="29/09/2026"
                                className="bg-slate-950 border-slate-700 text-xs text-emerald-300 font-mono"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-amber-300 font-semibold">Tính chất PD online</Label>
                            <Select value={pdTestType} onValueChange={(val: any) => setPdTestType(val)}>
                                <SelectTrigger className="bg-slate-950 border-slate-700 text-xs text-white font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                    <SelectItem value="Định kỳ">Định kỳ</SelectItem>
                                    <SelectItem value="Lần đầu">Lần đầu</SelectItem>
                                    <SelectItem value="Sửa chữa">Sửa chữa</SelectItem>
                                    <SelectItem value="Sự cố">Sự cố</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t border-slate-800">
                        <Button type="button" variant="outline" onClick={onClose} className="bg-slate-800 border-slate-700 text-slate-300">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                            <Save className="h-4 w-4 mr-1.5" /> {loading ? "Đang lưu..." : isEdit ? "Cập nhật MBA" : "Thêm mới MBA"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
