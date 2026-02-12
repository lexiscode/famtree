<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\OrganizationRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use Illuminate\Support\Collection;

class OrganizationService
{
    public function __construct(
        private OrganizationRepository $organizationRepository,
        private ClassSetRepository $classSetRepository
    ) {
    }

    /**
     * Get all active organizations
     */
    public function getAllOrganizations(): Collection
    {
        return $this->organizationRepository->getAllOrganizations();
    }

    /**
     * Get full organization profile data
     */
    public function getOrganization(string $slug): ?array
    {
        $organization = $this->organizationRepository->getOrganizationBySlug($slug);

        if (!$organization) {
            return null;
        }

        return [
            'organization' => $organization,
            'faculties_count' => $organization->faculties->count(),
            'galleries' => $organization->galleries,
        ];
    }

    /**
     * Get faculties for an organization
     */
    public function getFaculties(string $organizationSlug): ?array
    {
        $organization = $this->organizationRepository->getOrganizationBySlug($organizationSlug);

        if (!$organization) {
            return null;
        }

        $faculties = $this->organizationRepository->getFacultiesByOrganization($organization->id);

        return [
            'organization' => $organization,
            'faculties' => $faculties,
        ];
    }

    /**
     * Get departments for a faculty
     */
    public function getDepartments(string $facultySlug): ?array
    {
        $faculty = $this->organizationRepository->getFacultyBySlug($facultySlug);

        if (!$faculty) {
            return null;
        }

        $departments = $this->organizationRepository->getDepartmentsByFaculty($faculty->id);

        return [
            'faculty' => $faculty,
            'organization' => $faculty->organization,
            'departments' => $departments,
        ];
    }

    /**
     * Get class sets for a department with join status for current user
     */
    public function getClassSets(string $departmentSlug, ?int $userId = null): ?array
    {
        $department = $this->organizationRepository->getDepartmentBySlug($departmentSlug);

        if (!$department) {
            return null;
        }

        $classSets = $this->organizationRepository->getClassSetsByDepartment($department->id);

        // Add membership status for each class set
        if ($userId) {
            $classSets = $classSets->map(function ($classSet) use ($userId) {
                $classSet->is_member = $this->classSetRepository->isMember($classSet->id, $userId);
                return $classSet;
            });
        }

        return [
            'department' => $department,
            'faculty' => $department->faculty,
            'organization' => $department->faculty->organization,
            'classSets' => $classSets,
        ];
    }

    /**
     * Get channels (class sets) for a football club - bypasses faculty/department navigation
     */
    public function getChannels(string $organizationSlug, ?int $userId = null): ?array
    {
        $organization = $this->organizationRepository->getOrganizationBySlug($organizationSlug);

        if (!$organization) {
            return null;
        }

        // Get all class sets for this organization (through faculties -> departments)
        $channels = $this->organizationRepository->getChannelsByOrganization($organization->id);

        // Add membership status for each channel
        if ($userId) {
            $channels = $channels->map(function ($channel) use ($userId) {
                $channel->is_member = $this->classSetRepository->isMember($channel->id, $userId);
                return $channel;
            });
        }

        return [
            'organization' => $organization,
            'channels' => $channels,
        ];
    }

    /**
     * Get breadcrumb data for navigation
     */
    public function getBreadcrumbData(string $type, string $slug): array
    {
        $breadcrumb = [];

        switch ($type) {
            case 'organization':
                $organization = $this->organizationRepository->getOrganizationBySlug($slug);
                if ($organization) {
                    $breadcrumb = [
                        ['label' => 'Organizations', 'url' => '/organizations'],
                        ['label' => $organization->short_name ?? $organization->name, 'url' => null],
                    ];
                }
                break;

            case 'faculty':
                $faculty = $this->organizationRepository->getFacultyBySlug($slug);
                if ($faculty) {
                    $org = $faculty->organization;
                    $breadcrumb = [
                        ['label' => 'Organizations', 'url' => '/organizations'],
                        ['label' => $org->short_name ?? $org->name, 'url' => '/organizations/' . $org->slug],
                        ['label' => $faculty->name, 'url' => null],
                    ];
                }
                break;

            case 'department':
                $department = $this->organizationRepository->getDepartmentBySlug($slug);
                if ($department) {
                    $faculty = $department->faculty;
                    $org = $faculty->organization;
                    $breadcrumb = [
                        ['label' => 'Organizations', 'url' => '/organizations'],
                        ['label' => $org->short_name ?? $org->name, 'url' => '/organizations/' . $org->slug],
                        ['label' => $faculty->name, 'url' => '/organizations/faculty/' . $faculty->slug . '/departments'],
                        ['label' => $department->name, 'url' => null],
                    ];
                }
                break;
        }

        return $breadcrumb;
    }
}
