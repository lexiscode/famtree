<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgPostService;
use App\Models\OrgModels\OrgPost;
use App\Models\OrgModels\OrgPostComment;
use App\Models\OrgModels\OrgPostCommentLike;
use App\Models\OrgModels\OrgPostReaction;
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

        $posts = $this->postService->getPosts($orgAccount->organization_id);

        // Format comments with org account context
        $posts->getCollection()->transform(function ($post) use ($orgAccount) {
            $post->formatted_comments = $this->formatCommentsForOrg($post, $orgAccount);
            $post->org_has_reacted = OrgPostReaction::where('org_post_id', $post->id)
                ->where('org_account_id', $orgAccount->id)
                ->exists();
            return $post;
        });

        return Inertia::render('OrgPages/Posts/Index', [
            'posts' => $posts,
        ]);
    }

    public function store(Request $request)
    {
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'content' => 'required|string',
            'type' => 'in:text,voice',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        // Store uploaded images
        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('org-posts/images', 'public');
                $imageUrls[] = '/storage/' . $path;
            }
        }

        $this->postService->createPost([
            'organization_id' => $orgAccount->organization_id,
            'org_account_id' => $orgAccount->id,
            'type' => $validated['type'] ?? 'text',
            'content' => $validated['content'],
        ], $imageUrls);

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

    /**
     * Add a comment to an org post (as the org account)
     */
    public function addComment(Request $request, int $postId)
    {
        try {
            $orgAccount = Auth::guard('org')->user();
            $data = $request->validate([
                'content' => 'required|string|max:1000',
                'parent_comment_id' => 'nullable|integer|exists:org_post_comments,id',
            ]);

            $post = OrgPost::where('id', $postId)
                ->where('organization_id', $orgAccount->organization_id)
                ->firstOrFail();

            // Flatten: if parent is itself a reply, use its parent instead (max 2 levels)
            $parentId = $data['parent_comment_id'] ?? null;
            if ($parentId) {
                $parent = OrgPostComment::find($parentId);
                if ($parent && $parent->parent_comment_id) {
                    $parentId = $parent->parent_comment_id;
                }
            }

            $comment = OrgPostComment::create([
                'org_post_id' => $post->id,
                'org_account_id' => $orgAccount->id,
                'content' => $data['content'],
                'parent_comment_id' => $parentId,
            ]);

            // Update comments count
            $post->update(['comments_count' => $post->comments()->count()]);

            // Load relationships for response
            $comment->load(['orgAccount']);

            // Format the comment for frontend
            $org = $orgAccount->organization;
            $formatted = [
                'id' => $comment->id,
                'uuid' => $comment->uuid,
                'content' => $comment->content,
                'parent_comment_id' => $comment->parent_comment_id,
                'created_at_human' => $comment->created_at->diffForHumans(),
                'likes_count' => 0,
                'replies_count' => 0,
                'replies' => [],
                'org_has_liked' => false,
                'is_org_comment' => true,
                'user' => [
                    'id' => 'org_' . $orgAccount->id,
                    'name' => $org ? $org->name : ($orgAccount->display_name ?? $orgAccount->username),
                    'username' => $orgAccount->username,
                    'profile_image_url' => $org?->logo_url ?? null,
                    'is_org' => true,
                ],
            ];

            return response()->json(['comment' => $formatted], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete a comment (org can delete any comment on their posts)
     */
    public function deleteComment(int $commentId)
    {
        try {
            $orgAccount = Auth::guard('org')->user();
            $comment = OrgPostComment::findOrFail($commentId);

            // Verify comment belongs to a post owned by this org
            $post = OrgPost::where('id', $comment->org_post_id)
                ->where('organization_id', $orgAccount->organization_id)
                ->firstOrFail();

            $comment->delete();

            // Update comments count
            $post->update(['comments_count' => $post->comments()->count()]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Toggle like on a comment (as the org account)
     */
    public function toggleCommentLike(int $commentId)
    {
        try {
            $orgAccount = Auth::guard('org')->user();
            $comment = OrgPostComment::findOrFail($commentId);

            // Verify comment belongs to a post owned by this org
            OrgPost::where('id', $comment->org_post_id)
                ->where('organization_id', $orgAccount->organization_id)
                ->firstOrFail();

            $existing = OrgPostCommentLike::where('comment_id', $commentId)
                ->where('org_account_id', $orgAccount->id)
                ->first();

            if ($existing) {
                $existing->delete();
                $comment->decrement('likes_count');
            } else {
                OrgPostCommentLike::create([
                    'comment_id' => $commentId,
                    'org_account_id' => $orgAccount->id,
                ]);
                $comment->increment('likes_count');
            }

            return response()->json([
                'liked' => !$existing,
                'likes_count' => $comment->fresh()->likes_count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Toggle reaction on a post (as the org account)
     */
    public function toggleReaction(int $postId)
    {
        try {
            $orgAccount = Auth::guard('org')->user();

            $post = OrgPost::where('id', $postId)
                ->where('organization_id', $orgAccount->organization_id)
                ->firstOrFail();

            $existing = OrgPostReaction::where('org_post_id', $postId)
                ->where('org_account_id', $orgAccount->id)
                ->first();

            if ($existing) {
                $existing->delete();
            } else {
                OrgPostReaction::create([
                    'org_post_id' => $postId,
                    'org_account_id' => $orgAccount->id,
                    'reaction_type' => 'like',
                ]);
            }

            // Update reactions count
            $post->update(['reactions_count' => $post->reactions()->count()]);

            return response()->json([
                'reacted' => !$existing,
                'reactions_count' => $post->fresh()->reactions_count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Format comments for the org dashboard view
     */
    private function formatCommentsForOrg(OrgPost $post, $orgAccount): array
    {
        $org = $orgAccount->organization;
        $orgName = $org ? $org->name : ($orgAccount->display_name ?? $orgAccount->username);
        $orgLogoUrl = $org?->logo_url ?? null;

        $topLevelComments = $post->comments->filter(fn($c) => is_null($c->parent_comment_id));

        return $topLevelComments->map(function ($comment) use ($orgAccount, $orgName, $orgLogoUrl) {
            return $this->formatSingleComment($comment, $orgAccount, $orgName, $orgLogoUrl);
        })->values()->toArray();
    }

    private function formatSingleComment($comment, $orgAccount, string $orgName, ?string $orgLogoUrl): array
    {
        $isOrgComment = $comment->org_account_id !== null;

        // Determine commenter info
        if ($isOrgComment) {
            $commenter = [
                'id' => 'org_' . $comment->org_account_id,
                'name' => $orgName,
                'username' => $orgAccount->username,
                'profile_image_url' => $orgLogoUrl,
                'is_org' => true,
            ];
        } else {
            $user = $comment->user;
            $commenter = [
                'id' => $user ? $user->id : null,
                'name' => $user ? trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')) : 'Unknown User',
                'username' => $user?->username ?? 'unknown',
                'profile_image_url' => $user?->profile_image_url ?? null,
                'is_org' => false,
            ];
        }

        // Check if org has liked this comment
        $orgHasLiked = OrgPostCommentLike::where('comment_id', $comment->id)
            ->where('org_account_id', $orgAccount->id)
            ->exists();

        $replies = $comment->replies->map(function ($reply) use ($orgAccount, $orgName, $orgLogoUrl) {
            return $this->formatSingleComment($reply, $orgAccount, $orgName, $orgLogoUrl);
        })->values()->toArray();

        return [
            'id' => $comment->id,
            'uuid' => $comment->uuid,
            'content' => $comment->content,
            'parent_comment_id' => $comment->parent_comment_id,
            'created_at_human' => $comment->created_at->diffForHumans(),
            'likes_count' => $comment->likes_count ?? 0,
            'replies_count' => count($replies),
            'replies' => $replies,
            'org_has_liked' => $orgHasLiked,
            'is_org_comment' => $isOrgComment,
            'user' => $commenter,
        ];
    }
}
