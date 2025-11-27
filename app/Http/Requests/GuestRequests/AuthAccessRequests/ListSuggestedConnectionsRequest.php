<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class ListSuggestedConnectionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // User must be authenticated (middleware handles this)
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'relationship_type' => 'nullable|string|max:50',
            'search' => 'nullable|string|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'page.integer' => 'Page number must be an integer.',
            'page.min' => 'Page number must be at least 1.',
            'per_page.integer' => 'Per page must be an integer.',
            'per_page.min' => 'Per page must be at least 1.',
            'per_page.max' => 'Per page cannot exceed 100.',
            'relationship_type.string' => 'Relationship type must be a valid string.',
            'relationship_type.max' => 'Relationship type cannot exceed 50 characters.',
            'search.string' => 'Search query must be a valid string.',
            'search.max' => 'Search query cannot exceed 100 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitize inputs
        if ($this->has('page')) {
            $this->merge([
                'page' => (int) $this->input('page'),
            ]);
        }

        if ($this->has('per_page')) {
            $this->merge([
                'per_page' => (int) $this->input('per_page'),
            ]);
        }

        // Trim whitespace from search query
        if ($this->has('search')) {
            $this->merge([
                'search' => trim($this->input('search')),
            ]);
        }

        // Trim whitespace from relationship type
        if ($this->has('relationship_type')) {
            $this->merge([
                'relationship_type' => trim($this->input('relationship_type')),
            ]);
        }
    }
}
