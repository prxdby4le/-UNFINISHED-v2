<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAudioVersionRequest extends FormRequest
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
        $rules = [
            'name' => ['nullable', 'string', 'max:255'],
        ];

        if ($this->hasFile('files')) {
            $rules['files'] = ['required', 'array'];
            $rules['files.*'] = ['required', 'file', 'mimes:wav,flac,mp3,aiff,m4a', 'max:102400'];
        } else {
            $rules['file'] = ['required', 'file', 'mimes:wav,flac,mp3,aiff,m4a', 'max:102400'];
        }

        return $rules;
    }
}
