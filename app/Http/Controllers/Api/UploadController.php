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
            'file' => 'required|file|max:10240',
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
