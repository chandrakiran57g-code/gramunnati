<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>CMSR — Village Development & School Empowerment Platform</title>
    <meta name="description" content="CMSR is a rural development platform empowering villages and schools across India through donations, volunteer programs, and community-driven initiatives.">
    <link rel="icon" type="image/svg+xml" href="https://media.base44.com/images/public/user_6a19a4df98ac03e9b75a9132/71b2ecb8f_Screenshot2026-06-10200544.png">
    <meta property="og:type" content="website">
    <meta property="og:title" content="CMSR — Village Development & School Empowerment Platform">
    <meta property="og:description" content="Empowering rural India. Our Village – Our Responsibility – Our Development.">
    <meta property="og:url" content="{{ config('app.url') }}">
    <meta property="og:site_name" content="CMSR">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="CMSR — Village Development & School Empowerment">
    <meta name="twitter:description" content="Empowering rural India through village development and school empowerment programs.">
    <link rel="canonical" href="{{ config('app.url') }}">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/inertia.jsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
