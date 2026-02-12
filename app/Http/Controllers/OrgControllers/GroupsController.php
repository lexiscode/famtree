<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\ClassSet;
use App\Models\GuestModels\ClassSetMember;
use App\Models\GuestModels\GroupElection;
use App\Models\GuestModels\GroupMemberRemoval;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\GroupRemovalRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\GroupElectionRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GroupsController extends Controller
{
    use AuthorizesOrgActions;

    public function __construct(
        private ClassSetRepository $classSetRepository,
        private ClassSetMessageRepository $messageRepository,
        private GroupRemovalRepository $removalRepository,
        private GroupElectionRepository $electionRepository
    ) {
    }

    public function index()
    {
        $this->authorizeOrg('manage-groups');
        $orgAccount = Auth::guard('org')->user();
        $org = Organization::with('faculties.departments.classSets')
            ->find($orgAccount->organization_id);

        $hierarchy = [];
        if ($org) {
            foreach ($org->faculties as $faculty) {
                $facultyData = [
                    'id' => $faculty->id,
                    'name' => $faculty->name,
                    'departments' => [],
                ];

                foreach ($faculty->departments as $dept) {
                    $deptData = [
                        'id' => $dept->id,
                        'name' => $dept->name,
                        'classSets' => [],
                    ];

                    foreach ($dept->classSets as $classSet) {
                        $members = ClassSetMember::where('class_set_id', $classSet->id)
                            ->with('user:id,uuid,first_name,last_name,username,profile_image')
                            ->get();

                        $deptData['classSets'][] = [
                            'id' => $classSet->id,
                            'uuid' => $classSet->uuid,
                            'name' => $classSet->name,
                            'year' => $classSet->year,
                            'memberCount' => $members->count(),
                            'isActive' => $classSet->is_active,
                            'members' => $members->map(fn($m) => [
                                'id' => $m->user->id,
                                'uuid' => $m->user->uuid,
                                'first_name' => $m->user->first_name,
                                'last_name' => $m->user->last_name,
                                'username' => $m->user->username,
                                'profile_image' => $m->user->profile_image_url,
                                'is_admin' => $m->is_admin,
                                'is_muted' => $m->is_muted,
                            ])->toArray(),
                        ];
                    }

                    $facultyData['departments'][] = $deptData;
                }

                $hierarchy[] = $facultyData;
            }
        }

        return Inertia::render('OrgPages/Groups/Index', [
            'hierarchy' => $hierarchy,
        ]);
    }

    /**
     * Force remove a member from a class set
     */
    public function forceRemoveMember(Request $request, int $classSetId, int $userId)
    {
        $this->authorizeOrg('manage-groups');

        $classSet = $this->classSetRepository->find($classSetId);
        if (!$classSet) {
            return back()->with('error', 'Group not found.');
        }

        if (!$this->classSetRepository->isMember($classSetId, $userId)) {
            return back()->with('error', 'User is not a member of this group.');
        }

        // Cancel any pending removal for this user
        $pendingRemoval = $this->removalRepository->getPendingRemovalForUser($classSetId, $userId);
        if ($pendingRemoval) {
            $this->removalRepository->setMuteStatus($classSetId, $userId, false);
            $this->removalRepository->updateRemovalStatus($pendingRemoval->id, 'cancelled');
        }

        // Remove the member
        $this->classSetRepository->removeMember($classSetId, $userId);

        // Create system message
        $this->messageRepository->createMessage(
            $classSetId,
            null,
            '🔒 A member has been removed by organization staff.'
        );

        return back()->with('success', 'Member removed successfully.');
    }

    /**
     * Appoint a member as admin
     */
    public function appointAdmin(Request $request, int $classSetId, int $userId)
    {
        $this->authorizeOrg('manage-groups');

        $classSet = $this->classSetRepository->find($classSetId);
        if (!$classSet) {
            return back()->with('error', 'Group not found.');
        }

        if (!$this->classSetRepository->isMember($classSetId, $userId)) {
            return back()->with('error', 'User is not a member of this group.');
        }

        $this->classSetRepository->updateAdminStatus($classSetId, $userId, true);

        // Cancel active election if appointing fills all 3 admin spots
        $adminCount = $this->electionRepository->getAdminCount($classSetId);
        if ($adminCount >= 3) {
            $activeElection = $this->electionRepository->getActiveElection($classSetId);
            if ($activeElection) {
                $this->electionRepository->cancelElection($activeElection->id);
            }
        }

        $this->messageRepository->createMessage(
            $classSetId,
            null,
            '🔒 An admin has been appointed by organization staff.'
        );

        return back()->with('success', 'Admin appointed successfully.');
    }

    /**
     * Remove admin status from a member
     */
    public function removeAdmin(Request $request, int $classSetId, int $userId)
    {
        $this->authorizeOrg('manage-groups');

        $classSet = $this->classSetRepository->find($classSetId);
        if (!$classSet) {
            return back()->with('error', 'Group not found.');
        }

        if (!$this->classSetRepository->isMember($classSetId, $userId)) {
            return back()->with('error', 'User is not a member of this group.');
        }

        $this->classSetRepository->updateAdminStatus($classSetId, $userId, false);

        $this->messageRepository->createMessage(
            $classSetId,
            null,
            '🔒 An admin has been removed by organization staff.'
        );

        return back()->with('success', 'Admin removed successfully.');
    }
}
