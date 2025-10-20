<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('demandes_devis', function (Blueprint $table) {
            // statut texte simple, par défaut "En attente"
            $table->string('status')->default('En attente')->index();
            // infos de traitement
            $table->timestamp('processed_at')->nullable()->index();
            $table->string('processed_by')->nullable();
            $table->text('traitement_notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('demandes_devis', function (Blueprint $table) {
            $table->dropColumn(['status', 'processed_at', 'processed_by', 'traitement_notes']);
        });
    }
};
