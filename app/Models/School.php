<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class School extends Model
{
    use SoftDeletes;

    protected $table = 'schools';

    protected $guarded = ['id'];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function requirements(): HasMany
    {
        return $this->hasMany(SchoolRequirement::class);
    }

}