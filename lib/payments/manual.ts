// Info rekening/QRIS untuk metode manual transfer.
// Ganti dengan data rekening/QRIS milik Carlo Tech.
export const MANUAL_PAYMENT_INFO = {
  bankName: "BCA",
  accountNumber: "1234567890",
  accountHolder: "Arman Dion Sakti",
  qrisImageUrl: "", // isi URL gambar QRIS statis kalau ada
  instructions:
    "Transfer sesuai nominal exact di atas, lalu upload bukti transfer. Admin akan konfirmasi & kirim akun via WhatsApp maksimal 1x24 jam.",
};

export function generateOrderCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CT-${rand}`;
}
