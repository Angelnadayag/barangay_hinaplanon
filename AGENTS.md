# Working in this repository

- Edit the root `src/`, `views/`, `public/`, `config/`, `database/`, and `ml/` trees. `backup_pre_*` are historical copies; `deploy/infinityfree/upload/` is a staged deployment copy, not the source. Exclude these duplicates from searches unless working on them explicitly.
- Native PHP MVC, with no Composer/npm bootstrap. `public/index.php` registers the `App\` → `src/` autoloader and all routes. URLs use `index.php?route=route-name`, not framework-style paths; authorization lives in controllers, not route middleware.
- README feature/access descriptions are not all current. Consult controllers, `views/layouts/main.php`, and `tests/test_feature_removal_roles.php` before restoring missing role-specific features; removals affect residents, responders, and officials. `SosController` intentionally denies both SOS routes.

## Commands and verification

Run from the repository root:

- Local server: `php -S localhost:8000 -t public`; login: `http://localhost:8000/index.php?route=login`. `serve.bat` instead binds to `0.0.0.0` (all interfaces).
- Syntax-check an edited PHP file without database writes: `php -l path/to/file.php`.
- Main QA script: `php tests/run_all_tests.php`. Despite its name, it does **not** invoke the separate `test_*.php` scripts.
- Focused suites: `php tests/test_feature_removal_roles.php`, `php tests/test_field_report_details.php`, `php tests/test_relief_hub.php`, `php tests/test_relief_claims_oversight.php`.
- Render smoke check: `php tests/probe_routes.php`. This calls controllers directly, not HTTP endpoints or the router. Inspect output for `[FAIL]` / `FAILED`; the prober and main QA script do not set a failing exit code for assertion/probe failures, and the prober prints a success footer even after failures.
- `Auth::redirect()` exits on web requests but deliberately returns under CLI. Direct-controller tests must inspect denial flashes/output, not assume redirects stop execution or that an empty render proves access succeeded.
- These scripts use the configured application database and seeded demo accounts (README account table), not isolated fixtures. Tests change approvals, inventory, reports, evaluations, and audit data without a suite-wide rollback. Use a disposable application/database copy for runs that must not affect working data; do not run suites concurrently against the same database.

## Database and deployment traps

- `config/database.php` defaults to PDO SQLite at `database/disaster_recommender.sqlite`; sessions are stored in `database/sessions/`. Both locations must be writable. The SQLite path is hard-coded, not controlled by `DB_NAME`.
- MySQL uses process environment variables `DB_DRIVER=mysql`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`; no `.env` loader is bootstrapped. `src/Core/Database.php` falls back to the local SQLite file if MySQL connection fails; check `Database::getDriver()` before assuming a command touched MySQL.
- `php database/seed.php` executes the SQLite base schema and inserts demo data; for MySQL it assumes the schema already exists. Do not treat seeding as a complete migration runner: upgrades are standalone PHP files, and migrations such as `database/migrations/20261103_purok_ml_xai.php` use SQLite-specific SQL and also rewrite master data. Inspect before running; there is no verified universal migration order.
- `deploy/infinityfree/prepare.ps1` copies source into `upload/_app/`, exposes assets at the upload root, and substitutes deployment templates. It deliberately refuses to run if `upload/` already exists; do not delete the existing package merely to bypass this guard.
- `deploy/infinityfree/ADMIN_LOGIN_PRIVATE.txt`, password-reset artifacts, the database, and session files contain sensitive state; do not copy their contents into documentation or responses.

## ML pipeline

- Request recommendations load `ml/data/active_model.json` via `src/ML/RecommenderEngine.php`; purok assessments use a separate `ml/data/active_purok_model.json` via `PurokAssessmentEngine`. Do not conflate these models.
- Native request-model training: `php ml/train.php --source=demo --seed=42 --depth=5`. This may import synthetic records into the database and overwrites `ml/data/active_model.json`; it is not a read-only verification command.
- In `ml/train.php`, omitting `--source=demo` trains only on non-synthetic, verified records and exits successfully without training when fewer than 10 exist. Keep synthetic demonstration records distinct from verified official data.
- `php ml/train_models.php` instead compares Decision Tree/Random Forest candidates using all historical records (including synthetic/unverified), writes `active_purok_model.json`, and updates `model_versions`. It is not interchangeable with `ml/train.php`; both trainers deactivate existing model-version entries.
- Python/scikit-learn is optional, not required to run the PHP application; `ml/train_decision_tree.py` also targets `active_model.json`, so do not run alternative trainers casually over the active artifact.
