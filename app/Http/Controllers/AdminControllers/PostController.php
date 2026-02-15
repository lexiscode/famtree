<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\PostModerationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    public function __construct(private PostModerationService $postService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '' && $v !== 'undefined');

        if ($search) {
            $posts = $this->postService->searchPosts($search, $perPage, $page);
        } elseif (!empty($filters)) {
            $filters['search'] = $search;
            $posts = $this->postService->getFilteredPosts($filters, $perPage, $page);
        } else {
            $posts = $this->postService->getAllPosts($perPage, $page);
        }

        return Inertia::render('AdminPages/Content/Posts', [
            'posts' => $posts,
            'statistics' => $this->postService->getPostStats(),
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    public function show(int $id)
    {
        $post = $this->postService->getPostDetails($id);
        if (!$post) {
            return redirect()->route('admin.content.posts')->with('error', 'Post not found');
        }
        return Inertia::render('AdminPages/Content/PostDetail', ['post' => $post]);
    }

    public function destroy(int $id)
    {
        $success = $this->postService->deletePost($id);
        if ($success) {
            return redirect()->route('admin.content.posts')->with('success', 'Post deleted successfully');
        }
        return redirect()->back()->with('error', 'Failed to delete post');
    }

    public function flag(int $id) { return redirect()->back()->with('success', 'Post flagged for review'); }
    public function unflag(int $id) { return redirect()->back()->with('success', 'Post unflagged'); }

    public function orgPosts(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $orgPosts = $this->postService->getAllOrgPosts($perPage, $page);
        return Inertia::render('AdminPages/Content/OrgPosts', ['orgPosts' => $orgPosts, 'perPage' => $perPage]);
    }
}
