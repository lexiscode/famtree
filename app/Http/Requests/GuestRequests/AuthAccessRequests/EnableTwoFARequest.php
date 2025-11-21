<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class EnableTwoFARequest extends FormRequest
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
            'secret' => 'required|string|min:16',
            'code' => 'required|string|digits:6',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'secret.required' => 'Secret key is required.',
            'secret.min' => 'Invalid secret key.',
            'code.required' => 'Verification code is required.',
            'code.digits' => 'Verification code must be 6 digits.',
        ];
    }
}
