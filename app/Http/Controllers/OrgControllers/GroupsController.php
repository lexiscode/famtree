<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\ClassSetMember;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GroupsController extends Controller
{
    use AuthorizesOrgActions;
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
                        $memberCount = ClassSetMember::where('class_set_id', $classSet->id)->count();
                        $deptData['classSets'][] = [
                            'id' => $classSet->id,
                            'name' => $classSet->name,
                            'year' => $classSet->year,
                            'memberCount' => $memberCount,
                            'isActive' => $classSet->is_active,
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
}
