import { describe, expect, it } from 'vitest'
import { isFileDrag, petFileDropKind } from './file-drop.js'

describe('pet settings file drops', () => {
  it('isolates operating-system file drags without consuming text drags', () => {
    expect(isFileDrag(['Files', 'text/uri-list'])).toBe(true)
    expect(isFileDrag(['text/plain'])).toBe(false)
  })

  it('routes only registered pet drop targets', () => {
    expect(petFileDropKind('theme')).toBe('theme')
    expect(petFileDropKind('icon')).toBe('icon')
    expect(petFileDropKind('composer')).toBeUndefined()
    expect(petFileDropKind(undefined)).toBeUndefined()
  })
})
