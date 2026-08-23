# Cordis integration

Facts in this note were verified against DeepSeek Harness `0.1.0-rc.6`, repository commit `47f943859bef60e4160492346772ded9b24f765a`, and `@deepseek-ai/cordis@4.0.1` on 2026-08-15.

## Two similarly named systems

Harness exposes two Cordis plugin models. XY DeepSeek Pet uses the persistent model for its release and may use the dynamic model only for prototypes.

| Model | Created by | Lifetime | Native desktop access | XY DeepSeek Pet use |
| --- | --- | --- | --- | --- |
| Loader/npm plugin | `dsh plugin ... add` plus a bundle patch | Installed profile; survives restart | Yes, through ordinary Node package capabilities | Product runtime |
| Dynamic Cordis Package | Agent calls `cordis_define` and `cordis_run` | Current DSH process memory only | No supported native window surface from the browser half | Theme preview or UI experiment only |

The sidebar panel labelled **Cordis Plugin** manages the second model. Its rows are session-owned dynamic Plugins with immutable Package versions. Run, stop, version selection, approval, and delete operate on those in-memory definitions. They do not install npm packages or edit the profile composition.

The Settings **Plugins** inventory is the Loader view. In the inspected baseline it reports whether a configured row is enabled and whether its Cordis Fiber is mounted. That inventory is read-only; npm installation and removal still happen through `dsh plugin` in a terminal.

## Why the release is a persistent plugin

Cordis is Harness's service and lifecycle framework. A normal plugin exports `apply(ctx)`, optionally declares `inject`, and registers listeners and other resources through reversible Cordis effects. XY DeepSeek Pet needs that lifecycle to:

- observe `agent/status`, `session/event`, `assistant/chunk`, `turn/start`, `turn/end`, step, approval, and error signals;
- select the latest eligible Agent and call its ordinary `Agent.followup()` path;
- launch or focus one desktop companion process;
- own a loopback-only authenticated bridge and close it when the plugin unloads;
- expose a prebuilt Web client entry that contributes **Open pet** inside Harness.

The adapter must return disposers for its listeners, child-process hooks, timers, and sockets. A failed apply is a real boot error in Cordis, so optional capabilities must be capability-detected while required services belong in `inject`.

## Package shape

The npm package is both a Cordis Host plugin and a Harness Web client bundle:

```json
{
  "name": "xy-deepseek-pet",
  "main": "./lib/index.js",
  "exports": {
    ".": "./lib/index.js",
    "./client": "./lib/client.js"
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "inject": [
        "@deepseek-ai/dsh-api-remotes",
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-sidebar"
      ]
    }
  }
}
```

Its bundle patch mounts the Cordis row:

```yaml
- insert:
    - id: desktop-pet
      name: xy-deepseek-pet
```

Installing it adds the package to the profile dependencies and, because `dsh.bundle` is present, reconciles it into `dsh.profile.bundles`. The composed row can be checked without starting Harness:

```sh
dsh --profile web --dump-config
```

## Configuration surfaces

After installation and restart, the pet contributes a real open/close action through `sidebar.footer.action` and its settings page through `settings.plugins.tab`. The Typert Remote namespace `xyPet` validates and persists settings, imports bounded ZIPs, creates the optional desktop shortcut, and starts or stops the companion. The transparent desktop window has no duplicate settings dialog.

`xy-deepseek-sounds` contributes a final collapsed sound section. When the pet is installed it renders inside the pet group; a sound-only installation receives one standalone General-settings item. The native right-click menu stays limited to frequent commands.

The built-in plugin inventory remains read-only in the verified release candidate, so initial npm installation still uses `dsh plugin` in a terminal.

## Dynamic Cordis opportunity

A future developer command can generate a temporary dynamic browser Package that previews a theme inside Harness. This is useful because dynamic Cordis supports user-approved Client code, versioned in-memory Packages, and Harness UI slots. It is deliberately not an installation route: dynamic Packages disappear on DSH restart and cannot be converted automatically into a repository plugin.

## Security boundary

Cordis dynamic-package guards are a correctness aid, not a hostile-code security boundary. The persistent npm plugin has ordinary dependency privileges. Therefore normal installation must use reviewed, versioned, prebuilt packages; theme packs remain data and images only and never execute scripts.
