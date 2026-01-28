const RECEIPT_WIDTH = 32;

function centerText(text: string, width: number = RECEIPT_WIDTH): string {
    const trimmed = text.trim();
    return trimmed.length > width ? trimmed.slice(0, width) : trimmed;
}

function line(char: string = '*', width: number = RECEIPT_WIDTH): string {
    return char.repeat(width);
}

function formatLabelValue(label: string, value: string): string {
    const l = label.length > RECEIPT_WIDTH ? label.slice(0, RECEIPT_WIDTH) : label;
    const v = value.length > RECEIPT_WIDTH ? value.slice(0, RECEIPT_WIDTH) : value;
    const space = RECEIPT_WIDTH - l.length - v.length;
    if (space <= 0) return `${l} ${v}`.slice(0, RECEIPT_WIDTH);
    return `${l}${' '.repeat(space)}${v}`;
}

function formatItemLine(
    description: string,
    price: string,
): string {
    const maxPrice = 12;
    const p = (price || '').slice(0, maxPrice);
    const maxDesc = RECEIPT_WIDTH - maxPrice;
    const dRaw = (description || '').trim();
    const d =
        dRaw.length > maxDesc ? dRaw.slice(0, Math.max(0, maxDesc - 3)) + '...' : dRaw;

    const left = d.padEnd(maxDesc, ' ');
    const right = p.padStart(maxPrice, ' ');
    return (left + right).slice(0, RECEIPT_WIDTH);
}

export function buildStrukMessage({
    transactionNumber,
    branchName,
    customerName,
    cashierName,
    paymentMethodText,
    formattedTotal,
    formattedReceivedAmount,
    formattedChange,
    formattedAmountDue,
    isCredit,
    items,
    formatRupiah,
}: BuildStrukOptions): string {
    const itemsText =
        items.length > 0
            ? items
                .map((item) => {
                    const qtyText = `${item.quantity} ${item.unit || ''}`.trim();
                    const line1 = formatItemLine(
                        item.product_name,
                        formatRupiah(item.subtotal),
                    );
                    const line2 = formatItemLine(
                        `${qtyText} x ${formatRupiah(item.price)}`,
                        '',
                    );
                    return `${line1}\n${line2}`;
                })
                .join('\n')
            : formatItemLine('-', '');

    const lines = [
        centerText(branchName || 'NAMA TOKO'),
        centerText(`No: ${transactionNumber}`),
        formatLabelValue('Pelanggan', customerName || '-'),
        formatLabelValue('Kasir', cashierName || '-'),
        line('*'),
        centerText('STRUK PEMBAYARAN'),
        line('*'),
        formatItemLine('Deskripsi', 'Harga'),
        line('-'),
        itemsText,
        line('-'),
        formatLabelValue('Total', formattedTotal),
        '',
        formatLabelValue('Tunai', formattedReceivedAmount),
        (isCredit || formattedAmountDue)
            ? formatLabelValue('Sisa', formattedAmountDue || '')
            : formatLabelValue('Kembalian', formattedChange),
        line('*'),
        formatLabelValue('Metode Bayar', paymentMethodText),
        line('*'),
        centerText('TERIMA KASIH'),
    ];

    const content = lines.filter((v) => v !== undefined && v !== null && v !== '').join('\n');
    return `\`\`\`\n${content}\n\`\`\``;
}