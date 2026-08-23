import { describe, expect, it } from 'vitest'
import { isNoSpeechDetectedError, parseSpeechHelperOutput, systemSpeechCommand } from './voice-transcription.js'

describe('system voice transcription', () => {
  it('selects the bundled macOS helper', () => {
    expect(systemSpeechCommand('darwin', '/app/resources', '/tmp/a.wav', 'zh-CN', '/tmp/result.json')).toEqual({
      command: '/usr/bin/open',
      args: ['-W', '-n', '-g', '-a', '/app/resources/voice/XY DeepSeek Pet Speech.app', '--args', '/tmp/a.wav', 'zh-CN', '/tmp/result.json'],
      makeExecutable: '/app/resources/voice/XY DeepSeek Pet Speech.app/Contents/MacOS/xy-speech-macos',
      resultPath: '/tmp/result.json',
    })
  })

  it('selects Windows PowerShell without interpolating user input', () => {
    const result = systemSpeechCommand('win32', 'C:\\app\\resources', 'C:\\temp\\a.wav', 'system')
    expect(result.command.toLowerCase()).toContain('powershell.exe')
    expect(result.args).toContain('C:\\temp\\a.wav')
    expect(result.args).toContain('C:\\app\\resources\\voice\\xy-speech-windows.ps1')
  })

  it('accepts only bounded structured helper output', () => {
    expect(parseSpeechHelperOutput('{"ok":true,"text":"  你好   世界  "}\n')).toBe('你好 世界')
    expect(() => parseSpeechHelperOutput('{"ok":false,"error":"language pack missing"}')).toThrow('language pack missing')
    expect(() => parseSpeechHelperOutput('not json')).toThrow('invalid result')
  })

  it('distinguishes silence from an unavailable speech service', () => {
    expect(isNoSpeechDetectedError(new Error('No speech detected'))).toBe(true)
    expect(isNoSpeechDetectedError(new Error('未检测到语音'))).toBe(true)
    expect(isNoSpeechDetectedError(new Error('Speech recognition permission was not granted.'))).toBe(false)
    expect(isNoSpeechDetectedError(new Error('No Windows speech recognition language pack is installed.'))).toBe(false)
  })
})
