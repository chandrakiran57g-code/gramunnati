<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuccessStory extends Model
{
    use SoftDeletes;

    protected $table = 'success_stories';

    protected $guarded = ['id'];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

}