<?php
// Called by verify_bridge.py with an isolated SQLite backup, never the working DB.
declare(strict_types=1);

$root = dirname(__DIR__);
spl_autoload_register(function (string $class) use ($root): void {
    if (str_starts_with($class, 'App\\')) {
        $path = $root . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (is_file($path)) require_once $path;
    }
});

use App\Core\Database;
use App\ML\ColabModelClient;
use App\ML\PurokAssessmentEngine;

try {
    $path = realpath($argv[1] ?? '');
    $workingDb = realpath($root . '/database/disaster_recommender.sqlite');
    if (!$path || $path === $workingDb || basename($path) !== 'bridge-test.sqlite') {
        throw new RuntimeException('An isolated bridge-test.sqlite backup is required');
    }
    $mode = $argv[2] ?? 'colab';
    $db = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    (new ReflectionProperty(Database::class, 'instance'))->setValue(null, $db);
    (new ReflectionProperty(Database::class, 'driver'))->setValue(null, 'sqlite');
    putenv('HINAPLANON_COLAB_MODEL_ENABLED=' . ($mode === 'native' || $mode === 'rules' ? '0' : '1'));
    if (in_array($mode, ['colab-only', 'rules', 'down-rules'], true)) {
        (new ReflectionProperty(PurokAssessmentEngine::class, 'rfModelPath'))->setValue(null, $path . '.missing-model');
    }
    $beforeUsers = $db->query('SELECT * FROM users ORDER BY user_id')->fetchAll();
    $beforeSupplies = $db->query('SELECT * FROM supply ORDER BY supply_id')->fetchAll();
    $rows = PurokAssessmentEngine::runAssessment($mode === 'forced-rules');
    if (count($rows) !== (int)$db->query('SELECT COUNT(*) FROM purok')->fetchColumn() || !$rows) {
        throw new RuntimeException('Not all puroks were assessed');
    }
    $expected = match ($mode) {
        'colab', 'colab-only' => 'Exploratory Colab',
        'native', 'down-native' => 'Machine Learning (Random Forest Ensemble',
        default => 'Configurable Rule-Based',
    };
    $previous = INF;
    foreach ($rows as $i => $row) {
        if (!str_starts_with($row['assessment_method'], $expected)) {
            throw new RuntimeException('Unexpected method: ' . $row['assessment_method'] . '; ' . ColabModelClient::lastError());
        }
        if ($row['priority_rank'] !== $i + 1 || $row['composite_risk_score'] > $previous
            || !in_array($row['priority_level'], ['Critical', 'High', 'Moderate', 'Low'], true)
            || $row['confidence_score'] < 0 || $row['confidence_score'] > 100) {
            throw new RuntimeException('Invalid ranking, priority, or confidence');
        }
        $previous = $row['composite_risk_score'];
        $multipliers = ['Critical' => 1.1, 'High' => 1.0, 'Moderate' => 0.75, 'Low' => 0.5];
        $expectedRice = (int)ceil($row['affected_households'] * 5 * $multipliers[$row['priority_level']]);
        if ($row['recommended_rice_kg'] !== $expectedRice) throw new RuntimeException('Allocation formula changed');
    }
    if ($beforeUsers !== $db->query('SELECT * FROM users ORDER BY user_id')->fetchAll()
        || $beforeSupplies !== $db->query('SELECT * FROM supply ORDER BY supply_id')->fetchAll()) {
        throw new RuntimeException('Assessment changed users or inventory');
    }
    if (str_starts_with($mode, 'down-') && ColabModelClient::lastError() === null) {
        throw new RuntimeException('Expected a clear API-unavailable diagnostic');
    }
    echo json_encode(['ok' => true, 'mode' => $mode, 'puroks' => count($rows),
        'method' => $rows[0]['assessment_method'], 'first_priority' => $rows[0]['priority_level'],
        'first_confidence' => $rows[0]['confidence_score'], 'fallback_error' => ColabModelClient::lastError()], JSON_THROW_ON_ERROR) . PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, 'FAILED: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}
