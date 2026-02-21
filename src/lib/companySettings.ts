const STORAGE_KEY = "company_settings";

export interface CompanySettings {
    name: string;
    tagline: string;
    addressLine1: string;
    addressLine2: string;
    phone: string;
    footerMessage: string;
    logoBase64?: string; // data URL — e.g. "data:image/png;base64,..."
}

export const defaultCompanySettings: CompanySettings = {
    name: "MORAIS",
    tagline: "distribuidora",
    addressLine1: "Av. Tailândia - nº 127",
    addressLine2: "Bairro Columbia - Colatina - ES",
    phone: "(27) 98893-2758 / (27) 99938-1129",
    footerMessage: "Deus é nossa fonte!",
    logoBase64: undefined,
};

export function loadCompanySettings(): CompanySettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...defaultCompanySettings, ...JSON.parse(raw) };
    } catch {
        // ignore
    }
    return defaultCompanySettings;
}

export function saveCompanySettings(settings: CompanySettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
