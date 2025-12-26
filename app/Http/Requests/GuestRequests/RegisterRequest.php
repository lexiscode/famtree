<?php

namespace App\Http\Requests\GuestRequests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'firstName' => 'required|string|min:2|max:255',
            'lastName' => 'required|string|min:2|max:255',
            'username' => 'required|string|min:3|max:255|unique:users',
            'email' => 'required|email|max:255|unique:users',
            'gender' => 'required|in:male,female',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'confirmed',
            ],
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
            'firstName.required' => 'First name is required.',
            'firstName.min' => 'First name must be at least 2 characters.',
            'lastName.required' => 'Last name is required.',
            'lastName.min' => 'Last name must be at least 2 characters.',
            'username.required' => 'Username is required.',
            'username.min' => 'Username must be at least 3 characters.',
            'username.unique' => 'This username is already taken.',
            'email.required' => 'Email is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email is already registered.',
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Please select a valid gender.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.regex' => 'Password must contain uppercase, lowercase, and number.',
            'password.confirmed' => 'Passwords do not match.',
        ];
    }
}
