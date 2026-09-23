export interface PowerCompany {
    id: string;
    code: string;
    name: string;
    region: string;
}

export interface Substation110kV {
    id: string;
    powerCompanyId: string;
    code: string;
    name: string;
    address: string;
}

export interface Transformer110kV {
    id: string;
    substationId: string;
    code: string; // T1, T2, T3...
    name: string;
    capacityMva: number; // e.g. 63, 40, 25
    voltageRatio: string; // e.g. "115/38.5/24 kV" or "110/22 kV"
    manufacturer: string; // e.g. "ABB", "EEMC", "Hitachi", "MEE", "VEC"
    manufacturedYear: number;
    commissionedYear: number;
    coolingType: string; // "ONAN", "ONAF", "OFAF"
    oltcType: string; // "VACCUM", "OIL", "MR"
    oltcManufacturer: string; // "MR Reinhausen", "ABB", "EEMC"
    status: "NORMAL" | "WATCH" | "CRITICAL";
    lastTestedDate?: string; // Lần PD online gần nhất (dd/mm/yyyy)
    pdTestType?: "Định kỳ" | "Lần đầu" | "Sửa chữa" | "Sự cố"; // Tính chất PD online
    powerCompanyName?: string;
    substationName?: string;
}

export interface SensorSetup {
    sensorId: string; // "HFCT", "AE1", "AE2", "AE3", "AE4"
    channel: number; // 0 for HFCT, 1-4 for AE
    attachedTo: string; // "Grounding lead", "Tank Wall Front Bottom-Left", etc.
    x_m: number;
    y_m: number;
    z_m: number;
}

export interface TankDimensions {
    length_m: number;
    width_m: number;
    height_m: number;
}

export interface PrpdPoint {
    phase_deg: number; // 0 to 360
    q_pc: number; // PD amplitude in pC or mV
    count: number; // pulse repetition count
}

export interface WaveformPoint {
    time_us: number;
    hfct_mv: number;
    ae1_mv: number;
    ae2_mv: number;
    ae3_mv: number;
    ae4_mv: number;
}

export interface InspectorAssessment {
    defectType: "Internal PD" | "Surface PD" | "Corona" | "Noise" | "Normal";
    riskLevel: "NORMAL" | "WATCH" | "CRITICAL";
    notes: string;
    inspectorName: string;
    reviewedAt: string;
}

export interface AIDiagnostic {
    predictedDefect: "Internal PD" | "Surface PD" | "Corona" | "Noise";
    confidence: number; // 0.0 - 1.0 (e.g. 0.912)
    riskLevel: "NORMAL" | "WATCH" | "CRITICAL";
    recommendedAction: string;
}

export interface Localization3D {
    computedCoord: {
        x: number;
        y: number;
        z: number;
    };
    errorMarginM: number;
    nearestComponent: string;
    waveVelocityUsedMps: number;
    tdoaDeltasMicrosec: number[];
}

export interface PdMetrics {
    qMaxPc: number;
    qAvgPc: number;
    pulseCountPerCycle: number;
}

export interface PdTestRecord {
    id: string;
    testCode: string;
    transformerId: string;
    testDate: string;
    oilTempC: number;
    ambientTempC: number;
    humidityPct: number;
    noiseLevelDb: number;
    tankDimensions: TankDimensions;
    sensorsSetup: SensorSetup[];
    metrics: PdMetrics;
    prpdPoints: PrpdPoint[];
    inspectorAssessment: InspectorAssessment;
    aiDiagnostic: AIDiagnostic;
    localization3D: Localization3D;
}
