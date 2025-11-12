<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\ContactRepository;

class ContactService
{
    public function __construct(private ContactRepository $contactRepository) {}

    /**
     * Submit contact form
     */
    public function submitForm(array $data): array
    {
        // Validate input data
        $validated = [
            'name' => trim($data['name'] ?? ''),
            'email' => trim($data['email'] ?? ''),
            'subject' => trim($data['subject'] ?? ''),
            'message' => trim($data['message'] ?? ''),
        ];

        // Validate required fields
        if (empty($validated['name'])) {
            return ['success' => false, 'message' => 'Name is required'];
        }

        if (empty($validated['email']) || !filter_var($validated['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Valid email is required'];
        }

        if (empty($validated['subject'])) {
            return ['success' => false, 'message' => 'Subject is required'];
        }

        if (empty($validated['message']) || strlen($validated['message']) < 10) {
            return ['success' => false, 'message' => 'Message must be at least 10 characters'];
        }

        try {
            // Create submission in database
            $submission = $this->contactRepository->create($validated);

            // TODO: Send email to support team
            // TODO: Send confirmation email to user

            return [
                'success' => true,
                'message' => 'Thank you for your message! We\'ll get back to you soon.',
                'submission_id' => $submission->id,
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Failed to submit form. Please try again.'];
        }
    }

    /**
     * Get form validation rules
     */
    public function getValidationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ];
    }
}
