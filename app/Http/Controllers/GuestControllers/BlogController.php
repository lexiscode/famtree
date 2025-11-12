<?php

namespace App\Http\Controllers\GuestControllers;

use App\Actions\GuestServices\BlogService;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function __construct(private BlogService $blogService) {}

    /**
     * Display the blog listing page
     */
    public function index(): Response
    {
        $search = request()->query('search');
        $category = request()->query('category');
        $sortBy = request()->query('sort', 'latest');

        $posts = $this->blogService->getAllPosts(
            search: $search,
            category: $category,
            sortBy: $sortBy
        );

        $categories = $this->blogService->getCategories();
        $recentPosts = $this->blogService->getRecentPosts(5);
        $popularPosts = $this->blogService->getPopularPosts(5);

        return Inertia::render('GuestPages/Blog/Index', [
            'posts' => [
                'data' => $posts->items(),
                'meta' => [
                    'current_page' => $posts->currentPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                    'last_page' => $posts->lastPage(),
                    'from' => $posts->firstItem(),
                    'to' => $posts->lastItem(),
                ],
                'links' => $posts->links(),
            ],
            'categories' => $categories,
            'recentPosts' => $recentPosts,
            'popularPosts' => $popularPosts,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'sort' => $sortBy,
            ],
        ]);
    }

    /**
     * Display a single blog post
     */
    public function show(string $slug): Response
    {
        $post = $this->blogService->getPostWithRelated($slug);

        if (!$post) {
            abort(404, 'Blog post not found');
        }

        return Inertia::render('GuestPages/Blog/Show', [
            'post' => $post,
            'relatedPosts' => $post['related'],
            'categories' => $this->blogService->getCategories(),
        ]);
    }
}
