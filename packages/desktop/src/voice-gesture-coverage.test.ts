import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('hold-to-record pointer coverage', () => {
  const renderer = readFileSync(new URL('./renderer.ts', import.meta.url), 'utf8')

  it('keeps recording through movement after the long press has started', () => {
    const pointerMove = renderer.match(/petStage\.addEventListener\('pointermove',[\s\S]*?\n\}\)/)?.[0]
    expect(pointerMove).toBeDefined()
    expect(pointerMove).toContain('if (dragDistance > 4 && !longPressTriggered) clearLongPressTimer()')
    expect(pointerMove).not.toContain('finishVoiceRecording')
  })

  it('keeps recorded speech when Electron reports release as pointer cancellation', () => {
    expect(renderer).toContain("if (voiceStopMode === 'release') void finishVoiceRecording(false)")
    expect(renderer).not.toContain("finishVoiceRecording(reason === 'cancel')")
    expect(renderer).toContain("document.addEventListener('pointerup', (event) => finishPetDrag(event, 'release'), true)")
    expect(renderer).toContain("document.addEventListener('pointercancel', (event) => finishPetDrag(event, 'cancel'), true)")
    expect(renderer).toContain("petStage.addEventListener('lostpointercapture', (event) => finishPetDrag(event, 'cancel'))")
  })

  it('surfaces transcription diagnostics and uses a resolved cue URL', () => {
    expect(renderer).toContain("showVoiceNotice('unavailable', result.detail)")
    expect(renderer).toContain('new URL(`./resources/voice/${VOICE_CUE_FILES[kind]}`, window.location.href)')
  })

  it('waits for the recorder final chunk before closing microphone tracks', () => {
    const finish = renderer.match(/async function finishVoiceRecording[\s\S]*?\r?\n}\r?\n\r?\nfunction stateLabel/)?.[0]
    expect(finish).toBeDefined()
    expect(finish).toContain('recording.recorder.requestData()')
    expect(finish!.indexOf('const blob = await recording.stopped')).toBeLessThan(finish!.indexOf('recording.stream.getTracks().forEach'))
  })
})
