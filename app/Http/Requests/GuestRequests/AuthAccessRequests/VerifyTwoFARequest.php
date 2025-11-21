<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyTwoFARequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // This is used during login, before auth
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'code' => 'required|string|min:6',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Verification code is required.',
            'code.min' => 'Verification code is invalid.',
        ];
    }
}
