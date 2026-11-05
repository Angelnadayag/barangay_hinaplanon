<?php
$publicSettings = require __DIR__ . '/../../config/public.php';
$background = $publicSettings['login_background'] ?? '';
// Only a local, existing image may be used; never inject an arbitrary CSS URL.
$backgroundPath = $background !== '' ? realpath(__DIR__ . '/../../public/' . $background) : false;
$imageRoot = realpath(__DIR__ . '/../../public/assets/images');
$hasBackground = $backgroundPath && $imageRoot
    && str_starts_with($backgroundPath, $imageRoot . DIRECTORY_SEPARATOR)
    && preg_match('/\.(?:png|jpe?g|webp)$/i', $backgroundPath);
?>
<div class="auth-portal-container">
    <div class="auth-login-grid">
        <section class="auth-story" aria-labelledby="login-welcome-heading">
            <?php if ($hasBackground): ?><img class="auth-story-background" src="<?= htmlspecialchars($background) ?>" alt=""><?php endif; ?>
            <div class="auth-story-content">
                <span class="section-eyebrow">Preparedness begins with us</span>
                <h1 id="login-welcome-heading">A prepared community<br>starts with you.</h1>
                <p>Welcome to Padayon Hinaplanon. Working together, we can keep our households informed and our community better prepared.</p>
                <ul class="auth-story-points">
                    <li><i class="fa fa-hand-holding-heart" aria-hidden="true"></i><span>Follow your household's relief updates.</span></li>
                    <li><i class="fa fa-calendar-check" aria-hidden="true"></i><span>Stay connected with community preparedness.</span></li>
                    <li><i class="fa fa-people-group" aria-hidden="true"></i><span>Coordinate through the services authorized for your role.</span></li>
                </ul>
                <p class="auth-story-location"><i class="fa fa-location-dot" aria-hidden="true"></i> Barangay Hinaplanon, Iligan City, Philippines</p>
            </div>
        </section>
        <section class="auth-login-card" aria-labelledby="login-heading">
            <div class="auth-brand"><?php require __DIR__ . '/../components/brand.php'; ?></div>
            <div class="auth-intro">
                <h2 id="login-heading">Welcome back</h2>
                <p>Log in with your registered account to continue.</p>
            </div>
            <?php foreach (($flashes ?? []) as $type => $messages): ?>
                <?php foreach ($messages as $msg): ?>
                    <div class="alert alert-<?= htmlspecialchars($type) ?>" role="alert"><i class="fa fa-circle-info" aria-hidden="true"></i><div><?= htmlspecialchars($msg) ?></div></div>
                <?php endforeach; ?>
            <?php endforeach; ?>
            <form action="index.php?route=login" method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                <div class="form-group">
                    <label for="identifier" class="form-label">Barangay ID or Email <span aria-hidden="true">*</span></label>
                    <div class="auth-input-wrap">
                        <input type="text" id="identifier" name="identifier" class="form-control" placeholder="Enter your Barangay ID or email" required autocomplete="username" aria-describedby="identifier-help">
                        <i class="fa fa-id-card input-icon" aria-hidden="true"></i>
                    </div>
                    <small id="identifier-help" class="field-hint">Your registered username also works. Use only the account issued or approved for you.</small>
                </div>
                <div class="form-group">
                    <div class="auth-password-label"><label for="password" class="form-label">Password <span aria-hidden="true">*</span></label><a href="index.php?route=forgot-password">Forgot password?</a></div>
                    <div class="auth-input-wrap">
                        <input type="password" id="password" name="password" class="form-control" placeholder="Enter your password" required autocomplete="current-password">
                        <i class="fa fa-lock input-icon" aria-hidden="true"></i>
                        <button type="button" id="togglePassword" class="password-toggle" aria-label="Show password" aria-pressed="false" title="Show password"><i class="fa fa-eye" aria-hidden="true"></i></button>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary auth-submit">Log In <i class="fa fa-arrow-right" aria-hidden="true"></i></button>
            </form>
            <div class="auth-footer">New to the community portal?<br><a href="index.php?route=register"><strong>Register with your Barangay ID</strong></a></div>
            <p class="auth-security-note"><i class="fa fa-lock" aria-hidden="true"></i> Your existing role and account approval determine which services you can access.</p>
        </section>
    </div>
    <details class="auth-map-disclosure">
        <summary><i class="fa fa-map-location-dot" aria-hidden="true"></i> Open the public hazard-map reference</summary>
        <?php $publicMapId = 'loginPublicMap'; require __DIR__ . '/../components/public_map.php'; ?>
    </details>
</div>
