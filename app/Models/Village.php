<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Village extends Model
{
    use SoftDeletes;

    protected $table = 'villages';

    protected $guarded = ['id'];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function mandal(): BelongsTo
    {
        return $this->belongsTo(Mandal::class);
    }

    public function schools(): HasMany
    {
        return $this->hasMany(School::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function needs(): HasMany
    {
        return $this->hasMany(VillageNeed::class);
    }

}