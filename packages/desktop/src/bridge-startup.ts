import { homedir } from 'node:os'
import { join } from 'node:path'

type StartupEnvironment = Readonly<Record<string, string | undefined>>

export function bridgeFileFromArgs(args: readonly string[]): string | undefined {
  const prefix = '--bridge-file='
  return args.find((argument) => argument.startsWith(prefix))?.slice(prefix.length)
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
