<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\Partner;
use App\Models\Profile;
use App\Models\Project;
use App\Models\School;
use App\Models\User;
use App\Models\Village;
use App\Models\Volunteer;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function dashboardStats(): JsonResponse
    {
        $totalDonationAmount = (float) Donation::query()->where('payment_status', 'success')->sum('amount');

        $stats = [
            'totalVillages' => Village::query()->count(),
            'totalSchools' => School::query()->count(),
            'totalProjects' => Project::query()->count(),
            'totalDonations' => Donation::query()->where('payment_status', 'success')->count(),
            'totalDonationAmount' => $totalDonationAmount,
            'totalVolunteers' => Volunteer::query()->count(),
            'totalMembers' => Profile::query()->count(),
            'totalPartners' => Partner::query()->count(),
            'totalMessages' => ContactMessage::query()->count(),
            'unreadMessages' => ContactMessage::query()->where('status', 'new')->count(),
            'totalUsers' => User::query()->count(),
            // snake_case aliases
            'users' => User::query()->count(),
            'villages' => Village::query()->count(),
            'schools' => School::query()->count(),
            'projects' => Project::query()->count(),
            'donations' => $totalDonationAmount,
            'volunteers' => Volunteer::query()->count(),
            'messages' => ContactMessage::query()->count(),
            'new_messages' => ContactMessage::query()->where('status', 'new')->count(),
        ];

        return response()->json($stats);
    }
}
