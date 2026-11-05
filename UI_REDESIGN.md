# Padayon Hinaplanon UI refresh

The subsequent official-logo/public-homepage changes are documented in
`PUBLIC_BRANDING.md`, including the current public routes and modified-file list.

## Scope and preservation

- Audited all 38 root `views/` templates, the two shared layouts, stylesheet,
  application JavaScript, role navigation, map initialization, and modal handlers.
- Original frontend checkpoint: `backup_pre_ui_20261105_180025/frontend.zip`.
  It contains the original `views/` and `public/assets/` trees, not database/session data.
- The initial refresh left controllers/routes unchanged. The follow-up adds a
  read-only public controller and homepage/default/guest-404 presentation routing;
  authentication/authorization, database schema, model artifacts, prediction
  calculations, and allocation/claim business rules remain unchanged.
- Removed modules remain denied. Their historical templates inherit the shared
  styling but are not linked or re-enabled.

## Shared presentation

- `public/assets/css/style.css`: existing tokens updated to the requested teal palette.
- `public/assets/css/design-system.css`: shared typography, white surfaces, cards,
  buttons, form controls, status styles, tables, dialogs, auth layouts, responsive
  breakpoints, visible focus, reduced motion, and print presentation.
- `public/assets/js/ui.js`: desktop collapse/mobile drawer, focus restoration and
  trapping, label/hint associations, native-validation feedback, submission-busy
  states, keyboard calendar controls, and progressive table tools.
- Static tables gain search when they have at least eight rows and local pagination
  above 15 rows. This filters only records already rendered, not the entire database.
  Existing resident/oversight searches and server-side filters are retained. All
  table rows remain in the DOM and are included in print output.
- `public/assets/js/app.js`: accessible password toggle, map resize handling, and
  honest loading/network-error feedback; existing API URLs and polling are preserved.
- The existing Font Awesome icon library is retained. The follow-up located the
  official seal in the archived BDRRM plan and uses its unaltered PNG instead of
  the former shield branding. No login-background photograph was found in root
  assets; the existing scanned hazard image remains a map reference, not a background.

## Page-specific updates

`views/layouts/{main,auth}.php`, `views/auth/{login,register,forgot_password}.php`,
`views/dashboard/index.php`, `views/notifications/index.php`,
`views/reports/index.php`, `views/preparedness/calendar.php`,
`views/field_reports/{create,show}.php`,
`views/recommendations/{index,purok_show}.php`, and
`views/users/relief_claims_oversight.php`.

`views/disaster_requests/show.php` also now reads the actual history-model keys
(`previous_status`, `new_status`, `firstname`, `lastname`), fixing blank history
labels and PHP warnings found in the completed browser-server log. No history
records or transition rules were changed. Browser checks now reject rendered PHP
warnings/deprecations as well as fatal errors.

Changes include role-specific welcome text, existing-data risk/stock summaries,
clearer claim instructions, mobile calendar scrolling, and accessible dialogs.
Hardcoded recommendation accuracy/count defaults and unrecorded claim details
now use actual supplied values or explicit unavailable/pending messages.
XAI contribution-bar widths reflect their recorded percentages rather than an
arbitrary visual multiplier. This changes the chart presentation, not its values.

Existing assessments remain cached; this refresh does not recalculate working data.
The optional Colab bridge and all native model fallbacks remain as configured.

## Run and verify

The existing PHP startup commands are unchanged. Open the app and hard-refresh once
to ensure current styles are loaded. The Colab launchers may still be used; this
redesign adds no PHP/runtime dependencies or frontend build step.

Syntax checks:

```powershell
php -l views/layouts/main.php
node --check public/assets/js/app.js
node --check public/assets/js/ui.js
```

Safe workflow verification (Python standard library, uses copied data only):

```powershell
.\hinaplanon_colab_bridge\.venv\Scripts\python.exe tests/ui_sandbox.py --label ui-check
```

This prints a temporary sandbox path and runs the six existing QA/probe scripts
sequentially, each against a fresh SQLite snapshot. It detects printed failures
even when the original PHP script exits successfully. It deliberately returns a
nonzero status for known existing failures as well as new ones.

For browser checks, use a separate Python environment with Playwright/Chromium
(`python -m pip install playwright`, then `python -m playwright install chromium`).
Start PHP against the printed sandbox, **not the working application**:

```powershell
$env:DB_DRIVER = 'sqlite'
php -S 127.0.0.1:8011 -t '<sandbox>\public'
```

Then run in another terminal:

```powershell
python tests/test_ui_browser.py --sandbox '<sandbox>' --url http://127.0.0.1:8011
```

The browser runner verifies sandbox identity before writing fixtures. It checks
role navigation, desktop/tablet/mobile overflow, authentication controls, calendar
and claim dialogs, live Leaflet markers, map errors, tables, detail/create pages,
and real report/claim submissions. Screenshots and JSON results stay in the sandbox.
Temporary copies contain application data; keep them private and remove them when
you no longer need the test artifacts.

## Known pre-existing QA issues

- Main QA has two stale assertions about the current Purok 6/Purok 8 risk data.
  The redesign does not rewrite geographic data to satisfy those assertions.
- `tests/probe_routes.php` manually loads classes and fails to load
  `App\Models\PurokAssessment` when probing recommendations. Real HTTP rendering
  through the application's autoloader succeeds; the prober was not rewritten.
- Leaflet, map tiles, and Font Awesome still use the existing external providers.
  Map failures are visible, but complete offline maps/icons are not supplied.

Automated browser checks are not a formal WCAG certification or a substitute for
usability testing with residents and barangay staff.

## Initial refresh verification result (2026-11-05, before public-branding follow-up)

- PHP syntax checks passed for all 38 templates; both JavaScript files passed
  `node --check`.
- Browser QA: **53 checks passed**, zero JavaScript exceptions. Dashboard widths:
  1440, 1024, 768, 390, and 320 pixels. Role-linked pages also passed tablet and
  mobile width checks. Real field-report submission/verification and resident
  claim submission were exercised only in the sandbox.
- Focused PHP suites: role removal/permissions **110/110**, field-report details
  **22/22**, relief hub **54/54**, claims oversight **24/24**.
- Main QA: **35 passed, two existing risk-data failures**. The prober retains the
  existing manual-loader error described above; real HTTP recommendations render.
- The existing live Colab bridge verification also passed, including its actual
  prediction comparisons and isolated native/rule fallback modes.
- `src/`, `config/`, and `ml/data/` matched the pre-redesign snapshot. Comparing
  working database rows with that snapshot found only three new authentication
  audit entries; existing workflow records were unchanged. Those audit entries
  were preserved, not reset. All QA writes were confined to disposable copies.
