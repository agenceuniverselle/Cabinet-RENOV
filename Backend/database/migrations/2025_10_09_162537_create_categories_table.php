<?php

// database/migrations/2025_10_09_000000_create_categories_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // ex: "Management & Leadership"
            $table->string('slug')->unique();         // ex: "management-leadership"
            $table->string('icon_key')->nullable();   // ex: "Briefcase" (clé d’icône côté front)
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['parent_id', 'sort_order']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('categories');
    }
};
