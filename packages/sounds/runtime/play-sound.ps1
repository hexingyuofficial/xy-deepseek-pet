param(
  [Parameter(Mandatory = $true)]
  [string]$SoundPath,
  [double]$Volume = 1.0
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore

$player = New-Object System.Windows.Media.MediaPlayer
$player.Volume = [Math]::Min(1.0, [Math]::Max(0.0, $Volume))
$player.Open([Uri]::new($SoundPath))

$deadline = [DateTime]::UtcNow.AddSeconds(10)
while (-not $player.NaturalDuration.HasTimeSpan -and [DateTime]::UtcNow -lt $deadline) {
  Start-Sleep -Milliseconds 10
}

if (-not $player.NaturalDuration.HasTimeSpan) {
  $player.Close()
  throw 'Audio metadata did not become available before the playback deadline.'
}

$player.Play()
$duration = [Math]::Ceiling($player.NaturalDuration.TimeSpan.TotalMilliseconds) + 50
Start-Sleep -Milliseconds $duration
$player.Close()
