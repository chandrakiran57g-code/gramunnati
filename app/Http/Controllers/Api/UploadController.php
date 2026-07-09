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

    /** Base64 JSON uploads — keep under typical cPanel post_max when limits are low. */
    private const BASE64_MAX_BYTES = 12 * 1024 * 1024;

    public function limits(): JsonResponse
    {
        return response()->json([
            'upload_max_filesize' => ini_get('upload_max_filesize') ?: 'unknown',
            'post_max_size' => ini_get('post_max_size') ?: 'unknown',
            'memory_limit' => ini_get('memory_limit') ?: 'unknown',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->assertPhpUploadSucceeded($request);

        $request->validate([
            'file' => ['required', 'file', 'max:512000'],
            'bucket' => 'nullable|string|max:50',
            'path' => 'nullable|string|max:200',
        ]);

        $file = $request->file('file');
        $this->assertAllowedMediaFile($file);

        return response()->json($this->persistUploadedFile(
            $file,
            $request->input('bucket', 'uploads'),
            $request->input('path', '')
        ));
    }

    public function storeBase64(Request $request): JsonResponse
    {
        $data = $request->validate([
            'filename' => 'required|string|max:255',
            'data' => 'required|string',
            'bucket' => 'nullable|string|max:50',
            'path' => 'nullable|string|max:200',
            'mime' => 'nullable|string|max:100',
        ]);

        $raw = base64_decode($data['data'], true);
        if ($raw === false) {
            throw ValidationException::withMessages(['data' => ['Invalid base64 payload.']]);
        }

        if (strlen($raw) > self::BASE64_MAX_BYTES) {
            throw ValidationException::withMessages([
                'data' => ['File too large for base64 upload. Use a smaller video or paste a YouTube link.'],
            ]);
        }

        $filename = basename($data['filename']);
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION) ?: '');
        if (! $this->isAllowedExtension($ext)) {
            throw ValidationException::withMessages([
                'filename' => ['The file must be an image (JPEG, PNG, WebP) or video (MP4, WebM, MOV).'],
            ]);
        }

        $tmp = tempnam(sys_get_temp_dir(), 'cmsr-up-');
        file_put_contents($tmp, $raw);
        $uploaded = new UploadedFile($tmp, $filename, $data['mime'] ?? null, null, true);

        try {
            return response()->json($this->persistUploadedFile(
                $uploaded,
                $data['bucket'] ?? 'uploads',
                $data['path'] ?? ''
            ));
        } finally {
            @unlink($tmp);
        }
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['path' => 'required|string']);
        Storage::disk('public')->delete($request->input('path'));

        return response()->json(['ok' => true]);
    }

    private function persistUploadedFile(UploadedFile $file, string $bucket, string $subPath): array
    {
        $bucket = preg_replace('/[^a-z0-9_-]/', '', $bucket) ?: 'uploads';
        $sub = trim($subPath, '/');
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin');
        $name = time().'-'.Str::random(8).'.'.$ext;
        $dir = $sub ? "uploads/{$bucket}/{$sub}" : "uploads/{$bucket}";
        $stored = $file->storeAs($dir, $name, 'public');
        $url = Storage::disk('public')->url($stored);

        return [
            'path' => $stored,
            'url' => $url,
            'publicUrl' => $url,
        ];
    }

    private function assertAllowedMediaFile(UploadedFile $file): void
    {
        if (! $file->isValid()) {
            throw ValidationException::withMessages([
                'file' => ['The file failed to upload. Try a smaller file or paste a YouTube/video URL.'],
            ]);
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: '');
        if (! $this->isAllowedExtension($ext)) {
            throw ValidationException::withMessages([
                'file' => ['The file must be an image (JPEG, PNG, WebP) or video (MP4, WebM, MOV).'],
            ]);
        }
    }

    private function isAllowedExtension(string $ext): bool
    {
        return in_array($ext, self::VIDEO_EXTENSIONS, true)
            || in_array($ext, self::IMAGE_EXTENSIONS, true);
    }

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
        $contentLength = (int) ($request->server('CONTENT_LENGTH') ?? 0);

        $messages = [
            UPLOAD_ERR_INI_SIZE => "Video exceeds server upload limit (upload_max_filesize={$iniMax}). Compress the file, use a YouTube link, or raise PHP limits in cPanel.",
            UPLOAD_ERR_FORM_SIZE => 'Video exceeds the maximum allowed upload size for this form.',
            UPLOAD_ERR_PARTIAL => 'Upload was interrupted. Please try again.',
            UPLOAD_ERR_NO_FILE => $contentLength > 0
                ? "Server rejected the upload (post_max_size={$postMax}, request was ".round($contentLength / 1048576, 1).'MB). Use a YouTube link or raise PHP limits in cPanel.'
                : 'No file was received. Refresh the page, log in again, or paste a video/YouTube URL instead.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server temp folder missing — contact hosting support.',
            UPLOAD_ERR_CANT_WRITE => 'Server could not write the uploaded file — contact hosting support.',
            UPLOAD_ERR_EXTENSION => 'A server extension blocked this upload.',
        ];

        $hint = $messages[$err] ?? "File upload failed (PHP error {$err}). Server limits: upload_max_filesize={$iniMax}, post_max_size={$postMax}.";

        throw ValidationException::withMessages(['file' => [$hint]]);
    }
}
