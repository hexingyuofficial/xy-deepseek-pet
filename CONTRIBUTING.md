# Contributing

Thanks for helping build XY DeepSeek Pet.

1. Open an issue before large behavior or protocol changes.
2. Keep Harness-specific API handling inside `packages/harness-plugin`.
3. Treat `schemas/theme.schema.json` and `packages/protocol` as public contracts; breaking changes require a version bump and migration note.
4. Add tests for state mapping, security boundaries, and window behavior changed by a pull request.
5. Run `pnpm verify` before opening a pull request.

By contributing, you agree that your code is licensed under MIT. Only submit assets you have the right to redistribute, and include provenance and license information with every theme.
