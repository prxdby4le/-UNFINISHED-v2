<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('audio_versions', function (Blueprint $table) {
            $table->uuid('track_id')->nullable()->after('project_id');
            $table->boolean('is_active')->default(true)->after('track_id');
        });

        // Backfill existing rows
        \Illuminate\Support\Facades\DB::table('audio_versions')->orderBy('id')->each(function ($version) {
            \Illuminate\Support\Facades\DB::table('audio_versions')
                ->where('id', $version->id)
                ->update([
                    'track_id' => (string) \Illuminate\Support\Str::uuid(),
                    'is_active' => true,
                ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audio_versions', function (Blueprint $table) {
            $table->dropColumn(['track_id', 'is_active']);
        });
    }
};
