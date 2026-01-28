export function formatRupiah(value: number) {
    return `Rp ${Math.max(0, Math.round(value)).toLocaleString('id-ID')}`;
}