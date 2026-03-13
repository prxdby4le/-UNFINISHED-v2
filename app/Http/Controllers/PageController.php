<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('home');
    }

    public function dashboard()
    {
        return redirect()->route('projects.index');
    }

    public function appearance(): Response
    {
        return Inertia::render('settings/appearance');
    }
}
