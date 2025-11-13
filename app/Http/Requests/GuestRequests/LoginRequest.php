<?php

namespace App\Http\Requests\GuestRequests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'emailOrUsername' => 'required|string|max:255',
            'password' => 'required|string|min:8',
            'rememberMe' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'emailOrUsername.required' => 'Email or username is required.',
            'emailOrUsername.string' => 'Email or username must be a valid string.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'rememberMe.boolean' => 'Remember me must be true or false.',
        ];
    }
}
