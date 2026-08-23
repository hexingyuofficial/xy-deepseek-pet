param(
  [Parameter(Mandatory = $true)][string]$AudioPath,
  [ValidateSet('system', 'zh-CN', 'en-US')][string]$Language = 'system'
)

$ErrorActionPreference = 'Stop'

try {
  Add-Type -AssemblyName System.Speech
  $recognizers = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers()
  if ($recognizers.Count -eq 0) { throw 'No Windows speech recognition language pack is installed.' }
  $selected = $null
  if ($Language -ne 'system') {
    $selected = $recognizers | Where-Object { $_.Culture.Name -eq $Language } | Select-Object -First 1
    if ($null -eq $selected) { throw "The $Language Windows speech recognition language pack is not installed." }
  }
  if ($null -eq $selected) {
    $systemUiCulture = [System.Globalization.CultureInfo]::CurrentUICulture.Name
    $systemCulture = [System.Globalization.CultureInfo]::CurrentCulture.Name
    $selected = $recognizers | Where-Object { $_.Culture.Name -eq $systemUiCulture } | Select-Object -First 1
    if ($null -eq $selected) { $selected = $recognizers | Where-Object { $_.Culture.Name -eq $systemCulture } | Select-Object -First 1 }
    if ($null -eq $selected) { $selected = $recognizers | Select-Object -First 1 }
  }

  $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine($selected)
  try {
    $recognizer.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
    $recognizer.SetInputToWaveFile($AudioPath)
    $parts = New-Object System.Collections.Generic.List[string]
    while ($true) {
      $result = $recognizer.Recognize()
      if ($null -eq $result) { break }
      if (-not [string]::IsNullOrWhiteSpace($result.Text)) { $parts.Add($result.Text.Trim()) }
    }
    @{ ok = $true; text = ($parts -join ' ') } | ConvertTo-Json -Compress
  } finally {
    $recognizer.Dispose()
  }
} catch {
  @{ ok = $false; error = $_.Exception.Message } | ConvertTo-Json -Compress
}
