<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\DemandeDevisController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TrashController;
/*
|--------------------------------------------------------------------------
| AUTH (Sanctum - tokens)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);  // { email, password } -> token
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);      // infos user
        Route::post('logout', [AuthController::class, 'logout']);  // revoke token
    });
});

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/
Route::get('/formations', [FormationController::class, 'index']);
Route::get('/formations/{formation}', [FormationController::class, 'show']);
Route::post('/contact-messages', [ContactMessageController::class, 'store']);
Route::get('/contact-messages', [ContactMessageController::class, 'index']);
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/categories/roots', [CategoryController::class, 'roots']);

// Création depuis le site vitrine (publique + anti-spam)
Route::post('/demandes-devis', [DemandeDevisController::class, 'store'])
    ->name('demandes-devis.store')
    ->middleware('throttle:20,1');

/*
|--------------------------------------------------------------------------
| BACK-OFFICE (protégé)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Formations (CRUD protégé)
    Route::post('/formations', [FormationController::class, 'store']);
    Route::put('/formations/{formation}', [FormationController::class, 'update']);
    Route::delete('/formations/{formation}', [FormationController::class, 'destroy']);

    // Demandes de devis (lecture/MAJ/suppression protégé)
    Route::get('/demandes-devis', [DemandeDevisController::class, 'index']);
    Route::get('/demandes-devis/{demandeDevis}', [DemandeDevisController::class, 'show']);
    Route::patch('/demandes-devis/{demandeDevis}', [DemandeDevisController::class, 'update']);
    Route::delete('/demandes-devis/{demandeDevis}', [DemandeDevisController::class, 'destroy']);

    // Notifications (protégé)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // Categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Contact messages
    Route::get('/contact-messages', [ContactMessageController::class, 'index']);
    Route::get('/contact-messages/{contactMessage}', [ContactMessageController::class, 'show']);
    Route::patch('/contact-messages/{contactMessage}', [ContactMessageController::class, 'update']);
    Route::delete('/contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy']);
    //Corbeille
    Route::get("/trash", [TrashController::class, "index"]);
    Route::post("/trash/{entity}/{id}/restore", [TrashController::class, "restore"]);
    Route::delete("/trash/{id}", [TrashController::class, "destroy"]);
    Route::delete("/trash/empty/all", [TrashController::class, "emptyAll"]);

});

/*
|--------------------------------------------------------------------------
| SETTINGS (publique)
|--------------------------------------------------------------------------
*/
Route::get('/settings', function () {
    return response()->json([
        'app_name' => 'Cabinet RENOV',
        'app_version' => '1.0.0',
        'contact_email' => 'contact@cabinetrenov.com',
        'phone' => '+212 6 12 34 56 78',
        'address' => 'Complexe Bayti Laatik, Immeuble 17 N°9, Beni Touzine – Médina, Tanger',
    ]);
});
