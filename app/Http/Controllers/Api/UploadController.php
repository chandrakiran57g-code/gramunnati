<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:512000',
                function (string $attribute, $value, \Closure $fail) {
                    if (! $value instanceof \Illuminate\Http\UploadedFile) {
                        return;
                    }
                    $allowed = [
                        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
                        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg',
                        'application/octet-stream',
                    ];
                    $mime = $value->getMimeType() ?: '';
                    $ext = strtolower($value->getClientOriginalExtension() ?: '');
                    $videoExt = in_array($ext, ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv'], true);
                    $imageExt = in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'], true);
                    if (! in_array($mime, $allowed, true) && ! $videoExt && ! $imageExt) {
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
}
