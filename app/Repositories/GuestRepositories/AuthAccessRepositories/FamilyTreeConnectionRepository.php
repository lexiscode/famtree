<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\FamilyTreeConnection;
use Illuminate\Database\Eloquent\Collection;

class FamilyTreeConnectionRepository
{
    /**
     * Send a connection request from one tree to another
     *
     * @param int $requesterTreeId
     * @param int $recipientTreeId
     * @param int $requestedByUserId
     * @param string|null $message
     * @return FamilyTreeConnection
     */
    public function sendRequest(
        int $requesterTreeId,
        int $recipientTreeId,
        int $requestedByUserId,
        ?string $message = null
    ): FamilyTreeConnection {
        return FamilyTreeConnection::create([
            'requester_tree_id' => $requesterTreeId,
            'recipient_tree_id' => $recipientTreeId,
            'status' => 'pending',
            'requested_at' => now(),
            'requested_by_user_id' => $requestedByUserId,
            'message' => $message,
        ]);
    }

    /**
     * Accept a connection request
     *
     * @param int $connectionId
     * @param int $acceptedByUserId
     * @return FamilyTreeConnection
     */
    public function acceptRequest(int $connectionId, int $acceptedByUserId): FamilyTreeConnection
    {
        $connection = FamilyTreeConnection::findOrFail($connectionId);
        $connection->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'accepted_by_user_id' => $acceptedByUserId,
        ]);

        return $connection->fresh();
    }

    /**
     * Decline a connection request
     *
     * @param int $connectionId
     * @return FamilyTreeConnection
     */
    public function declineRequest(int $connectionId): FamilyTreeConnection
    {
        $connection = FamilyTreeConnection::findOrFail($connectionId);
        $connection->update(['status' => 'declined']);

        return $connection->fresh();
    }

    /**
     * Get pending connection requests received by a tree
     *
     * @param int $recipientTreeId
     * @return Collection
     */
    public function getPendingRequests(int $recipientTreeId): Collection
    {
        return FamilyTreeConnection::where('recipient_tree_id', $recipientTreeId)
            ->where('status', 'pending')
            ->with(['requesterTree', 'requestedBy'])
            ->orderBy('requested_at', 'desc')
            ->get();
    }

    /**
     * Get pending connection requests sent by a tree
     *
     * @param int $requesterTreeId
     * @return Collection
     */
    public function getSentRequests(int $requesterTreeId): Collection
    {
        return FamilyTreeConnection::where('requester_tree_id', $requesterTreeId)
            ->where('status', 'pending')
            ->with(['recipientTree', 'requestedBy'])
            ->orderBy('requested_at', 'desc')
            ->get();
    }

    /**
     * Get accepted connections for a tree
     *
     * @param int $treeId
     * @return Collection
     */
    public function getAcceptedConnections(int $treeId): Collection
    {
        return FamilyTreeConnection::where(function ($query) use ($treeId) {
            $query->where('requester_tree_id', $treeId)
                  ->orWhere('recipient_tree_id', $treeId);
        })
        ->where('status', 'accepted')
        ->with(['requesterTree', 'recipientTree', 'requestedBy', 'acceptedBy'])
        ->orderBy('accepted_at', 'desc')
        ->get();
    }

    /**
     * Check if a connection exists between two trees (pending or accepted)
     *
     * @param int $tree1Id
     * @param int $tree2Id
     * @return bool
     */
    public function connectionExists(int $tree1Id, int $tree2Id): bool
    {
        return FamilyTreeConnection::where(function ($query) use ($tree1Id, $tree2Id) {
            $query->where(function ($q) use ($tree1Id, $tree2Id) {
                $q->where('requester_tree_id', $tree1Id)
                  ->where('recipient_tree_id', $tree2Id);
            })
            ->orWhere(function ($q) use ($tree1Id, $tree2Id) {
                $q->where('requester_tree_id', $tree2Id)
                  ->where('recipient_tree_id', $tree1Id);
            });
        })
        ->whereIn('status', ['pending', 'accepted'])
        ->exists();
    }

    /**
     * Get a specific connection by ID
     *
     * @param int $connectionId
     * @return FamilyTreeConnection
     */
    public function find(int $connectionId): FamilyTreeConnection
    {
        return FamilyTreeConnection::with(['requesterTree', 'recipientTree', 'requestedBy', 'acceptedBy'])
            ->findOrFail($connectionId);
    }

    /**
     * Get connection between two specific trees
     *
     * @param int $tree1Id
     * @param int $tree2Id
     * @return FamilyTreeConnection|null
     */
    public function getConnectionBetweenTrees(int $tree1Id, int $tree2Id): ?FamilyTreeConnection
    {
        return FamilyTreeConnection::where(function ($query) use ($tree1Id, $tree2Id) {
            $query->where(function ($q) use ($tree1Id, $tree2Id) {
                $q->where('requester_tree_id', $tree1Id)
                  ->where('recipient_tree_id', $tree2Id);
            })
            ->orWhere(function ($q) use ($tree1Id, $tree2Id) {
                $q->where('requester_tree_id', $tree2Id)
                  ->where('recipient_tree_id', $tree1Id);
            });
        })
        ->first();
    }
}
