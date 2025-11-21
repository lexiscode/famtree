<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'job_title' => 'nullable|string|max:100',
            'education_level' => 'nullable|string|max:100',
            'profile_image_url' => 'nullable|url',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'phone.max' => 'Phone number must not exceed 20 characters.',
            'address.max' => 'Address must not exceed 255 characters.',
            'bio.max' => 'Bio must not exceed 500 characters.',
            'job_title.max' => 'Job title must not exceed 100 characters.',
            'education_level.max' => 'Education level must not exceed 100 characters.',
            'profile_image_url.url' => 'Please provide a valid image URL.',
        ];
    }
}
