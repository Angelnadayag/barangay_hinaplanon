<?php
namespace App\ML;

/** Optional localhost-only candidate model. Fail closed to the existing PHP models. */
final class ColabModelClient {
    private static ?string $lastError = null;
    private static bool $unavailable = false;
    private static array $reportedWarnings = [];

    public static function lastError(): ?string {
        return self::$lastError;
    }

    private static function fail(string $message): ?array {
        self::$lastError = $message;
        self::$unavailable = true; // Avoid one timeout per purok during this request.
        error_log('Colab ML bridge: ' . $message . '; using existing PHP/rule fallback.');
        return null;
    }

    public static function predict(array $features): ?array {
        if (getenv('HINAPLANON_COLAB_MODEL_ENABLED') !== '1' || self::$unavailable) return null;
        if (!function_exists('curl_init')) return self::fail('PHP cURL extension is unavailable');
        $payload = [
            'disaster_type' => (string)($features['disaster_type'] ?? 'Flood'),
            'severity_level' => (string)($features['severity_level'] ?? 'Medium'),
            'is_urgent' => (int)($features['is_urgent'] ?? 0),
            'purok_risk_level' => (string)($features['purok_risk_level'] ?? 'Medium'),
            'affected_households' => (float)($features['affected_households'] ?? 0),
            'affected_population' => (float)($features['affected_population'] ?? 0),
        ];
        $json = json_encode($payload);
        if ($json === false) return self::fail('Features cannot be encoded as JSON');
        $ch = curl_init('http://127.0.0.1:8765/predict');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 1,
            CURLOPT_TIMEOUT => 3,
            CURLOPT_PROXY => '', // Never route local feature data through an environment proxy.
        ]);
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        if ($response === false) return self::fail('Local API connection failed: ' . $error);
        if ($status !== 200) return self::fail('Local API returned HTTP ' . $status . ': ' . substr($response, 0, 500));
        $data = json_decode($response, true);
        $allowed = ['Critical', 'High', 'Moderate', 'Low'];
        if (!is_array($data) || !in_array($data['predicted_priority'] ?? null, $allowed, true)
            || !is_numeric($data['confidence'] ?? null) || !is_finite((float)$data['confidence'])
            || $data['confidence'] < 0 || $data['confidence'] > 100
            || ($data['model_source'] ?? null) !== 'colab_sklearn_candidate'
            || ($data['exploratory'] ?? null) !== true
            || !is_string($data['model_sha256'] ?? null)
            || !preg_match('/^[a-f0-9]{64}$/', $data['model_sha256'])
            || !is_array($data['feature_warnings'] ?? null)
            || !is_array($data['probabilities'] ?? null)) {
            return self::fail('Invalid prediction response');
        }
        $sum = 0.0;
        foreach ($data['probabilities'] as $label => $probability) {
            if (!in_array($label, $allowed, true) || !is_numeric($probability)
                || !is_finite((float)$probability) || $probability < 0 || $probability > 1) {
                return self::fail('Invalid class probabilities');
            }
            $sum += (float)$probability;
        }
        $predictedProbability = $data['probabilities'][$data['predicted_priority']] ?? null;
        if ($predictedProbability === null || abs($sum - 1.0) > 0.001
            || abs($predictedProbability * 100 - $data['confidence']) > 0.11) {
            return self::fail('Inconsistent confidence/probability distribution');
        }
        foreach (($data['feature_warnings'] ?? []) as $warning) {
            if (is_string($warning) && !isset(self::$reportedWarnings[$warning])) {
                error_log('Colab ML bridge compatibility: ' . $warning);
                self::$reportedWarnings[$warning] = true;
            }
        }
        self::$lastError = null;
        return $data;
    }
}
