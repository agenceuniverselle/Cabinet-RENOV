<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('demandes_devis', function (Blueprint $table) {
            $table->id();
            $table->string('formation');             // Titre ou code de la formation
            $table->string('name');                  // Nom complet
            $table->string('email');                 // Email
            $table->string('phone')->nullable();     // Téléphone
            $table->text('notes')->nullable();       // Remarques
            $table->string('statut')->default('nouveau'); // nouveau | vu | traité
            $table->string('client_ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['email', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_devis');
    }
};
