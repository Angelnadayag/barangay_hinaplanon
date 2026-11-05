<?php
namespace App\Controllers;

use App\Core\Database;
use App\Core\View;

/** Read-only public presentation. Existing authenticated controllers remain unchanged. */
class PublicController {
    public function home(): void {
        $notices = [];
        $noticesUnavailable = false;
        try {
            // Never expose per-user or role-specific notifications on this page.
            $notices = Database::getInstance()->query("SELECT title, message, priority, created_at
                FROM notifications
                WHERE user_id IS NULL AND target_role = 'All'
                  AND notification_type IN ('emergency_alert', 'community_announcement')
                ORDER BY created_at DESC, notification_id DESC LIMIT 6")->fetchAll();
        } catch (\Throwable $error) {
            error_log('Public homepage notices unavailable: ' . $error->getMessage());
            $noticesUnavailable = true;
        }
        View::render('public.home', [
            'title' => 'Home',
            'notices' => $notices,
            'noticesUnavailable' => $noticesUnavailable,
            'publicSettings' => require __DIR__ . '/../../config/public.php',
        ], 'public');
    }
}
