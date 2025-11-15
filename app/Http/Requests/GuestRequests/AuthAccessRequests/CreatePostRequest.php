<?php

namespace App\Http\Requests\GuestRequests\AuthAccessRequests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePostRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'type' => 'required|in:text,voice',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string|max:5000',
            'voice_file' => 'nullable|file|mimes:webm,wav,mp3|max:20000',
            'voice_duration' => 'nullable|integer|min:1|max:600',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
        ];
    }

    public function messages()
    {
        return [
            'type.required' => 'Post type is required',
            'type.in' => 'Post type must be either text or voice',
            'title.required' => 'Title is required',
            'title.max' => 'Title cannot exceed 255 characters',
            'content.max' => 'Content cannot exceed 5000 characters',
            'voice_file.mimes' => 'Voice file must be in webm, wav, or mp3 format',
            'voice_file.max' => 'Voice file cannot exceed 20MB',
            'images.max' => 'You can upload a maximum of 10 images',
            'images.*.image' => 'Each file must be an image',
            'images.*.mimes' => 'Images must be in jpeg, png, jpg, or gif format',
            'images.*.max' => 'Each image cannot exceed 5MB',
        ];
    }
}
