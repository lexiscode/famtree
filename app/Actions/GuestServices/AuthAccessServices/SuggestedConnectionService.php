<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\SuggestedConnectionRepository;
use App\Models\GuestModels\User;
use Illuminate\Validation\ValidationException;

class SuggestedConnectionService
{
    public function __construct(
        private SuggestedConnectionRepository $suggestedConnectionRepository,
        private RelationshipInferenceService $inferenceService
    ) {
    }

    /**
     * Get suggested family members for a user
     * Returns paginated list of suggested connections with inferred relationships
     */
    public function getSuggestedMembers(int $userId, ?string $relationshipFilter = null, int $page = 1, int $perPage = 20): array
    {
        // Validate user exists
        $user = User::findOrFail($userId);

        // Get second-degree connections
        $secondDegreeUsers = $this->suggestedConnectionRepository->getSecondDegreeConnections($userId);

        // Get connected user IDs to filter them out
        $connectedUserIds = $this->suggestedConnectionRepository->getConnectedUserIds($userId);
        $pendingRequestUserIds = $this->suggestedConnectionRepository->getPendingRequestUserIds($userId);
        $blockedUserIds = $this->suggestedConnectionRepository->getBlockedUserIds($userId);

        // Filter out already connected, pending, and blocked users
        $suggestedUsers = $secondDegreeUsers->filter(function ($suggestedUser) use ($userId, $connectedUserIds, $pendingRequestUserIds, $blockedUserIds) {
            return $suggestedUser->id !== $userId
                && !in_array($suggestedUser->id, $connectedUserIds)
                && !in_array($suggestedUser->id, $pendingRequestUserIds)
                && !in_array($suggestedUser->id, $blockedUserIds);
        });

        // Infer relationships and format results
        $suggestedWithInference = $suggestedUsers->map(function ($suggestedUser) use ($userId) {
            $inference = $this->inferenceService->inferRelationship($userId, $suggestedUser->id);

            return [
                'id' => $suggestedUser->id,
                'name' => $suggestedUser->first_name . ' ' . $suggestedUser->last_name,
                'first_name' => $suggestedUser->first_name,
                'last_name' => $suggestedUser->last_name,
                'username' => $suggestedUser->username,
                'profile_image_url' => $suggestedUser->profile_image_url,
                'email' => $suggestedUser->email,
                'phone' => $suggestedUser->phone,
                'bio' => $suggestedUser->bio,
                'gender' => $suggestedUser->gender,
                'inferred_relationship' => [
                    'type' => $inference['type'] ?? null,
                    'label' => $inference['label'] ?? null,
                    'text' => $inference ? $this->inferenceService->getInferenceText($inference['label']) : null,
                    'confidence' => $inference['confidence'] ?? 0,
                    'path_length' => $inference['path_length'] ?? null,
                ],
            ];
        });

        // Filter by relationship type if provided
        if ($relationshipFilter) {
            $suggestedWithInference = $suggestedWithInference->filter(function ($suggestion) use ($relationshipFilter) {
                return $suggestion['inferred_relationship']['type'] === $relationshipFilter;
            });
        }

        // Sort by confidence (higher first) and then by name
        $suggestedWithInference = $suggestedWithInference
            ->sortByDesc(function ($suggestion) {
                return $suggestion['inferred_relationship']['confidence'];
            })
            ->values();

        // Paginate the results
        $total = $suggestedWithInference->count();
        $offset = ($page - 1) * $perPage;
        $paginated = $suggestedWithInference->slice($offset, $perPage)->values();

        return [
            'suggestions' => $paginated->toArray(),
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total),
        ];
    }

    /**
     * Get unique relationship types available in suggestions
     */
    public function getAvailableRelationshipTypes(int $userId): array
    {
        $secondDegreeUsers = $this->suggestedConnectionRepository->getSecondDegreeConnections($userId);

        // Get connected user IDs to filter them out
        $connectedUserIds = $this->suggestedConnectionRepository->getConnectedUserIds($userId);
        $pendingRequestUserIds = $this->suggestedConnectionRepository->getPendingRequestUserIds($userId);
        $blockedUserIds = $this->suggestedConnectionRepository->getBlockedUserIds($userId);

        // Filter users
        $suggestedUsers = $secondDegreeUsers->filter(function ($suggestedUser) use ($userId, $connectedUserIds, $pendingRequestUserIds, $blockedUserIds) {
            return $suggestedUser->id !== $userId
                && !in_array($suggestedUser->id, $connectedUserIds)
                && !in_array($suggestedUser->id, $pendingRequestUserIds)
                && !in_array($suggestedUser->id, $blockedUserIds);
        });

        // Get unique relationship types
        $types = $suggestedUsers
            ->map(function ($suggestedUser) use ($userId) {
                $inference = $this->inferenceService->inferRelationship($userId, $suggestedUser->id);
                return [
                    'type' => $inference['type'] ?? null,
                    'label' => $inference['label'] ?? null,
                ];
            })
            ->unique('type')
            ->filter(function ($item) {
                return $item['type'] !== null;
            })
            ->values()
            ->toArray();

        return $types;
    }

    /**
     * Get count of suggested members
     */
    public function getSuggestedMembersCount(int $userId): int
    {
        $secondDegreeUsers = $this->suggestedConnectionRepository->getSecondDegreeConnections($userId);

        // Get IDs to exclude
        $connectedUserIds = $this->suggestedConnectionRepository->getConnectedUserIds($userId);
        $pendingRequestUserIds = $this->suggestedConnectionRepository->getPendingRequestUserIds($userId);
        $blockedUserIds = $this->suggestedConnectionRepository->getBlockedUserIds($userId);

        // Count filtered users
        return $secondDegreeUsers->filter(function ($suggestedUser) use ($userId, $connectedUserIds, $pendingRequestUserIds, $blockedUserIds) {
            return $suggestedUser->id !== $userId
                && !in_array($suggestedUser->id, $connectedUserIds)
                && !in_array($suggestedUser->id, $pendingRequestUserIds)
                && !in_array($suggestedUser->id, $blockedUserIds);
        })->count();
    }

    /**
     * Search suggested members by name or username
     */
    public function searchSuggestedMembers(int $userId, string $query, ?string $relationshipFilter = null, int $page = 1, int $perPage = 20): array
    {
        // Get all suggestions first
        $allSuggestions = $this->getSuggestedMembers($userId, $relationshipFilter, 1, 10000);

        // Filter by search query
        $filtered = collect($allSuggestions['suggestions'])
            ->filter(function ($suggestion) use ($query) {
                $query = strtolower($query);
                return strpos(strtolower($suggestion['name']), $query) !== false
                    || strpos(strtolower($suggestion['username']), $query) !== false
                    || strpos(strtolower($suggestion['email'] ?? ''), $query) !== false;
            })
            ->values();

        // Paginate
        $total = $filtered->count();
        $offset = ($page - 1) * $perPage;
        $paginated = $filtered->slice($offset, $perPage)->values();

        return [
            'suggestions' => $paginated->toArray(),
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total),
        ];
    }
}
