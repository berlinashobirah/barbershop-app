<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Schedule Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #e65c00 0%, #F9D423 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
        .alert-box { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; color: #e65100; font-weight: bold; text-align: center; border-radius: 4px; }
        .booking-details { background-color: #f9f9f9; border-left: 4px solid #e65c00; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #666; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>⏰ Schedule Reminder</h1>
            <p>The Modern Artisan - Starting Soon!</p>
        </div>
        <div class="content">
            <div class="greeting">
                Hello <strong>{{ $booking->guest_name ?? $booking->user->name ?? 'Customer' }}</strong>,
            </div>
            
            <div class="alert-box">
                Your booking is only 1 Hour Away! ✂️
            </div>

            <p>This is an automated message to remind you that your grooming session is about to begin. Please arrive on time at our barbershop.</p>

            <div class="booking-details">
                <div class="detail-row">
                    <span class="detail-label">Booking Code:</span>
                    <span><strong>{{ $booking->unique_code }}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Start Time:</span>
                    <span><strong>{{ substr($booking->booking_time, 0, 5) }} WIB</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Barber:</span>
                    <span>{{ $booking->barber->name ?? 'Available' }}</span>
                </div>
            </div>

            <p style="font-size: 13px; color: #666;">*Note: If you arrive more than 1 hour late from the scheduled time, the booking will be automatically cancelled by our system.</p>
        </div>
        <div class="footer">
            <p>© 2026 The Modern Artisan. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
