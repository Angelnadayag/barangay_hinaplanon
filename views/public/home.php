<section class="public-hero public-container" id="home" aria-labelledby="home-heading">
    <div class="public-hero-copy">
        <span class="section-eyebrow">Barangay Hinaplanon · Iligan City</span>
        <h1 id="home-heading">A prepared community.<br><span>A stronger tomorrow.</span></h1>
        <p>Welcome to Padayon Hinaplanon. Stay informed, prepare your household, and connect with the community's disaster preparedness and relief services.</p>
        <div class="page-actions">
            <a href="index.php?route=login" class="btn btn-primary btn-lg">Log In to the portal <i class="fa fa-arrow-right" aria-hidden="true"></i></a>
            <a href="#preparedness" class="btn btn-outline btn-lg">Prepare your household</a>
        </div>
        <p class="public-hero-location"><i class="fa fa-location-dot" aria-hidden="true"></i> Barangay Hinaplanon, Iligan City, Philippines</p>
    </div>
    <div class="public-hero-identity">
        <img src="assets/images/barangay-hinaplanon-seal.png" class="hero-seal barangay-seal" width="280" height="280" alt="Official seal of Barangay Hinaplanon, Iligan City">
        <strong>Padayon Hinaplanon</strong>
        <span>Iligan City • DRRM Portal</span>
        <p>Prepared together.<br>Moving forward together.</p>
    </div>
</section>

<div class="public-container">
    <div class="public-safety-note"><i class="fa fa-circle-info" aria-hidden="true"></i><p>This portal is not an emergency dispatch channel. For urgent assistance, contact your local emergency responders and follow current instructions from authorized officials.</p></div>
</div>

<section id="alert" class="public-section public-container" aria-labelledby="notices-heading">
    <div class="public-section-heading">
        <div><span class="section-eyebrow">Community information</span><h2 id="notices-heading">Notices & announcements</h2></div>
        <span class="badge badge-neutral">Recorded portal notices</span>
    </div>
    <p class="section-description">Only notices addressed to everyone are shown here. Publication dates do not confirm that conditions are still current; this is not a live PAGASA feed.</p>
    <?php if ($noticesUnavailable): ?>
        <div class="public-empty-state" role="status"><i class="fa fa-circle-exclamation" aria-hidden="true"></i><h3>Notices are temporarily unavailable</h3><p>Please try again later or check directly with barangay officials. Do not interpret missing information as a safety update.</p></div>
    <?php elseif (empty($notices)): ?>
        <div class="public-empty-state"><i class="fa fa-message" aria-hidden="true"></i><h3>No public notices are listed</h3><p>New notices will appear here when published for everyone. This does not mean that there are no local hazards or emergencies.</p></div>
    <?php else: ?>
        <div class="public-notice-grid">
            <?php foreach ($notices as $notice): ?>
                <?php $urgentNotice = in_array(strtolower((string)$notice['priority']), ['urgent', 'critical'], true); ?>
                <article class="public-info-card public-notice">
                    <span class="badge <?= $urgentNotice ? 'badge-danger' : 'badge-info' ?>"><?= $urgentNotice ? 'Recorded urgent notice' : 'Published notice' ?></span>
                    <h3><?= htmlspecialchars($notice['title']) ?></h3>
                    <p><?= nl2br(htmlspecialchars($notice['message'])) ?></p>
                    <small>Recorded <?= htmlspecialchars($notice['created_at']) ?></small>
                </article>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</section>

<section id="service" class="public-section public-section-tinted" aria-labelledby="services-heading">
    <div class="public-container">
        <div class="public-section-heading"><div><span class="section-eyebrow">One connected portal</span><h2 id="services-heading">Services for our community</h2></div></div>
        <p class="section-description">Log in to access the services authorized for your account. Registration and existing approval requirements still apply.</p>
        <div class="public-service-grid">
            <?php foreach ([
                ['fa-hand-holding-heart', 'Residents', 'Review relief updates, follow your claim status, and find community activity information.'],
                ['fa-clipboard-check', 'Responders & personnel', 'Submit ground observations and review your field reports and assigned operations.'],
                ['fa-people-group', 'Barangay coordination', 'Review reports, coordinate preparedness, and manage authorized community assistance.'],
                ['fa-chart-simple', 'ICDRRMO oversight', 'Monitor resources, review allocation recommendations, and oversee relief claims.'],
            ] as [$icon, $heading, $description]): ?>
                <article class="public-info-card"><span class="public-card-icon"><i class="fa <?= $icon ?>" aria-hidden="true"></i></span><h3><?= $heading ?></h3><p><?= $description ?></p></article>
            <?php endforeach; ?>
        </div>
        <div class="public-section-action"><a class="btn btn-primary" href="index.php?route=login">Log In to access your services</a><a class="btn btn-outline" href="index.php?route=register">Register as a resident</a></div>
    </div>
</section>

<section id="preparedness" class="public-section public-container" aria-labelledby="preparedness-heading">
    <div class="public-section-heading"><div><span class="section-eyebrow">Small steps, shared readiness</span><h2 id="preparedness-heading">Start with your household</h2></div></div>
    <p class="section-description">General preparedness reminders—not a current evacuation order. Always follow situation-specific guidance from authorized officials.</p>
    <ol class="preparedness-steps">
        <li><span class="step-number" aria-hidden="true">01</span><div><h3>Make a family plan</h3><p>Agree on how to contact each other and consider who may need help during an emergency.</p></div></li>
        <li><span class="step-number" aria-hidden="true">02</span><div><h3>Keep essentials ready</h3><p>Keep essential medicines, important documents, drinking water, and personal supplies accessible.</p></div></li>
        <li><span class="step-number" aria-hidden="true">03</span><div><h3>Follow official guidance</h3><p>Confirm safe routes and evacuation instructions with barangay officials. Do not rely on a map alone.</p></div></li>
    </ol>
    <div class="public-section-action"><a class="btn btn-outline" href="index.php?route=login">Log In to view community activities <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div>
</section>

<section id="evacuation" class="public-section public-section-tinted" aria-labelledby="evacuation-heading">
    <div class="public-container">
        <div class="public-section-heading"><div><span class="section-eyebrow">Know your surroundings</span><h2 id="evacuation-heading">Evacuation & map reference</h2></div></div>
        <p class="section-description">This public map provides recorded geographic information, not a live shelter-availability guarantee. Confirm your destination and safe route with authorized officials before traveling.</p>
        <?php $publicMapId = 'homePublicMap'; require __DIR__ . '/../components/public_map.php'; ?>
    </div>
</section>

<section id="contact" class="public-section public-container" aria-labelledby="contact-heading">
    <div class="public-section-heading"><div><span class="section-eyebrow">Stay connected</span><h2 id="contact-heading">Contact & assistance</h2></div></div>
    <?php $contact = $publicSettings['contact']; ?>
    <div class="public-contact-grid">
        <article class="public-info-card">
            <span class="public-card-icon"><i class="fa fa-building" aria-hidden="true"></i></span>
            <h3><?= htmlspecialchars($contact['office']) ?></h3>
            <p><?= htmlspecialchars($contact['location']) ?></p>
            <?php if (!empty($contact['hours'])): ?><p><?= htmlspecialchars($contact['hours']) ?></p><?php endif; ?>
            <?php if (!empty($contact['phone'])): ?>
                <a class="contact-link" href="tel:<?= htmlspecialchars(preg_replace('/[^+0-9]/', '', $contact['phone'])) ?>"><i class="fa fa-phone" aria-hidden="true"></i> <?= htmlspecialchars($contact['phone']) ?></a>
            <?php endif; ?>
            <?php if (filter_var($contact['email'], FILTER_VALIDATE_EMAIL)): ?><a class="contact-link" href="mailto:<?= htmlspecialchars($contact['email']) ?>"><?= htmlspecialchars($contact['email']) ?></a><?php endif; ?>
            <?php if (empty($contact['phone']) && empty($contact['email'])): ?><p class="contact-unavailable">Verified public telephone and email details have not yet been configured. Please confirm the current contact details with the barangay office.</p><?php endif; ?>
            <?php if (!empty($contact['source_reference'])): ?><small>Contact source: <?= htmlspecialchars($contact['source_reference']) ?></small><?php endif; ?>
        </article>
        <article class="public-info-card contact-help-card"><span class="public-card-icon"><i class="fa fa-user-check" aria-hidden="true"></i></span><h3>Need help with your account?</h3><p>Use your registered Barangay ID, email, or username to log in. If you cannot access your account, follow the existing account-recovery instructions.</p><div class="page-actions"><a href="index.php?route=forgot-password" class="btn btn-outline">Account recovery</a><a href="index.php?route=login" class="btn btn-primary">Log In</a></div></article>
    </div>
</section>
