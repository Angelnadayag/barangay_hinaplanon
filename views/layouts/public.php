<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0F766E">
    <meta name="description" content="Padayon Hinaplanon — community disaster preparedness and resource coordination in Barangay Hinaplanon, Iligan City.">
    <title><?= htmlspecialchars($title ?? 'Home') ?> — Padayon Hinaplanon</title>
    <link rel="icon" type="image/png" href="assets/images/barangay-hinaplanon-seal.png">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css?v=20261105-brand2">
    <link rel="stylesheet" href="assets/css/design-system.css?v=20261105-brand2">
    <link rel="stylesheet" href="assets/css/public.css?v=20261105-brand2">
</head>
<body class="public-page">
<a class="skip-link" href="#public-content">Skip to main content</a>
<?php require __DIR__ . '/../components/public_header.php'; ?>
<main id="public-content" tabindex="-1">
    <?= $content ?>
</main>
<?php require __DIR__ . '/../components/public_footer.php'; ?>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script src="assets/js/app.js?v=20261105-brand2"></script>
<script src="assets/js/ui.js?v=20261105-brand2"></script>
<script src="assets/js/public.js?v=20261105-brand2"></script>
</body>
</html>
