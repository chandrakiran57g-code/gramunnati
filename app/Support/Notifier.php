<?php

namespace App\Support;

use App\Models\Notification;

class Notifier
{
    /**
     * Create an in-app notification for a single user. Fails soft so a
     * notification error never breaks the primary action that triggered it.
     */
    public static function send(int $userId, string $type, string $title, string $message, ?string $link = null): void
    {
        try {
            Notification::query()->create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'link' => $link,
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Notify every user following a village.
     *
     * @param  array<int, int>  $extraExcludeUserIds
     */
    public static function notifyVillageFollowers(int $villageId, string $type, string $title, string $message, ?string $link = null): void
    {
        static::fanOut(
            \App\Models\VillageFollower::query()->where('village_id', $villageId)->pluck('user_id')->all(),
            $type,
            $title,
            $message,
            $link
        );
    }

    /**
     * Notify every user following a school.
     */
    public static function notifySchoolFollowers(int $schoolId, string $type, string $title, string $message, ?string $link = null): void
    {
        static::fanOut(
            \App\Models\SchoolFollower::query()->where('school_id', $schoolId)->pluck('user_id')->all(),
            $type,
            $title,
            $message,
            $link
        );
    }

    /**
     * @param  array<int, int>  $userIds
     */
    private static function fanOut(array $userIds, string $type, string $title, string $message, ?string $link): void
    {
        foreach (array_unique($userIds) as $userId) {
            if ($userId) {
                static::send((int) $userId, $type, $title, $message, $link);
            }
        }
    }
}
