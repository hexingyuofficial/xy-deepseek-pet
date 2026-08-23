import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('desktop approval UI coverage', () => {
  const source = readFileSync(fileURLToPath(new URL('./renderer.ts', import.meta.url)), 'utf8')

  it('keeps approval actions in both expanded details and the compact bubble', () => {
    expect(source).toContain("if (session.approval) {\n        const actions = createApprovalActions(session)")
    expect(source).toContain('if (session.approval) bubble.append(createApprovalActions(session))')
  })

  it('keeps both approval outcomes wired to the bridge', () => {
    expect(source).toContain("void decide('allowed-once')")
    expect(source).toContain("void decide('rejected')")
    expect(source).toContain('window.harnessPet.decideApproval(session.id, session.approval!.requestId, outcome)')
  })
})
