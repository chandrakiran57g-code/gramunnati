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

    /**
     * A volunteer ID is only issued once the application is approved by an
     * admin (status becomes active/approved). Pending requests carry no ID.
     */
    protected static function booted(): void
    {
        static::creating(function (self $volunteer) {
            if (empty($volunteer->volunteer_code) && static::isApprovedStatus($volunteer->status)) {
                $volunteer->volunteer_code = static::nextVolunteerCode();
            }
        });

        static::updating(function (self $volunteer) {
            if (empty($volunteer->volunteer_code)
                && $volunteer->isDirty('status')
                && static::isApprovedStatus($volunteer->status)) {
                $volunteer->volunteer_code = static::nextVolunteerCode();
            }
        });

        static::updated(function (self $volunteer) {
            if ($volunteer->wasChanged('status')
                && static::isApprovedStatus($volunteer->status)
                && $volunteer->user_id) {
                \App\Support\Notifier::send(
                    (int) $volunteer->user_id,
                    'system',
                    'Welcome aboard!',
                    'We are happy to welcome you as a volunteer.'
                );
            }
        });
    }

    public static function isApprovedStatus(?string $status): bool
    {
        return in_array(strtolower((string) $status), ['active', 'approved'], true);
    }

    /**
     * Next human-friendly volunteer ID: year + zero-padded creation order
     * for that year (e.g. 202601, 202614).
     */
    public static function nextVolunteerCode(): string
    {
        $year = (string) now()->year;
        $last = static::query()
            ->where('volunteer_code', 'like', $year.'%')
            ->orderByDesc('volunteer_code')
            ->value('volunteer_code');

        $seq = 1;
        if ($last && str_starts_with((string) $last, $year)) {
            $suffix = substr((string) $last, strlen($year));
            if (is_numeric($suffix)) {
                $seq = ((int) $suffix) + 1;
            }
        }

        return $year.str_pad((string) $seq, 2, '0', STR_PAD_LEFT);
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