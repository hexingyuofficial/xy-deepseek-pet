import type { PetQuestionItem } from '@xy-deepseek-pet/protocol'

export function shouldAutoSubmitChoices(
  questions: PetQuestionItem[],
  answeredQuestionIds: ReadonlySet<string>,
): boolean {
  return questions.length > 0 && questions.every((question) =>
    question.multiSelect !== true &&
    Boolean(question.options?.length) &&
    answeredQuestionIds.has(question.id),
  )
}
