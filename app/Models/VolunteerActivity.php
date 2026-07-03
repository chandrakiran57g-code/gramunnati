<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VolunteerActivity extends Model
{
    protected $table = 'volunteer_activities';

    protected $guarded = ['id'];

    public function volunteer(): BelongsTo
    {
        return $this->belongsTo(Volunteer::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

}