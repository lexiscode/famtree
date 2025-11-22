<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileVisibilityRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'profile_visibility' => 'required|in:public,connected,private',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'profile_visibility.required' => 'Profile visibility is required.',
            'profile_visibility.in' => 'Invalid profile visibility level.',
        ];
    }
}
