@extends('layouts.app')

@section('content')
    <mainmain username="{{ \Illuminate\Support\Facades\Auth::user()->golos_username }}"
              wif="{{ \Illuminate\Support\Facades\Auth::user()->golos_wif }}"></mainmain>
@endsection
