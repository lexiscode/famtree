<?php

use Illuminate\Support\Facades\Route;


Route::group(['prefix' => 'admin', 'as' => 'admin.', 'middleware' => ['web']], function () {

    // Guest Routes (Accessible without login)
    Route::middleware('guest:admin')->group(function () {

    });

    // Authenticated Admin Routes (Requires 'admin' middleware)
    Route::middleware('admin')->group(function () {
       
    });

});
