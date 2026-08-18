import { describe, expect, it, vi } from 'vitest'
import { registerSoundAgentCapabilities } from './agent-capabilities.js'

describe('Harness agent sound capability', () => {
  it('registers only when the independent sound bundle is installed', async () => {
    const definitions: any[] = []
    const section = vi.fn()
    const ctx = { systemPrompt: { section }, tools: { register: (definition: unknown) => definitions.push(definition) } }
    const snapshot = {
      config: {
        masterMute: false,
        masterVolume: 1,
        channels: {
          turnComplete: { enabled: true, soundId: 'complete', volume: 1 },
          toolSuccess: { enabled: false, soundId: 'success', volume: 0.7 },
          toolFailure: { enabled: false, soundId: 'failure', volume: 0.9 },
        },
        minimumTurnDurationMs: 0,
        toolCooldownMs: 1500,
        toolCoalesceMs: 400,
        maximumQueueSize: 3,
        rootSessionsOnly: true,
      },
      sounds: [{ id: 'complete', displayName: 'Complete', builtIn: true, channels: ['turnComplete'] }],
      limits: { maximumBytes: 10, maximumSeconds: 10 },
    }
    const controller = { snapshot: vi.fn(() => structuredClone(snapshot)), config: snapshot.config, update: vi.fn(), importSound: vi.fn() }
    registerSoundAgentCapabilities(ctx as never, controller as never)
    expect(section).toHaveBeenCalledWith(expect.objectContaining({ name: 'tool:xy-deepseek-sounds' }))
    expect(definitions[0].name).toBe('xy_pet_sounds')
    const value = await definitions[0].execute({ operation: 'status' }, { signal: new AbortController().signal })
    expect(value.availableSounds[0]).toMatchObject({ id: 'complete', displayName: 'Complete' })
    expect(JSON.stringify(value)).not.toMatch(/path|token|session/i)
  })
})
