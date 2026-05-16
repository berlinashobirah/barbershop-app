<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use App\Models\BusinessSetting;

class BookingTicketMail extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $filePath;
    public $settings;

    public function __construct($booking, $filePath)
    {
        $this->booking = $booking;
        $this->filePath = $filePath;
        $this->settings = BusinessSetting::first();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'E-Ticket Booking - The Modern Artisan',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking_ticket',
        );
    }

    public function attachments(): array
    {
        if ($this->filePath && file_exists($this->filePath)) {
            return [
                Attachment::fromPath($this->filePath)
                    ->as('E-Ticket-' . $this->booking->unique_code . '.png')
                    ->withMime('image/png'),
            ];
        }
        
        return []; // Kirim email tanpa lampiran jika gambar tidak sengaja gagal dibuat
    }
}