# Email Ticket Attachment - Setup & Troubleshooting Guide

## ✅ Apa yang Sudah Diperbaiki

### 1. **Email Template** 
- ✅ Dibuat template HTML profesional di `resources/views/emails/booking_ticket.blade.php`
- ✅ Menampilkan detail booking lengkap (kode, tanggal, jam, kapster, harga)
- ✅ Petunjuk penggunaan ticket untuk pelanggan

### 2. **Email Sending Logic**
- ✅ Email otomatis dikirim saat pembayaran berhasil (status = 'paid')
- ✅ Dikonfigurasi di dua tempat:
  - `handleMidtransNotification()` - saat webhook dari Midtrans
  - `verifyAndUpdatePayment()` - saat verifikasi manual dari frontend

### 3. **Ticket Image Generation**
- ✅ PNG ticket otomatis dihasilkan menggunakan GD Library
- ✅ Menyimpan ke `storage/app/public/tickets/`
- ✅ Dilampirkan ke email secara otomatis

### 4. **SMTP Configuration**
- ✅ Diperbarui `.env` dengan setting Gmail yang benar:
  ```
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.gmail.com
  MAIL_PORT=587          ← Diubah dari 465 ke 587
  MAIL_USERNAME=berlinashbrh@gmail.com
  MAIL_PASSWORD=B3rl1n4shbrh
  MAIL_ENCRYPTION=tls    ← Diubah dari ssl ke tls
  MAIL_FROM_ADDRESS="berlinashbrh@gmail.com"
  MAIL_FROM_NAME="The Modern Artisan"
  ```

---

## 🧪 Cara Testing Email

### Test 1: Menggunakan PHP Artisan Tinker
```bash
php artisan tinker

# Ambil booking terakhir
$booking = \App\Models\Booking::latest()->first();

# Load relasi
$booking->load(['barber', 'services', 'user']);

# Kirim email manual
Mail::to('test@example.com')->send(new \App\Mail\BookingTicketMail($booking, storage_path('app/public/tickets/test.png')));
```

### Test 2: Testing dari API
1. Buat booking baru melalui endpoint `/bookings/guest`
2. Proses pembayaran melalui `/bookings/{id}/payment`
3. Tunggu notifikasi webhook dari Midtrans atau call `/bookings/{id}/verify-payment`
4. Email seharusnya terkirim otomatis

### Test 3: Check Logs
```bash
# Lihat log email
tail -f storage/logs/laravel.log | grep -i email
tail -f storage/logs/laravel.log | grep -i "tiket"
```

---

## 🔍 Troubleshooting

### Masalah 1: "SMTP Connection Refused"
**Solusi:**
```env
MAIL_PORT=587           # Bukan 465
MAIL_ENCRYPTION=tls     # Bukan ssl
```
- Port 465 = SSL (old style)
- Port 587 = TLS (new standard for Gmail)

### Masalah 2: "Invalid Login Credentials"
**Cek:**
- Username: `berlinashbrh@gmail.com` (bukan nama domain custom)
- Password: Pastikan password benar atau gunakan App Password jika 2FA enabled
- Gmail security: Enable "Less secure app access" atau gunakan App Password

**Untuk Gmail dengan 2FA:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate app-specific password
3. Gunakan app password di `.env` bukan password akun biasa

### Masalah 3: Email Terkirim tapi Tidak Ada Lampiran
**Cek:**
- Folder `storage/app/public/tickets/` exists?
  ```bash
  mkdir -p storage/app/public/tickets
  chmod 755 storage/app/public/tickets
  ```
- Symlink ada?
  ```bash
  php artisan storage:link
  ```

### Masalah 4: "Class BookingTicketMail not found"
**Solusi:**
```bash
# Update autoloader
composer dump-autoload

# Pastikan file ada di:
# app/Mail/BookingTicketMail.php
```

### Masalah 5: Ticket Image Tidak Terbuat
**Cek GD Library:**
```bash
php -m | grep gd    # Linux/Mac
php -r "phpinfo();" | grep -i gd  # Check if enabled

# Atau di php.ini buka extension:
; extension=php_gd.dll  →  extension=php_gd.dll
```

---

## 📧 Email Sending Flow

```
Payment Success
    ↓
handleMidtransNotification() atau verifyAndUpdatePayment()
    ↓
payment_status = 'paid' ?
    ↓ YES
sendBookingConfirmationEmail($booking)
    ↓
getOrGenerateTicketImage($booking)
    ├─ Cari file ticket yang sudah ada
    └─ Jika tidak ada, generate baru (GD Library)
    ↓
Mail::to($email)->send(new BookingTicketMail($booking, $filePath))
    ├─ Email template: resources/views/emails/booking_ticket.blade.php
    ├─ Attachment: PNG ticket
    └─ From: berlinashbrh@gmail.com
```

---

## 📝 Manual Email Testing

Untuk test email tanpa melalui payment flow:

```php
// File: routes/api.php atau dibuat endpoint baru

Route::get('/test-email', function() {
    $booking = \App\Models\Booking::latest()->first();
    $booking->load(['barber', 'services', 'user']);
    
    // Generate ticket
    $filePath = storage_path('app/public/tickets/test_ticket.png');
    
    // Kirim email
    \Illuminate\Support\Facades\Mail::to('berlinashbrh@gmail.com')->send(
        new \App\Mail\BookingTicketMail($booking, $filePath)
    );
    
    return 'Email sent!';
});
```

---

## 🛠️ Environment Checklist

- [ ] `.env` sudah diupdate dengan SMTP config benar
- [ ] `php artisan config:clear` sudah dijalankan
- [ ] `php artisan cache:clear` sudah dijalankan
- [ ] `php artisan storage:link` sudah dijalankan
- [ ] Folder `storage/app/public/tickets/` exists & writable
- [ ] GD Library enabled di PHP
- [ ] Gmail app password configured (jika 2FA)
- [ ] Firewall/ISP tidak block port 587

---

## 📞 Contact Info yang Bisa Disesuaikan

Edit di file: `resources/views/emails/booking_ticket.blade.php`

```html
<p>
    📱 <strong>WhatsApp:</strong> 0812-3456-7890<br>
    📧 <strong>Email:</strong> info@themodernartisan.com
</p>
```

---

## 🔐 Security Notes

⚠️ **Jangan commit password ke Git!**
- Use `.env.example` untuk template
- Add `.env` ke `.gitignore`
- Untuk production, gunakan environment variables dari hosting

---

Jika masih ada error, cek file:
- `storage/logs/laravel.log` - Error logs
- `BookingTicketMail.php` - Mail class
- `resources/views/emails/booking_ticket.blade.php` - Email template
