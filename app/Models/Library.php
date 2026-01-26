<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Library extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'audio_version_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function audioVersion(): BelongsTo
    {
        return $this->belongsTo(AudioVersion::class);
    }
}
