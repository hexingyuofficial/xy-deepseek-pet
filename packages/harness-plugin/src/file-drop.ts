export type PetFileDropKind = 'theme' | 'icon'

export function isFileDrag(types: Iterable<string> | ArrayLike<string>): boolean {
  return Array.from(types).includes('Files')
}

export function petFileDropKind(value: unknown): PetFileDropKind | undefined {
  return value === 'theme' || value === 'icon' ? value : undefined
}
