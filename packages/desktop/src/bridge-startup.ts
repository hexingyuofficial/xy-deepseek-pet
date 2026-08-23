import { homedir } from 'node:os'
import { join } from 'node:path'

type StartupEnvironment = Readonly<Record<string, string | undefined>>

export function bridgeFileFromArgs(args: readonly string[]): string | undefined {
  const prefix = '--bridge-file='
  return args.find((argument) => argument.startsWith(prefix))?.slice(prefix.length)
}

export function finderComposePathsFromArgs(args: readonly string[]): string[] {
  const marker = args.indexOf('--finder-compose')
  if (marker < 0) return []
  const count = Number(args[marker + 1])
  if (!Number.isInteger(count) || count < 1 || count > 8) return []
  return args.slice(marker + 2, marker + 2 + count)
    .filter((value) => value.length > 0 && value.length <= 4096 && (value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value)))
}

export function bridgeFileForStartup(
  args: readonly string[] = process.argv,
  environment: StartupEnvironment = process.env,
  userHome = homedir(),
): string {
  return bridgeFileFromArgs(args)
    ?? environment.XY_DEEPSEEK_PET_BRIDGE_FILE
    ?? join(userHome, '.xy-deepseek-pet', 'bridge.json')
}
