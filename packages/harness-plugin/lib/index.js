var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name2, symbol) => (symbol = Symbol[name2]) ? symbol : Symbol.for("Symbol." + name2);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name2, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name: name2, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name2, decorators, target, extra2) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name2]() {
    return __privateGet(this, extra2);
  }, set [name2](x) {
    return __privateSet(this, extra2, x);
  } }, name2));
  k ? p && k < 4 && __name(extra2, (k > 2 ? "set " : k > 1 ? "get " : "") + name2) : __name(target, name2);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name2, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name2 in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra2 : desc.get) : (x) => x[name2];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra2 : desc.set) : (x, y) => x[name2] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra2 : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra2 = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name2, desc), p ? k ^ 4 ? extra2 : desc : target;
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/index.ts
import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync as existsSync2 } from "node:fs";
import { createRequire } from "node:module";
import { lstat, mkdir as mkdir3, readFile as readFile3, rm, writeFile as writeFile3 } from "node:fs/promises";
import { homedir as homedir3 } from "node:os";
import { basename as basename2, dirname as dirname2, extname, join as join4, resolve as resolve3 } from "node:path";
import { WebSocket, WebSocketServer } from "ws";

// ../protocol/dist/index.js
var MAX_STATUS_TEXT = 280;
function boundedStatusText(value) {
  if (typeof value !== "string")
    return void 0;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized)
    return void 0;
  return normalized.slice(0, MAX_STATUS_TEXT);
}
function initialSnapshot(time = Date.now()) {
  return { state: "offline", connected: false, facing: "right", sequence: 0, time };
}
function reducePetEvent(previous, event) {
  const time = event.time ?? Date.now();
  const base = { ...previous, sequence: previous.sequence + 1, time };
  const { text: _previousText, ...baseWithoutText } = base;
  switch (event.type) {
    case "bridge/connected":
      return { ...baseWithoutText, connected: true, state: "idle" };
    case "bridge/disconnected":
      return { ...base, connected: false, state: "offline", text: "Harness disconnected" };
    case "agent/running":
      return { ...base, connected: true, sessionId: event.sessionId, state: "thinking", text: "Thinking" };
    case "agent/idle":
      return { ...baseWithoutText, connected: true, sessionId: event.sessionId, state: "idle" };
    case "step/working":
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: "working",
        text: boundedStatusText(event.text) ?? "Working"
      };
    case "assistant/text":
      const text = boundedStatusText(event.text);
      return {
        ...baseWithoutText,
        connected: true,
        sessionId: event.sessionId,
        state: previous.state === "working" ? "working" : "thinking",
        ...text ? { text } : {}
      };
    case "agent/needs-input":
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: "needsInput",
        text: boundedStatusText(event.text) ?? "Needs your input"
      };
    case "turn/complete":
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: "complete",
        text: boundedStatusText(event.text) ?? "Done"
      };
    case "agent/error":
      return {
        ...base,
        connected: true,
        sessionId: event.sessionId,
        state: "error",
        text: boundedStatusText(event.text) ?? "Something went wrong"
      };
  }
}
function isBridgeClientMessage(value) {
  if (!value || typeof value !== "object")
    return false;
  const message = value;
  if (message.type === "auth")
    return typeof message.token === "string" && message.token.length <= 256;
  if (message.type === "focus")
    return true;
  if (message.type === "shutdown-service")
    return true;
  if (message.type === "theme-import-result") {
    return typeof message.requestId === "string" && message.requestId.length <= 128 && typeof message.ok === "boolean" && (message.ok ? typeof message.themeId === "string" && message.themeId.length <= 64 : typeof message.error === "string" && message.error.length <= 500);
  }
  if (message.type === "acknowledge")
    return typeof message.sessionId === "string" && message.sessionId.length <= 256;
  if (message.type === "open-client") {
    return message.sessionId === void 0 || typeof message.sessionId === "string" && message.sessionId.length <= 256;
  }
  return message.type === "chat" && typeof message.requestId === "string" && message.requestId.length <= 128 && typeof message.text === "string" && message.text.trim().length > 0 && message.text.length <= 8e3 && (message.sessionId === void 0 || typeof message.sessionId === "string" && message.sessionId.length <= 256);
}

// src/gateway.ts
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
var _createLauncher_dec, _closeDesktop_dec, _desktopStatus_dec, _openDesktop_dec, _importTheme_dec, _update_dec, _snapshot_dec, _a, _init;
var PetSettingsGateway = class extends (_a = TypertRemoteService, _snapshot_dec = [Remote], _update_dec = [Remote], _importTheme_dec = [Remote], _openDesktop_dec = [Remote], _desktopStatus_dec = [Remote], _closeDesktop_dec = [Remote], _createLauncher_dec = [Remote], _a) {
  constructor(ctx, controller, runtime) {
    super(ctx, "xyPet");
    this.controller = controller;
    this.runtime = runtime;
    __runInitializers(_init, 5, this);
  }
  snapshot() {
    return this.controller.snapshot();
  }
  update(config) {
    return this.controller.update(config);
  }
  async importTheme(fileName, dataBase64) {
    const themeId = await this.runtime.importTheme(fileName, dataBase64);
    return this.controller.activateTheme(themeId);
  }
  openDesktop() {
    return this.runtime.openDesktop();
  }
  desktopStatus() {
    return this.runtime.desktopStatus();
  }
  closeDesktop() {
    return this.runtime.closeDesktop();
  }
  createLauncher(name2, iconId, fileName, dataBase64) {
    return this.runtime.createLauncher(name2, iconId, fileName, dataBase64);
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "snapshot", _snapshot_dec, PetSettingsGateway);
__decorateElement(_init, 1, "update", _update_dec, PetSettingsGateway);
__decorateElement(_init, 1, "importTheme", _importTheme_dec, PetSettingsGateway);
__decorateElement(_init, 1, "openDesktop", _openDesktop_dec, PetSettingsGateway);
__decorateElement(_init, 1, "desktopStatus", _desktopStatus_dec, PetSettingsGateway);
__decorateElement(_init, 1, "closeDesktop", _closeDesktop_dec, PetSettingsGateway);
__decorateElement(_init, 1, "createLauncher", _createLauncher_dec, PetSettingsGateway);
__decoratorMetadata(_init, PetSettingsGateway);

// src/menu-registry.ts
import { Service } from "@deepseek-ai/cordis";
import { mkdir as mkdir2, rename as rename2, writeFile as writeFile2 } from "node:fs/promises";
import { join as join2 } from "node:path";

// src/settings.ts
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
var PET_SCALE_MIN = 0.4;
var PET_SCALE_MAX = 2;
var PET_SCALE_STEP = 0.05;
var PET_MENU_ACTIONS = ["open-client", "chat", "settings"];
var DEFAULT_PET_SETTINGS = {
  themeId: "whale-default",
  reducedMotion: false,
  bubbleVisible: true,
  walkingEnabled: true,
  scale: 1,
  activationGesture: "longPress",
  locale: "system",
  autoLaunch: false,
  menuActions: [...PET_MENU_ACTIONS]
};
function petRuntimeRoot() {
  return join(homedir(), ".xy-deepseek-pet");
}
function petSettingsPath() {
  return join(petRuntimeRoot(), "pet-settings.json");
}
function resolvePetSettings(input = {}) {
  const scale = typeof input.scale === "number" && Number.isFinite(input.scale) && input.scale >= PET_SCALE_MIN && input.scale <= PET_SCALE_MAX ? Math.round(input.scale / PET_SCALE_STEP) * PET_SCALE_STEP : DEFAULT_PET_SETTINGS.scale;
  const menuActions = Array.isArray(input.menuActions) ? [...new Set(input.menuActions.filter((value) => typeof value === "string" && /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value) && value.length <= 96))] : [...DEFAULT_PET_SETTINGS.menuActions];
  return {
    themeId: typeof input.themeId === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.themeId) ? input.themeId : DEFAULT_PET_SETTINGS.themeId,
    reducedMotion: input.reducedMotion === true,
    bubbleVisible: input.bubbleVisible !== false,
    walkingEnabled: input.walkingEnabled !== false,
    scale,
    activationGesture: input.activationGesture === "doubleClick" || input.activationGesture === "longPress" ? input.activationGesture : DEFAULT_PET_SETTINGS.activationGesture,
    locale: "system",
    autoLaunch: input.autoLaunch === true,
    menuActions,
    ...input.position && Number.isFinite(input.position.x) && Number.isFinite(input.position.y) ? { position: input.position } : {}
  };
}
var PetSettingsController = class {
  constructor(repositoryRoot, menuRegistry) {
    this.repositoryRoot = repositoryRoot;
    this.menuRegistry = menuRegistry;
  }
  current = structuredClone(DEFAULT_PET_SETTINGS);
  settingsPath = petSettingsPath();
  async initialize() {
    await mkdir(petRuntimeRoot(), { recursive: true, mode: 448 });
    try {
      this.current = resolvePetSettings(JSON.parse(await readFile(this.settingsPath, "utf8")));
    } catch {
      this.current = structuredClone(DEFAULT_PET_SETTINGS);
    }
    await this.persist();
  }
  get config() {
    return structuredClone(this.current);
  }
  async snapshot() {
    return {
      config: this.config,
      themes: await this.listThemes(),
      menuExtensions: this.menuRegistry?.list() ?? []
    };
  }
  async update(input) {
    this.current = resolvePetSettings(input);
    await this.persist();
    return this.snapshot();
  }
  async activateTheme(themeId) {
    const themes = await this.listThemes();
    if (!themes.some((theme) => theme.id === themeId)) throw new Error(`Unknown pet theme: ${themeId}`);
    this.current.themeId = themeId;
    await this.persist();
    return { config: this.config, themes, menuExtensions: this.menuRegistry?.list() ?? [] };
  }
  async listThemes() {
    const roots = [
      ...this.repositoryRoot ? [join(this.repositoryRoot, "themes")] : [],
      process.platform === "darwin" ? join(homedir(), "Library", "Application Support", "XY DeepSeek Pet", "themes") : join(process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "XY DeepSeek Pet", "themes")
    ];
    const themes = /* @__PURE__ */ new Map();
    for (const root of roots) {
      try {
        for (const entry of await readdir(root, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          try {
            const manifest = JSON.parse(await readFile(join(root, entry.name, "theme.json"), "utf8"));
            if (typeof manifest.id !== "string" || typeof manifest.name !== "string" || typeof manifest.license !== "string") continue;
            themes.set(manifest.id, {
              id: manifest.id,
              name: manifest.name,
              license: manifest.license,
              ...typeof manifest.author === "string" ? { author: manifest.author } : {}
            });
          } catch {
          }
        }
      } catch {
      }
    }
    return [...themes.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  async persist() {
    const staging = `${this.settingsPath}.partial-${process.pid}`;
    await writeFile(staging, `${JSON.stringify(this.current, null, 2)}
`, { mode: 384 });
    await rename(staging, this.settingsPath);
  }
};
function repositoryRootFromDesktopEntry(entry) {
  return entry ? resolve(dirname(entry), "../../..") : void 0;
}

// src/menu-registry.ts
var SAFE_MENU_INVOCATIONS = ["open-client", "chat", "tap", "settings"];
function validateContribution(input) {
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(input.id) || input.id.length > 96) throw new Error("Pet menu action id must be a namespaced lowercase id");
  if (!SAFE_MENU_INVOCATIONS.includes(input.invoke)) throw new Error("Pet menu action must reference a registered safe invocation");
  const zh = input.label?.["zh-CN"]?.trim();
  const en = input.label?.en?.trim();
  if (!zh || !en || zh.length > 40 || en.length > 60) throw new Error("Pet menu labels are required and must be short");
  return { id: input.id, label: { "zh-CN": zh, en }, invoke: input.invoke, order: Math.max(-1e3, Math.min(1e3, input.order ?? 0)) };
}
var PetMenuRegistry = class extends Service {
  static provide = "xyPetMenu";
  contributions = /* @__PURE__ */ new Map();
  outputPath = join2(petRuntimeRoot(), "menu-extensions.json");
  constructor(ctx) {
    super(ctx, "xyPetMenu");
  }
  register(input) {
    const contribution = validateContribution(input);
    if (this.contributions.has(contribution.id)) throw new Error(`Pet menu action already registered: ${contribution.id}`);
    this.contributions.set(contribution.id, contribution);
    void this.persist();
    return () => {
      this.contributions.delete(contribution.id);
      void this.persist();
    };
  }
  list() {
    return [...this.contributions.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id));
  }
  async persist() {
    await mkdir2(petRuntimeRoot(), { recursive: true, mode: 448 });
    const staging = `${this.outputPath}.partial-${process.pid}`;
    await writeFile2(staging, `${JSON.stringify(this.list(), null, 2)}
`, { mode: 384 });
    await rename2(staging, this.outputPath);
  }
};

// ../../node_modules/.pnpm/@deepseek-ai+dsh-tools@0.1.0-rc.6_f8724372086ccc1457fc84e7becee2e0/node_modules/@deepseek-ai/dsh-tools/lib/index.js
import { Service as Service2 } from "@deepseek-ai/cordis";

// ../../node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.2/node_modules/@deepseek-ai/cosmokit/lib/index.js
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object, filter) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result2 = {};
  for (const key of keys) if (forced || source[key] !== void 0) result2[key] = source[key];
  return result2;
}
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
(function(Binary2) {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    else return source;
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result3 = [];
    refs.set(source, result3);
    source.forEach((value, index) => {
      result3[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result3;
  }
  const result2 = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result2);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    Reflect.defineProperty(result2, key, descriptor);
  }
  return result2;
}
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
    return true;
  }) ?? Object.keys({
    ...a,
    ...b
  }).every((key) => deepEqual(a[key], b[key], strict));
}
var Time;
(function(Time2) {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) date2 = Date.now() + parsed;
    else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
    else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
    else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
    else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// ../../node_modules/.pnpm/@deepseek-ai+schemastery@3.18.1/node_modules/@deepseek-ai/schemastery/lib/index.mjs
var kSchema = Symbol.for("schemastery");
var kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
  options;
  name = "ValidationError";
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
    else if (typeof segment === "number") prefix += "[" + segment + "]";
    else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  static is(error) {
    return !!error?.[kValidationError];
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
var Schema = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema(options2));
    const getRef = (uid) => refs[uid];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") try {
    schema.callback = new Function("return " + schema.callback)();
  } catch {
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
  return {
    version: 1,
    vendor: "schemastery",
    validate: (value) => {
      try {
        return { value: Schema.resolve(value, this, {})[0] };
      } catch (error) {
        if (ValidationError.is(error)) return { issues: [{
          message: error.message,
          path: error.options.path
        }] };
        throw error;
      }
    }
  };
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result2 = {
    uid: this.uid,
    refs: globalThis.__schemastery_refs__
  };
  globalThis.__schemastery_refs__ = void 0;
  return result2;
};
Schema.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages) {
  const result2 = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages) {
    const value = messages[locale];
    if (value?.$description || value?.$desc) result2[locale] = value.$description || value.$desc;
    else if (typeof value === "string") result2[locale] = value;
  }
  return result2;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this);
  const desc = mergeDesc(schema.meta.description, messages);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
    return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
  });
  if (schema.list) schema.list = schema.list.map((inner, index) => {
    return inner.i18n(mapValues(messages, (data = {}) => {
      if (Array.isArray(getInner(data))) return getInner(data)[index];
      if (Array.isArray(data)) return data[index];
      return extractKeys(data);
    }));
  });
  if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
    if (getInner(data)) return getInner(data);
    return extractKeys(data);
  }));
  if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
  return schema;
};
Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
};
for (const key of [
  "required",
  "disabled",
  "collapse",
  "hidden",
  "loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "deprecated",
    type: "danger"
  });
  return schema;
};
Schema.prototype.experimental = function experimental() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({
    text: "experimental",
    type: "warning"
  });
  return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = {
    ...schema.meta,
    pattern: pattern2
  };
  return schema;
};
Schema.prototype.simplify = function simplify(value) {
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result2 = {};
    for (const key in value) {
      const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result2[key] = item;
    }
    if (deepEqual(result2, this.meta.default, this.type === "dict")) return null;
    return result2;
  } else if (this.type === "array" || this.type === "tuple") {
    const result2 = [];
    value.forEach((value2, index) => {
      const schema = this.type === "array" ? this.inner : this.list[index];
      const item = schema ? schema.simplify(value2) : value2;
      result2.push(item);
    });
    return result2;
  } else if (this.type === "intersect") {
    const result2 = {};
    for (const item of this.list) Object.assign(result2, item.simplify(value));
    return result2;
  } else if (this.type === "union") for (const schema of this.list) try {
    Schema.resolve(value, schema, {});
    return schema.simplify(value);
  } catch {
  }
  return value;
};
Schema.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra2) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    role,
    extra: extra2
  };
  return schema;
};
for (const key of [
  "default",
  "link",
  "comment",
  "description",
  "max",
  "min",
  "step"
]) Object.assign(Schema.prototype, { [key](value) {
  const schema = Schema(this);
  schema.meta = {
    ...schema.meta,
    [key]: value
  };
  return schema;
} });
var resolvers = {};
Schema.extend = function extend(type, resolve4) {
  resolvers[type] = resolve4;
};
Schema.resolve = function resolve2(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options);
    let current = schema;
    let fallback = schema.meta.default;
    while (current?.type === "intersect" && isNullable(fallback)) {
      current = current.list[0];
      fallback = current?.meta.default;
    }
    if (isNullable(fallback)) return [data];
    data = clone(fallback);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema.from = function from(source) {
  if (isNullable(source)) return Schema.any();
  else if ([
    "string",
    "number",
    "boolean"
  ].includes(typeof source)) return Schema.const(source).required();
  else if (source[kSchema]) return source;
  else if (typeof source === "function") switch (source) {
    case String:
      return Schema.string().required();
    case Number:
      return Schema.number().required();
    case Boolean:
      return Schema.boolean().required();
    case Function:
      return Schema.function().required();
    default:
      return Schema.is(source).required();
  }
  else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = {
        ...schema.meta,
        ...schema.inner.meta
      };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema({
    type: "lazy",
    builder,
    inner: { toJSON: toJSON2 }
  });
  return schema;
};
Schema.natural = function natural() {
  return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
  return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
    const date2 = new Date(value);
    if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
    return date2;
  }, true)]);
};
Schema.regExp = function regExp(flag = "") {
  return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
    try {
      return new RegExp(value, flag);
    } catch (e) {
      throw new ValidationError(e.message, options);
    }
  }, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = {
      ...schema.meta,
      ...schema.inner.meta
    };
  }
  return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
  return [data];
});
Schema.extend("never", (data, _, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index = str.indexOf(".");
  if (index === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index + 1);
  const integer = str.slice(0, index);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
  const index = step.toString().indexOf(".");
  const digits = step.toString().slice(index + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) if (data & bits[key]) keys.push(key);
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else throw new ValidationError(`expected number or array but got ${data}`, options);
  if (value === meta.default) return [value];
  return [value, keys];
});
Schema.extend("function", (data, _, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.default;
  }
}
Schema.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result2 = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result2[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result2];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  const result2 = list.map((inner, index) => property(data, index, inner, options));
  if (strict) return [result2];
  result2.push(...data.slice(list.length));
  return [result2];
});
function merge(result2, data) {
  for (const key in data) {
    if (key in result2) continue;
    result2[key] = data[key];
  }
}
Schema.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result2 = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) result2[key] = value;
  }
  if (!strict) merge(result2, data);
  return [result2];
});
Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  const messages = [];
  for (const inner of list) try {
    return Schema.resolve(data, inner, options, strict);
  } catch (error) {
    messages.push(error);
  }
  throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result2;
  for (const inner of list) {
    const value = Schema.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result2)) result2 = value;
    else if (typeof result2 !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    else if (typeof value === "object") merge(result2 ??= {}, value);
    else if (result2 !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
  }
  if (!strict && isPlainObject(data)) merge(result2, data);
  return [result2];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result2, adapted = data] = Schema.resolve(data, inner, options, true);
  if (preserve) return [callback(result2)];
  else return [callback(result2), callback(adapted)];
});
var formatters = {};
function defineMethod(name2, keys, format) {
  formatters[name2] = format;
  Object.assign(Schema, { [name2](...args) {
    const schema = new Schema({ type: name2 });
    keys.forEach((key, index) => {
      switch (key) {
        case "sKey":
          schema.sKey = args[index] ?? Schema.string();
          break;
        case "inner":
          schema.inner = Schema.from(args[index]);
          break;
        case "list":
          schema.list = args[index].map(Schema.from);
          break;
        case "dict":
          schema.dict = mapValues(args[index], Schema.from);
          break;
        case "bits":
          schema.bits = {};
          for (const key2 in args[index]) {
            if (typeof args[index][key2] !== "number") continue;
            schema.bits[key2] = args[index][key2];
          }
          break;
        case "callback": {
          const callback = schema.callback = args[index];
          callback["toJSON"] ||= () => callback.toString();
          break;
        }
        case "constructor": {
          const constructor = schema.constructor = args[index];
          if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
          break;
        }
        default:
          schema[key] = args[index];
      }
    });
    if (name2 === "object" || name2 === "dict") schema.meta.default = {};
    else if (name2 === "array" || name2 === "tuple") schema.meta.default = [];
    else if (name2 === "bitset") schema.meta.default = 0;
    return schema;
  } });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") return constructor.name;
  else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result2 = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result2})` : result2;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
  "inner",
  "callback",
  "preserve"
], ({ inner }, isInner) => inner.toString(isInner));

// ../../node_modules/.pnpm/@deepseek-ai+dsh-scope@0.1.0-rc.6_@deepseek-ai+cordis@4.0.1_@deepseek-ai+dsh-invariants_6f3351786c779449c277f079a737f571/node_modules/@deepseek-ai/dsh-scope/lib/index.js
import { Context } from "@deepseek-ai/cordis";
var NamedEntries = class {
  duplicateError;
  data = /* @__PURE__ */ new Map();
  constructor(duplicateError) {
    this.duplicateError = duplicateError;
  }
  /**
  * Insert one unique name.
  * @param name - name unique within this table.
  * @param value - borrowed value to retain.
  * @returns an idempotent undo that removes only this insertion.
  */
  insert(name2, value) {
    const data = this.data;
    if (data.has(name2)) throw this.duplicateError(name2);
    data.set(name2, value);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      data.delete(name2);
      if (data.size === 0 && this.data === data) this.data = /* @__PURE__ */ new Map();
    };
  }
  /**
  * Read one named value.
  * @param name - name to resolve.
  * @returns the retained value, or `undefined` when absent.
  */
  get(name2) {
    return this.data.get(name2);
  }
  /**
  * Test one name for membership.
  * @param name - name to test.
  * @returns whether the table contains that name.
  */
  has(name2) {
    return this.data.has(name2);
  }
  /**
  * Iterate live names in insertion order.
  * @returns the native live key iterator.
  */
  keys() {
    return this.data.keys();
  }
  /**
  * Iterate live entries in insertion order.
  * @returns the native live entry iterator.
  */
  entries() {
    return this.data.entries();
  }
  /**
  * Iterate live values in insertion order.
  * @returns the native live value iterator.
  */
  values() {
    return this.data.values();
  }
  /**
  * Test whether this table has no entries.
  * @returns whether the table is empty.
  */
  isEmpty() {
    return this.data.size === 0;
  }
};
var AnonymousEntries = class {
  data = /* @__PURE__ */ new Map();
  /**
  * Append one independently owned value.
  * @param value - borrowed value to retain.
  * @returns an idempotent undo for this exact append.
  */
  append(value) {
    const data = this.data;
    const key = Symbol();
    data.set(key, value);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      data.delete(key);
      if (data.size === 0 && this.data === data) this.data = /* @__PURE__ */ new Map();
    };
  }
  /**
  * Iterate live values in insertion order.
  * @returns the native live value iterator.
  */
  values() {
    return this.data.values();
  }
  /**
  * Test whether this table has no entries.
  * @returns whether the table is empty.
  */
  isEmpty() {
    return this.data.size === 0;
  }
};
var ScopedLayers = class {
  createLayer;
  onChange;
  /** The eagerly constructed context-global layer. */
  global;
  scoped = /* @__PURE__ */ new Map();
  constructor(createLayer, onChange) {
    this.createLayer = createLayer;
    this.onChange = onChange;
    this.global = createLayer(void 0);
  }
  /**
  * Read an existing exact-scope overlay. Deliberately chain-blind: callers
  * addressing one scope's OWN contributions (its restrictions, its guards)
  * must not silently pick up an ancestor's — use {@link chainLayers} where
  * inheritance is the point.
  * @param scope - exact scope key; `undefined` denotes no overlay.
  * @returns the existing scoped layer, or `undefined` without creating one.
  */
  peek(scope) {
    if (scope === void 0) return void 0;
    return this.scoped.get(scope);
  }
  /**
  * Existing overlays along the scope's parent chain ({@link scopeChainOf}),
  * farthest ancestor first and the exact scope last, so a caller layering
  * them in order gives the nearest scope the final word.
  * @param scope - viewing scope, or `undefined` for no overlays.
  * @returns the existing layers, nearest last; absent overlays are skipped.
  */
  chainLayers(scope) {
    const layers = [];
    for (const key of scopeChainOf(scope).reverse()) {
      const layer = this.scoped.get(key);
      if (layer !== void 0) layers.push(layer);
    }
    return layers;
  }
  /**
  * Materialize global named entries followed by scope-chain shadows,
  * farthest ancestor first, so the nearest scope's entry wins a name.
  * @param scope - viewing scope, or `undefined` for the global view.
  * @param pick - select the named table from a layer.
  * @returns an insertion-ordered effective map.
  */
  merge(scope, pick2) {
    const merged = new Map(pick2(this.global).entries());
    for (const layer of this.chainLayers(scope)) for (const [name2, value] of pick2(layer).entries()) merged.set(name2, value);
    return merged;
  }
  /**
  * Attach one synchronous layer mutation to its registration context.
  * @param ctx - context that determines both scope visibility and effect ownership.
  * @param action - atomic mutation returning its synchronous undo.
  * @param options - Cordis effect label and optional change notification.
  * @returns the exact disposer returned by `ctx.effect()`.
  */
  effect(ctx, action, options) {
    const scope = scopeOf(ctx);
    const notify = options.notify ?? true;
    return ctx.effect(function* () {
      let layer;
      let created = false;
      if (scope === void 0) layer = this.global;
      else {
        const existing = this.scoped.get(scope);
        if (existing === void 0) {
          layer = this.createLayer(scope);
          this.scoped.set(scope, layer);
          created = true;
        } else layer = existing;
      }
      let undo;
      try {
        undo = action(layer);
      } catch (error) {
        if (scope !== void 0 && created && layer.isEmpty()) this.scoped.delete(scope);
        throw error;
      }
      yield () => {
        undo();
        if (scope !== void 0 && layer.isEmpty()) this.scoped.delete(scope);
        if (notify) this.onChange();
      };
      if (notify) this.onChange();
    }.bind(this), options.label);
  }
};
var kScope = Symbol("dsh.scope");
var carrierKeys = /* @__PURE__ */ new WeakMap();
var scopeParents = /* @__PURE__ */ new WeakMap();
function scopeChainOf(key) {
  const chain = [];
  for (let cursor = key; cursor !== void 0; cursor = scopeParents.get(cursor)) chain.push(cursor);
  return chain;
}
function scopeOf(ctx) {
  return ctx[kScope];
}
function scopeTarget(base, key) {
  const baseFilter = base[Context.filter];
  const carrier = { [Context.filter](ctx) {
    if (baseFilter !== void 0 && !baseFilter.call(base, ctx)) return false;
    const tag = scopeOf(ctx);
    if (tag === void 0) return true;
    for (let cursor = key; cursor !== void 0; cursor = scopeParents.get(cursor)) if (cursor === tag) return true;
    return false;
  } };
  carrierKeys.set(carrier, key);
  return carrier;
}

// ../../node_modules/.pnpm/@deepseek-ai+dsh-tools@0.1.0-rc.6_f8724372086ccc1457fc84e7becee2e0/node_modules/@deepseek-ai/dsh-tools/lib/index.js
import { CallId, HarnessError, assertNever, deepFreeze } from "@deepseek-ai/dsh-llm";
import { isJsonValue, snapshotJsonValue } from "@deepseek-ai/dsh-session";
var JsonSchemaError = class extends HarnessError {
  /** Individual schema violations in walk order. */
  violations;
  constructor(violations) {
    super(`unsupported JSON schema: ${violations.join("; ")}`, "UNSUPPORTED_SCHEMA");
    this.name = "JsonSchemaError";
    this.violations = violations;
  }
};
var CONSTRAINT_KEYWORDS = /* @__PURE__ */ new Set([
  "type",
  "oneOf",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "enum",
  "const"
]);
var ANNOTATION_KEYWORDS = /* @__PURE__ */ new Set([
  "description",
  "title",
  "default",
  "examples"
]);
var SCHEMA_TYPES = [
  "object",
  "array",
  "string",
  "number",
  "integer",
  "boolean",
  "null"
];
function hasIntrinsicConstructor(prototype, name2) {
  const constructor = Object.getOwnPropertyDescriptor(prototype, "constructor")?.value;
  if (typeof constructor !== "function") return false;
  try {
    return constructor.name === name2 && constructor.prototype === prototype && Function.prototype.toString.call(constructor) === `function ${name2}() { [native code] }`;
  } catch {
    return false;
  }
}
function isIntrinsicObjectPrototype(value) {
  return Object.getPrototypeOf(value) === null && hasIntrinsicConstructor(value, "Object");
}
function isPlainJsonRecord(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || typeof prototype === "object" && isIntrinsicObjectPrototype(prototype);
  } catch {
    return false;
  }
}
function hasPlainArrayPrototype(value) {
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(prototype) || !hasIntrinsicConstructor(prototype, "Array")) return false;
  const objectPrototype = Object.getPrototypeOf(prototype);
  return typeof objectPrototype === "object" && objectPrototype !== null && isIntrinsicObjectPrototype(objectPrototype);
}
function hasOnlyEnumerableStringKeys(value) {
  try {
    return Reflect.ownKeys(value).every((key) => typeof key === "string" && Object.prototype.propertyIsEnumerable.call(value, key));
  } catch {
    return false;
  }
}
function isJsonSchemaRecord(value) {
  return isPlainJsonRecord(value) && hasOnlyEnumerableStringKeys(value);
}
function isPlainJsonArray(value) {
  if (!Array.isArray(value)) return false;
  try {
    if (!hasPlainArrayPrototype(value) || Reflect.ownKeys(value).length !== value.length + 1) return false;
    for (let index = 0; index < value.length; index++) if (!Object.hasOwn(value, index)) return false;
    return true;
  } catch {
    return false;
  }
}
function isJsonNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0);
}
function scalarMatches(type, value) {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return isJsonNumber(value);
    case "integer":
      return isJsonNumber(value) && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "null":
      return value === null;
    /* v8 ignore next -- JsonSchemaScalarType is closed; this retains compile-time exhaustiveness. */
    default:
      return assertNever(type, "JsonSchemaType");
  }
}
var ONE_OF_SIBLING_KEYWORDS = [
  "properties",
  "required",
  "additionalProperties",
  "items",
  "enum",
  "const"
];
function checkObjectSchemaTail(node, path, properties, violations) {
  const hasRequired = Object.hasOwn(node, "required");
  const required = hasRequired ? node.required : void 0;
  if (hasRequired) if (!isPlainJsonArray(required) || required.some((entry) => typeof entry !== "string")) violations.push(`${path}.required must be an array of strings`);
  else {
    const declared = isJsonSchemaRecord(properties) ? properties : {};
    for (const key of required) if (!Object.hasOwn(declared, key)) violations.push(`${path}.required names "${key}" which is not in properties`);
  }
  if (Object.hasOwn(node, "additionalProperties") && typeof node.additionalProperties !== "boolean") violations.push(`${path}.additionalProperties must be a boolean`);
}
function checkSchemaNode(root, rootPath, violations, seen) {
  const tasks = [{
    kind: "enter",
    node: root,
    path: rootPath
  }];
  for (let task = tasks.pop(); task !== void 0; task = tasks.pop()) {
    if (task.kind === "leave") {
      seen.delete(task.node);
      continue;
    }
    if (task.kind === "one-of-tail") {
      for (const key of ONE_OF_SIBLING_KEYWORDS) if (Object.hasOwn(task.node, key)) violations.push(`${task.path}.${key} is not supported beside oneOf`);
      continue;
    }
    if (task.kind === "object-tail") {
      checkObjectSchemaTail(task.node, task.path, task.properties, violations);
      continue;
    }
    const { node, path } = task;
    if (!isJsonSchemaRecord(node)) {
      violations.push(`${path} must be a schema object`);
      continue;
    }
    if (seen.has(node)) {
      violations.push(`${path} is circular`);
      continue;
    }
    seen.add(node);
    tasks.push({
      kind: "leave",
      node
    });
    for (const key of Object.keys(node)) {
      if (CONSTRAINT_KEYWORDS.has(key)) continue;
      if (ANNOTATION_KEYWORDS.has(key)) {
        try {
          if (!isJsonValue(node[key])) violations.push(`${path}.${key} annotation must be lossless JSON data`);
        } catch {
          violations.push(`${path}.${key} annotation must be lossless JSON data`);
        }
        continue;
      }
      violations.push(`${path}.${key} is not a supported keyword (subset: type/oneOf/properties/required/additionalProperties/items/enum/const + annotations)`);
    }
    if (Object.hasOwn(node, "description") && typeof node.description !== "string") violations.push(`${path}.description must be a string`);
    if (Object.hasOwn(node, "title") && typeof node.title !== "string") violations.push(`${path}.title must be a string`);
    const hasType = Object.hasOwn(node, "type");
    const hasOneOf = Object.hasOwn(node, "oneOf");
    if (hasType && hasOneOf) {
      violations.push(`${path} cannot declare both type and oneOf`);
      continue;
    }
    if (!hasType && !hasOneOf) {
      for (const key of ONE_OF_SIBLING_KEYWORDS) if (Object.hasOwn(node, key)) violations.push(`${path}.${key} requires type or oneOf`);
      continue;
    }
    if (hasOneOf) {
      const oneOf = node.oneOf;
      tasks.push({
        kind: "one-of-tail",
        node,
        path
      });
      if (!isPlainJsonArray(oneOf) || oneOf.length < 2) violations.push(`${path}.oneOf must be an array of at least two schemas`);
      else for (let index = oneOf.length - 1; index >= 0; index--) tasks.push({
        kind: "enter",
        node: oneOf[index],
        path: `${path}.oneOf[${index}]`
      });
      continue;
    }
    const type = node.type;
    if (typeof type !== "string" || !SCHEMA_TYPES.includes(type)) {
      violations.push(Array.isArray(type) ? `${path}.type must be a single type string (type arrays are not supported)` : `${path}.type must be one of ${SCHEMA_TYPES.join("/")}`);
      continue;
    }
    const schemaType = type;
    for (const [key, types] of Object.entries({
      properties: ["object"],
      required: ["object"],
      additionalProperties: ["object"],
      items: ["array"],
      enum: [
        "string",
        "number",
        "integer",
        "boolean",
        "null"
      ],
      const: [
        "string",
        "number",
        "integer",
        "boolean",
        "null"
      ]
    })) if (Object.hasOwn(node, key) && !types.includes(schemaType)) violations.push(`${path}.${key} is not supported on type "${schemaType}"`);
    switch (schemaType) {
      case "object": {
        const properties = Object.hasOwn(node, "properties") ? node.properties : void 0;
        tasks.push({
          kind: "object-tail",
          node,
          path,
          properties
        });
        if (Object.hasOwn(node, "properties")) if (!isJsonSchemaRecord(properties)) violations.push(`${path}.properties must be an object of schemas`);
        else {
          const entries = Object.entries(properties);
          for (let index = entries.length - 1; index >= 0; index--) {
            const entry = entries[index];
            if (entry === void 0) continue;
            tasks.push({
              kind: "enter",
              node: entry[1],
              path: `${path}.properties.${entry[0]}`
            });
          }
        }
        break;
      }
      case "array":
        if (Object.hasOwn(node, "items")) tasks.push({
          kind: "enter",
          node: node.items,
          path: `${path}.items`
        });
        break;
      case "string":
      case "number":
      case "integer":
      case "boolean":
      case "null": {
        const hasEnum = Object.hasOwn(node, "enum");
        const allowed = hasEnum ? node.enum : void 0;
        const enumValid = isPlainJsonArray(allowed) && allowed.length > 0 && allowed.every((entry) => scalarMatches(schemaType, entry));
        if (hasEnum && !enumValid) violations.push(`${path}.enum must be a non-empty array of ${schemaType} values`);
        const hasConst = Object.hasOwn(node, "const");
        const declaredConst = hasConst ? node.const : void 0;
        const constValid = scalarMatches(schemaType, declaredConst);
        if (hasConst) {
          if (!constValid) violations.push(`${path}.const must be a ${schemaType} value`);
          else if (enumValid && !allowed.includes(declaredConst)) violations.push(`${path}.const must be one of ${path}.enum when both are declared`);
        }
        break;
      }
      /* v8 ignore next -- schemaType was narrowed from the closed SCHEMA_TYPES table above. */
      default:
        assertNever(schemaType, "JsonSchemaType");
    }
  }
}
function assertSupportedJsonSchema(schema) {
  const violations = [];
  checkSchemaNode(schema, "schema", violations, /* @__PURE__ */ new Set());
  if (violations.length > 0) throw new JsonSchemaError(violations);
}
function safelyIsJsonValue(value) {
  try {
    return isJsonValue(value);
  } catch {
    return false;
  }
}
function diagnosticPath(path) {
  return path === "" ? "arguments" : path;
}
function propertyPath(path, key) {
  return path === "" ? key : `${path}.${key}`;
}
function losslessValueViolation(path) {
  return [`"${diagnosticPath(path)}" must be a lossless JSON value`];
}
function appendViolations(target, source) {
  for (const violation of source) target.push(violation);
}
function valueFrame(node, value, path) {
  return {
    node,
    value,
    path,
    catches: false,
    phase: "start",
    children: [],
    childIndex: 0,
    violations: [],
    tailViolations: [],
    matches: 0
  };
}
function checkScalarValue(node, value, path) {
  const allowed = Object.hasOwn(node, "enum") ? node.enum : void 0;
  if (allowed !== void 0 && !allowed.includes(value)) return [`"${diagnosticPath(path)}" must be one of ${JSON.stringify(allowed)}`];
  if (Object.hasOwn(node, "const") && value !== node.const) return [`"${diagnosticPath(path)}" must be ${JSON.stringify(node.const)}`];
  return [];
}
function checkValue(schema, value, path) {
  const frames = [valueFrame(schema, value, path)];
  let rootResult;
  const receive = (result2) => {
    const parent = frames.at(-1);
    if (parent === void 0) {
      rootResult = result2;
      return;
    }
    if (parent.kind === "oneOf") {
      if (result2.length === 0) parent.matches++;
    } else appendViolations(parent.violations, result2);
  };
  const finish = (result2) => {
    frames.pop();
    receive(result2);
  };
  while (frames.length > 0) {
    const frame = frames.at(-1);
    if (frame === void 0) break;
    try {
      if (frame.phase === "children") {
        if (frame.childIndex < frame.children.length) {
          const child = frame.children[frame.childIndex];
          if (child === void 0) throw new Error("missing schema-value child frame");
          frame.childIndex++;
          frames.push(valueFrame(child.node, child.value, child.path));
          continue;
        }
        if (frame.kind === "oneOf") {
          finish(frame.matches === 1 ? [] : [`"${diagnosticPath(frame.path)}" must match exactly one oneOf branch (matched ${frame.matches})`]);
          continue;
        }
        appendViolations(frame.violations, frame.tailViolations);
        if (frame.violations.length > 0) finish(frame.violations);
        else if (frame.kind === "object") finish(safelyIsJsonValue(frame.value) ? [] : [`"${diagnosticPath(frame.path)}" must be a lossless JSON object`]);
        else finish(safelyIsJsonValue(frame.value) ? [] : [`"${diagnosticPath(frame.path)}" must be a dense lossless JSON array`]);
        continue;
      }
      const nodeType = Object.hasOwn(frame.node, "type") ? frame.node.type : void 0;
      frame.catches = !(nodeType !== void 0 && !SCHEMA_TYPES.includes(nodeType));
      const oneOf = Object.hasOwn(frame.node, "oneOf") ? frame.node.oneOf : void 0;
      if (oneOf !== void 0) {
        frame.kind = "oneOf";
        frame.children = Array.from(oneOf, (branch) => ({
          node: branch,
          value: frame.value,
          path: frame.path
        }));
        frame.childIndex = 0;
        frame.matches = 0;
        frame.phase = "children";
        continue;
      }
      if (nodeType === void 0) {
        finish(safelyIsJsonValue(frame.value) ? [] : losslessValueViolation(frame.path));
        continue;
      }
      switch (nodeType) {
        case "object": {
          if (!isPlainJsonRecord(frame.value)) {
            finish([`"${diagnosticPath(frame.path)}" must be an object`]);
            break;
          }
          const properties = Object.hasOwn(frame.node, "properties") ? frame.node.properties ?? {} : {};
          const violations = [];
          const required = Object.hasOwn(frame.node, "required") ? frame.node.required ?? [] : [];
          for (const key of required) if (!Object.hasOwn(frame.value, key) || frame.value[key] === void 0) violations.push(`missing required property "${propertyPath(frame.path, key)}"`);
          const children = [];
          for (const [key, child] of Object.entries(properties)) {
            if (!Object.hasOwn(frame.value, key) || frame.value[key] === void 0) continue;
            children.push({
              node: child,
              value: frame.value[key],
              path: propertyPath(frame.path, key)
            });
          }
          const tailViolations = [];
          if (Object.hasOwn(frame.node, "additionalProperties") && frame.node.additionalProperties === false) {
            for (const key of Object.keys(frame.value)) if (!Object.hasOwn(properties, key)) tailViolations.push(`"${propertyPath(frame.path, key)}" is not a declared property (additionalProperties: false)`);
          }
          frame.kind = "object";
          frame.children = children;
          frame.childIndex = 0;
          frame.violations = violations;
          frame.tailViolations = tailViolations;
          frame.phase = "children";
          break;
        }
        case "array": {
          if (!Array.isArray(frame.value)) {
            finish([`"${diagnosticPath(frame.path)}" must be an array`]);
            break;
          }
          const items = Object.hasOwn(frame.node, "items") ? frame.node.items : void 0;
          const children = items === void 0 ? [] : frame.value.flatMap((entry, index) => [{
            node: items,
            value: entry,
            path: `${frame.path}[${index}]`
          }]);
          frame.kind = "array";
          frame.children = children;
          frame.childIndex = 0;
          frame.violations = [];
          frame.phase = "children";
          break;
        }
        case "string":
          finish(typeof frame.value === "string" ? checkScalarValue(frame.node, frame.value, frame.path) : [`"${diagnosticPath(frame.path)}" must be a string`]);
          break;
        case "number":
          finish(typeof frame.value !== "number" ? [`"${diagnosticPath(frame.path)}" must be a number`] : !isJsonNumber(frame.value) ? [`"${diagnosticPath(frame.path)}" must be a finite JSON number`] : checkScalarValue(frame.node, frame.value, frame.path));
          break;
        case "integer":
          finish(!isJsonNumber(frame.value) || !Number.isInteger(frame.value) ? [`"${diagnosticPath(frame.path)}" must be an integer`] : checkScalarValue(frame.node, frame.value, frame.path));
          break;
        case "boolean":
          finish(typeof frame.value === "boolean" ? checkScalarValue(frame.node, frame.value, frame.path) : [`"${diagnosticPath(frame.path)}" must be a boolean`]);
          break;
        case "null":
          finish(frame.value === null ? checkScalarValue(frame.node, frame.value, frame.path) : [`"${diagnosticPath(frame.path)}" must be null`]);
          break;
        default:
          finish(assertNever(nodeType, "JsonSchemaType"));
      }
    } catch (error) {
      let failed = frames.pop();
      while (failed !== void 0 && !failed.catches) failed = frames.pop();
      if (failed === void 0) throw error;
      receive(losslessValueViolation(failed.path));
    }
  }
  return rootResult ?? losslessValueViolation(path);
}
function validateJsonSchemaValue(schema, value, path = "value") {
  return checkValue(schema, value, path);
}
var ANNOTATION_KEYS = [
  "description",
  "title",
  "default",
  "examples"
];
function authorError(message) {
  throw new JsonSchemaError([message]);
}
function copyAnnotations(source, target) {
  if (Object.hasOwn(source, "description")) target.description = source.description;
  if (Object.hasOwn(source, "title")) target.title = source.title;
  if (Object.hasOwn(source, "default")) target.default = source.default;
  if (Object.hasOwn(source, "examples")) target.examples = source.examples;
}
function assertAuthorKeys(source, path, allowed) {
  for (const key of Object.keys(source)) if (!allowed.includes(key)) authorError(`${path}.${key} is not supported by the value schema DSL`);
}
function assignCompiledNode(destination, node) {
  switch (destination.kind) {
    case "root":
      destination.holder.value = node;
      break;
    case "property":
      Object.defineProperty(destination.target, destination.key, {
        value: node,
        enumerable: true,
        configurable: true,
        writable: true
      });
      break;
    case "item":
      destination.target.items = node;
      break;
    case "one-of":
      destination.target[destination.index] = node;
      break;
  }
}
function assignCompiledPropertyMap(destination, compiled) {
  if (destination.kind === "root") destination.holder.value = compiled;
  else destination.target.properties = compiled.properties;
}
function runSchemaCompiler(initial) {
  const seen = /* @__PURE__ */ new Set();
  const tasks = [initial];
  for (let task = tasks.pop(); task !== void 0; task = tasks.pop()) {
    if (task.kind === "leave") {
      seen.delete(task.input);
      continue;
    }
    if (task.kind === "property-map-tail") {
      if (task.required.length > 0) {
        task.compiled.required = task.required;
        if (task.destination.kind === "object") task.destination.target.required = task.required;
      }
      continue;
    }
    if (task.kind === "property") {
      if (!isJsonSchemaRecord(task.property)) authorError(`${task.path} must be a value schema object`);
      if (Object.hasOwn(task.property, "required") && task.property.required !== true) authorError(`${task.path}.required must be true when present`);
      if (Object.hasOwn(task.property, "required") && task.property.required === true) task.required.push(task.key);
      tasks.push({
        kind: "value",
        input: task.property,
        path: task.path,
        allowRequired: true,
        destination: {
          kind: "property",
          target: task.properties,
          key: task.key
        }
      });
      continue;
    }
    if (task.kind === "property-map") {
      if (!isJsonSchemaRecord(task.input)) authorError(`${task.path} must be an object of value schemas`);
      if (seen.has(task.input)) authorError(`${task.path} is circular`);
      seen.add(task.input);
      const compiled = { properties: {} };
      const required = [];
      assignCompiledPropertyMap(task.destination, compiled);
      tasks.push({
        kind: "leave",
        input: task.input
      });
      tasks.push({
        kind: "property-map-tail",
        compiled,
        required,
        destination: task.destination
      });
      const entries = Object.entries(task.input);
      for (let index = entries.length - 1; index >= 0; index--) {
        const entry = entries[index];
        if (entry === void 0) continue;
        tasks.push({
          kind: "property",
          property: entry[1],
          path: `${task.path}.${entry[0]}`,
          key: entry[0],
          properties: compiled.properties,
          required
        });
      }
      continue;
    }
    const { input, path } = task;
    if (!isJsonSchemaRecord(input)) authorError(`${path} must be a value schema object`);
    if (seen.has(input)) authorError(`${path} is circular`);
    seen.add(input);
    const authorKeys = [...ANNOTATION_KEYS, ...task.allowRequired ? ["required"] : []];
    const node = {};
    assignCompiledNode(task.destination, node);
    tasks.push({
      kind: "leave",
      input
    });
    if (Object.hasOwn(input, "oneOf")) {
      assertAuthorKeys(input, path, [
        ...authorKeys,
        "oneOf",
        "type"
      ]);
      if (Object.hasOwn(input, "type")) authorError(`${path} cannot declare both type and oneOf`);
      if (!isPlainJsonArray(input.oneOf)) authorError(`${path}.oneOf must be an array of at least two value schemas`);
      const branches = [];
      node.oneOf = branches;
      copyAnnotations(input, node);
      for (let index = input.oneOf.length - 1; index >= 0; index--) tasks.push({
        kind: "value",
        input: input.oneOf[index],
        path: `${path}.oneOf[${index}]`,
        allowRequired: false,
        destination: {
          kind: "one-of",
          target: branches,
          index
        }
      });
      continue;
    }
    const inputType = Object.hasOwn(input, "type") ? input.type : void 0;
    switch (inputType) {
      case "json":
        assertAuthorKeys(input, path, [...authorKeys, "type"]);
        copyAnnotations(input, node);
        break;
      case "object":
        assertAuthorKeys(input, path, [
          ...authorKeys,
          "type",
          "properties",
          "additionalProperties"
        ]);
        if (!Object.hasOwn(input, "additionalProperties") || typeof input.additionalProperties !== "boolean") authorError(`${path}.additionalProperties must be explicitly true or false`);
        node.type = "object";
        copyAnnotations(input, node);
        node.additionalProperties = input.additionalProperties;
        if (Object.hasOwn(input, "properties")) tasks.push({
          kind: "property-map",
          input: input.properties,
          path: `${path}.properties`,
          destination: {
            kind: "object",
            target: node
          }
        });
        break;
      case "array":
        assertAuthorKeys(input, path, [
          ...authorKeys,
          "type",
          "items"
        ]);
        node.type = "array";
        copyAnnotations(input, node);
        if (Object.hasOwn(input, "items")) tasks.push({
          kind: "value",
          input: input.items,
          path: `${path}.items`,
          allowRequired: false,
          destination: {
            kind: "item",
            target: node
          }
        });
        break;
      case "string":
      case "number":
      case "integer":
      case "boolean":
      case "null":
        assertAuthorKeys(input, path, [
          ...authorKeys,
          "type",
          "enum",
          "const"
        ]);
        node.type = inputType;
        copyAnnotations(input, node);
        if (Object.hasOwn(input, "enum")) {
          if (!isPlainJsonArray(input.enum)) authorError(`${path}.enum must be a non-empty array of scalar values`);
          node.enum = Array.from(input.enum, (entry) => entry);
        }
        if (Object.hasOwn(input, "const")) node.const = input.const;
        break;
      default:
        authorError(`${path}.type must be string/number/integer/boolean/null/array/object/json, or use oneOf`);
    }
  }
}
function compilePropertyMap(input, path) {
  const holder = {};
  runSchemaCompiler({
    kind: "property-map",
    input,
    path,
    destination: {
      kind: "root",
      holder
    }
  });
  return holder.value ?? authorError(`${path} did not compile`);
}
function compileValueSchema(input, path) {
  const holder = {};
  runSchemaCompiler({
    kind: "value",
    input,
    path,
    allowRequired: false,
    destination: {
      kind: "root",
      holder
    }
  });
  return holder.value ?? authorError(`${path} did not compile`);
}
function valueSchemaSpecToJsonSchema(spec) {
  const schema = compileValueSchema(spec, "schema");
  assertSupportedJsonSchema(schema);
  return schema;
}
function parameterSchemaSpecToJsonSchema(spec) {
  const compiled = compilePropertyMap(spec, "parameters");
  const schema = {
    type: "object",
    properties: compiled.properties,
    ...compiled.required === void 0 ? {} : { required: compiled.required }
  };
  assertSupportedJsonSchema(schema);
  return schema;
}
var ToolArgsError = class extends HarnessError {
  /** Individual violations in schema-walk order. */
  violations;
  constructor(violations) {
    super(`invalid arguments: ${violations.join("; ")}`, "INVALID_ARGS");
    this.name = "ToolArgsError";
    this.violations = violations;
  }
};
function defineTool(options) {
  const userExecute = options.execute;
  const userFinalizeContent = options.finalizeContent;
  const userRender = options.output.render;
  const userPresentationMeta = options.output.presentationMeta;
  const userPresentCall = options.presentCall;
  const userPresentResult = options.presentResult;
  const userIsConcurrencySafe = options.isConcurrencySafe;
  if (options.timeoutMs !== void 0 && (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)) throw new Error(`defineTool(${options.name}): timeoutMs must be a positive finite number`);
  const parameters = parameterSchemaSpecToJsonSchema(options.parameters);
  const outputSchema = valueSchemaSpecToJsonSchema(options.output.schema);
  const validate = (args) => validateJsonSchemaValue(parameters, args, "");
  const tool = {
    name: options.name,
    description: options.description,
    parameters,
    output: {
      schema: outputSchema,
      render(args, value) {
        return userRender(args, value);
      },
      ...userPresentationMeta !== void 0 ? { presentationMeta(args, value) {
        return userPresentationMeta(args, value);
      } } : {}
    },
    ...options.timeoutMs !== void 0 ? { timeoutMs: options.timeoutMs } : {},
    async execute(args, exec) {
      const violations = validate(args);
      if (violations.length > 0) throw new ToolArgsError(violations);
      return userExecute(args, exec);
    }
  };
  if (userFinalizeContent) tool.finalizeContent = (exec, result2) => userFinalizeContent(exec, result2);
  if (userPresentCall) tool.presentCall = (args) => {
    if (validate(args).length > 0) return void 0;
    return userPresentCall(args);
  };
  if (userPresentResult) tool.presentResult = (args, result2) => {
    if (validate(args).length > 0) return void 0;
    return userPresentResult(args, result2);
  };
  if (userIsConcurrencySafe) tool.isConcurrencySafe = (args) => {
    if (validate(args).length > 0) return false;
    return userIsConcurrencySafe(args);
  };
  return tool;
}
var RUN_CODE_NAME = "run_code";
var TYPESCRIPT_FLAVOR = {
  description: "Execute a TypeScript program against the available tools. Takes two required arguments: `code`, the BODY of an async function (erasable syntax only; top-level `await` and `return` work), and `description`, a short summary of what the program does. Call tools as `await tools.name(args)` per the declarations in the system prompt. Only what you print or return comes back \u2014 curate it.",
  codeDescription: "The program: the body of an async TypeScript function."
};
var RUN_CODE_FLAVORS = {
  typescript: TYPESCRIPT_FLAVOR,
  python: {
    description: "Execute a Python program against the available tools. Takes two required arguments: `code`, the BODY of an async function (top-level `await` and `return` work), and `description`, a short summary of what the program does. Call tools as `await tools.name(args)` per the declarations in the system prompt. Answer with `print(...)` and/or `return <value>` \u2014 only that comes back, so curate it.",
    codeDescription: "The program: the body of an async Python function."
  }
};
var RUN_CODE_DESCRIPTION_PARAM_DESCRIPTION = 'Clear, concise description of what this program does in active voice, 5-10 words (shown in the UI). Examples: "Count TODO markers across packages"; "Read failing test and its fixture"; "Rename config key in every cordis.yml".';
function resolveFlavor(peekRuntime) {
  const runtime = peekRuntime();
  if (runtime === void 0) return TYPESCRIPT_FLAVOR;
  const flavor = RUN_CODE_FLAVORS[runtime.language];
  if (!Object.hasOwn(RUN_CODE_FLAVORS, runtime.language) || flavor === void 0) {
    const known = Object.keys(RUN_CODE_FLAVORS).map((name2) => JSON.stringify(name2)).join(", ");
    throw new Error(`dsh-tools: no run_code schema flavor registered for runtime language ${JSON.stringify(runtime.language)} (known: ${known})`);
  }
  return flavor;
}
var CodeRunFailedError = class extends HarnessError {
  constructor(message) {
    super(message, "CODE_RUN_FAILED");
    this.name = "CodeRunFailedError";
  }
};
function jsonNormalizeArgs(value) {
  let snapshot;
  try {
    snapshot = snapshotJsonValue(value);
  } catch (error) {
    throw new Error(`tool arguments must be lossless JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (snapshot === void 0) throw new Error("tool arguments must be lossless JSON (call the tool with an arguments object, e.g. `{}`)");
  const logged = snapshotJsonValue(snapshot);
  if (logged === void 0) throw new Error("tool arguments could not be detached for durable logging");
  return {
    dispatched: snapshot,
    logged
  };
}
var JSON_INDENT = "  ";
var MAX_JSON_INDENT_CHARS = 10;
function renderJsonValue(value) {
  const chunks = [];
  const tasks = [{
    kind: "value",
    value,
    depth: 0,
    compact: false
  }];
  for (let task = tasks.pop(); task !== void 0; task = tasks.pop()) {
    if (task.kind === "text") {
      chunks.push(task.text);
      continue;
    }
    const current = task.value;
    if (current === null || typeof current === "boolean" || typeof current === "number") {
      chunks.push(String(current));
      continue;
    }
    if (typeof current === "string") {
      chunks.push(JSON.stringify(current));
      continue;
    }
    const compact = task.compact || (task.depth + 1) * 2 > MAX_JSON_INDENT_CHARS;
    const childDepth = task.depth + 1;
    if (Array.isArray(current)) {
      chunks.push("[");
      if (current.length === 0) {
        chunks.push("]");
        continue;
      }
      tasks.push({
        kind: "text",
        text: compact ? "]" : `
${JSON_INDENT.repeat(task.depth)}]`
      });
      for (let index = current.length - 1; index >= 0; index--) {
        const item = current[index];
        if (item === void 0) throw new Error("cannot render a sparse JSON array");
        tasks.push({
          kind: "value",
          value: item,
          depth: childDepth,
          compact
        });
        tasks.push({
          kind: "text",
          text: compact ? index === 0 ? "" : "," : `${index === 0 ? "\n" : ",\n"}${JSON_INDENT.repeat(childDepth)}`
        });
      }
      continue;
    }
    const keys = Object.keys(current);
    chunks.push("{");
    if (keys.length === 0) {
      chunks.push("}");
      continue;
    }
    tasks.push({
      kind: "text",
      text: compact ? "}" : `
${JSON_INDENT.repeat(task.depth)}}`
    });
    for (let index = keys.length - 1; index >= 0; index--) {
      const key = keys[index];
      if (key === void 0) throw new Error("cannot render a missing JSON object key");
      const item = current[key];
      if (item === void 0) throw new Error("cannot render an undefined JSON object property");
      tasks.push({
        kind: "value",
        value: item,
        depth: childDepth,
        compact
      });
      tasks.push({
        kind: "text",
        text: compact ? `${index === 0 ? "" : ","}${JSON.stringify(key)}:` : `${index === 0 ? "\n" : ",\n"}${JSON_INDENT.repeat(childDepth)}${JSON.stringify(key)}: `
      });
    }
  }
  return chunks.join("");
}
function renderValue(value) {
  return typeof value === "string" ? value : renderJsonValue(value);
}
function createRunCodeTool(registry, options) {
  const { requireRuntime, peekRuntime, maxParallel, shapeDispatchLog } = options;
  const definition = defineTool({
    name: RUN_CODE_NAME,
    description: TYPESCRIPT_FLAVOR.description,
    parameters: {
      code: {
        type: "string",
        required: true,
        description: TYPESCRIPT_FLAVOR.codeDescription
      },
      description: {
        type: "string",
        required: true,
        description: RUN_CODE_DESCRIPTION_PARAM_DESCRIPTION
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          logs: {
            type: "array",
            required: true,
            items: { type: "string" }
          },
          result: { type: "json" }
        }
      },
      render: (_args, value) => {
        const rendered = value.result === void 0 ? "" : renderValue(value.result);
        const parts = [value.logs.join("\n"), rendered].filter((part) => part.length > 0);
        return [{
          type: "text",
          text: parts.length > 0 ? parts.join("\n") : "(run_code completed with no output)"
        }];
      }
    },
    async execute(args, exec) {
      if (args.description.trim().length === 0) throw new Error("invalid description: expected a non-empty string");
      const runtime = requireRuntime();
      const runController = new AbortController();
      const onOuterAbort = () => {
        runController.abort(exec.signal.reason);
      };
      exec.signal.addEventListener("abort", onOuterAbort, { once: true });
      let dispatches = 0;
      const pendingQueue = [];
      const inFlight = /* @__PURE__ */ new Set();
      const logWork = /* @__PURE__ */ new Set();
      const commitQueue = [];
      let exclusiveActive = false;
      let driving = false;
      let driverRun = Promise.resolve();
      let wake;
      const wakeup = () => {
        const release = wake;
        wake = void 0;
        release?.();
      };
      const drive = () => {
        if (driving) return driverRun;
        driving = true;
        driverRun = (async () => {
          try {
            for (; ; ) {
              const signal = new Promise((resolve4) => {
                wake = resolve4;
              });
              const commitHead = commitQueue[0];
              if (commitHead !== void 0 && commitHead.settled) {
                commitQueue.shift();
                await commitHead.commit();
                if (commitHead.mode === "exclusive") exclusiveActive = false;
                continue;
              }
              const head = pendingQueue[0];
              if (head !== void 0) {
                if (runController.signal.aborted) {
                  pendingQueue.shift();
                  head.abandon();
                  continue;
                }
                const mode = head.classify();
                if (!exclusiveActive && (mode === "exclusive" ? inFlight.size === 0 : inFlight.size < maxParallel)) {
                  if (mode === "exclusive") exclusiveActive = true;
                  head.mode = mode;
                  pendingQueue.shift();
                  commitQueue.push(head);
                  await head.start();
                  const flight = head.flight.finally(() => {
                    inFlight.delete(flight);
                    wakeup();
                  });
                  inFlight.add(flight);
                  continue;
                }
              }
              if (pendingQueue.length === 0 && commitQueue.length === 0 && inFlight.size === 0) return;
              await signal;
            }
          } finally {
            driving = false;
            wake = void 0;
          }
        })();
        return driverRun;
      };
      const drainDispatches = async () => {
        await drive();
        while (logWork.size > 0) await Promise.allSettled([...logWork]);
      };
      const runOver = () => runController.signal.aborted;
      const binding = (name2) => async (rawArgs) => {
        if (runOver()) throw new Error(`run_code run is over (${String(runController.signal.reason)}); ${name2} not dispatched`);
        const normalized = jsonNormalizeArgs(rawArgs);
        const n = ++dispatches;
        const subCallId = CallId(`${String(exec.callId)}:code:${n}`);
        const input = {
          callId: subCallId,
          rootCallId: exec.rootCallId,
          name: name2,
          arguments: normalized.dispatched,
          ...exec.agent ? { agent: exec.agent } : {},
          parent: exec.token,
          signal: runController.signal
        };
        const scheduler = registry[TOOL_RUNTIME_SCHEDULER];
        const outcome = await new Promise((resolve4, reject) => {
          let parked;
          const settle = (result2) => {
            resolve4(result2.isError ? {
              isError: true,
              message: result2.error.message
            } : {
              isError: false,
              value: result2.value
            });
            const agent = exec.agent;
            if (agent === void 0) return;
            const task = (async () => {
              const logged = await shapeDispatchLog({
                exec,
                agent,
                subCallId,
                name: name2,
                isError: result2.isError,
                content: result2.content
              });
              agent.session.append("tool/code-dispatch", {
                rootCallId: exec.rootCallId,
                parentCallId: exec.callId,
                subCallId,
                name: name2,
                arguments: normalized.logged,
                isError: result2.isError,
                content: logged
              });
            })().finally(() => {
              logWork.delete(task);
            });
            logWork.add(task);
          };
          pendingQueue.push({
            flight: Promise.resolve(),
            settled: false,
            classify: () => registry.executionMode(input).kind,
            abandon: () => {
              reject(/* @__PURE__ */ new Error(`run_code run is over (${String(runController.signal.reason)}); ${name2} tool call abandoned`));
            },
            async start() {
              exec.agent?.session.append("tool/code-dispatch-start", {
                rootCallId: exec.rootCallId,
                parentCallId: exec.callId,
                subCallId,
                name: name2,
                arguments: normalized.logged
              });
              const prepared = await scheduler.prepare(input);
              if (prepared.kind === "dispatch") {
                this.flight = scheduler.dispatch(prepared.exec).then((dispatchOutcome) => {
                  parked = {
                    kind: dispatchOutcome.kind,
                    exec: prepared.exec,
                    result: dispatchOutcome.result
                  };
                  this.settled = true;
                });
                return;
              }
              parked = {
                kind: prepared.kind,
                exec: prepared.exec,
                result: prepared.result
              };
              this.settled = true;
            },
            async commit() {
              if (parked === void 0) return;
              const result2 = parked.kind === "post-result" ? await scheduler.finalize(parked.exec, parked.result) : scheduler.finish(parked.exec, parked.result);
              for (const context of result2.additionalContexts ?? []) exec.deferContext(context);
              if (result2.concludesTurn) exec.concludeTurn();
              settle(result2);
              while (logWork.size > maxParallel) await Promise.race(logWork);
            }
          });
          wakeup();
          drive();
        });
        if (runOver()) throw new Error(`run_code run is over (${String(runController.signal.reason)}); ${name2} result discarded`);
        if (outcome.isError) throw new Error(outcome.message);
        return outcome.value;
      };
      const functions = /* @__PURE__ */ Object.create(null);
      for (const schema of registry.schemas(exec.agent)) {
        if (schema.name === "run_code") continue;
        Object.defineProperty(functions, schema.name, {
          enumerable: true,
          value: binding(schema.name)
        });
      }
      try {
        let result2;
        try {
          result2 = await runtime.run({
            program: args.code,
            bindings: [{
              global: "tools",
              functions,
              errorClass: {
                name: "ToolCallError",
                memberNameProperty: "toolName"
              }
            }],
            signal: runController.signal
          });
        } finally {
          runController.abort("run_code settled");
          await drainDispatches();
        }
        if (result2.error) {
          const logsText = result2.logs.length > 0 ? `
Captured output:
${result2.logs.join("\n")}` : "";
          throw new CodeRunFailedError(`code run failed (${result2.error.kind}): ${result2.error.message}${logsText}`);
        }
        return {
          logs: result2.logs,
          ...result2.value !== void 0 ? { result: result2.value } : {}
        };
      } finally {
        exec.signal.removeEventListener("abort", onOuterAbort);
      }
    },
    presentCall: (args) => ({
      card: "generic",
      title: args.description,
      kind: "execute",
      rawInput: args.code
    })
  });
  Object.defineProperty(definition, "description", {
    enumerable: true,
    get: () => resolveFlavor(peekRuntime).description
  });
  Object.defineProperty(definition, "parameters", {
    enumerable: true,
    get: () => parameterSchemaSpecToJsonSchema({
      code: {
        type: "string",
        required: true,
        description: resolveFlavor(peekRuntime).codeDescription
      },
      description: {
        type: "string",
        required: true,
        description: RUN_CODE_DESCRIPTION_PARAM_DESCRIPTION
      }
    })
  });
  return definition;
}
var IDENTIFIER$1 = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function renderKey(name2) {
  return IDENTIFIER$1.test(name2) ? name2 : JSON.stringify(name2);
}
function pad$1(indent) {
  return "  ".repeat(indent);
}
function docLines$1(description, indent) {
  if (typeof description !== "string" || description.length === 0) return [];
  const collapsed = description.replace(/\s+/g, " ").trim();
  return [`${pad$1(indent)}/** ${collapsed.replaceAll("*/", String.raw`*\/`)} */`];
}
function renderScalar(value) {
  return JSON.stringify(value);
}
function renderConstrainedScalar$1(node, type) {
  const broad = type === "integer" ? "number" : type;
  if (Object.hasOwn(node, "const")) return renderScalar(node.const);
  if (Object.hasOwn(node, "enum")) return node.enum.map(renderScalar).join(" | ");
  return broad;
}
function typeDocumentFrom(parts) {
  return {
    parts,
    containsUnionOrIntersection: parts.some((part) => typeof part === "string" ? part.includes("|") || part.includes("&") : part.containsUnionOrIntersection)
  };
}
function typeDocument(...parts) {
  return typeDocumentFrom(parts);
}
function flattenTypeDocument(document) {
  const chunks = [];
  const tasks = [document];
  for (let task = tasks.pop(); task !== void 0; task = tasks.pop()) {
    if (typeof task === "string") {
      chunks.push(task);
      continue;
    }
    for (let index = task.parts.length - 1; index >= 0; index--) {
      const part = task.parts[index];
      if (part !== void 0) tasks.push(part);
    }
  }
  return chunks.join("");
}
function schemaRenderFrame(node, indent) {
  return {
    node,
    indent,
    phase: "start",
    children: [],
    childIndex: 0,
    childDocuments: [],
    entries: []
  };
}
function renderSupportedSchema(schema, indent) {
  const frames = [schemaRenderFrame(schema, indent)];
  let rootDocument;
  const finish = (document) => {
    frames.pop();
    const parent = frames.at(-1);
    if (parent === void 0) rootDocument = document;
    else parent.childDocuments.push(document);
  };
  while (frames.length > 0) {
    const frame = frames.at(-1);
    if (frame === void 0) break;
    if (frame.phase === "children") {
      if (frame.childIndex < frame.children.length) {
        const child = frame.children[frame.childIndex];
        if (child === void 0) throw new Error("missing schema render child");
        frame.childIndex++;
        frames.push(schemaRenderFrame(child.node, child.indent));
        continue;
      }
      if (frame.kind === "oneOf") {
        const parts2 = [];
        for (let index = 0; index < frame.childDocuments.length; index++) {
          if (index > 0) parts2.push(" | ");
          const child = frame.childDocuments[index];
          if (child !== void 0) parts2.push(child);
        }
        finish(typeDocumentFrom(parts2));
        continue;
      }
      if (frame.kind === "array") {
        const child = frame.childDocuments[0];
        if (child === void 0) throw new Error("missing array item type");
        finish(child.containsUnionOrIntersection ? typeDocument("(", child, ")[]") : typeDocument(child, "[]"));
        continue;
      }
      const required = new Set(frame.node.required);
      const parts = ["{"];
      for (let index = 0; index < frame.entries.length; index++) {
        const entry = frame.entries[index];
        const child = frame.childDocuments[index];
        if (entry === void 0 || child === void 0) throw new Error("missing object property type");
        const [name2, prop] = entry;
        for (const line of docLines$1(prop.description, frame.indent + 1)) parts.push("\n", line);
        parts.push("\n", `${pad$1(frame.indent + 1)}${renderKey(name2)}${required.has(name2) ? "" : "?"}: `, child, ";");
      }
      parts.push("\n", `${pad$1(frame.indent)}}`);
      const declared = typeDocumentFrom(parts);
      finish(frame.node.additionalProperties === false ? declared : typeDocument(declared, " & Record<string, JsonValue>"));
      continue;
    }
    const node = frame.node;
    if (node.oneOf !== void 0) {
      frame.kind = "oneOf";
      frame.children = Array.from(node.oneOf, (child) => ({
        node: child,
        indent: frame.indent
      }));
      frame.childIndex = 0;
      frame.childDocuments = [];
      frame.phase = "children";
      continue;
    }
    if (node.type === void 0) {
      finish(typeDocument("JsonValue"));
      continue;
    }
    switch (node.type) {
      case "string":
      case "number":
      case "integer":
      case "boolean":
      case "null":
        finish(typeDocument(renderConstrainedScalar$1(node, node.type)));
        break;
      case "array":
        if (node.items === void 0) finish(typeDocument("JsonValue[]"));
        else {
          frame.kind = "array";
          frame.children = [{
            node: node.items,
            indent: frame.indent
          }];
          frame.childIndex = 0;
          frame.childDocuments = [];
          frame.phase = "children";
        }
        break;
      case "object": {
        const open = node.additionalProperties !== false;
        const entries = Object.entries(node.properties ?? {});
        if (entries.length === 0) finish(typeDocument(open ? "Record<string, JsonValue>" : "Record<string, never>"));
        else {
          frame.kind = "object";
          frame.entries = entries;
          frame.children = entries.map(([, child]) => ({
            node: child,
            indent: frame.indent + 1
          }));
          frame.childIndex = 0;
          frame.childDocuments = [];
          frame.phase = "children";
        }
        break;
      }
      /* v8 ignore next -- assertSupportedJsonSchema narrowed this closed type union. */
      default:
        finish(typeDocument("unknown"));
    }
  }
  return rootDocument ?? typeDocument("unknown");
}
function jsonSchemaToTs(schema, indent = 0) {
  try {
    assertSupportedJsonSchema(schema);
    return flattenTypeDocument(renderSupportedSchema(schema, indent));
  } catch {
    return "unknown";
  }
}
var SDK_INSTRUCTIONS$1 = `## Writing code for run_code

\`run_code\` takes two required arguments: \`code\` \u2014 the body of an async TypeScript function (erasable syntax only \u2014 no \`enum\` or namespaces; type annotations are advisory, the code runs type-stripped) \u2014 and \`description\`, a short summary of what the program does. Inside the program:

- Call tools as \`await tools.name(args)\` \u2014 quoted access for exotic names: \`tools["my-tool"](args)\`. Every call resolves to the tool's typed canonical JSON value. Tool arguments must be lossless JSON.
- A FAILED tool call rejects with \`ToolCallError\`, whose \`toolName\` identifies the failed tool and whose \`message\` is human-readable \u2014 \`try/catch\` it to handle and continue.
- Independent read-only calls MAY overlap under \`Promise.all\` (safe calls run concurrently; mutating calls run alone, in submission order). Sequence dependent work with \`await\`.
- Emit results with \`return\` and/or \`console.log(...)\`. ONLY what you print or return comes back to you \u2014 intermediate tool results never enter the conversation, so extract just what you need.

The available tools:`;
function renderToolsSdk(schemas) {
  const sorted = [...schemas].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const argsMembers = [];
  const outputMembers = [];
  for (const schema of sorted) {
    argsMembers.push(...docLines$1(schema.description, 1));
    argsMembers.push(`${pad$1(1)}${renderKey(schema.name)}: ${jsonSchemaToTs(schema.parameters, 1)};`);
    outputMembers.push(`${pad$1(1)}${renderKey(schema.name)}: ${jsonSchemaToTs(schema.output, 1)};`);
  }
  return `${SDK_INSTRUCTIONS$1}

\`\`\`ts
type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

${[
    `interface ToolArgsMap {${argsMembers.length > 0 ? `
${argsMembers.join("\n")}
` : ""}}`,
    `interface ToolOutputMap {${outputMembers.length > 0 ? `
${outputMembers.join("\n")}
` : ""}}`,
    "type ToolName = keyof ToolOutputMap",
    [
      "declare class ToolCallError extends Error {",
      '  readonly name: "ToolCallError";',
      "  readonly toolName: ToolName;",
      "}"
    ].join("\n"),
    [
      "declare const tools: {",
      "  [K in ToolName]: (args: ToolArgsMap[K]) => Promise<ToolOutputMap[K]>;",
      "}"
    ].join("\n")
  ].join("\n\n")}
\`\`\``;
}
var IDENTIFIER = new RegExp("^[\\p{XID_Start}_]\\p{XID_Continue}*$", "u");
function isBareIdentifier(name2) {
  return IDENTIFIER.test(name2) && name2.normalize("NFKC") === name2;
}
var RESERVED = /* @__PURE__ */ new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
  "__debug__"
]);
var TYPING_ORDER = [
  "Any",
  "Literal",
  "NotRequired",
  "Protocol",
  "TypedDict"
];
function pad(indent) {
  return "    ".repeat(indent);
}
var UNPRINTABLE = /[\u0000-\u0008\u000e-\u001f\u007f-\u009f]/g;
var LONE_SURROGATE = /[\ud800-\udfff]/gu;
function describe(schema) {
  const description = schema.description;
  if (typeof description !== "string") return void 0;
  const collapsed = description.replace(/\s+/g, " ").replace(UNPRINTABLE, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, "0")}`).replace(LONE_SURROGATE, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`).trim();
  return collapsed.length === 0 ? void 0 : collapsed;
}
function docLines(description, indent) {
  const collapsed = describe({ description });
  if (collapsed === void 0) return [];
  const escaped = collapsed.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return [`${pad(indent)}"""${escaped}"""`];
}
function camelCase(raw) {
  const joined = raw.split(/[^\p{XID_Continue}]+|_+/u).filter((part) => part.length > 0).map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join("").normalize("NFKC");
  return (new RegExp("^\\p{XID_Start}", "u").test(joined) ? joined : `Tool${joined}`).normalize("NFKC");
}
var MAX_CLASS_NAME_BASE = 120;
var MAX_LIST_NESTING = 180;
function capClassNameBase(base) {
  if (base.length <= MAX_CLASS_NAME_BASE) return base;
  const capped = base.slice(0, MAX_CLASS_NAME_BASE);
  return /[\uD800-\uDBFF]$/.test(capped) ? capped.slice(0, -1) : capped;
}
function allocateClassName(base, state) {
  const capped = capClassNameBase(base);
  let name2 = capped;
  if (state.usedClassNames.has(name2)) {
    let n = state.nextClassCounter.get(capped) ?? 2;
    while (state.usedClassNames.has(`${capped}${n}`)) n++;
    name2 = `${capped}${n}`;
    state.nextClassCounter.set(capped, n + 1);
  }
  state.usedClassNames.add(name2);
  return name2;
}
function childClassName(base, segment) {
  return capClassNameBase(`${base}${segment}`.normalize("NFKC"));
}
function pyScalar(value) {
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" && Number.isInteger(value) && !Number.isSafeInteger(value)) return BigInt(value).toString();
  return String(value);
}
function renderConstrainedScalar(node, broad, state) {
  if (node.const !== void 0) {
    state.typing.add("Literal");
    return `Literal[${pyScalar(node.const)}]`;
  }
  if (node.enum !== void 0) {
    state.typing.add("Literal");
    return `Literal[${node.enum.map(pyScalar).join(", ")}]`;
  }
  return broad;
}
function renderType(schema, className, state) {
  const newFrame = (schema2, className2, listDepth) => ({
    schema: schema2,
    className: className2,
    phase: "start",
    listDepth,
    children: [],
    childIndex: 0,
    childTypes: [],
    entries: []
  });
  try {
    assertSupportedJsonSchema(schema);
    const frames = [newFrame(schema, className, 0)];
    let result2;
    const finish = (type) => {
      frames.pop();
      const parent = frames.at(-1);
      if (parent === void 0) result2 = type;
      else parent.childTypes.push(type);
    };
    while (frames.length > 0) {
      const frame = frames.at(-1);
      if (frame === void 0) break;
      if (frame.phase === "children") {
        if (frame.childIndex < frame.children.length) {
          const child = frame.children[frame.childIndex];
          if (child === void 0) throw new Error("missing python render child");
          frame.childIndex++;
          frames.push(newFrame(child.schema, child.className, child.listDepth));
          continue;
        }
        if (frame.kind === "oneOf") {
          let union = "";
          for (const [index, childType] of frame.childTypes.entries()) union = index === 0 ? childType : `${union} | ${childType}`;
          finish(union);
          continue;
        }
        if (frame.kind === "array") {
          finish(`list[${frame.childTypes[0] ?? "Any"}]`);
          continue;
        }
        const node2 = frame.node;
        const name2 = frame.allocated;
        if (node2 === void 0 || name2 === void 0) throw new Error("missing typeddict frame state");
        const required = new Set(node2.required);
        const lines = [`class ${name2}(TypedDict):`];
        for (let index = 0; index < frame.entries.length; index++) {
          const entry = frame.entries[index];
          const fieldType = frame.childTypes[index];
          if (entry === void 0 || fieldType === void 0) throw new Error("missing typeddict field type");
          const [field, fieldSchema] = entry;
          const description = describe(fieldSchema);
          if (description !== void 0) lines.push(`${pad(1)}# ${description}`);
          if (required.has(field)) lines.push(`${pad(1)}${field}: ${fieldType}`);
          else {
            state.typing.add("NotRequired");
            lines.push(`${pad(1)}${field}: NotRequired[${fieldType}]`);
          }
        }
        if (node2.additionalProperties !== false) lines.push(`${pad(1)}# Additional keys beyond those declared are allowed.`);
        if (lines.length === 1) lines.push(`${pad(1)}pass`);
        state.classes.push(lines.join("\n"));
        finish(name2);
        continue;
      }
      frame.phase = "children";
      const node = frame.schema;
      if (node.oneOf !== void 0) {
        frame.kind = "oneOf";
        frame.children = node.oneOf.map((branch, index) => ({
          schema: branch,
          className: childClassName(frame.className, `${index + 1}`),
          listDepth: frame.listDepth
        }));
        continue;
      }
      if (node.type === void 0) {
        state.typing.add("Any");
        finish("Any");
        continue;
      }
      switch (node.type) {
        case "string":
          finish(renderConstrainedScalar(node, "str", state));
          break;
        case "number":
          finish(renderConstrainedScalar(node, "float", state));
          break;
        case "integer":
          finish(renderConstrainedScalar(node, "int", state));
          break;
        case "boolean":
          finish(renderConstrainedScalar(node, "bool", state));
          break;
        case "null":
          finish("None");
          break;
        case "array":
          if (node.items === void 0) {
            state.typing.add("Any");
            finish("list[Any]");
            break;
          }
          if (frame.listDepth >= MAX_LIST_NESTING) {
            state.typing.add("Any");
            finish("Any");
            break;
          }
          frame.kind = "array";
          frame.children = [{
            schema: node.items,
            className: frame.className,
            listDepth: frame.listDepth + 1
          }];
          break;
        case "object": {
          const entries = Object.entries(node.properties ?? {});
          if (className === "" || !entries.every(([name2]) => isBareIdentifier(name2) && !RESERVED.has(name2) && !(name2.startsWith("__") && !name2.endsWith("__")))) {
            state.typing.add("Any");
            finish("dict[str, Any]");
            break;
          }
          if (entries.length === 0 && node.additionalProperties !== false) {
            state.typing.add("Any");
            finish("dict[str, Any]");
            break;
          }
          frame.kind = "typeddict";
          frame.node = node;
          frame.allocated = allocateClassName(frame.className, state);
          state.typing.add("TypedDict");
          frame.entries = entries;
          frame.children = entries.map(([field, child]) => ({
            schema: child,
            className: childClassName(frame.allocated ?? "", camelCase(field)),
            listDepth: 1
          }));
          break;
        }
        /* v8 ignore next 4 -- assertSupportedJsonSchema narrowed this closed type union. */
        default:
          state.typing.add("Any");
          finish("Any");
      }
    }
    return result2 ?? "Any";
  } catch {
    state.typing.add("Any");
    return "Any";
  }
}
var SDK_INSTRUCTIONS = `## Writing code for run_code

\`run_code\` takes two required arguments: \`code\` \u2014 the body of an async Python function (top-level \`await\` and \`return\` both work) \u2014 and \`description\`, a short summary of what the program does. At run time exactly two of the names declared below are bound: \`tools\` and \`ToolCallError\`. Everything else is a STATIC STUB describing argument and return types \u2014 in particular the \`TypedDict\` classes do NOT exist at run time, so build arguments as plain \`dict\`/\`list\` JSON values: \`await tools.name({"field": 1})\`, never \`FooArgs(field=1)\`, which raises \`NameError\`. Inside the program:

- Call tools as \`await tools.name(args)\` \u2014 subscript access for exotic, reserved, or underscore-leading names: \`await tools["my-tool"](args)\`. Every call resolves to the tool's typed canonical JSON value (each method's return type below). Tool arguments must be lossless JSON.
- A FAILED tool call raises \`ToolCallError\`, whose \`toolName\` identifies the failed tool and whose message is human-readable \u2014 wrap in \`try/except\` to handle and continue.
- Independent read-only calls MAY overlap under \`asyncio.gather\` (safe calls run concurrently; mutating calls run alone, in submission order). Sequence dependent work with \`await\`.
- Emit the run's answer with \`print(...)\` and/or a top-level \`return <value>\`; the returned value must be lossless JSON. ONLY what you print and the returned value come back \u2014 intermediate tool results never enter the conversation, so extract just what you need.

The available tools:`;
function renderToolsSdkPy(schemas) {
  const sorted = [...schemas].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const state = {
    classes: [],
    usedClassNames: /* @__PURE__ */ new Set(),
    nextClassCounter: /* @__PURE__ */ new Map(),
    typing: /* @__PURE__ */ new Set(["Protocol"])
  };
  const members = [];
  let statements = 0;
  for (const schema of sorted) {
    const argType = renderType(schema.parameters, `${camelCase(schema.name)}Args`, state);
    const outputType = renderType(schema.output, `${camelCase(schema.name)}Output`, state);
    if (isBareIdentifier(schema.name) && !RESERVED.has(schema.name) && !schema.name.startsWith("_")) {
      const doc = docLines(schema.description, 2);
      members.push(doc.length > 0 ? `${pad(1)}async def ${schema.name}(self, args: ${argType}) -> ${outputType}:` : `${pad(1)}async def ${schema.name}(self, args: ${argType}) -> ${outputType}: ...`);
      members.push(...doc);
      statements += 1;
    } else {
      members.push(`${pad(1)}# tools[${JSON.stringify(schema.name)}](args: ${argType}) -> ${outputType}`);
      const description = describe(schema);
      if (description !== void 0) members.push(`${pad(1)}#   ${description}`);
    }
  }
  const body = (statements > 0 ? members : [`${pad(1)}pass`, ...members]).join("\n");
  const imports = TYPING_ORDER.filter((symbol) => state.typing.has(symbol));
  const classBlock = state.classes.length > 0 ? `${state.classes.join("\n\n")}

` : "";
  return `${SDK_INSTRUCTIONS}

\`\`\`python
${`from typing import ${imports.join(", ")}

class ToolCallError(Exception):
    toolName: str

${classBlock}class Tools(Protocol):
${body}

tools: Tools`}
\`\`\``;
}
var COLLAPSE_SECTION_ORDER = 99;
var CODE_ONLY_INSTRUCTION = `\`${RUN_CODE_NAME}\` is the only tool you can call directly \u2014 a tool call naming any other tool fails. Reach every tool the SDK declares below from inside the program.`;
var SDK_RENDERERS = {
  typescript: renderToolsSdk,
  python: renderToolsSdkPy
};
var TOOL_RUNTIME_SCHEDULER = Symbol("@deepseek-ai/dsh-tools.scheduler");
var TOOL_ABORTED = "ABORTED";
var TOOL_ABORTED_BEFORE_DISPATCH = "ABORTED_BEFORE_DISPATCH";
var ToolNotFoundError = class extends HarnessError {
  /**
  * @param toolName - the name the caller asked for.
  * @param reachableFrom - how the model reaches this tool instead, when the
  *   name IS visible and only the presentation denies calling it directly.
  *   Omitted for a name that is registered nowhere.
  */
  constructor(toolName, reachableFrom) {
    super(reachableFrom === void 0 ? `unknown tool "${toolName}"` : `unknown tool "${toolName}": ${reachableFrom}`, "UNKNOWN_TOOL");
    this.name = "ToolNotFoundError";
  }
};
var ToolOutputError = class extends HarnessError {
  /** Schema/value violations in validation order. */
  violations;
  constructor(toolName, violations) {
    super(`tool "${toolName}" returned invalid output: ${violations.join("; ")}`, "INVALID_TOOL_OUTPUT");
    this.name = "ToolOutputError";
    this.violations = violations;
  }
};
function projectionError(toolName, projector, error) {
  return new ToolOutputError(toolName, [`output.${projector} failed: ${errorMessage(error)}`]);
}
function snapshotProjection(toolName, projector, candidate) {
  try {
    const detached = snapshotJsonValue(candidate);
    if (detached === void 0) throw new ToolOutputError(toolName, [`output.${projector} returned non-lossless JSON`]);
    return detached;
  } catch (error) {
    if (error instanceof ToolOutputError) throw error;
    throw projectionError(toolName, projector, error);
  }
}
function snapshotToolValue(toolName, candidate) {
  try {
    const detached = snapshotJsonValue(candidate);
    if (detached === void 0) throw new ToolOutputError(toolName, ["value is not lossless JSON"]);
    return detached;
  } catch (error) {
    if (error instanceof ToolOutputError) throw error;
    throw new ToolOutputError(toolName, [`value snapshot failed: ${errorMessage(error)}`]);
  }
}
function errorMessage(error) {
  try {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
    return String(error);
  } catch {
    return "<unprintable thrown value>";
  }
}
function failureMessageFromContent(content) {
  const text = content.map((block) => block.type === "text" ? block.text : `[${block.type} content]`).join("\n");
  return text.length > 0 ? text : "tool result blocked by post-execute policy";
}
function materializePresentation(candidate) {
  const detached = snapshotJsonValue(candidate);
  if (detached === void 0) throw new TypeError("tool result must be losslessly JSON-serializable");
  return deepFreeze(detached);
}
function errorInfo(error) {
  try {
    return error instanceof HarnessError ? {
      name: error.name,
      code: error.code
    } : void 0;
  } catch {
    return;
  }
}
var ToolLayer = class {
  tools;
  restrictions = new AnonymousEntries();
  guards = new AnonymousEntries();
  /**
  * Presentation this scope's agent declared for itself, shadowing the
  * deployment default. One cell rather than an entry table: two answers to
  * "which form does the model see" is a contradiction, not a merge.
  */
  mode;
  constructor(scope) {
    this.tools = new NamedEntries((name2) => /* @__PURE__ */ new Error(scope === void 0 ? `tool "${name2}" is already registered (for a per-agent variant, register through that agent's \`agent.ctx\` instead)` : `tool "${name2}" is already registered in this scope`));
  }
  /** Whether every contribution table in this aggregate layer is empty. */
  isEmpty() {
    return this.tools.isEmpty() && this.restrictions.isEmpty() && this.guards.isEmpty() && this.mode === void 0;
  }
  /** Whether every compiled restriction in this layer admits a global tool name. */
  admits(name2) {
    for (const filter of this.restrictions.values()) if (filter.allow !== void 0 && !filter.allow.has(name2) || filter.deny !== void 0 && filter.deny.has(name2)) return false;
    return true;
  }
  /** First monotonic denial from this layer's live guard registrations. */
  guardReason(exec) {
    for (const guard of this.guards.values()) {
      const reason = guard(exec);
      if (reason !== void 0) return reason;
    }
  }
};
function resolveMaxParallelSubCalls(value) {
  const maxParallelSubCalls = value ?? 10;
  if (!Number.isInteger(maxParallelSubCalls) || maxParallelSubCalls < 1) throw new Error("maxParallelSubCalls must be a positive integer");
  return maxParallelSubCalls;
}
var ToolRuntime = class extends Service2 {
  static inject = ["systemPrompt"];
  static Config = Schema.object({
    mode: Schema.union([
      "native",
      "code",
      "both"
    ]).default("native"),
    maxParallelSubCalls: Schema.natural().min(1).default(10)
  });
  /** Internal staged view consumed by `dsh-agent-loop`'s parallel scheduler. */
  [TOOL_RUNTIME_SCHEDULER] = {
    prepare: (exec) => this.prepareScheduledExecution(exec),
    dispatch: (exec) => this.dispatchScheduledExecution(exec),
    finalize: (exec, result2) => this.finalizeScheduledExecution(exec, result2),
    finish: (exec, result2) => this.finishScheduledExecution(exec, result2)
  };
  /** Context deferred by a running tool body, keyed by its scheduler-owned execution. */
  deferredContexts = /* @__PURE__ */ new WeakMap();
  /** Executions whose tool body declared the current turn complete. */
  concludingExecutions = /* @__PURE__ */ new WeakSet();
  /** Original caller cancellation, kept outside the wrapper-mutable execution object. */
  cancellationStates = /* @__PURE__ */ new WeakMap();
  /** Definition-owned final content transform snapshotted before policy begins. */
  contentFinalizers = /* @__PURE__ */ new WeakMap();
  layers = new ScopedLayers((scope) => new ToolLayer(scope), () => {
    this.ctx.emit("tools/change");
  });
  /** Presentation for scopes that declare none; {@link presentAs} shadows it per scope. */
  defaultMode;
  maxParallelSubCalls;
  /**
  * Reserved presentation transport, kept outside the filterable registration
  * layers. Built on first need rather than at construction: which agents run
  * a code mode is no longer known when the service is constructed, and the
  * transport is stateless beyond its closures over `this`.
  */
  codeTransport;
  constructor(ctx, config = {}) {
    super(ctx, "tools");
    this.defaultMode = config.mode ?? "native";
    this.maxParallelSubCalls = resolveMaxParallelSubCalls(config.maxParallelSubCalls);
    ctx.systemPrompt.tools((context) => this.wireSchemas(context.scope));
    if (this.defaultMode !== "native") {
      ctx.systemPrompt.section(this.collapseSection());
      ctx.systemPrompt.section(this.sdkSection());
    }
  }
  /**
  * The prompt statement of the `code` executor collapse, registered wherever
  * {@link sdkSection} is and rendering empty outside an effective `code`.
  *
  * Every tool contributes its own guidance section naming its tool, none of
  * them qualify how that tool is reached, and they all render before the SDK
  * (orders 100-199 against {@link SDK_SECTION_ORDER}). Without this the model
  * reads a catalog of tools it is told to use and no statement that only
  * `run_code` may be called, so it emits a native call, receives
  * `UNKNOWN_TOOL` for a tool the prompt just declared, and concludes the
  * deployment is inconsistent. {@link COLLAPSE_SECTION_ORDER} places the rule
  * before that guidance rather than after it.
  *
  * `both` renders empty: native calls do execute there, so the rule is false.
  * @returns the section registration.
  */
  collapseSection() {
    return {
      name: "tools:code-only",
      order: COLLAPSE_SECTION_ORDER,
      text: (context) => this.modeFor(context.scope) === "code" ? CODE_ONLY_INSTRUCTION : ""
    };
  }
  /**
  * The generated-SDK prompt section, registered globally by a code-mode
  * deployment and per scope by {@link presentAs}.
  *
  * The body regenerates from the CALLING scope, and renders empty for an
  * agent presenting natively — an agent that opted out under a code-mode
  * deployment still sees the global registration, and an empty section is
  * dropped from the rendered prompt.
  * @returns the section registration.
  */
  sdkSection() {
    return {
      name: "tools:sdk",
      order: 150,
      text: (context) => {
        const mode = this.modeFor(context.scope);
        if (mode === "native") return "";
        const runtime = this.requireCodeRuntime(mode);
        const render = SDK_RENDERERS[runtime.language];
        if (render === void 0) throw new Error(`dsh-tools: no SDK renderer for ${runtime.language}`);
        return render(this.sdkSchemas(context.scope));
      }
    };
  }
  /**
  * The presentation one scope's agent sees: its own declaration, else the
  * deployment default.
  * @param scope - the calling agent, or undefined for the global view.
  * @returns the resolved presentation mode.
  */
  modeFor(scope) {
    const layers = this.layers.chainLayers(scope);
    for (let index = layers.length - 1; index >= 0; index -= 1) {
      const mode = layers[index]?.mode;
      if (mode !== void 0) return mode;
    }
    return this.defaultMode;
  }
  /**
  * The reserved `run_code` transport, built on first need.
  *
  * It never enters the global layer: per-agent restrictions must not remove
  * it, and a scoped registration must not shadow it. The visibility resolver
  * appends it after resolving the filterable global/scoped capability layers,
  * and only for scopes whose mode actually presents it.
  * @returns the shared transport definition.
  */
  requireCodeTransport() {
    this.codeTransport ??= createRunCodeTool(this, {
      requireRuntime: () => this.requireCodeRuntime(this.defaultMode),
      peekRuntime: () => this.ctx.get("codeRuntime"),
      maxParallel: this.maxParallelSubCalls,
      shapeDispatchLog: (dispatch) => this.shapeDispatchLog(dispatch)
    });
    return this.codeTransport;
  }
  /**
  * Present the calling scope's tools in `mode` instead of the deployment
  * default. Nearest scope on the chain wins, so a preset's standing
  * declaration covers every agent joined under it.
  *
  * Scoped only, and one declaration per scope: this is how an agent preset
  * composes Code Mode agents beside native ones in the same process, and a
  * process-global override would be the `mode` config field instead.
  * @param mode - the presentation the covered agents' models see.
  * @returns the exact disposer that restores the deployment default.
  */
  presentAs(mode) {
    const ctx = this.ctx;
    if (scopeOf(ctx) === void 0) throw new Error("tools.presentAs() requires a scoped context (agent.ctx): a context-global presentation is the `mode` config field on the tools row");
    return ctx.effect(function* () {
      yield this.layers.effect(ctx, (layer) => {
        if (layer.mode !== void 0) throw new Error(`tools.presentAs("${mode}") conflicts with "${layer.mode}" already declared for this scope; one composition selects one presentation`);
        layer.mode = mode;
        return () => {
          layer.mode = void 0;
        };
      }, { label: "tools.presentAs()" });
      if (mode !== "native") {
        yield ctx.systemPrompt.section(this.collapseSection());
        yield ctx.systemPrompt.section(this.sdkSection());
      }
    }.bind(this), "tools.presentAs()");
  }
  /**
  * Build one scope's wire schemas and names for prompt-order validation.
  * Restrictions do not make known tools invalid, but a mode collapse does.
  */
  wireSchemas(scope) {
    const view = this.view(scope);
    const mode = this.modeFor(scope);
    if (mode === "native") return {
      schemas: [...view.visible.values()].map((definition) => this.schemaOf(definition, false)),
      knownNames: [...view.knownNames]
    };
    this.requireCodeRuntime(mode);
    const schemas = [...view.visible.values()].map((definition) => this.schemaOf(definition, false));
    if (mode === "code") return {
      schemas: schemas.filter((schema) => schema.name === RUN_CODE_NAME),
      knownNames: [RUN_CODE_NAME]
    };
    return {
      schemas,
      knownNames: [...view.knownNames, RUN_CODE_NAME]
    };
  }
  /**
  * Resolve the code runtime or throw the actionable misconfiguration error.
  * Read at use time (assembly / run_code execution), NOT via static
  * `inject`: an inject entry would hold `ctx.tools` — and every tool plugin
  * behind it — hostage to a code runtime existing even under `mode:
  * 'native'` (the loop's optional-backend idiom, same as
  * `sessionPersistence`).
  *
  * Assembly and `run_code` execution read separately, so the language is not
  * bound to a request. Harmless while one published backend exists — both
  * reads return the same flavor — but a reload that swapped in a second
  * language between them would hand a program written against one SDK to the
  * other. Binding it is deferred until a second backend ships (the first
  * point it is testable); rationale in the
  * [language-dispatch note](../../../../.agents/notes/implemented/feature/2026-07-31-code-mode-language-dispatch.md).
  */
  requireCodeRuntime(mode) {
    const runtime = this.ctx.get("codeRuntime");
    if (!runtime) throw new Error(`dsh-tools: mode "${mode}" requires a code runtime \u2014 load a ctx.codeRuntime implementation (e.g. @deepseek-ai/dsh-code-runtime-worker-thread) or set tools mode to "native"`);
    if (!Object.hasOwn(SDK_RENDERERS, runtime.language)) {
      const known = Object.keys(SDK_RENDERERS).map((name2) => JSON.stringify(name2)).join(", ");
      throw new Error(`dsh-tools: no SDK renderer registered for runtime language ${JSON.stringify(runtime.language)} (known: ${known})`);
    }
    return runtime;
  }
  /**
  * Register globally or in the calling agent scope. Scoped tools shadow
  * globals; duplicates within one layer and the reserved `run_code` name fail.
  * @param definition - tool schema, execution, and optional finalization/presentation callbacks.
  * @returns the exact disposer that unregisters the tool.
  */
  register(definition) {
    const name2 = definition.name;
    const output = definition.output;
    if (output === void 0 || typeof output !== "object" || typeof output.render !== "function" || output.presentationMeta !== void 0 && typeof output.presentationMeta !== "function") throw new TypeError(`tool "${name2}" must declare output { schema, render, presentationMeta? }`);
    assertSupportedJsonSchema(output.schema);
    const timeoutMs = definition.timeoutMs;
    if (timeoutMs !== void 0 && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) throw new TypeError(`tool "${name2}" timeoutMs must be a positive finite number`);
    if (name2 === "run_code") throw new Error(`tool name "${RUN_CODE_NAME}" is reserved for the Code Mode presentation transport and cannot be registered or shadowed`);
    return this.layers.effect(this.ctx, (layer) => layer.tools.insert(name2, definition), { label: "tools.register()" });
  }
  /**
  * Restrict global tools for the calling agent scope. Empty filters, unknown
  * names, scope-local names, and reserved transport names fail. Restrictions
  * intersect; scoped registrations remain visible.
  * @param filter - global-tool mask: `allow` (keep only) and/or `deny` (remove).
  * @returns the exact disposer that lifts this restriction.
  */
  restrict(filter) {
    const scope = scopeOf(this.ctx);
    if (scope === void 0) throw new Error("tools.restrict() requires a scoped context (agent.ctx): a context-global restriction would mask every agent \u2014 deny the tool for the intended agent instead");
    const allow = filter.allow;
    const deny = filter.deny;
    if (allow === void 0 && deny === void 0) throw new Error("tools.restrict({}) is a no-op: pass `allow` and/or `deny` (an empty filter is almost always a materialized-empty-config bug)");
    const compiled = {
      ...allow !== void 0 ? { allow: new Set(allow) } : {},
      ...deny !== void 0 ? { deny: new Set(deny) } : {}
    };
    if ([...allow ?? [], ...deny ?? []].includes("run_code")) throw new Error(`tools.restrict() cannot name reserved Code Mode presentation transport "${RUN_CODE_NAME}"; restrict end-capability tools instead`);
    const known = this.view(scope).restrictableNames;
    const unknown = [...allow ?? [], ...deny ?? []].filter((name2) => !known.has(name2));
    if (unknown.length > 0) throw new Error(`tools.restrict() names unknown global tool${unknown.length > 1 ? "s" : ""} ${unknown.map((n) => `"${n}"`).join(", ")}; known global tools: ${[...known].sort().join(", ") || "(none)"}`);
    return this.layers.effect(this.ctx, (layer) => layer.restrictions.append(compiled), { label: "tools.restrict()" });
  }
  /**
  * Register a monotonic guard after the extensible `tools/pre-execute`
  * waterfall. A plain-context guard applies globally; one registered through
  * `agent.ctx` applies only to that agent. Any matching guard may deny by
  * returning a reason, while no guard can force-allow a call another guard
  * denied. The exact effect disposer is returned for ordered ownership and
  * HMR cleanup.
  * @param guard - synchronous check; a returned string denies the execution.
  * @returns the exact disposer that unregisters the guard.
  */
  guard(guard) {
    return this.layers.effect(this.ctx, (layer) => layer.guards.append(guard), {
      label: "tools.guard()",
      notify: false
    });
  }
  /** First monotonic denial from the global then the scope chain's guard layers, farthest first. */
  guardReason(exec) {
    const globalReason = this.layers.global.guardReason(exec);
    if (globalReason !== void 0) return globalReason;
    if (exec.agent === void 0) return void 0;
    for (const layer of this.layers.chainLayers(exec.agent)) {
      const reason = layer.guardReason(exec);
      if (reason !== void 0) return reason;
    }
  }
  /**
  * Resolve every registry fact one scope needs in one layer traversal. The
  * visible map applies restrictions to the INHERITED surface, then the
  * scope's own registrations and the reserved presentation transport; the
  * other sets retain the pre-restriction facts needed by restriction and
  * prompt-order validation.
  *
  * A restriction filters what a scope inherits — the global layer and every
  * ancestor layer on its chain — and never what its OWN layer registers.
  * That exemption is what a per-child capability filter has to keep intact:
  * the delegation runtime registers a child's reporting and structured-output
  * tools into the child's own layer, and a filter naming the capabilities the
  * child may use must not strip the machinery it answers through.
  *
  * Reading the exempt set as "the global layer" instead of "not mine" held
  * only while every model-facing tool sat in the host composition. Once
  * presets moved them onto the agent plane they became an ANCESTOR
  * contribution, so a child's filter silently stopped constraining anything
  * it was given.
  * @param scope - the viewing scope (the agent), or undefined for the global view.
  * @returns the complete derived view for that scope.
  */
  view(scope) {
    const layers = this.layers.chainLayers(scope);
    const own = this.layers.peek(scope);
    const inherited = new Map(this.layers.global.tools.entries());
    for (const layer of layers) {
      if (layer === own) continue;
      for (const [name2, definition] of layer.tools.entries()) inherited.set(name2, definition);
    }
    const visible = /* @__PURE__ */ new Map();
    const knownNames = /* @__PURE__ */ new Set();
    const restrictableNames = /* @__PURE__ */ new Set();
    for (const [name2, definition] of inherited) {
      knownNames.add(name2);
      restrictableNames.add(name2);
      if (layers.every((layer) => layer.admits(name2))) visible.set(name2, definition);
    }
    if (own !== void 0) for (const [name2, definition] of own.tools.entries()) {
      knownNames.add(name2);
      visible.set(name2, definition);
    }
    if (this.modeFor(scope) !== "native") visible.set(RUN_CODE_NAME, this.requireCodeTransport());
    return {
      visible,
      knownNames,
      restrictableNames
    };
  }
  /**
  * Look up a tool as one scope sees it (scoped
  * shadows global; a restricted-away global reads as absent). Presenters pass
  * the calling agent so the rendered card matches the definition that
  * actually executed.
  * @param name - the tool name as registered.
  * @param scope - the viewing scope (the agent); omitted = the global view.
  * @returns the definition the scope resolves, or undefined when none is visible.
  */
  get(name2, scope) {
    return this.view(scope).visible.get(name2);
  }
  /**
  * Resolve the definition that MAY EXECUTE for a call, applying the mode
  * collapse at the operation boundary that owns it. The registry view
  * (`get`) is presentation-agnostic; here a MODEL-DIRECT call under `code`
  * may only name the reserved `run_code` transport, while a nested
  * sub-dispatch (a `parent` token set — the `run_code` SDK calling a tool
  * it bound) may call any visible tool. Denial surfaces as `UNKNOWN_TOOL`
  * through the executor, matching an absent definition.
  * @param name - the tool name as registered.
  * @param scope - the viewing scope (the agent); omitted = the global view.
  * @param nested - whether the call is a transport sub-dispatch, not a model-direct call.
  * @returns the definition that may run, or undefined when the call must be rejected.
  */
  resolveExecution(name2, scope, nested) {
    const tool = this.get(name2, scope);
    if (tool === void 0) return void 0;
    if (this.collapses(name2, scope, nested)) return void 0;
    return tool;
  }
  /**
  * Project visible definitions onto the allowlisted model-facing schema fields,
  * excluding execution and presentation callbacks.
  * @param scope - the viewing scope (the agent); omitted = the global view.
  * @returns one deep-cloned schema per visible tool.
  */
  schemas(scope) {
    return [...this.view(scope).visible.values()].map((definition) => this.schemaOf(definition, true));
  }
  /** Project visible callable tools onto the generated Code Mode SDK contract. */
  sdkSchemas(scope) {
    return [...this.view(scope).visible.values()].filter((definition) => definition.name !== RUN_CODE_NAME).map((definition) => {
      const output = snapshotJsonValue(definition.output.schema);
      if (output === void 0) throw new Error(`tool "${definition.name}" output schema must be lossless JSON before SDK projection`);
      return {
        ...this.schemaOf(definition, true),
        output
      };
    });
  }
  /** Project one definition onto the model-facing schema fields. */
  schemaOf(definition, detachParameters) {
    const { name: name2, description, parameters } = definition;
    const detached = detachParameters ? snapshotJsonValue(parameters) : parameters;
    if (detached === void 0) throw new Error(`tool "${name2}" parameters must be lossless JSON before schema projection`);
    return {
      name: name2,
      description,
      parameters: detached
    };
  }
  /**
  * Classify a pending call through the caller's visible tool definition. Only
  * an exact `true` is parallel; unknown, hidden, undeclared, invalid, or
  * throwing classifiers are exclusive.
  * @param exec - call name, parsed arguments, and optional agent scope.
  * @returns the fail-closed scheduling mode.
  */
  executionMode(exec) {
    const tool = this.resolveExecution(exec.name, exec.agent, exec.parent !== void 0);
    if (!tool?.isConcurrencySafe) return { kind: "exclusive" };
    try {
      return tool.isConcurrencySafe(exec.arguments) === true ? { kind: "parallel" } : { kind: "exclusive" };
    } catch {
      return { kind: "exclusive" };
    }
  }
  /**
  * Run the `tools/code-dispatch-log` waterfall over one settled sub-dispatch
  * and return the content the bridge should log on `tool/code-dispatch`.
  * Contained: when a listener throws, the method logs the original settled
  * content; that failure must not fail the dispatch or omit the settle event. Private:
  * the ONE consumer is the `run_code` bridge this registry constructs, which
  * receives it as a capability parameter (the `requireRuntime` idiom) — the
  * waterfall, not this invoker, is the public extension point.
  */
  async shapeDispatchLog(dispatch) {
    try {
      return await this.ctx.waterfall(scopeTarget(this, dispatch.agent), "tools/code-dispatch-log", dispatch, () => Promise.resolve(dispatch.content));
    } catch (error) {
      this.ctx.logger.warn(`tools: code-dispatch-log listener failed for ${dispatch.name}: ${errorMessage(error)}; logging the original settled content`);
      return dispatch.content;
    }
  }
  /**
  * Whether the `code` mode collapse denies a model-direct call: only the
  * reserved `run_code` transport may be named. Nested sub-dispatches (a
  * `parent` token set) bypass the collapse. One home for the
  * security-relevant predicate, shared by {@link resolveExecution} and
  * {@link createExecution} so the two can never drift apart.
  *
  * Resolved through {@link modeFor}, NOT `defaultMode`: an agent given `code`
  * by an agent preset under a native deployment is the composition
  * `dsh-agent-tool-presentation` exists for, and reading the deployment default would
  * leave exactly that agent uncollapsed — announcing one surface while
  * executing another, which is the bypass this collapse closes.
  * @param name - the tool name as registered.
  * @param scope - the viewing scope whose effective presentation mode applies.
  * @param nested - whether the call is a transport sub-dispatch, not a model-direct call.
  */
  collapses(name2, scope, nested) {
    return !nested && this.modeFor(scope) === "code" && name2 !== "run_code";
  }
  /**
  * Execute through pre-policy, guards, around-dispatch, post-policy,
  * definition-owned content finalization, and final notification. Tool and
  * listener failures resolve as materialized error results; an invisible tool
  * reports `UNKNOWN_TOOL`. The returned outcome is the same lossless, frozen
  * snapshot final observers receive. Cancellation
  * arriving after entry and before final result materialization skips a
  * not-yet-started body with `ABORTED_BEFORE_DISPATCH` or replaces a
  * successful started outcome with `ABORTED`; already-started work is still
  * drained and may retain a tool-owned structured error.
  * @param exec - the typed same-process call input. The registry assigns its
  *   correlation token before policy begins.
  * @returns the materialized final result.
  */
  async execute(exec) {
    return this.prepareExecution(exec, (prepared) => this.completeScheduledExecution(prepared));
  }
  async completeScheduledExecution(prepared) {
    switch (prepared.kind) {
      case "dispatch": {
        const dispatched = await this.dispatchScheduledExecution(prepared.exec);
        return dispatched.kind === "post-result" ? await this.finalizeScheduledExecution(prepared.exec, dispatched.result) : this.finishScheduledExecution(prepared.exec, dispatched.result);
      }
      case "post-result":
        return await this.finalizeScheduledExecution(prepared.exec, prepared.result);
      case "final-result":
        return this.finishScheduledExecution(prepared.exec, prepared.result);
      /* v8 ignore next -- closed-union exhaustiveness guard */
      default:
        return assertNever(prepared, "scheduled tool preparation");
    }
  }
  createExecution(exec) {
    const deferredContexts = [];
    const token = createExecutionToken();
    const callId = exec.callId;
    const rootCallId = exec.rootCallId ?? callId;
    const name2 = exec.name;
    const agent = exec.agent;
    const parent = exec.parent;
    const signal = exec.signal;
    const visible = this.get(name2, agent);
    const collapsed = visible !== void 0 && this.collapses(name2, agent, parent !== void 0);
    const concludingExecutions = this.concludingExecutions;
    const base = {
      token,
      callId,
      rootCallId,
      name: name2,
      signal,
      ...agent !== void 0 ? { agent } : {},
      ...parent !== void 0 ? { parent } : {},
      deferContext(context) {
        deferredContexts.push(context);
      },
      concludeTurn() {
        concludingExecutions.add(this);
      }
    };
    const capturedFinalizer = visible?.finalizeContent?.bind(visible);
    const finalizerFor = () => collapsed && !signal.aborted ? void 0 : capturedFinalizer;
    try {
      const detached = snapshotJsonValue(exec.arguments);
      if (detached === void 0) throw new TypeError("tool execution arguments must be losslessly JSON-serializable");
      const execution = {
        ...base,
        arguments: deepFreeze(detached)
      };
      this.deferredContexts.set(execution, deferredContexts);
      this.contentFinalizers.set(execution, finalizerFor());
      this.cancellationStates.set(execution, {
        callerSignal: signal,
        bodyInvoked: false
      });
      if (collapsed) {
        if (signal.aborted) return {
          kind: "final-result",
          exec: execution,
          result: toolAbortedBeforeDispatchResult()
        };
        return {
          kind: "final-result",
          exec: execution,
          result: toolErrorResult(new ToolNotFoundError(name2, `only \`${RUN_CODE_NAME}\` is callable directly \u2014 call \`${name2}\` from inside a \`${RUN_CODE_NAME}\` program instead`))
        };
      }
      return {
        kind: "ready",
        exec: execution
      };
    } catch (error) {
      const execution = {
        ...base,
        arguments: void 0
      };
      this.contentFinalizers.set(execution, finalizerFor());
      return {
        kind: "final-result",
        exec: execution,
        result: toolErrorResult(error)
      };
    }
  }
  /**
  * Run the ordered pre-execute and monotonic guard stages for the scheduler.
  * @param input - the caller-supplied execution input.
  * @returns the prepared execution plus the next scheduler stage.
  * @internal
  */
  async prepareScheduledExecution(input) {
    return this.prepareExecution(input, (prepared) => prepared);
  }
  async prepareExecution(input, next) {
    const created = this.createExecution(input);
    if (created.kind !== "ready") return next(created);
    const exec = created.exec;
    if (this.callerCancelled(exec)) return next({
      kind: "final-result",
      exec,
      result: toolAbortedBeforeDispatchResult()
    });
    try {
      const carrier = scopeTarget(this, exec.agent);
      const gate = await this.ctx.waterfall(carrier, "tools/pre-execute", exec, () => Promise.resolve({ kind: "allow" }));
      const askResolution = gate.kind === "ask" ? await this.serviceAsk(exec, gate) : {
        decision: gate,
        approvalCancelled: false
      };
      const { decision } = askResolution;
      if (this.callerCancelled(exec) && askResolution.approvalCancelled) return await next({
        kind: "post-result",
        exec,
        result: toolAbortedBeforeDispatchResult()
      });
      const denialReason = decision.kind === "allow" ? this.guardReason(exec) : decision.reason;
      if (denialReason !== void 0) return await next({
        kind: "post-result",
        exec,
        result: this.materializeFinalResult({
          content: [{
            type: "text",
            text: `Error: ${denialReason}`
          }],
          isError: true,
          error: { message: denialReason }
        })
      });
      if (this.callerCancelled(exec)) return await next({
        kind: "post-result",
        exec,
        result: toolAbortedBeforeDispatchResult()
      });
      return await next({
        kind: "dispatch",
        exec
      });
    } catch (error) {
      return next({
        kind: "final-result",
        exec,
        result: toolErrorResult(error)
      });
    }
  }
  /** Whether the original caller signal is currently aborted. */
  callerCancelled(exec) {
    const state = this.cancellationStates.get(exec);
    if (state === void 0) throw new Error("tool registry scheduler invariant violated: missing cancellation state");
    return state.callerSignal.aborted;
  }
  /** Canonical cancellation outcome selected by whether the tool body started. */
  cancellationResult(exec, prior) {
    const state = this.cancellationStates.get(exec);
    if (state === void 0) throw new Error("tool registry scheduler invariant violated: missing cancellation state");
    return state.bodyInvoked ? toolAbortedResult(prior) : toolAbortedBeforeDispatchResult(prior);
  }
  /**
  * Dispatch the registered body with the original caller signal fused back
  * into any around-wrapper replacement. Cancellation never abandons the body:
  * a started promise reaches quiescence before its outcome becomes `ABORTED`.
  */
  async dispatchToolBody(exec) {
    const state = this.cancellationStates.get(exec);
    if (state === void 0) throw new Error("tool registry scheduler invariant violated: missing cancellation state");
    const wrapperSignal = exec.signal;
    const fused = fuseToolSignals(state.callerSignal, wrapperSignal);
    const signal = fused.signal;
    if (isAborted(signal)) {
      fused.dispose();
      return toolAbortedBeforeDispatchResult();
    }
    exec.signal = signal;
    try {
      const tool = this.resolveExecution(exec.name, exec.agent, exec.parent !== void 0);
      if (!tool) throw new ToolNotFoundError(exec.name);
      state.bodyInvoked = true;
      const returned = await tool.execute(exec.arguments, exec);
      const result2 = this.createSuccessResult(exec, tool, returned);
      return isAborted(signal) ? toolAbortedResult(result2) : result2;
    } catch (error) {
      return toolErrorResult(error);
    } finally {
      fused.dispose();
      exec.signal = wrapperSignal;
    }
  }
  /**
  * Run around-dispatch and the tool body. Tool and unknown-tool failures still
  * receive post-execute; pipeline failures are already final.
  * @param exec - the prepared execution.
  * @returns whether the result still needs post-execute.
  * @internal
  */
  async dispatchScheduledExecution(exec) {
    try {
      const mutableExec = exec;
      const carrier = scopeTarget(this, exec.agent);
      const result2 = await this.ctx.waterfall(carrier, "tools/execute", mutableExec, () => this.dispatchToolBody(mutableExec));
      const normalized = this.normalizeDispatchResult(exec, result2);
      const deferredContexts = this.deferredContexts.get(exec);
      if (deferredContexts === void 0) throw new Error("tool registry scheduler invariant violated: unprepared execution");
      const resultWithDeferredContexts = deferredContexts.length === 0 ? normalized : this.markCanonical(exec, {
        ...normalized,
        additionalContexts: [...deferredContexts, ...normalized.additionalContexts ?? []]
      });
      return {
        kind: "post-result",
        result: this.callerCancelled(exec) && !resultWithDeferredContexts.isError ? this.cancellationResult(exec, resultWithDeferredContexts) : resultWithDeferredContexts
      };
    } catch (error) {
      return {
        kind: "final-result",
        result: toolErrorResult(error)
      };
    }
  }
  /**
  * Run ordered post-execute, then apply definition-owned content finalization,
  * materialize, and notify the final outcome.
  * @param exec - the prepared execution.
  * @param result - dispatch/pre result that still needs post-execute.
  * @returns the materialized final result.
  * @internal
  */
  async finalizeScheduledExecution(exec, result2) {
    try {
      const postResult = await this.postExecute(exec, result2);
      return this.finishScheduledExecution(exec, this.callerCancelled(exec) && !postResult.isError ? this.cancellationResult(exec, postResult) : postResult);
    } catch (error) {
      return this.finishScheduledExecution(exec, toolErrorResult(error));
    }
  }
  /**
  * Materialize the candidate, apply definition-owned content finalization,
  * then materialize and notify the authoritative result.
  * @param exec - the prepared execution.
  * @param result - final result.
  * @returns the materialized final result.
  * @internal
  */
  finishScheduledExecution(exec, result2) {
    let materializedResult;
    try {
      materializedResult = this.materializeFinalResult(result2);
    } catch (error) {
      materializedResult = this.materializeFinalResult(toolErrorResult(error));
    }
    let finalResult;
    try {
      finalResult = this.materializeFinalResult(this.applyFinalContent(exec, materializedResult));
    } catch (error) {
      finalResult = this.materializeFinalResult(toolErrorResult(error));
    }
    this.notifyResult(exec, finalResult);
    return finalResult;
  }
  /** Apply the snapshotted tool-owned content transform without exposing other result fields. */
  applyFinalContent(exec, result2) {
    const finalizeContent = this.contentFinalizers.get(exec);
    if (finalizeContent === void 0) return result2;
    const content = finalizeContent(exec, result2);
    return content === void 0 ? result2 : {
      ...result2,
      content
    };
  }
  /** Notify observers without exposing a mutation or error channel into the outcome. */
  notifyResult(exec, result2) {
    Object.freeze(exec);
    const { name: toolName, callId } = exec;
    const reportFailure = (error) => {
      this.ctx.logger.warn(`tool "${toolName}" (${callId}): tools/result observer failed: ${errorMessage(error)}`);
    };
    const callbacks = this.ctx.events.dispatch("emit", [
      scopeTarget(this, exec.agent),
      "tools/result",
      exec,
      result2
    ]);
    for (const callback of callbacks) try {
      const returned = callback(exec, result2);
      Promise.resolve(returned).catch(reportFailure);
    } catch (error) {
      reportFailure(error);
    }
  }
  /**
  * Resolve an `ask` decision to allow/deny through the approval seam. The
  * seam is consumed opportunistically with `ctx.get('approval')` — a
  * deployment that composes no ApprovalService keeps the historical degrade
  * to deny, and an unmount mid-session degrades the same way on the next ask.
  * An agent-less execution also degrades: without an agent there is no
  * session to audit to and no UI to route to. Otherwise the outcome maps
  * one-to-one — `allowed-once` proceeds; the three non-grants deny with
  * distinct reasons so the model can tell a human "no" from an absent
  * approval channel.
  */
  async serviceAsk(exec, ask) {
    const approval = this.ctx.get("approval");
    if (approval === void 0) return {
      decision: {
        kind: "deny",
        reason: ask.reason ?? `tool "${exec.name}" requires approval (not yet supported)`
      },
      approvalCancelled: false
    };
    if (exec.agent === void 0) return {
      decision: {
        kind: "deny",
        reason: `tool "${exec.name}" requires approval, but the call has no agent to route it through`
      },
      approvalCancelled: false
    };
    const outcome = await approval.request({
      agent: exec.agent,
      toolName: exec.name,
      callId: exec.callId,
      ...ask.reason !== void 0 ? { reason: ask.reason } : {},
      signal: exec.signal
    });
    switch (outcome) {
      case "allowed-once":
        return {
          decision: { kind: "allow" },
          approvalCancelled: false
        };
      case "rejected":
        return {
          decision: {
            kind: "deny",
            reason: `the user rejected tool "${exec.name}"`
          },
          approvalCancelled: false
        };
      case "cancelled":
        return {
          decision: {
            kind: "deny",
            reason: `approval for tool "${exec.name}" was cancelled`
          },
          approvalCancelled: true
        };
      case "unavailable":
        return {
          decision: {
            kind: "deny",
            reason: `tool "${exec.name}" requires approval, but no approval channel is available`
          },
          approvalCancelled: false
        };
      default:
        return assertNever(outcome, "ApprovalOutcome");
    }
  }
  /**
  * Run the `tools/post-execute` waterfall over a dispatched `result` and apply
  * its {@link PostToolDecision}: `accept` keeps the call successful (replacing
  * `content` when given), `block` turns it into an `isError` whose content is
  * the corrective `feedback`. Either decision may attach `additionalContexts`,
  * which are ferried on the returned result for the loop's active-batch FIFO.
  * Context deferred by the tool body survives an accepted result but is
  * discarded when the outer call is blocked; a block exposes only context the
  * blocking decision explicitly supplied.
  * Runs inside `execute`'s outer try/catch (a throwing listener → isError).
  */
  async postExecute(exec, result2) {
    const decision = await this.ctx.waterfall(scopeTarget(this, exec.agent), "tools/post-execute", exec, result2, () => Promise.resolve({ kind: "accept" }));
    const decisionContexts = decision.additionalContexts ?? [];
    if (decision.kind === "block") {
      const message = failureMessageFromContent(decision.feedback);
      return this.markCanonical(exec, {
        content: decision.feedback,
        isError: true,
        error: { message },
        ...decisionContexts.length > 0 ? { additionalContexts: decisionContexts } : {}
      });
    }
    if (Object.hasOwn(decision, "content") && Object.hasOwn(decision, "value")) throw new TypeError("tools/post-execute accept decision cannot replace both value and content");
    const additionalContexts = [...result2.additionalContexts ?? [], ...decisionContexts];
    if (Object.hasOwn(decision, "value")) {
      if (result2.isError) throw new TypeError("tools/post-execute cannot replace the value of a failed result");
      const tool = this.resolveExecution(exec.name, exec.agent, exec.parent !== void 0);
      if (tool === void 0) throw new ToolNotFoundError(exec.name);
      const replaced = this.createSuccessResult(exec, tool, decision.value);
      return this.markCanonical(exec, {
        ...replaced,
        ...additionalContexts.length > 0 ? { additionalContexts } : {}
      });
    }
    return this.markCanonical(exec, {
      ...result2,
      ...decision.content !== void 0 ? { content: decision.content } : {},
      ...additionalContexts.length > 0 ? { additionalContexts } : {}
    });
  }
  /** Registry-normalized results and the exact dispatch that validated each value. */
  canonicalResults = /* @__PURE__ */ new WeakMap();
  /** Mark one registry-normalized result as canonical only for its owning dispatch. */
  markCanonical(exec, result2) {
    this.canonicalResults.set(result2, exec.token);
    return result2;
  }
  /** Snapshot, validate, render, and optionally project one successful body value. */
  createSuccessResult(exec, tool, candidate) {
    const detached = snapshotToolValue(tool.name, candidate);
    const violations = validateJsonSchemaValue(tool.output.schema, detached, "value");
    if (violations.length > 0) throw new ToolOutputError(tool.name, violations);
    const value = deepFreeze(detached);
    let rendered;
    try {
      rendered = tool.output.render(exec.arguments, value);
    } catch (error) {
      throw projectionError(tool.name, "render", error);
    }
    const content = snapshotProjection(tool.name, "render", rendered);
    let meta;
    if (exec.parent === void 0 && tool.output.presentationMeta !== void 0) {
      let projected;
      try {
        projected = tool.output.presentationMeta(exec.arguments, value);
      } catch (error) {
        throw projectionError(tool.name, "presentationMeta", error);
      }
      meta = snapshotProjection(tool.name, "presentationMeta", projected);
    }
    const concludesTurn = this.concludingExecutions.has(exec);
    return this.markCanonical(exec, this.materializeFinalResult({
      isError: false,
      value,
      content,
      ...meta !== void 0 ? { meta } : {},
      ...concludesTurn ? { concludesTurn: true } : {}
    }));
  }
  /** Normalize an around-dispatch wrapper's authored result through the owning output contract. */
  normalizeDispatchResult(exec, result2) {
    if (this.canonicalResults.get(result2) === exec.token) return result2;
    if (result2.isError) return this.markCanonical(exec, {
      isError: true,
      error: result2.error,
      content: result2.content,
      ...result2.meta !== void 0 ? { meta: result2.meta } : {},
      ...result2.additionalContexts !== void 0 ? { additionalContexts: result2.additionalContexts } : {}
    });
    const tool = this.resolveExecution(exec.name, exec.agent, exec.parent !== void 0);
    if (tool === void 0) throw new ToolNotFoundError(exec.name);
    const normalized = this.createSuccessResult(exec, tool, result2.value);
    return this.markCanonical(exec, {
      ...normalized,
      ...result2.additionalContexts !== void 0 ? { additionalContexts: result2.additionalContexts } : {}
    });
  }
  /** Materialize the authoritative commit outcome once, immediately before `tools/result`. */
  materializeFinalResult(result2) {
    const presentation = {
      content: result2.content,
      ...result2.meta !== void 0 ? { meta: result2.meta } : {},
      ...result2.additionalContexts !== void 0 ? { additionalContexts: result2.additionalContexts } : {}
    };
    if (result2.isError) return materializePresentation({
      isError: true,
      error: result2.error,
      ...presentation
    });
    return deepFreeze({
      ...materializePresentation({
        isError: false,
        ...presentation,
        ...result2.concludesTurn === true ? { concludesTurn: true } : {}
      }),
      value: result2.value
    });
  }
};
function createExecutionToken() {
  return Symbol("dsh.tool.execution");
}
function toolErrorResult(error) {
  const info = errorInfo(error);
  const message = errorMessage(error);
  return {
    content: [{
      type: "text",
      text: `Error: ${message}`
    }],
    isError: true,
    error: {
      message,
      ...info ? { info } : {}
    }
  };
}
function isAborted(signal) {
  return signal.aborted;
}
function fuseToolSignals(caller, wrapper) {
  if (caller === wrapper) return {
    signal: caller,
    dispose() {
    }
  };
  const controller = new AbortController();
  let listening = false;
  const dispose = () => {
    if (!listening) return;
    listening = false;
    caller.removeEventListener("abort", abortFromCaller);
    wrapper.removeEventListener("abort", abortFromWrapper);
  };
  const abortFrom = (source) => {
    const reason = source.reason;
    controller.abort(reason);
    dispose();
  };
  const abortFromCaller = () => {
    abortFrom(caller);
  };
  const abortFromWrapper = () => {
    abortFrom(wrapper);
  };
  if (wrapper.aborted) abortFromWrapper();
  else if (caller.aborted) abortFromCaller();
  else {
    listening = true;
    caller.addEventListener("abort", abortFromCaller, { once: true });
    wrapper.addEventListener("abort", abortFromWrapper, { once: true });
  }
  return {
    signal: controller.signal,
    dispose
  };
}
function toolAbortedResult(prior) {
  const additionalContexts = prior?.additionalContexts ?? [];
  return {
    content: [{
      type: "text",
      text: "Error: tool call aborted"
    }],
    isError: true,
    error: {
      message: "tool call aborted",
      info: {
        name: "AbortError",
        code: TOOL_ABORTED
      }
    },
    ...additionalContexts.length > 0 ? { additionalContexts } : {}
  };
}
function toolAbortedBeforeDispatchResult(prior) {
  const additionalContexts = prior?.additionalContexts ?? [];
  return {
    content: [{
      type: "text",
      text: "Error: tool call aborted before dispatch"
    }],
    isError: true,
    error: {
      message: "tool call aborted before dispatch",
      info: {
        name: "AbortError",
        code: TOOL_ABORTED_BEFORE_DISPATCH
      }
    },
    ...additionalContexts.length > 0 ? { additionalContexts } : {}
  };
}

// src/agent-capabilities.ts
import { readFile as readFile2, stat } from "node:fs/promises";
import { basename } from "node:path";
var OPERATIONS = ["status", "open_pet", "open_settings", "set_theme", "import_theme", "set_scale", "create_launcher"];
function result(message, snapshot) {
  return {
    ok: true,
    message,
    activeTheme: snapshot.config.themeId,
    scale: snapshot.config.scale,
    petAutoStart: snapshot.config.autoLaunch,
    installedThemes: snapshot.themes.map(({ id, name: name2 }) => ({ id, name: name2 }))
  };
}
function registerPetAgentCapabilities(ctx, runtime, settings) {
  ctx.systemPrompt.section({
    name: "tool:xy-deepseek-pet",
    order: 145,
    text: "XY DeepSeek Pet is installed. It provides a desktop pet, replaceable theme/skin artwork, 40%-200% scaling, Harness General settings, and an optional desktop shortcut with a replaceable PNG icon. Use xy_pet when the user asks to inspect, open, resize, import, or change the pet/skin, or explicitly asks to create the desktop shortcut. When the user asks you to find or download a pet skin, you may download a licensed theme ZIP to a local path, report its source and license, then pass that local ZIP to xy_pet import_theme; never execute theme code or bypass validation. Pet appearance belongs to themes; shortcut artwork is configured separately. Optional notification sounds are managed by xy_pet_sounds only when that tool is available. Never request or reveal bridge credentials."
  });
  ctx.tools.register(defineTool({
    name: "xy_pet",
    description: "Inspect or safely configure the installed XY DeepSeek Pet. Import a local theme ZIP selected by the user or downloaded after the user explicitly requested it.",
    parameters: {
      operation: { type: "string", required: true, enum: OPERATIONS, description: OPERATIONS.join(" | ") },
      theme_id: { type: "string", description: "Exact installed theme ID for set_theme." },
      path: { type: "string", description: "Local .zip path supplied by the user or downloaded after the user explicitly requested a skin for import_theme." },
      scale: { type: "number", description: "Pet scale from 0.4 through 2.0 for set_scale." },
      launcher_name: { type: "string", description: "Desktop shortcut display name for create_launcher; defaults to DeepSeek Harness." },
      launcher_icon: { type: "string", enum: ["calm", "custom"], description: "Bundled cartoon whale icon or custom PNG for create_launcher." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean", required: true },
          message: { type: "string", required: true },
          activeTheme: { type: "string", required: true },
          scale: { type: "number", required: true },
          petAutoStart: { type: "boolean", required: true },
          installedThemes: {
            type: "array",
            required: true,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string", required: true },
                name: { type: "string", required: true }
              }
            }
          }
        }
      },
      render: (_args, value) => [{ type: "text", text: value.message }]
    },
    async execute(args, exec) {
      let message = "XY DeepSeek Pet status.";
      if (args.operation === "open_pet") {
        if (!runtime.openDesktop()) throw new Error("The desktop companion executable is unavailable");
        message = "XY DeepSeek Pet is open.";
      } else if (args.operation === "open_settings") {
        runtime.openClient();
        message = "Harness settings are open. The Pet group is under General settings.";
      } else if (args.operation === "set_theme") {
        if (!args.theme_id) throw new Error("theme_id is required for set_theme");
        await settings.activateTheme(args.theme_id);
        message = `Pet theme changed to ${args.theme_id}.`;
      } else if (args.operation === "import_theme") {
        if (!args.path) throw new Error("path is required for import_theme");
        const themeId = await runtime.importThemeArchive(args.path, exec.signal);
        await settings.activateTheme(themeId);
        message = `Pet theme ${themeId} was imported and activated.`;
      } else if (args.operation === "set_scale") {
        if (args.scale === void 0 || !Number.isFinite(args.scale) || args.scale < PET_SCALE_MIN || args.scale > PET_SCALE_MAX) {
          throw new Error("scale must be between 0.4 and 2.0");
        }
        const next = settings.config;
        next.scale = Math.round(args.scale / PET_SCALE_STEP) * PET_SCALE_STEP;
        await settings.update(next);
        message = `Pet scale changed to ${Math.round(next.scale * 100)}%.`;
      } else if (args.operation === "create_launcher") {
        const iconId = args.launcher_icon === "custom" ? "custom" : "calm";
        let fileName = "";
        let dataBase64 = "";
        if (iconId === "custom") {
          if (!args.path) throw new Error("path is required when launcher_icon is custom");
          const info = await stat(args.path);
          if (!info.isFile() || info.size < 24 || info.size > 5 * 1024 * 1024) throw new Error("Custom launcher PNG must be no larger than 5 MiB");
          fileName = basename(args.path);
          dataBase64 = (await readFile2(args.path)).toString("base64");
        }
        const created = runtime.createLauncher(args.launcher_name || "DeepSeek Harness", iconId, fileName, dataBase64);
        message = `${created.displayName} desktop shortcut was created for ${created.platform}.`;
      }
      return result(message, await settings.snapshot());
    }
  }));
}

// src/desktop-launcher.ts
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { join as join3 } from "node:path";
function sanitizeLauncherName(value) {
  const name2 = value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!name2 || name2.length > 48 || /[\\/:*?"<>|]/.test(name2) || name2 === "." || name2 === "..") {
    throw new Error("Desktop shortcut name must be 1-48 characters without path separators.");
  }
  return name2;
}
function decodeLauncherPng(dataBase64) {
  if (!dataBase64 || dataBase64.length > 7e6) throw new Error("Desktop icon must be a PNG no larger than 5 MiB.");
  const bytes = Buffer.from(dataBase64, "base64");
  if (bytes.length < 24 || bytes.length > 5 * 1024 * 1024 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("Desktop icon must be a valid PNG no larger than 5 MiB.");
  }
  return bytes;
}
function xml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
function iconPath(request) {
  const iconRoot = join3(request.packageRoot, "assets");
  if (request.iconId !== "custom") return join3(iconRoot, "whale-calm.png");
  if (!request.fileName?.toLowerCase().endsWith(".png")) throw new Error("Custom desktop icon must use a .png file.");
  const bytes = decodeLauncherPng(request.dataBase64 ?? "");
  const customRoot = join3(homedir2(), ".xy-deepseek-pet", "launcher-icons");
  mkdirSync(customRoot, { recursive: true, mode: 448 });
  const destination = join3(customRoot, `custom-${Date.now()}.png`);
  writeFileSync(destination, bytes, { mode: 384 });
  return destination;
}
function validateIcon(path) {
  if (!existsSync(path)) throw new Error("The selected desktop icon is unavailable.");
  const info = statSync(path);
  if (!info.isFile() || info.size < 24 || info.size > 5 * 1024 * 1024) throw new Error("Desktop icon must be a PNG no larger than 5 MiB.");
  if (readFileSync(path).subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("The selected desktop icon is not a valid PNG.");
}
function macLauncherScript(nodeExecutable, launchScript) {
  return `#!/bin/sh
umask 077
exec ${shellQuote(nodeExecutable)} ${shellQuote(launchScript)} >> "$HOME/.xy-deepseek-pet/launcher.log" 2>&1
`;
}
function launcherNodeExecutable() {
  if (process.platform === "darwin") {
    const stable = ["/opt/homebrew/bin/node", "/usr/local/bin/node"].find((candidate) => existsSync(candidate));
    if (stable) return stable;
  }
  return process.execPath;
}
function createMacLauncher(packageRoot, name2, icon) {
  const launchScript = join3(packageRoot, "runtime", "launch.mjs");
  if (!existsSync(launchScript)) throw new Error("The development launcher runtime is unavailable.");
  const target = join3(homedir2(), "Desktop", `${name2}.app`);
  if (existsSync(target)) throw new Error(`\u201C${name2}\u201D already exists on the desktop.`);
  const contents = join3(target, "Contents");
  const macos = join3(contents, "MacOS");
  const resources = join3(contents, "Resources");
  const iconset = join3(resources, "Pet.iconset");
  try {
    mkdirSync(macos, { recursive: true });
    mkdirSync(iconset, { recursive: true });
    for (const size of [16, 32, 128, 256, 512]) {
      execFileSync("sips", ["-z", String(size), String(size), icon, "--out", join3(iconset, `icon_${size}x${size}.png`)], { stdio: "ignore" });
      execFileSync("sips", ["-z", String(size * 2), String(size * 2), icon, "--out", join3(iconset, `icon_${size}x${size}@2x.png`)], { stdio: "ignore" });
    }
    execFileSync("iconutil", ["-c", "icns", iconset, "-o", join3(resources, "Pet.icns")], { stdio: "ignore" });
    rmSync(iconset, { recursive: true, force: true });
    const executable = join3(macos, "launch");
    writeFileSync(executable, macLauncherScript(launcherNodeExecutable(), launchScript));
    chmodSync(executable, 493);
    writeFileSync(join3(contents, "Info.plist"), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleName</key><string>${xml(name2)}</string><key>CFBundleDisplayName</key><string>${xml(name2)}</string><key>CFBundleExecutable</key><string>launch</string><key>CFBundleIconFile</key><string>Pet</string><key>CFBundleIdentifier</key><string>dev.xy-deepseek-pet.launcher</string><key>CFBundlePackageType</key><string>APPL</string></dict></plist>
`);
  } catch (error) {
    rmSync(target, { recursive: true, force: true });
    throw error;
  }
}
function pngAsIco(png) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}
function createWindowsLauncher(packageRoot, name2, icon) {
  const launchScript = join3(packageRoot, "runtime", "launch.mjs");
  if (!existsSync(launchScript)) throw new Error("The development launcher runtime is unavailable.");
  const shortcut = join3(homedir2(), "Desktop", `${name2}.lnk`);
  if (existsSync(shortcut)) throw new Error(`\u201C${name2}\u201D already exists on the desktop.`);
  const iconRoot = join3(homedir2(), ".xy-deepseek-pet", "launcher-icons");
  mkdirSync(iconRoot, { recursive: true, mode: 448 });
  const ico = join3(iconRoot, `${name2}.ico`);
  writeFileSync(ico, pngAsIco(readFileSync(icon)), { mode: 384 });
  const script = "$w=New-Object -ComObject WScript.Shell;$s=$w.CreateShortcut($env:XY_PET_SHORTCUT);$s.TargetPath=$env:XY_PET_NODE;$s.Arguments=$env:XY_PET_ARGUMENTS;$s.WorkingDirectory=$env:XY_PET_ROOT;$s.IconLocation=$env:XY_PET_ICON;$s.Save()";
  const quoteWindowsArgument = (value) => `"${value.replaceAll('"', '\\"')}"`;
  execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
    stdio: "ignore",
    env: {
      ...process.env,
      XY_PET_SHORTCUT: shortcut,
      XY_PET_NODE: launcherNodeExecutable(),
      XY_PET_ARGUMENTS: quoteWindowsArgument(launchScript),
      XY_PET_ROOT: packageRoot,
      XY_PET_ICON: `${ico},0`
    }
  });
}
function createDesktopLauncher(request) {
  const name2 = sanitizeLauncherName(request.name);
  const icon = iconPath(request);
  validateIcon(icon);
  if (process.platform === "darwin") {
    createMacLauncher(request.packageRoot, name2, icon);
    return { displayName: name2, platform: "macOS" };
  }
  if (process.platform === "win32") {
    createWindowsLauncher(request.packageRoot, name2, icon);
    return { displayName: name2, platform: "Windows" };
  }
  throw new Error("Desktop shortcut creation currently supports macOS and Windows.");
}

// src/index.ts
var name = "xy-deepseek-pet";
var inject = ["agents", "commands", "systemPrompt", "tools"];
var MAX_WIRE_BYTES = 64 * 1024;
var REACTION_MS = 2800;
var require2 = createRequire(import.meta.url);
function installedDesktop() {
  try {
    const packageRoot = dirname2(require2.resolve("xy-deepseek-desktop/package.json"));
    const cli = join4(packageRoot, "bin", "cli.mjs");
    const resourceRoot = join4(packageRoot, "dist", "resources");
    if (!existsSync2(cli) || !existsSync2(join4(resourceRoot, "schemas", "theme.schema.json"))) return void 0;
    return { command: process.execPath, args: [cli], resourceRoot };
  } catch {
    return void 0;
  }
}
function authMatches(actual, expected) {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}
function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function visibleAssistantText(event) {
  if (event.type !== "assistant/message") return void 0;
  const text = event.data.message.content.filter((block) => block.type === "text").map((block) => block.text).join(" ").trim();
  return boundedStatusText(text);
}
function visibleAssistantChunk(event) {
  if (event.type !== "assistant/chunk" || event.data.chunk.type !== "text-delta") return void 0;
  return event.data.chunk.text;
}
function safeToolName(value) {
  if (typeof value !== "string") return "tool";
  return boundedStatusText(value)?.slice(0, 80) || "tool";
}
function toolResultCallId(event) {
  if (event.type !== "tool/result") return void 0;
  return String(event.data.message.content[0].toolCallId);
}
function approvalAuditEvent(event) {
  const candidate = event;
  if (typeof candidate.time !== "number" || !candidate.data) return void 0;
  if (candidate.type === "approval/asked" && typeof candidate.data.id === "string") {
    return {
      type: "approval/asked",
      time: candidate.time,
      data: { id: candidate.data.id, toolName: safeToolName(candidate.data.toolName) }
    };
  }
  if (candidate.type === "approval/decided" && typeof candidate.data.id === "string") {
    return { type: "approval/decided", time: candidate.time, data: { id: candidate.data.id } };
  }
  return void 0;
}
function visibleSessionTitle(event) {
  const candidate = event;
  if (candidate.type !== "session/title" || typeof candidate.data?.title !== "string") return void 0;
  const title = candidate.data.title.replace(/\s+/g, " ").trim();
  return title ? title.slice(0, 120) : void 0;
}
function desktopLaunch(config) {
  const configuredCommand = config.desktopCommand ?? process.env.XY_DEEPSEEK_PET_DESKTOP_COMMAND;
  const configuredEntry = config.desktopEntry ?? process.env.XY_DEEPSEEK_PET_DESKTOP_ENTRY;
  if (configuredCommand) return { command: configuredCommand, args: configuredEntry ? [configuredEntry] : [] };
  const installed = installedDesktop();
  if (installed) return installed;
  if (process.platform !== "darwin") return void 0;
  const repositoryRoot = resolve3(import.meta.dirname, "../../..");
  const command = resolve3(repositoryRoot, "packages/desktop/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron");
  const entry = resolve3(repositoryRoot, "packages/desktop/dist/main.js");
  return existsSync2(command) && existsSync2(entry) ? { command, args: [entry] } : void 0;
}
function desktopResourceRoot(config) {
  return repositoryRootFromDesktopEntry(config.desktopEntry ?? process.env.XY_DEEPSEEK_PET_DESKTOP_ENTRY) ?? installedDesktop()?.resourceRoot;
}
var HarnessPetRuntime = class {
  constructor(ctx, config = {}, settings) {
    this.ctx = ctx;
    this.config = config;
    this.settings = settings;
    this.logger = ctx.logger("xy-deepseek-pet");
  }
  logger;
  token = randomBytes(32).toString("hex");
  authenticated = /* @__PURE__ */ new WeakSet();
  touched = /* @__PURE__ */ new Map();
  server;
  desktop;
  selected;
  snapshot = initialSnapshot();
  sessions = /* @__PURE__ */ new Map();
  lastAssistantText = /* @__PURE__ */ new Map();
  activeToolCalls = /* @__PURE__ */ new Map();
  pendingQuestionCalls = /* @__PURE__ */ new Map();
  pendingApprovals = /* @__PURE__ */ new Map();
  sequence = 0;
  reactionTimer;
  stopped = false;
  lastClientOpen;
  pendingThemeImports = /* @__PURE__ */ new Map();
  async start() {
    if (this.server || this.stopped) return;
    this.selectLatest();
    this.server = new WebSocketServer({ host: "127.0.0.1", port: 0, maxPayload: MAX_WIRE_BYTES });
    this.server.on("connection", (socket) => this.accept(socket));
    await new Promise((resolveReady, reject) => {
      this.server?.once("listening", resolveReady);
      this.server?.once("error", reject);
    });
    this.snapshot = reducePetEvent(this.snapshot, { type: "bridge/connected" });
    await this.writeRendezvous();
    if (this.config.autoLaunch === true || this.settings?.config.autoLaunch === true) this.openDesktop();
    this.logger.info("local desktop bridge ready");
  }
  async stop() {
    this.stopped = true;
    if (this.reactionTimer) clearTimeout(this.reactionTimer);
    for (const pending of this.pendingThemeImports.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error("Pet runtime stopped"));
    }
    this.pendingThemeImports.clear();
    this.desktop?.kill();
    this.desktop = void 0;
    const server = this.server;
    this.server = void 0;
    const closeServer = server ? new Promise((resolveClosed) => {
      for (const client of server.clients) client.close(1001, "Plugin unloaded");
      server.close(() => resolveClosed());
    }) : Promise.resolve();
    await Promise.all([closeServer, this.removeRendezvous()]);
  }
  openDesktop() {
    if (!this.server) return false;
    if (this.authenticatedDesktop()) return true;
    if (this.desktop && this.desktop.exitCode === null && !this.desktop.killed) return true;
    const launch = desktopLaunch(this.config);
    if (!launch) {
      this.logger.warn("desktop executable is not installed for this platform");
      return false;
    }
    const address = this.server.address();
    if (!address || typeof address === "string") return false;
    const child = spawn(launch.command, launch.args, {
      stdio: ["pipe", "ignore", "ignore"],
      env: { ...process.env, XY_DEEPSEEK_PET_CHILD: "1" }
    });
    child.stdin?.end(`${JSON.stringify({ port: address.port, token: this.token })}
`);
    child.once("exit", () => {
      if (this.desktop === child) this.desktop = void 0;
    });
    child.once("error", (error) => this.logger.warn(`desktop launch failed: ${String(error)}`));
    this.desktop = child;
    return true;
  }
  desktopStatus() {
    return Boolean(this.authenticatedDesktop()) || Boolean(this.desktop && this.desktop.exitCode === null && !this.desktop.killed);
  }
  closeDesktop() {
    const socket = this.authenticatedDesktop();
    if (socket) {
      this.send(socket, { type: "quit" });
      return true;
    }
    if (this.desktop && this.desktop.exitCode === null && !this.desktop.killed) {
      return this.desktop.kill();
    }
    return false;
  }
  async importTheme(fileName, dataBase64) {
    if (extname(fileName).toLowerCase() !== ".zip" || dataBase64.length > 28e6) {
      throw new Error("Pet package must be a ZIP no larger than 20 MiB");
    }
    const bytes = Buffer.from(dataBase64, "base64");
    if (bytes.length < 4 || bytes.length > 20 * 1024 * 1024 || bytes.subarray(0, 2).toString("hex") !== "504b") {
      throw new Error("The selected file is not a valid ZIP package");
    }
    if (!this.authenticatedDesktop()) {
      this.openDesktop();
      await this.waitForDesktop(5e3);
    }
    const socket = this.authenticatedDesktop();
    if (!socket) throw new Error("Open the desktop pet before importing a pet package");
    const requestId = randomUUID();
    const directory = resolve3(homedir3(), ".xy-deepseek-pet", "imports");
    const archivePath = resolve3(directory, `${requestId}.zip`);
    await mkdir3(directory, { recursive: true, mode: 448 });
    await writeFile3(archivePath, bytes, { mode: 384 });
    return new Promise((resolveTheme, reject) => {
      const timeout = setTimeout(() => {
        this.pendingThemeImports.delete(requestId);
        void rm(archivePath, { force: true });
        reject(new Error("Desktop pet did not finish importing the package"));
      }, 2e4);
      this.pendingThemeImports.set(requestId, {
        resolve: (themeId) => {
          void rm(archivePath, { force: true });
          resolveTheme(themeId);
        },
        reject: (error) => {
          void rm(archivePath, { force: true });
          reject(error);
        },
        timeout
      });
      this.send(socket, { type: "theme-import", requestId, path: archivePath });
    });
  }
  createLauncher(name2, iconId, fileName, dataBase64) {
    const packageRoot = resolve3(import.meta.dirname, "..");
    return createDesktopLauncher({ packageRoot, name: name2, iconId, fileName, dataBase64 });
  }
  async importThemeArchive(path, signal) {
    const archivePath = resolve3(path);
    if (extname(archivePath).toLowerCase() !== ".zip") throw new Error("Pet theme must be a ZIP file");
    const metadata = await lstat(archivePath);
    if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size <= 0 || metadata.size > 20 * 1024 * 1024) {
      throw new Error("Pet theme must be a regular ZIP file no larger than 20 MiB");
    }
    const bytes = await readFile3(archivePath, { signal });
    return this.importTheme(basename2(archivePath), bytes.toString("base64"));
  }
  onAgentCreated(agent) {
    this.touch(agent);
    this.selectLatest();
  }
  onAgentDisposed(agent) {
    this.touched.delete(String(agent.id));
    this.sessions.delete(String(agent.id));
    this.lastAssistantText.delete(String(agent.id));
    this.activeToolCalls.delete(String(agent.id));
    this.pendingQuestionCalls.delete(String(agent.id));
    this.pendingApprovals.delete(String(agent.id));
    if (this.selected === agent) this.selectLatest();
    this.publishAggregate();
  }
  onAgentStatus(agent, status) {
    if (!this.isRoot(agent)) return;
    this.touch(agent);
    this.selected = agent;
    if (status === "running") {
      this.cancelReaction();
      this.lastAssistantText.delete(String(agent.id));
      this.updateSession(String(agent.id), { state: "thinking", unread: false, text: "Thinking" });
      this.publish({ type: "agent/running", sessionId: String(agent.id) });
      return;
    }
    const summary = this.sessions.get(String(agent.id));
    if (summary?.state === "complete" || summary?.state === "error" || summary?.state === "needsInput") return;
    this.updateSession(String(agent.id), { state: "idle", unread: false, text: void 0 });
    this.publishAggregate();
  }
  onSessionEvent(session, event) {
    const agent = this.ctx.agents.get(session.id);
    if (!agent || !this.isRoot(agent)) return;
    this.touch(agent);
    this.selected = agent;
    const sessionId = String(session.id);
    const title = visibleSessionTitle(event);
    if (title) {
      this.updateSession(sessionId, { title, updatedAt: event.time });
      this.publishAggregate();
      return;
    }
    const approval = approvalAuditEvent(event);
    if (approval?.type === "approval/asked") {
      const approvals = this.pendingApprovals.get(sessionId) ?? /* @__PURE__ */ new Map();
      approvals.set(approval.data.id, approval.data.toolName);
      this.pendingApprovals.set(sessionId, approvals);
      this.publishAttentionState(sessionId, approval.time);
      return;
    }
    if (approval?.type === "approval/decided") {
      this.pendingApprovals.get(sessionId)?.delete(approval.data.id);
      this.publishCurrentActivity(sessionId, approval.time);
      return;
    }
    switch (event.type) {
      case "turn/start":
        this.cancelReaction();
        this.lastAssistantText.delete(sessionId);
        this.activeToolCalls.delete(sessionId);
        this.pendingQuestionCalls.delete(sessionId);
        this.pendingApprovals.delete(sessionId);
        this.updateSession(sessionId, { state: "thinking", unread: false, text: "Thinking" });
        this.publish({ type: "agent/running", sessionId, time: event.time });
        break;
      case "tool/call":
        {
          const callId = String(event.data.callId);
          const toolName = safeToolName(event.data.name);
          if (toolName === "ask_user_question" || toolName === "request_user_input") {
            const questions = this.pendingQuestionCalls.get(sessionId) ?? /* @__PURE__ */ new Set();
            questions.add(callId);
            this.pendingQuestionCalls.set(sessionId, questions);
            this.publishAttentionState(sessionId, event.time);
            break;
          }
          const tools = this.activeToolCalls.get(sessionId) ?? /* @__PURE__ */ new Map();
          tools.set(callId, toolName);
          this.activeToolCalls.set(sessionId, tools);
          const text = boundedStatusText(`Using ${toolName}`) ?? "Working";
          this.updateSession(sessionId, { state: "working", text });
          this.publish({ type: "step/working", sessionId, text, time: event.time });
        }
        break;
      case "tool/result": {
        const callId = toolResultCallId(event);
        if (callId) {
          this.activeToolCalls.get(sessionId)?.delete(callId);
          this.pendingQuestionCalls.get(sessionId)?.delete(callId);
        }
        this.publishCurrentActivity(sessionId, event.time);
        break;
      }
      case "assistant/chunk": {
        const delta = visibleAssistantChunk(event);
        if (!delta) break;
        const text = boundedStatusText(`${this.lastAssistantText.get(sessionId) ?? ""}${delta}`);
        if (!text) break;
        this.lastAssistantText.set(sessionId, text);
        this.updateSession(sessionId, { text });
        this.publish({ type: "assistant/text", sessionId, text, time: event.time });
        break;
      }
      case "assistant/message": {
        const text = visibleAssistantText(event);
        if (text) {
          this.lastAssistantText.set(sessionId, text);
          this.updateSession(sessionId, { text });
          this.publish({ type: "assistant/text", sessionId, text, time: event.time });
        }
        break;
      }
      case "turn/end":
        this.activeToolCalls.delete(sessionId);
        this.pendingQuestionCalls.delete(sessionId);
        this.pendingApprovals.delete(sessionId);
        if (event.data.reason.kind === "completed") {
          const text = this.lastAssistantText.get(sessionId) ?? "Done";
          this.updateSession(sessionId, { state: "complete", unread: true, text });
          this.publish({ type: "turn/complete", sessionId, text, time: event.time });
          this.scheduleIdle(agent);
        } else if (event.data.reason.kind === "blocked") {
          this.updateSession(sessionId, { state: "needsInput", unread: true, text: "Needs your input" });
          this.publish({ type: "agent/needs-input", sessionId, text: "Needs your input", time: event.time });
        } else if (event.data.reason.kind === "error") {
          this.updateSession(sessionId, { state: "error", unread: true, text: "Something went wrong" });
          this.publish({ type: "agent/error", sessionId, text: "Something went wrong", time: event.time });
        } else {
          this.updateSession(sessionId, { state: "idle", unread: false, text: void 0 });
          this.publishAggregate();
        }
        break;
    }
  }
  publishAttentionState(sessionId, time) {
    const approval = [...this.pendingApprovals.get(sessionId)?.values() ?? []].at(-1);
    const text = approval ? `Approval required: ${approval}` : "Waiting for your answer";
    this.updateSession(sessionId, { state: "needsInput", unread: true, text });
    this.publish({ type: "agent/needs-input", sessionId, text, time });
  }
  publishCurrentActivity(sessionId, time) {
    const hasQuestions = Boolean(this.pendingQuestionCalls.get(sessionId)?.size);
    const hasApprovals = Boolean(this.pendingApprovals.get(sessionId)?.size);
    if (hasQuestions || hasApprovals) return this.publishAttentionState(sessionId, time);
    const activeTool = [...this.activeToolCalls.get(sessionId)?.values() ?? []].at(-1);
    if (activeTool) {
      const text = boundedStatusText(`Using ${activeTool}`) ?? "Working";
      this.updateSession(sessionId, { state: "working", unread: false, text });
      this.publish({ type: "step/working", sessionId, text, time });
      return;
    }
    this.updateSession(sessionId, { state: "thinking", unread: false, text: "Thinking" });
    this.publish({ type: "agent/running", sessionId, time });
  }
  onAgentError(agent) {
    if (agent !== this.selected && !this.isRoot(agent)) return;
    this.selected = agent;
    this.updateSession(String(agent.id), { state: "error", unread: true, text: "Something went wrong" });
    this.publish({ type: "agent/error", sessionId: String(agent.id), text: "Something went wrong" });
  }
  accept(socket) {
    const authTimer = setTimeout(() => socket.close(1008, "Authentication required"), 2e3);
    socket.on("message", (data) => {
      const byteLength = Array.isArray(data) ? data.reduce((total, part) => total + part.byteLength, 0) : data.byteLength;
      if (byteLength > MAX_WIRE_BYTES) return socket.close(1009, "Message too large");
      let value;
      try {
        value = JSON.parse(data.toString());
      } catch {
        return socket.close(1003, "Invalid JSON");
      }
      if (!isBridgeClientMessage(value)) return socket.close(1008, "Invalid message");
      if (!this.authenticated.has(socket)) {
        if (value.type !== "auth" || !authMatches(value.token, this.token)) return socket.close(1008, "Authentication failed");
        clearTimeout(authTimer);
        this.authenticated.add(socket);
        this.send(socket, { type: "snapshot", snapshot: this.snapshot });
        return;
      }
      if (value.type === "chat") this.submitChat(socket, value.requestId, value.text, value.sessionId);
      if (value.type === "focus") this.openDesktop();
      if (value.type === "acknowledge") this.acknowledge(value.sessionId);
      if (value.type === "open-client") this.openClient(value.sessionId);
      if (value.type === "shutdown-service") this.shutdownOwnedService();
      if (value.type === "theme-import-result") this.resolveThemeImport(value);
    });
    socket.once("close", () => clearTimeout(authTimer));
  }
  submitChat(socket, requestId, text, sessionId) {
    const agent = sessionId ? this.ctx.agents.roots().find((candidate) => String(candidate.id) === sessionId) : this.selectLatest();
    if (agent && !this.isRoot(agent)) {
      return this.send(socket, { type: "chat-result", requestId, ok: false, error: "The selected session is not eligible." });
    }
    if (!agent) return this.send(socket, { type: "chat-result", requestId, ok: false, error: "No active Harness session." });
    try {
      agent.followup(createUserMessage({
        content: [{ type: "text", text: text.trim() }],
        source: { kind: "user" }
      }));
      this.touch(agent);
      this.acknowledge(String(agent.id));
      this.send(socket, { type: "chat-result", requestId, ok: true });
    } catch {
      this.send(socket, { type: "chat-result", requestId, ok: false, error: "Harness rejected the message." });
    }
  }
  publish(event) {
    this.snapshot = { ...reducePetEvent(this.snapshot, event), sessions: this.sortedSessions() };
    this.broadcast();
  }
  publishAggregate() {
    const summaries = this.sortedSessions();
    const active = summaries.find((entry) => entry.state === "needsInput") ?? summaries.find((entry) => entry.state === "error" && entry.unread) ?? summaries.find((entry) => entry.state === "working") ?? summaries.find((entry) => entry.state === "thinking");
    const nextState = active?.state ?? "idle";
    const { sessionId: _sessionId, text: _text, ...snapshotBase } = this.snapshot;
    const activeFields = active ? { sessionId: active.id, ...active.text ? { text: active.text } : {} } : {};
    this.snapshot = {
      ...snapshotBase,
      state: nextState,
      connected: true,
      sequence: this.snapshot.sequence + 1,
      time: Date.now(),
      sessions: summaries,
      ...activeFields
    };
    this.broadcast();
  }
  broadcast() {
    const message = { type: "snapshot", snapshot: this.snapshot };
    for (const client of this.server?.clients ?? []) {
      if (client.readyState === WebSocket.OPEN && this.authenticated.has(client)) this.send(client, message);
    }
  }
  updateSession(id, patch) {
    const previous = this.sessions.get(id);
    this.sessions.set(id, {
      id,
      title: patch.title ?? previous?.title ?? "",
      state: patch.state ?? previous?.state ?? "idle",
      unread: patch.unread ?? previous?.unread ?? false,
      updatedAt: patch.updatedAt ?? Date.now(),
      ...patch.text !== void 0 ? { text: patch.text } : previous?.text ? { text: previous.text } : {}
    });
    if (patch.text === void 0 && Object.prototype.hasOwnProperty.call(patch, "text")) {
      const current = this.sessions.get(id);
      delete current.text;
    }
  }
  sortedSessions() {
    const priority = {
      needsInput: 6,
      error: 5,
      complete: 4,
      working: 3,
      thinking: 2,
      walk: 1,
      idle: 0,
      sleep: 0,
      offline: 0
    };
    return [...this.sessions.values()].filter((entry) => entry.state !== "idle" || entry.unread).sort((a, b) => priority[b.state] - priority[a.state] || b.updatedAt - a.updatedAt).slice(0, 64);
  }
  acknowledge(sessionId) {
    const summary = this.sessions.get(sessionId);
    if (!summary) return;
    this.updateSession(sessionId, {
      unread: false,
      ...summary.state === "complete" || summary.state === "error" ? { state: "idle", text: void 0 } : {}
    });
    this.publishAggregate();
  }
  openClient(sessionId) {
    if (sessionId) this.acknowledge(sessionId);
    const now = Date.now();
    const target = sessionId ?? "";
    if (this.lastClientOpen?.target === target && now - this.lastClientOpen.at < 5e3) return;
    this.lastClientOpen = { target, at: now };
    const url = this.config.clientUrl ?? process.env.XY_DEEPSEEK_PET_CLIENT_URL ?? "http://127.0.0.1:3080";
    const launch = process.platform === "darwin" ? { command: "open", args: [url] } : process.platform === "win32" ? { command: "cmd.exe", args: ["/d", "/s", "/c", "start", "", url] } : { command: "xdg-open", args: [url] };
    const child = spawn(launch.command, launch.args, { stdio: "ignore", windowsHide: true });
    child.unref();
  }
  shutdownOwnedService() {
    if (process.env.XY_DEEPSEEK_PET_SERVICE_OWNER !== "launcher") {
      this.logger.warn("ignored service shutdown request for an externally owned process");
      return;
    }
    this.logger.info("launcher-owned Harness service is stopping");
    setTimeout(() => process.kill(process.pid, "SIGTERM"), 50).unref();
  }
  send(socket, message) {
    socket.send(JSON.stringify(message));
  }
  authenticatedDesktop() {
    return [...this.server?.clients ?? []].find((socket) => socket.readyState === WebSocket.OPEN && this.authenticated.has(socket));
  }
  waitForDesktop(timeoutMs) {
    if (this.authenticatedDesktop()) return Promise.resolve();
    return new Promise((resolveWait, reject) => {
      const startedAt = Date.now();
      const interval = setInterval(() => {
        if (this.authenticatedDesktop()) {
          clearInterval(interval);
          resolveWait();
        } else if (Date.now() - startedAt >= timeoutMs) {
          clearInterval(interval);
          reject(new Error("Desktop pet could not be opened"));
        }
      }, 100);
    });
  }
  resolveThemeImport(message) {
    const pending = this.pendingThemeImports.get(message.requestId);
    if (!pending) return;
    clearTimeout(pending.timeout);
    this.pendingThemeImports.delete(message.requestId);
    if (message.ok) pending.resolve(message.themeId);
    else pending.reject(new Error(message.error));
  }
  scheduleIdle(agent) {
    this.cancelReaction();
    this.reactionTimer = setTimeout(() => {
      if (!this.stopped && this.selected === agent && agent.status === "idle") {
        this.publishAggregate();
      }
    }, REACTION_MS);
  }
  cancelReaction() {
    if (this.reactionTimer) clearTimeout(this.reactionTimer);
    this.reactionTimer = void 0;
  }
  touch(agent) {
    this.touched.set(String(agent.id), ++this.sequence);
  }
  isRoot(agent) {
    return this.ctx.agents.roots().includes(agent);
  }
  selectLatest() {
    const roots = this.ctx.agents.roots();
    roots.sort((a, b) => (this.touched.get(String(a.id)) ?? 0) - (this.touched.get(String(b.id)) ?? 0));
    this.selected = roots.at(-1);
    return this.selected;
  }
  rendezvousPath() {
    return this.config.rendezvousPath ?? resolve3(homedir3(), ".xy-deepseek-pet", "bridge.json");
  }
  async writeRendezvous() {
    const address = this.server?.address();
    if (!address || typeof address === "string") return;
    const path = this.rendezvousPath();
    await mkdir3(dirname2(path), { recursive: true, mode: 448 });
    try {
      const existing = JSON.parse(await readFile3(path, "utf8"));
      const ownedByThisRuntime = existing.pid === process.pid && existing.token === this.token;
      if (!ownedByThisRuntime && processAlive(existing.pid)) {
        this.logger.warn("kept rendezvous descriptor owned by another live Harness process");
        return;
      }
    } catch {
    }
    await writeFile3(path, `${JSON.stringify({
      version: 1,
      pid: process.pid,
      port: address.port,
      token: this.token,
      serviceOwned: process.env.XY_DEEPSEEK_PET_SERVICE_OWNER === "launcher",
      clientUrl: this.config.clientUrl ?? "http://127.0.0.1:3080"
    })}
`, { mode: 384 });
  }
  async removeRendezvous() {
    const path = this.rendezvousPath();
    try {
      const existing = JSON.parse(await readFile3(path, "utf8"));
      if (existing.pid !== process.pid || existing.token !== this.token) return;
      await rm(path, { force: true });
    } catch {
    }
  }
};
async function apply(ctx, config = {}) {
  const menuRegistry = new PetMenuRegistry(ctx);
  const settings = new PetSettingsController(desktopResourceRoot(config), menuRegistry);
  await settings.initialize();
  const runtime = new HarnessPetRuntime(ctx, config, settings);
  registerPetAgentCapabilities(ctx, runtime, settings);
  new PetSettingsGateway(ctx, settings, runtime);
  ctx.on("agent/created", ({ agent }) => runtime.onAgentCreated(agent));
  ctx.on("agent/disposed", ({ agent }) => runtime.onAgentDisposed(agent));
  ctx.on("agent/status", ({ agent, status }) => runtime.onAgentStatus(agent, status));
  ctx.on("session/event", (session, event) => runtime.onSessionEvent(session, event));
  ctx.on("agent/error", ({ agent }) => runtime.onAgentError(agent));
  ctx.effect(
    () => ctx.commands.register({
      name: "pet",
      description: "Open or focus XY DeepSeek Pet",
      recordInput: false,
      handler: () => runtime.openDesktop() ? { kind: "success", text: "XY DeepSeek Pet is open." } : { kind: "error", text: "The desktop companion is not installed for this platform." }
    }),
    "xy-deepseek-pet command"
  );
  ctx.effect(() => {
    void runtime.start().catch((error) => ctx.logger("xy-deepseek-pet").error(`startup failed: ${String(error)}`));
    return () => runtime.stop();
  }, "xy-deepseek-pet runtime");
}
export {
  HarnessPetRuntime,
  PetMenuRegistry,
  apply,
  inject,
  name
};
//# sourceMappingURL=index.js.map
