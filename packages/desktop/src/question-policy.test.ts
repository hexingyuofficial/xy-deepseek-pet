import type { PetQuestionItem } from '@xy-deepseek-pet/protocol'
import { describe, expect, it } from 'vitest'
import { shouldAutoSubmitChoices } from './question-policy.js'

const singleChoice = (id: string): PetQuestionItem => ({
  id,
  question: `Question ${id}`,
  options: [{ label: 'A' }, { label: 'B' }],
})

describe('question submission policy', () => {
  it('submits a single-choice request as soon as its option is selected', () => {
    expect(shouldAutoSubmitChoices([singleChoice('color')], new Set(['color']))).toBe(true)
  })

  it('waits until every question in a single-choice batch has an answer', () => {
    const questions = [singleChoice('color'), singleChoice('size')]
    expect(shouldAutoSubmitChoices(questions, new Set(['color']))).toBe(false)
    expect(shouldAutoSubmitChoices(questions, new Set(['color', 'size']))).toBe(true)
  })

  it('keeps explicit submission for multi-select and free-text questions', () => {
    expect(shouldAutoSubmitChoices([{ ...singleChoice('features'), multiSelect: true }], new Set(['features']))).toBe(false)
    expect(shouldAutoSubmitChoices([{ id: 'note', question: 'Add a note' }], new Set(['note']))).toBe(false)
  })
})
