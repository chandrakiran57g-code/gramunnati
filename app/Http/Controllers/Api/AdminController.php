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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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

    /**
     * Send an email reply to a contact-form message from the admin panel.
     */
    public function replyToMessage(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
        ]);

        $contact = ContactMessage::query()->findOrFail($id);

        if (! $contact->email) {
            return response()->json(['message' => 'This message has no email address to reply to.'], 422);
        }

        $sendmailPath = explode(' ', (string) config('mail.mailers.sendmail.path'))[0] ?: '/usr/sbin/sendmail';
        $sendmailAvailable = is_executable($sendmailPath);

        // Shared hosting typically ships sendmail but the .env default is the
        // "log" mailer (emails vanish into the log). Prefer real delivery.
        $mailer = config('mail.default');
        if ($mailer === 'log' && $sendmailAvailable) {
            $mailer = 'sendmail';
        }

        $body = $data['message']
            ."\n\n---\n"
            .'In reply to your message "'.($contact->subject ?: 'Contact enquiry').'" sent on '
            .$contact->created_at?->format('d M Y').":\n"
            .'"'.\Illuminate\Support\Str::limit($contact->message, 500)."\"\n\n"
            .config('mail.from.name').' - '.config('app.url');

        $send = function (string $via) use ($body, $contact, $data): void {
            Mail::mailer($via)->raw($body, function ($mail) use ($contact, $data) {
                $mail->to($contact->email, $contact->name)->subject($data['subject']);
            });
        };

        try {
            $send($mailer);
        } catch (\Throwable $e) {
            report($e);

            // SMTP misconfiguration (e.g. stale password) shouldn't block
            // replies when the host's sendmail can deliver directly.
            if ($mailer !== 'sendmail' && $sendmailAvailable) {
                try {
                    $send($mailer = 'sendmail');
                } catch (\Throwable $fallbackError) {
                    report($fallbackError);

                    return response()->json([
                        'message' => 'Email could not be sent: '.$fallbackError->getMessage(),
                    ], 502);
                }
            } else {
                return response()->json([
                    'message' => 'Email could not be sent: '.$e->getMessage(),
                ], 502);
            }
        }

        $contact->update([
            'status' => 'resolved',
            'reply_subject' => $data['subject'],
            'reply_message' => $data['message'],
            'replied_at' => now(),
        ]);

        return response()->json(['ok' => true, 'mailer' => $mailer, 'data' => $contact->fresh()]);
    }
}
