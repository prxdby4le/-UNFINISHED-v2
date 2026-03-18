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
        'name',
        'original_filename',
        'file_path',
        'format',
        'duration',
        'size',
        'is_master',
        'order',
    ];

    protected $casts = [
        'is_master' => 'boolean',
        'duration' => 'integer',
        'size' => 'integer',
        'order' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }
}
