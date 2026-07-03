<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamMember extends Model
{
    protected $table = 'team_members';

    protected $guarded = ['id'];

    public function teamGroup(): BelongsTo
    {
        return $this->belongsTo(TeamGroup::class);
    }

}