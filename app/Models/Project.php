<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'cover_path',
        'is_private',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
        ];
    }

    protected $appends = ['cover_url'];

    public function getCoverUrlAttribute(): ?string
    {
        if (!$this->cover_path) {
            return null;
        }
        return app(\App\Services\StorageService::class)->getFileUrl($this->cover_path);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function audioVersions(): HasMany
    {
        /** @var \Illuminate\Database\Eloquent\Relations\HasMany $relation */
        $relation = $this->hasMany(AudioVersion::class)->where('is_active', true)->orderBy('order', 'asc')->orderBy('created_at', 'asc');
        return $relation;
    }

    public function allAudioVersions(): HasMany
    {
        /** @var \Illuminate\Database\Eloquent\Relations\HasMany $relation */
        $relation = $this->hasMany(AudioVersion::class)->orderBy('order', 'asc')->orderBy('created_at', 'asc');
        return $relation;
    }

    public function shares(): HasMany
    {
        return $this->hasMany(ProjectShare::class);
    }

    public function activeShares(): HasMany
    {
        /** @var \Illuminate\Database\Eloquent\Relations\HasMany $relation */
        $relation = $this->shares()->where('is_active', true);
        return $relation;
    }
}