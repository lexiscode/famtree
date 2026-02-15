<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\MessagingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessagingController extends Controller
{
    public function __construct(private MessagingService $messagingService)
    {
    }

    /**
     * Display conversations list
     */
    public function conversations(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);

        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== 'undefined';
        });

        if ($search) {
            $filters['search'] = $search;
        }

        $conversations = $this->messagingService->getConversations($filters, $perPage, $page);
        $statistics = $this->messagingService->getStats();

        return Inertia::render('AdminPages/Messaging/Conversations', [
            'conversations' => $conversations,
            'statistics' => $statistics,
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    /**
     * View a specific conversation with messages
     */
    public function viewConversation(Request $request, int $id)
    {
        $perPage = $request->input('per_page', 50);
        $page = $request->input('page', 1);

        $data = $this->messagingService->getConversationDetail($id, $perPage, $page);

        if (!$data) {
            return redirect()->route('admin.messaging.conversations')->with('error', 'Conversation not found');
        }

        return Inertia::render('AdminPages/Messaging/ViewConversation', [
            'conversation' => $data['conversation'],
            'messages' => $data['messages'],
        ]);
    }

    /**
     * Delete a private message
     */
    public function deleteMessage(int $id)
    {
        $success = $this->messagingService->removeMessage($id);

        if ($success) {
            return redirect()->back()->with('success', 'Message deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete message');
    }

    /**
     * Display tree chats list
     */
    public function treeChats(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);

        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== 'undefined';
        });

        if ($search) {
            $filters['search'] = $search;
        }

        $treeChats = $this->messagingService->getTreeChats($filters, $perPage, $page);
        $statistics = $this->messagingService->getStats();

        return Inertia::render('AdminPages/Messaging/TreeChats', [
            'treeChats' => $treeChats,
            'statistics' => $statistics,
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    /**
     * View a specific tree chat with messages
     */
    public function viewTreeChat(Request $request, int $id)
    {
        $perPage = $request->input('per_page', 50);
        $page = $request->input('page', 1);

        $data = $this->messagingService->getTreeChatDetail($id, $perPage, $page);

        if (!$data) {
            return redirect()->route('admin.messaging.treeChats')->with('error', 'Family tree not found');
        }

        return Inertia::render('AdminPages/Messaging/TreeChats', [
            'tree' => $data['tree'],
            'messages' => $data['messages'],
        ]);
    }

    /**
     * Delete a tree chat message
     */
    public function deleteTreeMessage(int $id)
    {
        $success = $this->messagingService->removeTreeMessage($id);

        if ($success) {
            return redirect()->back()->with('success', 'Tree chat message deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete tree chat message');
    }

    /**
     * Display class set chats list
     */
    public function classSetChats(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);

        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== 'undefined';
        });

        if ($search) {
            $filters['search'] = $search;
        }

        $classSetChats = $this->messagingService->getClassSetChats($filters, $perPage, $page);
        $statistics = $this->messagingService->getStats();

        return Inertia::render('AdminPages/Messaging/ClassSetChats', [
            'classSetChats' => $classSetChats,
            'statistics' => $statistics,
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    /**
     * View a specific class set chat with messages
     */
    public function viewClassSetChat(Request $request, int $id)
    {
        $perPage = $request->input('per_page', 50);
        $page = $request->input('page', 1);

        $data = $this->messagingService->getClassSetChatDetail($id, $perPage, $page);

        if (!$data) {
            return redirect()->route('admin.messaging.classSetChats')->with('error', 'Class set not found');
        }

        return Inertia::render('AdminPages/Messaging/ClassSetChats', [
            'classSet' => $data['classSet'],
            'messages' => $data['messages'],
        ]);
    }

    /**
     * Delete a class set message
     */
    public function deleteClassSetMessage(int $id)
    {
        $success = $this->messagingService->removeClassSetMessage($id);

        if ($success) {
            return redirect()->back()->with('success', 'Class set message deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete class set message');
    }
}
