<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Ticket Booking</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
        }
        .booking-details {
            background-color: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .booking-details h3 {
            margin-top: 0;
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        .detail-value {
            color: #333;
        }
        .ticket-attachment {
            background-color: #e8f5e9;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            text-align: center;
            border: 2px dashed #4caf50;
        }
        .ticket-attachment h4 {
            margin: 0 0 10px 0;
            color: #2e7d32;
        }
        .ticket-attachment p {
            margin: 0;
            font-size: 13px;
            color: #558b2f;
        }
        .instructions {
            background-color: #fff3e0;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 13px;
            color: #666;
            border-left: 4px solid #ff9800;
        }
        .instructions h4 {
            margin-top: 0;
            color: #e65100;
        }
        .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 5px 0;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🎫 E-Ticket Booking</h1>
            <p>The Modern Artisan - Premium Barbershop</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Halo <strong>{{ $booking->guest_name ?? $booking->user->name ?? 'Pelanggan' }}</strong>,
            </div>

            <p>Terima kasih telah melakukan pembayaran. Booking Anda telah dikonfirmasi! 🎉</p>

            <!-- Booking Details -->
            <div class="booking-details">
                <h3>📋 Detail Booking Anda</h3>

                <div class="detail-row">
                    <span class="detail-label">Kode Booking:</span>
                    <span class="detail-value"><strong>{{ $booking->unique_code }}</strong></span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Layanan:</span>
                    <span class="detail-value">{{ $booking->services->first()->name ?? 'Layanan Barbershop' }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Kapster:</span>
                    <span class="detail-value">{{ $booking->barber->name ?? 'Kapster Pilihan' }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Tanggal:</span>
                    <span class="detail-value">{{ date('d M Y', strtotime($booking->booking_date)) }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Waktu:</span>
                    <span class="detail-value">{{ substr($booking->booking_time, 0, 5) }} WIB</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Total Bayar:</span>
                    <span class="detail-value"><strong>Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</strong></span>
                </div>
            </div>

            <!-- Ticket Attachment Notice -->
            <div class="ticket-attachment">
                <h4>✓ Tiket Anda Terlampir</h4>
                <p>Tiket digital (e-ticket) sudah dilampirkan pada email ini. Silakan download dan tunjukkan kepada kami saat tiba.</p>
            </div>

            <!-- Instructions -->
            <div class="instructions">
                <h4>📍 Petunjuk Penting</h4>
                <ul>
                    <li><strong>Tunjukkan tiket</strong> ini pada petugas kasir atau kapster saat tiba di lokasi</li>
                    <li><strong>Datang tepat waktu</strong> - Kami minta Anda datang 5 menit sebelum jam yang dijadwalkan</li>
                    <li><strong>Informasi kontak:</strong> Jika Anda perlu membatalkan atau mengubah jadwal, segera hubungi kami</li>
                </ul>
            </div>

            <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami di:</p>
            <p>
                📱 <strong>WhatsApp:</strong> 0812-3456-7890<br>
                📧 <strong>Email:</strong> info@themodernartisan.com
            </p>

            <p style="margin-top: 30px; color: #666;">Kami tunggu kedatangan Anda! Terima kasih telah mempercayai <strong>The Modern Artisan</strong>. 💈</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© 2026 The Modern Artisan. Semua hak dilindungi.</p>
            <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
        </div>
    </div>
</body>
</html>