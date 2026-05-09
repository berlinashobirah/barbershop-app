<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/admin/schedule', 'GET');
$request->headers->set('Accept', 'application/json');
$request->setUserResolver(function() { 
    return \App\Models\User::where('role', 'admin')->first(); 
});
$response = $app->make(Illuminate\Contracts\Http\Kernel::class)->handle($request);
echo $response->getContent();
