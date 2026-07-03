<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class District extends Model
{
    protected $table = 'districts';

    protected $guarded = ['id'];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function mandals(): HasMany
    {
        return $this->hasMany(Mandal::class);
    }

}