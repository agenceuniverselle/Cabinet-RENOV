<?php

namespace Database\Seeders;

// database/seeders/AdminUserSeeder.php
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder {
    public function run(): void {
        User::updateOrCreate(
            ['email' => 'admin@cabinet-renov.ma'],
            [
                'name' => 'Admin',
                'password' => Hash::make('Cabinet@Renov-2025?'), // à changer
                'is_admin' => true,
            ]
        );
    }
}

