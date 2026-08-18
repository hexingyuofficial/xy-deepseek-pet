import React from 'react'
import TYPERT_REMOTE from './remote.js'
import { SoundSettings, type SoundsRemote } from './settings-view.js'

export const name = 'xy-deepseek-sounds-client'
export const inject = ['remote', 'slots']

const PRESENCE_KEY = '__xyDeepSeekPetSettingsPresent'
const PRESENCE_EVENT = 'xy-deepseek-pet-settings-presence'

function useChinese(): boolean {
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')
}

export async function apply(ctx: any): Promise<() => Promise<void>> {
  const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE)
  let sectionFiber: any

  const petSettingsPresent = () => Boolean((globalThis as any)[PRESENCE_KEY])
  const mountFallback = async () => {
    if (petSettingsPresent() || sectionFiber) return
    sectionFiber = ctx.inject(['remote.xySounds'], (scope: any) => {
      const remote = scope.remote.xySounds as SoundsRemote
      scope.slots.inject('settings.section', () => scope.slots.register({ name: 'settings.section', id: 'xy-deepseek-sounds', order: 85, label: useChinese() ? '声音' : 'Sounds' }, () => React.createElement(SoundSettings, { remote })))
    })
    await sectionFiber
  }
  const unmountFallback = async () => {
    const current = sectionFiber
    sectionFiber = undefined
    if (current) await current.dispose()
  }
  const onPresence = () => { if (petSettingsPresent()) void unmountFallback(); else void mountFallback() }
  globalThis.addEventListener?.(PRESENCE_EVENT, onPresence)
  await mountFallback()

  return async () => {
    globalThis.removeEventListener?.(PRESENCE_EVENT, onPresence)
    await unmountFallback()
    await unmountRemote()
  }
}

export { SoundSettings }
export type { SoundsRemote }
