<?php
namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\ContactSubmission;
use Illuminate\Pagination\LengthAwarePaginator;

class ContactRepository
{
    public function getAllPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return ContactSubmission::orderByRaw("CASE WHEN is_read = 0 THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(int $id): ?ContactSubmission { return ContactSubmission::find($id); }

    public function update(int $id, array $data): ?ContactSubmission
    {
        $sub = ContactSubmission::find($id);
        if ($sub) { $sub->update($data); }
        return $sub;
    }

    public function delete(int $id): bool
    {
        $sub = ContactSubmission::find($id);
        return $sub ? $sub->delete() : false;
    }

    public function count(): int { return ContactSubmission::count(); }
    public function countUnread(): int { return ContactSubmission::where('is_read', false)->count(); }
}
