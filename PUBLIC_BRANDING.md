# Official branding and public interface

## Entry points and preserved behavior

- Guests visiting `/` or `index.php` now see the public homepage. Its explicit URL
  is `index.php?route=home`. Signed-in visitors retain the default dashboard.
- The public navigation links Home, Alert, Service, Preparedness, Evacuation, and
  Contact to real homepage sections. Log In retains `index.php?route=login`.
- Existing routes, login/logout/registration rules, controller permissions, claim
  workflows, database schema, Colab bridge, and native ML calculations are unchanged.
- `src/Core/Router.php` changes only default-page selection and guest 404 layout.
  `public/index.php` adds the `home` route. `PublicController` performs a read-only
  query for global (`All`) notices; no authenticated module is re-enabled.
- Public maps use the existing map API with `credentials: 'omit'`. They do not
  include signed-in incident data or change the visitor's authenticated session.
  Signed-in operational maps retain their original API scope. Popup strings are
  HTML-escaped and public popups omit links to restricted allocation screens.

## Official logo

The matching high-resolution seal was found in the existing plan extraction:

`scratch/unpacked/HINAPLANON_BDRRMPlan_2024-2026/word/media/image2.png`

It was copied byte-for-byte to:

`public/assets/images/barangay-hinaplanon-seal.png`

SHA-256 (both files):
`7a2794170ba234ddcebd7758136373f373690ff3639b4fecc73d32b2cbcac637`

`views/components/brand.php` supplies the shared seal, Padayon Hinaplanon name, and
`Iligan City • DRRM Portal` subtitle. Public/auth headers and footers, login,
registration, account recovery, sidebar, topbar, and all role dashboards use the
same asset. Images use `object-fit: contain`, square dimensions, and no filters;
the seal has not been redrawn, recolored, stretched, or cropped.

## Honest information and configuration

- Only global notices of type `emergency_alert` or `community_announcement` appear
  on the homepage. Personal and role-targeted messages stay out of public HTML.
  Notices include their recorded publication dates, not fabricated live statuses.
- No PAGASA feed, current shelter count, operational monitoring status, or fake
  statistic was introduced. Maps clearly distinguish recorded data/recommendations
  from verified current conditions. Empty notice lists do not imply safe conditions.
- The sample hotline embedded in the old account-recovery view was removed. No
  verified public phone directory was configured in this source tree.
- Populate `config/public.php` contact fields only with barangay-verified details,
  including a source reference. Until then, the UI honestly says phone/email
  details have not been configured. Email/phone are not mandatory for page rendering.
- No existing login-background photograph was found in root assets. The login
  therefore uses a plain teal welcome panel, with a white form on the right.
  A local verified photograph under `public/assets/images/` can be selected through
  `login_background` in the same config; the text overlay does not alter the image.
- The existing public login map is retained as an optional map-reference disclosure;
  it initializes when opened. The homepage also has the existing public map.
- Public test-account buttons, embedded credential attributes, and the JavaScript
  quick-fill helper were removed. Automated tests use local sandbox accounts,
  outside the public document root. Authentication itself was not changed.

## Changed files

New:

- `config/public.php`
- `src/Controllers/PublicController.php`
- `views/layouts/public.php`, `views/public/home.php`
- `views/components/{brand,public_header,public_footer,public_map}.php`
- `public/assets/css/public.css`, `public/assets/js/public.js`
- `public/assets/images/barangay-hinaplanon-seal.png`

Updated:

- `public/index.php`, `src/Core/Router.php`
- `views/layouts/{main,auth}.php`
- `views/auth/{login,register,forgot_password}.php`
- `views/dashboard/index.php`, `views/errors/404.php`
- `public/assets/css/design-system.css`, `public/assets/js/app.js`
- `tests/test_ui_browser.py`, `UI_REDESIGN.md`

Checkpoint before these changes:
`backup_pre_public_branding_20261105_184940/frontend.zip` plus its saved `Router.php`.
This is separate from the earlier UI checkpoint. No database or sessions are in it.

## Verification

Continue using the existing PHP/Colab startup commands. From the repository root:

```powershell
php -S localhost:8000 -t public
```

Open `http://localhost:8000/` for the guest homepage, or the explicit home URL while
signed in. Development CSS/JS has a new `20261105-brand2` cache key.

For isolated QA, use `tests/ui_sandbox.py` and `tests/test_ui_browser.py` as described
in `UI_REDESIGN.md`. The expanded browser suite checks exact-logo hashes/aspect
ratios, absence of public quick-fill credentials, homepage/navigation/guest 404,
public-notice privacy and escaping, anonymous public-map scope, and the existing
four-role responsive/form/report/claim workflows. QA writes stay in temporary copies.

Known existing QA limitations remain the Purok 6/Purok 8 data assertions and the
manual route-prober's missing `PurokAssessment` class load. These are not corrected
by changing working data or application permissions. CDN map tiles/icons still need
internet access; network failures are visibly reported. No formal WCAG certification
or real-user usability study is claimed. Existing staged deployment packages were
not overwritten or rebuilt.
