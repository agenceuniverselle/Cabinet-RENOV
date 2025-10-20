<?php

// app/Http/Controllers/CategoryController.php
namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
   public function index(Request $req) {
    if ($req->boolean('tree')) {
        $roots = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();
        return response()->json($roots);
    }

    $q = Category::query()
        ->when($req->filled('parent_id'), fn($qr) => $qr->where('parent_id', $req->integer('parent_id')))
        ->when($req->filled('search'), fn($qr) => $qr->where('name', 'like', '%'.$req->input('search').'%'))
        ->orderBy('parent_id')
        ->orderBy('sort_order');

    return $q->paginate($req->integer('per_page', 20));
}


   public function store(Request $req) {
    $data = $req->validate([
        'name'        => 'required|string|max:255',
        'slug'        => 'nullable|string|max:255|unique:categories,slug',
        'icon_key'    => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'parent_id'   => 'nullable|exists:categories,id',
        'is_active'   => 'boolean',
        'sort_order'  => 'integer|min:0',
        'type'        => 'nullable|in:category,subcategory', // optionnel
    ]);

    if (($data['type'] ?? null) === 'subcategory' && empty($data['parent_id'])) {
        return response()->json(['message' => 'Le parent est obligatoire pour une sous-catégorie.'], 422);
    }

    $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
    $cat = Category::create($data);
    return response()->json($cat, 201);
}


    public function show(Category $category) {
        $category->load('children');
        return response()->json($category);
    }

    public function update(Request $req, Category $category) {
        $data = $req->validate([
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => 'sometimes|nullable|string|max:255|unique:categories,slug,'.$category->id,
            'icon_key'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:categories,id|not_in:'.$category->id,
            'is_active'   => 'boolean',
            'sort_order'  => 'integer|min:0'
        ]);
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $category->update($data);
        return response()->json($category);
    }

    public function destroy(Category $category) {
        // Option : empêcher la suppression si enfants
        if ($category->children()->exists()) {
            return response()->json(['message' => 'Supprimez ou déplacez les sous-catégories d’abord.'], 422);
        }
        $category->delete();
        return response()->json(['deleted' => true]);
    }
    // app/Http/Controllers/CategoryController.php

public function roots()
{
    // Catégories racines (sans parent)
    return response()->json(
        Category::whereNull('parent_id')
            ->orderBy('name')
            ->get()
    );
}

}
