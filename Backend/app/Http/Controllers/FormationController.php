<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUpdateFormationRequest;
use App\Http\Resources\FormationResource;
use App\Models\Formation;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    // GET /api/formations
    public function index(Request $request)
    {
        $q = Formation::query();

        if ($s = trim($request->string("search")->toString())) {
            $q->where(function ($qq) use ($s) {
                $qq->where("title", "like", "%{$s}%")
                   ->orWhere("category", "like", "%{$s}%")
                   ->orWhere("description", "like", "%{$s}%");
            });
        }

        if ($cat = $request->string("category")->toString()) {
            $q->where("category", $cat);
        }

        if ($lang = $request->string("language")->toString()) {
            $q->where("language", $lang);
        }

        if ($obj = $request->string("objective")->toString()) {
            $q->whereJsonContains("objectives", $obj);
        }

        if ($request->filled("popular")) {
            $q->where("popular", $request->boolean("popular"));
        }

        $q->orderByDesc("created_at");

        return FormationResource::collection($q->get());
    }

    public function store(Request $request)
    {
        // ✅ Créer et exécuter manuellement le FormRequest
        $formRequest = app(StoreUpdateFormationRequest::class);
        $formRequest->setContainer(app())
                    ->setRedirector(app("redirect"))
                    ->validateResolved();

        $validated = $formRequest->validated();

        $formation = Formation::create($validated);
        return (new FormationResource($formation))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Formation $formation)
    {
        return new FormationResource($formation);
    }

    public function update(Request $request, Formation $formation)
    {
        $formRequest = app(StoreUpdateFormationRequest::class);
        $formRequest->setContainer(app())
                    ->setRedirector(app("redirect"))
                    ->validateResolved();

        $validated = $formRequest->validated();

        $formation->update($validated);
        return new FormationResource($formation);
    }

   public function destroy(Formation $formation)
{
    $formation->deleted_by = auth()->user()->name ?? 'Système';
    $formation->save();

    $formation->delete(); // 👈 soft delete
    return response()->noContent();
}

}
