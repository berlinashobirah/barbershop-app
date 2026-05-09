<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class BookingTicketMail extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $filePath;

    public function __construct($booking, $filePath)
    {
        $this->booking = $booking;
        $this->filePath = $filePath;
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
        return [
            Attachment::fromPath($this->filePath)
                ->as('E-Ticket-' . $this->booking->unique_code . '.png')
                ->withMime('image/png'),
        ];
    }
}