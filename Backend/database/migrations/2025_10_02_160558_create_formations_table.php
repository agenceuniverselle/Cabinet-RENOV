// database/migrations/2025_10_02_000000_create_formations_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category');
            $table->enum('certification', ['Certifiante', 'Non certifiante'])->default('Certifiante');
            $table->string('participants')->default('8-15'); // ex "8-15"
            $table->text('description');
            $table->json('objectives'); // tableau de strings
            $table->string('icon_key')->default('BarChart3'); // BarChart3 | GraduationCap | Users | TrendingUp
            $table->enum('language', ['Français', 'Arabe', 'Anglais'])->default('Français');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
