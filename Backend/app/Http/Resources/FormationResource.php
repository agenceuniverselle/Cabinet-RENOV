<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FormationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'category'       => $this->category,
            'certification'  => $this->certification,
            'participants'   => $this->participants, // ex: "8-15"
            'description'    => $this->description,
            'objectives'     => $this->objectives ?? [],      // cast array dans le Model
            'iconKey'        => $this->icon_key,              // ⬅️ mapping vers camelCase attendu par le front
            'language'       => $this->language,
            'popular'        => (bool) $this->popular,
            'createdAt'      => optional($this->created_at)->toISOString(),
            'updatedAt'      => optional($this->updated_at)->toISOString(),
        ];
    }
}
