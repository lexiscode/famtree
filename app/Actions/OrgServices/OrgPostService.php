<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgPostRepository;
use App\Models\OrgModels\OrgPostImage;
use Illuminate\Pagination\LengthAwarePaginator;

class OrgPostService
{
    public function __construct(
        private OrgPostRepository $postRepo,
    ) {}

    public function getPosts(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->postRepo->getByOrganization($organizationId, $perPage);
    }

    public function getPost(int $id): ?\App\Models\OrgModels\OrgPost
    {
        return $this->postRepo->findById($id);
    }

    public function getPostWithComments(int $id): ?\App\Models\OrgModels\OrgPost
    {
        return $this->postRepo->findByIdWithComments($id);
    }

    public function createPost(array $data, array $imageUrls = []): \App\Models\OrgModels\OrgPost
    {
        $post = $this->postRepo->create($data);

        foreach ($imageUrls as $index => $url) {
            OrgPostImage::create([
                'org_post_id' => $post->id,
                'image_url' => $url,
                'order' => $index,
            ]);
        }

        return $post->load('images');
    }

    public function updatePost(int $id, int $organizationId, array $data): ?\App\Models\OrgModels\OrgPost
    {
        $post = $this->postRepo->findById($id);

        if (!$post || $post->organization_id !== $organizationId) {
            return null;
        }

        return $this->postRepo->update($id, $data);
    }

    public function deletePost(int $id, int $organizationId): bool
    {
        $post = $this->postRepo->findById($id);

        if (!$post || $post->organization_id !== $organizationId) {
            return false;
        }

        return $this->postRepo->delete($id);
    }

    public function togglePin(int $id, int $organizationId): ?\App\Models\OrgModels\OrgPost
    {
        $post = $this->postRepo->findById($id);

        if (!$post || $post->organization_id !== $organizationId) {
            return null;
        }

        return $this->postRepo->togglePin($id);
    }
}
