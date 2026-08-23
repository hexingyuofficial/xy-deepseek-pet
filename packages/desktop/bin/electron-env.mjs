export function cleanElectronRuntimeEnv(source = process.env, extra = {}) {
  const env = { ...source, ...extra }
  delete env.ELECTRON_RUN_AS_NODE
  delete env.ELECTRON_NO_ATTACH_CONSOLE
  return env
}
