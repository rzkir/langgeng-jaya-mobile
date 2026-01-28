import type { TransactionItemPayload } from '@/services/PostTransactions';

type BuildStrukOptions = {
    transactionNumber: string;
    branchName: string;
    customerName: string;
    cashierName: string;
    paymentMethodText: string;
    formattedTotal: string;
    formattedReceivedAmount: string;
    formattedChange: string;
    items: TransactionItemPayload[];
    formatRupiah: (value: number) => string;
};

export function buildStrukMessage({
    transactionNumber,
    branchName,
    customerName,
    cashierName,
    paymentMethodText,
    formattedTotal,
    formattedReceivedAmount,
    formattedChange,
    items,
    formatRupiah,
}: BuildStrukOptions): string {
    const itemsText =
        items.length > 0
            ? items
                .map(
                    (item, index) =>
                        `${index + 1}. ${item.product_name} - ${item.quantity} ${item.unit || ''} x ${formatRupiah(
                            item.price,
                        )} = ${formatRupiah(item.subtotal)}`,
                )
                .join('\n')
            : '-';

    const lines = [
        'Struk Transaksi',
        `No: ${transactionNumber}`,
        `Cabang: ${branchName}`,
        `Customer: ${customerName || '-'}`,
        `Kasir: ${cashierName || '-'}`,
        '',
        'Items:',
        itemsText,
        '',
        `Metode Pembayaran: ${paymentMethodText}`,
        `Total: ${formattedTotal}`,
        `Uang Diterima: ${formattedReceivedAmount}`,
        `Kembalian: ${formattedChange}`,
    ];

    return lines.filter(Boolean).join('\n');
}

