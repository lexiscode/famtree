<?php
namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\ContactRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class ContactService
{
    public function __construct(private ContactRepository $repository) {}

    public function getAllSubmissions(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllPaginated($perPage, $page)->through(fn($s) => [
            'id' => $s->id, 'name' => $s->name, 'email' => $s->email, 'subject' => $s->subject,
            'message' => \Illuminate\Support\Str::limit($s->message, 100),
            'is_read' => $s->is_read, 'replied_at' => $s->replied_at?->format('Y-m-d H:i:s'),
            'created_at' => $s->created_at->format('Y-m-d'), 'created_at_formatted' => $s->created_at->diffForHumans(),
        ]);
    }

    public function getDetails(int $id): ?array
    {
        $sub = $this->repository->find($id);
        if (!$sub) return null;
        return [
            'id' => $sub->id, 'name' => $sub->name, 'email' => $sub->email, 'subject' => $sub->subject,
            'message' => $sub->message, 'is_read' => $sub->is_read,
            'replied_at' => $sub->replied_at?->format('Y-m-d H:i:s'),
            'created_at' => $sub->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function markAsRead(int $id): bool
    {
        try {
            $sub = $this->repository->update($id, ['is_read' => true]);
            return $sub !== null;
        } catch (\Exception $e) { return false; }
    }

    public function deleteSubmission(int $id): bool
    {
        try {
            $this->logActivity('delete_contact', 'ContactSubmission', $id, "Deleted contact submission #{$id}");
            return $this->repository->delete($id);
        } catch (\Exception $e) { return false; }
    }

    public function getStats(): array
    {
        return ['total' => $this->repository->count(), 'unread' => $this->repository->countUnread()];
    }

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            AdminActivityLog::create(['admin_id' => $admin?->id, 'action_type' => $actionType, 'resource_type' => $resourceType, 'resource_id' => $resourceId, 'description' => $description, 'ip_address' => request()->ip(), 'user_agent' => request()->userAgent()]);
        } catch (\Exception $e) {}
    }
}
