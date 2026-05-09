<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PasswordResetCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    public function requestReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Kolom email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        $email = $request->email;
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email tidak terdaftar di sistem kami.'
            ], 404);
        }

        // Hapus kode lama jika ada
        PasswordResetCode::where('email', $email)->delete();

        // Buat kode 6 digit baru
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        PasswordResetCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(15)
        ]);

        try {
            Mail::html("
                <div style='font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;'>
                    <h2 style='color: #eac249; text-align: center; font-family: serif;'>The Modern Artisan</h2>
                    <p>Halo,</p>
                    <p>Kami menerima permintaan untuk menyetel ulang kata sandi akun Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <span style='background-color: #f9f9f9; border: 1px dashed #eac249; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; color: #131313; font-family: monospace;'>{$code}</span>
                    </div>
                    <p style='color: #666; font-size: 12px;'>Kode verifikasi ini berlaku selama 15 menit. Jika Anda tidak meminta penyetelan ulang kata sandi ini, silakan abaikan email ini.</p>
                </div>
            ", function ($message) use ($email) {
                $message->to($email)
                        ->subject('Kode Verifikasi Atur Ulang Kata Sandi - The Modern Artisan');
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email verifikasi. Periksa konfigurasi email server.'
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Kode verifikasi telah berhasil dikirim ke email Anda.'
        ]);
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ], [
            'email.required' => 'Email wajib diisi.',
            'code.required' => 'Kode verifikasi wajib diisi.',
            'code.size' => 'Kode verifikasi harus 6 digit.',
        ]);

        $reset = PasswordResetCode::where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$reset) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode verifikasi yang Anda masukkan salah.'
            ], 400);
        }

        if ($reset->expires_at->isPast()) {
            $reset->delete();
            return response()->json([
                'status' => 'error',
                'message' => 'Kode verifikasi telah kadaluarsa. Silakan minta kode baru.'
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Kode verifikasi cocok.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'email.required' => 'Email wajib diisi.',
            'code.required' => 'Kode verifikasi wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal harus 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $reset = PasswordResetCode::where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$reset || $reset->expires_at->isPast()) {
            if ($reset) $reset->delete();
            return response()->json([
                'status' => 'error',
                'message' => 'Kode verifikasi tidak valid atau telah kadaluarsa.'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan.'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus kode verifikasi dari DB setelah sukses
        $reset->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi Anda telah berhasil diperbarui. Silakan login kembali.'
        ]);
    }
}
