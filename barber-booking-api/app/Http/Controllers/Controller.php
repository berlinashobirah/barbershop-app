<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

abstract class Controller
{
    /**
     * Passive cron/scheduler trigger for shared hosting systems
     * ensures that even if system cron is disabled, background processes
     * run every couple of minutes based on user traffic.
     */
    protected function triggerLazyCron()
    {
        try {
            $lockKey = 'lazy_cron_trigger_lock';
            if (!Cache::has($lockKey)) {
                // Set lock for 2 minutes (120s) to prevent consecutive runs from slow down
                Cache::put($lockKey, true, 120);
                
                // Call the auto-cancel scheduler silently
                Artisan::call('booking:auto-cancel');
            }
        } catch (\Exception $e) {
            // Silently fail on any Cache/Artisan exceptions to protect HTTP responses
        }
    }
}
