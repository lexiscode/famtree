<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\PostService;
use App\Http\Requests\GuestRequests\AuthAccessRequests\CreatePostRequest;

class PostController extends Controller
{
    public function __construct(
        private PostService $postService,
    ) {}

    /**
     * Display My Stories page
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        $posts = $this->postService->getUserPosts($user->id, 20);

        return Inertia::render('GuestPages/AuthAccessPages/Stories/MyStories', [
            'posts' => $posts,
            'postCount' => count($posts),
        ]);
    }

    /**
     * Store a new post
     */
    public function store(CreatePostRequest $request)
    {
        try {
            $user = auth()->user();

            $validated = $request->validated();

            $post = $this->postService->createPost($user, $validated);

            return back()->with('success', 'Post created successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display a single post
     */
    public function show(int $postId)
    {
        try {
            $post = $this->postService->getPost($postId);
            $comments = $this->postService->getPostComments($postId);
            $reactions = $this->postService->getPostReactions($postId);

            return Inertia::render('GuestPages/AuthAccessPages/Stories/ShowPost', [
                'post' => $post,
                'comments' => $comments,
                'reactions' => $reactions,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Post not found']);
        }
    }

    /**
     * Update a post
     */
    public function update(int $postId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'title' => 'nullable|string|max:255',
                'content' => 'nullable|string|max:5000',
            ]);

            $post = $this->postService->updatePost($postId, $user, $data);

            return back()->with('success', 'Post updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete a post
     */
    public function destroy(int $postId)
    {
        try {
            $user = auth()->user();
            $this->postService->deletePost($postId, $user);

            return back()->with('success', 'Post deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Add a comment to a post
     */
    public function addComment(int $postId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'content' => 'required|string|max:1000',
            ]);

            $comment = $this->postService->addComment($postId, $user, $data['content']);

            return response()->json(['comment' => $comment], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete a comment
     */
    public function deleteComment(int $commentId)
    {
        try {
            $user = auth()->user();
            $this->postService->deleteComment($commentId, $user);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Add a reaction to a post
     */
    public function addReaction(int $postId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'reaction_type' => 'required|in:like,love,haha,wow,sad,angry',
            ]);

            $reaction = $this->postService->addReaction($postId, $user, $data['reaction_type']);

            return response()->json(['reaction' => $reaction], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove a reaction from a post
     */
    public function removeReaction(int $postId)
    {
        try {
            $user = auth()->user();
            $this->postService->removeReaction($postId, $user);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Search posts
     */
    public function search()
    {
        try {
            $user = auth()->user();
            $query = request()->input('q', '');

            if (strlen($query) < 2) {
                return response()->json(['posts' => []]);
            }

            $posts = $this->postService->searchPosts($user->id, $query);

            return response()->json(['posts' => $posts]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Filter posts by type
     */
    public function filterByType()
    {
        try {
            $user = auth()->user();
            $type = request()->input('type', 'text');

            if (!in_array($type, ['text', 'voice'])) {
                return response()->json(['error' => 'Invalid type'], 400);
            }

            $posts = $this->postService->filterPostsByType($user->id, $type);

            return response()->json(['posts' => $posts]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
