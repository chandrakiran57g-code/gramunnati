<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UploadController extends Controller
{
    private const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv', '3gp'];

    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg',
        'video/x-m4v', 'video/3gpp', 'audio/mp4', 'application/octet-stream',
    ];

    public function store(Request $request): JsonResponse
    {
        $this->assertPhpUploadSucceeded($request);

        $request->validate([
            'file' => [
                'required',
                'file',
                'max:512000',
                function (string $attribute, $value, \Closure $fail) {
                    if (! $value instanceof UploadedFile) {
                        return;
                    }
                    if (! $value->isValid()) {
                        $fail('The file failed to upload. Try a smaller file or paste a YouTube/video URL.');

                        return;
                    }
                    $mime = strtolower($value->getMimeType() ?: '');
                    $ext = strtolower($value->getClientOriginalExtension() ?: '');
                    $videoExt = in_array($ext, self::VIDEO_EXTENSIONS, true);
                    $imageExt = in_array($ext, self::IMAGE_EXTENSIONS, true);
                    if (! in_array($mime, self::ALLOWED_MIMES, true) && ! $videoExt && ! $imageExt) {
                        $fail('The file must be an image (JPEG, PNG, WebP) or video (MP4, WebM, MOV).');
                    }
                },
            ],
            'bucket' => 'nullable|string|max:50',
            'path' => 'nullable|string|max:200',
        ]);

        $bucket = preg_replace('/[^a-z0-9_-]/', '', $request->input('bucket', 'uploads')) ?: 'uploads';
        $sub = trim($request->input('path', ''), '/');
        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $name = time().'-'.Str::random(8).'.'.$ext;
        $dir = $sub ? "uploads/{$bucket}/{$sub}" : "uploads/{$bucket}";
        $stored = $file->storeAs($dir, $name, 'public');
        $url = Storage::disk('public')->url($stored);

        return response()->json([
            'path' => $stored,
            'url' => $url,
            'publicUrl' => $url,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['path' => 'required|string']);
        Storage::disk('public')->delete($request->input('path'));

        return response()->json(['ok' => true]);
    }

    /**
     * Surface PHP upload limits (common cause of 422 on cPanel) before Laravel validation.
     */
    private function assertPhpUploadSucceeded(Request $request): void
    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            if ($file instanceof UploadedFile && $file->isValid()) {
                return;
            }
        }

        $err = (int) ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE);
        $iniMax = ini_get('upload_max_filesize') ?: 'unknown';
        $postMax = ini_get('post_max_size') ?: 'unknown';

        $messages = [
            UPLOAD_ERR_INI_SIZE => "Video exceeds server upload limit (upload_max_filesize={$iniMax}). Compress the file, use a YouTube link, or ask your host to raise PHP limits.",
            UPLOAD_ERR_FORM_SIZE => 'Video exceeds the maximum allowed upload size for this form.',
            UPLOAD_ERR_PARTIAL => 'Upload was interrupted. Please try again.',
            UPLOAD_ERR_NO_FILE => 'No file was received by the server. Refresh the page, log in again, or paste a video/YouTube URL instead.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server temp folder missing — contact hosting support.',
            UPLOAD_ERR_CANT_WRITE => 'Server could not write the uploaded file — contact hosting support.',
            UPLOAD_ERR_EXTENSION => 'A server extension blocked this upload.',
        ];

        $hint = $messages[$err] ?? "File upload failed (PHP error {$err}). Server limits: upload_max_filesize={$iniMax}, post_max_size={$postMax}.";

        throw ValidationException::withMessages(['file' => [$hint]]);
    }
}
