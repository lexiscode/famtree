<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFieldPrivacyRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'field_privacy' => 'required|array',
            'field_privacy.*' => 'required|in:public,connected,private',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'field_privacy.required' => 'Field privacy settings are required.',
            'field_privacy.*.in' => 'Each field privacy level must be public, connected, or private.',
        ];
    }
}
