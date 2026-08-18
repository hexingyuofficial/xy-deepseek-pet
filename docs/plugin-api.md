# Harness pet plugin interfaces

`xy-deepseek-pet` is both a Cordis Host plugin and a Harness Web client plugin. The Host normalizes session events, owns the authenticated loopback bridge, and provides the `xyPet` settings remote. The Web face contributes a compact pet group to Harness General settings.

## Settings remote

The Typert Remote descriptors are exported as `xy-deepseek-pet/remote`. The `xyPet` namespace exposes:

- `snapshot()`: current preferences, installed themes, and registered menu actions.
- `update(config)`: validate and atomically persist pet preferences.
- `importTheme(fileName, dataBase64)`: stage a bounded ZIP, validate it through the desktop native/Petdex importer, activate it, and remove the staging file.
- `openDesktop()`: launch or focus one pet instance.

Preferences live in `~/.xy-deepseek-pet/pet-settings.json`. The file never contains the bridge token.

## Harness agent interface

The Host registers an ordered system-prompt section and a bounded `xy_pet` tool through the official `dsh-system-prompt` and `dsh-tools` services. Supported operations are:

- `status`
- `open_pet`
- `open_settings`
- `set_theme` with an exact installed theme ID
- `import_theme` with an explicitly selected local ZIP path, including a licensed ZIP the agent downloaded after the user explicitly requested a skin
- `set_scale` from `0.4` through `2.0`
- `create_launcher` with a sanitized display name and either the bundled whale icon or a user-selected local PNG

Theme import still passes through the desktop ZIP importer and schema validator. The tool does not expose the rendezvous path, bridge port, token, session text, or arbitrary file contents. Pet appearance belongs to the selected theme. Desktop-shortcut artwork is separate: `create_launcher` accepts the bundled icon or a local PNG no larger than 5 MiB and uses the same validator as the settings UI.

Agents should report a downloaded theme's source and license before import. Downloaded themes never execute code and receive no broader filesystem or menu permissions.

When the independent `xy-deepseek-sounds` package is installed it registers `xy_pet_sounds` for status, channel selection, channel enablement, and validated local sound import. No sound tool is advertised by a pet-only installation.

## Cordis menu service

Third-party Cordis plugins can inject `xyPetMenu` and register a bilingual, data-only alias for a safe action:

```js
export const inject = ['xyPetMenu']

export function apply(ctx) {
  ctx.effect(() => ctx.xyPetMenu.register({
    id: 'example.open-workspace',
    label: { 'zh-CN': '打开工作区', en: 'Open workspace' },
    invoke: 'open-client',
    order: 20,
  }), 'example pet menu action')
}
```

Supported invocations are `open-client`, `chat`, `tap`, and `settings`. Registration rejects unnamespaced IDs, long labels, unknown invocations, JavaScript, URLs, and shell commands. Users decide whether a registered item is visible from Harness settings. Disposing the Cordis plugin removes its contribution.

## Theme interface

Themes are asset-only packages validated by `schemas/theme.schema.json`. Schema v1, schema v2, and supported Codex/Petdex imports use deterministic fallbacks for missing optional states. Theme packages cannot register menu behavior or executable code.
