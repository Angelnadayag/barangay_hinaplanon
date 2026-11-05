<?php $onPublicHome = ($_GET['route'] ?? 'home') === 'home'; ?>
<header class="public-header">
    <div class="public-header-inner">
        <a class="brand-home-link" href="index.php?route=home#home" aria-label="Padayon Hinaplanon home">
            <?php require __DIR__ . '/brand.php'; ?>
        </a>
        <button type="button" class="icon-button public-menu-toggle" id="public-menu-toggle" aria-controls="public-navigation" aria-expanded="false" aria-label="Open public navigation" hidden><i class="fa fa-bars" aria-hidden="true"></i></button>
        <nav id="public-navigation" class="public-navigation" aria-label="Public navigation">
            <?php foreach (['home' => 'Home', 'alert' => 'Alert', 'service' => 'Service', 'preparedness' => 'Preparedness', 'evacuation' => 'Evacuation', 'contact' => 'Contact'] as $section => $label): ?>
                <a href="index.php?route=home#<?= $section ?>" data-public-section="<?= $section ?>" <?= $onPublicHome && $section === 'home' ? 'aria-current="location"' : '' ?>><?= $label ?></a>
            <?php endforeach; ?>
            <a href="index.php?route=login" class="btn btn-primary public-login-link">Log In <i class="fa fa-arrow-right" aria-hidden="true"></i></a>
        </nav>
    </div>
</header>
