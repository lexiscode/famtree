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
        $userId = $this->user()->id;

        return [
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $userId,
            'address' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'family_status' => 'nullable|in:single,dating,married,divorced,widowed,prefer_not_to_say',
            'job_title' => 'nullable|string|max:100',
            'education_level' => 'nullable|string|max:100',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'phone.max' => 'Phone number must not exceed 20 characters.',
            'phone.unique' => 'This phone number is already registered to another account.',
            'address.max' => 'Address must not exceed 255 characters.',
            'bio.max' => 'Bio must not exceed 500 characters.',
            'gender.in' => 'Please select a valid gender.',
            'country.max' => 'Country must not exceed 100 characters.',
            'state.max' => 'State must not exceed 100 characters.',
            'city.max' => 'City must not exceed 100 characters.',
            'family_status.in' => 'Please select a valid relationship status.',
            'job_title.max' => 'Job title must not exceed 100 characters.',
            'education_level.max' => 'Education level must not exceed 100 characters.',
            'profile_image.image' => 'Please upload a valid image file.',
            'profile_image.mimes' => 'Image must be a JPEG, PNG, GIF, or WebP file.',
            'profile_image.max' => 'Image size must not exceed 5MB.',
        ];
    }
}
