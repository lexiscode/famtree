<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\OrganizationCategory;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\Faculty;
use App\Models\GuestModels\Department;
use App\Models\GuestModels\ClassSet;

class OrganizationRepository
{
    /**
     * Get all active organization categories with organization counts
     */
    public function getAllCategories()
    {
        return OrganizationCategory::active()
            ->ordered()
            ->withCount(['organizations' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get();
    }

    /**
     * Get a category by slug
     */
    public function getCategoryBySlug(string $slug): ?OrganizationCategory
    {
        return OrganizationCategory::where('slug', $slug)
            ->active()
            ->first();
    }

    /**
     * Get organizations by category ID
     */
    public function getOrganizationsByCategory(int $categoryId)
    {
        return Organization::where('category_id', $categoryId)
            ->active()
            ->orderBy('name')
            ->get();
    }

    /**
     * Get organization by slug with faculties eager loaded
     */
    public function getOrganizationBySlug(string $slug): ?Organization
    {
        return Organization::where('slug', $slug)
            ->active()
            ->with(['faculties' => function ($query) {
                $query->where('is_active', true)->orderBy('name');
            }, 'galleries' => function ($query) {
                $query->orderBy('display_order');
            }, 'category'])
            ->first();
    }

    /**
     * Get faculties by organization ID
     */
    public function getFacultiesByOrganization(int $organizationId)
    {
        return Faculty::where('organization_id', $organizationId)
            ->active()
            ->withCount(['departments' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('name')
            ->get();
    }

    /**
     * Get faculty by slug with organization loaded
     */
    public function getFacultyBySlug(string $slug): ?Faculty
    {
        return Faculty::where('slug', $slug)
            ->active()
            ->with(['organization', 'departments' => function ($query) {
                $query->where('is_active', true)->orderBy('name');
            }])
            ->first();
    }

    /**
     * Get departments by faculty ID
     */
    public function getDepartmentsByFaculty(int $facultyId)
    {
        return Department::where('faculty_id', $facultyId)
            ->active()
            ->withCount(['classSets' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('name')
            ->get();
    }

    /**
     * Get department by slug with faculty and organization loaded
     */
    public function getDepartmentBySlug(string $slug): ?Department
    {
        return Department::where('slug', $slug)
            ->active()
            ->with(['faculty.organization', 'classSets' => function ($query) {
                $query->where('is_active', true)->orderByDesc('year');
            }])
            ->first();
    }

    /**
     * Get class sets by department ID with member counts
     */
    public function getClassSetsByDepartment(int $departmentId)
    {
        return ClassSet::where('department_id', $departmentId)
            ->active()
            ->withCount('members')
            ->orderByDesc('year')
            ->get();
    }

    /**
     * Get all channels (class sets) for an organization - bypasses faculty/department hierarchy
     */
    public function getChannelsByOrganization(int $organizationId)
    {
        return ClassSet::whereHas('department.faculty', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        })
            ->active()
            ->withCount('members')
            ->orderBy('name')
            ->get();
    }

    /**
     * Find organization by ID
     */
    public function findOrganization(int $id): ?Organization
    {
        return Organization::find($id);
    }

    /**
     * Find faculty by ID
     */
    public function findFaculty(int $id): ?Faculty
    {
        return Faculty::find($id);
    }

    /**
     * Find department by ID
     */
    public function findDepartment(int $id): ?Department
    {
        return Department::find($id);
    }
}
