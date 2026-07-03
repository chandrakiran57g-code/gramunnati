<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DonationReceipt extends Model
{
    protected $table = 'donation_receipts';

    protected $guarded = ['id'];

    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class);
    }

}