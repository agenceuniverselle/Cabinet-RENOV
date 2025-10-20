<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();

            // Champs du formulaire
            $table->string('name', 120);
            $table->string('email');
            $table->string('phone', 30);
            $table->string('company', 150)->nullable();
            $table->string('subject', 180)->nullable();
            $table->text('message');

            // Honeypot et marquage spam
            $table->string('website', 200)->nullable(); // champ honeypot (s'il est rempli => suspect)
            $table->boolean('is_spam')->default(false);

            // Métadonnées utiles
            $table->string('ip_address', 45)->nullable(); // IPv4/IPv6
            $table->text('user_agent')->nullable();
            $table->json('meta')->nullable(); // extensible

            $table->timestamps();
            $table->index(['email', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
