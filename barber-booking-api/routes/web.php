<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Tambahkan Fallback Route untuk React SPA
// Ini mencegah error 404 saat user merefresh halaman atau mengakses link langsung dari WA
Route::fallback(function () {
    // Jalur 1: Standar Laravel public_path
    $reactPath = public_path('index.html');
    if (file_exists($reactPath)) {
        return response()->file($reactPath);
    }

    // Jalur 2: Root path (sering terjadi di shared hosting yang memindahkan file public ke root)
    $reactPathRoot = base_path('index.html');
    if (file_exists($reactPathRoot)) {
        return response()->file($reactPathRoot);
    }

    // Jalur 3: Folder public di dalam base_path
    $reactPathPublic = base_path('public/index.html');
    if (file_exists($reactPathPublic)) {
        return response()->file($reactPathPublic);
    }

    // Jalur 4: Global DOCUMENT_ROOT (Ini adalah lokasi paling akurat untuk Root Web Server)
    if (isset($_SERVER['DOCUMENT_ROOT'])) {
        $docRootPath = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/index.html';
        if (file_exists($docRootPath)) {
            return response()->file($docRootPath);
        }
    }

    // Jalur 5: DINAMIS & PALING AKURAT (Folder yang menaungi skrip index.php yang sedang berjalan!)
    if (isset($_SERVER['SCRIPT_FILENAME'])) {
        $scriptFolder = dirname($_SERVER['SCRIPT_FILENAME']);
        $scriptReactPath = rtrim($scriptFolder, '/') . '/index.html';
        if (file_exists($scriptReactPath)) {
            return response()->file($scriptReactPath);
        }
    }

    // Jalur 6: Saudara kembar Folder API (seringkali public_html bersebelahan dengan folder backend)
    $reactSibling = realpath(base_path('../public_html/index.html'));
    if ($reactSibling && file_exists($reactSibling)) {
        return response()->file($reactSibling);
    }

    return response()->json([
        'message' => 'React Index file not found.',
        'debug_paths_searched' => [
            'public_path' => public_path('index.html'),
            'base_path' => base_path('index.html'),
            'base_path_public' => base_path('public/index.html'),
            'document_root' => isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] . '/index.html' : 'N/A',
            'sibling_public_html' => $reactSibling ?: 'N/A',
        ]
    ], 404);
});
