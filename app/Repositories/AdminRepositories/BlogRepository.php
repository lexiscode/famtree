<?php
namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\BlogPost;
use Illuminate\Pagination\LengthAwarePaginator;

class BlogRepository
{
    public function getAllPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return BlogPost::orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(int $id): ?BlogPost { return BlogPost::find($id); }

    public function create(array $data): BlogPost { return BlogPost::create($data); }

    public function update(int $id, array $data): ?BlogPost
    {
        $post = BlogPost::find($id);
        if ($post) { $post->update($data); }
        return $post;
    }

    public function delete(int $id): bool
    {
        $post = BlogPost::find($id);
        return $post ? $post->delete() : false;
    }

    public function count(): int { return BlogPost::count(); }
    public function countPublished(): int { return BlogPost::where('is_published', true)->count(); }
}
