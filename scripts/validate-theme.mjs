import { lstat, readFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import Ajv2020 from 'ajv/dist/2020.js'

const themePaths = process.argv.slice(2)
if (!themePaths.length) throw new Error('Usage: node scripts/validate-theme.mjs <theme.json> [...]')

const schema = JSON.parse(await readFile(new URL('../schemas/theme.schema.json', import.meta.url), 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
const validate = ajv.compile(schema)

for (const themePath of themePaths) {
  const absoluteThemePath = resolve(themePath)
  const themeRoot = dirname(absoluteThemePath)
  const theme = JSON.parse(await readFile(absoluteThemePath, 'utf8'))
  if (!validate(theme)) {
    console.error(`${themePath}: ${JSON.stringify(validate.errors, null, 2)}`)
    process.exitCode = 1
    continue
  }
  const animations = [
    ...Object.entries(theme.animations),
    ...(theme.completionVariants?.regular ?? []).map((animation, index) => [`completionVariants.regular[${index}]`, animation]),
    ...(theme.completionVariants?.jackpot ?? []).map((animation, index) => [`completionVariants.jackpot[${index}]`, animation]),
    ...(theme.errorSequences ?? []).flatMap((sequence, index) => [
      [`errorSequences[${index}].enter`, sequence.enter],
      [`errorSequences[${index}].loop`, sequence.loop],
      [`errorSequences[${index}].exit`, sequence.exit],
    ]),
  ]
  for (const [state, animation] of animations) {
    if (animation.frameDurationsMs !== undefined) {
      const frameCount = animation.kind === 'frames' ? animation.files.length : animation.frameCount
      if (animation.frameDurationsMs.length !== frameCount) {
        throw new Error(`${state}: frameDurationsMs must contain exactly ${frameCount} values`)
      }
    }
    const assets = animation.kind === 'frames' ? animation.files : [animation.file]
    for (const asset of assets) {
      const absoluteAsset = resolve(themeRoot, asset)
      const localPath = relative(themeRoot, absoluteAsset)
      if (localPath.startsWith('..') || isAbsolute(localPath)) throw new Error(`${state}: asset escapes theme directory`)
      const info = await lstat(absoluteAsset)
      if (!info.isFile() || info.isSymbolicLink()) throw new Error(`${state}: asset is not a regular file: ${asset}`)
    }
  }
  console.log(`${themePath} is valid.`)
}
