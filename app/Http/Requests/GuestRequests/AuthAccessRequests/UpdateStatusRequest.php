<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatusRequest extends FormRequest
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
            'user_id' => 'nullable|integer|exists:users,id',
            'status' => 'required|string|in:alive,deceased',
            'death_date' => 'nullable|date|before_or_equal:today',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be either alive or deceased.',
            'death_date.date' => 'Death date must be a valid date.',
            'death_date.before_or_equal' => 'Death date cannot be in the future.',
            'user_id.exists' => 'The selected user does not exist.',
        ];
    }
}
