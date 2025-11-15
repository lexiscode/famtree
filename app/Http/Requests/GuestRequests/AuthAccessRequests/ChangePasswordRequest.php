<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
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
            'current' => [
                'required',
                'current_password',
            ],
            'new' => [
                'required',
                'different:current',
                Password::min(8)
                    ->mixedCase()
                    ->numbers(),
            ],
            'confirm' => [
                'required',
                'same:new',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'current.required' => 'Current password is required.',
            'current.current_password' => 'The current password is incorrect.',
            'new.required' => 'New password is required.',
            'new.different' => 'New password must be different from current password.',
            'new.min' => 'New password must be at least 8 characters.',
            'new.mixed_case' => 'New password must contain uppercase and lowercase letters.',
            'new.numbers' => 'New password must contain at least one number.',
            'confirm.required' => 'Password confirmation is required.',
            'confirm.same' => 'New passwords do not match.',
        ];
    }
}
