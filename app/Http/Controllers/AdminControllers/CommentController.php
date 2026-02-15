<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\PostModerationService;

class CommentController extends Controller
{
    public function __construct(private PostModerationService $postService) {}

    public function destroy(int $id)
    {
        $success = $this->postService->deleteComment($id);
        if ($success) {
            return redirect()->back()->with('success', 'Comment deleted successfully');
        }
        return redirect()->back()->with('error', 'Failed to delete comment');
    }
}
