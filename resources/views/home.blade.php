@extends('layouts.app')

@section('content')
    <div class="home">
        <div class="flex-center position-ref full-height">
            <div class="content">
                <div class="title m-b-md">
                    ИГРА КРЕСТИКИ-НОЛИКИ
                </div>
                <Golos></Golos>
                <a class="start-link" href="/login">
                    ВОЙТИ
                </a>
            </div>
        </div>
    </div>
@endsection
