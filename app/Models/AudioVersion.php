<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AudioVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'track_id',
        'name',
        'original_filename',
        'file_path',
        'format',
        'duration',
        'size',
        'is_master',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_master' => 'boolean',
        'duration' => 'integer',
        'size' => 'integer',
        'order' => 'integer',
    ];

    protected $appends = ['url'];

    public function getUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        return app(\App\Services\StorageService::class)->getFileUrl($this->file_path);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }
}
