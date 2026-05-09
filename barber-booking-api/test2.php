<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = \App\Models\User::where('role', 'admin')->first();

$request = Illuminate\Http\Request::create('/api/admin/barbers/1/status', 'PATCH', ['status' => 'Absent']);
$request->headers->set('Accept', 'application/json');
$request->setUserResolver(function () use ($admin) {
    return $admin;
});

$response = $app->make(Illuminate\Contracts\Http\Kernel::class)->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo $response->getContent() . "\n";
