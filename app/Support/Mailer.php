<?php

namespace App\Support;

use Illuminate\Support\Facades\Mail;

class Mailer
{
    /**
     * Resolve the best available mailer. Shared hosting often ships sendmail
     * while the .env default is the "log" mailer, so prefer real delivery when
     * sendmail is present.
     */
    public static function resolveMailer(): string
    {
        $mailer = (string) config('mail.default');

        if ($mailer === 'log') {
            $sendmailPath = explode(' ', (string) config('mail.mailers.sendmail.path'))[0] ?: '/usr/sbin/sendmail';
            if (@is_executable($sendmailPath)) {
                return 'sendmail';
            }
        }

        return $mailer;
    }

    /**
     * Send a plain-text email after the HTTP response is flushed, so the
     * request that triggered it is never blocked waiting on the mail server.
     */
    public static function sendRawDeferred(string $to, string $subject, string $body, ?string $toName = null): void
    {
        $mailer = static::resolveMailer();

        dispatch(function () use ($mailer, $to, $subject, $body, $toName) {
            try {
                Mail::mailer($mailer)->raw($body, function ($mail) use ($to, $subject, $toName) {
                    $mail->to($to, $toName)->subject($subject);
                });
            } catch (\Throwable $e) {
                report($e);
            }
        })->afterResponse();
    }
}
