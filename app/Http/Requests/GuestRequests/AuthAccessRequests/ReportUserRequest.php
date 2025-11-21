<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class ReportUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'username' => 'required|string|max:255',
            'reason' => 'required|in:harassment,spam,inappropriate,impersonation,other',
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'username.required' => 'Username is required.',
            'username.string' => 'Username must be a valid string.',
            'username.max' => 'Username must not exceed 255 characters.',
            'reason.required' => 'Please select a reason for the report.',
            'reason.in' => 'The selected reason is invalid.',
            'description.string' => 'Description must be a valid string.',
            'description.max' => 'Description cannot exceed 1000 characters.',
        ];
    }
}
