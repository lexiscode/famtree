<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\BlogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function __construct(private BlogService $blogService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $posts = $this->blogService->getAllPosts($perPage, $page);
        return Inertia::render('AdminPages/Blog/Index', ['posts' => $posts, 'statistics' => $this->blogService->getStats(), 'perPage' => $perPage]);
    }

    public function create() { return Inertia::render('AdminPages/Blog/Create'); }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255', 'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string', 'category' => 'nullable|string|max:100',
            'author' => 'nullable|string|max:255', 'is_published' => 'nullable|boolean',
        ]);
        $post = $this->blogService->createPost($data);
        if ($post) { return redirect()->route('admin.blog.index')->with('success', 'Blog post created successfully'); }
        return redirect()->back()->with('error', 'Failed to create blog post')->withInput();
    }

    public function edit(int $id)
    {
        $post = $this->blogService->getPostDetails($id);
        if (!$post) { return redirect()->route('admin.blog.index')->with('error', 'Blog post not found'); }
        return Inertia::render('AdminPages/Blog/Edit', ['post' => $post]);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255', 'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string', 'category' => 'nullable|string|max:100',
            'author' => 'nullable|string|max:255',
        ]);
        $success = $this->blogService->updatePost($id, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Blog post updated' : 'Failed to update');
    }

    public function destroy(int $id)
    {
        $success = $this->blogService->deletePost($id);
        return redirect()->route('admin.blog.index')->with($success ? 'success' : 'error', $success ? 'Blog post deleted' : 'Failed to delete');
    }

    public function publish(int $id)
    {
        $success = $this->blogService->publishPost($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Blog post published' : 'Failed to publish');
    }

    public function unpublish(int $id)
    {
        $success = $this->blogService->unpublishPost($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Blog post unpublished' : 'Failed to unpublish');
    }
}
