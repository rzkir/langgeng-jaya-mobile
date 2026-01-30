export function formatRupiah(value: number) {
    return `Rp ${Math.max(0, Math.round(value)).toLocaleString('id-ID')}`;
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