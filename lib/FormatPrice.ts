export function formatRupiah(value: number) {
    return `Rp ${Math.max(0, Math.round(value)).toLocaleString('id-ID')}`;
}

/**
 * Format raw digit string as IDR display (e.g. "10000" -> "10.000").
 * Untuk input field; nilai disimpan terformat, parse dengan strip non-digit saat hitung.
 */
export function formatRupiahInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits === '') return '';
    const num = parseInt(digits, 10);
    return num.toLocaleString('id-ID');
}

/**
 * Format number as IDR with optional decimal places (untuk struk printer / app settings).
 */
export function formatIDR(value: number, decimalPlaces: number = 0): string {
    const n = Math.max(0, Number(value));
    return `Rp ${n.toLocaleString('id-ID', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    })}`;
}