<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Volunteer extends Model
{
    protected $table = 'volunteers';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(VolunteerActivity::class);
    }

}