<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    foreach (['formations', 'demandes_devis', 'contact_messages', 'categories'] as $table) {
        Schema::table($table, function (Blueprint $table) {
            if (!Schema::hasColumn($table->getTable(), 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn($table->getTable(), 'deleted_by')) {
                $table->string('deleted_by')->nullable();
            }
        });
    }
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('main_tables', function (Blueprint $table) {
            //
        });
    }
};
