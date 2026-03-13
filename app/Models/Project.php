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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function audioVersions(): HasMany
    {
        return $this->hasMany(AudioVersion::class)->orderBy('order', 'asc')->orderBy('created_at', 'asc');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(ProjectShare::class);
    }

    public function activeShares(): HasMany
    {
        return $this->shares()->where('is_active', true);
    }
}
