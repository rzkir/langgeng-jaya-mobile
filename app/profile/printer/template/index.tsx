import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatIDR as formatIDRHelper } from '@/lib/FormatPrice';

const STORAGE_KEY = process.env.EXPO_PUBLIC_PRINTER_CUSTUM as string;

/**
 * Default template settings
 */
export const DEFAULT_TEMPLATE: TemplateSettings = {
  storeName: "TOKO KASIR",
  storeAddress: "",
  storePhone: "",
  storeWebsite: "",
  footerMessage: "Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan",
  showFooter: true,
  logoUrl: "",
  showLogo: false,
  logoWidth: 200,
  logoHeight: 80,
};

/**
 * Load template settings from storage
 */
export const loadTemplateSettings = async (): Promise<TemplateSettings | null> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Generate ESC/POS receipt text for printer
 * @param props Transaction data and items
 * @returns ESC/POS formatted string
 */
export const generateReceiptText = async (props: PrintTemplateProps): Promise<string> => {
  // Load custom settings or use defaults
  const customSettings = await loadTemplateSettings();

  const {
    transaction,
    items,
    storeName = customSettings?.storeName || props.storeName || 'TOKO KASIR',
    storeAddress = customSettings?.storeAddress || props.storeAddress,
    storePhone = customSettings?.storePhone || props.storePhone,
    storeWebsite = customSettings?.storeWebsite || props.storeWebsite,
    footerMessage = customSettings?.footerMessage || props.footerMessage,
    showFooter = customSettings?.showFooter !== undefined ? customSettings.showFooter : (props.showFooter !== undefined ? props.showFooter : true),
  } = props;

  const formatIDR = (amount: number) => formatIDRHelper(amount);
  const formatTime = (dateInput: string | number | Date) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ESC/POS Commands
  const ESC = '\x1B';
  const INIT = `${ESC}@`; // Initialize printer
  const ALIGN_LEFT = `${ESC}\x61\x00`; // Left align
  const ALIGN_CENTER = `${ESC}\x61\x01`; // Center align
  const BOLD_ON = `${ESC}\x45\x01`; // Bold on
  const BOLD_OFF = `${ESC}\x45\x00`; // Bold off
  const LARGER_TEXT = `${ESC}\x21\x30`; // Larger text (double height + double width)
  const NORMAL_TEXT = `${ESC}\x21\x00`; // Normal text
  const DOUBLE_WIDTH = `${ESC}\x21\x10`; // Double width
  const CUT = '\x1D\x56\x41\x03'; // Cut paper

  const receiptParts: string[] = [];

  // Initialize printer
  receiptParts.push(INIT);

  // Header with store info
  receiptParts.push(
    [
      ALIGN_CENTER,
      LARGER_TEXT, // Larger text (double height + double width)
      `${storeName}\n`,
      NORMAL_TEXT, // Normal text
      storeAddress ? `${storeAddress}\n` : '',
      storePhone ? `Telp: ${storePhone}\n` : '',
      storeWebsite ? `${storeWebsite}\n` : '',
      '\n',
      '================================\n', // 32 karakter untuk 80mm (disesuaikan)
      DOUBLE_WIDTH, // Double width
      'STRUK PEMBELIAN\n',
      NORMAL_TEXT, // Normal text
      ALIGN_LEFT, // Left alignment
    ].filter(Boolean).join('')
  );

  // Transaction Info
  const date = new Date(transaction.created_at || Date.now());
  let transactionInfo = `No.: ${transaction.transaction_number || 'N/A'}\n`;

  // Customer Info (if exists)
  if (transaction.customer_name) {
    transactionInfo += `Pelanggan: ${transaction.customer_name}\n`;
  }

  transactionInfo += `Tgl: ${date.toLocaleDateString('id-ID')}\n` +
    `Jam: ${formatTime(date)}\n` +
    '================================\n'; // 32 karakter

  receiptParts.push(transactionInfo);

  // Items Header - disesuaikan untuk 80mm (32 karakter efektif, lebih kompak)
  receiptParts.push(
    'Nama Barang      Qty   Harga\n' + // Lebih kompak
    '================================\n' // 32 karakter
  );

  // Items - disesuaikan untuk 80mm, lebih kompak
  items.forEach((item) => {
    const itemName = item.product?.name || 'Produk';
    const quantity = item.quantity.toString();
    // Format price using app settings - remove "Rp " prefix and adjust for receipt format
    const formattedPrice = formatIDR(item.subtotal).replace('Rp ', '');
    const price = `Rp.${formattedPrice}`;

    let itemLines = '';
    // Untuk 80mm, nama barang lebih kompak (16 karakter)
    if (itemName.length > 16) {
      itemLines += `${itemName.slice(0, 16)}\n`;
      itemLines += `${itemName.slice(16).padEnd(16)}`;
    } else {
      itemLines += itemName.padEnd(16);
    }
    itemLines += `${quantity.padStart(3)} `; // Kurang 1 spasi
    itemLines += `${price.padStart(10)}\n`; // Lebih kompak untuk harga (10 karakter)

    receiptParts.push(itemLines);
  });

  // Calculate totals
  const subtotal = transaction.subtotal || 0;
  const transactionDiscount = transaction.discount || 0; // Discount tambahan di level transaksi

  // Calculate total discount from all items (percentage per item)
  const totalItemsDiscount = items.reduce((sum, item) => {
    const basePrice = item.price || 0;
    const qty = item.quantity || 0;
    // Get discount from product if available, otherwise use item discount
    const productDiscount = item.product?.discount ?? item.discount ?? 0;
    const discountPercent = Number(productDiscount) || 0;
    const discountAmountPerUnit = (basePrice * discountPercent) / 100;
    return sum + discountAmountPerUnit * qty;
  }, 0);

  // Total discount = discount from items + transaction level discount
  const totalDiscount = totalItemsDiscount + transactionDiscount;
  const total = transaction.total || 0;

  // Summary with totals - disesuaikan untuk 80mm (32 karakter)
  // Format prices using app settings - remove "Rp " prefix for receipt format
  const formattedSubtotal = formatIDR(subtotal).replace('Rp ', '');
  const formattedDiscount = formatIDR(totalDiscount).replace('Rp ', '');
  const formattedTotal = formatIDR(total).replace('Rp ', '');

  receiptParts.push(
    [
      '================================\n', // 32 karakter
      BOLD_ON, // Bold on
      `SUBTOTAL   : Rp ${formattedSubtotal}\n`,
      totalDiscount > 0 ? `DISKON     : Rp ${formattedDiscount}\n` : '',
      `TOTAL      : Rp ${formattedTotal}\n`,
      BOLD_OFF, // Bold off
      '================================\n', // 32 karakter
    ].filter(Boolean).join('')
  );

  // Footer - menggunakan custom settings
  if (showFooter) {
    receiptParts.push(ALIGN_CENTER); // Center alignment
    receiptParts.push('\n');

    if (footerMessage) {
      // Split footer message by newline (support both \n and actual newlines)
      const footerLines = footerMessage.replace(/\\n/g, '\n').split('\n');
      footerLines.forEach((line) => {
        if (line.trim()) {
          receiptParts.push(`${line.trim()}\n`);
        }
      });
    } else {
      // Default footer jika tidak ada custom message
      receiptParts.push('Terima kasih atas kunjungan Anda\n');
      receiptParts.push('SELAMAT BERBELANJA KEMBALI\n');
      receiptParts.push('\n');
      receiptParts.push('* Barang yang sudah dibeli *\n');
      receiptParts.push('* tidak dapat ditukar/dikembalikan *\n');
    }
  }

  // Paper feed and cut
  receiptParts.push('\n\n\n'); // Paper feed
  receiptParts.push(CUT); // Cut paper

  // Combine all parts
  let receipt = receiptParts.join('');

  try {
    receipt = receipt
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 0 && code <= 255) {
          return char;
        }

        return ' ';
      })
      .join('');
  } catch {
    // ignore encoding validation error
  }

  return receipt;
};

/**
 * Generate HTML receipt for PDF export
 * @param props Transaction data and items
 * @returns HTML string for PDF generation
 */
export const generateReceiptHTML = async (props: PrintTemplateProps): Promise<string> => {
  // Load custom settings or use defaults
  const customSettings = await loadTemplateSettings();

  const {
    transaction,
    items,
    storeName = customSettings?.storeName || 'TOKO KASIR',
    storeAddress = customSettings?.storeAddress,
    storePhone = customSettings?.storePhone,
    storeWebsite = customSettings?.storeWebsite,
    footerMessage = customSettings?.footerMessage,
    showFooter = customSettings?.showFooter !== false,
    logoUrl = customSettings?.logoUrl,
    showLogo = customSettings?.showLogo !== false,
    logoWidth = customSettings?.logoWidth || 200,
    logoHeight = customSettings?.logoHeight || 80,
  } = props;

  const formatIDR = (amount: number) => formatIDRHelper(amount);
  const formatTime = (dateInput: string | number | Date) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const date = new Date(transaction.created_at || Date.now());
  const formattedDate = date.toLocaleDateString('id-ID');
  const formattedTime = formatTime(date);

  // Payment method label sesuai types/transactions.d.ts: PaymentMethod = 'cash' | 'kasbon'
  const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      cash: 'Tunai',
      kasbon: 'Kasbon',
    };
    return labels[method] || method;
  };
  const paymentMethodLabel = getPaymentMethodLabel(transaction.payment_method || 'cash');

  // Calculate totals
  const subtotal = transaction.subtotal || 0;
  const transactionDiscount = transaction.discount || 0; // Discount tambahan di level transaksi

  // Calculate total discount from all items (percentage per item)
  const totalItemsDiscount = items.reduce((sum, item) => {
    const basePrice = item.price || 0;
    const qty = item.quantity || 0;
    // Get discount from product if available, otherwise use item discount
    const productDiscount = item.product?.discount ?? item.discount ?? 0;
    const discountPercent = Number(productDiscount) || 0;
    const discountAmountPerUnit = (basePrice * discountPercent) / 100;
    return sum + discountAmountPerUnit * qty;
  }, 0);

  // Total discount = discount from items + transaction level discount
  const totalDiscount = totalItemsDiscount + transactionDiscount;
  const total = transaction.total || 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
          background: #fff;
          color: #111827;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
        }
        .header h1 {
          font-size: 20px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 8px;
        }
        .header .address {
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .header .phone {
          font-size: 10px;
          color: #6b7280;
        }
        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 15px 0;
        }
        .divider-thick {
          border-top: 2px solid #e5e7eb;
          margin: 15px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .label {
          color: #6b7280;
          font-weight: normal;
        }
        .value {
          font-weight: 600;
          color: #111827;
          text-align: right;
        }
        .items-table {
          width: 100%;
          margin: 20px 0;
          border-collapse: collapse;
        }
        .items-table thead {
          border-bottom: 2px solid #e5e7eb;
        }
        .items-table th {
          text-align: left;
          padding: 10px 0;
          font-size: 10px;
          color: #6b7280;
          font-weight: 600;
        }
        .items-table th:first-child {
          width: 57%;
        }
        .items-table th:nth-child(2) {
          text-align: center;
          width: 8%;
        }
        .items-table th:last-child {
          text-align: right;
          width: 35%;
        }
        .items-table td {
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 11px;
        }
        .items-table td:first-child {
          color: #111827;
          font-weight: 500;
        }
        .items-table td:nth-child(2) {
          text-align: center;
          color: #6b7280;
        }
        .items-table td:last-child {
          text-align: right;
          color: #111827;
          font-weight: 600;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
        }
        .summary-label {
          color: #6b7280;
        }
        .summary-value {
          font-weight: 600;
          color: #111827;
        }
        .total-row {
          font-size: 15px;
          font-weight: bold;
          color: #059669;
          margin-top: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 10px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${showLogo && logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: ${logoWidth}px; height: ${logoHeight}px; max-width: 100%; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; object-fit: contain;" />` : ''}
        <h1>${storeName}</h1>
        ${storeAddress ? `<div class="address">${storeAddress}</div>` : ''}
        ${storePhone ? `<div class="phone">Telp: ${storePhone}</div>` : ''}
        ${storeWebsite ? `<div class="phone">${storeWebsite}</div>` : ''}
      </div>
      
      <div class="divider-thick"></div>
      <div style="text-align: center; font-size: 15px; font-weight: bold; margin: 15px 0;">
        STRUK PEMBELIAN
      </div>
      <div class="divider-thick"></div>
      
      <div class="info-row">
        <span class="label">No.:</span>
        <span class="value">${transaction.transaction_number || 'N/A'}</span>
      </div>
      ${transaction.customer_name ? `
      <div class="info-row">
        <span class="label">Pelanggan:</span>
        <span class="value">${transaction.customer_name}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="label">Tgl:</span>
        <span class="value">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="label">Jam:</span>
        <span class="value">${formattedTime}</span>
      </div>
      
      <div class="divider-thick"></div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Nama Barang</th>
            <th>Qty</th>
            <th>Harga</th>
          </tr>
        </thead>
        <tbody>
          ${items
      .map(
        (item) => `
            <tr>
              <td>${item.product?.name || 'Produk'}</td>
              <td>${item.quantity}</td>
              <td>${formatIDR(item.subtotal).replace('Rp ', 'Rp.')}</td>
            </tr>
          `
      )
      .join('')}
        </tbody>
      </table>
      
      <div class="divider-thick"></div>
      
      <div class="summary-row" style="font-weight: bold;">
        <span class="summary-label">SUBTOTAL:</span>
        <span class="summary-value">${formatIDR(subtotal)}</span>
      </div>
      ${totalDiscount > 0 ? `
      <div class="summary-row" style="font-weight: bold;">
        <span class="summary-label">DISKON:</span>
        <span class="summary-value">${formatIDR(totalDiscount)}</span>
      </div>
      ` : ''}
      
      <div class="summary-row total-row">
        <span>TOTAL:</span>
        <span>${formatIDR(total)}</span>
      </div>
      
      <div class="divider-thick"></div>
      
      <div class="info-row">
        <span class="label">Metode Pembayaran:</span>
        <span class="value">${paymentMethodLabel}</span>
      </div>
      
      <div class="divider-thick"></div>
      
      ${showFooter ? `
      <div class="footer">
        ${footerMessage ? footerMessage.replace(/\\n/g, '\n').split('\n').filter(line => line.trim()).map(line => `<p>${line.trim()}</p>`).join('') : `
        <p>Terima kasih atas kunjungan Anda</p>
        <p><strong>SELAMAT BERBELANJA KEMBALI</strong></p>
        <p>* Barang yang sudah dibeli *</p>
        <p>* tidak dapat ditukar/dikembalikan *</p>
        `}
      </div>
      ` : ''}
    </body>
    </html>
  `;
};

/**
 * Default export for convenience
 */
export default {
  generateReceiptText,
  generateReceiptHTML,
};