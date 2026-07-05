<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\DonationReceipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'donor_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:10',
            'target_type' => 'nullable|string|max:50',
            'village_id' => 'nullable|integer',
            'school_id' => 'nullable|integer',
            'project_id' => 'nullable|integer',
            'message' => 'nullable|string',
            'is_anonymous' => 'nullable|boolean',
            'payment_status' => 'nullable|string|max:30',
            'payment_gateway' => 'nullable|string|max:50',
            'receipt_number' => 'nullable|string|max:100',
            'transaction_id' => 'nullable|string|max:100',
        ]);

        $data['currency'] = 'INR';
        $data['target_type'] = $data['target_type'] ?? 'general';
        $data['payment_status'] = $data['payment_status'] ?? 'pending';
        $data['user_id'] = $request->user()?->id;
        $data['donated_at'] = now();

        $donation = Donation::query()->create($data);

        if ($donation->payment_status === 'success') {
            $this->ensureReceipt($donation);
        }

        return response()->json($donation->load('receipts'), 201);
    }

    private function ensureReceipt(Donation $donation): DonationReceipt
    {
        $number = $donation->receipt_number ?: ('RCP-'.now()->format('Y').'-'.str_pad((string) $donation->id, 5, '0', STR_PAD_LEFT));

        if (! $donation->receipt_number) {
            $donation->update(['receipt_number' => $number]);
        }

        return DonationReceipt::query()->firstOrCreate(
            ['donation_id' => $donation->id],
            ['receipt_number' => $number]
        );
    }

    public function mine(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $donations = Donation::query()
            ->with(['village:id,village_name', 'school:id,school_name', 'project:id,project_name', 'receipts'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($donations);
    }
}
