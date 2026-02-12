<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgPostService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostController extends Controller
{
    public function __construct(
        private OrgPostService $postService,
    ) {}

    public function index()
    {
        $orgAccount = Auth::guard('org')->user();

        return Inertia::render('OrgPages/Posts/Index', [
            'posts' => $this->postService->getPosts($orgAccount->organization_id),
        ]);
    }

    public function store(Request $request)
    {
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'content' => 'required_without:voice_url|string|nullable',
            'type' => 'in:text,voice',
            'voice_url' => 'nullable|string',
            'voice_duration' => 'nullable|integer',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        $this->postService->createPost([
            'organization_id' => $orgAccount->organization_id,
            'org_account_id' => $orgAccount->id,
            'type' => $validated['type'] ?? 'text',
            'content' => $validated['content'] ?? null,
            'voice_url' => $validated['voice_url'] ?? null,
            'voice_duration' => $validated['voice_duration'] ?? null,
        ], $validated['images'] ?? []);

        return redirect()->back()->with('success', 'Post created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $post = $this->postService->updatePost($id, $orgAccount->organization_id, $validated);

        if (!$post) {
            return redirect()->back()->with('error', 'Post not found.');
        }

        return redirect()->back()->with('success', 'Post updated successfully.');
    }

    public function destroy(int $id)
    {
        $orgAccount = Auth::guard('org')->user();

        if (!$this->postService->deletePost($id, $orgAccount->organization_id)) {
            return redirect()->back()->with('error', 'Post not found.');
        }

        return redirect()->back()->with('success', 'Post deleted successfully.');
    }

    public function togglePin(int $id)
    {
        $orgAccount = Auth::guard('org')->user();

        $post = $this->postService->togglePin($id, $orgAccount->organization_id);

        if (!$post) {
            return redirect()->back()->with('error', 'Post not found.');
        }

        $message = $post->is_pinned ? 'Post pinned successfully.' : 'Post unpinned successfully.';
        return redirect()->back()->with('success', $message);
    }
}
