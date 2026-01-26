<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'audio_version_id',
        'user_id',
        'content',
        'timestamp_seconds',
    ];

    protected $casts = [
        'timestamp_seconds' => 'integer',
    ];

    public function audioVersion(): BelongsTo
    {
        return $this->belongsTo(AudioVersion::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
