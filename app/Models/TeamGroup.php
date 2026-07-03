<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamGroup extends Model
{
    protected $table = 'team_groups';

    protected $guarded = ['id'];

    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

}