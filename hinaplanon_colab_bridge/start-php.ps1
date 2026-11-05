$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$previous = $env:HINAPLANON_COLAB_MODEL_ENABLED
$env:HINAPLANON_COLAB_MODEL_ENABLED = '1'
try {
    Write-Host 'Local exploratory bridge enabled. API failures retain existing PHP/rule fallbacks.'
    & php -S 127.0.0.1:8000 -t (Join-Path $root 'public')
    if ($LASTEXITCODE -ne 0) { throw "PHP service exited with code $LASTEXITCODE" }
} finally {
    $env:HINAPLANON_COLAB_MODEL_ENABLED = $previous
}
