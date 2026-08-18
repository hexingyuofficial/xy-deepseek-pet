window.__ModuleLoader__.load({
  id: "xy-deepseek-pet",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name2 in all)
        __defProp(target, name2, { get: all[name2], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

    // src/client.ts
    var client_exports = {};
    __export(client_exports, {
      apply: () => apply,
      inject: () => inject,
      name: () => name
    });
    module.exports = __toCommonJS(client_exports);
    var import_react2 = __toESM(require("react"), 1);

    // ../sounds/src/settings-view.ts
    var import_react = __toESM(require("react"), 1);
    var CHANNELS = ["turnComplete", "toolSuccess", "toolFailure"];
    function remoteValue(result) {
      if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
      return result.value;
    }
    function toBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
      return btoa(binary);
    }
    function browserUsesChinese() {
      return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh");
    }
    var copy = {
      en: { title: "Sound notifications", description: "Task and tool result sounds", mute: "Mute all", volume: "Volume", turnComplete: "Task complete", toolSuccess: "Tool succeeded", toolFailure: "Tool failed", enabled: "Enabled", preview: "Preview", delete: "Delete", choose: "Choose sound", drop: "Drop your sound here", browse: "Choose file", restore: "Restore built-ins", saved: "Saved", loading: "Loading\u2026", custom: "Custom", behavior: "Behavior", quietShort: "Silence short tasks", frequency: "Tool frequency", quiet: "Quiet", normal: "Normal", every: "Every result", seconds: "s" },
      zh: { title: "\u63D0\u793A\u97F3", description: "\u4EFB\u52A1\u4E0E\u5DE5\u5177\u7ED3\u679C\u7684\u58F0\u97F3\u63D0\u9192", mute: "\u5168\u90E8\u9759\u97F3", volume: "\u97F3\u91CF", turnComplete: "\u4EFB\u52A1\u5B8C\u6210", toolSuccess: "\u5DE5\u5177\u6210\u529F", toolFailure: "\u5DE5\u5177\u5931\u8D25", enabled: "\u542F\u7528", preview: "\u8BD5\u542C", delete: "\u5220\u9664", choose: "\u9009\u62E9\u58F0\u97F3", drop: "\u62D6\u5165\u4F60\u559C\u6B22\u7684\u58F0\u97F3", browse: "\u9009\u62E9\u6587\u4EF6", restore: "\u6062\u590D\u5185\u7F6E\u58F0\u97F3", saved: "\u5DF2\u4FDD\u5B58", loading: "\u52A0\u8F7D\u4E2D\u2026", custom: "\u81EA\u5B9A\u4E49", behavior: "\u63D0\u9192\u884C\u4E3A", quietShort: "\u77ED\u4EFB\u52A1\u4E0D\u63D0\u9192", frequency: "\u5DE5\u5177\u63D0\u793A\u9891\u7387", quiet: "\u5B89\u9759", normal: "\u6B63\u5E38", every: "\u6BCF\u6B21\u7ED3\u679C", seconds: "\u79D2" }
    };
    var styles = {
      root: { alignSelf: "start", width: "100%", minHeight: 0, color: "var(--dsw-alias-label-primary, #f4f5f6)", marginTop: 8, borderTop: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.1))" },
      summary: { minHeight: 42, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", listStyle: "none", fontSize: 13, fontWeight: 600 },
      disclosure: { display: "inline-block", width: 12, flex: "0 0 12px", fontSize: 10, lineHeight: 1, textAlign: "center" },
      content: { padding: "0 0 8px 14px" },
      row: { display: "grid", gridTemplateColumns: "minmax(110px, 1fr) minmax(170px, 1.4fr)", gap: 12, alignItems: "center", minHeight: 42 },
      channel: { padding: "2px 0", borderTop: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.07))" },
      channelSummary: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 40, cursor: "pointer", fontSize: 13 },
      channelBody: { padding: "2px 0 10px 18px" },
      controls: { display: "flex", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center", gap: 6 },
      choices: { display: "flex", flexWrap: "wrap", gap: 6, margin: "5px 0 8px" },
      button: { minHeight: 32, border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))", borderRadius: 6, padding: "0 10px", background: "transparent", color: "inherit", cursor: "pointer" },
      active: { borderColor: "var(--dsw-alias-accent-primary, #1688f8)", background: "var(--dsw-alias-bg-elevated, rgba(255,255,255,.07))" },
      range: { width: "100%", accentColor: "var(--dsw-alias-accent-primary, #1688f8)" },
      check: { width: 16, height: 16, accentColor: "var(--dsw-alias-accent-primary, #1688f8)" },
      drop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 44, padding: "6px 8px", border: "1px dashed var(--dsw-alias-border-l2, rgba(255,255,255,.22))", borderRadius: 6, fontSize: 12 },
      hint: { color: "var(--dsw-alias-label-secondary, #aeb3bb)", fontSize: 12 },
      status: { minHeight: 18, fontSize: 12, color: "var(--dsw-alias-label-secondary, #aeb3bb)" },
      error: { minHeight: 18, fontSize: 12, color: "var(--dsw-alias-danger, #ff6b6b)" }
    };
    function SoundSettings({ remote, locale, embedded = false }) {
      const c = locale === "zh-CN" || !locale && browserUsesChinese() ? copy.zh : copy.en;
      const [snapshot2, setSnapshot] = (0, import_react.useState)();
      const [draft, setDraft] = (0, import_react.useState)();
      const [status, setStatus] = (0, import_react.useState)(c.loading);
      const [error51, setError] = (0, import_react.useState)("");
      const [dragging, setDragging] = (0, import_react.useState)();
      const [open, setOpen] = (0, import_react.useState)(false);
      const fileInputs = (0, import_react.useRef)({});
      const saveTimer = (0, import_react.useRef)();
      const saveRevision = (0, import_react.useRef)(0);
      (0, import_react.useEffect)(() => {
        let live = true;
        remote.snapshot().then(remoteValue).then((value) => {
          if (live) {
            setSnapshot(value);
            setDraft(value.config);
            setStatus("");
          }
        }).catch((reason) => live && setError(String(reason)));
        return () => {
          live = false;
          if (saveTimer.current) clearTimeout(saveTimer.current);
        };
      }, [remote]);
      const commit = (0, import_react.useCallback)(async (next) => {
        const revision = ++saveRevision.current;
        setDraft(next);
        setError("");
        setStatus("\u2026");
        try {
          const value = remoteValue(await remote.update(next));
          if (revision === saveRevision.current) {
            setSnapshot(value);
            setDraft(value.config);
            setStatus(c.saved);
          }
        } catch (reason) {
          setError(String(reason));
          setStatus("");
        }
      }, [c.saved, remote]);
      const mutate = (0, import_react.useCallback)((change) => {
        setDraft((current) => {
          if (!current) return current;
          const next = structuredClone(current);
          change(next);
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => void commit(next), 160);
          return next;
        });
      }, [commit]);
      const importFile = (0, import_react.useCallback)(async (channel, file2) => {
        if (!snapshot2 || !draft) return;
        setError("");
        if (file2.size === 0 || file2.size > snapshot2.limits.maximumBytes) {
          setError(locale === "zh-CN" ? "\u58F0\u97F3\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 10 MiB" : "Sound must be no larger than 10 MiB");
          return;
        }
        setStatus("\u2026");
        try {
          const oldIds = new Set(snapshot2.sounds.map((sound) => sound.id));
          const imported = remoteValue(await remote.importSound(file2.name, toBase64(await file2.arrayBuffer())));
          const newSound = imported.sounds.find((sound) => !oldIds.has(sound.id) && sound.channels.includes(channel));
          const next = structuredClone(imported.config);
          if (newSound) next.channels[channel].soundId = newSound.id;
          const value = remoteValue(await remote.update(next));
          setSnapshot(value);
          setDraft(value.config);
          setStatus(c.saved);
        } catch (reason) {
          setError(String(reason));
          setStatus("");
        }
      }, [c.saved, draft, locale, remote, snapshot2]);
      if (!snapshot2 || !draft) return import_react.default.createElement("div", { style: { ...styles.root, display: "flex", alignItems: "center", minHeight: 42, maxHeight: 42, overflow: "hidden", fontSize: 13 } }, error51 || status);
      const range = (value, onChange, max = 1, step = 0.05) => import_react.default.createElement("input", { type: "range", min: 0, max, step, value, style: styles.range, onChange: (event) => onChange(Number(event.currentTarget.value)) });
      const frequency = draft.toolCooldownMs >= 4e3 ? "quiet" : draft.toolCooldownMs === 0 && draft.toolCoalesceMs === 0 ? "every" : "normal";
      const setFrequency = (value) => mutate((next) => {
        if (value === "quiet") {
          next.toolCooldownMs = 5e3;
          next.toolCoalesceMs = 800;
        } else if (value === "every") {
          next.toolCooldownMs = 0;
          next.toolCoalesceMs = 0;
        } else {
          next.toolCooldownMs = 1500;
          next.toolCoalesceMs = 400;
        }
      });
      const channels = CHANNELS.map((channel) => {
        const config2 = draft.channels[channel];
        const sounds = snapshot2.sounds.filter((sound) => sound.channels.includes(channel));
        const selected = sounds.find((sound) => sound.id === config2.soundId);
        return import_react.default.createElement(
          "details",
          { key: channel, style: styles.channel },
          import_react.default.createElement("summary", { style: styles.channelSummary }, import_react.default.createElement("span", null, c[channel]), import_react.default.createElement("span", { style: styles.controls }, import_react.default.createElement("span", { style: styles.hint }, selected?.displayName ?? config2.soundId), import_react.default.createElement("input", { type: "checkbox", style: styles.check, title: c.enabled, checked: config2.enabled, onClick: (event) => event.stopPropagation(), onChange: (event) => {
            const checked = event.currentTarget.checked;
            mutate((next) => {
              next.channels[channel].enabled = checked;
            });
          } }))),
          import_react.default.createElement(
            "div",
            { style: styles.channelBody },
            import_react.default.createElement("div", { style: styles.choices }, ...sounds.map((sound) => import_react.default.createElement("button", { key: sound.id, type: "button", style: { ...styles.button, ...sound.id === config2.soundId ? styles.active : {} }, onClick: () => mutate((next) => {
              next.channels[channel].soundId = sound.id;
            }) }, sound.displayName))),
            import_react.default.createElement("div", { style: styles.row }, `${c.volume} \xB7 ${Math.round(config2.volume * 100)}%`, range(config2.volume, (value) => mutate((next) => {
              next.channels[channel].volume = value;
            }))),
            import_react.default.createElement("div", { style: styles.controls }, import_react.default.createElement("button", { type: "button", style: styles.button, onClick: () => remote.preview(channel, config2.soundId).then(remoteValue).catch((reason) => setError(String(reason))) }, c.preview), !selected?.builtIn && import_react.default.createElement("button", { type: "button", style: styles.button, onClick: async () => {
              try {
                const value = remoteValue(await remote.removeSound(config2.soundId));
                setSnapshot(value);
                setDraft(value.config);
              } catch (reason) {
                setError(String(reason));
              }
            } }, c.delete)),
            import_react.default.createElement("div", { style: { ...styles.drop, ...dragging === channel ? { borderColor: "var(--dsw-alias-accent-primary, #1688f8)" } : {} }, onDragEnter: (event) => {
              event.preventDefault();
              setDragging(channel);
            }, onDragOver: (event) => event.preventDefault(), onDragLeave: () => setDragging(void 0), onDrop: (event) => {
              event.preventDefault();
              setDragging(void 0);
              const file2 = event.dataTransfer.files[0];
              if (file2) void importFile(channel, file2);
            } }, import_react.default.createElement("span", null, c.drop), import_react.default.createElement("button", { type: "button", style: styles.button, onClick: () => fileInputs.current[channel]?.click() }, c.browse)),
            import_react.default.createElement("input", { ref: (element) => {
              fileInputs.current[channel] = element;
            }, type: "file", accept: ".wav,.mp3,.ogg,audio/wav,audio/mpeg,audio/ogg", hidden: true, onChange: (event) => {
              const file2 = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file2) void importFile(channel, file2);
            } })
          )
        );
      });
      return import_react.default.createElement(
        "details",
        { open, onToggle: (event) => setOpen(event.currentTarget.open), style: { ...styles.root, ...embedded ? {} : { borderTop: 0 }, ...!open ? { maxHeight: 42, overflow: "hidden" } : {} } },
        import_react.default.createElement("summary", { style: styles.summary }, import_react.default.createElement("span", { style: styles.disclosure, "aria-hidden": true }, open ? "\u25BC" : "\u25B6"), import_react.default.createElement("span", null, `${c.title} \xB7 ${c.description}`)),
        import_react.default.createElement(
          "div",
          { style: styles.content },
          import_react.default.createElement("div", { style: styles.row }, c.mute, import_react.default.createElement("input", { type: "checkbox", style: styles.check, checked: draft.masterMute, onChange: (event) => {
            const checked = event.currentTarget.checked;
            mutate((next) => {
              next.masterMute = checked;
            });
          } })),
          import_react.default.createElement("div", { style: styles.row }, `${c.volume} \xB7 ${Math.round(draft.masterVolume * 100)}%`, range(draft.masterVolume, (value) => mutate((next) => {
            next.masterVolume = value;
          }))),
          ...channels,
          import_react.default.createElement("details", { style: styles.channel }, import_react.default.createElement("summary", { style: styles.channelSummary }, c.behavior), import_react.default.createElement(
            "div",
            { style: styles.channelBody },
            import_react.default.createElement("div", { style: styles.row }, `${c.quietShort} \xB7 ${Math.round(draft.minimumTurnDurationMs / 100) / 10} ${c.seconds}`, range(draft.minimumTurnDurationMs, (value) => mutate((next) => {
              next.minimumTurnDurationMs = value;
            }), 6e4, 500)),
            import_react.default.createElement("div", { style: styles.row }, c.frequency, import_react.default.createElement("div", { style: styles.controls }, ...["quiet", "normal", "every"].map((value) => import_react.default.createElement("button", { key: value, type: "button", style: { ...styles.button, ...frequency === value ? styles.active : {} }, onClick: () => setFrequency(value) }, c[value])))),
            import_react.default.createElement("button", { type: "button", style: styles.button, onClick: async () => {
              try {
                const value = remoteValue(await remote.restoreBuiltIns());
                setSnapshot(value);
                setDraft(value.config);
                setStatus(c.saved);
              } catch (reason) {
                setError(String(reason));
              }
            } }, c.restore)
          )),
          import_react.default.createElement("div", { style: error51 ? styles.error : styles.status, role: "status" }, error51 || status)
        )
      );
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js
    var external_exports = {};
    __export(external_exports, {
      $brand: () => $brand,
      $input: () => $input,
      $output: () => $output,
      NEVER: () => NEVER,
      TimePrecision: () => TimePrecision,
      ZodAny: () => ZodAny,
      ZodArray: () => ZodArray,
      ZodBase64: () => ZodBase64,
      ZodBase64URL: () => ZodBase64URL,
      ZodBigInt: () => ZodBigInt,
      ZodBigIntFormat: () => ZodBigIntFormat,
      ZodBoolean: () => ZodBoolean,
      ZodCIDRv4: () => ZodCIDRv4,
      ZodCIDRv6: () => ZodCIDRv6,
      ZodCUID: () => ZodCUID,
      ZodCUID2: () => ZodCUID2,
      ZodCatch: () => ZodCatch,
      ZodCodec: () => ZodCodec,
      ZodCustom: () => ZodCustom,
      ZodCustomStringFormat: () => ZodCustomStringFormat,
      ZodDate: () => ZodDate,
      ZodDefault: () => ZodDefault,
      ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
      ZodE164: () => ZodE164,
      ZodEmail: () => ZodEmail,
      ZodEmoji: () => ZodEmoji,
      ZodEnum: () => ZodEnum,
      ZodError: () => ZodError,
      ZodExactOptional: () => ZodExactOptional,
      ZodFile: () => ZodFile,
      ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
      ZodFunction: () => ZodFunction,
      ZodGUID: () => ZodGUID,
      ZodIPv4: () => ZodIPv4,
      ZodIPv6: () => ZodIPv6,
      ZodISODate: () => ZodISODate,
      ZodISODateTime: () => ZodISODateTime,
      ZodISODuration: () => ZodISODuration,
      ZodISOTime: () => ZodISOTime,
      ZodIntersection: () => ZodIntersection,
      ZodIssueCode: () => ZodIssueCode,
      ZodJWT: () => ZodJWT,
      ZodKSUID: () => ZodKSUID,
      ZodLazy: () => ZodLazy,
      ZodLiteral: () => ZodLiteral,
      ZodMAC: () => ZodMAC,
      ZodMap: () => ZodMap,
      ZodNaN: () => ZodNaN,
      ZodNanoID: () => ZodNanoID,
      ZodNever: () => ZodNever,
      ZodNonOptional: () => ZodNonOptional,
      ZodNull: () => ZodNull,
      ZodNullable: () => ZodNullable,
      ZodNumber: () => ZodNumber,
      ZodNumberFormat: () => ZodNumberFormat,
      ZodObject: () => ZodObject,
      ZodOptional: () => ZodOptional,
      ZodPipe: () => ZodPipe,
      ZodPrefault: () => ZodPrefault,
      ZodPreprocess: () => ZodPreprocess,
      ZodPromise: () => ZodPromise,
      ZodReadonly: () => ZodReadonly,
      ZodRealError: () => ZodRealError,
      ZodRecord: () => ZodRecord,
      ZodSet: () => ZodSet,
      ZodString: () => ZodString,
      ZodStringFormat: () => ZodStringFormat,
      ZodSuccess: () => ZodSuccess,
      ZodSymbol: () => ZodSymbol,
      ZodTemplateLiteral: () => ZodTemplateLiteral,
      ZodTransform: () => ZodTransform,
      ZodTuple: () => ZodTuple,
      ZodType: () => ZodType,
      ZodULID: () => ZodULID,
      ZodURL: () => ZodURL,
      ZodUUID: () => ZodUUID,
      ZodUndefined: () => ZodUndefined,
      ZodUnion: () => ZodUnion,
      ZodUnknown: () => ZodUnknown,
      ZodVoid: () => ZodVoid,
      ZodXID: () => ZodXID,
      ZodXor: () => ZodXor,
      _ZodString: () => _ZodString,
      _default: () => _default2,
      _function: () => _function,
      any: () => any,
      array: () => array,
      base64: () => base642,
      base64url: () => base64url2,
      bigint: () => bigint2,
      boolean: () => boolean2,
      catch: () => _catch2,
      check: () => check,
      cidrv4: () => cidrv42,
      cidrv6: () => cidrv62,
      clone: () => clone,
      codec: () => codec,
      coerce: () => coerce_exports,
      config: () => config,
      core: () => core_exports2,
      cuid: () => cuid3,
      cuid2: () => cuid22,
      custom: () => custom,
      date: () => date3,
      decode: () => decode2,
      decodeAsync: () => decodeAsync2,
      describe: () => describe2,
      discriminatedUnion: () => discriminatedUnion,
      e164: () => e1642,
      email: () => email2,
      emoji: () => emoji2,
      encode: () => encode2,
      encodeAsync: () => encodeAsync2,
      endsWith: () => _endsWith,
      enum: () => _enum2,
      exactOptional: () => exactOptional,
      file: () => file,
      flattenError: () => flattenError,
      float32: () => float32,
      float64: () => float64,
      formatError: () => formatError,
      fromJSONSchema: () => fromJSONSchema,
      function: () => _function,
      getErrorMap: () => getErrorMap,
      globalRegistry: () => globalRegistry,
      gt: () => _gt,
      gte: () => _gte,
      guid: () => guid2,
      hash: () => hash,
      hex: () => hex2,
      hostname: () => hostname2,
      httpUrl: () => httpUrl,
      includes: () => _includes,
      instanceof: () => _instanceof,
      int: () => int,
      int32: () => int32,
      int64: () => int64,
      intersection: () => intersection,
      invertCodec: () => invertCodec,
      ipv4: () => ipv42,
      ipv6: () => ipv62,
      iso: () => iso_exports,
      json: () => json,
      jwt: () => jwt,
      keyof: () => keyof,
      ksuid: () => ksuid2,
      lazy: () => lazy,
      length: () => _length,
      literal: () => literal,
      locales: () => locales_exports,
      looseObject: () => looseObject,
      looseRecord: () => looseRecord,
      lowercase: () => _lowercase,
      lt: () => _lt,
      lte: () => _lte,
      mac: () => mac2,
      map: () => map,
      maxLength: () => _maxLength,
      maxSize: () => _maxSize,
      meta: () => meta2,
      mime: () => _mime,
      minLength: () => _minLength,
      minSize: () => _minSize,
      multipleOf: () => _multipleOf,
      nan: () => nan,
      nanoid: () => nanoid2,
      nativeEnum: () => nativeEnum,
      negative: () => _negative,
      never: () => never,
      nonnegative: () => _nonnegative,
      nonoptional: () => nonoptional,
      nonpositive: () => _nonpositive,
      normalize: () => _normalize,
      null: () => _null3,
      nullable: () => nullable,
      nullish: () => nullish2,
      number: () => number2,
      object: () => object,
      optional: () => optional,
      overwrite: () => _overwrite,
      parse: () => parse2,
      parseAsync: () => parseAsync2,
      partialRecord: () => partialRecord,
      pipe: () => pipe,
      positive: () => _positive,
      prefault: () => prefault,
      preprocess: () => preprocess,
      prettifyError: () => prettifyError,
      promise: () => promise,
      property: () => _property,
      readonly: () => readonly,
      record: () => record,
      refine: () => refine,
      regex: () => _regex,
      regexes: () => regexes_exports,
      registry: () => registry,
      safeDecode: () => safeDecode2,
      safeDecodeAsync: () => safeDecodeAsync2,
      safeEncode: () => safeEncode2,
      safeEncodeAsync: () => safeEncodeAsync2,
      safeParse: () => safeParse2,
      safeParseAsync: () => safeParseAsync2,
      set: () => set,
      setErrorMap: () => setErrorMap,
      size: () => _size,
      slugify: () => _slugify,
      startsWith: () => _startsWith,
      strictObject: () => strictObject,
      string: () => string2,
      stringFormat: () => stringFormat,
      stringbool: () => stringbool,
      success: () => success,
      superRefine: () => superRefine,
      symbol: () => symbol,
      templateLiteral: () => templateLiteral,
      toJSONSchema: () => toJSONSchema,
      toLowerCase: () => _toLowerCase,
      toUpperCase: () => _toUpperCase,
      transform: () => transform,
      treeifyError: () => treeifyError,
      trim: () => _trim,
      tuple: () => tuple,
      uint32: () => uint32,
      uint64: () => uint64,
      ulid: () => ulid2,
      undefined: () => _undefined3,
      union: () => union,
      unknown: () => unknown,
      uppercase: () => _uppercase,
      url: () => url,
      util: () => util_exports,
      uuid: () => uuid2,
      uuidv4: () => uuidv4,
      uuidv6: () => uuidv6,
      uuidv7: () => uuidv7,
      void: () => _void2,
      xid: () => xid2,
      xor: () => xor
    });

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/index.js
    var core_exports2 = {};
    __export(core_exports2, {
      $ZodAny: () => $ZodAny,
      $ZodArray: () => $ZodArray,
      $ZodAsyncError: () => $ZodAsyncError,
      $ZodBase64: () => $ZodBase64,
      $ZodBase64URL: () => $ZodBase64URL,
      $ZodBigInt: () => $ZodBigInt,
      $ZodBigIntFormat: () => $ZodBigIntFormat,
      $ZodBoolean: () => $ZodBoolean,
      $ZodCIDRv4: () => $ZodCIDRv4,
      $ZodCIDRv6: () => $ZodCIDRv6,
      $ZodCUID: () => $ZodCUID,
      $ZodCUID2: () => $ZodCUID2,
      $ZodCatch: () => $ZodCatch,
      $ZodCheck: () => $ZodCheck,
      $ZodCheckBigIntFormat: () => $ZodCheckBigIntFormat,
      $ZodCheckEndsWith: () => $ZodCheckEndsWith,
      $ZodCheckGreaterThan: () => $ZodCheckGreaterThan,
      $ZodCheckIncludes: () => $ZodCheckIncludes,
      $ZodCheckLengthEquals: () => $ZodCheckLengthEquals,
      $ZodCheckLessThan: () => $ZodCheckLessThan,
      $ZodCheckLowerCase: () => $ZodCheckLowerCase,
      $ZodCheckMaxLength: () => $ZodCheckMaxLength,
      $ZodCheckMaxSize: () => $ZodCheckMaxSize,
      $ZodCheckMimeType: () => $ZodCheckMimeType,
      $ZodCheckMinLength: () => $ZodCheckMinLength,
      $ZodCheckMinSize: () => $ZodCheckMinSize,
      $ZodCheckMultipleOf: () => $ZodCheckMultipleOf,
      $ZodCheckNumberFormat: () => $ZodCheckNumberFormat,
      $ZodCheckOverwrite: () => $ZodCheckOverwrite,
      $ZodCheckProperty: () => $ZodCheckProperty,
      $ZodCheckRegex: () => $ZodCheckRegex,
      $ZodCheckSizeEquals: () => $ZodCheckSizeEquals,
      $ZodCheckStartsWith: () => $ZodCheckStartsWith,
      $ZodCheckStringFormat: () => $ZodCheckStringFormat,
      $ZodCheckUpperCase: () => $ZodCheckUpperCase,
      $ZodCodec: () => $ZodCodec,
      $ZodCustom: () => $ZodCustom,
      $ZodCustomStringFormat: () => $ZodCustomStringFormat,
      $ZodDate: () => $ZodDate,
      $ZodDefault: () => $ZodDefault,
      $ZodDiscriminatedUnion: () => $ZodDiscriminatedUnion,
      $ZodE164: () => $ZodE164,
      $ZodEmail: () => $ZodEmail,
      $ZodEmoji: () => $ZodEmoji,
      $ZodEncodeError: () => $ZodEncodeError,
      $ZodEnum: () => $ZodEnum,
      $ZodError: () => $ZodError,
      $ZodExactOptional: () => $ZodExactOptional,
      $ZodFile: () => $ZodFile,
      $ZodFunction: () => $ZodFunction,
      $ZodGUID: () => $ZodGUID,
      $ZodIPv4: () => $ZodIPv4,
      $ZodIPv6: () => $ZodIPv6,
      $ZodISODate: () => $ZodISODate,
      $ZodISODateTime: () => $ZodISODateTime,
      $ZodISODuration: () => $ZodISODuration,
      $ZodISOTime: () => $ZodISOTime,
      $ZodIntersection: () => $ZodIntersection,
      $ZodJWT: () => $ZodJWT,
      $ZodKSUID: () => $ZodKSUID,
      $ZodLazy: () => $ZodLazy,
      $ZodLiteral: () => $ZodLiteral,
      $ZodMAC: () => $ZodMAC,
      $ZodMap: () => $ZodMap,
      $ZodNaN: () => $ZodNaN,
      $ZodNanoID: () => $ZodNanoID,
      $ZodNever: () => $ZodNever,
      $ZodNonOptional: () => $ZodNonOptional,
      $ZodNull: () => $ZodNull,
      $ZodNullable: () => $ZodNullable,
      $ZodNumber: () => $ZodNumber,
      $ZodNumberFormat: () => $ZodNumberFormat,
      $ZodObject: () => $ZodObject,
      $ZodObjectJIT: () => $ZodObjectJIT,
      $ZodOptional: () => $ZodOptional,
      $ZodPipe: () => $ZodPipe,
      $ZodPrefault: () => $ZodPrefault,
      $ZodPreprocess: () => $ZodPreprocess,
      $ZodPromise: () => $ZodPromise,
      $ZodReadonly: () => $ZodReadonly,
      $ZodRealError: () => $ZodRealError,
      $ZodRecord: () => $ZodRecord,
      $ZodRegistry: () => $ZodRegistry,
      $ZodSet: () => $ZodSet,
      $ZodString: () => $ZodString,
      $ZodStringFormat: () => $ZodStringFormat,
      $ZodSuccess: () => $ZodSuccess,
      $ZodSymbol: () => $ZodSymbol,
      $ZodTemplateLiteral: () => $ZodTemplateLiteral,
      $ZodTransform: () => $ZodTransform,
      $ZodTuple: () => $ZodTuple,
      $ZodType: () => $ZodType,
      $ZodULID: () => $ZodULID,
      $ZodURL: () => $ZodURL,
      $ZodUUID: () => $ZodUUID,
      $ZodUndefined: () => $ZodUndefined,
      $ZodUnion: () => $ZodUnion,
      $ZodUnknown: () => $ZodUnknown,
      $ZodVoid: () => $ZodVoid,
      $ZodXID: () => $ZodXID,
      $ZodXor: () => $ZodXor,
      $brand: () => $brand,
      $constructor: () => $constructor,
      $input: () => $input,
      $output: () => $output,
      Doc: () => Doc,
      JSONSchema: () => json_schema_exports,
      JSONSchemaGenerator: () => JSONSchemaGenerator,
      NEVER: () => NEVER,
      TimePrecision: () => TimePrecision,
      _any: () => _any,
      _array: () => _array,
      _base64: () => _base64,
      _base64url: () => _base64url,
      _bigint: () => _bigint,
      _boolean: () => _boolean,
      _catch: () => _catch,
      _check: () => _check,
      _cidrv4: () => _cidrv4,
      _cidrv6: () => _cidrv6,
      _coercedBigint: () => _coercedBigint,
      _coercedBoolean: () => _coercedBoolean,
      _coercedDate: () => _coercedDate,
      _coercedNumber: () => _coercedNumber,
      _coercedString: () => _coercedString,
      _cuid: () => _cuid,
      _cuid2: () => _cuid2,
      _custom: () => _custom,
      _date: () => _date,
      _decode: () => _decode,
      _decodeAsync: () => _decodeAsync,
      _default: () => _default,
      _discriminatedUnion: () => _discriminatedUnion,
      _e164: () => _e164,
      _email: () => _email,
      _emoji: () => _emoji2,
      _encode: () => _encode,
      _encodeAsync: () => _encodeAsync,
      _endsWith: () => _endsWith,
      _enum: () => _enum,
      _file: () => _file,
      _float32: () => _float32,
      _float64: () => _float64,
      _gt: () => _gt,
      _gte: () => _gte,
      _guid: () => _guid,
      _includes: () => _includes,
      _int: () => _int,
      _int32: () => _int32,
      _int64: () => _int64,
      _intersection: () => _intersection,
      _ipv4: () => _ipv4,
      _ipv6: () => _ipv6,
      _isoDate: () => _isoDate,
      _isoDateTime: () => _isoDateTime,
      _isoDuration: () => _isoDuration,
      _isoTime: () => _isoTime,
      _jwt: () => _jwt,
      _ksuid: () => _ksuid,
      _lazy: () => _lazy,
      _length: () => _length,
      _literal: () => _literal,
      _lowercase: () => _lowercase,
      _lt: () => _lt,
      _lte: () => _lte,
      _mac: () => _mac,
      _map: () => _map,
      _max: () => _lte,
      _maxLength: () => _maxLength,
      _maxSize: () => _maxSize,
      _mime: () => _mime,
      _min: () => _gte,
      _minLength: () => _minLength,
      _minSize: () => _minSize,
      _multipleOf: () => _multipleOf,
      _nan: () => _nan,
      _nanoid: () => _nanoid,
      _nativeEnum: () => _nativeEnum,
      _negative: () => _negative,
      _never: () => _never,
      _nonnegative: () => _nonnegative,
      _nonoptional: () => _nonoptional,
      _nonpositive: () => _nonpositive,
      _normalize: () => _normalize,
      _null: () => _null2,
      _nullable: () => _nullable,
      _number: () => _number,
      _optional: () => _optional,
      _overwrite: () => _overwrite,
      _parse: () => _parse,
      _parseAsync: () => _parseAsync,
      _pipe: () => _pipe,
      _positive: () => _positive,
      _promise: () => _promise,
      _property: () => _property,
      _readonly: () => _readonly,
      _record: () => _record,
      _refine: () => _refine,
      _regex: () => _regex,
      _safeDecode: () => _safeDecode,
      _safeDecodeAsync: () => _safeDecodeAsync,
      _safeEncode: () => _safeEncode,
      _safeEncodeAsync: () => _safeEncodeAsync,
      _safeParse: () => _safeParse,
      _safeParseAsync: () => _safeParseAsync,
      _set: () => _set,
      _size: () => _size,
      _slugify: () => _slugify,
      _startsWith: () => _startsWith,
      _string: () => _string,
      _stringFormat: () => _stringFormat,
      _stringbool: () => _stringbool,
      _success: () => _success,
      _superRefine: () => _superRefine,
      _symbol: () => _symbol,
      _templateLiteral: () => _templateLiteral,
      _toLowerCase: () => _toLowerCase,
      _toUpperCase: () => _toUpperCase,
      _transform: () => _transform,
      _trim: () => _trim,
      _tuple: () => _tuple,
      _uint32: () => _uint32,
      _uint64: () => _uint64,
      _ulid: () => _ulid,
      _undefined: () => _undefined2,
      _union: () => _union,
      _unknown: () => _unknown,
      _uppercase: () => _uppercase,
      _url: () => _url,
      _uuid: () => _uuid,
      _uuidv4: () => _uuidv4,
      _uuidv6: () => _uuidv6,
      _uuidv7: () => _uuidv7,
      _void: () => _void,
      _xid: () => _xid,
      _xor: () => _xor,
      clone: () => clone,
      config: () => config,
      createStandardJSONSchemaMethod: () => createStandardJSONSchemaMethod,
      createToJSONSchemaMethod: () => createToJSONSchemaMethod,
      decode: () => decode,
      decodeAsync: () => decodeAsync,
      describe: () => describe,
      encode: () => encode,
      encodeAsync: () => encodeAsync,
      extractDefs: () => extractDefs,
      finalize: () => finalize,
      flattenError: () => flattenError,
      formatError: () => formatError,
      globalConfig: () => globalConfig,
      globalRegistry: () => globalRegistry,
      initializeContext: () => initializeContext,
      isValidBase64: () => isValidBase64,
      isValidBase64URL: () => isValidBase64URL,
      isValidJWT: () => isValidJWT,
      locales: () => locales_exports,
      meta: () => meta,
      parse: () => parse,
      parseAsync: () => parseAsync,
      prettifyError: () => prettifyError,
      process: () => process,
      regexes: () => regexes_exports,
      registry: () => registry,
      safeDecode: () => safeDecode,
      safeDecodeAsync: () => safeDecodeAsync,
      safeEncode: () => safeEncode,
      safeEncodeAsync: () => safeEncodeAsync,
      safeParse: () => safeParse,
      safeParseAsync: () => safeParseAsync,
      toDotPath: () => toDotPath,
      toJSONSchema: () => toJSONSchema,
      treeifyError: () => treeifyError,
      util: () => util_exports,
      version: () => version
    });

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
    var _a;
    var NEVER = /* @__PURE__ */ Object.freeze({
      status: "aborted"
    });
    // @__NO_SIDE_EFFECTS__
    function $constructor(name2, initializer3, params) {
      function init(inst, def) {
        if (!inst._zod) {
          Object.defineProperty(inst, "_zod", {
            value: {
              def,
              constr: _,
              traits: /* @__PURE__ */ new Set()
            },
            enumerable: false
          });
        }
        if (inst._zod.traits.has(name2)) {
          return;
        }
        inst._zod.traits.add(name2);
        initializer3(inst, def);
        const proto = _.prototype;
        const keys = Object.keys(proto);
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (!(k in inst)) {
            inst[k] = proto[k].bind(inst);
          }
        }
      }
      const Parent = params?.Parent ?? Object;
      class Definition extends Parent {
      }
      Object.defineProperty(Definition, "name", { value: name2 });
      function _(def) {
        var _a3;
        const inst = params?.Parent ? new Definition() : this;
        init(inst, def);
        (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
        for (const fn of inst._zod.deferred) {
          fn();
        }
        return inst;
      }
      Object.defineProperty(_, "init", { value: init });
      Object.defineProperty(_, Symbol.hasInstance, {
        value: (inst) => {
          if (params?.Parent && inst instanceof params.Parent)
            return true;
          return inst?._zod?.traits?.has(name2);
        }
      });
      Object.defineProperty(_, "name", { value: name2 });
      return _;
    }
    var $brand = Symbol("zod_brand");
    var $ZodAsyncError = class extends Error {
      constructor() {
        super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
      }
    };
    var $ZodEncodeError = class extends Error {
      constructor(name2) {
        super(`Encountered unidirectional transform during encode: ${name2}`);
        this.name = "ZodEncodeError";
      }
    };
    (_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
    var globalConfig = globalThis.__zod_globalConfig;
    function config(newConfig) {
      if (newConfig)
        Object.assign(globalConfig, newConfig);
      return globalConfig;
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
    var util_exports = {};
    __export(util_exports, {
      BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
      Class: () => Class,
      NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
      aborted: () => aborted,
      allowsEval: () => allowsEval,
      assert: () => assert,
      assertEqual: () => assertEqual,
      assertIs: () => assertIs,
      assertNever: () => assertNever,
      assertNotEqual: () => assertNotEqual,
      assignProp: () => assignProp,
      base64ToUint8Array: () => base64ToUint8Array,
      base64urlToUint8Array: () => base64urlToUint8Array,
      cached: () => cached,
      captureStackTrace: () => captureStackTrace,
      cleanEnum: () => cleanEnum,
      cleanRegex: () => cleanRegex,
      clone: () => clone,
      cloneDef: () => cloneDef,
      createTransparentProxy: () => createTransparentProxy,
      defineLazy: () => defineLazy,
      esc: () => esc,
      escapeRegex: () => escapeRegex,
      explicitlyAborted: () => explicitlyAborted,
      extend: () => extend,
      finalizeIssue: () => finalizeIssue,
      floatSafeRemainder: () => floatSafeRemainder,
      getElementAtPath: () => getElementAtPath,
      getEnumValues: () => getEnumValues,
      getLengthableOrigin: () => getLengthableOrigin,
      getParsedType: () => getParsedType,
      getSizableOrigin: () => getSizableOrigin,
      hexToUint8Array: () => hexToUint8Array,
      isObject: () => isObject,
      isPlainObject: () => isPlainObject,
      issue: () => issue,
      joinValues: () => joinValues,
      jsonStringifyReplacer: () => jsonStringifyReplacer,
      merge: () => merge,
      mergeDefs: () => mergeDefs,
      normalizeParams: () => normalizeParams,
      nullish: () => nullish,
      numKeys: () => numKeys,
      objectClone: () => objectClone,
      omit: () => omit,
      optionalKeys: () => optionalKeys,
      parsedType: () => parsedType,
      partial: () => partial,
      pick: () => pick,
      prefixIssues: () => prefixIssues,
      primitiveTypes: () => primitiveTypes,
      promiseAllObject: () => promiseAllObject,
      propertyKeyTypes: () => propertyKeyTypes,
      randomString: () => randomString,
      required: () => required,
      safeExtend: () => safeExtend,
      shallowClone: () => shallowClone,
      slugify: () => slugify,
      stringifyPrimitive: () => stringifyPrimitive,
      uint8ArrayToBase64: () => uint8ArrayToBase64,
      uint8ArrayToBase64url: () => uint8ArrayToBase64url,
      uint8ArrayToHex: () => uint8ArrayToHex,
      unwrapMessage: () => unwrapMessage
    });
    function assertEqual(val) {
      return val;
    }
    function assertNotEqual(val) {
      return val;
    }
    function assertIs(_arg) {
    }
    function assertNever(_x) {
      throw new Error("Unexpected value in exhaustive check");
    }
    function assert(_) {
    }
    function getEnumValues(entries) {
      const numericValues = Object.values(entries).filter((v) => typeof v === "number");
      const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
      return values;
    }
    function joinValues(array2, separator = "|") {
      return array2.map((val) => stringifyPrimitive(val)).join(separator);
    }
    function jsonStringifyReplacer(_, value) {
      if (typeof value === "bigint")
        return value.toString();
      return value;
    }
    function cached(getter) {
      const set2 = false;
      return {
        get value() {
          if (!set2) {
            const value = getter();
            Object.defineProperty(this, "value", { value });
            return value;
          }
          throw new Error("cached value already set");
        }
      };
    }
    function nullish(input) {
      return input === null || input === void 0;
    }
    function cleanRegex(source) {
      const start = source.startsWith("^") ? 1 : 0;
      const end = source.endsWith("$") ? source.length - 1 : source.length;
      return source.slice(start, end);
    }
    function floatSafeRemainder(val, step) {
      const ratio = val / step;
      const roundedRatio = Math.round(ratio);
      const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
      if (Math.abs(ratio - roundedRatio) < tolerance)
        return 0;
      return ratio - roundedRatio;
    }
    var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
    function defineLazy(object2, key, getter) {
      let value = void 0;
      Object.defineProperty(object2, key, {
        get() {
          if (value === EVALUATING) {
            return void 0;
          }
          if (value === void 0) {
            value = EVALUATING;
            value = getter();
          }
          return value;
        },
        set(v) {
          Object.defineProperty(object2, key, {
            value: v
            // configurable: true,
          });
        },
        configurable: true
      });
    }
    function objectClone(obj) {
      return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
    }
    function assignProp(target, prop, value) {
      Object.defineProperty(target, prop, {
        value,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
    function mergeDefs(...defs) {
      const mergedDescriptors = {};
      for (const def of defs) {
        const descriptors = Object.getOwnPropertyDescriptors(def);
        Object.assign(mergedDescriptors, descriptors);
      }
      return Object.defineProperties({}, mergedDescriptors);
    }
    function cloneDef(schema) {
      return mergeDefs(schema._zod.def);
    }
    function getElementAtPath(obj, path) {
      if (!path)
        return obj;
      return path.reduce((acc, key) => acc?.[key], obj);
    }
    function promiseAllObject(promisesObj) {
      const keys = Object.keys(promisesObj);
      const promises = keys.map((key) => promisesObj[key]);
      return Promise.all(promises).then((results) => {
        const resolvedObj = {};
        for (let i = 0; i < keys.length; i++) {
          resolvedObj[keys[i]] = results[i];
        }
        return resolvedObj;
      });
    }
    function randomString(length = 10) {
      const chars = "abcdefghijklmnopqrstuvwxyz";
      let str = "";
      for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
      }
      return str;
    }
    function esc(str) {
      return JSON.stringify(str);
    }
    function slugify(input) {
      return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
    }
    var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
    };
    function isObject(data) {
      return typeof data === "object" && data !== null && !Array.isArray(data);
    }
    var allowsEval = /* @__PURE__ */ cached(() => {
      if (globalConfig.jitless) {
        return false;
      }
      if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
        return false;
      }
      try {
        const F = Function;
        new F("");
        return true;
      } catch (_) {
        return false;
      }
    });
    function isPlainObject(o) {
      if (isObject(o) === false)
        return false;
      const ctor = o.constructor;
      if (ctor === void 0)
        return true;
      if (typeof ctor !== "function")
        return true;
      const prot = ctor.prototype;
      if (isObject(prot) === false)
        return false;
      if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
        return false;
      }
      return true;
    }
    function shallowClone(o) {
      if (isPlainObject(o))
        return { ...o };
      if (Array.isArray(o))
        return [...o];
      if (o instanceof Map)
        return new Map(o);
      if (o instanceof Set)
        return new Set(o);
      return o;
    }
    function numKeys(data) {
      let keyCount = 0;
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          keyCount++;
        }
      }
      return keyCount;
    }
    var getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return "undefined";
        case "string":
          return "string";
        case "number":
          return Number.isNaN(data) ? "nan" : "number";
        case "boolean":
          return "boolean";
        case "function":
          return "function";
        case "bigint":
          return "bigint";
        case "symbol":
          return "symbol";
        case "object":
          if (Array.isArray(data)) {
            return "array";
          }
          if (data === null) {
            return "null";
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return "promise";
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return "map";
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return "set";
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return "date";
          }
          if (typeof File !== "undefined" && data instanceof File) {
            return "file";
          }
          return "object";
        default:
          throw new Error(`Unknown data type: ${t}`);
      }
    };
    var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
    var primitiveTypes = /* @__PURE__ */ new Set([
      "string",
      "number",
      "bigint",
      "boolean",
      "symbol",
      "undefined"
    ]);
    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function clone(inst, def, params) {
      const cl = new inst._zod.constr(def ?? inst._zod.def);
      if (!def || params?.parent)
        cl._zod.parent = inst;
      return cl;
    }
    function normalizeParams(_params) {
      const params = _params;
      if (!params)
        return {};
      if (typeof params === "string")
        return { error: () => params };
      if (params?.message !== void 0) {
        if (params?.error !== void 0)
          throw new Error("Cannot specify both `message` and `error` params");
        params.error = params.message;
      }
      delete params.message;
      if (typeof params.error === "string")
        return { ...params, error: () => params.error };
      return params;
    }
    function createTransparentProxy(getter) {
      let target;
      return new Proxy({}, {
        get(_, prop, receiver) {
          target ?? (target = getter());
          return Reflect.get(target, prop, receiver);
        },
        set(_, prop, value, receiver) {
          target ?? (target = getter());
          return Reflect.set(target, prop, value, receiver);
        },
        has(_, prop) {
          target ?? (target = getter());
          return Reflect.has(target, prop);
        },
        deleteProperty(_, prop) {
          target ?? (target = getter());
          return Reflect.deleteProperty(target, prop);
        },
        ownKeys(_) {
          target ?? (target = getter());
          return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(_, prop) {
          target ?? (target = getter());
          return Reflect.getOwnPropertyDescriptor(target, prop);
        },
        defineProperty(_, prop, descriptor) {
          target ?? (target = getter());
          return Reflect.defineProperty(target, prop, descriptor);
        }
      });
    }
    function stringifyPrimitive(value) {
      if (typeof value === "bigint")
        return value.toString() + "n";
      if (typeof value === "string")
        return `"${value}"`;
      return `${value}`;
    }
    function optionalKeys(shape) {
      return Object.keys(shape).filter((k) => {
        return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
      });
    }
    var NUMBER_FORMAT_RANGES = {
      safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
      int32: [-2147483648, 2147483647],
      uint32: [0, 4294967295],
      float32: [-34028234663852886e22, 34028234663852886e22],
      float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
    };
    var BIGINT_FORMAT_RANGES = {
      int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
      uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
    };
    function pick(schema, mask) {
      const currDef = schema._zod.def;
      const checks = currDef.checks;
      const hasChecks = checks && checks.length > 0;
      if (hasChecks) {
        throw new Error(".pick() cannot be used on object schemas containing refinements");
      }
      const def = mergeDefs(schema._zod.def, {
        get shape() {
          const newShape = {};
          for (const key in mask) {
            if (!(key in currDef.shape)) {
              throw new Error(`Unrecognized key: "${key}"`);
            }
            if (!mask[key])
              continue;
            newShape[key] = currDef.shape[key];
          }
          assignProp(this, "shape", newShape);
          return newShape;
        },
        checks: []
      });
      return clone(schema, def);
    }
    function omit(schema, mask) {
      const currDef = schema._zod.def;
      const checks = currDef.checks;
      const hasChecks = checks && checks.length > 0;
      if (hasChecks) {
        throw new Error(".omit() cannot be used on object schemas containing refinements");
      }
      const def = mergeDefs(schema._zod.def, {
        get shape() {
          const newShape = { ...schema._zod.def.shape };
          for (const key in mask) {
            if (!(key in currDef.shape)) {
              throw new Error(`Unrecognized key: "${key}"`);
            }
            if (!mask[key])
              continue;
            delete newShape[key];
          }
          assignProp(this, "shape", newShape);
          return newShape;
        },
        checks: []
      });
      return clone(schema, def);
    }
    function extend(schema, shape) {
      if (!isPlainObject(shape)) {
        throw new Error("Invalid input to extend: expected a plain object");
      }
      const checks = schema._zod.def.checks;
      const hasChecks = checks && checks.length > 0;
      if (hasChecks) {
        const existingShape = schema._zod.def.shape;
        for (const key in shape) {
          if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
            throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
          }
        }
      }
      const def = mergeDefs(schema._zod.def, {
        get shape() {
          const _shape = { ...schema._zod.def.shape, ...shape };
          assignProp(this, "shape", _shape);
          return _shape;
        }
      });
      return clone(schema, def);
    }
    function safeExtend(schema, shape) {
      if (!isPlainObject(shape)) {
        throw new Error("Invalid input to safeExtend: expected a plain object");
      }
      const def = mergeDefs(schema._zod.def, {
        get shape() {
          const _shape = { ...schema._zod.def.shape, ...shape };
          assignProp(this, "shape", _shape);
          return _shape;
        }
      });
      return clone(schema, def);
    }
    function merge(a, b) {
      if (a._zod.def.checks?.length) {
        throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
      }
      const def = mergeDefs(a._zod.def, {
        get shape() {
          const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
          assignProp(this, "shape", _shape);
          return _shape;
        },
        get catchall() {
          return b._zod.def.catchall;
        },
        checks: b._zod.def.checks ?? []
      });
      return clone(a, def);
    }
    function partial(Class2, schema, mask) {
      const currDef = schema._zod.def;
      const checks = currDef.checks;
      const hasChecks = checks && checks.length > 0;
      if (hasChecks) {
        throw new Error(".partial() cannot be used on object schemas containing refinements");
      }
      const def = mergeDefs(schema._zod.def, {
        get shape() {
          const oldShape = schema._zod.def.shape;
          const shape = { ...oldShape };
          if (mask) {
            for (const key in mask) {
              if (!(key in oldShape)) {
                throw new Error(`Unrecognized key: "${key}"`);
              }
              if (!mask[key])
                continue;
              shape[key] = Class2 ? new Class2({
                type: "optional",
                innerType: oldShape[key]
              }) : oldShape[key];
            }
          } else {
            for (const key in oldShape) {
              shape[key] = Class2 ? new Class2({
                type: "optional",
                innerType: oldShape[key]
              }) : oldShape[key];
            }
          }
          assignProp(this, "shape", shape);
          return shape;
        },
        checks: []
      });
      return clone(schema, def);
    }
    function required(Class2, schema, mask) {
      const def = mergeDefs(schema._zod.def, {
        get shape() {
          const oldShape = schema._zod.def.shape;
          const shape = { ...oldShape };
          if (mask) {
            for (const key in mask) {
              if (!(key in shape)) {
                throw new Error(`Unrecognized key: "${key}"`);
              }
              if (!mask[key])
                continue;
              shape[key] = new Class2({
                type: "nonoptional",
                innerType: oldShape[key]
              });
            }
          } else {
            for (const key in oldShape) {
              shape[key] = new Class2({
                type: "nonoptional",
                innerType: oldShape[key]
              });
            }
          }
          assignProp(this, "shape", shape);
          return shape;
        }
      });
      return clone(schema, def);
    }
    function aborted(x, startIndex = 0) {
      if (x.aborted === true)
        return true;
      for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i]?.continue !== true) {
          return true;
        }
      }
      return false;
    }
    function explicitlyAborted(x, startIndex = 0) {
      if (x.aborted === true)
        return true;
      for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i]?.continue === false) {
          return true;
        }
      }
      return false;
    }
    function prefixIssues(path, issues) {
      return issues.map((iss) => {
        var _a3;
        (_a3 = iss).path ?? (_a3.path = []);
        iss.path.unshift(path);
        return iss;
      });
    }
    function unwrapMessage(message) {
      return typeof message === "string" ? message : message?.message;
    }
    function finalizeIssue(iss, ctx, config2) {
      const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
      const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
      rest.path ?? (rest.path = []);
      rest.message = message;
      if (ctx?.reportInput) {
        rest.input = _input;
      }
      return rest;
    }
    function getSizableOrigin(input) {
      if (input instanceof Set)
        return "set";
      if (input instanceof Map)
        return "map";
      if (input instanceof File)
        return "file";
      return "unknown";
    }
    function getLengthableOrigin(input) {
      if (Array.isArray(input))
        return "array";
      if (typeof input === "string")
        return "string";
      return "unknown";
    }
    function parsedType(data) {
      const t = typeof data;
      switch (t) {
        case "number": {
          return Number.isNaN(data) ? "nan" : "number";
        }
        case "object": {
          if (data === null) {
            return "null";
          }
          if (Array.isArray(data)) {
            return "array";
          }
          const obj = data;
          if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
            return obj.constructor.name;
          }
        }
      }
      return t;
    }
    function issue(...args) {
      const [iss, input, inst] = args;
      if (typeof iss === "string") {
        return {
          message: iss,
          code: "custom",
          input,
          inst
        };
      }
      return { ...iss };
    }
    function cleanEnum(obj) {
      return Object.entries(obj).filter(([k, _]) => {
        return Number.isNaN(Number.parseInt(k, 10));
      }).map((el) => el[1]);
    }
    function base64ToUint8Array(base643) {
      const binaryString = atob(base643);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    function uint8ArrayToBase64(bytes) {
      let binaryString = "";
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      return btoa(binaryString);
    }
    function base64urlToUint8Array(base64url3) {
      const base643 = base64url3.replace(/-/g, "+").replace(/_/g, "/");
      const padding = "=".repeat((4 - base643.length % 4) % 4);
      return base64ToUint8Array(base643 + padding);
    }
    function uint8ArrayToBase64url(bytes) {
      return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
    function hexToUint8Array(hex3) {
      const cleanHex = hex3.replace(/^0x/, "");
      if (cleanHex.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
      }
      const bytes = new Uint8Array(cleanHex.length / 2);
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
      }
      return bytes;
    }
    function uint8ArrayToHex(bytes) {
      return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    var Class = class {
      constructor(..._args) {
      }
    };

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
    var initializer = (inst, def) => {
      inst.name = "$ZodError";
      Object.defineProperty(inst, "_zod", {
        value: inst._zod,
        enumerable: false
      });
      Object.defineProperty(inst, "issues", {
        value: def,
        enumerable: false
      });
      inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
      Object.defineProperty(inst, "toString", {
        value: () => inst.message,
        enumerable: false
      });
    };
    var $ZodError = $constructor("$ZodError", initializer);
    var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
    function flattenError(error51, mapper = (issue2) => issue2.message) {
      const fieldErrors = {};
      const formErrors = [];
      for (const sub of error51.issues) {
        if (sub.path.length > 0) {
          fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
          fieldErrors[sub.path[0]].push(mapper(sub));
        } else {
          formErrors.push(mapper(sub));
        }
      }
      return { formErrors, fieldErrors };
    }
    function formatError(error51, mapper = (issue2) => issue2.message) {
      const fieldErrors = { _errors: [] };
      const processError = (error52, path = []) => {
        for (const issue2 of error52.issues) {
          if (issue2.code === "invalid_union" && issue2.errors.length) {
            issue2.errors.map((issues) => processError({ issues }, [...path, ...issue2.path]));
          } else if (issue2.code === "invalid_key") {
            processError({ issues: issue2.issues }, [...path, ...issue2.path]);
          } else if (issue2.code === "invalid_element") {
            processError({ issues: issue2.issues }, [...path, ...issue2.path]);
          } else {
            const fullpath = [...path, ...issue2.path];
            if (fullpath.length === 0) {
              fieldErrors._errors.push(mapper(issue2));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < fullpath.length) {
                const el = fullpath[i];
                const terminal = i === fullpath.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue2));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        }
      };
      processError(error51);
      return fieldErrors;
    }
    function treeifyError(error51, mapper = (issue2) => issue2.message) {
      const result = { errors: [] };
      const processError = (error52, path = []) => {
        var _a3, _b;
        for (const issue2 of error52.issues) {
          if (issue2.code === "invalid_union" && issue2.errors.length) {
            issue2.errors.map((issues) => processError({ issues }, [...path, ...issue2.path]));
          } else if (issue2.code === "invalid_key") {
            processError({ issues: issue2.issues }, [...path, ...issue2.path]);
          } else if (issue2.code === "invalid_element") {
            processError({ issues: issue2.issues }, [...path, ...issue2.path]);
          } else {
            const fullpath = [...path, ...issue2.path];
            if (fullpath.length === 0) {
              result.errors.push(mapper(issue2));
              continue;
            }
            let curr = result;
            let i = 0;
            while (i < fullpath.length) {
              const el = fullpath[i];
              const terminal = i === fullpath.length - 1;
              if (typeof el === "string") {
                curr.properties ?? (curr.properties = {});
                (_a3 = curr.properties)[el] ?? (_a3[el] = { errors: [] });
                curr = curr.properties[el];
              } else {
                curr.items ?? (curr.items = []);
                (_b = curr.items)[el] ?? (_b[el] = { errors: [] });
                curr = curr.items[el];
              }
              if (terminal) {
                curr.errors.push(mapper(issue2));
              }
              i++;
            }
          }
        }
      };
      processError(error51);
      return result;
    }
    function toDotPath(_path) {
      const segs = [];
      const path = _path.map((seg) => typeof seg === "object" ? seg.key : seg);
      for (const seg of path) {
        if (typeof seg === "number")
          segs.push(`[${seg}]`);
        else if (typeof seg === "symbol")
          segs.push(`[${JSON.stringify(String(seg))}]`);
        else if (/[^\w$]/.test(seg))
          segs.push(`[${JSON.stringify(seg)}]`);
        else {
          if (segs.length)
            segs.push(".");
          segs.push(seg);
        }
      }
      return segs.join("");
    }
    function prettifyError(error51) {
      const lines = [];
      const issues = [...error51.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
      for (const issue2 of issues) {
        lines.push(`\u2716 ${issue2.message}`);
        if (issue2.path?.length)
          lines.push(`  \u2192 at ${toDotPath(issue2.path)}`);
      }
      return lines.join("\n");
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
    var _parse = (_Err) => (schema, value, _ctx, _params) => {
      const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
      const result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise) {
        throw new $ZodAsyncError();
      }
      if (result.issues.length) {
        const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, _params?.callee);
        throw e;
      }
      return result.value;
    };
    var parse = /* @__PURE__ */ _parse($ZodRealError);
    var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
      const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
      let result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise)
        result = await result;
      if (result.issues.length) {
        const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, params?.callee);
        throw e;
      }
      return result.value;
    };
    var parseAsync = /* @__PURE__ */ _parseAsync($ZodRealError);
    var _safeParse = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
      const result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise) {
        throw new $ZodAsyncError();
      }
      return result.issues.length ? {
        success: false,
        error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      } : { success: true, data: result.value };
    };
    var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
    var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
      let result = schema._zod.run({ value, issues: [] }, ctx);
      if (result instanceof Promise)
        result = await result;
      return result.issues.length ? {
        success: false,
        error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      } : { success: true, data: result.value };
    };
    var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
    var _encode = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _parse(_Err)(schema, value, ctx);
    };
    var encode = /* @__PURE__ */ _encode($ZodRealError);
    var _decode = (_Err) => (schema, value, _ctx) => {
      return _parse(_Err)(schema, value, _ctx);
    };
    var decode = /* @__PURE__ */ _decode($ZodRealError);
    var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _parseAsync(_Err)(schema, value, ctx);
    };
    var encodeAsync = /* @__PURE__ */ _encodeAsync($ZodRealError);
    var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
      return _parseAsync(_Err)(schema, value, _ctx);
    };
    var decodeAsync = /* @__PURE__ */ _decodeAsync($ZodRealError);
    var _safeEncode = (_Err) => (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _safeParse(_Err)(schema, value, ctx);
    };
    var safeEncode = /* @__PURE__ */ _safeEncode($ZodRealError);
    var _safeDecode = (_Err) => (schema, value, _ctx) => {
      return _safeParse(_Err)(schema, value, _ctx);
    };
    var safeDecode = /* @__PURE__ */ _safeDecode($ZodRealError);
    var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
      const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
      return _safeParseAsync(_Err)(schema, value, ctx);
    };
    var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync($ZodRealError);
    var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
      return _safeParseAsync(_Err)(schema, value, _ctx);
    };
    var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync($ZodRealError);

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
    var regexes_exports = {};
    __export(regexes_exports, {
      base64: () => base64,
      base64url: () => base64url,
      bigint: () => bigint,
      boolean: () => boolean,
      browserEmail: () => browserEmail,
      cidrv4: () => cidrv4,
      cidrv6: () => cidrv6,
      cuid: () => cuid,
      cuid2: () => cuid2,
      date: () => date,
      datetime: () => datetime,
      domain: () => domain,
      duration: () => duration,
      e164: () => e164,
      email: () => email,
      emoji: () => emoji,
      extendedDuration: () => extendedDuration,
      guid: () => guid,
      hex: () => hex,
      hostname: () => hostname,
      html5Email: () => html5Email,
      httpProtocol: () => httpProtocol,
      idnEmail: () => idnEmail,
      integer: () => integer,
      ipv4: () => ipv4,
      ipv6: () => ipv6,
      ksuid: () => ksuid,
      lowercase: () => lowercase,
      mac: () => mac,
      md5_base64: () => md5_base64,
      md5_base64url: () => md5_base64url,
      md5_hex: () => md5_hex,
      nanoid: () => nanoid,
      null: () => _null,
      number: () => number,
      rfc5322Email: () => rfc5322Email,
      sha1_base64: () => sha1_base64,
      sha1_base64url: () => sha1_base64url,
      sha1_hex: () => sha1_hex,
      sha256_base64: () => sha256_base64,
      sha256_base64url: () => sha256_base64url,
      sha256_hex: () => sha256_hex,
      sha384_base64: () => sha384_base64,
      sha384_base64url: () => sha384_base64url,
      sha384_hex: () => sha384_hex,
      sha512_base64: () => sha512_base64,
      sha512_base64url: () => sha512_base64url,
      sha512_hex: () => sha512_hex,
      string: () => string,
      time: () => time,
      ulid: () => ulid,
      undefined: () => _undefined,
      unicodeEmail: () => unicodeEmail,
      uppercase: () => uppercase,
      uuid: () => uuid,
      uuid4: () => uuid4,
      uuid6: () => uuid6,
      uuid7: () => uuid7,
      xid: () => xid
    });
    var cuid = /^[cC][0-9a-z]{6,}$/;
    var cuid2 = /^[0-9a-z]+$/;
    var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
    var xid = /^[0-9a-vA-V]{20}$/;
    var ksuid = /^[A-Za-z0-9]{27}$/;
    var nanoid = /^[a-zA-Z0-9_-]{21}$/;
    var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
    var extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
    var uuid = (version2) => {
      if (!version2)
        return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
      return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
    };
    var uuid4 = /* @__PURE__ */ uuid(4);
    var uuid6 = /* @__PURE__ */ uuid(6);
    var uuid7 = /* @__PURE__ */ uuid(7);
    var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
    var html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
    var idnEmail = unicodeEmail;
    var browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    function emoji() {
      return new RegExp(_emoji, "u");
    }
    var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    var mac = (delimiter) => {
      const escapedDelim = escapeRegex(delimiter ?? ":");
      return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
    };
    var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
    var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
    var base64url = /^[A-Za-z0-9_-]*$/;
    var hostname = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
    var domain = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    var httpProtocol = /^https?$/;
    var e164 = /^\+[1-9]\d{6,14}$/;
    var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
    var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
    function timeSource(args) {
      const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
      const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
      return regex;
    }
    function time(args) {
      return new RegExp(`^${timeSource(args)}$`);
    }
    function datetime(args) {
      const time3 = timeSource({ precision: args.precision });
      const opts = ["Z"];
      if (args.local)
        opts.push("");
      if (args.offset)
        opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
      const timeRegex = `${time3}(?:${opts.join("|")})`;
      return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
    }
    var string = (params) => {
      const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
      return new RegExp(`^${regex}$`);
    };
    var bigint = /^-?\d+n?$/;
    var integer = /^-?\d+$/;
    var number = /^-?\d+(?:\.\d+)?$/;
    var boolean = /^(?:true|false)$/i;
    var _null = /^null$/i;
    var _undefined = /^undefined$/i;
    var lowercase = /^[^A-Z]*$/;
    var uppercase = /^[^a-z]*$/;
    var hex = /^[0-9a-fA-F]*$/;
    function fixedBase64(bodyLength, padding) {
      return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
    }
    function fixedBase64url(length) {
      return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
    }
    var md5_hex = /^[0-9a-fA-F]{32}$/;
    var md5_base64 = /* @__PURE__ */ fixedBase64(22, "==");
    var md5_base64url = /* @__PURE__ */ fixedBase64url(22);
    var sha1_hex = /^[0-9a-fA-F]{40}$/;
    var sha1_base64 = /* @__PURE__ */ fixedBase64(27, "=");
    var sha1_base64url = /* @__PURE__ */ fixedBase64url(27);
    var sha256_hex = /^[0-9a-fA-F]{64}$/;
    var sha256_base64 = /* @__PURE__ */ fixedBase64(43, "=");
    var sha256_base64url = /* @__PURE__ */ fixedBase64url(43);
    var sha384_hex = /^[0-9a-fA-F]{96}$/;
    var sha384_base64 = /* @__PURE__ */ fixedBase64(64, "");
    var sha384_base64url = /* @__PURE__ */ fixedBase64url(64);
    var sha512_hex = /^[0-9a-fA-F]{128}$/;
    var sha512_base64 = /* @__PURE__ */ fixedBase64(86, "==");
    var sha512_base64url = /* @__PURE__ */ fixedBase64url(86);

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
    var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
      var _a3;
      inst._zod ?? (inst._zod = {});
      inst._zod.def = def;
      (_a3 = inst._zod).onattach ?? (_a3.onattach = []);
    });
    var numericOriginMap = {
      number: "number",
      bigint: "bigint",
      object: "date"
    };
    var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
      $ZodCheck.init(inst, def);
      const origin = numericOriginMap[typeof def.value];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
        if (def.value < curr) {
          if (def.inclusive)
            bag.maximum = def.value;
          else
            bag.exclusiveMaximum = def.value;
        }
      });
      inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
          return;
        }
        payload.issues.push({
          origin,
          code: "too_big",
          maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
          input: payload.value,
          inclusive: def.inclusive,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
      $ZodCheck.init(inst, def);
      const origin = numericOriginMap[typeof def.value];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
        if (def.value > curr) {
          if (def.inclusive)
            bag.minimum = def.value;
          else
            bag.exclusiveMinimum = def.value;
        }
      });
      inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
          return;
        }
        payload.issues.push({
          origin,
          code: "too_small",
          minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
          input: payload.value,
          inclusive: def.inclusive,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.onattach.push((inst2) => {
        var _a3;
        (_a3 = inst2._zod.bag).multipleOf ?? (_a3.multipleOf = def.value);
      });
      inst._zod.check = (payload) => {
        if (typeof payload.value !== typeof def.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
        if (isMultiple)
          return;
        payload.issues.push({
          origin: typeof payload.value,
          code: "not_multiple_of",
          divisor: def.value,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
      $ZodCheck.init(inst, def);
      def.format = def.format || "float64";
      const isInt = def.format?.includes("int");
      const origin = isInt ? "int" : "number";
      const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
        if (isInt)
          bag.pattern = integer;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        if (isInt) {
          if (!Number.isInteger(input)) {
            payload.issues.push({
              expected: origin,
              format: def.format,
              code: "invalid_type",
              continue: false,
              input,
              inst
            });
            return;
          }
          if (!Number.isSafeInteger(input)) {
            if (input > 0) {
              payload.issues.push({
                input,
                code: "too_big",
                maximum: Number.MAX_SAFE_INTEGER,
                note: "Integers must be within the safe integer range.",
                inst,
                origin,
                inclusive: true,
                continue: !def.abort
              });
            } else {
              payload.issues.push({
                input,
                code: "too_small",
                minimum: Number.MIN_SAFE_INTEGER,
                note: "Integers must be within the safe integer range.",
                inst,
                origin,
                inclusive: true,
                continue: !def.abort
              });
            }
            return;
          }
        }
        if (input < minimum) {
          payload.issues.push({
            origin: "number",
            input,
            code: "too_small",
            minimum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
        if (input > maximum) {
          payload.issues.push({
            origin: "number",
            input,
            code: "too_big",
            maximum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    var $ZodCheckBigIntFormat = /* @__PURE__ */ $constructor("$ZodCheckBigIntFormat", (inst, def) => {
      $ZodCheck.init(inst, def);
      const [minimum, maximum] = BIGINT_FORMAT_RANGES[def.format];
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        if (input < minimum) {
          payload.issues.push({
            origin: "bigint",
            input,
            code: "too_small",
            minimum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
        if (input > maximum) {
          payload.issues.push({
            origin: "bigint",
            input,
            code: "too_big",
            maximum,
            inclusive: true,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    var $ZodCheckMaxSize = /* @__PURE__ */ $constructor("$ZodCheckMaxSize", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.size !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        if (def.maximum < curr)
          inst2._zod.bag.maximum = def.maximum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size <= def.maximum)
          return;
        payload.issues.push({
          origin: getSizableOrigin(input),
          code: "too_big",
          maximum: def.maximum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckMinSize = /* @__PURE__ */ $constructor("$ZodCheckMinSize", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.size !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        if (def.minimum > curr)
          inst2._zod.bag.minimum = def.minimum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size >= def.minimum)
          return;
        payload.issues.push({
          origin: getSizableOrigin(input),
          code: "too_small",
          minimum: def.minimum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckSizeEquals = /* @__PURE__ */ $constructor("$ZodCheckSizeEquals", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.size !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.minimum = def.size;
        bag.maximum = def.size;
        bag.size = def.size;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size === def.size)
          return;
        const tooBig = size > def.size;
        payload.issues.push({
          origin: getSizableOrigin(input),
          ...tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size },
          inclusive: true,
          exact: true,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        if (def.maximum < curr)
          inst2._zod.bag.maximum = def.maximum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length <= def.maximum)
          return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
          origin,
          code: "too_big",
          maximum: def.maximum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        if (def.minimum > curr)
          inst2._zod.bag.minimum = def.minimum;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length >= def.minimum)
          return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
          origin,
          code: "too_small",
          minimum: def.minimum,
          inclusive: true,
          input,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
      var _a3;
      $ZodCheck.init(inst, def);
      (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== void 0;
      });
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.minimum = def.length;
        bag.maximum = def.length;
        bag.length = def.length;
      });
      inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length === def.length)
          return;
        const origin = getLengthableOrigin(input);
        const tooBig = length > def.length;
        payload.issues.push({
          origin,
          ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
          inclusive: true,
          exact: true,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
      var _a3, _b;
      $ZodCheck.init(inst, def);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.format = def.format;
        if (def.pattern) {
          bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
          bag.patterns.add(def.pattern);
        }
      });
      if (def.pattern)
        (_a3 = inst._zod).check ?? (_a3.check = (payload) => {
          def.pattern.lastIndex = 0;
          if (def.pattern.test(payload.value))
            return;
          payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: def.format,
            input: payload.value,
            ...def.pattern ? { pattern: def.pattern.toString() } : {},
            inst,
            continue: !def.abort
          });
        });
      else
        (_b = inst._zod).check ?? (_b.check = () => {
        });
    });
    var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
      $ZodCheckStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        def.pattern.lastIndex = 0;
        if (def.pattern.test(payload.value))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "regex",
          input: payload.value,
          pattern: def.pattern.toString(),
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
      def.pattern ?? (def.pattern = lowercase);
      $ZodCheckStringFormat.init(inst, def);
    });
    var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
      def.pattern ?? (def.pattern = uppercase);
      $ZodCheckStringFormat.init(inst, def);
    });
    var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
      $ZodCheck.init(inst, def);
      const escapedRegex = escapeRegex(def.includes);
      const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
      def.pattern = pattern;
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.includes(def.includes, def.position))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "includes",
          includes: def.includes,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
      $ZodCheck.init(inst, def);
      const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
      def.pattern ?? (def.pattern = pattern);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.startsWith(def.prefix))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "starts_with",
          prefix: def.prefix,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
      $ZodCheck.init(inst, def);
      const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
      def.pattern ?? (def.pattern = pattern);
      inst._zod.onattach.push((inst2) => {
        const bag = inst2._zod.bag;
        bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
        bag.patterns.add(pattern);
      });
      inst._zod.check = (payload) => {
        if (payload.value.endsWith(def.suffix))
          return;
        payload.issues.push({
          origin: "string",
          code: "invalid_format",
          format: "ends_with",
          suffix: def.suffix,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    function handleCheckPropertyResult(result, payload, property) {
      if (result.issues.length) {
        payload.issues.push(...prefixIssues(property, result.issues));
      }
    }
    var $ZodCheckProperty = /* @__PURE__ */ $constructor("$ZodCheckProperty", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.check = (payload) => {
        const result = def.schema._zod.run({
          value: payload.value[def.property],
          issues: []
        }, {});
        if (result instanceof Promise) {
          return result.then((result2) => handleCheckPropertyResult(result2, payload, def.property));
        }
        handleCheckPropertyResult(result, payload, def.property);
        return;
      };
    });
    var $ZodCheckMimeType = /* @__PURE__ */ $constructor("$ZodCheckMimeType", (inst, def) => {
      $ZodCheck.init(inst, def);
      const mimeSet = new Set(def.mime);
      inst._zod.onattach.push((inst2) => {
        inst2._zod.bag.mime = def.mime;
      });
      inst._zod.check = (payload) => {
        if (mimeSet.has(payload.value.type))
          return;
        payload.issues.push({
          code: "invalid_value",
          values: def.mime,
          input: payload.value.type,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
      $ZodCheck.init(inst, def);
      inst._zod.check = (payload) => {
        payload.value = def.tx(payload.value);
      };
    });

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
    var Doc = class {
      constructor(args = []) {
        this.content = [];
        this.indent = 0;
        if (this)
          this.args = args;
      }
      indented(fn) {
        this.indent += 1;
        fn(this);
        this.indent -= 1;
      }
      write(arg) {
        if (typeof arg === "function") {
          arg(this, { execution: "sync" });
          arg(this, { execution: "async" });
          return;
        }
        const content = arg;
        const lines = content.split("\n").filter((x) => x);
        const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
        const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
        for (const line of dedented) {
          this.content.push(line);
        }
      }
      compile() {
        const F = Function;
        const args = this?.args;
        const content = this?.content ?? [``];
        const lines = [...content.map((x) => `  ${x}`)];
        return new F(...args, lines.join("\n"));
      }
    };

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
    var version = {
      major: 4,
      minor: 4,
      patch: 3
    };

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
    var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
      var _a3;
      inst ?? (inst = {});
      inst._zod.def = def;
      inst._zod.bag = inst._zod.bag || {};
      inst._zod.version = version;
      const checks = [...inst._zod.def.checks ?? []];
      if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
      }
      for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
          fn(inst);
        }
      }
      if (checks.length === 0) {
        (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
        inst._zod.deferred?.push(() => {
          inst._zod.run = inst._zod.parse;
        });
      } else {
        const runChecks = (payload, checks2, ctx) => {
          let isAborted = aborted(payload);
          let asyncResult;
          for (const ch of checks2) {
            if (ch._zod.def.when) {
              if (explicitlyAborted(payload))
                continue;
              const shouldRun = ch._zod.def.when(payload);
              if (!shouldRun)
                continue;
            } else if (isAborted) {
              continue;
            }
            const currLen = payload.issues.length;
            const _ = ch._zod.check(payload);
            if (_ instanceof Promise && ctx?.async === false) {
              throw new $ZodAsyncError();
            }
            if (asyncResult || _ instanceof Promise) {
              asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                await _;
                const nextLen = payload.issues.length;
                if (nextLen === currLen)
                  return;
                if (!isAborted)
                  isAborted = aborted(payload, currLen);
              });
            } else {
              const nextLen = payload.issues.length;
              if (nextLen === currLen)
                continue;
              if (!isAborted)
                isAborted = aborted(payload, currLen);
            }
          }
          if (asyncResult) {
            return asyncResult.then(() => {
              return payload;
            });
          }
          return payload;
        };
        const handleCanaryResult = (canary, payload, ctx) => {
          if (aborted(canary)) {
            canary.aborted = true;
            return canary;
          }
          const checkResult = runChecks(payload, checks, ctx);
          if (checkResult instanceof Promise) {
            if (ctx.async === false)
              throw new $ZodAsyncError();
            return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
          }
          return inst._zod.parse(checkResult, ctx);
        };
        inst._zod.run = (payload, ctx) => {
          if (ctx.skipChecks) {
            return inst._zod.parse(payload, ctx);
          }
          if (ctx.direction === "backward") {
            const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
            if (canary instanceof Promise) {
              return canary.then((canary2) => {
                return handleCanaryResult(canary2, payload, ctx);
              });
            }
            return handleCanaryResult(canary, payload, ctx);
          }
          const result = inst._zod.parse(payload, ctx);
          if (result instanceof Promise) {
            if (ctx.async === false)
              throw new $ZodAsyncError();
            return result.then((result2) => runChecks(result2, checks, ctx));
          }
          return runChecks(result, checks, ctx);
        };
      }
      defineLazy(inst, "~standard", () => ({
        validate: (value) => {
          try {
            const r = safeParse(inst, value);
            return r.success ? { value: r.data } : { issues: r.error?.issues };
          } catch (_) {
            return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
          }
        },
        vendor: "zod",
        version: 1
      }));
    });
    var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
      inst._zod.parse = (payload, _) => {
        if (def.coerce)
          try {
            payload.value = String(payload.value);
          } catch (_2) {
          }
        if (typeof payload.value === "string")
          return payload;
        payload.issues.push({
          expected: "string",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
      $ZodCheckStringFormat.init(inst, def);
      $ZodString.init(inst, def);
    });
    var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
      def.pattern ?? (def.pattern = guid);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
      if (def.version) {
        const versionMap = {
          v1: 1,
          v2: 2,
          v3: 3,
          v4: 4,
          v5: 5,
          v6: 6,
          v7: 7,
          v8: 8
        };
        const v = versionMap[def.version];
        if (v === void 0)
          throw new Error(`Invalid UUID version: "${def.version}"`);
        def.pattern ?? (def.pattern = uuid(v));
      } else
        def.pattern ?? (def.pattern = uuid());
      $ZodStringFormat.init(inst, def);
    });
    var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
      def.pattern ?? (def.pattern = email);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        try {
          const trimmed = payload.value.trim();
          if (!def.normalize && def.protocol?.source === httpProtocol.source) {
            if (!/^https?:\/\//i.test(trimmed)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid URL format",
                input: payload.value,
                inst,
                continue: !def.abort
              });
              return;
            }
          }
          const url2 = new URL(trimmed);
          if (def.hostname) {
            def.hostname.lastIndex = 0;
            if (!def.hostname.test(url2.hostname)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: def.hostname.source,
                input: payload.value,
                inst,
                continue: !def.abort
              });
            }
          }
          if (def.protocol) {
            def.protocol.lastIndex = 0;
            if (!def.protocol.test(url2.protocol.endsWith(":") ? url2.protocol.slice(0, -1) : url2.protocol)) {
              payload.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid protocol",
                pattern: def.protocol.source,
                input: payload.value,
                inst,
                continue: !def.abort
              });
            }
          }
          if (def.normalize) {
            payload.value = url2.href;
          } else {
            payload.value = trimmed;
          }
          return;
        } catch (_) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
      def.pattern ?? (def.pattern = emoji());
      $ZodStringFormat.init(inst, def);
    });
    var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
      def.pattern ?? (def.pattern = nanoid);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
      def.pattern ?? (def.pattern = cuid);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
      def.pattern ?? (def.pattern = cuid2);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
      def.pattern ?? (def.pattern = ulid);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
      def.pattern ?? (def.pattern = xid);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
      def.pattern ?? (def.pattern = ksuid);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
      def.pattern ?? (def.pattern = datetime(def));
      $ZodStringFormat.init(inst, def);
    });
    var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
      def.pattern ?? (def.pattern = date);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
      def.pattern ?? (def.pattern = time(def));
      $ZodStringFormat.init(inst, def);
    });
    var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
      def.pattern ?? (def.pattern = duration);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
      def.pattern ?? (def.pattern = ipv4);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `ipv4`;
    });
    var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
      def.pattern ?? (def.pattern = ipv6);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `ipv6`;
      inst._zod.check = (payload) => {
        try {
          new URL(`http://[${payload.value}]`);
        } catch {
          payload.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    var $ZodMAC = /* @__PURE__ */ $constructor("$ZodMAC", (inst, def) => {
      def.pattern ?? (def.pattern = mac(def.delimiter));
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.format = `mac`;
    });
    var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
      def.pattern ?? (def.pattern = cidrv4);
      $ZodStringFormat.init(inst, def);
    });
    var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
      def.pattern ?? (def.pattern = cidrv6);
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        const parts = payload.value.split("/");
        try {
          if (parts.length !== 2)
            throw new Error();
          const [address, prefix] = parts;
          if (!prefix)
            throw new Error();
          const prefixNum = Number(prefix);
          if (`${prefixNum}` !== prefix)
            throw new Error();
          if (prefixNum < 0 || prefixNum > 128)
            throw new Error();
          new URL(`http://[${address}]`);
        } catch {
          payload.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      };
    });
    function isValidBase64(data) {
      if (data === "")
        return true;
      if (/\s/.test(data))
        return false;
      if (data.length % 4 !== 0)
        return false;
      try {
        atob(data);
        return true;
      } catch {
        return false;
      }
    }
    var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
      def.pattern ?? (def.pattern = base64);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.contentEncoding = "base64";
      inst._zod.check = (payload) => {
        if (isValidBase64(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "base64",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    function isValidBase64URL(data) {
      if (!base64url.test(data))
        return false;
      const base643 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
      const padded = base643.padEnd(Math.ceil(base643.length / 4) * 4, "=");
      return isValidBase64(padded);
    }
    var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
      def.pattern ?? (def.pattern = base64url);
      $ZodStringFormat.init(inst, def);
      inst._zod.bag.contentEncoding = "base64url";
      inst._zod.check = (payload) => {
        if (isValidBase64URL(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "base64url",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
      def.pattern ?? (def.pattern = e164);
      $ZodStringFormat.init(inst, def);
    });
    function isValidJWT(token, algorithm = null) {
      try {
        const tokensParts = token.split(".");
        if (tokensParts.length !== 3)
          return false;
        const [header] = tokensParts;
        if (!header)
          return false;
        const parsedHeader = JSON.parse(atob(header));
        if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
          return false;
        if (!parsedHeader.alg)
          return false;
        if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
          return false;
        return true;
      } catch {
        return false;
      }
    }
    var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        if (isValidJWT(payload.value, def.alg))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: "jwt",
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodCustomStringFormat = /* @__PURE__ */ $constructor("$ZodCustomStringFormat", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      inst._zod.check = (payload) => {
        if (def.fn(payload.value))
          return;
        payload.issues.push({
          code: "invalid_format",
          format: def.format,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      };
    });
    var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = inst._zod.bag.pattern ?? number;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = Number(payload.value);
          } catch (_) {
          }
        const input = payload.value;
        if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
          return payload;
        }
        const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
        payload.issues.push({
          expected: "number",
          code: "invalid_type",
          input,
          inst,
          ...received ? { received } : {}
        });
        return payload;
      };
    });
    var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
      $ZodCheckNumberFormat.init(inst, def);
      $ZodNumber.init(inst, def);
    });
    var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = boolean;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = Boolean(payload.value);
          } catch (_) {
          }
        const input = payload.value;
        if (typeof input === "boolean")
          return payload;
        payload.issues.push({
          expected: "boolean",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodBigInt = /* @__PURE__ */ $constructor("$ZodBigInt", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = bigint;
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
          try {
            payload.value = BigInt(payload.value);
          } catch (_) {
          }
        if (typeof payload.value === "bigint")
          return payload;
        payload.issues.push({
          expected: "bigint",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    var $ZodBigIntFormat = /* @__PURE__ */ $constructor("$ZodBigIntFormat", (inst, def) => {
      $ZodCheckBigIntFormat.init(inst, def);
      $ZodBigInt.init(inst, def);
    });
    var $ZodSymbol = /* @__PURE__ */ $constructor("$ZodSymbol", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "symbol")
          return payload;
        payload.issues.push({
          expected: "symbol",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodUndefined = /* @__PURE__ */ $constructor("$ZodUndefined", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = _undefined;
      inst._zod.values = /* @__PURE__ */ new Set([void 0]);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
          return payload;
        payload.issues.push({
          expected: "undefined",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.pattern = _null;
      inst._zod.values = /* @__PURE__ */ new Set([null]);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (input === null)
          return payload;
        payload.issues.push({
          expected: "null",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload) => payload;
    });
    var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload) => payload;
    });
    var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        payload.issues.push({
          expected: "never",
          code: "invalid_type",
          input: payload.value,
          inst
        });
        return payload;
      };
    });
    var $ZodVoid = /* @__PURE__ */ $constructor("$ZodVoid", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
          return payload;
        payload.issues.push({
          expected: "void",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodDate = /* @__PURE__ */ $constructor("$ZodDate", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        if (def.coerce) {
          try {
            payload.value = new Date(payload.value);
          } catch (_err) {
          }
        }
        const input = payload.value;
        const isDate = input instanceof Date;
        const isValidDate = isDate && !Number.isNaN(input.getTime());
        if (isValidDate)
          return payload;
        payload.issues.push({
          expected: "date",
          code: "invalid_type",
          input,
          ...isDate ? { received: "Invalid Date" } : {},
          inst
        });
        return payload;
      };
    });
    function handleArrayResult(result, final, index) {
      if (result.issues.length) {
        final.issues.push(...prefixIssues(index, result.issues));
      }
      final.value[index] = result.value;
    }
    var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
          payload.issues.push({
            expected: "array",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        payload.value = Array(input.length);
        const proms = [];
        for (let i = 0; i < input.length; i++) {
          const item = input[i];
          const result = def.element._zod.run({
            value: item,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
          } else {
            handleArrayResult(result, payload, i);
          }
        }
        if (proms.length) {
          return Promise.all(proms).then(() => payload);
        }
        return payload;
      };
    });
    function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
      const isPresent = key in input;
      if (result.issues.length) {
        if (isOptionalIn && isOptionalOut && !isPresent) {
          return;
        }
        final.issues.push(...prefixIssues(key, result.issues));
      }
      if (!isPresent && !isOptionalIn) {
        if (!result.issues.length) {
          final.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: void 0,
            path: [key]
          });
        }
        return;
      }
      if (result.value === void 0) {
        if (isPresent) {
          final.value[key] = void 0;
        }
      } else {
        final.value[key] = result.value;
      }
    }
    function normalizeDef(def) {
      const keys = Object.keys(def.shape);
      for (const k of keys) {
        if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
          throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
        }
      }
      const okeys = optionalKeys(def.shape);
      return {
        ...def,
        keys,
        keySet: new Set(keys),
        numKeys: keys.length,
        optionalKeys: new Set(okeys)
      };
    }
    function handleCatchall(proms, input, payload, ctx, def, inst) {
      const unrecognized = [];
      const keySet = def.keySet;
      const _catchall = def.catchall._zod;
      const t = _catchall.def.type;
      const isOptionalIn = _catchall.optin === "optional";
      const isOptionalOut = _catchall.optout === "optional";
      for (const key in input) {
        if (key === "__proto__")
          continue;
        if (keySet.has(key))
          continue;
        if (t === "never") {
          unrecognized.push(key);
          continue;
        }
        const r = _catchall.run({ value: input[key], issues: [] }, ctx);
        if (r instanceof Promise) {
          proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
        } else {
          handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
        }
      }
      if (unrecognized.length) {
        payload.issues.push({
          code: "unrecognized_keys",
          keys: unrecognized,
          input,
          inst
        });
      }
      if (!proms.length)
        return payload;
      return Promise.all(proms).then(() => {
        return payload;
      });
    }
    var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
      $ZodType.init(inst, def);
      const desc = Object.getOwnPropertyDescriptor(def, "shape");
      if (!desc?.get) {
        const sh = def.shape;
        Object.defineProperty(def, "shape", {
          get: () => {
            const newSh = { ...sh };
            Object.defineProperty(def, "shape", {
              value: newSh
            });
            return newSh;
          }
        });
      }
      const _normalized = cached(() => normalizeDef(def));
      defineLazy(inst._zod, "propValues", () => {
        const shape = def.shape;
        const propValues = {};
        for (const key in shape) {
          const field = shape[key]._zod;
          if (field.values) {
            propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
            for (const v of field.values)
              propValues[key].add(v);
          }
        }
        return propValues;
      });
      const isObject2 = isObject;
      const catchall = def.catchall;
      let value;
      inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject2(input)) {
          payload.issues.push({
            expected: "object",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        payload.value = {};
        const proms = [];
        const shape = value.shape;
        for (const key of value.keys) {
          const el = shape[key];
          const isOptionalIn = el._zod.optin === "optional";
          const isOptionalOut = el._zod.optout === "optional";
          const r = el._zod.run({ value: input[key], issues: [] }, ctx);
          if (r instanceof Promise) {
            proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
          } else {
            handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
          }
        }
        if (!catchall) {
          return proms.length ? Promise.all(proms).then(() => payload) : payload;
        }
        return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
      };
    });
    var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
      $ZodObject.init(inst, def);
      const superParse = inst._zod.parse;
      const _normalized = cached(() => normalizeDef(def));
      const generateFastpass = (shape) => {
        const doc = new Doc(["shape", "payload", "ctx"]);
        const normalized = _normalized.value;
        const parseStr = (key) => {
          const k = esc(key);
          return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
        };
        doc.write(`const input = payload.value;`);
        const ids = /* @__PURE__ */ Object.create(null);
        let counter = 0;
        for (const key of normalized.keys) {
          ids[key] = `key_${counter++}`;
        }
        doc.write(`const newResult = {};`);
        for (const key of normalized.keys) {
          const id = ids[key];
          const k = esc(key);
          const schema = shape[key];
          const isOptionalIn = schema?._zod?.optin === "optional";
          const isOptionalOut = schema?._zod?.optout === "optional";
          doc.write(`const ${id} = ${parseStr(key)};`);
          if (isOptionalIn && isOptionalOut) {
            doc.write(`
            if (${id}.issues.length) {
              if (${k} in input) {
                payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
                  ...iss,
                  path: iss.path ? [${k}, ...iss.path] : [${k}]
                })));
              }
            }

            if (${id}.value === undefined) {
              if (${k} in input) {
                newResult[${k}] = undefined;
              }
            } else {
              newResult[${k}] = ${id}.value;
            }

          `);
          } else if (!isOptionalIn) {
            doc.write(`
            const ${id}_present = ${k} in input;
            if (${id}.issues.length) {
              payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
                ...iss,
                path: iss.path ? [${k}, ...iss.path] : [${k}]
              })));
            }
            if (!${id}_present && !${id}.issues.length) {
              payload.issues.push({
                code: "invalid_type",
                expected: "nonoptional",
                input: undefined,
                path: [${k}]
              });
            }

            if (${id}_present) {
              if (${id}.value === undefined) {
                newResult[${k}] = undefined;
              } else {
                newResult[${k}] = ${id}.value;
              }
            }

          `);
          } else {
            doc.write(`
            if (${id}.issues.length) {
              payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
                ...iss,
                path: iss.path ? [${k}, ...iss.path] : [${k}]
              })));
            }

            if (${id}.value === undefined) {
              if (${k} in input) {
                newResult[${k}] = undefined;
              }
            } else {
              newResult[${k}] = ${id}.value;
            }

          `);
          }
        }
        doc.write(`payload.value = newResult;`);
        doc.write(`return payload;`);
        const fn = doc.compile();
        return (payload, ctx) => fn(shape, payload, ctx);
      };
      let fastpass;
      const isObject2 = isObject;
      const jit = !globalConfig.jitless;
      const allowsEval2 = allowsEval;
      const fastEnabled = jit && allowsEval2.value;
      const catchall = def.catchall;
      let value;
      inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject2(input)) {
          payload.issues.push({
            expected: "object",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
          if (!fastpass)
            fastpass = generateFastpass(def.shape);
          payload = fastpass(payload, ctx);
          if (!catchall)
            return payload;
          return handleCatchall([], input, payload, ctx, value, inst);
        }
        return superParse(payload, ctx);
      };
    });
    function handleUnionResults(results, final, inst, ctx) {
      for (const result of results) {
        if (result.issues.length === 0) {
          final.value = result.value;
          return final;
        }
      }
      const nonaborted = results.filter((r) => !aborted(r));
      if (nonaborted.length === 1) {
        final.value = nonaborted[0].value;
        return nonaborted[0];
      }
      final.issues.push({
        code: "invalid_union",
        input: final.value,
        inst,
        errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
      });
      return final;
    }
    var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
      defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
      defineLazy(inst._zod, "values", () => {
        if (def.options.every((o) => o._zod.values)) {
          return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
        }
        return void 0;
      });
      defineLazy(inst._zod, "pattern", () => {
        if (def.options.every((o) => o._zod.pattern)) {
          const patterns = def.options.map((o) => o._zod.pattern);
          return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
        }
        return void 0;
      });
      const first = def.options.length === 1 ? def.options[0]._zod.run : null;
      inst._zod.parse = (payload, ctx) => {
        if (first) {
          return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
          const result = option._zod.run({
            value: payload.value,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            results.push(result);
            async = true;
          } else {
            if (result.issues.length === 0)
              return result;
            results.push(result);
          }
        }
        if (!async)
          return handleUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results2) => {
          return handleUnionResults(results2, payload, inst, ctx);
        });
      };
    });
    function handleExclusiveUnionResults(results, final, inst, ctx) {
      const successes = results.filter((r) => r.issues.length === 0);
      if (successes.length === 1) {
        final.value = successes[0].value;
        return final;
      }
      if (successes.length === 0) {
        final.issues.push({
          code: "invalid_union",
          input: final.value,
          inst,
          errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
        });
      } else {
        final.issues.push({
          code: "invalid_union",
          input: final.value,
          inst,
          errors: [],
          inclusive: false
        });
      }
      return final;
    }
    var $ZodXor = /* @__PURE__ */ $constructor("$ZodXor", (inst, def) => {
      $ZodUnion.init(inst, def);
      def.inclusive = false;
      const first = def.options.length === 1 ? def.options[0]._zod.run : null;
      inst._zod.parse = (payload, ctx) => {
        if (first) {
          return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
          const result = option._zod.run({
            value: payload.value,
            issues: []
          }, ctx);
          if (result instanceof Promise) {
            results.push(result);
            async = true;
          } else {
            results.push(result);
          }
        }
        if (!async)
          return handleExclusiveUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results2) => {
          return handleExclusiveUnionResults(results2, payload, inst, ctx);
        });
      };
    });
    var $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
      def.inclusive = false;
      $ZodUnion.init(inst, def);
      const _super = inst._zod.parse;
      defineLazy(inst._zod, "propValues", () => {
        const propValues = {};
        for (const option of def.options) {
          const pv = option._zod.propValues;
          if (!pv || Object.keys(pv).length === 0)
            throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
          for (const [k, v] of Object.entries(pv)) {
            if (!propValues[k])
              propValues[k] = /* @__PURE__ */ new Set();
            for (const val of v) {
              propValues[k].add(val);
            }
          }
        }
        return propValues;
      });
      const disc = cached(() => {
        const opts = def.options;
        const map2 = /* @__PURE__ */ new Map();
        for (const o of opts) {
          const values = o._zod.propValues?.[def.discriminator];
          if (!values || values.size === 0)
            throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
          for (const v of values) {
            if (map2.has(v)) {
              throw new Error(`Duplicate discriminator value "${String(v)}"`);
            }
            map2.set(v, o);
          }
        }
        return map2;
      });
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isObject(input)) {
          payload.issues.push({
            code: "invalid_type",
            expected: "object",
            input,
            inst
          });
          return payload;
        }
        const opt = disc.value.get(input?.[def.discriminator]);
        if (opt) {
          return opt._zod.run(payload, ctx);
        }
        if (def.unionFallback || ctx.direction === "backward") {
          return _super(payload, ctx);
        }
        payload.issues.push({
          code: "invalid_union",
          errors: [],
          note: "No matching discriminator",
          discriminator: def.discriminator,
          options: Array.from(disc.value.keys()),
          input,
          path: [def.discriminator],
          inst
        });
        return payload;
      };
    });
    var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        const left = def.left._zod.run({ value: input, issues: [] }, ctx);
        const right = def.right._zod.run({ value: input, issues: [] }, ctx);
        const async = left instanceof Promise || right instanceof Promise;
        if (async) {
          return Promise.all([left, right]).then(([left2, right2]) => {
            return handleIntersectionResults(payload, left2, right2);
          });
        }
        return handleIntersectionResults(payload, left, right);
      };
    });
    function mergeValues(a, b) {
      if (a === b) {
        return { valid: true, data: a };
      }
      if (a instanceof Date && b instanceof Date && +a === +b) {
        return { valid: true, data: a };
      }
      if (isPlainObject(a) && isPlainObject(b)) {
        const bKeys = Object.keys(b);
        const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
          const sharedValue = mergeValues(a[key], b[key]);
          if (!sharedValue.valid) {
            return {
              valid: false,
              mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
            };
          }
          newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
      }
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
          return { valid: false, mergeErrorPath: [] };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
          const itemA = a[index];
          const itemB = b[index];
          const sharedValue = mergeValues(itemA, itemB);
          if (!sharedValue.valid) {
            return {
              valid: false,
              mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
            };
          }
          newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
      }
      return { valid: false, mergeErrorPath: [] };
    }
    function handleIntersectionResults(result, left, right) {
      const unrecKeys = /* @__PURE__ */ new Map();
      let unrecIssue;
      for (const iss of left.issues) {
        if (iss.code === "unrecognized_keys") {
          unrecIssue ?? (unrecIssue = iss);
          for (const k of iss.keys) {
            if (!unrecKeys.has(k))
              unrecKeys.set(k, {});
            unrecKeys.get(k).l = true;
          }
        } else {
          result.issues.push(iss);
        }
      }
      for (const iss of right.issues) {
        if (iss.code === "unrecognized_keys") {
          for (const k of iss.keys) {
            if (!unrecKeys.has(k))
              unrecKeys.set(k, {});
            unrecKeys.get(k).r = true;
          }
        } else {
          result.issues.push(iss);
        }
      }
      const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
      if (bothKeys.length && unrecIssue) {
        result.issues.push({ ...unrecIssue, keys: bothKeys });
      }
      if (aborted(result))
        return result;
      const merged = mergeValues(left.value, right.value);
      if (!merged.valid) {
        throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
      }
      result.value = merged.data;
      return result;
    }
    var $ZodTuple = /* @__PURE__ */ $constructor("$ZodTuple", (inst, def) => {
      $ZodType.init(inst, def);
      const items = def.items;
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
          payload.issues.push({
            input,
            inst,
            expected: "tuple",
            code: "invalid_type"
          });
          return payload;
        }
        payload.value = [];
        const proms = [];
        const optinStart = getTupleOptStart(items, "optin");
        const optoutStart = getTupleOptStart(items, "optout");
        if (!def.rest) {
          if (input.length < optinStart) {
            payload.issues.push({
              code: "too_small",
              minimum: optinStart,
              inclusive: true,
              input,
              inst,
              origin: "array"
            });
            return payload;
          }
          if (input.length > items.length) {
            payload.issues.push({
              code: "too_big",
              maximum: items.length,
              inclusive: true,
              input,
              inst,
              origin: "array"
            });
          }
        }
        const itemResults = new Array(items.length);
        for (let i = 0; i < items.length; i++) {
          const r = items[i]._zod.run({ value: input[i], issues: [] }, ctx);
          if (r instanceof Promise) {
            proms.push(r.then((rr) => {
              itemResults[i] = rr;
            }));
          } else {
            itemResults[i] = r;
          }
        }
        if (def.rest) {
          let i = items.length - 1;
          const rest = input.slice(items.length);
          for (const el of rest) {
            i++;
            const result = def.rest._zod.run({ value: el, issues: [] }, ctx);
            if (result instanceof Promise) {
              proms.push(result.then((r) => handleTupleResult(r, payload, i)));
            } else {
              handleTupleResult(result, payload, i);
            }
          }
        }
        if (proms.length) {
          return Promise.all(proms).then(() => handleTupleResults(itemResults, payload, items, input, optoutStart));
        }
        return handleTupleResults(itemResults, payload, items, input, optoutStart);
      };
    });
    function getTupleOptStart(items, key) {
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i]._zod[key] !== "optional")
          return i + 1;
      }
      return 0;
    }
    function handleTupleResult(result, final, index) {
      if (result.issues.length) {
        final.issues.push(...prefixIssues(index, result.issues));
      }
      final.value[index] = result.value;
    }
    function handleTupleResults(itemResults, final, items, input, optoutStart) {
      for (let i = 0; i < items.length; i++) {
        const r = itemResults[i];
        const isPresent = i < input.length;
        if (r.issues.length) {
          if (!isPresent && i >= optoutStart) {
            final.value.length = i;
            break;
          }
          final.issues.push(...prefixIssues(i, r.issues));
        }
        final.value[i] = r.value;
      }
      for (let i = final.value.length - 1; i >= input.length; i--) {
        if (items[i]._zod.optout === "optional" && final.value[i] === void 0) {
          final.value.length = i;
        } else {
          break;
        }
      }
      return final;
    }
    var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isPlainObject(input)) {
          payload.issues.push({
            expected: "record",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        const proms = [];
        const values = def.keyType._zod.values;
        if (values) {
          payload.value = {};
          const recordKeys = /* @__PURE__ */ new Set();
          for (const key of values) {
            if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
              recordKeys.add(typeof key === "number" ? key.toString() : key);
              const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
              if (keyResult instanceof Promise) {
                throw new Error("Async schemas not supported in object keys currently");
              }
              if (keyResult.issues.length) {
                payload.issues.push({
                  code: "invalid_key",
                  origin: "record",
                  issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                  input: key,
                  path: [key],
                  inst
                });
                continue;
              }
              const outKey = keyResult.value;
              const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
              if (result instanceof Promise) {
                proms.push(result.then((result2) => {
                  if (result2.issues.length) {
                    payload.issues.push(...prefixIssues(key, result2.issues));
                  }
                  payload.value[outKey] = result2.value;
                }));
              } else {
                if (result.issues.length) {
                  payload.issues.push(...prefixIssues(key, result.issues));
                }
                payload.value[outKey] = result.value;
              }
            }
          }
          let unrecognized;
          for (const key in input) {
            if (!recordKeys.has(key)) {
              unrecognized = unrecognized ?? [];
              unrecognized.push(key);
            }
          }
          if (unrecognized && unrecognized.length > 0) {
            payload.issues.push({
              code: "unrecognized_keys",
              input,
              inst,
              keys: unrecognized
            });
          }
        } else {
          payload.value = {};
          for (const key of Reflect.ownKeys(input)) {
            if (key === "__proto__")
              continue;
            if (!Object.prototype.propertyIsEnumerable.call(input, key))
              continue;
            let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
            if (keyResult instanceof Promise) {
              throw new Error("Async schemas not supported in object keys currently");
            }
            const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
            if (checkNumericKey) {
              const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
              if (retryResult instanceof Promise) {
                throw new Error("Async schemas not supported in object keys currently");
              }
              if (retryResult.issues.length === 0) {
                keyResult = retryResult;
              }
            }
            if (keyResult.issues.length) {
              if (def.mode === "loose") {
                payload.value[key] = input[key];
              } else {
                payload.issues.push({
                  code: "invalid_key",
                  origin: "record",
                  issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                  input: key,
                  path: [key],
                  inst
                });
              }
              continue;
            }
            const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
            if (result instanceof Promise) {
              proms.push(result.then((result2) => {
                if (result2.issues.length) {
                  payload.issues.push(...prefixIssues(key, result2.issues));
                }
                payload.value[keyResult.value] = result2.value;
              }));
            } else {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[keyResult.value] = result.value;
            }
          }
        }
        if (proms.length) {
          return Promise.all(proms).then(() => payload);
        }
        return payload;
      };
    });
    var $ZodMap = /* @__PURE__ */ $constructor("$ZodMap", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Map)) {
          payload.issues.push({
            expected: "map",
            code: "invalid_type",
            input,
            inst
          });
          return payload;
        }
        const proms = [];
        payload.value = /* @__PURE__ */ new Map();
        for (const [key, value] of input) {
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          const valueResult = def.valueType._zod.run({ value, issues: [] }, ctx);
          if (keyResult instanceof Promise || valueResult instanceof Promise) {
            proms.push(Promise.all([keyResult, valueResult]).then(([keyResult2, valueResult2]) => {
              handleMapResult(keyResult2, valueResult2, payload, key, input, inst, ctx);
            }));
          } else {
            handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
          }
        }
        if (proms.length)
          return Promise.all(proms).then(() => payload);
        return payload;
      };
    });
    function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
      if (keyResult.issues.length) {
        if (propertyKeyTypes.has(typeof key)) {
          final.issues.push(...prefixIssues(key, keyResult.issues));
        } else {
          final.issues.push({
            code: "invalid_key",
            origin: "map",
            input,
            inst,
            issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
          });
        }
      }
      if (valueResult.issues.length) {
        if (propertyKeyTypes.has(typeof key)) {
          final.issues.push(...prefixIssues(key, valueResult.issues));
        } else {
          final.issues.push({
            origin: "map",
            code: "invalid_element",
            input,
            inst,
            key,
            issues: valueResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
          });
        }
      }
      final.value.set(keyResult.value, valueResult.value);
    }
    var $ZodSet = /* @__PURE__ */ $constructor("$ZodSet", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Set)) {
          payload.issues.push({
            input,
            inst,
            expected: "set",
            code: "invalid_type"
          });
          return payload;
        }
        const proms = [];
        payload.value = /* @__PURE__ */ new Set();
        for (const item of input) {
          const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => handleSetResult(result2, payload)));
          } else
            handleSetResult(result, payload);
        }
        if (proms.length)
          return Promise.all(proms).then(() => payload);
        return payload;
      };
    });
    function handleSetResult(result, final) {
      if (result.issues.length) {
        final.issues.push(...result.issues);
      }
      final.value.add(result.value);
    }
    var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
      $ZodType.init(inst, def);
      const values = getEnumValues(def.entries);
      const valuesSet = new Set(values);
      inst._zod.values = valuesSet;
      inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (valuesSet.has(input)) {
          return payload;
        }
        payload.issues.push({
          code: "invalid_value",
          values,
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
      $ZodType.init(inst, def);
      if (def.values.length === 0) {
        throw new Error("Cannot create literal schema with no valid values");
      }
      const values = new Set(def.values);
      inst._zod.values = values;
      inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (values.has(input)) {
          return payload;
        }
        payload.issues.push({
          code: "invalid_value",
          values: def.values,
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodFile = /* @__PURE__ */ $constructor("$ZodFile", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (input instanceof File)
          return payload;
        payload.issues.push({
          expected: "file",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      };
    });
    var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          throw new $ZodEncodeError(inst.constructor.name);
        }
        const _out = def.transform(payload.value, payload);
        if (ctx.async) {
          const output = _out instanceof Promise ? _out : Promise.resolve(_out);
          return output.then((output2) => {
            payload.value = output2;
            payload.fallback = true;
            return payload;
          });
        }
        if (_out instanceof Promise) {
          throw new $ZodAsyncError();
        }
        payload.value = _out;
        payload.fallback = true;
        return payload;
      };
    });
    function handleOptionalResult(result, input) {
      if (input === void 0 && (result.issues.length || result.fallback)) {
        return { issues: [], value: void 0 };
      }
      return result;
    }
    var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      inst._zod.optout = "optional";
      defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
      });
      defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        if (def.innerType._zod.optin === "optional") {
          const input = payload.value;
          const result = def.innerType._zod.run(payload, ctx);
          if (result instanceof Promise)
            return result.then((r) => handleOptionalResult(r, input));
          return handleOptionalResult(result, input);
        }
        if (payload.value === void 0) {
          return payload;
        }
        return def.innerType._zod.run(payload, ctx);
      };
    });
    var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
      $ZodOptional.init(inst, def);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
      inst._zod.parse = (payload, ctx) => {
        return def.innerType._zod.run(payload, ctx);
      };
    });
    var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
      defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
      defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
      });
      defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        if (payload.value === null)
          return payload;
        return def.innerType._zod.run(payload, ctx);
      };
    });
    var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        if (payload.value === void 0) {
          payload.value = def.defaultValue;
          return payload;
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => handleDefaultResult(result2, def));
        }
        return handleDefaultResult(result, def);
      };
    });
    function handleDefaultResult(payload, def) {
      if (payload.value === void 0) {
        payload.value = def.defaultValue;
      }
      return payload;
    }
    var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        if (payload.value === void 0) {
          payload.value = def.defaultValue;
        }
        return def.innerType._zod.run(payload, ctx);
      };
    });
    var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => {
        const v = def.innerType._zod.values;
        return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
      });
      inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => handleNonOptionalResult(result2, inst));
        }
        return handleNonOptionalResult(result, inst);
      };
    });
    function handleNonOptionalResult(payload, inst) {
      if (!payload.issues.length && payload.value === void 0) {
        payload.issues.push({
          code: "invalid_type",
          expected: "nonoptional",
          input: payload.value,
          inst
        });
      }
      return payload;
    }
    var $ZodSuccess = /* @__PURE__ */ $constructor("$ZodSuccess", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          throw new $ZodEncodeError("ZodSuccess");
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => {
            payload.value = result2.issues.length === 0;
            return payload;
          });
        }
        payload.value = result.issues.length === 0;
        return payload;
      };
    });
    var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.optin = "optional";
      defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then((result2) => {
            payload.value = result2.value;
            if (result2.issues.length) {
              payload.value = def.catchValue({
                ...payload,
                error: {
                  issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
                },
                input: payload.value
              });
              payload.issues = [];
              payload.fallback = true;
            }
            return payload;
          });
        }
        payload.value = result.value;
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
          payload.fallback = true;
        }
        return payload;
      };
    });
    var $ZodNaN = /* @__PURE__ */ $constructor("$ZodNaN", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
          payload.issues.push({
            input: payload.value,
            inst,
            expected: "nan",
            code: "invalid_type"
          });
          return payload;
        }
        return payload;
      };
    });
    var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => def.in._zod.values);
      defineLazy(inst._zod, "optin", () => def.in._zod.optin);
      defineLazy(inst._zod, "optout", () => def.out._zod.optout);
      defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          const right = def.out._zod.run(payload, ctx);
          if (right instanceof Promise) {
            return right.then((right2) => handlePipeResult(right2, def.in, ctx));
          }
          return handlePipeResult(right, def.in, ctx);
        }
        const left = def.in._zod.run(payload, ctx);
        if (left instanceof Promise) {
          return left.then((left2) => handlePipeResult(left2, def.out, ctx));
        }
        return handlePipeResult(left, def.out, ctx);
      };
    });
    function handlePipeResult(left, next, ctx) {
      if (left.issues.length) {
        left.aborted = true;
        return left;
      }
      return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
    }
    var $ZodCodec = /* @__PURE__ */ $constructor("$ZodCodec", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "values", () => def.in._zod.values);
      defineLazy(inst._zod, "optin", () => def.in._zod.optin);
      defineLazy(inst._zod, "optout", () => def.out._zod.optout);
      defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
      inst._zod.parse = (payload, ctx) => {
        const direction = ctx.direction || "forward";
        if (direction === "forward") {
          const left = def.in._zod.run(payload, ctx);
          if (left instanceof Promise) {
            return left.then((left2) => handleCodecAResult(left2, def, ctx));
          }
          return handleCodecAResult(left, def, ctx);
        } else {
          const right = def.out._zod.run(payload, ctx);
          if (right instanceof Promise) {
            return right.then((right2) => handleCodecAResult(right2, def, ctx));
          }
          return handleCodecAResult(right, def, ctx);
        }
      };
    });
    function handleCodecAResult(result, def, ctx) {
      if (result.issues.length) {
        result.aborted = true;
        return result;
      }
      const direction = ctx.direction || "forward";
      if (direction === "forward") {
        const transformed = def.transform(result.value, result);
        if (transformed instanceof Promise) {
          return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
        }
        return handleCodecTxResult(result, transformed, def.out, ctx);
      } else {
        const transformed = def.reverseTransform(result.value, result);
        if (transformed instanceof Promise) {
          return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
        }
        return handleCodecTxResult(result, transformed, def.in, ctx);
      }
    }
    function handleCodecTxResult(left, value, nextSchema, ctx) {
      if (left.issues.length) {
        left.aborted = true;
        return left;
      }
      return nextSchema._zod.run({ value, issues: left.issues }, ctx);
    }
    var $ZodPreprocess = /* @__PURE__ */ $constructor("$ZodPreprocess", (inst, def) => {
      $ZodPipe.init(inst, def);
    });
    var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
      defineLazy(inst._zod, "values", () => def.innerType._zod.values);
      defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
      defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
      inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
          return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
          return result.then(handleReadonlyResult);
        }
        return handleReadonlyResult(result);
      };
    });
    function handleReadonlyResult(payload) {
      payload.value = Object.freeze(payload.value);
      return payload;
    }
    var $ZodTemplateLiteral = /* @__PURE__ */ $constructor("$ZodTemplateLiteral", (inst, def) => {
      $ZodType.init(inst, def);
      const regexParts = [];
      for (const part of def.parts) {
        if (typeof part === "object" && part !== null) {
          if (!part._zod.pattern) {
            throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
          }
          const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;
          if (!source)
            throw new Error(`Invalid template literal part: ${part._zod.traits}`);
          const start = source.startsWith("^") ? 1 : 0;
          const end = source.endsWith("$") ? source.length - 1 : source.length;
          regexParts.push(source.slice(start, end));
        } else if (part === null || primitiveTypes.has(typeof part)) {
          regexParts.push(escapeRegex(`${part}`));
        } else {
          throw new Error(`Invalid template literal part: ${part}`);
        }
      }
      inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
      inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "string") {
          payload.issues.push({
            input: payload.value,
            inst,
            expected: "string",
            code: "invalid_type"
          });
          return payload;
        }
        inst._zod.pattern.lastIndex = 0;
        if (!inst._zod.pattern.test(payload.value)) {
          payload.issues.push({
            input: payload.value,
            inst,
            code: "invalid_format",
            format: def.format ?? "template_literal",
            pattern: inst._zod.pattern.source
          });
          return payload;
        }
        return payload;
      };
    });
    var $ZodFunction = /* @__PURE__ */ $constructor("$ZodFunction", (inst, def) => {
      $ZodType.init(inst, def);
      inst._def = def;
      inst._zod.def = def;
      inst.implement = (func) => {
        if (typeof func !== "function") {
          throw new Error("implement() must be called with a function");
        }
        return function(...args) {
          const parsedArgs = inst._def.input ? parse(inst._def.input, args) : args;
          const result = Reflect.apply(func, this, parsedArgs);
          if (inst._def.output) {
            return parse(inst._def.output, result);
          }
          return result;
        };
      };
      inst.implementAsync = (func) => {
        if (typeof func !== "function") {
          throw new Error("implementAsync() must be called with a function");
        }
        return async function(...args) {
          const parsedArgs = inst._def.input ? await parseAsync(inst._def.input, args) : args;
          const result = await Reflect.apply(func, this, parsedArgs);
          if (inst._def.output) {
            return await parseAsync(inst._def.output, result);
          }
          return result;
        };
      };
      inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "function") {
          payload.issues.push({
            code: "invalid_type",
            expected: "function",
            input: payload.value,
            inst
          });
          return payload;
        }
        const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
        if (hasPromiseOutput) {
          payload.value = inst.implementAsync(payload.value);
        } else {
          payload.value = inst.implement(payload.value);
        }
        return payload;
      };
      inst.input = (...args) => {
        const F = inst.constructor;
        if (Array.isArray(args[0])) {
          return new F({
            type: "function",
            input: new $ZodTuple({
              type: "tuple",
              items: args[0],
              rest: args[1]
            }),
            output: inst._def.output
          });
        }
        return new F({
          type: "function",
          input: args[0],
          output: inst._def.output
        });
      };
      inst.output = (output) => {
        const F = inst.constructor;
        return new F({
          type: "function",
          input: inst._def.input,
          output
        });
      };
      return inst;
    });
    var $ZodPromise = /* @__PURE__ */ $constructor("$ZodPromise", (inst, def) => {
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, ctx) => {
        return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
      };
    });
    var $ZodLazy = /* @__PURE__ */ $constructor("$ZodLazy", (inst, def) => {
      $ZodType.init(inst, def);
      defineLazy(inst._zod, "innerType", () => {
        const d = def;
        if (!d._cachedInner)
          d._cachedInner = def.getter();
        return d._cachedInner;
      });
      defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
      defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
      defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
      defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
      inst._zod.parse = (payload, ctx) => {
        const inner = inst._zod.innerType;
        return inner._zod.run(payload, ctx);
      };
    });
    var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
      $ZodCheck.init(inst, def);
      $ZodType.init(inst, def);
      inst._zod.parse = (payload, _) => {
        return payload;
      };
      inst._zod.check = (payload) => {
        const input = payload.value;
        const r = def.fn(input);
        if (r instanceof Promise) {
          return r.then((r2) => handleRefineResult(r2, payload, input, inst));
        }
        handleRefineResult(r, payload, input, inst);
        return;
      };
    });
    function handleRefineResult(result, payload, input, inst) {
      if (!result) {
        const _iss = {
          code: "custom",
          input,
          inst,
          // incorporates params.error into issue reporting
          path: [...inst._zod.def.path ?? []],
          // incorporates params.error into issue reporting
          continue: !inst._zod.def.abort
          // params: inst._zod.def.params,
        };
        if (inst._zod.def.params)
          _iss.params = inst._zod.def.params;
        payload.issues.push(issue(_iss));
      }
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/index.js
    var locales_exports = {};
    __export(locales_exports, {
      ar: () => ar_default,
      az: () => az_default,
      be: () => be_default,
      bg: () => bg_default,
      ca: () => ca_default,
      cs: () => cs_default,
      da: () => da_default,
      de: () => de_default,
      el: () => el_default,
      en: () => en_default,
      eo: () => eo_default,
      es: () => es_default,
      fa: () => fa_default,
      fi: () => fi_default,
      fr: () => fr_default,
      frCA: () => fr_CA_default,
      he: () => he_default,
      hr: () => hr_default,
      hu: () => hu_default,
      hy: () => hy_default,
      id: () => id_default,
      is: () => is_default,
      it: () => it_default,
      ja: () => ja_default,
      ka: () => ka_default,
      kh: () => kh_default,
      km: () => km_default,
      ko: () => ko_default,
      lt: () => lt_default,
      mk: () => mk_default,
      ms: () => ms_default,
      nl: () => nl_default,
      no: () => no_default,
      ota: () => ota_default,
      pl: () => pl_default,
      ps: () => ps_default,
      pt: () => pt_default,
      ro: () => ro_default,
      ru: () => ru_default,
      sl: () => sl_default,
      sv: () => sv_default,
      ta: () => ta_default,
      th: () => th_default,
      tr: () => tr_default,
      ua: () => ua_default,
      uk: () => uk_default,
      ur: () => ur_default,
      uz: () => uz_default,
      vi: () => vi_default,
      yo: () => yo_default,
      zhCN: () => zh_CN_default,
      zhTW: () => zh_TW_default
    });

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ar.js
    var error = () => {
      const Sizable = {
        string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
        file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
        array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
        set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0645\u062F\u062E\u0644",
        email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
        url: "\u0631\u0627\u0628\u0637",
        emoji: "\u0625\u064A\u0645\u0648\u062C\u064A",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
        date: "\u062A\u0627\u0631\u064A\u062E \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
        time: "\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
        duration: "\u0645\u062F\u0629 \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
        ipv4: "\u0639\u0646\u0648\u0627\u0646 IPv4",
        ipv6: "\u0639\u0646\u0648\u0627\u0646 IPv6",
        cidrv4: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv4",
        cidrv6: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv6",
        base64: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64-encoded",
        base64url: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64url-encoded",
        json_string: "\u0646\u064E\u0635 \u0639\u0644\u0649 \u0647\u064A\u0626\u0629 JSON",
        e164: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0628\u0645\u0639\u064A\u0627\u0631 E.164",
        jwt: "JWT",
        template_literal: "\u0645\u062F\u062E\u0644"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 instanceof ${issue2.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${received}`;
            }
            return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(issue2.values[0])}`;
            return `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"}`;
            return `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${issue2.prefix}"`;
            if (_issue.format === "ends_with")
              return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${_issue.pattern}`;
            return `${FormatDictionary[_issue.format] ?? issue2.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
          }
          case "not_multiple_of":
            return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u0645\u0639\u0631\u0641${issue2.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${issue2.keys.length > 1 ? "\u0629" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
          case "invalid_key":
            return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
          case "invalid_union":
            return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
          case "invalid_element":
            return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
          default:
            return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
        }
      };
    };
    function ar_default() {
      return {
        localeError: error()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/az.js
    var error2 = () => {
      const Sizable = {
        string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
        file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
        array: { unit: "element", verb: "olmal\u0131d\u0131r" },
        set: { unit: "element", verb: "olmal\u0131d\u0131r" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "email address",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datetime",
        date: "ISO date",
        time: "ISO time",
        duration: "ISO duration",
        ipv4: "IPv4 address",
        ipv6: "IPv6 address",
        cidrv4: "IPv4 range",
        cidrv6: "IPv6 range",
        base64: "base64-encoded string",
        base64url: "base64url-encoded string",
        json_string: "JSON string",
        e164: "E.164 number",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n instanceof ${issue2.expected}, daxil olan ${received}`;
            }
            return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${expected}, daxil olan ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(issue2.values[0])}`;
            return `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
            return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Yanl\u0131\u015F m\u0259tn: "${_issue.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`;
            if (_issue.format === "ends_with")
              return `Yanl\u0131\u015F m\u0259tn: "${_issue.suffix}" il\u0259 bitm\u0259lidir`;
            if (_issue.format === "includes")
              return `Yanl\u0131\u015F m\u0259tn: "${_issue.includes}" daxil olmal\u0131d\u0131r`;
            if (_issue.format === "regex")
              return `Yanl\u0131\u015F m\u0259tn: ${_issue.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`;
            return `Yanl\u0131\u015F ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Yanl\u0131\u015F \u0259d\u0259d: ${issue2.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`;
          case "unrecognized_keys":
            return `Tan\u0131nmayan a\xE7ar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`;
          case "invalid_union":
            return "Yanl\u0131\u015F d\u0259y\u0259r";
          case "invalid_element":
            return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`;
          default:
            return `Yanl\u0131\u015F d\u0259y\u0259r`;
        }
      };
    };
    function az_default() {
      return {
        localeError: error2()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/be.js
    function getBelarusianPlural(count, one, few, many) {
      const absCount = Math.abs(count);
      const lastDigit = absCount % 10;
      const lastTwoDigits = absCount % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return many;
      }
      if (lastDigit === 1) {
        return one;
      }
      if (lastDigit >= 2 && lastDigit <= 4) {
        return few;
      }
      return many;
    }
    var error3 = () => {
      const Sizable = {
        string: {
          unit: {
            one: "\u0441\u0456\u043C\u0432\u0430\u043B",
            few: "\u0441\u0456\u043C\u0432\u0430\u043B\u044B",
            many: "\u0441\u0456\u043C\u0432\u0430\u043B\u0430\u045E"
          },
          verb: "\u043C\u0435\u0446\u044C"
        },
        array: {
          unit: {
            one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
            few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
            many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
          },
          verb: "\u043C\u0435\u0446\u044C"
        },
        set: {
          unit: {
            one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
            few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
            many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
          },
          verb: "\u043C\u0435\u0446\u044C"
        },
        file: {
          unit: {
            one: "\u0431\u0430\u0439\u0442",
            few: "\u0431\u0430\u0439\u0442\u044B",
            many: "\u0431\u0430\u0439\u0442\u0430\u045E"
          },
          verb: "\u043C\u0435\u0446\u044C"
        }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0443\u0432\u043E\u0434",
        email: "email \u0430\u0434\u0440\u0430\u0441",
        url: "URL",
        emoji: "\u044D\u043C\u043E\u0434\u0437\u0456",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u0434\u0430\u0442\u0430 \u0456 \u0447\u0430\u0441",
        date: "ISO \u0434\u0430\u0442\u0430",
        time: "ISO \u0447\u0430\u0441",
        duration: "ISO \u043F\u0440\u0430\u0446\u044F\u0433\u043B\u0430\u0441\u0446\u044C",
        ipv4: "IPv4 \u0430\u0434\u0440\u0430\u0441",
        ipv6: "IPv6 \u0430\u0434\u0440\u0430\u0441",
        cidrv4: "IPv4 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
        cidrv6: "IPv6 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
        base64: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64",
        base64url: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64url",
        json_string: "JSON \u0440\u0430\u0434\u043E\u043A",
        e164: "\u043D\u0443\u043C\u0430\u0440 E.164",
        jwt: "JWT",
        template_literal: "\u0443\u0432\u043E\u0434"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u043B\u0456\u043A",
        array: "\u043C\u0430\u0441\u0456\u045E"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F instanceof ${issue2.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${received}`;
            }
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              const maxValue = Number(issue2.maximum);
              const unit = getBelarusianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
              return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.maximum.toString()} ${unit}`;
            }
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              const minValue = Number(issue2.minimum);
              const unit = getBelarusianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
              return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.minimum.toString()} ${unit}`;
            }
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${issue2.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
          case "invalid_union":
            return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
          case "invalid_element":
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${issue2.origin}`;
          default:
            return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434`;
        }
      };
    };
    function be_default() {
      return {
        localeError: error3()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/bg.js
    var error4 = () => {
      const Sizable = {
        string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
        file: { unit: "\u0431\u0430\u0439\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
        array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
        set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0432\u0445\u043E\u0434",
        email: "\u0438\u043C\u0435\u0439\u043B \u0430\u0434\u0440\u0435\u0441",
        url: "URL",
        emoji: "\u0435\u043C\u043E\u0434\u0436\u0438",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u0432\u0440\u0435\u043C\u0435",
        date: "ISO \u0434\u0430\u0442\u0430",
        time: "ISO \u0432\u0440\u0435\u043C\u0435",
        duration: "ISO \u043F\u0440\u043E\u0434\u044A\u043B\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442",
        ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
        ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
        cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
        cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
        base64: "base64-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
        base64url: "base64url-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
        json_string: "JSON \u043D\u0438\u0437",
        e164: "E.164 \u043D\u043E\u043C\u0435\u0440",
        jwt: "JWT",
        template_literal: "\u0432\u0445\u043E\u0434"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0447\u0438\u0441\u043B\u043E",
        array: "\u043C\u0430\u0441\u0438\u0432"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D instanceof ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${received}`;
            }
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(issue2.values[0])}`;
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`;
            return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${_issue.pattern}`;
            let invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
            if (_issue.format === "emoji")
              invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
            if (_issue.format === "datetime")
              invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
            if (_issue.format === "date")
              invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
            if (_issue.format === "time")
              invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
            if (_issue.format === "duration")
              invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
            return `${invalid_adj} ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0431\u044A\u0434\u0435 \u043A\u0440\u0430\u0442\u043D\u043E \u043D\u0430 ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u041D\u0435\u0440\u0430\u0437\u043F\u043E\u0437\u043D\u0430\u0442${issue2.keys.length > 1 ? "\u0438" : ""} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u043E\u0432\u0435" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
          case "invalid_union":
            return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
          case "invalid_element":
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0432 ${issue2.origin}`;
          default:
            return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434`;
        }
      };
    };
    function bg_default() {
      return {
        localeError: error4()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ca.js
    var error5 = () => {
      const Sizable = {
        string: { unit: "car\xE0cters", verb: "contenir" },
        file: { unit: "bytes", verb: "contenir" },
        array: { unit: "elements", verb: "contenir" },
        set: { unit: "elements", verb: "contenir" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "entrada",
        email: "adre\xE7a electr\xF2nica",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "data i hora ISO",
        date: "data ISO",
        time: "hora ISO",
        duration: "durada ISO",
        ipv4: "adre\xE7a IPv4",
        ipv6: "adre\xE7a IPv6",
        cidrv4: "rang IPv4",
        cidrv6: "rang IPv6",
        base64: "cadena codificada en base64",
        base64url: "cadena codificada en base64url",
        json_string: "cadena JSON",
        e164: "n\xFAmero E.164",
        jwt: "JWT",
        template_literal: "entrada"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Tipus inv\xE0lid: s'esperava instanceof ${issue2.expected}, s'ha rebut ${received}`;
            }
            return `Tipus inv\xE0lid: s'esperava ${expected}, s'ha rebut ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(issue2.values[0])}`;
            return `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(issue2.values, " o ")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "com a m\xE0xim" : "menys de";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} contingu\xE9s ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
            return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} fos ${adj} ${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? "com a m\xEDnim" : "m\xE9s de";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Massa petit: s'esperava que ${issue2.origin} contingu\xE9s ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Massa petit: s'esperava que ${issue2.origin} fos ${adj} ${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Format inv\xE0lid: ha de comen\xE7ar amb "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Format inv\xE0lid: ha d'acabar amb "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Format inv\xE0lid: ha d'incloure "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${_issue.pattern}`;
            return `Format inv\xE0lid per a ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Clau${issue2.keys.length > 1 ? "s" : ""} no reconeguda${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Clau inv\xE0lida a ${issue2.origin}`;
          case "invalid_union":
            return "Entrada inv\xE0lida";
          // Could also be "Tipus d'unió invàlid" but "Entrada invàlida" is more general
          case "invalid_element":
            return `Element inv\xE0lid a ${issue2.origin}`;
          default:
            return `Entrada inv\xE0lida`;
        }
      };
    };
    function ca_default() {
      return {
        localeError: error5()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/cs.js
    var error6 = () => {
      const Sizable = {
        string: { unit: "znak\u016F", verb: "m\xEDt" },
        file: { unit: "bajt\u016F", verb: "m\xEDt" },
        array: { unit: "prvk\u016F", verb: "m\xEDt" },
        set: { unit: "prvk\u016F", verb: "m\xEDt" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "regul\xE1rn\xED v\xFDraz",
        email: "e-mailov\xE1 adresa",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "datum a \u010Das ve form\xE1tu ISO",
        date: "datum ve form\xE1tu ISO",
        time: "\u010Das ve form\xE1tu ISO",
        duration: "doba trv\xE1n\xED ISO",
        ipv4: "IPv4 adresa",
        ipv6: "IPv6 adresa",
        cidrv4: "rozsah IPv4",
        cidrv6: "rozsah IPv6",
        base64: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64",
        base64url: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64url",
        json_string: "\u0159et\u011Bzec ve form\xE1tu JSON",
        e164: "\u010D\xEDslo E.164",
        jwt: "JWT",
        template_literal: "vstup"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u010D\xEDslo",
        string: "\u0159et\u011Bzec",
        function: "funkce",
        array: "pole"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no instanceof ${issue2.expected}, obdr\u017Eeno ${received}`;
            }
            return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${expected}, obdr\u017Eeno ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(issue2.values[0])}`;
            return `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
            }
            return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
            }
            return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${_issue.pattern}`;
            return `Neplatn\xFD form\xE1t ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Nezn\xE1m\xE9 kl\xED\u010De: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Neplatn\xFD kl\xED\u010D v ${issue2.origin}`;
          case "invalid_union":
            return "Neplatn\xFD vstup";
          case "invalid_element":
            return `Neplatn\xE1 hodnota v ${issue2.origin}`;
          default:
            return `Neplatn\xFD vstup`;
        }
      };
    };
    function cs_default() {
      return {
        localeError: error6()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/da.js
    var error7 = () => {
      const Sizable = {
        string: { unit: "tegn", verb: "havde" },
        file: { unit: "bytes", verb: "havde" },
        array: { unit: "elementer", verb: "indeholdt" },
        set: { unit: "elementer", verb: "indeholdt" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "e-mailadresse",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO dato- og klokkesl\xE6t",
        date: "ISO-dato",
        time: "ISO-klokkesl\xE6t",
        duration: "ISO-varighed",
        ipv4: "IPv4-omr\xE5de",
        ipv6: "IPv6-omr\xE5de",
        cidrv4: "IPv4-spektrum",
        cidrv6: "IPv6-spektrum",
        base64: "base64-kodet streng",
        base64url: "base64url-kodet streng",
        json_string: "JSON-streng",
        e164: "E.164-nummer",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        nan: "NaN",
        string: "streng",
        number: "tal",
        boolean: "boolean",
        array: "liste",
        object: "objekt",
        set: "s\xE6t",
        file: "fil"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Ugyldigt input: forventede instanceof ${issue2.expected}, fik ${received}`;
            }
            return `Ugyldigt input: forventede ${expected}, fik ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(issue2.values[0])}`;
            return `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            if (sizing)
              return `For stor: forventede ${origin ?? "value"} ${sizing.verb} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
            return `For stor: forventede ${origin ?? "value"} havde ${adj} ${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            if (sizing) {
              return `For lille: forventede ${origin} ${sizing.verb} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `For lille: forventede ${origin} havde ${adj} ${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Ugyldig streng: skal starte med "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Ugyldig streng: skal ende med "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Ugyldig streng: skal indeholde "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Ugyldig streng: skal matche m\xF8nsteret ${_issue.pattern}`;
            return `Ugyldig ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Ugyldigt tal: skal v\xE6re deleligt med ${issue2.divisor}`;
          case "unrecognized_keys":
            return `${issue2.keys.length > 1 ? "Ukendte n\xF8gler" : "Ukendt n\xF8gle"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Ugyldig n\xF8gle i ${issue2.origin}`;
          case "invalid_union":
            return "Ugyldigt input: matcher ingen af de tilladte typer";
          case "invalid_element":
            return `Ugyldig v\xE6rdi i ${issue2.origin}`;
          default:
            return `Ugyldigt input`;
        }
      };
    };
    function da_default() {
      return {
        localeError: error7()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/de.js
    var error8 = () => {
      const Sizable = {
        string: { unit: "Zeichen", verb: "zu haben" },
        file: { unit: "Bytes", verb: "zu haben" },
        array: { unit: "Elemente", verb: "zu haben" },
        set: { unit: "Elemente", verb: "zu haben" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "Eingabe",
        email: "E-Mail-Adresse",
        url: "URL",
        emoji: "Emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO-Datum und -Uhrzeit",
        date: "ISO-Datum",
        time: "ISO-Uhrzeit",
        duration: "ISO-Dauer",
        ipv4: "IPv4-Adresse",
        ipv6: "IPv6-Adresse",
        cidrv4: "IPv4-Bereich",
        cidrv6: "IPv6-Bereich",
        base64: "Base64-codierter String",
        base64url: "Base64-URL-codierter String",
        json_string: "JSON-String",
        e164: "E.164-Nummer",
        jwt: "JWT",
        template_literal: "Eingabe"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "Zahl",
        array: "Array"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Ung\xFCltige Eingabe: erwartet instanceof ${issue2.expected}, erhalten ${received}`;
            }
            return `Ung\xFCltige Eingabe: erwartet ${expected}, erhalten ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(issue2.values[0])}`;
            return `Ung\xFCltige Option: erwartet eine von ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "Elemente"} hat`;
            return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ist`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} hat`;
            }
            return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ist`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Ung\xFCltiger String: muss mit "${_issue.prefix}" beginnen`;
            if (_issue.format === "ends_with")
              return `Ung\xFCltiger String: muss mit "${_issue.suffix}" enden`;
            if (_issue.format === "includes")
              return `Ung\xFCltiger String: muss "${_issue.includes}" enthalten`;
            if (_issue.format === "regex")
              return `Ung\xFCltiger String: muss dem Muster ${_issue.pattern} entsprechen`;
            return `Ung\xFCltig: ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Ung\xFCltige Zahl: muss ein Vielfaches von ${issue2.divisor} sein`;
          case "unrecognized_keys":
            return `${issue2.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Ung\xFCltiger Schl\xFCssel in ${issue2.origin}`;
          case "invalid_union":
            return "Ung\xFCltige Eingabe";
          case "invalid_element":
            return `Ung\xFCltiger Wert in ${issue2.origin}`;
          default:
            return `Ung\xFCltige Eingabe`;
        }
      };
    };
    function de_default() {
      return {
        localeError: error8()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/el.js
    var error9 = () => {
      const Sizable = {
        string: { unit: "\u03C7\u03B1\u03C1\u03B1\u03BA\u03C4\u03AE\u03C1\u03B5\u03C2", verb: "\u03BD\u03B1 \u03AD\u03C7\u03B5\u03B9" },
        file: { unit: "bytes", verb: "\u03BD\u03B1 \u03AD\u03C7\u03B5\u03B9" },
        array: { unit: "\u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1", verb: "\u03BD\u03B1 \u03AD\u03C7\u03B5\u03B9" },
        set: { unit: "\u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1", verb: "\u03BD\u03B1 \u03AD\u03C7\u03B5\u03B9" },
        map: { unit: "\u03BA\u03B1\u03C4\u03B1\u03C7\u03C9\u03C1\u03AE\u03C3\u03B5\u03B9\u03C2", verb: "\u03BD\u03B1 \u03AD\u03C7\u03B5\u03B9" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u03B5\u03AF\u03C3\u03BF\u03B4\u03BF\u03C2",
        email: "\u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 email",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u03B7\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B1 \u03BA\u03B1\u03B9 \u03CE\u03C1\u03B1",
        date: "ISO \u03B7\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B1",
        time: "ISO \u03CE\u03C1\u03B1",
        duration: "ISO \u03B4\u03B9\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1",
        ipv4: "\u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 IPv4",
        ipv6: "\u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 IPv6",
        mac: "\u03B4\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 MAC",
        cidrv4: "\u03B5\u03CD\u03C1\u03BF\u03C2 IPv4",
        cidrv6: "\u03B5\u03CD\u03C1\u03BF\u03C2 IPv6",
        base64: "\u03C3\u03C5\u03BC\u03B2\u03BF\u03BB\u03BF\u03C3\u03B5\u03B9\u03C1\u03AC \u03BA\u03C9\u03B4\u03B9\u03BA\u03BF\u03C0\u03BF\u03B9\u03B7\u03BC\u03AD\u03BD\u03B7 \u03C3\u03B5 base64",
        base64url: "\u03C3\u03C5\u03BC\u03B2\u03BF\u03BB\u03BF\u03C3\u03B5\u03B9\u03C1\u03AC \u03BA\u03C9\u03B4\u03B9\u03BA\u03BF\u03C0\u03BF\u03B9\u03B7\u03BC\u03AD\u03BD\u03B7 \u03C3\u03B5 base64url",
        json_string: "\u03C3\u03C5\u03BC\u03B2\u03BF\u03BB\u03BF\u03C3\u03B5\u03B9\u03C1\u03AC JSON",
        e164: "\u03B1\u03C1\u03B9\u03B8\u03BC\u03CC\u03C2 E.164",
        jwt: "JWT",
        template_literal: "\u03B5\u03AF\u03C3\u03BF\u03B4\u03BF\u03C2"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (typeof issue2.expected === "string" && /^[A-Z]/.test(issue2.expected)) {
              return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF\u03C2: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD instanceof ${issue2.expected}, \u03BB\u03AE\u03C6\u03B8\u03B7\u03BA\u03B5 ${received}`;
            }
            return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF\u03C2: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD ${expected}, \u03BB\u03AE\u03C6\u03B8\u03B7\u03BA\u03B5 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF\u03C2: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD ${stringifyPrimitive(issue2.values[0])}`;
            return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03B5\u03C0\u03B9\u03BB\u03BF\u03B3\u03AE: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD \u03AD\u03BD\u03B1 \u03B1\u03C0\u03CC ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u03A0\u03BF\u03BB\u03CD \u03BC\u03B5\u03B3\u03AC\u03BB\u03BF: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD ${issue2.origin ?? "\u03C4\u03B9\u03BC\u03AE"} \u03BD\u03B1 \u03AD\u03C7\u03B5\u03B9 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1"}`;
            return `\u03A0\u03BF\u03BB\u03CD \u03BC\u03B5\u03B3\u03AC\u03BB\u03BF: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD ${issue2.origin ?? "\u03C4\u03B9\u03BC\u03AE"} \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u03A0\u03BF\u03BB\u03CD \u03BC\u03B9\u03BA\u03C1\u03CC: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD ${issue2.origin} \u03BD\u03B1 \u03AD\u03C7\u03B5\u03B9 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u03A0\u03BF\u03BB\u03CD \u03BC\u03B9\u03BA\u03C1\u03CC: \u03B1\u03BD\u03B1\u03BC\u03B5\u03BD\u03CC\u03C4\u03B1\u03BD ${issue2.origin} \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03C3\u03C5\u03BC\u03B2\u03BF\u03BB\u03BF\u03C3\u03B5\u03B9\u03C1\u03AC: \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03BE\u03B5\u03BA\u03B9\u03BD\u03AC \u03BC\u03B5 "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03C3\u03C5\u03BC\u03B2\u03BF\u03BB\u03BF\u03C3\u03B5\u03B9\u03C1\u03AC: \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03C4\u03B5\u03BB\u03B5\u03B9\u03CE\u03BD\u03B5\u03B9 \u03BC\u03B5 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03C3\u03C5\u03BC\u03B2\u03BF\u03BB\u03BF\u03C3\u03B5\u03B9\u03C1\u03AC: \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03C0\u03B5\u03C1\u03B9\u03AD\u03C7\u03B5\u03B9 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03C3\u03C5\u03BC\u03B2\u03BF\u03BB\u03BF\u03C3\u03B5\u03B9\u03C1\u03AC: \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03C4\u03B1\u03B9\u03C1\u03B9\u03AC\u03B6\u03B5\u03B9 \u03BC\u03B5 \u03C4\u03BF \u03BC\u03BF\u03C4\u03AF\u03B2\u03BF ${_issue.pattern}`;
            return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF: ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF\u03C2 \u03B1\u03C1\u03B9\u03B8\u03BC\u03CC\u03C2: \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C0\u03BF\u03BB\u03BB\u03B1\u03C0\u03BB\u03AC\u03C3\u03B9\u03BF \u03C4\u03BF\u03C5 ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u0386\u03B3\u03BD\u03C9\u03C3\u03C4${issue2.keys.length > 1 ? "\u03B1" : "\u03BF"} \u03BA\u03BB\u03B5\u03B9\u03B4${issue2.keys.length > 1 ? "\u03B9\u03AC" : "\u03AF"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03BF \u03BA\u03BB\u03B5\u03B9\u03B4\u03AF \u03C3\u03C4\u03BF ${issue2.origin}`;
          case "invalid_union":
            return "\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF\u03C2";
          case "invalid_element":
            return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03C4\u03B9\u03BC\u03AE \u03C3\u03C4\u03BF ${issue2.origin}`;
          default:
            return `\u039C\u03B7 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B7 \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF\u03C2`;
        }
      };
    };
    function el_default() {
      return {
        localeError: error9()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/en.js
    var error10 = () => {
      const Sizable = {
        string: { unit: "characters", verb: "to have" },
        file: { unit: "bytes", verb: "to have" },
        array: { unit: "items", verb: "to have" },
        set: { unit: "items", verb: "to have" },
        map: { unit: "entries", verb: "to have" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "email address",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datetime",
        date: "ISO date",
        time: "ISO time",
        duration: "ISO duration",
        ipv4: "IPv4 address",
        ipv6: "IPv6 address",
        mac: "MAC address",
        cidrv4: "IPv4 range",
        cidrv6: "IPv6 range",
        base64: "base64-encoded string",
        base64url: "base64url-encoded string",
        json_string: "JSON string",
        e164: "E.164 number",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        // Compatibility: "nan" -> "NaN" for display
        nan: "NaN"
        // All other type names omitted - they fall back to raw values via ?? operator
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            return `Invalid input: expected ${expected}, received ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
            return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
            return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Invalid string: must start with "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Invalid string: must end with "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Invalid string: must include "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Invalid string: must match pattern ${_issue.pattern}`;
            return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Invalid number: must be a multiple of ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Invalid key in ${issue2.origin}`;
          case "invalid_union":
            if (issue2.options && Array.isArray(issue2.options) && issue2.options.length > 0) {
              const opts = issue2.options.map((o) => `'${o}'`).join(" | ");
              return `Invalid discriminator value. Expected ${opts}`;
            }
            return "Invalid input";
          case "invalid_element":
            return `Invalid value in ${issue2.origin}`;
          default:
            return `Invalid input`;
        }
      };
    };
    function en_default() {
      return {
        localeError: error10()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/eo.js
    var error11 = () => {
      const Sizable = {
        string: { unit: "karaktrojn", verb: "havi" },
        file: { unit: "bajtojn", verb: "havi" },
        array: { unit: "elementojn", verb: "havi" },
        set: { unit: "elementojn", verb: "havi" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "enigo",
        email: "retadreso",
        url: "URL",
        emoji: "emo\u011Dio",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO-datotempo",
        date: "ISO-dato",
        time: "ISO-tempo",
        duration: "ISO-da\u016Dro",
        ipv4: "IPv4-adreso",
        ipv6: "IPv6-adreso",
        cidrv4: "IPv4-rango",
        cidrv6: "IPv6-rango",
        base64: "64-ume kodita karaktraro",
        base64url: "URL-64-ume kodita karaktraro",
        json_string: "JSON-karaktraro",
        e164: "E.164-nombro",
        jwt: "JWT",
        template_literal: "enigo"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "nombro",
        array: "tabelo",
        null: "senvalora"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Nevalida enigo: atendi\u011Dis instanceof ${issue2.expected}, ricevi\u011Dis ${received}`;
            }
            return `Nevalida enigo: atendi\u011Dis ${expected}, ricevi\u011Dis ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(issue2.values[0])}`;
            return `Nevalida opcio: atendi\u011Dis unu el ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementojn"}`;
            return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} havu ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} estu ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Nevalida karaktraro: devas komenci\u011Di per "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Nevalida karaktraro: devas fini\u011Di per "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Nevalida karaktraro: devas inkluzivi "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Nevalida karaktraro: devas kongrui kun la modelo ${_issue.pattern}`;
            return `Nevalida ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Nevalida nombro: devas esti oblo de ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Nekonata${issue2.keys.length > 1 ? "j" : ""} \u015Dlosilo${issue2.keys.length > 1 ? "j" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Nevalida \u015Dlosilo en ${issue2.origin}`;
          case "invalid_union":
            return "Nevalida enigo";
          case "invalid_element":
            return `Nevalida valoro en ${issue2.origin}`;
          default:
            return `Nevalida enigo`;
        }
      };
    };
    function eo_default() {
      return {
        localeError: error11()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/es.js
    var error12 = () => {
      const Sizable = {
        string: { unit: "caracteres", verb: "tener" },
        file: { unit: "bytes", verb: "tener" },
        array: { unit: "elementos", verb: "tener" },
        set: { unit: "elementos", verb: "tener" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "entrada",
        email: "direcci\xF3n de correo electr\xF3nico",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "fecha y hora ISO",
        date: "fecha ISO",
        time: "hora ISO",
        duration: "duraci\xF3n ISO",
        ipv4: "direcci\xF3n IPv4",
        ipv6: "direcci\xF3n IPv6",
        cidrv4: "rango IPv4",
        cidrv6: "rango IPv6",
        base64: "cadena codificada en base64",
        base64url: "URL codificada en base64",
        json_string: "cadena JSON",
        e164: "n\xFAmero E.164",
        jwt: "JWT",
        template_literal: "entrada"
      };
      const TypeDictionary = {
        nan: "NaN",
        string: "texto",
        number: "n\xFAmero",
        boolean: "booleano",
        array: "arreglo",
        object: "objeto",
        set: "conjunto",
        file: "archivo",
        date: "fecha",
        bigint: "n\xFAmero grande",
        symbol: "s\xEDmbolo",
        undefined: "indefinido",
        null: "nulo",
        function: "funci\xF3n",
        map: "mapa",
        record: "registro",
        tuple: "tupla",
        enum: "enumeraci\xF3n",
        union: "uni\xF3n",
        literal: "literal",
        promise: "promesa",
        void: "vac\xEDo",
        never: "nunca",
        unknown: "desconocido",
        any: "cualquiera"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Entrada inv\xE1lida: se esperaba instanceof ${issue2.expected}, recibido ${received}`;
            }
            return `Entrada inv\xE1lida: se esperaba ${expected}, recibido ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(issue2.values[0])}`;
            return `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            if (sizing)
              return `Demasiado grande: se esperaba que ${origin ?? "valor"} tuviera ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
            return `Demasiado grande: se esperaba que ${origin ?? "valor"} fuera ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            if (sizing) {
              return `Demasiado peque\xF1o: se esperaba que ${origin} tuviera ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Demasiado peque\xF1o: se esperaba que ${origin} fuera ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Cadena inv\xE1lida: debe comenzar con "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Cadena inv\xE1lida: debe terminar en "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Cadena inv\xE1lida: debe incluir "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${_issue.pattern}`;
            return `Inv\xE1lido ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Llave${issue2.keys.length > 1 ? "s" : ""} desconocida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Llave inv\xE1lida en ${TypeDictionary[issue2.origin] ?? issue2.origin}`;
          case "invalid_union":
            return "Entrada inv\xE1lida";
          case "invalid_element":
            return `Valor inv\xE1lido en ${TypeDictionary[issue2.origin] ?? issue2.origin}`;
          default:
            return `Entrada inv\xE1lida`;
        }
      };
    };
    function es_default() {
      return {
        localeError: error12()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/fa.js
    var error13 = () => {
      const Sizable = {
        string: { unit: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
        file: { unit: "\u0628\u0627\u06CC\u062A", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
        array: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
        set: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0648\u0631\u0648\u062F\u06CC",
        email: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644",
        url: "URL",
        emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
        date: "\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u0632\u0648",
        time: "\u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
        duration: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
        ipv4: "IPv4 \u0622\u062F\u0631\u0633",
        ipv6: "IPv6 \u0622\u062F\u0631\u0633",
        cidrv4: "IPv4 \u062F\u0627\u0645\u0646\u0647",
        cidrv6: "IPv6 \u062F\u0627\u0645\u0646\u0647",
        base64: "base64-encoded \u0631\u0634\u062A\u0647",
        base64url: "base64url-encoded \u0631\u0634\u062A\u0647",
        json_string: "JSON \u0631\u0634\u062A\u0647",
        e164: "E.164 \u0639\u062F\u062F",
        jwt: "JWT",
        template_literal: "\u0648\u0631\u0648\u062F\u06CC"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0639\u062F\u062F",
        array: "\u0622\u0631\u0627\u06CC\u0647"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A instanceof ${issue2.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${received} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
            }
            return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${received} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
          }
          case "invalid_value":
            if (issue2.values.length === 1) {
              return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(issue2.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`;
            }
            return `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(issue2.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`;
            }
            return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0628\u0627\u0634\u062F`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0628\u0627\u0634\u062F`;
            }
            return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0628\u0627\u0634\u062F`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`;
            }
            if (_issue.format === "ends_with") {
              return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`;
            }
            if (_issue.format === "includes") {
              return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${_issue.includes}" \u0628\u0627\u0634\u062F`;
            }
            if (_issue.format === "regex") {
              return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${_issue.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`;
            }
            return `${FormatDictionary[_issue.format] ?? issue2.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
          }
          case "not_multiple_of":
            return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${issue2.divisor} \u0628\u0627\u0634\u062F`;
          case "unrecognized_keys":
            return `\u06A9\u0644\u06CC\u062F${issue2.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${issue2.origin}`;
          case "invalid_union":
            return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
          case "invalid_element":
            return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${issue2.origin}`;
          default:
            return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
        }
      };
    };
    function fa_default() {
      return {
        localeError: error13()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/fi.js
    var error14 = () => {
      const Sizable = {
        string: { unit: "merkki\xE4", subject: "merkkijonon" },
        file: { unit: "tavua", subject: "tiedoston" },
        array: { unit: "alkiota", subject: "listan" },
        set: { unit: "alkiota", subject: "joukon" },
        number: { unit: "", subject: "luvun" },
        bigint: { unit: "", subject: "suuren kokonaisluvun" },
        int: { unit: "", subject: "kokonaisluvun" },
        date: { unit: "", subject: "p\xE4iv\xE4m\xE4\xE4r\xE4n" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "s\xE4\xE4nn\xF6llinen lauseke",
        email: "s\xE4hk\xF6postiosoite",
        url: "URL-osoite",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO-aikaleima",
        date: "ISO-p\xE4iv\xE4m\xE4\xE4r\xE4",
        time: "ISO-aika",
        duration: "ISO-kesto",
        ipv4: "IPv4-osoite",
        ipv6: "IPv6-osoite",
        cidrv4: "IPv4-alue",
        cidrv6: "IPv6-alue",
        base64: "base64-koodattu merkkijono",
        base64url: "base64url-koodattu merkkijono",
        json_string: "JSON-merkkijono",
        e164: "E.164-luku",
        jwt: "JWT",
        template_literal: "templaattimerkkijono"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Virheellinen tyyppi: odotettiin instanceof ${issue2.expected}, oli ${received}`;
            }
            return `Virheellinen tyyppi: odotettiin ${expected}, oli ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(issue2.values[0])}`;
            return `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Liian suuri: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.maximum.toString()} ${sizing.unit}`.trim();
            }
            return `Liian suuri: arvon t\xE4ytyy olla ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Liian pieni: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.minimum.toString()} ${sizing.unit}`.trim();
            }
            return `Liian pieni: arvon t\xE4ytyy olla ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Virheellinen sy\xF6te: t\xE4ytyy loppua "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${_issue.includes}"`;
            if (_issue.format === "regex") {
              return `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${_issue.pattern}`;
            }
            return `Virheellinen ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Virheellinen luku: t\xE4ytyy olla luvun ${issue2.divisor} monikerta`;
          case "unrecognized_keys":
            return `${issue2.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return "Virheellinen avain tietueessa";
          case "invalid_union":
            return "Virheellinen unioni";
          case "invalid_element":
            return "Virheellinen arvo joukossa";
          default:
            return `Virheellinen sy\xF6te`;
        }
      };
    };
    function fi_default() {
      return {
        localeError: error14()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/fr.js
    var error15 = () => {
      const Sizable = {
        string: { unit: "caract\xE8res", verb: "avoir" },
        file: { unit: "octets", verb: "avoir" },
        array: { unit: "\xE9l\xE9ments", verb: "avoir" },
        set: { unit: "\xE9l\xE9ments", verb: "avoir" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "entr\xE9e",
        email: "adresse e-mail",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "date et heure ISO",
        date: "date ISO",
        time: "heure ISO",
        duration: "dur\xE9e ISO",
        ipv4: "adresse IPv4",
        ipv6: "adresse IPv6",
        cidrv4: "plage IPv4",
        cidrv6: "plage IPv6",
        base64: "cha\xEEne encod\xE9e en base64",
        base64url: "cha\xEEne encod\xE9e en base64url",
        json_string: "cha\xEEne JSON",
        e164: "num\xE9ro E.164",
        jwt: "JWT",
        template_literal: "entr\xE9e"
      };
      const TypeDictionary = {
        string: "cha\xEEne",
        number: "nombre",
        int: "entier",
        boolean: "bool\xE9en",
        bigint: "grand entier",
        symbol: "symbole",
        undefined: "ind\xE9fini",
        null: "null",
        never: "jamais",
        void: "vide",
        date: "date",
        array: "tableau",
        object: "objet",
        tuple: "tuple",
        record: "enregistrement",
        map: "carte",
        set: "ensemble",
        file: "fichier",
        nonoptional: "non-optionnel",
        nan: "NaN",
        function: "fonction"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Entr\xE9e invalide : instanceof ${issue2.expected} attendu, ${received} re\xE7u`;
            }
            return `Entr\xE9e invalide : ${expected} attendu, ${received} re\xE7u`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Entr\xE9e invalide : ${stringifyPrimitive(issue2.values[0])} attendu`;
            return `Option invalide : une valeur parmi ${joinValues(issue2.values, "|")} attendue`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Trop grand : ${TypeDictionary[issue2.origin] ?? "valeur"} doit ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xE9l\xE9ment(s)"}`;
            return `Trop grand : ${TypeDictionary[issue2.origin] ?? "valeur"} doit \xEAtre ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Trop petit : ${TypeDictionary[issue2.origin] ?? "valeur"} doit ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            return `Trop petit : ${TypeDictionary[issue2.origin] ?? "valeur"} doit \xEAtre ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Cha\xEEne invalide : doit correspondre au mod\xE8le ${_issue.pattern}`;
            return `${FormatDictionary[_issue.format] ?? issue2.format} invalide`;
          }
          case "not_multiple_of":
            return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Cl\xE9 invalide dans ${issue2.origin}`;
          case "invalid_union":
            return "Entr\xE9e invalide";
          case "invalid_element":
            return `Valeur invalide dans ${issue2.origin}`;
          default:
            return `Entr\xE9e invalide`;
        }
      };
    };
    function fr_default() {
      return {
        localeError: error15()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/fr-CA.js
    var error16 = () => {
      const Sizable = {
        string: { unit: "caract\xE8res", verb: "avoir" },
        file: { unit: "octets", verb: "avoir" },
        array: { unit: "\xE9l\xE9ments", verb: "avoir" },
        set: { unit: "\xE9l\xE9ments", verb: "avoir" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "entr\xE9e",
        email: "adresse courriel",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "date-heure ISO",
        date: "date ISO",
        time: "heure ISO",
        duration: "dur\xE9e ISO",
        ipv4: "adresse IPv4",
        ipv6: "adresse IPv6",
        cidrv4: "plage IPv4",
        cidrv6: "plage IPv6",
        base64: "cha\xEEne encod\xE9e en base64",
        base64url: "cha\xEEne encod\xE9e en base64url",
        json_string: "cha\xEEne JSON",
        e164: "num\xE9ro E.164",
        jwt: "JWT",
        template_literal: "entr\xE9e"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Entr\xE9e invalide : attendu instanceof ${issue2.expected}, re\xE7u ${received}`;
            }
            return `Entr\xE9e invalide : attendu ${expected}, re\xE7u ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Entr\xE9e invalide : attendu ${stringifyPrimitive(issue2.values[0])}`;
            return `Option invalide : attendu l'une des valeurs suivantes ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "\u2264" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} ait ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
            return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} soit ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? "\u2265" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Trop petit : attendu que ${issue2.origin} ait ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Trop petit : attendu que ${issue2.origin} soit ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Cha\xEEne invalide : doit correspondre au motif ${_issue.pattern}`;
            return `${FormatDictionary[_issue.format] ?? issue2.format} invalide`;
          }
          case "not_multiple_of":
            return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Cl\xE9 invalide dans ${issue2.origin}`;
          case "invalid_union":
            return "Entr\xE9e invalide";
          case "invalid_element":
            return `Valeur invalide dans ${issue2.origin}`;
          default:
            return `Entr\xE9e invalide`;
        }
      };
    };
    function fr_CA_default() {
      return {
        localeError: error16()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/he.js
    var error17 = () => {
      const TypeNames = {
        string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA", gender: "f" },
        number: { label: "\u05DE\u05E1\u05E4\u05E8", gender: "m" },
        boolean: { label: "\u05E2\u05E8\u05DA \u05D1\u05D5\u05DC\u05D9\u05D0\u05E0\u05D9", gender: "m" },
        bigint: { label: "BigInt", gender: "m" },
        date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA", gender: "m" },
        array: { label: "\u05DE\u05E2\u05E8\u05DA", gender: "m" },
        object: { label: "\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8", gender: "m" },
        null: { label: "\u05E2\u05E8\u05DA \u05E8\u05D9\u05E7 (null)", gender: "m" },
        undefined: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05DE\u05D5\u05D2\u05D3\u05E8 (undefined)", gender: "m" },
        symbol: { label: "\u05E1\u05D9\u05DE\u05D1\u05D5\u05DC (Symbol)", gender: "m" },
        function: { label: "\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D4", gender: "f" },
        map: { label: "\u05DE\u05E4\u05D4 (Map)", gender: "f" },
        set: { label: "\u05E7\u05D1\u05D5\u05E6\u05D4 (Set)", gender: "f" },
        file: { label: "\u05E7\u05D5\u05D1\u05E5", gender: "m" },
        promise: { label: "Promise", gender: "m" },
        NaN: { label: "NaN", gender: "m" },
        unknown: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2", gender: "m" },
        value: { label: "\u05E2\u05E8\u05DA", gender: "m" }
      };
      const Sizable = {
        string: { unit: "\u05EA\u05D5\u05D5\u05D9\u05DD", shortLabel: "\u05E7\u05E6\u05E8", longLabel: "\u05D0\u05E8\u05D5\u05DA" },
        file: { unit: "\u05D1\u05D9\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
        array: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
        set: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
        number: { unit: "", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" }
        // no unit
      };
      const typeEntry = (t) => t ? TypeNames[t] : void 0;
      const typeLabel = (t) => {
        const e = typeEntry(t);
        if (e)
          return e.label;
        return t ?? TypeNames.unknown.label;
      };
      const withDefinite = (t) => `\u05D4${typeLabel(t)}`;
      const verbFor = (t) => {
        const e = typeEntry(t);
        const gender = e?.gender ?? "m";
        return gender === "f" ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA" : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA";
      };
      const getSizing = (origin) => {
        if (!origin)
          return null;
        return Sizable[origin] ?? null;
      };
      const FormatDictionary = {
        regex: { label: "\u05E7\u05DC\u05D8", gender: "m" },
        email: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC", gender: "f" },
        url: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05E8\u05E9\u05EA", gender: "f" },
        emoji: { label: "\u05D0\u05D9\u05DE\u05D5\u05D2'\u05D9", gender: "m" },
        uuid: { label: "UUID", gender: "m" },
        nanoid: { label: "nanoid", gender: "m" },
        guid: { label: "GUID", gender: "m" },
        cuid: { label: "cuid", gender: "m" },
        cuid2: { label: "cuid2", gender: "m" },
        ulid: { label: "ULID", gender: "m" },
        xid: { label: "XID", gender: "m" },
        ksuid: { label: "KSUID", gender: "m" },
        datetime: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D5\u05D6\u05DE\u05DF ISO", gender: "m" },
        date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA ISO", gender: "m" },
        time: { label: "\u05D6\u05DE\u05DF ISO", gender: "m" },
        duration: { label: "\u05DE\u05E9\u05DA \u05D6\u05DE\u05DF ISO", gender: "m" },
        ipv4: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv4", gender: "f" },
        ipv6: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv6", gender: "f" },
        cidrv4: { label: "\u05D8\u05D5\u05D5\u05D7 IPv4", gender: "m" },
        cidrv6: { label: "\u05D8\u05D5\u05D5\u05D7 IPv6", gender: "m" },
        base64: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64", gender: "f" },
        base64url: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64 \u05DC\u05DB\u05EA\u05D5\u05D1\u05D5\u05EA \u05E8\u05E9\u05EA", gender: "f" },
        json_string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA JSON", gender: "f" },
        e164: { label: "\u05DE\u05E1\u05E4\u05E8 E.164", gender: "m" },
        jwt: { label: "JWT", gender: "m" },
        ends_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
        includes: { label: "\u05E7\u05DC\u05D8", gender: "m" },
        lowercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
        starts_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
        uppercase: { label: "\u05E7\u05DC\u05D8", gender: "m" }
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expectedKey = issue2.expected;
            const expected = TypeDictionary[expectedKey ?? ""] ?? typeLabel(expectedKey);
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? TypeNames[receivedType]?.label ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA instanceof ${issue2.expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${received}`;
            }
            return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${received}`;
          }
          case "invalid_value": {
            if (issue2.values.length === 1) {
              return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(issue2.values[0])}`;
            }
            const stringified = issue2.values.map((v) => stringifyPrimitive(v));
            if (issue2.values.length === 2) {
              return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${stringified[0]} \u05D0\u05D5 ${stringified[1]}`;
            }
            const lastValue = stringified[stringified.length - 1];
            const restValues = stringified.slice(0, -1).join(", ");
            return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${restValues} \u05D0\u05D5 ${lastValue}`;
          }
          case "too_big": {
            const sizing = getSizing(issue2.origin);
            const subject = withDefinite(issue2.origin ?? "value");
            if (issue2.origin === "string") {
              return `${sizing?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.maximum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
            }
            if (issue2.origin === "number") {
              const comparison = issue2.inclusive ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.maximum}` : `\u05E7\u05D8\u05DF \u05DE-${issue2.maximum}`;
              return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
            }
            if (issue2.origin === "array" || issue2.origin === "set") {
              const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
              const comparison = issue2.inclusive ? `${issue2.maximum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA` : `\u05E4\u05D7\u05D5\u05EA \u05DE-${issue2.maximum} ${sizing?.unit ?? ""}`;
              return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
            }
            const adj = issue2.inclusive ? "<=" : "<";
            const be = verbFor(issue2.origin ?? "value");
            if (sizing?.unit) {
              return `${sizing.longLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
            }
            return `${sizing?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const sizing = getSizing(issue2.origin);
            const subject = withDefinite(issue2.origin ?? "value");
            if (issue2.origin === "string") {
              return `${sizing?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.minimum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
            }
            if (issue2.origin === "number") {
              const comparison = issue2.inclusive ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.minimum}` : `\u05D2\u05D3\u05D5\u05DC \u05DE-${issue2.minimum}`;
              return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
            }
            if (issue2.origin === "array" || issue2.origin === "set") {
              const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
              if (issue2.minimum === 1 && issue2.inclusive) {
                const singularPhrase = issue2.origin === "set" ? "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3" : "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3";
                return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${singularPhrase}`;
              }
              const comparison = issue2.inclusive ? `${issue2.minimum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8` : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${issue2.minimum} ${sizing?.unit ?? ""}`;
              return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
            }
            const adj = issue2.inclusive ? ">=" : ">";
            const be = verbFor(issue2.origin ?? "value");
            if (sizing?.unit) {
              return `${sizing.shortLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `${sizing?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${_issue.pattern}`;
            const nounEntry = FormatDictionary[_issue.format];
            const noun = nounEntry?.label ?? _issue.format;
            const gender = nounEntry?.gender ?? "m";
            const adjective = gender === "f" ? "\u05EA\u05E7\u05D9\u05E0\u05D4" : "\u05EA\u05E7\u05D9\u05DF";
            return `${noun} \u05DC\u05D0 ${adjective}`;
          }
          case "not_multiple_of":
            return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u05DE\u05E4\u05EA\u05D7${issue2.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${issue2.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key": {
            return `\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8`;
          }
          case "invalid_union":
            return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
          case "invalid_element": {
            const place = withDefinite(issue2.origin ?? "array");
            return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${place}`;
          }
          default:
            return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF`;
        }
      };
    };
    function he_default() {
      return {
        localeError: error17()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/hr.js
    var error18 = () => {
      const Sizable = {
        string: { unit: "znakova", verb: "imati" },
        file: { unit: "bajtova", verb: "imati" },
        array: { unit: "stavki", verb: "imati" },
        set: { unit: "stavki", verb: "imati" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "unos",
        email: "email adresa",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datum i vrijeme",
        date: "ISO datum",
        time: "ISO vrijeme",
        duration: "ISO trajanje",
        ipv4: "IPv4 adresa",
        ipv6: "IPv6 adresa",
        cidrv4: "IPv4 raspon",
        cidrv6: "IPv6 raspon",
        base64: "base64 kodirani tekst",
        base64url: "base64url kodirani tekst",
        json_string: "JSON tekst",
        e164: "E.164 broj",
        jwt: "JWT",
        template_literal: "unos"
      };
      const TypeDictionary = {
        nan: "NaN",
        string: "tekst",
        number: "broj",
        boolean: "boolean",
        array: "niz",
        object: "objekt",
        set: "skup",
        file: "datoteka",
        date: "datum",
        bigint: "bigint",
        symbol: "simbol",
        undefined: "undefined",
        null: "null",
        function: "funkcija",
        map: "mapa"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Neispravan unos: o\u010Dekuje se instanceof ${issue2.expected}, a primljeno je ${received}`;
            }
            return `Neispravan unos: o\u010Dekuje se ${expected}, a primljeno je ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Neispravna vrijednost: o\u010Dekivano ${stringifyPrimitive(issue2.values[0])}`;
            return `Neispravna opcija: o\u010Dekivano jedno od ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            if (sizing)
              return `Preveliko: o\u010Dekivano da ${origin ?? "vrijednost"} ima ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemenata"}`;
            return `Preveliko: o\u010Dekivano da ${origin ?? "vrijednost"} bude ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            if (sizing) {
              return `Premalo: o\u010Dekivano da ${origin} ima ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Premalo: o\u010Dekivano da ${origin} bude ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Neispravan tekst: mora zapo\u010Dinjati s "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Neispravan tekst: mora zavr\u0161avati s "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Neispravan tekst: mora sadr\u017Eavati "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Neispravan tekst: mora odgovarati uzorku ${_issue.pattern}`;
            return `Neispravna ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Neispravan broj: mora biti vi\u0161ekratnik od ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Neprepoznat${issue2.keys.length > 1 ? "i klju\u010Devi" : " klju\u010D"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Neispravan klju\u010D u ${TypeDictionary[issue2.origin] ?? issue2.origin}`;
          case "invalid_union":
            return "Neispravan unos";
          case "invalid_element":
            return `Neispravna vrijednost u ${TypeDictionary[issue2.origin] ?? issue2.origin}`;
          default:
            return `Neispravan unos`;
        }
      };
    };
    function hr_default() {
      return {
        localeError: error18()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/hu.js
    var error19 = () => {
      const Sizable = {
        string: { unit: "karakter", verb: "legyen" },
        file: { unit: "byte", verb: "legyen" },
        array: { unit: "elem", verb: "legyen" },
        set: { unit: "elem", verb: "legyen" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "bemenet",
        email: "email c\xEDm",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO id\u0151b\xE9lyeg",
        date: "ISO d\xE1tum",
        time: "ISO id\u0151",
        duration: "ISO id\u0151intervallum",
        ipv4: "IPv4 c\xEDm",
        ipv6: "IPv6 c\xEDm",
        cidrv4: "IPv4 tartom\xE1ny",
        cidrv6: "IPv6 tartom\xE1ny",
        base64: "base64-k\xF3dolt string",
        base64url: "base64url-k\xF3dolt string",
        json_string: "JSON string",
        e164: "E.164 sz\xE1m",
        jwt: "JWT",
        template_literal: "bemenet"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "sz\xE1m",
        array: "t\xF6mb"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k instanceof ${issue2.expected}, a kapott \xE9rt\xE9k ${received}`;
            }
            return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${expected}, a kapott \xE9rt\xE9k ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(issue2.values[0])}`;
            return `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `T\xFAl nagy: ${issue2.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elem"}`;
            return `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${issue2.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} m\xE9rete t\xFAl kicsi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} t\xFAl kicsi ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\xC9rv\xE9nytelen string: "${_issue.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`;
            if (_issue.format === "ends_with")
              return `\xC9rv\xE9nytelen string: "${_issue.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`;
            if (_issue.format === "includes")
              return `\xC9rv\xE9nytelen string: "${_issue.includes}" \xE9rt\xE9ket kell tartalmaznia`;
            if (_issue.format === "regex")
              return `\xC9rv\xE9nytelen string: ${_issue.pattern} mint\xE1nak kell megfelelnie`;
            return `\xC9rv\xE9nytelen ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\xC9rv\xE9nytelen sz\xE1m: ${issue2.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`;
          case "unrecognized_keys":
            return `Ismeretlen kulcs${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\xC9rv\xE9nytelen kulcs ${issue2.origin}`;
          case "invalid_union":
            return "\xC9rv\xE9nytelen bemenet";
          case "invalid_element":
            return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${issue2.origin}`;
          default:
            return `\xC9rv\xE9nytelen bemenet`;
        }
      };
    };
    function hu_default() {
      return {
        localeError: error19()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/hy.js
    function getArmenianPlural(count, one, many) {
      return Math.abs(count) === 1 ? one : many;
    }
    function withDefiniteArticle(word) {
      if (!word)
        return "";
      const vowels = ["\u0561", "\u0565", "\u0568", "\u056B", "\u0578", "\u0578\u0582", "\u0585"];
      const lastChar = word[word.length - 1];
      return word + (vowels.includes(lastChar) ? "\u0576" : "\u0568");
    }
    var error20 = () => {
      const Sizable = {
        string: {
          unit: {
            one: "\u0576\u0577\u0561\u0576",
            many: "\u0576\u0577\u0561\u0576\u0576\u0565\u0580"
          },
          verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
        },
        file: {
          unit: {
            one: "\u0562\u0561\u0575\u0569",
            many: "\u0562\u0561\u0575\u0569\u0565\u0580"
          },
          verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
        },
        array: {
          unit: {
            one: "\u057F\u0561\u0580\u0580",
            many: "\u057F\u0561\u0580\u0580\u0565\u0580"
          },
          verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
        },
        set: {
          unit: {
            one: "\u057F\u0561\u0580\u0580",
            many: "\u057F\u0561\u0580\u0580\u0565\u0580"
          },
          verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
        }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0574\u0578\u0582\u057F\u0584",
        email: "\u0567\u056C. \u0570\u0561\u057D\u0581\u0565",
        url: "URL",
        emoji: "\u0567\u0574\u0578\u057B\u056B",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E \u0587 \u056A\u0561\u0574",
        date: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E",
        time: "ISO \u056A\u0561\u0574",
        duration: "ISO \u057F\u0587\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
        ipv4: "IPv4 \u0570\u0561\u057D\u0581\u0565",
        ipv6: "IPv6 \u0570\u0561\u057D\u0581\u0565",
        cidrv4: "IPv4 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
        cidrv6: "IPv6 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
        base64: "base64 \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
        base64url: "base64url \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
        json_string: "JSON \u057F\u0578\u0572",
        e164: "E.164 \u0570\u0561\u0574\u0561\u0580",
        jwt: "JWT",
        template_literal: "\u0574\u0578\u0582\u057F\u0584"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0569\u056B\u057E",
        array: "\u0566\u0561\u0576\u0563\u057E\u0561\u056E"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 instanceof ${issue2.expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${received}`;
            }
            return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${stringifyPrimitive(issue2.values[1])}`;
            return `\u054D\u056D\u0561\u056C \u057F\u0561\u0580\u0562\u0565\u0580\u0561\u056F\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 \u0570\u0565\u057F\u0587\u0575\u0561\u056C\u0576\u0565\u0580\u056B\u0581 \u0574\u0565\u056F\u0568\u055D ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              const maxValue = Number(issue2.maximum);
              const unit = getArmenianPlural(maxValue, sizing.unit.one, sizing.unit.many);
              return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${adj}${issue2.maximum.toString()} ${unit}`;
            }
            return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056C\u056B\u0576\u056B ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              const minValue = Number(issue2.minimum);
              const unit = getArmenianPlural(minValue, sizing.unit.one, sizing.unit.many);
              return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin)} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${adj}${issue2.minimum.toString()} ${unit}`;
            }
            return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin)} \u056C\u056B\u0576\u056B ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057D\u056F\u057D\u057E\u056B "${_issue.prefix}"-\u0578\u057E`;
            if (_issue.format === "ends_with")
              return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0561\u057E\u0561\u0580\u057F\u057E\u056B "${_issue.suffix}"-\u0578\u057E`;
            if (_issue.format === "includes")
              return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057A\u0561\u0580\u0578\u0582\u0576\u0561\u056F\u056B "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0570\u0561\u0574\u0561\u057A\u0561\u057F\u0561\u057D\u056D\u0561\u0576\u056B ${_issue.pattern} \u0571\u0587\u0561\u0579\u0561\u0583\u056B\u0576`;
            return `\u054D\u056D\u0561\u056C ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u054D\u056D\u0561\u056C \u0569\u056B\u057E\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0562\u0561\u0566\u0574\u0561\u057A\u0561\u057F\u056B\u056F \u056C\u056B\u0576\u056B ${issue2.divisor}-\u056B`;
          case "unrecognized_keys":
            return `\u0549\u0573\u0561\u0576\u0561\u0579\u057E\u0561\u056E \u0562\u0561\u0576\u0561\u056C\u056B${issue2.keys.length > 1 ? "\u0576\u0565\u0580" : ""}. ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u054D\u056D\u0561\u056C \u0562\u0561\u0576\u0561\u056C\u056B ${withDefiniteArticle(issue2.origin)}-\u0578\u0582\u0574`;
          case "invalid_union":
            return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
          case "invalid_element":
            return `\u054D\u056D\u0561\u056C \u0561\u0580\u056A\u0565\u0584 ${withDefiniteArticle(issue2.origin)}-\u0578\u0582\u0574`;
          default:
            return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574`;
        }
      };
    };
    function hy_default() {
      return {
        localeError: error20()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/id.js
    var error21 = () => {
      const Sizable = {
        string: { unit: "karakter", verb: "memiliki" },
        file: { unit: "byte", verb: "memiliki" },
        array: { unit: "item", verb: "memiliki" },
        set: { unit: "item", verb: "memiliki" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "alamat email",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "tanggal dan waktu format ISO",
        date: "tanggal format ISO",
        time: "jam format ISO",
        duration: "durasi format ISO",
        ipv4: "alamat IPv4",
        ipv6: "alamat IPv6",
        cidrv4: "rentang alamat IPv4",
        cidrv6: "rentang alamat IPv6",
        base64: "string dengan enkode base64",
        base64url: "string dengan enkode base64url",
        json_string: "string JSON",
        e164: "angka E.164",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Input tidak valid: diharapkan instanceof ${issue2.expected}, diterima ${received}`;
            }
            return `Input tidak valid: diharapkan ${expected}, diterima ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Input tidak valid: diharapkan ${stringifyPrimitive(issue2.values[0])}`;
            return `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} memiliki ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
            return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} menjadi ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Terlalu kecil: diharapkan ${issue2.origin} memiliki ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Terlalu kecil: diharapkan ${issue2.origin} menjadi ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `String tidak valid: harus dimulai dengan "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `String tidak valid: harus berakhir dengan "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `String tidak valid: harus menyertakan "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `String tidak valid: harus sesuai pola ${_issue.pattern}`;
            return `${FormatDictionary[_issue.format] ?? issue2.format} tidak valid`;
          }
          case "not_multiple_of":
            return `Angka tidak valid: harus kelipatan dari ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Kunci tidak dikenali ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Kunci tidak valid di ${issue2.origin}`;
          case "invalid_union":
            return "Input tidak valid";
          case "invalid_element":
            return `Nilai tidak valid di ${issue2.origin}`;
          default:
            return `Input tidak valid`;
        }
      };
    };
    function id_default() {
      return {
        localeError: error21()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/is.js
    var error22 = () => {
      const Sizable = {
        string: { unit: "stafi", verb: "a\xF0 hafa" },
        file: { unit: "b\xE6ti", verb: "a\xF0 hafa" },
        array: { unit: "hluti", verb: "a\xF0 hafa" },
        set: { unit: "hluti", verb: "a\xF0 hafa" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "gildi",
        email: "netfang",
        url: "vefsl\xF3\xF0",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO dagsetning og t\xEDmi",
        date: "ISO dagsetning",
        time: "ISO t\xEDmi",
        duration: "ISO t\xEDmalengd",
        ipv4: "IPv4 address",
        ipv6: "IPv6 address",
        cidrv4: "IPv4 range",
        cidrv6: "IPv6 range",
        base64: "base64-encoded strengur",
        base64url: "base64url-encoded strengur",
        json_string: "JSON strengur",
        e164: "E.164 t\xF6lugildi",
        jwt: "JWT",
        template_literal: "gildi"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "n\xFAmer",
        array: "fylki"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Rangt gildi: \xDE\xFA sl\xF3st inn ${received} \xFEar sem \xE1 a\xF0 vera instanceof ${issue2.expected}`;
            }
            return `Rangt gildi: \xDE\xFA sl\xF3st inn ${received} \xFEar sem \xE1 a\xF0 vera ${expected}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(issue2.values[0])}`;
            return `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} hafi ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "hluti"}`;
            return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} s\xE9 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} hafi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} s\xE9 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${_issue.pattern}`;
            return `Rangt ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `R\xF6ng tala: ver\xF0ur a\xF0 vera margfeldi af ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\xD3\xFEekkt ${issue2.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Rangur lykill \xED ${issue2.origin}`;
          case "invalid_union":
            return "Rangt gildi";
          case "invalid_element":
            return `Rangt gildi \xED ${issue2.origin}`;
          default:
            return `Rangt gildi`;
        }
      };
    };
    function is_default() {
      return {
        localeError: error22()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/it.js
    var error23 = () => {
      const Sizable = {
        string: { unit: "caratteri", verb: "avere" },
        file: { unit: "byte", verb: "avere" },
        array: { unit: "elementi", verb: "avere" },
        set: { unit: "elementi", verb: "avere" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "indirizzo email",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "data e ora ISO",
        date: "data ISO",
        time: "ora ISO",
        duration: "durata ISO",
        ipv4: "indirizzo IPv4",
        ipv6: "indirizzo IPv6",
        cidrv4: "intervallo IPv4",
        cidrv6: "intervallo IPv6",
        base64: "stringa codificata in base64",
        base64url: "URL codificata in base64",
        json_string: "stringa JSON",
        e164: "numero E.164",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "numero",
        array: "vettore"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Input non valido: atteso instanceof ${issue2.expected}, ricevuto ${received}`;
            }
            return `Input non valido: atteso ${expected}, ricevuto ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Input non valido: atteso ${stringifyPrimitive(issue2.values[0])}`;
            return `Opzione non valida: atteso uno tra ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Troppo grande: ${issue2.origin ?? "valore"} deve avere ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementi"}`;
            return `Troppo grande: ${issue2.origin ?? "valore"} deve essere ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Troppo piccolo: ${issue2.origin} deve avere ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Troppo piccolo: ${issue2.origin} deve essere ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Stringa non valida: deve iniziare con "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Stringa non valida: deve terminare con "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Stringa non valida: deve includere "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Stringa non valida: deve corrispondere al pattern ${_issue.pattern}`;
            return `Input non valido: ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Numero non valido: deve essere un multiplo di ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Chiav${issue2.keys.length > 1 ? "i" : "e"} non riconosciut${issue2.keys.length > 1 ? "e" : "a"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Chiave non valida in ${issue2.origin}`;
          case "invalid_union":
            return "Input non valido";
          case "invalid_element":
            return `Valore non valido in ${issue2.origin}`;
          default:
            return `Input non valido`;
        }
      };
    };
    function it_default() {
      return {
        localeError: error23()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ja.js
    var error24 = () => {
      const Sizable = {
        string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
        file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
        array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
        set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u5165\u529B\u5024",
        email: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
        url: "URL",
        emoji: "\u7D75\u6587\u5B57",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO\u65E5\u6642",
        date: "ISO\u65E5\u4ED8",
        time: "ISO\u6642\u523B",
        duration: "ISO\u671F\u9593",
        ipv4: "IPv4\u30A2\u30C9\u30EC\u30B9",
        ipv6: "IPv6\u30A2\u30C9\u30EC\u30B9",
        cidrv4: "IPv4\u7BC4\u56F2",
        cidrv6: "IPv6\u7BC4\u56F2",
        base64: "base64\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
        base64url: "base64url\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
        json_string: "JSON\u6587\u5B57\u5217",
        e164: "E.164\u756A\u53F7",
        jwt: "JWT",
        template_literal: "\u5165\u529B\u5024"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u6570\u5024",
        array: "\u914D\u5217"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u7121\u52B9\u306A\u5165\u529B: instanceof ${issue2.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${received}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
            }
            return `\u7121\u52B9\u306A\u5165\u529B: ${expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${received}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(issue2.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`;
            return `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(issue2.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          case "too_big": {
            const adj = issue2.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${sizing.unit ?? "\u8981\u7D20"}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
            return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${sizing.unit}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
            return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
            if (_issue.format === "ends_with")
              return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
            if (_issue.format === "includes")
              return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
            if (_issue.format === "regex")
              return `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${_issue.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
            return `\u7121\u52B9\u306A${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u7121\u52B9\u306A\u6570\u5024: ${issue2.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
          case "unrecognized_keys":
            return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${issue2.keys.length > 1 ? "\u7FA4" : ""}: ${joinValues(issue2.keys, "\u3001")}`;
          case "invalid_key":
            return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`;
          case "invalid_union":
            return "\u7121\u52B9\u306A\u5165\u529B";
          case "invalid_element":
            return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`;
          default:
            return `\u7121\u52B9\u306A\u5165\u529B`;
        }
      };
    };
    function ja_default() {
      return {
        localeError: error24()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ka.js
    var error25 = () => {
      const Sizable = {
        string: { unit: "\u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
        file: { unit: "\u10D1\u10D0\u10D8\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
        array: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
        set: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
        email: "\u10D4\u10DA-\u10E4\u10DD\u10E1\u10E2\u10D8\u10E1 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
        url: "URL",
        emoji: "\u10D4\u10DB\u10DD\u10EF\u10D8",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8-\u10D3\u10E0\u10DD",
        date: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8",
        time: "\u10D3\u10E0\u10DD",
        duration: "\u10EE\u10D0\u10DC\u10D2\u10E0\u10EB\u10DA\u10D8\u10D5\u10DD\u10D1\u10D0",
        ipv4: "IPv4 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
        ipv6: "IPv6 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
        cidrv4: "IPv4 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
        cidrv6: "IPv6 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
        base64: "base64-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10D5\u10D4\u10DA\u10D8",
        base64url: "base64url-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10D5\u10D4\u10DA\u10D8",
        json_string: "JSON \u10D5\u10D4\u10DA\u10D8",
        e164: "E.164 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8",
        jwt: "JWT",
        template_literal: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u10E0\u10D8\u10EA\u10EE\u10D5\u10D8",
        string: "\u10D5\u10D4\u10DA\u10D8",
        boolean: "\u10D1\u10E3\u10DA\u10D4\u10D0\u10DC\u10D8",
        function: "\u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D0",
        array: "\u10DB\u10D0\u10E1\u10D8\u10D5\u10D8"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 instanceof ${issue2.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${received}`;
            }
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(issue2.values[0])}`;
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(issue2.values, "|")}-\u10D3\u10D0\u10DC`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
            return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D4\u10DA\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.prefix}"-\u10D8\u10D7`;
            }
            if (_issue.format === "ends_with")
              return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D4\u10DA\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.suffix}"-\u10D8\u10D7`;
            if (_issue.format === "includes")
              return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D4\u10DA\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${_issue.includes}"-\u10E1`;
            if (_issue.format === "regex")
              return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D4\u10DA\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${_issue.pattern}`;
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E0\u10D8\u10EA\u10EE\u10D5\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 ${issue2.divisor}-\u10D8\u10E1 \u10EF\u10D4\u10E0\u10D0\u10D3\u10D8`;
          case "unrecognized_keys":
            return `\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1${issue2.keys.length > 1 ? "\u10D4\u10D1\u10D8" : "\u10D8"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8 ${issue2.origin}-\u10E8\u10D8`;
          case "invalid_union":
            return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
          case "invalid_element":
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0 ${issue2.origin}-\u10E8\u10D8`;
          default:
            return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0`;
        }
      };
    };
    function ka_default() {
      return {
        localeError: error25()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/km.js
    var error26 = () => {
      const Sizable = {
        string: { unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
        file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
        array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
        set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
        email: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793\u17A2\u17CA\u17B8\u1798\u17C2\u179B",
        url: "URL",
        emoji: "\u179F\u1789\u17D2\u1789\u17B6\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 \u1793\u17B7\u1784\u1798\u17C9\u17C4\u1784 ISO",
        date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 ISO",
        time: "\u1798\u17C9\u17C4\u1784 ISO",
        duration: "\u179A\u1799\u17C8\u1796\u17C1\u179B ISO",
        ipv4: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
        ipv6: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
        cidrv4: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
        cidrv6: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
        base64: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64",
        base64url: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64url",
        json_string: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A JSON",
        e164: "\u179B\u17C1\u1781 E.164",
        jwt: "JWT",
        template_literal: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u179B\u17C1\u1781",
        array: "\u17A2\u17B6\u179A\u17C1 (Array)",
        null: "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A instanceof ${issue2.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${received}`;
            }
            return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(issue2.values[0])}`;
            return `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u1792\u17B6\u178F\u17BB"}`;
            return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${_issue.pattern}`;
            return `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
          case "invalid_union":
            return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
          case "invalid_element":
            return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
          default:
            return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
        }
      };
    };
    function km_default() {
      return {
        localeError: error26()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/kh.js
    function kh_default() {
      return km_default();
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ko.js
    var error27 = () => {
      const Sizable = {
        string: { unit: "\uBB38\uC790", verb: "to have" },
        file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
        array: { unit: "\uAC1C", verb: "to have" },
        set: { unit: "\uAC1C", verb: "to have" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\uC785\uB825",
        email: "\uC774\uBA54\uC77C \uC8FC\uC18C",
        url: "URL",
        emoji: "\uC774\uBAA8\uC9C0",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \uB0A0\uC9DC\uC2DC\uAC04",
        date: "ISO \uB0A0\uC9DC",
        time: "ISO \uC2DC\uAC04",
        duration: "ISO \uAE30\uAC04",
        ipv4: "IPv4 \uC8FC\uC18C",
        ipv6: "IPv6 \uC8FC\uC18C",
        cidrv4: "IPv4 \uBC94\uC704",
        cidrv6: "IPv6 \uBC94\uC704",
        base64: "base64 \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
        base64url: "base64url \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
        json_string: "JSON \uBB38\uC790\uC5F4",
        e164: "E.164 \uBC88\uD638",
        jwt: "JWT",
        template_literal: "\uC785\uB825"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 instanceof ${issue2.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${received}\uC785\uB2C8\uB2E4`;
            }
            return `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${received}\uC785\uB2C8\uB2E4`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(issue2.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`;
            return `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(issue2.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
          case "too_big": {
            const adj = issue2.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC";
            const suffix = adj === "\uBBF8\uB9CC" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
            const sizing = getSizing(issue2.origin);
            const unit = sizing?.unit ?? "\uC694\uC18C";
            if (sizing)
              return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()}${unit} ${adj}${suffix}`;
            return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()} ${adj}${suffix}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC";
            const suffix = adj === "\uC774\uC0C1" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
            const sizing = getSizing(issue2.origin);
            const unit = sizing?.unit ?? "\uC694\uC18C";
            if (sizing) {
              return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()}${unit} ${adj}${suffix}`;
            }
            return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()} ${adj}${suffix}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`;
            }
            if (_issue.format === "ends_with")
              return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`;
            if (_issue.format === "includes")
              return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`;
            if (_issue.format === "regex")
              return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${_issue.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`;
            return `\uC798\uBABB\uB41C ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\uC798\uBABB\uB41C \uC22B\uC790: ${issue2.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
          case "unrecognized_keys":
            return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\uC798\uBABB\uB41C \uD0A4: ${issue2.origin}`;
          case "invalid_union":
            return `\uC798\uBABB\uB41C \uC785\uB825`;
          case "invalid_element":
            return `\uC798\uBABB\uB41C \uAC12: ${issue2.origin}`;
          default:
            return `\uC798\uBABB\uB41C \uC785\uB825`;
        }
      };
    };
    function ko_default() {
      return {
        localeError: error27()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/lt.js
    var capitalizeFirstCharacter = (text) => {
      return text.charAt(0).toUpperCase() + text.slice(1);
    };
    function getUnitTypeFromNumber(number4) {
      const abs = Math.abs(number4);
      const last = abs % 10;
      const last2 = abs % 100;
      if (last2 >= 11 && last2 <= 19 || last === 0)
        return "many";
      if (last === 1)
        return "one";
      return "few";
    }
    var error28 = () => {
      const Sizable = {
        string: {
          unit: {
            one: "simbolis",
            few: "simboliai",
            many: "simboli\u0173"
          },
          verb: {
            smaller: {
              inclusive: "turi b\u016Bti ne ilgesn\u0117 kaip",
              notInclusive: "turi b\u016Bti trumpesn\u0117 kaip"
            },
            bigger: {
              inclusive: "turi b\u016Bti ne trumpesn\u0117 kaip",
              notInclusive: "turi b\u016Bti ilgesn\u0117 kaip"
            }
          }
        },
        file: {
          unit: {
            one: "baitas",
            few: "baitai",
            many: "bait\u0173"
          },
          verb: {
            smaller: {
              inclusive: "turi b\u016Bti ne didesnis kaip",
              notInclusive: "turi b\u016Bti ma\u017Eesnis kaip"
            },
            bigger: {
              inclusive: "turi b\u016Bti ne ma\u017Eesnis kaip",
              notInclusive: "turi b\u016Bti didesnis kaip"
            }
          }
        },
        array: {
          unit: {
            one: "element\u0105",
            few: "elementus",
            many: "element\u0173"
          },
          verb: {
            smaller: {
              inclusive: "turi tur\u0117ti ne daugiau kaip",
              notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
            },
            bigger: {
              inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
              notInclusive: "turi tur\u0117ti daugiau kaip"
            }
          }
        },
        set: {
          unit: {
            one: "element\u0105",
            few: "elementus",
            many: "element\u0173"
          },
          verb: {
            smaller: {
              inclusive: "turi tur\u0117ti ne daugiau kaip",
              notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
            },
            bigger: {
              inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
              notInclusive: "turi tur\u0117ti daugiau kaip"
            }
          }
        }
      };
      function getSizing(origin, unitType, inclusive, targetShouldBe) {
        const result = Sizable[origin] ?? null;
        if (result === null)
          return result;
        return {
          unit: result.unit[unitType],
          verb: result.verb[targetShouldBe][inclusive ? "inclusive" : "notInclusive"]
        };
      }
      const FormatDictionary = {
        regex: "\u012Fvestis",
        email: "el. pa\u0161to adresas",
        url: "URL",
        emoji: "jaustukas",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO data ir laikas",
        date: "ISO data",
        time: "ISO laikas",
        duration: "ISO trukm\u0117",
        ipv4: "IPv4 adresas",
        ipv6: "IPv6 adresas",
        cidrv4: "IPv4 tinklo prefiksas (CIDR)",
        cidrv6: "IPv6 tinklo prefiksas (CIDR)",
        base64: "base64 u\u017Ekoduota eilut\u0117",
        base64url: "base64url u\u017Ekoduota eilut\u0117",
        json_string: "JSON eilut\u0117",
        e164: "E.164 numeris",
        jwt: "JWT",
        template_literal: "\u012Fvestis"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "skai\u010Dius",
        bigint: "sveikasis skai\u010Dius",
        string: "eilut\u0117",
        boolean: "login\u0117 reik\u0161m\u0117",
        undefined: "neapibr\u0117\u017Eta reik\u0161m\u0117",
        function: "funkcija",
        symbol: "simbolis",
        array: "masyvas",
        object: "objektas",
        null: "nulin\u0117 reik\u0161m\u0117"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Gautas tipas ${received}, o tik\u0117tasi - instanceof ${issue2.expected}`;
            }
            return `Gautas tipas ${received}, o tik\u0117tasi - ${expected}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Privalo b\u016Bti ${stringifyPrimitive(issue2.values[0])}`;
            return `Privalo b\u016Bti vienas i\u0161 ${joinValues(issue2.values, "|")} pasirinkim\u0173`;
          case "too_big": {
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.maximum)), issue2.inclusive ?? false, "smaller");
            if (sizing?.verb)
              return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.maximum.toString()} ${sizing.unit ?? "element\u0173"}`;
            const adj = issue2.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
            return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.maximum.toString()} ${sizing?.unit}`;
          }
          case "too_small": {
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.minimum)), issue2.inclusive ?? false, "bigger");
            if (sizing?.verb)
              return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.minimum.toString()} ${sizing.unit ?? "element\u0173"}`;
            const adj = issue2.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
            return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.minimum.toString()} ${sizing?.unit}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Eilut\u0117 privalo prasid\u0117ti "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Eilut\u0117 privalo pasibaigti "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Eilut\u0117 privalo \u012Ftraukti "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Eilut\u0117 privalo atitikti ${_issue.pattern}`;
            return `Neteisingas ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Skai\u010Dius privalo b\u016Bti ${issue2.divisor} kartotinis.`;
          case "unrecognized_keys":
            return `Neatpa\u017Eint${issue2.keys.length > 1 ? "i" : "as"} rakt${issue2.keys.length > 1 ? "ai" : "as"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return "Rastas klaidingas raktas";
          case "invalid_union":
            return "Klaidinga \u012Fvestis";
          case "invalid_element": {
            const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
            return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
          }
          default:
            return "Klaidinga \u012Fvestis";
        }
      };
    };
    function lt_default() {
      return {
        localeError: error28()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/mk.js
    var error29 = () => {
      const Sizable = {
        string: { unit: "\u0437\u043D\u0430\u0446\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
        file: { unit: "\u0431\u0430\u0458\u0442\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
        array: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
        set: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0432\u043D\u0435\u0441",
        email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u043D\u0430 \u0435-\u043F\u043E\u0448\u0442\u0430",
        url: "URL",
        emoji: "\u0435\u043C\u043E\u045F\u0438",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u0434\u0430\u0442\u0443\u043C \u0438 \u0432\u0440\u0435\u043C\u0435",
        date: "ISO \u0434\u0430\u0442\u0443\u043C",
        time: "ISO \u0432\u0440\u0435\u043C\u0435",
        duration: "ISO \u0432\u0440\u0435\u043C\u0435\u0442\u0440\u0430\u0435\u045A\u0435",
        ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441\u0430",
        ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441\u0430",
        cidrv4: "IPv4 \u043E\u043F\u0441\u0435\u0433",
        cidrv6: "IPv6 \u043E\u043F\u0441\u0435\u0433",
        base64: "base64-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
        base64url: "base64url-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
        json_string: "JSON \u043D\u0438\u0437\u0430",
        e164: "E.164 \u0431\u0440\u043E\u0458",
        jwt: "JWT",
        template_literal: "\u0432\u043D\u0435\u0441"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0431\u0440\u043E\u0458",
        array: "\u043D\u0438\u0437\u0430"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 instanceof ${issue2.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${received}`;
            }
            return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
            return `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`;
            return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${_issue.pattern}`;
            return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${issue2.divisor}`;
          case "unrecognized_keys":
            return `${issue2.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${issue2.origin}`;
          case "invalid_union":
            return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
          case "invalid_element":
            return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${issue2.origin}`;
          default:
            return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441`;
        }
      };
    };
    function mk_default() {
      return {
        localeError: error29()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ms.js
    var error30 = () => {
      const Sizable = {
        string: { unit: "aksara", verb: "mempunyai" },
        file: { unit: "bait", verb: "mempunyai" },
        array: { unit: "elemen", verb: "mempunyai" },
        set: { unit: "elemen", verb: "mempunyai" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "alamat e-mel",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "tarikh masa ISO",
        date: "tarikh ISO",
        time: "masa ISO",
        duration: "tempoh ISO",
        ipv4: "alamat IPv4",
        ipv6: "alamat IPv6",
        cidrv4: "julat IPv4",
        cidrv6: "julat IPv6",
        base64: "string dikodkan base64",
        base64url: "string dikodkan base64url",
        json_string: "string JSON",
        e164: "nombor E.164",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "nombor"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Input tidak sah: dijangka instanceof ${issue2.expected}, diterima ${received}`;
            }
            return `Input tidak sah: dijangka ${expected}, diterima ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Input tidak sah: dijangka ${stringifyPrimitive(issue2.values[0])}`;
            return `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
            return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} adalah ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Terlalu kecil: dijangka ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Terlalu kecil: dijangka ${issue2.origin} adalah ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `String tidak sah: mesti bermula dengan "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `String tidak sah: mesti berakhir dengan "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `String tidak sah: mesti mengandungi "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `String tidak sah: mesti sepadan dengan corak ${_issue.pattern}`;
            return `${FormatDictionary[_issue.format] ?? issue2.format} tidak sah`;
          }
          case "not_multiple_of":
            return `Nombor tidak sah: perlu gandaan ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Kunci tidak dikenali: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Kunci tidak sah dalam ${issue2.origin}`;
          case "invalid_union":
            return "Input tidak sah";
          case "invalid_element":
            return `Nilai tidak sah dalam ${issue2.origin}`;
          default:
            return `Input tidak sah`;
        }
      };
    };
    function ms_default() {
      return {
        localeError: error30()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/nl.js
    var error31 = () => {
      const Sizable = {
        string: { unit: "tekens", verb: "heeft" },
        file: { unit: "bytes", verb: "heeft" },
        array: { unit: "elementen", verb: "heeft" },
        set: { unit: "elementen", verb: "heeft" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "invoer",
        email: "emailadres",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datum en tijd",
        date: "ISO datum",
        time: "ISO tijd",
        duration: "ISO duur",
        ipv4: "IPv4-adres",
        ipv6: "IPv6-adres",
        cidrv4: "IPv4-bereik",
        cidrv6: "IPv6-bereik",
        base64: "base64-gecodeerde tekst",
        base64url: "base64 URL-gecodeerde tekst",
        json_string: "JSON string",
        e164: "E.164-nummer",
        jwt: "JWT",
        template_literal: "invoer"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "getal"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Ongeldige invoer: verwacht instanceof ${issue2.expected}, ontving ${received}`;
            }
            return `Ongeldige invoer: verwacht ${expected}, ontving ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Ongeldige invoer: verwacht ${stringifyPrimitive(issue2.values[0])}`;
            return `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            const longName = issue2.origin === "date" ? "laat" : issue2.origin === "string" ? "lang" : "groot";
            if (sizing)
              return `Te ${longName}: verwacht dat ${issue2.origin ?? "waarde"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementen"} ${sizing.verb}`;
            return `Te ${longName}: verwacht dat ${issue2.origin ?? "waarde"} ${adj}${issue2.maximum.toString()} is`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            const shortName = issue2.origin === "date" ? "vroeg" : issue2.origin === "string" ? "kort" : "klein";
            if (sizing) {
              return `Te ${shortName}: verwacht dat ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
            }
            return `Te ${shortName}: verwacht dat ${issue2.origin} ${adj}${issue2.minimum.toString()} is`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Ongeldige tekst: moet met "${_issue.prefix}" beginnen`;
            }
            if (_issue.format === "ends_with")
              return `Ongeldige tekst: moet op "${_issue.suffix}" eindigen`;
            if (_issue.format === "includes")
              return `Ongeldige tekst: moet "${_issue.includes}" bevatten`;
            if (_issue.format === "regex")
              return `Ongeldige tekst: moet overeenkomen met patroon ${_issue.pattern}`;
            return `Ongeldig: ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Ongeldig getal: moet een veelvoud van ${issue2.divisor} zijn`;
          case "unrecognized_keys":
            return `Onbekende key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Ongeldige key in ${issue2.origin}`;
          case "invalid_union":
            return "Ongeldige invoer";
          case "invalid_element":
            return `Ongeldige waarde in ${issue2.origin}`;
          default:
            return `Ongeldige invoer`;
        }
      };
    };
    function nl_default() {
      return {
        localeError: error31()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/no.js
    var error32 = () => {
      const Sizable = {
        string: { unit: "tegn", verb: "\xE5 ha" },
        file: { unit: "bytes", verb: "\xE5 ha" },
        array: { unit: "elementer", verb: "\xE5 inneholde" },
        set: { unit: "elementer", verb: "\xE5 inneholde" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "input",
        email: "e-postadresse",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO dato- og klokkeslett",
        date: "ISO-dato",
        time: "ISO-klokkeslett",
        duration: "ISO-varighet",
        ipv4: "IPv4-omr\xE5de",
        ipv6: "IPv6-omr\xE5de",
        cidrv4: "IPv4-spekter",
        cidrv6: "IPv6-spekter",
        base64: "base64-enkodet streng",
        base64url: "base64url-enkodet streng",
        json_string: "JSON-streng",
        e164: "E.164-nummer",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "tall",
        array: "liste"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Ugyldig input: forventet instanceof ${issue2.expected}, fikk ${received}`;
            }
            return `Ugyldig input: forventet ${expected}, fikk ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Ugyldig verdi: forventet ${stringifyPrimitive(issue2.values[0])}`;
            return `Ugyldig valg: forventet en av ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
            return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Ugyldig streng: m\xE5 starte med "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Ugyldig streng: m\xE5 ende med "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Ugyldig streng: m\xE5 inneholde "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Ugyldig streng: m\xE5 matche m\xF8nsteret ${_issue.pattern}`;
            return `Ugyldig ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${issue2.divisor}`;
          case "unrecognized_keys":
            return `${issue2.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Ugyldig n\xF8kkel i ${issue2.origin}`;
          case "invalid_union":
            return "Ugyldig input";
          case "invalid_element":
            return `Ugyldig verdi i ${issue2.origin}`;
          default:
            return `Ugyldig input`;
        }
      };
    };
    function no_default() {
      return {
        localeError: error32()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ota.js
    var error33 = () => {
      const Sizable = {
        string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
        file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
        array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
        set: { unit: "unsur", verb: "olmal\u0131d\u0131r" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "giren",
        email: "epostag\xE2h",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO heng\xE2m\u0131",
        date: "ISO tarihi",
        time: "ISO zaman\u0131",
        duration: "ISO m\xFCddeti",
        ipv4: "IPv4 ni\u015F\xE2n\u0131",
        ipv6: "IPv6 ni\u015F\xE2n\u0131",
        cidrv4: "IPv4 menzili",
        cidrv6: "IPv6 menzili",
        base64: "base64-\u015Fifreli metin",
        base64url: "base64url-\u015Fifreli metin",
        json_string: "JSON metin",
        e164: "E.164 say\u0131s\u0131",
        jwt: "JWT",
        template_literal: "giren"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "numara",
        array: "saf",
        null: "gayb"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `F\xE2sit giren: umulan instanceof ${issue2.expected}, al\u0131nan ${received}`;
            }
            return `F\xE2sit giren: umulan ${expected}, al\u0131nan ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `F\xE2sit giren: umulan ${stringifyPrimitive(issue2.values[0])}`;
            return `F\xE2sit tercih: m\xFBteberler ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"} sahip olmal\u0131yd\u0131.`;
            return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} olmal\u0131yd\u0131.`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} ${sizing.unit} sahip olmal\u0131yd\u0131.`;
            }
            return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} olmal\u0131yd\u0131.`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `F\xE2sit metin: "${_issue.prefix}" ile ba\u015Flamal\u0131.`;
            if (_issue.format === "ends_with")
              return `F\xE2sit metin: "${_issue.suffix}" ile bitmeli.`;
            if (_issue.format === "includes")
              return `F\xE2sit metin: "${_issue.includes}" ihtiv\xE2 etmeli.`;
            if (_issue.format === "regex")
              return `F\xE2sit metin: ${_issue.pattern} nak\u015F\u0131na uymal\u0131.`;
            return `F\xE2sit ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `F\xE2sit say\u0131: ${issue2.divisor} kat\u0131 olmal\u0131yd\u0131.`;
          case "unrecognized_keys":
            return `Tan\u0131nmayan anahtar ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `${issue2.origin} i\xE7in tan\u0131nmayan anahtar var.`;
          case "invalid_union":
            return "Giren tan\u0131namad\u0131.";
          case "invalid_element":
            return `${issue2.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`;
          default:
            return `K\u0131ymet tan\u0131namad\u0131.`;
        }
      };
    };
    function ota_default() {
      return {
        localeError: error33()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ps.js
    var error34 = () => {
      const Sizable = {
        string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
        file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
        array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
        set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0648\u0631\u0648\u062F\u064A",
        email: "\u0628\u0631\u06CC\u069A\u0646\u0627\u0644\u06CC\u06A9",
        url: "\u06CC\u0648 \u0622\u0631 \u0627\u0644",
        emoji: "\u0627\u06CC\u0645\u0648\u062C\u064A",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\u0646\u06CC\u067C\u0647 \u0627\u0648 \u0648\u062E\u062A",
        date: "\u0646\u06D0\u067C\u0647",
        time: "\u0648\u062E\u062A",
        duration: "\u0645\u0648\u062F\u0647",
        ipv4: "\u062F IPv4 \u067E\u062A\u0647",
        ipv6: "\u062F IPv6 \u067E\u062A\u0647",
        cidrv4: "\u062F IPv4 \u0633\u0627\u062D\u0647",
        cidrv6: "\u062F IPv6 \u0633\u0627\u062D\u0647",
        base64: "base64-encoded \u0645\u062A\u0646",
        base64url: "base64url-encoded \u0645\u062A\u0646",
        json_string: "JSON \u0645\u062A\u0646",
        e164: "\u062F E.164 \u0634\u0645\u06D0\u0631\u0647",
        jwt: "JWT",
        template_literal: "\u0648\u0631\u0648\u062F\u064A"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0639\u062F\u062F",
        array: "\u0627\u0631\u06D0"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F instanceof ${issue2.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${received} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
            }
            return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${received} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
          }
          case "invalid_value":
            if (issue2.values.length === 1) {
              return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(issue2.values[0])} \u0648\u0627\u06CC`;
            }
            return `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(issue2.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`;
            }
            return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0648\u064A`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0648\u0644\u0631\u064A`;
            }
            return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0648\u064A`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`;
            }
            if (_issue.format === "ends_with") {
              return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`;
            }
            if (_issue.format === "includes") {
              return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${_issue.includes}" \u0648\u0644\u0631\u064A`;
            }
            if (_issue.format === "regex") {
              return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${_issue.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`;
            }
            return `${FormatDictionary[_issue.format] ?? issue2.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
          }
          case "not_multiple_of":
            return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${issue2.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`;
          case "unrecognized_keys":
            return `\u0646\u0627\u0633\u0645 ${issue2.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
          case "invalid_union":
            return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
          case "invalid_element":
            return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
          default:
            return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
        }
      };
    };
    function ps_default() {
      return {
        localeError: error34()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/pl.js
    var error35 = () => {
      const Sizable = {
        string: { unit: "znak\xF3w", verb: "mie\u0107" },
        file: { unit: "bajt\xF3w", verb: "mie\u0107" },
        array: { unit: "element\xF3w", verb: "mie\u0107" },
        set: { unit: "element\xF3w", verb: "mie\u0107" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "wyra\u017Cenie",
        email: "adres email",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "data i godzina w formacie ISO",
        date: "data w formacie ISO",
        time: "godzina w formacie ISO",
        duration: "czas trwania ISO",
        ipv4: "adres IPv4",
        ipv6: "adres IPv6",
        cidrv4: "zakres IPv4",
        cidrv6: "zakres IPv6",
        base64: "ci\u0105g znak\xF3w zakodowany w formacie base64",
        base64url: "ci\u0105g znak\xF3w zakodowany w formacie base64url",
        json_string: "ci\u0105g znak\xF3w w formacie JSON",
        e164: "liczba E.164",
        jwt: "JWT",
        template_literal: "wej\u015Bcie"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "liczba",
        array: "tablica"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano instanceof ${issue2.expected}, otrzymano ${received}`;
            }
            return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${expected}, otrzymano ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(issue2.values[0])}`;
            return `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element\xF3w"}`;
            }
            return `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "element\xF3w"}`;
            }
            return `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${_issue.pattern}`;
            return `Nieprawid\u0142ow(y/a/e) ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Nierozpoznane klucze${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Nieprawid\u0142owy klucz w ${issue2.origin}`;
          case "invalid_union":
            return "Nieprawid\u0142owe dane wej\u015Bciowe";
          case "invalid_element":
            return `Nieprawid\u0142owa warto\u015B\u0107 w ${issue2.origin}`;
          default:
            return `Nieprawid\u0142owe dane wej\u015Bciowe`;
        }
      };
    };
    function pl_default() {
      return {
        localeError: error35()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/pt.js
    var error36 = () => {
      const Sizable = {
        string: { unit: "caracteres", verb: "ter" },
        file: { unit: "bytes", verb: "ter" },
        array: { unit: "itens", verb: "ter" },
        set: { unit: "itens", verb: "ter" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "padr\xE3o",
        email: "endere\xE7o de e-mail",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "data e hora ISO",
        date: "data ISO",
        time: "hora ISO",
        duration: "dura\xE7\xE3o ISO",
        ipv4: "endere\xE7o IPv4",
        ipv6: "endere\xE7o IPv6",
        cidrv4: "faixa de IPv4",
        cidrv6: "faixa de IPv6",
        base64: "texto codificado em base64",
        base64url: "URL codificada em base64",
        json_string: "texto JSON",
        e164: "n\xFAmero E.164",
        jwt: "JWT",
        template_literal: "entrada"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "n\xFAmero",
        null: "nulo"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Tipo inv\xE1lido: esperado instanceof ${issue2.expected}, recebido ${received}`;
            }
            return `Tipo inv\xE1lido: esperado ${expected}, recebido ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Entrada inv\xE1lida: esperado ${stringifyPrimitive(issue2.values[0])}`;
            return `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Muito grande: esperado que ${issue2.origin ?? "valor"} tivesse ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
            return `Muito grande: esperado que ${issue2.origin ?? "valor"} fosse ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Muito pequeno: esperado que ${issue2.origin} tivesse ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Muito pequeno: esperado que ${issue2.origin} fosse ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Texto inv\xE1lido: deve come\xE7ar com "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Texto inv\xE1lido: deve terminar com "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Texto inv\xE1lido: deve incluir "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${_issue.pattern}`;
            return `${FormatDictionary[_issue.format] ?? issue2.format} inv\xE1lido`;
          }
          case "not_multiple_of":
            return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Chave${issue2.keys.length > 1 ? "s" : ""} desconhecida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Chave inv\xE1lida em ${issue2.origin}`;
          case "invalid_union":
            return "Entrada inv\xE1lida";
          case "invalid_element":
            return `Valor inv\xE1lido em ${issue2.origin}`;
          default:
            return `Campo inv\xE1lido`;
        }
      };
    };
    function pt_default() {
      return {
        localeError: error36()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ro.js
    var error37 = () => {
      const Sizable = {
        string: { unit: "caractere", verb: "s\u0103 aib\u0103" },
        file: { unit: "octe\u021Bi", verb: "s\u0103 aib\u0103" },
        array: { unit: "elemente", verb: "s\u0103 aib\u0103" },
        set: { unit: "elemente", verb: "s\u0103 aib\u0103" },
        map: { unit: "intr\u0103ri", verb: "s\u0103 aib\u0103" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "intrare",
        email: "adres\u0103 de email",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "dat\u0103 \u0219i or\u0103 ISO",
        date: "dat\u0103 ISO",
        time: "or\u0103 ISO",
        duration: "durat\u0103 ISO",
        ipv4: "adres\u0103 IPv4",
        ipv6: "adres\u0103 IPv6",
        mac: "adres\u0103 MAC",
        cidrv4: "interval IPv4",
        cidrv6: "interval IPv6",
        base64: "\u0219ir codat base64",
        base64url: "\u0219ir codat base64url",
        json_string: "\u0219ir JSON",
        e164: "num\u0103r E.164",
        jwt: "JWT",
        template_literal: "intrare"
      };
      const TypeDictionary = {
        nan: "NaN",
        string: "\u0219ir",
        number: "num\u0103r",
        boolean: "boolean",
        function: "func\u021Bie",
        array: "matrice",
        object: "obiect",
        undefined: "nedefinit",
        symbol: "simbol",
        bigint: "num\u0103r mare",
        void: "void",
        never: "never",
        map: "hart\u0103",
        set: "set"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            return `Intrare invalid\u0103: a\u0219teptat ${expected}, primit ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Intrare invalid\u0103: a\u0219teptat ${stringifyPrimitive(issue2.values[0])}`;
            return `Op\u021Biune invalid\u0103: a\u0219teptat una dintre ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Prea mare: a\u0219teptat ca ${issue2.origin ?? "valoarea"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemente"}`;
            return `Prea mare: a\u0219teptat ca ${issue2.origin ?? "valoarea"} s\u0103 fie ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Prea mic: a\u0219teptat ca ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Prea mic: a\u0219teptat ca ${issue2.origin} s\u0103 fie ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u0218ir invalid: trebuie s\u0103 \xEEnceap\u0103 cu "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `\u0218ir invalid: trebuie s\u0103 se termine cu "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u0218ir invalid: trebuie s\u0103 includ\u0103 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u0218ir invalid: trebuie s\u0103 se potriveasc\u0103 cu modelul ${_issue.pattern}`;
            return `Format invalid: ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Num\u0103r invalid: trebuie s\u0103 fie multiplu de ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Chei nerecunoscute: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Cheie invalid\u0103 \xEEn ${issue2.origin}`;
          case "invalid_union":
            return "Intrare invalid\u0103";
          case "invalid_element":
            return `Valoare invalid\u0103 \xEEn ${issue2.origin}`;
          default:
            return `Intrare invalid\u0103`;
        }
      };
    };
    function ro_default() {
      return {
        localeError: error37()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ru.js
    function getRussianPlural(count, one, few, many) {
      const absCount = Math.abs(count);
      const lastDigit = absCount % 10;
      const lastTwoDigits = absCount % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return many;
      }
      if (lastDigit === 1) {
        return one;
      }
      if (lastDigit >= 2 && lastDigit <= 4) {
        return few;
      }
      return many;
    }
    var error38 = () => {
      const Sizable = {
        string: {
          unit: {
            one: "\u0441\u0438\u043C\u0432\u043E\u043B",
            few: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
            many: "\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"
          },
          verb: "\u0438\u043C\u0435\u0442\u044C"
        },
        file: {
          unit: {
            one: "\u0431\u0430\u0439\u0442",
            few: "\u0431\u0430\u0439\u0442\u0430",
            many: "\u0431\u0430\u0439\u0442"
          },
          verb: "\u0438\u043C\u0435\u0442\u044C"
        },
        array: {
          unit: {
            one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
            few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
            many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
          },
          verb: "\u0438\u043C\u0435\u0442\u044C"
        },
        set: {
          unit: {
            one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
            few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
            many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
          },
          verb: "\u0438\u043C\u0435\u0442\u044C"
        }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0432\u0432\u043E\u0434",
        email: "email \u0430\u0434\u0440\u0435\u0441",
        url: "URL",
        emoji: "\u044D\u043C\u043E\u0434\u0437\u0438",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F",
        date: "ISO \u0434\u0430\u0442\u0430",
        time: "ISO \u0432\u0440\u0435\u043C\u044F",
        duration: "ISO \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
        ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
        ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
        cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
        cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
        base64: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64",
        base64url: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64url",
        json_string: "JSON \u0441\u0442\u0440\u043E\u043A\u0430",
        e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
        jwt: "JWT",
        template_literal: "\u0432\u0432\u043E\u0434"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0447\u0438\u0441\u043B\u043E",
        array: "\u043C\u0430\u0441\u0441\u0438\u0432"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C instanceof ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${received}`;
            }
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(issue2.values[0])}`;
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              const maxValue = Number(issue2.maximum);
              const unit = getRussianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
              return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.maximum.toString()} ${unit}`;
            }
            return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              const minValue = Number(issue2.minimum);
              const unit = getRussianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
              return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.minimum.toString()} ${unit}`;
            }
            return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${issue2.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0438" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
          case "invalid_union":
            return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
          case "invalid_element":
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${issue2.origin}`;
          default:
            return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435`;
        }
      };
    };
    function ru_default() {
      return {
        localeError: error38()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/sl.js
    var error39 = () => {
      const Sizable = {
        string: { unit: "znakov", verb: "imeti" },
        file: { unit: "bajtov", verb: "imeti" },
        array: { unit: "elementov", verb: "imeti" },
        set: { unit: "elementov", verb: "imeti" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "vnos",
        email: "e-po\u0161tni naslov",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO datum in \u010Das",
        date: "ISO datum",
        time: "ISO \u010Das",
        duration: "ISO trajanje",
        ipv4: "IPv4 naslov",
        ipv6: "IPv6 naslov",
        cidrv4: "obseg IPv4",
        cidrv6: "obseg IPv6",
        base64: "base64 kodiran niz",
        base64url: "base64url kodiran niz",
        json_string: "JSON niz",
        e164: "E.164 \u0161tevilka",
        jwt: "JWT",
        template_literal: "vnos"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0161tevilo",
        array: "tabela"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Neveljaven vnos: pri\u010Dakovano instanceof ${issue2.expected}, prejeto ${received}`;
            }
            return `Neveljaven vnos: pri\u010Dakovano ${expected}, prejeto ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(issue2.values[0])}`;
            return `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} imelo ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementov"}`;
            return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} imelo ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Neveljaven niz: mora se za\u010Deti z "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Neveljaven niz: mora se kon\u010Dati z "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Neveljaven niz: mora vsebovati "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Neveljaven niz: mora ustrezati vzorcu ${_issue.pattern}`;
            return `Neveljaven ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Neprepoznan${issue2.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Neveljaven klju\u010D v ${issue2.origin}`;
          case "invalid_union":
            return "Neveljaven vnos";
          case "invalid_element":
            return `Neveljavna vrednost v ${issue2.origin}`;
          default:
            return "Neveljaven vnos";
        }
      };
    };
    function sl_default() {
      return {
        localeError: error39()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/sv.js
    var error40 = () => {
      const Sizable = {
        string: { unit: "tecken", verb: "att ha" },
        file: { unit: "bytes", verb: "att ha" },
        array: { unit: "objekt", verb: "att inneh\xE5lla" },
        set: { unit: "objekt", verb: "att inneh\xE5lla" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "regulj\xE4rt uttryck",
        email: "e-postadress",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO-datum och tid",
        date: "ISO-datum",
        time: "ISO-tid",
        duration: "ISO-varaktighet",
        ipv4: "IPv4-intervall",
        ipv6: "IPv6-intervall",
        cidrv4: "IPv4-spektrum",
        cidrv6: "IPv6-spektrum",
        base64: "base64-kodad str\xE4ng",
        base64url: "base64url-kodad str\xE4ng",
        json_string: "JSON-str\xE4ng",
        e164: "E.164-nummer",
        jwt: "JWT",
        template_literal: "mall-literal"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "antal",
        array: "lista"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Ogiltig inmatning: f\xF6rv\xE4ntat instanceof ${issue2.expected}, fick ${received}`;
            }
            return `Ogiltig inmatning: f\xF6rv\xE4ntat ${expected}, fick ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(issue2.values[0])}`;
            return `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `F\xF6r stor(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
            }
            return `F\xF6r stor(t): f\xF6rv\xE4ntat ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `Ogiltig str\xE4ng: m\xE5ste sluta med "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${_issue.pattern}"`;
            return `Ogiltig(t) ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Ogiltigt tal: m\xE5ste vara en multipel av ${issue2.divisor}`;
          case "unrecognized_keys":
            return `${issue2.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Ogiltig nyckel i ${issue2.origin ?? "v\xE4rdet"}`;
          case "invalid_union":
            return "Ogiltig input";
          case "invalid_element":
            return `Ogiltigt v\xE4rde i ${issue2.origin ?? "v\xE4rdet"}`;
          default:
            return `Ogiltig input`;
        }
      };
    };
    function sv_default() {
      return {
        localeError: error40()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ta.js
    var error41 = () => {
      const Sizable = {
        string: { unit: "\u0B8E\u0BB4\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
        file: { unit: "\u0BAA\u0BC8\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
        array: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
        set: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1",
        email: "\u0BAE\u0BBF\u0BA9\u0BCD\u0BA9\u0B9E\u0BCD\u0B9A\u0BB2\u0BCD \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u0BA4\u0BC7\u0BA4\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
        date: "ISO \u0BA4\u0BC7\u0BA4\u0BBF",
        time: "ISO \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
        duration: "ISO \u0B95\u0BBE\u0BB2 \u0B85\u0BB3\u0BB5\u0BC1",
        ipv4: "IPv4 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
        ipv6: "IPv6 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
        cidrv4: "IPv4 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
        cidrv6: "IPv6 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
        base64: "base64-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
        base64url: "base64url-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
        json_string: "JSON \u0B9A\u0BB0\u0BAE\u0BCD",
        e164: "E.164 \u0B8E\u0BA3\u0BCD",
        jwt: "JWT",
        template_literal: "input"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0B8E\u0BA3\u0BCD",
        array: "\u0B85\u0BA3\u0BBF",
        null: "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 instanceof ${issue2.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${received}`;
            }
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(issue2.values[0])}`;
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(issue2.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
            }
            return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
            }
            return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
            if (_issue.format === "ends_with")
              return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
            if (_issue.format === "includes")
              return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
            if (_issue.format === "regex")
              return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${_issue.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${issue2.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
          case "unrecognized_keys":
            return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${issue2.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`;
          case "invalid_union":
            return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
          case "invalid_element":
            return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`;
          default:
            return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1`;
        }
      };
    };
    function ta_default() {
      return {
        localeError: error41()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/th.js
    var error42 = () => {
      const Sizable = {
        string: { unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
        file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
        array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
        set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
        email: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E35\u0E40\u0E21\u0E25",
        url: "URL",
        emoji: "\u0E2D\u0E34\u0E42\u0E21\u0E08\u0E34",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
        date: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A ISO",
        time: "\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
        duration: "\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
        ipv4: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv4",
        ipv6: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv6",
        cidrv4: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv4",
        cidrv6: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv6",
        base64: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64",
        base64url: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A URL",
        json_string: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A JSON",
        e164: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 (E.164)",
        jwt: "\u0E42\u0E17\u0E40\u0E04\u0E19 JWT",
        template_literal: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02",
        array: "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)",
        null: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 instanceof ${issue2.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${received}`;
            }
            return `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(issue2.values[0])}`;
            return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19" : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`;
            return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22" : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${_issue.prefix}"`;
            }
            if (_issue.format === "ends_with")
              return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${_issue.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`;
            if (_issue.format === "regex")
              return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${_issue.pattern}`;
            return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${issue2.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`;
          case "unrecognized_keys":
            return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
          case "invalid_union":
            return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49";
          case "invalid_element":
            return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
          default:
            return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07`;
        }
      };
    };
    function th_default() {
      return {
        localeError: error42()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/tr.js
    var error43 = () => {
      const Sizable = {
        string: { unit: "karakter", verb: "olmal\u0131" },
        file: { unit: "bayt", verb: "olmal\u0131" },
        array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
        set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "girdi",
        email: "e-posta adresi",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO tarih ve saat",
        date: "ISO tarih",
        time: "ISO saat",
        duration: "ISO s\xFCre",
        ipv4: "IPv4 adresi",
        ipv6: "IPv6 adresi",
        cidrv4: "IPv4 aral\u0131\u011F\u0131",
        cidrv6: "IPv6 aral\u0131\u011F\u0131",
        base64: "base64 ile \u015Fifrelenmi\u015F metin",
        base64url: "base64url ile \u015Fifrelenmi\u015F metin",
        json_string: "JSON dizesi",
        e164: "E.164 say\u0131s\u0131",
        jwt: "JWT",
        template_literal: "\u015Eablon dizesi"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Ge\xE7ersiz de\u011Fer: beklenen instanceof ${issue2.expected}, al\u0131nan ${received}`;
            }
            return `Ge\xE7ersiz de\u011Fer: beklenen ${expected}, al\u0131nan ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(issue2.values[0])}`;
            return `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xF6\u011Fe"}`;
            return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Ge\xE7ersiz metin: "${_issue.prefix}" ile ba\u015Flamal\u0131`;
            if (_issue.format === "ends_with")
              return `Ge\xE7ersiz metin: "${_issue.suffix}" ile bitmeli`;
            if (_issue.format === "includes")
              return `Ge\xE7ersiz metin: "${_issue.includes}" i\xE7ermeli`;
            if (_issue.format === "regex")
              return `Ge\xE7ersiz metin: ${_issue.pattern} desenine uymal\u0131`;
            return `Ge\xE7ersiz ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Ge\xE7ersiz say\u0131: ${issue2.divisor} ile tam b\xF6l\xFCnebilmeli`;
          case "unrecognized_keys":
            return `Tan\u0131nmayan anahtar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `${issue2.origin} i\xE7inde ge\xE7ersiz anahtar`;
          case "invalid_union":
            return "Ge\xE7ersiz de\u011Fer";
          case "invalid_element":
            return `${issue2.origin} i\xE7inde ge\xE7ersiz de\u011Fer`;
          default:
            return `Ge\xE7ersiz de\u011Fer`;
        }
      };
    };
    function tr_default() {
      return {
        localeError: error43()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/uk.js
    var error44 = () => {
      const Sizable = {
        string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
        file: { unit: "\u0431\u0430\u0439\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
        array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
        set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
        email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u043F\u043E\u0448\u0442\u0438",
        url: "URL",
        emoji: "\u0435\u043C\u043E\u0434\u0437\u0456",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\u0434\u0430\u0442\u0430 \u0442\u0430 \u0447\u0430\u0441 ISO",
        date: "\u0434\u0430\u0442\u0430 ISO",
        time: "\u0447\u0430\u0441 ISO",
        duration: "\u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C ISO",
        ipv4: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv4",
        ipv6: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv6",
        cidrv4: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv4",
        cidrv6: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv6",
        base64: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64",
        base64url: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64url",
        json_string: "\u0440\u044F\u0434\u043E\u043A JSON",
        e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
        jwt: "JWT",
        template_literal: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0447\u0438\u0441\u043B\u043E",
        array: "\u043C\u0430\u0441\u0438\u0432"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F instanceof ${issue2.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${received}`;
            }
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`;
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} \u0431\u0443\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${issue2.divisor}`;
          case "unrecognized_keys":
            return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0456" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
          case "invalid_union":
            return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
          case "invalid_element":
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${issue2.origin}`;
          default:
            return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456`;
        }
      };
    };
    function uk_default() {
      return {
        localeError: error44()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ua.js
    function ua_default() {
      return uk_default();
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/ur.js
    var error45 = () => {
      const Sizable = {
        string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
        file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
        array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
        set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0627\u0646 \u067E\u0679",
        email: "\u0627\u06CC \u0645\u06CC\u0644 \u0627\u06CC\u0688\u0631\u06CC\u0633",
        url: "\u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644",
        emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
        uuid: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
        uuidv4: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 4",
        uuidv6: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 6",
        nanoid: "\u0646\u06CC\u0646\u0648 \u0622\u0626\u06CC \u0688\u06CC",
        guid: "\u062C\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
        cuid: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
        cuid2: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC 2",
        ulid: "\u06CC\u0648 \u0627\u06CC\u0644 \u0622\u0626\u06CC \u0688\u06CC",
        xid: "\u0627\u06CC\u06A9\u0633 \u0622\u0626\u06CC \u0688\u06CC",
        ksuid: "\u06A9\u06D2 \u0627\u06CC\u0633 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
        datetime: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0688\u06CC\u0679 \u0679\u0627\u0626\u0645",
        date: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u062A\u0627\u0631\u06CC\u062E",
        time: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0648\u0642\u062A",
        duration: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0645\u062F\u062A",
        ipv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0627\u06CC\u0688\u0631\u06CC\u0633",
        ipv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0627\u06CC\u0688\u0631\u06CC\u0633",
        cidrv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0631\u06CC\u0646\u062C",
        cidrv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0631\u06CC\u0646\u062C",
        base64: "\u0628\u06CC\u0633 64 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
        base64url: "\u0628\u06CC\u0633 64 \u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
        json_string: "\u062C\u06D2 \u0627\u06CC\u0633 \u0627\u0648 \u0627\u06CC\u0646 \u0633\u0679\u0631\u0646\u06AF",
        e164: "\u0627\u06CC 164 \u0646\u0645\u0628\u0631",
        jwt: "\u062C\u06D2 \u0688\u0628\u0644\u06CC\u0648 \u0679\u06CC",
        template_literal: "\u0627\u0646 \u067E\u0679"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u0646\u0645\u0628\u0631",
        array: "\u0622\u0631\u06D2",
        null: "\u0646\u0644"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: instanceof ${issue2.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${received} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
            }
            return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${received} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(issue2.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
            return `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(issue2.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
            return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${adj}${issue2.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u06D2 ${adj}${issue2.minimum.toString()} ${sizing.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
            }
            return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u0627 ${adj}${issue2.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
            }
            if (_issue.format === "ends_with")
              return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
            if (_issue.format === "includes")
              return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
            if (_issue.format === "regex")
              return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${_issue.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
            return `\u063A\u0644\u0637 ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${issue2.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
          case "unrecognized_keys":
            return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${issue2.keys.length > 1 ? "\u0632" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
          case "invalid_key":
            return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`;
          case "invalid_union":
            return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
          case "invalid_element":
            return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`;
          default:
            return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679`;
        }
      };
    };
    function ur_default() {
      return {
        localeError: error45()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/uz.js
    var error46 = () => {
      const Sizable = {
        string: { unit: "belgi", verb: "bo\u2018lishi kerak" },
        file: { unit: "bayt", verb: "bo\u2018lishi kerak" },
        array: { unit: "element", verb: "bo\u2018lishi kerak" },
        set: { unit: "element", verb: "bo\u2018lishi kerak" },
        map: { unit: "yozuv", verb: "bo\u2018lishi kerak" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "kirish",
        email: "elektron pochta manzili",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO sana va vaqti",
        date: "ISO sana",
        time: "ISO vaqt",
        duration: "ISO davomiylik",
        ipv4: "IPv4 manzil",
        ipv6: "IPv6 manzil",
        mac: "MAC manzil",
        cidrv4: "IPv4 diapazon",
        cidrv6: "IPv6 diapazon",
        base64: "base64 kodlangan satr",
        base64url: "base64url kodlangan satr",
        json_string: "JSON satr",
        e164: "E.164 raqam",
        jwt: "JWT",
        template_literal: "kirish"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "raqam",
        array: "massiv"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `Noto\u2018g\u2018ri kirish: kutilgan instanceof ${issue2.expected}, qabul qilingan ${received}`;
            }
            return `Noto\u2018g\u2018ri kirish: kutilgan ${expected}, qabul qilingan ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `Noto\u2018g\u2018ri kirish: kutilgan ${stringifyPrimitive(issue2.values[0])}`;
            return `Noto\u2018g\u2018ri variant: quyidagilardan biri kutilgan ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Juda katta: kutilgan ${issue2.origin ?? "qiymat"} ${adj}${issue2.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
            return `Juda katta: kutilgan ${issue2.origin ?? "qiymat"} ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Juda kichik: kutilgan ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
            }
            return `Juda kichik: kutilgan ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Noto\u2018g\u2018ri satr: "${_issue.prefix}" bilan boshlanishi kerak`;
            if (_issue.format === "ends_with")
              return `Noto\u2018g\u2018ri satr: "${_issue.suffix}" bilan tugashi kerak`;
            if (_issue.format === "includes")
              return `Noto\u2018g\u2018ri satr: "${_issue.includes}" ni o\u2018z ichiga olishi kerak`;
            if (_issue.format === "regex")
              return `Noto\u2018g\u2018ri satr: ${_issue.pattern} shabloniga mos kelishi kerak`;
            return `Noto\u2018g\u2018ri ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `Noto\u2018g\u2018ri raqam: ${issue2.divisor} ning karralisi bo\u2018lishi kerak`;
          case "unrecognized_keys":
            return `Noma\u2019lum kalit${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `${issue2.origin} dagi kalit noto\u2018g\u2018ri`;
          case "invalid_union":
            return "Noto\u2018g\u2018ri kirish";
          case "invalid_element":
            return `${issue2.origin} da noto\u2018g\u2018ri qiymat`;
          default:
            return `Noto\u2018g\u2018ri kirish`;
        }
      };
    };
    function uz_default() {
      return {
        localeError: error46()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/vi.js
    var error47 = () => {
      const Sizable = {
        string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
        file: { unit: "byte", verb: "c\xF3" },
        array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
        set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u0111\u1EA7u v\xE0o",
        email: "\u0111\u1ECBa ch\u1EC9 email",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ng\xE0y gi\u1EDD ISO",
        date: "ng\xE0y ISO",
        time: "gi\u1EDD ISO",
        duration: "kho\u1EA3ng th\u1EDDi gian ISO",
        ipv4: "\u0111\u1ECBa ch\u1EC9 IPv4",
        ipv6: "\u0111\u1ECBa ch\u1EC9 IPv6",
        cidrv4: "d\u1EA3i IPv4",
        cidrv6: "d\u1EA3i IPv6",
        base64: "chu\u1ED7i m\xE3 h\xF3a base64",
        base64url: "chu\u1ED7i m\xE3 h\xF3a base64url",
        json_string: "chu\u1ED7i JSON",
        e164: "s\u1ED1 E.164",
        jwt: "JWT",
        template_literal: "\u0111\u1EA7u v\xE0o"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "s\u1ED1",
        array: "m\u1EA3ng"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i instanceof ${issue2.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${received}`;
            }
            return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(issue2.values[0])}`;
            return `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "ph\u1EA7n t\u1EED"}`;
            return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${_issue.pattern}`;
            return `${FormatDictionary[_issue.format] ?? issue2.format} kh\xF4ng h\u1EE3p l\u1EC7`;
          }
          case "not_multiple_of":
            return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${issue2.divisor}`;
          case "unrecognized_keys":
            return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
          case "invalid_union":
            return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
          case "invalid_element":
            return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
          default:
            return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7`;
        }
      };
    };
    function vi_default() {
      return {
        localeError: error47()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/zh-CN.js
    var error48 = () => {
      const Sizable = {
        string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
        file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
        array: { unit: "\u9879", verb: "\u5305\u542B" },
        set: { unit: "\u9879", verb: "\u5305\u542B" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u8F93\u5165",
        email: "\u7535\u5B50\u90AE\u4EF6",
        url: "URL",
        emoji: "\u8868\u60C5\u7B26\u53F7",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO\u65E5\u671F\u65F6\u95F4",
        date: "ISO\u65E5\u671F",
        time: "ISO\u65F6\u95F4",
        duration: "ISO\u65F6\u957F",
        ipv4: "IPv4\u5730\u5740",
        ipv6: "IPv6\u5730\u5740",
        cidrv4: "IPv4\u7F51\u6BB5",
        cidrv6: "IPv6\u7F51\u6BB5",
        base64: "base64\u7F16\u7801\u5B57\u7B26\u4E32",
        base64url: "base64url\u7F16\u7801\u5B57\u7B26\u4E32",
        json_string: "JSON\u5B57\u7B26\u4E32",
        e164: "E.164\u53F7\u7801",
        jwt: "JWT",
        template_literal: "\u8F93\u5165"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "\u6570\u5B57",
        array: "\u6570\u7EC4",
        null: "\u7A7A\u503C(null)"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B instanceof ${issue2.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${received}`;
            }
            return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(issue2.values[0])}`;
            return `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u4E2A\u5143\u7D20"}`;
            return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.prefix}" \u5F00\u5934`;
            if (_issue.format === "ends_with")
              return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.suffix}" \u7ED3\u5C3E`;
            if (_issue.format === "includes")
              return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${_issue.pattern}`;
            return `\u65E0\u6548${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${issue2.divisor} \u7684\u500D\u6570`;
          case "unrecognized_keys":
            return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `${issue2.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`;
          case "invalid_union":
            return "\u65E0\u6548\u8F93\u5165";
          case "invalid_element":
            return `${issue2.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`;
          default:
            return `\u65E0\u6548\u8F93\u5165`;
        }
      };
    };
    function zh_CN_default() {
      return {
        localeError: error48()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/zh-TW.js
    var error49 = () => {
      const Sizable = {
        string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
        file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
        array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
        set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u8F38\u5165",
        email: "\u90F5\u4EF6\u5730\u5740",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "ISO \u65E5\u671F\u6642\u9593",
        date: "ISO \u65E5\u671F",
        time: "ISO \u6642\u9593",
        duration: "ISO \u671F\u9593",
        ipv4: "IPv4 \u4F4D\u5740",
        ipv6: "IPv6 \u4F4D\u5740",
        cidrv4: "IPv4 \u7BC4\u570D",
        cidrv6: "IPv6 \u7BC4\u570D",
        base64: "base64 \u7DE8\u78BC\u5B57\u4E32",
        base64url: "base64url \u7DE8\u78BC\u5B57\u4E32",
        json_string: "JSON \u5B57\u4E32",
        e164: "E.164 \u6578\u503C",
        jwt: "JWT",
        template_literal: "\u8F38\u5165"
      };
      const TypeDictionary = {
        nan: "NaN"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA instanceof ${issue2.expected}\uFF0C\u4F46\u6536\u5230 ${received}`;
            }
            return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${expected}\uFF0C\u4F46\u6536\u5230 ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(issue2.values[0])}`;
            return `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u500B\u5143\u7D20"}`;
            return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing) {
              return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
            }
            return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with") {
              return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.prefix}" \u958B\u982D`;
            }
            if (_issue.format === "ends_with")
              return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.suffix}" \u7D50\u5C3E`;
            if (_issue.format === "includes")
              return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${_issue.pattern}`;
            return `\u7121\u6548\u7684 ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${issue2.divisor} \u7684\u500D\u6578`;
          case "unrecognized_keys":
            return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${issue2.keys.length > 1 ? "\u5011" : ""}\uFF1A${joinValues(issue2.keys, "\u3001")}`;
          case "invalid_key":
            return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`;
          case "invalid_union":
            return "\u7121\u6548\u7684\u8F38\u5165\u503C";
          case "invalid_element":
            return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`;
          default:
            return `\u7121\u6548\u7684\u8F38\u5165\u503C`;
        }
      };
    };
    function zh_TW_default() {
      return {
        localeError: error49()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/locales/yo.js
    var error50 = () => {
      const Sizable = {
        string: { unit: "\xE0mi", verb: "n\xED" },
        file: { unit: "bytes", verb: "n\xED" },
        array: { unit: "nkan", verb: "n\xED" },
        set: { unit: "nkan", verb: "n\xED" }
      };
      function getSizing(origin) {
        return Sizable[origin] ?? null;
      }
      const FormatDictionary = {
        regex: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
        email: "\xE0d\xEDr\u1EB9\u0301s\xEC \xECm\u1EB9\u0301l\xEC",
        url: "URL",
        emoji: "emoji",
        uuid: "UUID",
        uuidv4: "UUIDv4",
        uuidv6: "UUIDv6",
        nanoid: "nanoid",
        guid: "GUID",
        cuid: "cuid",
        cuid2: "cuid2",
        ulid: "ULID",
        xid: "XID",
        ksuid: "KSUID",
        datetime: "\xE0k\xF3k\xF2 ISO",
        date: "\u1ECDj\u1ECD\u0301 ISO",
        time: "\xE0k\xF3k\xF2 ISO",
        duration: "\xE0k\xF3k\xF2 t\xF3 p\xE9 ISO",
        ipv4: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv4",
        ipv6: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv6",
        cidrv4: "\xE0gb\xE8gb\xE8 IPv4",
        cidrv6: "\xE0gb\xE8gb\xE8 IPv6",
        base64: "\u1ECD\u0300r\u1ECD\u0300 t\xED a k\u1ECD\u0301 n\xED base64",
        base64url: "\u1ECD\u0300r\u1ECD\u0300 base64url",
        json_string: "\u1ECD\u0300r\u1ECD\u0300 JSON",
        e164: "n\u1ECD\u0301mb\xE0 E.164",
        jwt: "JWT",
        template_literal: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9"
      };
      const TypeDictionary = {
        nan: "NaN",
        number: "n\u1ECD\u0301mb\xE0",
        array: "akop\u1ECD"
      };
      return (issue2) => {
        switch (issue2.code) {
          case "invalid_type": {
            const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
            const receivedType = parsedType(issue2.input);
            const received = TypeDictionary[receivedType] ?? receivedType;
            if (/^[A-Z]/.test(issue2.expected)) {
              return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi instanceof ${issue2.expected}, \xE0m\u1ECD\u0300 a r\xED ${received}`;
            }
            return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${expected}, \xE0m\u1ECD\u0300 a r\xED ${received}`;
          }
          case "invalid_value":
            if (issue2.values.length === 1)
              return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(issue2.values[0])}`;
            return `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(issue2.values, "|")}`;
          case "too_big": {
            const adj = issue2.inclusive ? "<=" : "<";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin ?? "iye"} ${sizing.verb} ${adj}${issue2.maximum} ${sizing.unit}`;
            return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.maximum}`;
          }
          case "too_small": {
            const adj = issue2.inclusive ? ">=" : ">";
            const sizing = getSizing(issue2.origin);
            if (sizing)
              return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum} ${sizing.unit}`;
            return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.minimum}`;
          }
          case "invalid_format": {
            const _issue = issue2;
            if (_issue.format === "starts_with")
              return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${_issue.prefix}"`;
            if (_issue.format === "ends_with")
              return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${_issue.suffix}"`;
            if (_issue.format === "includes")
              return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${_issue.includes}"`;
            if (_issue.format === "regex")
              return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${_issue.pattern}`;
            return `A\u1E63\xEC\u1E63e: ${FormatDictionary[_issue.format] ?? issue2.format}`;
          }
          case "not_multiple_of":
            return `N\u1ECD\u0301mb\xE0 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 j\u1EB9\u0301 \xE8y\xE0 p\xEDp\xEDn ti ${issue2.divisor}`;
          case "unrecognized_keys":
            return `B\u1ECDt\xECn\xEC \xE0\xECm\u1ECD\u0300: ${joinValues(issue2.keys, ", ")}`;
          case "invalid_key":
            return `B\u1ECDt\xECn\xEC a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
          case "invalid_union":
            return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
          case "invalid_element":
            return `Iye a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
          default:
            return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
        }
      };
    };
    function yo_default() {
      return {
        localeError: error50()
      };
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
    var _a2;
    var $output = Symbol("ZodOutput");
    var $input = Symbol("ZodInput");
    var $ZodRegistry = class {
      constructor() {
        this._map = /* @__PURE__ */ new WeakMap();
        this._idmap = /* @__PURE__ */ new Map();
      }
      add(schema, ..._meta) {
        const meta3 = _meta[0];
        this._map.set(schema, meta3);
        if (meta3 && typeof meta3 === "object" && "id" in meta3) {
          this._idmap.set(meta3.id, schema);
        }
        return this;
      }
      clear() {
        this._map = /* @__PURE__ */ new WeakMap();
        this._idmap = /* @__PURE__ */ new Map();
        return this;
      }
      remove(schema) {
        const meta3 = this._map.get(schema);
        if (meta3 && typeof meta3 === "object" && "id" in meta3) {
          this._idmap.delete(meta3.id);
        }
        this._map.delete(schema);
        return this;
      }
      get(schema) {
        const p = schema._zod.parent;
        if (p) {
          const pm = { ...this.get(p) ?? {} };
          delete pm.id;
          const f = { ...pm, ...this._map.get(schema) };
          return Object.keys(f).length ? f : void 0;
        }
        return this._map.get(schema);
      }
      has(schema) {
        return this._map.has(schema);
      }
    };
    function registry() {
      return new $ZodRegistry();
    }
    (_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
    var globalRegistry = globalThis.__zod_globalRegistry;

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
    // @__NO_SIDE_EFFECTS__
    function _string(Class2, params) {
      return new Class2({
        type: "string",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedString(Class2, params) {
      return new Class2({
        type: "string",
        coerce: true,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _email(Class2, params) {
      return new Class2({
        type: "string",
        format: "email",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _guid(Class2, params) {
      return new Class2({
        type: "string",
        format: "guid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuid(Class2, params) {
      return new Class2({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuidv4(Class2, params) {
      return new Class2({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v4",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuidv6(Class2, params) {
      return new Class2({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v6",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _uuidv7(Class2, params) {
      return new Class2({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v7",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _url(Class2, params) {
      return new Class2({
        type: "string",
        format: "url",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _emoji2(Class2, params) {
      return new Class2({
        type: "string",
        format: "emoji",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _nanoid(Class2, params) {
      return new Class2({
        type: "string",
        format: "nanoid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _cuid(Class2, params) {
      return new Class2({
        type: "string",
        format: "cuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _cuid2(Class2, params) {
      return new Class2({
        type: "string",
        format: "cuid2",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _ulid(Class2, params) {
      return new Class2({
        type: "string",
        format: "ulid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _xid(Class2, params) {
      return new Class2({
        type: "string",
        format: "xid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _ksuid(Class2, params) {
      return new Class2({
        type: "string",
        format: "ksuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _ipv4(Class2, params) {
      return new Class2({
        type: "string",
        format: "ipv4",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _ipv6(Class2, params) {
      return new Class2({
        type: "string",
        format: "ipv6",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _mac(Class2, params) {
      return new Class2({
        type: "string",
        format: "mac",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _cidrv4(Class2, params) {
      return new Class2({
        type: "string",
        format: "cidrv4",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _cidrv6(Class2, params) {
      return new Class2({
        type: "string",
        format: "cidrv6",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _base64(Class2, params) {
      return new Class2({
        type: "string",
        format: "base64",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _base64url(Class2, params) {
      return new Class2({
        type: "string",
        format: "base64url",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _e164(Class2, params) {
      return new Class2({
        type: "string",
        format: "e164",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _jwt(Class2, params) {
      return new Class2({
        type: "string",
        format: "jwt",
        check: "string_format",
        abort: false,
        ...normalizeParams(params)
      });
    }
    var TimePrecision = {
      Any: null,
      Minute: -1,
      Second: 0,
      Millisecond: 3,
      Microsecond: 6
    };
    // @__NO_SIDE_EFFECTS__
    function _isoDateTime(Class2, params) {
      return new Class2({
        type: "string",
        format: "datetime",
        check: "string_format",
        offset: false,
        local: false,
        precision: null,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _isoDate(Class2, params) {
      return new Class2({
        type: "string",
        format: "date",
        check: "string_format",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _isoTime(Class2, params) {
      return new Class2({
        type: "string",
        format: "time",
        check: "string_format",
        precision: null,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _isoDuration(Class2, params) {
      return new Class2({
        type: "string",
        format: "duration",
        check: "string_format",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _number(Class2, params) {
      return new Class2({
        type: "number",
        checks: [],
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedNumber(Class2, params) {
      return new Class2({
        type: "number",
        coerce: true,
        checks: [],
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _int(Class2, params) {
      return new Class2({
        type: "number",
        check: "number_format",
        abort: false,
        format: "safeint",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _float32(Class2, params) {
      return new Class2({
        type: "number",
        check: "number_format",
        abort: false,
        format: "float32",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _float64(Class2, params) {
      return new Class2({
        type: "number",
        check: "number_format",
        abort: false,
        format: "float64",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _int32(Class2, params) {
      return new Class2({
        type: "number",
        check: "number_format",
        abort: false,
        format: "int32",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _uint32(Class2, params) {
      return new Class2({
        type: "number",
        check: "number_format",
        abort: false,
        format: "uint32",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _boolean(Class2, params) {
      return new Class2({
        type: "boolean",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedBoolean(Class2, params) {
      return new Class2({
        type: "boolean",
        coerce: true,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _bigint(Class2, params) {
      return new Class2({
        type: "bigint",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedBigint(Class2, params) {
      return new Class2({
        type: "bigint",
        coerce: true,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _int64(Class2, params) {
      return new Class2({
        type: "bigint",
        check: "bigint_format",
        abort: false,
        format: "int64",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _uint64(Class2, params) {
      return new Class2({
        type: "bigint",
        check: "bigint_format",
        abort: false,
        format: "uint64",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _symbol(Class2, params) {
      return new Class2({
        type: "symbol",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _undefined2(Class2, params) {
      return new Class2({
        type: "undefined",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _null2(Class2, params) {
      return new Class2({
        type: "null",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _any(Class2) {
      return new Class2({
        type: "any"
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _unknown(Class2) {
      return new Class2({
        type: "unknown"
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _never(Class2, params) {
      return new Class2({
        type: "never",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _void(Class2, params) {
      return new Class2({
        type: "void",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _date(Class2, params) {
      return new Class2({
        type: "date",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _coercedDate(Class2, params) {
      return new Class2({
        type: "date",
        coerce: true,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _nan(Class2, params) {
      return new Class2({
        type: "nan",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _lt(value, params) {
      return new $ZodCheckLessThan({
        check: "less_than",
        ...normalizeParams(params),
        value,
        inclusive: false
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _lte(value, params) {
      return new $ZodCheckLessThan({
        check: "less_than",
        ...normalizeParams(params),
        value,
        inclusive: true
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _gt(value, params) {
      return new $ZodCheckGreaterThan({
        check: "greater_than",
        ...normalizeParams(params),
        value,
        inclusive: false
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _gte(value, params) {
      return new $ZodCheckGreaterThan({
        check: "greater_than",
        ...normalizeParams(params),
        value,
        inclusive: true
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _positive(params) {
      return /* @__PURE__ */ _gt(0, params);
    }
    // @__NO_SIDE_EFFECTS__
    function _negative(params) {
      return /* @__PURE__ */ _lt(0, params);
    }
    // @__NO_SIDE_EFFECTS__
    function _nonpositive(params) {
      return /* @__PURE__ */ _lte(0, params);
    }
    // @__NO_SIDE_EFFECTS__
    function _nonnegative(params) {
      return /* @__PURE__ */ _gte(0, params);
    }
    // @__NO_SIDE_EFFECTS__
    function _multipleOf(value, params) {
      return new $ZodCheckMultipleOf({
        check: "multiple_of",
        ...normalizeParams(params),
        value
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _maxSize(maximum, params) {
      return new $ZodCheckMaxSize({
        check: "max_size",
        ...normalizeParams(params),
        maximum
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _minSize(minimum, params) {
      return new $ZodCheckMinSize({
        check: "min_size",
        ...normalizeParams(params),
        minimum
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _size(size, params) {
      return new $ZodCheckSizeEquals({
        check: "size_equals",
        ...normalizeParams(params),
        size
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _maxLength(maximum, params) {
      const ch = new $ZodCheckMaxLength({
        check: "max_length",
        ...normalizeParams(params),
        maximum
      });
      return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function _minLength(minimum, params) {
      return new $ZodCheckMinLength({
        check: "min_length",
        ...normalizeParams(params),
        minimum
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _length(length, params) {
      return new $ZodCheckLengthEquals({
        check: "length_equals",
        ...normalizeParams(params),
        length
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _regex(pattern, params) {
      return new $ZodCheckRegex({
        check: "string_format",
        format: "regex",
        ...normalizeParams(params),
        pattern
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _lowercase(params) {
      return new $ZodCheckLowerCase({
        check: "string_format",
        format: "lowercase",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _uppercase(params) {
      return new $ZodCheckUpperCase({
        check: "string_format",
        format: "uppercase",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _includes(includes, params) {
      return new $ZodCheckIncludes({
        check: "string_format",
        format: "includes",
        ...normalizeParams(params),
        includes
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _startsWith(prefix, params) {
      return new $ZodCheckStartsWith({
        check: "string_format",
        format: "starts_with",
        ...normalizeParams(params),
        prefix
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _endsWith(suffix, params) {
      return new $ZodCheckEndsWith({
        check: "string_format",
        format: "ends_with",
        ...normalizeParams(params),
        suffix
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _property(property, schema, params) {
      return new $ZodCheckProperty({
        check: "property",
        property,
        schema,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _mime(types, params) {
      return new $ZodCheckMimeType({
        check: "mime_type",
        mime: types,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _overwrite(tx) {
      return new $ZodCheckOverwrite({
        check: "overwrite",
        tx
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _normalize(form) {
      return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
    }
    // @__NO_SIDE_EFFECTS__
    function _trim() {
      return /* @__PURE__ */ _overwrite((input) => input.trim());
    }
    // @__NO_SIDE_EFFECTS__
    function _toLowerCase() {
      return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
    }
    // @__NO_SIDE_EFFECTS__
    function _toUpperCase() {
      return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
    }
    // @__NO_SIDE_EFFECTS__
    function _slugify() {
      return /* @__PURE__ */ _overwrite((input) => slugify(input));
    }
    // @__NO_SIDE_EFFECTS__
    function _array(Class2, element, params) {
      return new Class2({
        type: "array",
        element,
        // get element() {
        //   return element;
        // },
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _union(Class2, options, params) {
      return new Class2({
        type: "union",
        options,
        ...normalizeParams(params)
      });
    }
    function _xor(Class2, options, params) {
      return new Class2({
        type: "union",
        options,
        inclusive: false,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _discriminatedUnion(Class2, discriminator, options, params) {
      return new Class2({
        type: "union",
        options,
        discriminator,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _intersection(Class2, left, right) {
      return new Class2({
        type: "intersection",
        left,
        right
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _tuple(Class2, items, _paramsOrRest, _params) {
      const hasRest = _paramsOrRest instanceof $ZodType;
      const params = hasRest ? _params : _paramsOrRest;
      const rest = hasRest ? _paramsOrRest : null;
      return new Class2({
        type: "tuple",
        items,
        rest,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _record(Class2, keyType, valueType, params) {
      return new Class2({
        type: "record",
        keyType,
        valueType,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _map(Class2, keyType, valueType, params) {
      return new Class2({
        type: "map",
        keyType,
        valueType,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _set(Class2, valueType, params) {
      return new Class2({
        type: "set",
        valueType,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _enum(Class2, values, params) {
      const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
      return new Class2({
        type: "enum",
        entries,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _nativeEnum(Class2, entries, params) {
      return new Class2({
        type: "enum",
        entries,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _literal(Class2, value, params) {
      return new Class2({
        type: "literal",
        values: Array.isArray(value) ? value : [value],
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _file(Class2, params) {
      return new Class2({
        type: "file",
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _transform(Class2, fn) {
      return new Class2({
        type: "transform",
        transform: fn
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _optional(Class2, innerType) {
      return new Class2({
        type: "optional",
        innerType
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _nullable(Class2, innerType) {
      return new Class2({
        type: "nullable",
        innerType
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _default(Class2, innerType, defaultValue) {
      return new Class2({
        type: "default",
        innerType,
        get defaultValue() {
          return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
        }
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _nonoptional(Class2, innerType, params) {
      return new Class2({
        type: "nonoptional",
        innerType,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _success(Class2, innerType) {
      return new Class2({
        type: "success",
        innerType
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _catch(Class2, innerType, catchValue) {
      return new Class2({
        type: "catch",
        innerType,
        catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _pipe(Class2, in_, out) {
      return new Class2({
        type: "pipe",
        in: in_,
        out
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _readonly(Class2, innerType) {
      return new Class2({
        type: "readonly",
        innerType
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _templateLiteral(Class2, parts, params) {
      return new Class2({
        type: "template_literal",
        parts,
        ...normalizeParams(params)
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _lazy(Class2, getter) {
      return new Class2({
        type: "lazy",
        getter
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _promise(Class2, innerType) {
      return new Class2({
        type: "promise",
        innerType
      });
    }
    // @__NO_SIDE_EFFECTS__
    function _custom(Class2, fn, _params) {
      const norm = normalizeParams(_params);
      norm.abort ?? (norm.abort = true);
      const schema = new Class2({
        type: "custom",
        check: "custom",
        fn,
        ...norm
      });
      return schema;
    }
    // @__NO_SIDE_EFFECTS__
    function _refine(Class2, fn, _params) {
      const schema = new Class2({
        type: "custom",
        check: "custom",
        fn,
        ...normalizeParams(_params)
      });
      return schema;
    }
    // @__NO_SIDE_EFFECTS__
    function _superRefine(fn, params) {
      const ch = /* @__PURE__ */ _check((payload) => {
        payload.addIssue = (issue2) => {
          if (typeof issue2 === "string") {
            payload.issues.push(issue(issue2, payload.value, ch._zod.def));
          } else {
            const _issue = issue2;
            if (_issue.fatal)
              _issue.continue = false;
            _issue.code ?? (_issue.code = "custom");
            _issue.input ?? (_issue.input = payload.value);
            _issue.inst ?? (_issue.inst = ch);
            _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
            payload.issues.push(issue(_issue));
          }
        };
        return fn(payload.value, payload);
      }, params);
      return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function _check(fn, params) {
      const ch = new $ZodCheck({
        check: "custom",
        ...normalizeParams(params)
      });
      ch._zod.check = fn;
      return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function describe(description) {
      const ch = new $ZodCheck({ check: "describe" });
      ch._zod.onattach = [
        (inst) => {
          const existing = globalRegistry.get(inst) ?? {};
          globalRegistry.add(inst, { ...existing, description });
        }
      ];
      ch._zod.check = () => {
      };
      return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function meta(metadata) {
      const ch = new $ZodCheck({ check: "meta" });
      ch._zod.onattach = [
        (inst) => {
          const existing = globalRegistry.get(inst) ?? {};
          globalRegistry.add(inst, { ...existing, ...metadata });
        }
      ];
      ch._zod.check = () => {
      };
      return ch;
    }
    // @__NO_SIDE_EFFECTS__
    function _stringbool(Classes, _params) {
      const params = normalizeParams(_params);
      let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
      let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
      if (params.case !== "sensitive") {
        truthyArray = truthyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
        falsyArray = falsyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
      }
      const truthySet = new Set(truthyArray);
      const falsySet = new Set(falsyArray);
      const _Codec = Classes.Codec ?? $ZodCodec;
      const _Boolean = Classes.Boolean ?? $ZodBoolean;
      const _String = Classes.String ?? $ZodString;
      const stringSchema = new _String({ type: "string", error: params.error });
      const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
      const codec2 = new _Codec({
        type: "pipe",
        in: stringSchema,
        out: booleanSchema,
        transform: ((input, payload) => {
          let data = input;
          if (params.case !== "sensitive")
            data = data.toLowerCase();
          if (truthySet.has(data)) {
            return true;
          } else if (falsySet.has(data)) {
            return false;
          } else {
            payload.issues.push({
              code: "invalid_value",
              expected: "stringbool",
              values: [...truthySet, ...falsySet],
              input: payload.value,
              inst: codec2,
              continue: false
            });
            return {};
          }
        }),
        reverseTransform: ((input, _payload) => {
          if (input === true) {
            return truthyArray[0] || "true";
          } else {
            return falsyArray[0] || "false";
          }
        }),
        error: params.error
      });
      return codec2;
    }
    // @__NO_SIDE_EFFECTS__
    function _stringFormat(Class2, format, fnOrRegex, _params = {}) {
      const params = normalizeParams(_params);
      const def = {
        ...normalizeParams(_params),
        check: "string_format",
        type: "string",
        format,
        fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
        ...params
      };
      if (fnOrRegex instanceof RegExp) {
        def.pattern = fnOrRegex;
      }
      const inst = new Class2(def);
      return inst;
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
    function initializeContext(params) {
      let target = params?.target ?? "draft-2020-12";
      if (target === "draft-4")
        target = "draft-04";
      if (target === "draft-7")
        target = "draft-07";
      return {
        processors: params.processors ?? {},
        metadataRegistry: params?.metadata ?? globalRegistry,
        target,
        unrepresentable: params?.unrepresentable ?? "throw",
        override: params?.override ?? (() => {
        }),
        io: params?.io ?? "output",
        counter: 0,
        seen: /* @__PURE__ */ new Map(),
        cycles: params?.cycles ?? "ref",
        reused: params?.reused ?? "inline",
        external: params?.external ?? void 0
      };
    }
    function process(schema, ctx, _params = { path: [], schemaPath: [] }) {
      var _a3;
      const def = schema._zod.def;
      const seen = ctx.seen.get(schema);
      if (seen) {
        seen.count++;
        const isCycle = _params.schemaPath.includes(schema);
        if (isCycle) {
          seen.cycle = _params.path;
        }
        return seen.schema;
      }
      const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
      ctx.seen.set(schema, result);
      const overrideSchema = schema._zod.toJSONSchema?.();
      if (overrideSchema) {
        result.schema = overrideSchema;
      } else {
        const params = {
          ..._params,
          schemaPath: [..._params.schemaPath, schema],
          path: _params.path
        };
        if (schema._zod.processJSONSchema) {
          schema._zod.processJSONSchema(ctx, result.schema, params);
        } else {
          const _json = result.schema;
          const processor = ctx.processors[def.type];
          if (!processor) {
            throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
          }
          processor(schema, ctx, _json, params);
        }
        const parent = schema._zod.parent;
        if (parent) {
          if (!result.ref)
            result.ref = parent;
          process(parent, ctx, params);
          ctx.seen.get(parent).isParent = true;
        }
      }
      const meta3 = ctx.metadataRegistry.get(schema);
      if (meta3)
        Object.assign(result.schema, meta3);
      if (ctx.io === "input" && isTransforming(schema)) {
        delete result.schema.examples;
        delete result.schema.default;
      }
      if (ctx.io === "input" && "_prefault" in result.schema)
        (_a3 = result.schema).default ?? (_a3.default = result.schema._prefault);
      delete result.schema._prefault;
      const _result = ctx.seen.get(schema);
      return _result.schema;
    }
    function extractDefs(ctx, schema) {
      const root = ctx.seen.get(schema);
      if (!root)
        throw new Error("Unprocessed schema. This is a bug in Zod.");
      const idToSchema = /* @__PURE__ */ new Map();
      for (const entry of ctx.seen.entries()) {
        const id = ctx.metadataRegistry.get(entry[0])?.id;
        if (id) {
          const existing = idToSchema.get(id);
          if (existing && existing !== entry[0]) {
            throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
          }
          idToSchema.set(id, entry[0]);
        }
      }
      const makeURI = (entry) => {
        const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
        if (ctx.external) {
          const externalId = ctx.external.registry.get(entry[0])?.id;
          const uriGenerator = ctx.external.uri ?? ((id2) => id2);
          if (externalId) {
            return { ref: uriGenerator(externalId) };
          }
          const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
          entry[1].defId = id;
          return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
        }
        if (entry[1] === root) {
          return { ref: "#" };
        }
        const uriPrefix = `#`;
        const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
        const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
        return { defId, ref: defUriPrefix + defId };
      };
      const extractToDef = (entry) => {
        if (entry[1].schema.$ref) {
          return;
        }
        const seen = entry[1];
        const { ref, defId } = makeURI(entry);
        seen.def = { ...seen.schema };
        if (defId)
          seen.defId = defId;
        const schema2 = seen.schema;
        for (const key in schema2) {
          delete schema2[key];
        }
        schema2.$ref = ref;
      };
      if (ctx.cycles === "throw") {
        for (const entry of ctx.seen.entries()) {
          const seen = entry[1];
          if (seen.cycle) {
            throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

    Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
          }
        }
      }
      for (const entry of ctx.seen.entries()) {
        const seen = entry[1];
        if (schema === entry[0]) {
          extractToDef(entry);
          continue;
        }
        if (ctx.external) {
          const ext = ctx.external.registry.get(entry[0])?.id;
          if (schema !== entry[0] && ext) {
            extractToDef(entry);
            continue;
          }
        }
        const id = ctx.metadataRegistry.get(entry[0])?.id;
        if (id) {
          extractToDef(entry);
          continue;
        }
        if (seen.cycle) {
          extractToDef(entry);
          continue;
        }
        if (seen.count > 1) {
          if (ctx.reused === "ref") {
            extractToDef(entry);
            continue;
          }
        }
      }
    }
    function finalize(ctx, schema) {
      const root = ctx.seen.get(schema);
      if (!root)
        throw new Error("Unprocessed schema. This is a bug in Zod.");
      const flattenRef = (zodSchema) => {
        const seen = ctx.seen.get(zodSchema);
        if (seen.ref === null)
          return;
        const schema2 = seen.def ?? seen.schema;
        const _cached = { ...schema2 };
        const ref = seen.ref;
        seen.ref = null;
        if (ref) {
          flattenRef(ref);
          const refSeen = ctx.seen.get(ref);
          const refSchema = refSeen.schema;
          if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
            schema2.allOf = schema2.allOf ?? [];
            schema2.allOf.push(refSchema);
          } else {
            Object.assign(schema2, refSchema);
          }
          Object.assign(schema2, _cached);
          const isParentRef = zodSchema._zod.parent === ref;
          if (isParentRef) {
            for (const key in schema2) {
              if (key === "$ref" || key === "allOf")
                continue;
              if (!(key in _cached)) {
                delete schema2[key];
              }
            }
          }
          if (refSchema.$ref && refSeen.def) {
            for (const key in schema2) {
              if (key === "$ref" || key === "allOf")
                continue;
              if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
                delete schema2[key];
              }
            }
          }
        }
        const parent = zodSchema._zod.parent;
        if (parent && parent !== ref) {
          flattenRef(parent);
          const parentSeen = ctx.seen.get(parent);
          if (parentSeen?.schema.$ref) {
            schema2.$ref = parentSeen.schema.$ref;
            if (parentSeen.def) {
              for (const key in schema2) {
                if (key === "$ref" || key === "allOf")
                  continue;
                if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
                  delete schema2[key];
                }
              }
            }
          }
        }
        ctx.override({
          zodSchema,
          jsonSchema: schema2,
          path: seen.path ?? []
        });
      };
      for (const entry of [...ctx.seen.entries()].reverse()) {
        flattenRef(entry[0]);
      }
      const result = {};
      if (ctx.target === "draft-2020-12") {
        result.$schema = "https://json-schema.org/draft/2020-12/schema";
      } else if (ctx.target === "draft-07") {
        result.$schema = "http://json-schema.org/draft-07/schema#";
      } else if (ctx.target === "draft-04") {
        result.$schema = "http://json-schema.org/draft-04/schema#";
      } else if (ctx.target === "openapi-3.0") {
      } else {
      }
      if (ctx.external?.uri) {
        const id = ctx.external.registry.get(schema)?.id;
        if (!id)
          throw new Error("Schema is missing an `id` property");
        result.$id = ctx.external.uri(id);
      }
      Object.assign(result, root.def ?? root.schema);
      const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
      if (rootMetaId !== void 0 && result.id === rootMetaId)
        delete result.id;
      const defs = ctx.external?.defs ?? {};
      for (const entry of ctx.seen.entries()) {
        const seen = entry[1];
        if (seen.def && seen.defId) {
          if (seen.def.id === seen.defId)
            delete seen.def.id;
          defs[seen.defId] = seen.def;
        }
      }
      if (ctx.external) {
      } else {
        if (Object.keys(defs).length > 0) {
          if (ctx.target === "draft-2020-12") {
            result.$defs = defs;
          } else {
            result.definitions = defs;
          }
        }
      }
      try {
        const finalized = JSON.parse(JSON.stringify(result));
        Object.defineProperty(finalized, "~standard", {
          value: {
            ...schema["~standard"],
            jsonSchema: {
              input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
              output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
            }
          },
          enumerable: false,
          writable: false
        });
        return finalized;
      } catch (_err) {
        throw new Error("Error converting schema to JSON.");
      }
    }
    function isTransforming(_schema, _ctx) {
      const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
      if (ctx.seen.has(_schema))
        return false;
      ctx.seen.add(_schema);
      const def = _schema._zod.def;
      if (def.type === "transform")
        return true;
      if (def.type === "array")
        return isTransforming(def.element, ctx);
      if (def.type === "set")
        return isTransforming(def.valueType, ctx);
      if (def.type === "lazy")
        return isTransforming(def.getter(), ctx);
      if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
        return isTransforming(def.innerType, ctx);
      }
      if (def.type === "intersection") {
        return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
      }
      if (def.type === "record" || def.type === "map") {
        return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
      }
      if (def.type === "pipe") {
        if (_schema._zod.traits.has("$ZodCodec"))
          return true;
        return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
      }
      if (def.type === "object") {
        for (const key in def.shape) {
          if (isTransforming(def.shape[key], ctx))
            return true;
        }
        return false;
      }
      if (def.type === "union") {
        for (const option of def.options) {
          if (isTransforming(option, ctx))
            return true;
        }
        return false;
      }
      if (def.type === "tuple") {
        for (const item of def.items) {
          if (isTransforming(item, ctx))
            return true;
        }
        if (def.rest && isTransforming(def.rest, ctx))
          return true;
        return false;
      }
      return false;
    }
    var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
      const ctx = initializeContext({ ...params, processors });
      process(schema, ctx);
      extractDefs(ctx, schema);
      return finalize(ctx, schema);
    };
    var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
      const { libraryOptions, target } = params ?? {};
      const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
      process(schema, ctx);
      extractDefs(ctx, schema);
      return finalize(ctx, schema);
    };

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
    var formatMap = {
      guid: "uuid",
      url: "uri",
      datetime: "date-time",
      json_string: "json-string",
      regex: ""
      // do not set
    };
    var stringProcessor = (schema, ctx, _json, _params) => {
      const json2 = _json;
      json2.type = "string";
      const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
      if (typeof minimum === "number")
        json2.minLength = minimum;
      if (typeof maximum === "number")
        json2.maxLength = maximum;
      if (format) {
        json2.format = formatMap[format] ?? format;
        if (json2.format === "")
          delete json2.format;
        if (format === "time") {
          delete json2.format;
        }
      }
      if (contentEncoding)
        json2.contentEncoding = contentEncoding;
      if (patterns && patterns.size > 0) {
        const regexes = [...patterns];
        if (regexes.length === 1)
          json2.pattern = regexes[0].source;
        else if (regexes.length > 1) {
          json2.allOf = [
            ...regexes.map((regex) => ({
              ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
              pattern: regex.source
            }))
          ];
        }
      }
    };
    var numberProcessor = (schema, ctx, _json, _params) => {
      const json2 = _json;
      const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
      if (typeof format === "string" && format.includes("int"))
        json2.type = "integer";
      else
        json2.type = "number";
      const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
      const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
      const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
      if (exMin) {
        if (legacy) {
          json2.minimum = exclusiveMinimum;
          json2.exclusiveMinimum = true;
        } else {
          json2.exclusiveMinimum = exclusiveMinimum;
        }
      } else if (typeof minimum === "number") {
        json2.minimum = minimum;
      }
      if (exMax) {
        if (legacy) {
          json2.maximum = exclusiveMaximum;
          json2.exclusiveMaximum = true;
        } else {
          json2.exclusiveMaximum = exclusiveMaximum;
        }
      } else if (typeof maximum === "number") {
        json2.maximum = maximum;
      }
      if (typeof multipleOf === "number")
        json2.multipleOf = multipleOf;
    };
    var booleanProcessor = (_schema, _ctx, json2, _params) => {
      json2.type = "boolean";
    };
    var bigintProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt cannot be represented in JSON Schema");
      }
    };
    var symbolProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Symbols cannot be represented in JSON Schema");
      }
    };
    var nullProcessor = (_schema, ctx, json2, _params) => {
      if (ctx.target === "openapi-3.0") {
        json2.type = "string";
        json2.nullable = true;
        json2.enum = [null];
      } else {
        json2.type = "null";
      }
    };
    var undefinedProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Undefined cannot be represented in JSON Schema");
      }
    };
    var voidProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Void cannot be represented in JSON Schema");
      }
    };
    var neverProcessor = (_schema, _ctx, json2, _params) => {
      json2.not = {};
    };
    var anyProcessor = (_schema, _ctx, _json, _params) => {
    };
    var unknownProcessor = (_schema, _ctx, _json, _params) => {
    };
    var dateProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Date cannot be represented in JSON Schema");
      }
    };
    var enumProcessor = (schema, _ctx, json2, _params) => {
      const def = schema._zod.def;
      const values = getEnumValues(def.entries);
      if (values.every((v) => typeof v === "number"))
        json2.type = "number";
      if (values.every((v) => typeof v === "string"))
        json2.type = "string";
      json2.enum = values;
    };
    var literalProcessor = (schema, ctx, json2, _params) => {
      const def = schema._zod.def;
      const vals = [];
      for (const val of def.values) {
        if (val === void 0) {
          if (ctx.unrepresentable === "throw") {
            throw new Error("Literal `undefined` cannot be represented in JSON Schema");
          } else {
          }
        } else if (typeof val === "bigint") {
          if (ctx.unrepresentable === "throw") {
            throw new Error("BigInt literals cannot be represented in JSON Schema");
          } else {
            vals.push(Number(val));
          }
        } else {
          vals.push(val);
        }
      }
      if (vals.length === 0) {
      } else if (vals.length === 1) {
        const val = vals[0];
        json2.type = val === null ? "null" : typeof val;
        if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
          json2.enum = [val];
        } else {
          json2.const = val;
        }
      } else {
        if (vals.every((v) => typeof v === "number"))
          json2.type = "number";
        if (vals.every((v) => typeof v === "string"))
          json2.type = "string";
        if (vals.every((v) => typeof v === "boolean"))
          json2.type = "boolean";
        if (vals.every((v) => v === null))
          json2.type = "null";
        json2.enum = vals;
      }
    };
    var nanProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("NaN cannot be represented in JSON Schema");
      }
    };
    var templateLiteralProcessor = (schema, _ctx, json2, _params) => {
      const _json = json2;
      const pattern = schema._zod.pattern;
      if (!pattern)
        throw new Error("Pattern not found in template literal");
      _json.type = "string";
      _json.pattern = pattern.source;
    };
    var fileProcessor = (schema, _ctx, json2, _params) => {
      const _json = json2;
      const file2 = {
        type: "string",
        format: "binary",
        contentEncoding: "binary"
      };
      const { minimum, maximum, mime } = schema._zod.bag;
      if (minimum !== void 0)
        file2.minLength = minimum;
      if (maximum !== void 0)
        file2.maxLength = maximum;
      if (mime) {
        if (mime.length === 1) {
          file2.contentMediaType = mime[0];
          Object.assign(_json, file2);
        } else {
          Object.assign(_json, file2);
          _json.anyOf = mime.map((m) => ({ contentMediaType: m }));
        }
      } else {
        Object.assign(_json, file2);
      }
    };
    var successProcessor = (_schema, _ctx, json2, _params) => {
      json2.type = "boolean";
    };
    var customProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Custom types cannot be represented in JSON Schema");
      }
    };
    var functionProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Function types cannot be represented in JSON Schema");
      }
    };
    var transformProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Transforms cannot be represented in JSON Schema");
      }
    };
    var mapProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Map cannot be represented in JSON Schema");
      }
    };
    var setProcessor = (_schema, ctx, _json, _params) => {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Set cannot be represented in JSON Schema");
      }
    };
    var arrayProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      const { minimum, maximum } = schema._zod.bag;
      if (typeof minimum === "number")
        json2.minItems = minimum;
      if (typeof maximum === "number")
        json2.maxItems = maximum;
      json2.type = "array";
      json2.items = process(def.element, ctx, {
        ...params,
        path: [...params.path, "items"]
      });
    };
    var objectProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      json2.type = "object";
      json2.properties = {};
      const shape = def.shape;
      for (const key in shape) {
        json2.properties[key] = process(shape[key], ctx, {
          ...params,
          path: [...params.path, "properties", key]
        });
      }
      const allKeys = new Set(Object.keys(shape));
      const requiredKeys = new Set([...allKeys].filter((key) => {
        const v = def.shape[key]._zod;
        if (ctx.io === "input") {
          return v.optin === void 0;
        } else {
          return v.optout === void 0;
        }
      }));
      if (requiredKeys.size > 0) {
        json2.required = Array.from(requiredKeys);
      }
      if (def.catchall?._zod.def.type === "never") {
        json2.additionalProperties = false;
      } else if (!def.catchall) {
        if (ctx.io === "output")
          json2.additionalProperties = false;
      } else if (def.catchall) {
        json2.additionalProperties = process(def.catchall, ctx, {
          ...params,
          path: [...params.path, "additionalProperties"]
        });
      }
    };
    var unionProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      const isExclusive = def.inclusive === false;
      const options = def.options.map((x, i) => process(x, ctx, {
        ...params,
        path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
      }));
      if (isExclusive) {
        json2.oneOf = options;
      } else {
        json2.anyOf = options;
      }
    };
    var intersectionProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      const a = process(def.left, ctx, {
        ...params,
        path: [...params.path, "allOf", 0]
      });
      const b = process(def.right, ctx, {
        ...params,
        path: [...params.path, "allOf", 1]
      });
      const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
      const allOf = [
        ...isSimpleIntersection(a) ? a.allOf : [a],
        ...isSimpleIntersection(b) ? b.allOf : [b]
      ];
      json2.allOf = allOf;
    };
    var tupleProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      json2.type = "array";
      const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
      const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
      const prefixItems = def.items.map((x, i) => process(x, ctx, {
        ...params,
        path: [...params.path, prefixPath, i]
      }));
      const rest = def.rest ? process(def.rest, ctx, {
        ...params,
        path: [...params.path, restPath, ...ctx.target === "openapi-3.0" ? [def.items.length] : []]
      }) : null;
      if (ctx.target === "draft-2020-12") {
        json2.prefixItems = prefixItems;
        if (rest) {
          json2.items = rest;
        }
      } else if (ctx.target === "openapi-3.0") {
        json2.items = {
          anyOf: prefixItems
        };
        if (rest) {
          json2.items.anyOf.push(rest);
        }
        json2.minItems = prefixItems.length;
        if (!rest) {
          json2.maxItems = prefixItems.length;
        }
      } else {
        json2.items = prefixItems;
        if (rest) {
          json2.additionalItems = rest;
        }
      }
      const { minimum, maximum } = schema._zod.bag;
      if (typeof minimum === "number")
        json2.minItems = minimum;
      if (typeof maximum === "number")
        json2.maxItems = maximum;
    };
    var recordProcessor = (schema, ctx, _json, params) => {
      const json2 = _json;
      const def = schema._zod.def;
      json2.type = "object";
      const keyType = def.keyType;
      const keyBag = keyType._zod.bag;
      const patterns = keyBag?.patterns;
      if (def.mode === "loose" && patterns && patterns.size > 0) {
        const valueSchema = process(def.valueType, ctx, {
          ...params,
          path: [...params.path, "patternProperties", "*"]
        });
        json2.patternProperties = {};
        for (const pattern of patterns) {
          json2.patternProperties[pattern.source] = valueSchema;
        }
      } else {
        if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
          json2.propertyNames = process(def.keyType, ctx, {
            ...params,
            path: [...params.path, "propertyNames"]
          });
        }
        json2.additionalProperties = process(def.valueType, ctx, {
          ...params,
          path: [...params.path, "additionalProperties"]
        });
      }
      const keyValues = keyType._zod.values;
      if (keyValues) {
        const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
        if (validKeyValues.length > 0) {
          json2.required = validKeyValues;
        }
      }
    };
    var nullableProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      const inner = process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      if (ctx.target === "openapi-3.0") {
        seen.ref = def.innerType;
        json2.nullable = true;
      } else {
        json2.anyOf = [inner, { type: "null" }];
      }
    };
    var nonoptionalProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
    var defaultProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      json2.default = JSON.parse(JSON.stringify(def.defaultValue));
    };
    var prefaultProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      if (ctx.io === "input")
        json2._prefault = JSON.parse(JSON.stringify(def.defaultValue));
    };
    var catchProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      let catchValue;
      try {
        catchValue = def.catchValue(void 0);
      } catch {
        throw new Error("Dynamic catch values are not supported in JSON Schema");
      }
      json2.default = catchValue;
    };
    var pipeProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      const inIsTransform = def.in._zod.traits.has("$ZodTransform");
      const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
      process(innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = innerType;
    };
    var readonlyProcessor = (schema, ctx, json2, params) => {
      const def = schema._zod.def;
      process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
      json2.readOnly = true;
    };
    var promiseProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
    var optionalProcessor = (schema, ctx, _json, params) => {
      const def = schema._zod.def;
      process(def.innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = def.innerType;
    };
    var lazyProcessor = (schema, ctx, _json, params) => {
      const innerType = schema._zod.innerType;
      process(innerType, ctx, params);
      const seen = ctx.seen.get(schema);
      seen.ref = innerType;
    };
    var allProcessors = {
      string: stringProcessor,
      number: numberProcessor,
      boolean: booleanProcessor,
      bigint: bigintProcessor,
      symbol: symbolProcessor,
      null: nullProcessor,
      undefined: undefinedProcessor,
      void: voidProcessor,
      never: neverProcessor,
      any: anyProcessor,
      unknown: unknownProcessor,
      date: dateProcessor,
      enum: enumProcessor,
      literal: literalProcessor,
      nan: nanProcessor,
      template_literal: templateLiteralProcessor,
      file: fileProcessor,
      success: successProcessor,
      custom: customProcessor,
      function: functionProcessor,
      transform: transformProcessor,
      map: mapProcessor,
      set: setProcessor,
      array: arrayProcessor,
      object: objectProcessor,
      union: unionProcessor,
      intersection: intersectionProcessor,
      tuple: tupleProcessor,
      record: recordProcessor,
      nullable: nullableProcessor,
      nonoptional: nonoptionalProcessor,
      default: defaultProcessor,
      prefault: prefaultProcessor,
      catch: catchProcessor,
      pipe: pipeProcessor,
      readonly: readonlyProcessor,
      promise: promiseProcessor,
      optional: optionalProcessor,
      lazy: lazyProcessor
    };
    function toJSONSchema(input, params) {
      if ("_idmap" in input) {
        const registry2 = input;
        const ctx2 = initializeContext({ ...params, processors: allProcessors });
        const defs = {};
        for (const entry of registry2._idmap.entries()) {
          const [_, schema] = entry;
          process(schema, ctx2);
        }
        const schemas = {};
        const external = {
          registry: registry2,
          uri: params?.uri,
          defs
        };
        ctx2.external = external;
        for (const entry of registry2._idmap.entries()) {
          const [key, schema] = entry;
          extractDefs(ctx2, schema);
          schemas[key] = finalize(ctx2, schema);
        }
        if (Object.keys(defs).length > 0) {
          const defsSegment = ctx2.target === "draft-2020-12" ? "$defs" : "definitions";
          schemas.__shared = {
            [defsSegment]: defs
          };
        }
        return { schemas };
      }
      const ctx = initializeContext({ ...params, processors: allProcessors });
      process(input, ctx);
      extractDefs(ctx, input);
      return finalize(ctx, input);
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-generator.js
    var JSONSchemaGenerator = class {
      /** @deprecated Access via ctx instead */
      get metadataRegistry() {
        return this.ctx.metadataRegistry;
      }
      /** @deprecated Access via ctx instead */
      get target() {
        return this.ctx.target;
      }
      /** @deprecated Access via ctx instead */
      get unrepresentable() {
        return this.ctx.unrepresentable;
      }
      /** @deprecated Access via ctx instead */
      get override() {
        return this.ctx.override;
      }
      /** @deprecated Access via ctx instead */
      get io() {
        return this.ctx.io;
      }
      /** @deprecated Access via ctx instead */
      get counter() {
        return this.ctx.counter;
      }
      set counter(value) {
        this.ctx.counter = value;
      }
      /** @deprecated Access via ctx instead */
      get seen() {
        return this.ctx.seen;
      }
      constructor(params) {
        let normalizedTarget = params?.target ?? "draft-2020-12";
        if (normalizedTarget === "draft-4")
          normalizedTarget = "draft-04";
        if (normalizedTarget === "draft-7")
          normalizedTarget = "draft-07";
        this.ctx = initializeContext({
          processors: allProcessors,
          target: normalizedTarget,
          ...params?.metadata && { metadata: params.metadata },
          ...params?.unrepresentable && { unrepresentable: params.unrepresentable },
          ...params?.override && { override: params.override },
          ...params?.io && { io: params.io }
        });
      }
      /**
       * Process a schema to prepare it for JSON Schema generation.
       * This must be called before emit().
       */
      process(schema, _params = { path: [], schemaPath: [] }) {
        return process(schema, this.ctx, _params);
      }
      /**
       * Emit the final JSON Schema after processing.
       * Must call process() first.
       */
      emit(schema, _params) {
        if (_params) {
          if (_params.cycles)
            this.ctx.cycles = _params.cycles;
          if (_params.reused)
            this.ctx.reused = _params.reused;
          if (_params.external)
            this.ctx.external = _params.external;
        }
        extractDefs(this.ctx, schema);
        const result = finalize(this.ctx, schema);
        const { "~standard": _, ...plainResult } = result;
        return plainResult;
      }
    };

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema.js
    var json_schema_exports = {};

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
    var schemas_exports2 = {};
    __export(schemas_exports2, {
      ZodAny: () => ZodAny,
      ZodArray: () => ZodArray,
      ZodBase64: () => ZodBase64,
      ZodBase64URL: () => ZodBase64URL,
      ZodBigInt: () => ZodBigInt,
      ZodBigIntFormat: () => ZodBigIntFormat,
      ZodBoolean: () => ZodBoolean,
      ZodCIDRv4: () => ZodCIDRv4,
      ZodCIDRv6: () => ZodCIDRv6,
      ZodCUID: () => ZodCUID,
      ZodCUID2: () => ZodCUID2,
      ZodCatch: () => ZodCatch,
      ZodCodec: () => ZodCodec,
      ZodCustom: () => ZodCustom,
      ZodCustomStringFormat: () => ZodCustomStringFormat,
      ZodDate: () => ZodDate,
      ZodDefault: () => ZodDefault,
      ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
      ZodE164: () => ZodE164,
      ZodEmail: () => ZodEmail,
      ZodEmoji: () => ZodEmoji,
      ZodEnum: () => ZodEnum,
      ZodExactOptional: () => ZodExactOptional,
      ZodFile: () => ZodFile,
      ZodFunction: () => ZodFunction,
      ZodGUID: () => ZodGUID,
      ZodIPv4: () => ZodIPv4,
      ZodIPv6: () => ZodIPv6,
      ZodIntersection: () => ZodIntersection,
      ZodJWT: () => ZodJWT,
      ZodKSUID: () => ZodKSUID,
      ZodLazy: () => ZodLazy,
      ZodLiteral: () => ZodLiteral,
      ZodMAC: () => ZodMAC,
      ZodMap: () => ZodMap,
      ZodNaN: () => ZodNaN,
      ZodNanoID: () => ZodNanoID,
      ZodNever: () => ZodNever,
      ZodNonOptional: () => ZodNonOptional,
      ZodNull: () => ZodNull,
      ZodNullable: () => ZodNullable,
      ZodNumber: () => ZodNumber,
      ZodNumberFormat: () => ZodNumberFormat,
      ZodObject: () => ZodObject,
      ZodOptional: () => ZodOptional,
      ZodPipe: () => ZodPipe,
      ZodPrefault: () => ZodPrefault,
      ZodPreprocess: () => ZodPreprocess,
      ZodPromise: () => ZodPromise,
      ZodReadonly: () => ZodReadonly,
      ZodRecord: () => ZodRecord,
      ZodSet: () => ZodSet,
      ZodString: () => ZodString,
      ZodStringFormat: () => ZodStringFormat,
      ZodSuccess: () => ZodSuccess,
      ZodSymbol: () => ZodSymbol,
      ZodTemplateLiteral: () => ZodTemplateLiteral,
      ZodTransform: () => ZodTransform,
      ZodTuple: () => ZodTuple,
      ZodType: () => ZodType,
      ZodULID: () => ZodULID,
      ZodURL: () => ZodURL,
      ZodUUID: () => ZodUUID,
      ZodUndefined: () => ZodUndefined,
      ZodUnion: () => ZodUnion,
      ZodUnknown: () => ZodUnknown,
      ZodVoid: () => ZodVoid,
      ZodXID: () => ZodXID,
      ZodXor: () => ZodXor,
      _ZodString: () => _ZodString,
      _default: () => _default2,
      _function: () => _function,
      any: () => any,
      array: () => array,
      base64: () => base642,
      base64url: () => base64url2,
      bigint: () => bigint2,
      boolean: () => boolean2,
      catch: () => _catch2,
      check: () => check,
      cidrv4: () => cidrv42,
      cidrv6: () => cidrv62,
      codec: () => codec,
      cuid: () => cuid3,
      cuid2: () => cuid22,
      custom: () => custom,
      date: () => date3,
      describe: () => describe2,
      discriminatedUnion: () => discriminatedUnion,
      e164: () => e1642,
      email: () => email2,
      emoji: () => emoji2,
      enum: () => _enum2,
      exactOptional: () => exactOptional,
      file: () => file,
      float32: () => float32,
      float64: () => float64,
      function: () => _function,
      guid: () => guid2,
      hash: () => hash,
      hex: () => hex2,
      hostname: () => hostname2,
      httpUrl: () => httpUrl,
      instanceof: () => _instanceof,
      int: () => int,
      int32: () => int32,
      int64: () => int64,
      intersection: () => intersection,
      invertCodec: () => invertCodec,
      ipv4: () => ipv42,
      ipv6: () => ipv62,
      json: () => json,
      jwt: () => jwt,
      keyof: () => keyof,
      ksuid: () => ksuid2,
      lazy: () => lazy,
      literal: () => literal,
      looseObject: () => looseObject,
      looseRecord: () => looseRecord,
      mac: () => mac2,
      map: () => map,
      meta: () => meta2,
      nan: () => nan,
      nanoid: () => nanoid2,
      nativeEnum: () => nativeEnum,
      never: () => never,
      nonoptional: () => nonoptional,
      null: () => _null3,
      nullable: () => nullable,
      nullish: () => nullish2,
      number: () => number2,
      object: () => object,
      optional: () => optional,
      partialRecord: () => partialRecord,
      pipe: () => pipe,
      prefault: () => prefault,
      preprocess: () => preprocess,
      promise: () => promise,
      readonly: () => readonly,
      record: () => record,
      refine: () => refine,
      set: () => set,
      strictObject: () => strictObject,
      string: () => string2,
      stringFormat: () => stringFormat,
      stringbool: () => stringbool,
      success: () => success,
      superRefine: () => superRefine,
      symbol: () => symbol,
      templateLiteral: () => templateLiteral,
      transform: () => transform,
      tuple: () => tuple,
      uint32: () => uint32,
      uint64: () => uint64,
      ulid: () => ulid2,
      undefined: () => _undefined3,
      union: () => union,
      unknown: () => unknown,
      url: () => url,
      uuid: () => uuid2,
      uuidv4: () => uuidv4,
      uuidv6: () => uuidv6,
      uuidv7: () => uuidv7,
      void: () => _void2,
      xid: () => xid2,
      xor: () => xor
    });

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/checks.js
    var checks_exports2 = {};
    __export(checks_exports2, {
      endsWith: () => _endsWith,
      gt: () => _gt,
      gte: () => _gte,
      includes: () => _includes,
      length: () => _length,
      lowercase: () => _lowercase,
      lt: () => _lt,
      lte: () => _lte,
      maxLength: () => _maxLength,
      maxSize: () => _maxSize,
      mime: () => _mime,
      minLength: () => _minLength,
      minSize: () => _minSize,
      multipleOf: () => _multipleOf,
      negative: () => _negative,
      nonnegative: () => _nonnegative,
      nonpositive: () => _nonpositive,
      normalize: () => _normalize,
      overwrite: () => _overwrite,
      positive: () => _positive,
      property: () => _property,
      regex: () => _regex,
      size: () => _size,
      slugify: () => _slugify,
      startsWith: () => _startsWith,
      toLowerCase: () => _toLowerCase,
      toUpperCase: () => _toUpperCase,
      trim: () => _trim,
      uppercase: () => _uppercase
    });

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
    var iso_exports = {};
    __export(iso_exports, {
      ZodISODate: () => ZodISODate,
      ZodISODateTime: () => ZodISODateTime,
      ZodISODuration: () => ZodISODuration,
      ZodISOTime: () => ZodISOTime,
      date: () => date2,
      datetime: () => datetime2,
      duration: () => duration2,
      time: () => time2
    });
    var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
      $ZodISODateTime.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function datetime2(params) {
      return _isoDateTime(ZodISODateTime, params);
    }
    var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
      $ZodISODate.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function date2(params) {
      return _isoDate(ZodISODate, params);
    }
    var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
      $ZodISOTime.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function time2(params) {
      return _isoTime(ZodISOTime, params);
    }
    var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
      $ZodISODuration.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function duration2(params) {
      return _isoDuration(ZodISODuration, params);
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
    var initializer2 = (inst, issues) => {
      $ZodError.init(inst, issues);
      inst.name = "ZodError";
      Object.defineProperties(inst, {
        format: {
          value: (mapper) => formatError(inst, mapper)
          // enumerable: false,
        },
        flatten: {
          value: (mapper) => flattenError(inst, mapper)
          // enumerable: false,
        },
        addIssue: {
          value: (issue2) => {
            inst.issues.push(issue2);
            inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
          }
          // enumerable: false,
        },
        addIssues: {
          value: (issues2) => {
            inst.issues.push(...issues2);
            inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
          }
          // enumerable: false,
        },
        isEmpty: {
          get() {
            return inst.issues.length === 0;
          }
          // enumerable: false,
        }
      });
    };
    var ZodError = /* @__PURE__ */ $constructor("ZodError", initializer2);
    var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, {
      Parent: Error
    });

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
    var parse2 = /* @__PURE__ */ _parse(ZodRealError);
    var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
    var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
    var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
    var encode2 = /* @__PURE__ */ _encode(ZodRealError);
    var decode2 = /* @__PURE__ */ _decode(ZodRealError);
    var encodeAsync2 = /* @__PURE__ */ _encodeAsync(ZodRealError);
    var decodeAsync2 = /* @__PURE__ */ _decodeAsync(ZodRealError);
    var safeEncode2 = /* @__PURE__ */ _safeEncode(ZodRealError);
    var safeDecode2 = /* @__PURE__ */ _safeDecode(ZodRealError);
    var safeEncodeAsync2 = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
    var safeDecodeAsync2 = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
    var _installedGroups = /* @__PURE__ */ new WeakMap();
    function _installLazyMethods(inst, group, methods) {
      const proto = Object.getPrototypeOf(inst);
      let installed = _installedGroups.get(proto);
      if (!installed) {
        installed = /* @__PURE__ */ new Set();
        _installedGroups.set(proto, installed);
      }
      if (installed.has(group))
        return;
      installed.add(group);
      for (const key in methods) {
        const fn = methods[key];
        Object.defineProperty(proto, key, {
          configurable: true,
          enumerable: false,
          get() {
            const bound = fn.bind(this);
            Object.defineProperty(this, key, {
              configurable: true,
              writable: true,
              enumerable: true,
              value: bound
            });
            return bound;
          },
          set(v) {
            Object.defineProperty(this, key, {
              configurable: true,
              writable: true,
              enumerable: true,
              value: v
            });
          }
        });
      }
    }
    var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
      $ZodType.init(inst, def);
      Object.assign(inst["~standard"], {
        jsonSchema: {
          input: createStandardJSONSchemaMethod(inst, "input"),
          output: createStandardJSONSchemaMethod(inst, "output")
        }
      });
      inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
      inst.def = def;
      inst.type = def.type;
      Object.defineProperty(inst, "_def", { value: def });
      inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
      inst.safeParse = (data, params) => safeParse2(inst, data, params);
      inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
      inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
      inst.spa = inst.safeParseAsync;
      inst.encode = (data, params) => encode2(inst, data, params);
      inst.decode = (data, params) => decode2(inst, data, params);
      inst.encodeAsync = async (data, params) => encodeAsync2(inst, data, params);
      inst.decodeAsync = async (data, params) => decodeAsync2(inst, data, params);
      inst.safeEncode = (data, params) => safeEncode2(inst, data, params);
      inst.safeDecode = (data, params) => safeDecode2(inst, data, params);
      inst.safeEncodeAsync = async (data, params) => safeEncodeAsync2(inst, data, params);
      inst.safeDecodeAsync = async (data, params) => safeDecodeAsync2(inst, data, params);
      _installLazyMethods(inst, "ZodType", {
        check(...chks) {
          const def2 = this.def;
          return this.clone(util_exports.mergeDefs(def2, {
            checks: [
              ...def2.checks ?? [],
              ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
            ]
          }), { parent: true });
        },
        with(...chks) {
          return this.check(...chks);
        },
        clone(def2, params) {
          return clone(this, def2, params);
        },
        brand() {
          return this;
        },
        register(reg, meta3) {
          reg.add(this, meta3);
          return this;
        },
        refine(check2, params) {
          return this.check(refine(check2, params));
        },
        superRefine(refinement, params) {
          return this.check(superRefine(refinement, params));
        },
        overwrite(fn) {
          return this.check(_overwrite(fn));
        },
        optional() {
          return optional(this);
        },
        exactOptional() {
          return exactOptional(this);
        },
        nullable() {
          return nullable(this);
        },
        nullish() {
          return optional(nullable(this));
        },
        nonoptional(params) {
          return nonoptional(this, params);
        },
        array() {
          return array(this);
        },
        or(arg) {
          return union([this, arg]);
        },
        and(arg) {
          return intersection(this, arg);
        },
        transform(tx) {
          return pipe(this, transform(tx));
        },
        default(d) {
          return _default2(this, d);
        },
        prefault(d) {
          return prefault(this, d);
        },
        catch(params) {
          return _catch2(this, params);
        },
        pipe(target) {
          return pipe(this, target);
        },
        readonly() {
          return readonly(this);
        },
        describe(description) {
          const cl = this.clone();
          globalRegistry.add(cl, { description });
          return cl;
        },
        meta(...args) {
          if (args.length === 0)
            return globalRegistry.get(this);
          const cl = this.clone();
          globalRegistry.add(cl, args[0]);
          return cl;
        },
        isOptional() {
          return this.safeParse(void 0).success;
        },
        isNullable() {
          return this.safeParse(null).success;
        },
        apply(fn) {
          return fn(this);
        }
      });
      Object.defineProperty(inst, "description", {
        get() {
          return globalRegistry.get(inst)?.description;
        },
        configurable: true
      });
      return inst;
    });
    var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
      $ZodString.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => stringProcessor(inst, ctx, json2, params);
      const bag = inst._zod.bag;
      inst.format = bag.format ?? null;
      inst.minLength = bag.minimum ?? null;
      inst.maxLength = bag.maximum ?? null;
      _installLazyMethods(inst, "_ZodString", {
        regex(...args) {
          return this.check(_regex(...args));
        },
        includes(...args) {
          return this.check(_includes(...args));
        },
        startsWith(...args) {
          return this.check(_startsWith(...args));
        },
        endsWith(...args) {
          return this.check(_endsWith(...args));
        },
        min(...args) {
          return this.check(_minLength(...args));
        },
        max(...args) {
          return this.check(_maxLength(...args));
        },
        length(...args) {
          return this.check(_length(...args));
        },
        nonempty(...args) {
          return this.check(_minLength(1, ...args));
        },
        lowercase(params) {
          return this.check(_lowercase(params));
        },
        uppercase(params) {
          return this.check(_uppercase(params));
        },
        trim() {
          return this.check(_trim());
        },
        normalize(...args) {
          return this.check(_normalize(...args));
        },
        toLowerCase() {
          return this.check(_toLowerCase());
        },
        toUpperCase() {
          return this.check(_toUpperCase());
        },
        slugify() {
          return this.check(_slugify());
        }
      });
    });
    var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
      $ZodString.init(inst, def);
      _ZodString.init(inst, def);
      inst.email = (params) => inst.check(_email(ZodEmail, params));
      inst.url = (params) => inst.check(_url(ZodURL, params));
      inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
      inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
      inst.guid = (params) => inst.check(_guid(ZodGUID, params));
      inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
      inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
      inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
      inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
      inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
      inst.guid = (params) => inst.check(_guid(ZodGUID, params));
      inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
      inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
      inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
      inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
      inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
      inst.xid = (params) => inst.check(_xid(ZodXID, params));
      inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
      inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
      inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
      inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
      inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
      inst.e164 = (params) => inst.check(_e164(ZodE164, params));
      inst.datetime = (params) => inst.check(datetime2(params));
      inst.date = (params) => inst.check(date2(params));
      inst.time = (params) => inst.check(time2(params));
      inst.duration = (params) => inst.check(duration2(params));
    });
    function string2(params) {
      return _string(ZodString, params);
    }
    var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
      $ZodStringFormat.init(inst, def);
      _ZodString.init(inst, def);
    });
    var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
      $ZodEmail.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function email2(params) {
      return _email(ZodEmail, params);
    }
    var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
      $ZodGUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function guid2(params) {
      return _guid(ZodGUID, params);
    }
    var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
      $ZodUUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function uuid2(params) {
      return _uuid(ZodUUID, params);
    }
    function uuidv4(params) {
      return _uuidv4(ZodUUID, params);
    }
    function uuidv6(params) {
      return _uuidv6(ZodUUID, params);
    }
    function uuidv7(params) {
      return _uuidv7(ZodUUID, params);
    }
    var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
      $ZodURL.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function url(params) {
      return _url(ZodURL, params);
    }
    function httpUrl(params) {
      return _url(ZodURL, {
        protocol: regexes_exports.httpProtocol,
        hostname: regexes_exports.domain,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
      $ZodEmoji.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function emoji2(params) {
      return _emoji2(ZodEmoji, params);
    }
    var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
      $ZodNanoID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function nanoid2(params) {
      return _nanoid(ZodNanoID, params);
    }
    var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
      $ZodCUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function cuid3(params) {
      return _cuid(ZodCUID, params);
    }
    var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
      $ZodCUID2.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function cuid22(params) {
      return _cuid2(ZodCUID2, params);
    }
    var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
      $ZodULID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function ulid2(params) {
      return _ulid(ZodULID, params);
    }
    var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
      $ZodXID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function xid2(params) {
      return _xid(ZodXID, params);
    }
    var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
      $ZodKSUID.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function ksuid2(params) {
      return _ksuid(ZodKSUID, params);
    }
    var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
      $ZodIPv4.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function ipv42(params) {
      return _ipv4(ZodIPv4, params);
    }
    var ZodMAC = /* @__PURE__ */ $constructor("ZodMAC", (inst, def) => {
      $ZodMAC.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function mac2(params) {
      return _mac(ZodMAC, params);
    }
    var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
      $ZodIPv6.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function ipv62(params) {
      return _ipv6(ZodIPv6, params);
    }
    var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
      $ZodCIDRv4.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function cidrv42(params) {
      return _cidrv4(ZodCIDRv4, params);
    }
    var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
      $ZodCIDRv6.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function cidrv62(params) {
      return _cidrv6(ZodCIDRv6, params);
    }
    var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
      $ZodBase64.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function base642(params) {
      return _base64(ZodBase64, params);
    }
    var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
      $ZodBase64URL.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function base64url2(params) {
      return _base64url(ZodBase64URL, params);
    }
    var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
      $ZodE164.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function e1642(params) {
      return _e164(ZodE164, params);
    }
    var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
      $ZodJWT.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function jwt(params) {
      return _jwt(ZodJWT, params);
    }
    var ZodCustomStringFormat = /* @__PURE__ */ $constructor("ZodCustomStringFormat", (inst, def) => {
      $ZodCustomStringFormat.init(inst, def);
      ZodStringFormat.init(inst, def);
    });
    function stringFormat(format, fnOrRegex, _params = {}) {
      return _stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
    }
    function hostname2(_params) {
      return _stringFormat(ZodCustomStringFormat, "hostname", regexes_exports.hostname, _params);
    }
    function hex2(_params) {
      return _stringFormat(ZodCustomStringFormat, "hex", regexes_exports.hex, _params);
    }
    function hash(alg, params) {
      const enc = params?.enc ?? "hex";
      const format = `${alg}_${enc}`;
      const regex = regexes_exports[format];
      if (!regex)
        throw new Error(`Unrecognized hash format: ${format}`);
      return _stringFormat(ZodCustomStringFormat, format, regex, params);
    }
    var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
      $ZodNumber.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => numberProcessor(inst, ctx, json2, params);
      _installLazyMethods(inst, "ZodNumber", {
        gt(value, params) {
          return this.check(_gt(value, params));
        },
        gte(value, params) {
          return this.check(_gte(value, params));
        },
        min(value, params) {
          return this.check(_gte(value, params));
        },
        lt(value, params) {
          return this.check(_lt(value, params));
        },
        lte(value, params) {
          return this.check(_lte(value, params));
        },
        max(value, params) {
          return this.check(_lte(value, params));
        },
        int(params) {
          return this.check(int(params));
        },
        safe(params) {
          return this.check(int(params));
        },
        positive(params) {
          return this.check(_gt(0, params));
        },
        nonnegative(params) {
          return this.check(_gte(0, params));
        },
        negative(params) {
          return this.check(_lt(0, params));
        },
        nonpositive(params) {
          return this.check(_lte(0, params));
        },
        multipleOf(value, params) {
          return this.check(_multipleOf(value, params));
        },
        step(value, params) {
          return this.check(_multipleOf(value, params));
        },
        finite() {
          return this;
        }
      });
      const bag = inst._zod.bag;
      inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
      inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
      inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
      inst.isFinite = true;
      inst.format = bag.format ?? null;
    });
    function number2(params) {
      return _number(ZodNumber, params);
    }
    var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
      $ZodNumberFormat.init(inst, def);
      ZodNumber.init(inst, def);
    });
    function int(params) {
      return _int(ZodNumberFormat, params);
    }
    function float32(params) {
      return _float32(ZodNumberFormat, params);
    }
    function float64(params) {
      return _float64(ZodNumberFormat, params);
    }
    function int32(params) {
      return _int32(ZodNumberFormat, params);
    }
    function uint32(params) {
      return _uint32(ZodNumberFormat, params);
    }
    var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
      $ZodBoolean.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => booleanProcessor(inst, ctx, json2, params);
    });
    function boolean2(params) {
      return _boolean(ZodBoolean, params);
    }
    var ZodBigInt = /* @__PURE__ */ $constructor("ZodBigInt", (inst, def) => {
      $ZodBigInt.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => bigintProcessor(inst, ctx, json2, params);
      inst.gte = (value, params) => inst.check(_gte(value, params));
      inst.min = (value, params) => inst.check(_gte(value, params));
      inst.gt = (value, params) => inst.check(_gt(value, params));
      inst.gte = (value, params) => inst.check(_gte(value, params));
      inst.min = (value, params) => inst.check(_gte(value, params));
      inst.lt = (value, params) => inst.check(_lt(value, params));
      inst.lte = (value, params) => inst.check(_lte(value, params));
      inst.max = (value, params) => inst.check(_lte(value, params));
      inst.positive = (params) => inst.check(_gt(BigInt(0), params));
      inst.negative = (params) => inst.check(_lt(BigInt(0), params));
      inst.nonpositive = (params) => inst.check(_lte(BigInt(0), params));
      inst.nonnegative = (params) => inst.check(_gte(BigInt(0), params));
      inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
      const bag = inst._zod.bag;
      inst.minValue = bag.minimum ?? null;
      inst.maxValue = bag.maximum ?? null;
      inst.format = bag.format ?? null;
    });
    function bigint2(params) {
      return _bigint(ZodBigInt, params);
    }
    var ZodBigIntFormat = /* @__PURE__ */ $constructor("ZodBigIntFormat", (inst, def) => {
      $ZodBigIntFormat.init(inst, def);
      ZodBigInt.init(inst, def);
    });
    function int64(params) {
      return _int64(ZodBigIntFormat, params);
    }
    function uint64(params) {
      return _uint64(ZodBigIntFormat, params);
    }
    var ZodSymbol = /* @__PURE__ */ $constructor("ZodSymbol", (inst, def) => {
      $ZodSymbol.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => symbolProcessor(inst, ctx, json2, params);
    });
    function symbol(params) {
      return _symbol(ZodSymbol, params);
    }
    var ZodUndefined = /* @__PURE__ */ $constructor("ZodUndefined", (inst, def) => {
      $ZodUndefined.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => undefinedProcessor(inst, ctx, json2, params);
    });
    function _undefined3(params) {
      return _undefined2(ZodUndefined, params);
    }
    var ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
      $ZodNull.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nullProcessor(inst, ctx, json2, params);
    });
    function _null3(params) {
      return _null2(ZodNull, params);
    }
    var ZodAny = /* @__PURE__ */ $constructor("ZodAny", (inst, def) => {
      $ZodAny.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => anyProcessor(inst, ctx, json2, params);
    });
    function any() {
      return _any(ZodAny);
    }
    var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
      $ZodUnknown.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => unknownProcessor(inst, ctx, json2, params);
    });
    function unknown() {
      return _unknown(ZodUnknown);
    }
    var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
      $ZodNever.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => neverProcessor(inst, ctx, json2, params);
    });
    function never(params) {
      return _never(ZodNever, params);
    }
    var ZodVoid = /* @__PURE__ */ $constructor("ZodVoid", (inst, def) => {
      $ZodVoid.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => voidProcessor(inst, ctx, json2, params);
    });
    function _void2(params) {
      return _void(ZodVoid, params);
    }
    var ZodDate = /* @__PURE__ */ $constructor("ZodDate", (inst, def) => {
      $ZodDate.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => dateProcessor(inst, ctx, json2, params);
      inst.min = (value, params) => inst.check(_gte(value, params));
      inst.max = (value, params) => inst.check(_lte(value, params));
      const c = inst._zod.bag;
      inst.minDate = c.minimum ? new Date(c.minimum) : null;
      inst.maxDate = c.maximum ? new Date(c.maximum) : null;
    });
    function date3(params) {
      return _date(ZodDate, params);
    }
    var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
      $ZodArray.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => arrayProcessor(inst, ctx, json2, params);
      inst.element = def.element;
      _installLazyMethods(inst, "ZodArray", {
        min(n, params) {
          return this.check(_minLength(n, params));
        },
        nonempty(params) {
          return this.check(_minLength(1, params));
        },
        max(n, params) {
          return this.check(_maxLength(n, params));
        },
        length(n, params) {
          return this.check(_length(n, params));
        },
        unwrap() {
          return this.element;
        }
      });
    });
    function array(element, params) {
      return _array(ZodArray, element, params);
    }
    function keyof(schema) {
      const shape = schema._zod.def.shape;
      return _enum2(Object.keys(shape));
    }
    var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
      $ZodObjectJIT.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => objectProcessor(inst, ctx, json2, params);
      util_exports.defineLazy(inst, "shape", () => {
        return def.shape;
      });
      _installLazyMethods(inst, "ZodObject", {
        keyof() {
          return _enum2(Object.keys(this._zod.def.shape));
        },
        catchall(catchall) {
          return this.clone({ ...this._zod.def, catchall });
        },
        passthrough() {
          return this.clone({ ...this._zod.def, catchall: unknown() });
        },
        loose() {
          return this.clone({ ...this._zod.def, catchall: unknown() });
        },
        strict() {
          return this.clone({ ...this._zod.def, catchall: never() });
        },
        strip() {
          return this.clone({ ...this._zod.def, catchall: void 0 });
        },
        extend(incoming) {
          return util_exports.extend(this, incoming);
        },
        safeExtend(incoming) {
          return util_exports.safeExtend(this, incoming);
        },
        merge(other) {
          return util_exports.merge(this, other);
        },
        pick(mask) {
          return util_exports.pick(this, mask);
        },
        omit(mask) {
          return util_exports.omit(this, mask);
        },
        partial(...args) {
          return util_exports.partial(ZodOptional, this, args[0]);
        },
        required(...args) {
          return util_exports.required(ZodNonOptional, this, args[0]);
        }
      });
    });
    function object(shape, params) {
      const def = {
        type: "object",
        shape: shape ?? {},
        ...util_exports.normalizeParams(params)
      };
      return new ZodObject(def);
    }
    function strictObject(shape, params) {
      return new ZodObject({
        type: "object",
        shape,
        catchall: never(),
        ...util_exports.normalizeParams(params)
      });
    }
    function looseObject(shape, params) {
      return new ZodObject({
        type: "object",
        shape,
        catchall: unknown(),
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
      $ZodUnion.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
      inst.options = def.options;
    });
    function union(options, params) {
      return new ZodUnion({
        type: "union",
        options,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodXor = /* @__PURE__ */ $constructor("ZodXor", (inst, def) => {
      ZodUnion.init(inst, def);
      $ZodXor.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
      inst.options = def.options;
    });
    function xor(options, params) {
      return new ZodXor({
        type: "union",
        options,
        inclusive: false,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
      ZodUnion.init(inst, def);
      $ZodDiscriminatedUnion.init(inst, def);
    });
    function discriminatedUnion(discriminator, options, params) {
      return new ZodDiscriminatedUnion({
        type: "union",
        options,
        discriminator,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
      $ZodIntersection.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => intersectionProcessor(inst, ctx, json2, params);
    });
    function intersection(left, right) {
      return new ZodIntersection({
        type: "intersection",
        left,
        right
      });
    }
    var ZodTuple = /* @__PURE__ */ $constructor("ZodTuple", (inst, def) => {
      $ZodTuple.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => tupleProcessor(inst, ctx, json2, params);
      inst.rest = (rest) => inst.clone({
        ...inst._zod.def,
        rest
      });
    });
    function tuple(items, _paramsOrRest, _params) {
      const hasRest = _paramsOrRest instanceof $ZodType;
      const params = hasRest ? _params : _paramsOrRest;
      const rest = hasRest ? _paramsOrRest : null;
      return new ZodTuple({
        type: "tuple",
        items,
        rest,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
      $ZodRecord.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => recordProcessor(inst, ctx, json2, params);
      inst.keyType = def.keyType;
      inst.valueType = def.valueType;
    });
    function record(keyType, valueType, params) {
      if (!valueType || !valueType._zod) {
        return new ZodRecord({
          type: "record",
          keyType: string2(),
          valueType: keyType,
          ...util_exports.normalizeParams(valueType)
        });
      }
      return new ZodRecord({
        type: "record",
        keyType,
        valueType,
        ...util_exports.normalizeParams(params)
      });
    }
    function partialRecord(keyType, valueType, params) {
      const k = clone(keyType);
      k._zod.values = void 0;
      return new ZodRecord({
        type: "record",
        keyType: k,
        valueType,
        ...util_exports.normalizeParams(params)
      });
    }
    function looseRecord(keyType, valueType, params) {
      return new ZodRecord({
        type: "record",
        keyType,
        valueType,
        mode: "loose",
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodMap = /* @__PURE__ */ $constructor("ZodMap", (inst, def) => {
      $ZodMap.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => mapProcessor(inst, ctx, json2, params);
      inst.keyType = def.keyType;
      inst.valueType = def.valueType;
      inst.min = (...args) => inst.check(_minSize(...args));
      inst.nonempty = (params) => inst.check(_minSize(1, params));
      inst.max = (...args) => inst.check(_maxSize(...args));
      inst.size = (...args) => inst.check(_size(...args));
    });
    function map(keyType, valueType, params) {
      return new ZodMap({
        type: "map",
        keyType,
        valueType,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodSet = /* @__PURE__ */ $constructor("ZodSet", (inst, def) => {
      $ZodSet.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => setProcessor(inst, ctx, json2, params);
      inst.min = (...args) => inst.check(_minSize(...args));
      inst.nonempty = (params) => inst.check(_minSize(1, params));
      inst.max = (...args) => inst.check(_maxSize(...args));
      inst.size = (...args) => inst.check(_size(...args));
    });
    function set(valueType, params) {
      return new ZodSet({
        type: "set",
        valueType,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
      $ZodEnum.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => enumProcessor(inst, ctx, json2, params);
      inst.enum = def.entries;
      inst.options = Object.values(def.entries);
      const keys = new Set(Object.keys(def.entries));
      inst.extract = (values, params) => {
        const newEntries = {};
        for (const value of values) {
          if (keys.has(value)) {
            newEntries[value] = def.entries[value];
          } else
            throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
          ...def,
          checks: [],
          ...util_exports.normalizeParams(params),
          entries: newEntries
        });
      };
      inst.exclude = (values, params) => {
        const newEntries = { ...def.entries };
        for (const value of values) {
          if (keys.has(value)) {
            delete newEntries[value];
          } else
            throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
          ...def,
          checks: [],
          ...util_exports.normalizeParams(params),
          entries: newEntries
        });
      };
    });
    function _enum2(values, params) {
      const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
      return new ZodEnum({
        type: "enum",
        entries,
        ...util_exports.normalizeParams(params)
      });
    }
    function nativeEnum(entries, params) {
      return new ZodEnum({
        type: "enum",
        entries,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
      $ZodLiteral.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => literalProcessor(inst, ctx, json2, params);
      inst.values = new Set(def.values);
      Object.defineProperty(inst, "value", {
        get() {
          if (def.values.length > 1) {
            throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
          }
          return def.values[0];
        }
      });
    });
    function literal(value, params) {
      return new ZodLiteral({
        type: "literal",
        values: Array.isArray(value) ? value : [value],
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodFile = /* @__PURE__ */ $constructor("ZodFile", (inst, def) => {
      $ZodFile.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => fileProcessor(inst, ctx, json2, params);
      inst.min = (size, params) => inst.check(_minSize(size, params));
      inst.max = (size, params) => inst.check(_maxSize(size, params));
      inst.mime = (types, params) => inst.check(_mime(Array.isArray(types) ? types : [types], params));
    });
    function file(params) {
      return _file(ZodFile, params);
    }
    var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
      $ZodTransform.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => transformProcessor(inst, ctx, json2, params);
      inst._zod.parse = (payload, _ctx) => {
        if (_ctx.direction === "backward") {
          throw new $ZodEncodeError(inst.constructor.name);
        }
        payload.addIssue = (issue2) => {
          if (typeof issue2 === "string") {
            payload.issues.push(util_exports.issue(issue2, payload.value, def));
          } else {
            const _issue = issue2;
            if (_issue.fatal)
              _issue.continue = false;
            _issue.code ?? (_issue.code = "custom");
            _issue.input ?? (_issue.input = payload.value);
            _issue.inst ?? (_issue.inst = inst);
            payload.issues.push(util_exports.issue(_issue));
          }
        };
        const output = def.transform(payload.value, payload);
        if (output instanceof Promise) {
          return output.then((output2) => {
            payload.value = output2;
            payload.fallback = true;
            return payload;
          });
        }
        payload.value = output;
        payload.fallback = true;
        return payload;
      };
    });
    function transform(fn) {
      return new ZodTransform({
        type: "transform",
        transform: fn
      });
    }
    var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
      $ZodOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => optionalProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function optional(innerType) {
      return new ZodOptional({
        type: "optional",
        innerType
      });
    }
    var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
      $ZodExactOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => optionalProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function exactOptional(innerType) {
      return new ZodExactOptional({
        type: "optional",
        innerType
      });
    }
    var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
      $ZodNullable.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nullableProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function nullable(innerType) {
      return new ZodNullable({
        type: "nullable",
        innerType
      });
    }
    function nullish2(innerType) {
      return optional(nullable(innerType));
    }
    var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
      $ZodDefault.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => defaultProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
      inst.removeDefault = inst.unwrap;
    });
    function _default2(innerType, defaultValue) {
      return new ZodDefault({
        type: "default",
        innerType,
        get defaultValue() {
          return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
        }
      });
    }
    var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
      $ZodPrefault.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => prefaultProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function prefault(innerType, defaultValue) {
      return new ZodPrefault({
        type: "prefault",
        innerType,
        get defaultValue() {
          return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
        }
      });
    }
    var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
      $ZodNonOptional.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nonoptionalProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function nonoptional(innerType, params) {
      return new ZodNonOptional({
        type: "nonoptional",
        innerType,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodSuccess = /* @__PURE__ */ $constructor("ZodSuccess", (inst, def) => {
      $ZodSuccess.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => successProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function success(innerType) {
      return new ZodSuccess({
        type: "success",
        innerType
      });
    }
    var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
      $ZodCatch.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => catchProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
      inst.removeCatch = inst.unwrap;
    });
    function _catch2(innerType, catchValue) {
      return new ZodCatch({
        type: "catch",
        innerType,
        catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
      });
    }
    var ZodNaN = /* @__PURE__ */ $constructor("ZodNaN", (inst, def) => {
      $ZodNaN.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => nanProcessor(inst, ctx, json2, params);
    });
    function nan(params) {
      return _nan(ZodNaN, params);
    }
    var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
      $ZodPipe.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => pipeProcessor(inst, ctx, json2, params);
      inst.in = def.in;
      inst.out = def.out;
    });
    function pipe(in_, out) {
      return new ZodPipe({
        type: "pipe",
        in: in_,
        out
        // ...util.normalizeParams(params),
      });
    }
    var ZodCodec = /* @__PURE__ */ $constructor("ZodCodec", (inst, def) => {
      ZodPipe.init(inst, def);
      $ZodCodec.init(inst, def);
    });
    function codec(in_, out, params) {
      return new ZodCodec({
        type: "pipe",
        in: in_,
        out,
        transform: params.decode,
        reverseTransform: params.encode
      });
    }
    function invertCodec(codec2) {
      const def = codec2._zod.def;
      return new ZodCodec({
        type: "pipe",
        in: def.out,
        out: def.in,
        transform: def.reverseTransform,
        reverseTransform: def.transform
      });
    }
    var ZodPreprocess = /* @__PURE__ */ $constructor("ZodPreprocess", (inst, def) => {
      ZodPipe.init(inst, def);
      $ZodPreprocess.init(inst, def);
    });
    var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
      $ZodReadonly.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => readonlyProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function readonly(innerType) {
      return new ZodReadonly({
        type: "readonly",
        innerType
      });
    }
    var ZodTemplateLiteral = /* @__PURE__ */ $constructor("ZodTemplateLiteral", (inst, def) => {
      $ZodTemplateLiteral.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => templateLiteralProcessor(inst, ctx, json2, params);
    });
    function templateLiteral(parts, params) {
      return new ZodTemplateLiteral({
        type: "template_literal",
        parts,
        ...util_exports.normalizeParams(params)
      });
    }
    var ZodLazy = /* @__PURE__ */ $constructor("ZodLazy", (inst, def) => {
      $ZodLazy.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => lazyProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.getter();
    });
    function lazy(getter) {
      return new ZodLazy({
        type: "lazy",
        getter
      });
    }
    var ZodPromise = /* @__PURE__ */ $constructor("ZodPromise", (inst, def) => {
      $ZodPromise.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => promiseProcessor(inst, ctx, json2, params);
      inst.unwrap = () => inst._zod.def.innerType;
    });
    function promise(innerType) {
      return new ZodPromise({
        type: "promise",
        innerType
      });
    }
    var ZodFunction = /* @__PURE__ */ $constructor("ZodFunction", (inst, def) => {
      $ZodFunction.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => functionProcessor(inst, ctx, json2, params);
    });
    function _function(params) {
      return new ZodFunction({
        type: "function",
        input: Array.isArray(params?.input) ? tuple(params?.input) : params?.input ?? array(unknown()),
        output: params?.output ?? unknown()
      });
    }
    var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
      $ZodCustom.init(inst, def);
      ZodType.init(inst, def);
      inst._zod.processJSONSchema = (ctx, json2, params) => customProcessor(inst, ctx, json2, params);
    });
    function check(fn) {
      const ch = new $ZodCheck({
        check: "custom"
        // ...util.normalizeParams(params),
      });
      ch._zod.check = fn;
      return ch;
    }
    function custom(fn, _params) {
      return _custom(ZodCustom, fn ?? (() => true), _params);
    }
    function refine(fn, _params = {}) {
      return _refine(ZodCustom, fn, _params);
    }
    function superRefine(fn, params) {
      return _superRefine(fn, params);
    }
    var describe2 = describe;
    var meta2 = meta;
    function _instanceof(cls, params = {}) {
      const inst = new ZodCustom({
        type: "custom",
        check: "custom",
        fn: (data) => data instanceof cls,
        abort: true,
        ...util_exports.normalizeParams(params)
      });
      inst._zod.bag.Class = cls;
      inst._zod.check = (payload) => {
        if (!(payload.value instanceof cls)) {
          payload.issues.push({
            code: "invalid_type",
            expected: cls.name,
            input: payload.value,
            inst,
            path: [...inst._zod.def.path ?? []]
          });
        }
      };
      return inst;
    }
    var stringbool = (...args) => _stringbool({
      Codec: ZodCodec,
      Boolean: ZodBoolean,
      String: ZodString
    }, ...args);
    function json(params) {
      const jsonSchema = lazy(() => {
        return union([string2(params), number2(), boolean2(), _null3(), array(jsonSchema), record(string2(), jsonSchema)]);
      });
      return jsonSchema;
    }
    function preprocess(fn, schema) {
      return new ZodPreprocess({
        type: "pipe",
        in: transform(fn),
        out: schema
      });
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/compat.js
    var ZodIssueCode = {
      invalid_type: "invalid_type",
      too_big: "too_big",
      too_small: "too_small",
      invalid_format: "invalid_format",
      not_multiple_of: "not_multiple_of",
      unrecognized_keys: "unrecognized_keys",
      invalid_union: "invalid_union",
      invalid_key: "invalid_key",
      invalid_element: "invalid_element",
      invalid_value: "invalid_value",
      custom: "custom"
    };
    function setErrorMap(map2) {
      config({
        customError: map2
      });
    }
    function getErrorMap() {
      return config().customError;
    }
    var ZodFirstPartyTypeKind;
    /* @__PURE__ */ (function(ZodFirstPartyTypeKind2) {
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/from-json-schema.js
    var z = {
      ...schemas_exports2,
      ...checks_exports2,
      iso: iso_exports
    };
    var RECOGNIZED_KEYS = /* @__PURE__ */ new Set([
      // Schema identification
      "$schema",
      "$ref",
      "$defs",
      "definitions",
      // Core schema keywords
      "$id",
      "id",
      "$comment",
      "$anchor",
      "$vocabulary",
      "$dynamicRef",
      "$dynamicAnchor",
      // Type
      "type",
      "enum",
      "const",
      // Composition
      "anyOf",
      "oneOf",
      "allOf",
      "not",
      // Object
      "properties",
      "required",
      "additionalProperties",
      "patternProperties",
      "propertyNames",
      "minProperties",
      "maxProperties",
      // Array
      "items",
      "prefixItems",
      "additionalItems",
      "minItems",
      "maxItems",
      "uniqueItems",
      "contains",
      "minContains",
      "maxContains",
      // String
      "minLength",
      "maxLength",
      "pattern",
      "format",
      // Number
      "minimum",
      "maximum",
      "exclusiveMinimum",
      "exclusiveMaximum",
      "multipleOf",
      // Already handled metadata
      "description",
      "default",
      // Content
      "contentEncoding",
      "contentMediaType",
      "contentSchema",
      // Unsupported (error-throwing)
      "unevaluatedItems",
      "unevaluatedProperties",
      "if",
      "then",
      "else",
      "dependentSchemas",
      "dependentRequired",
      // OpenAPI
      "nullable",
      "readOnly"
    ]);
    function detectVersion(schema, defaultTarget) {
      const $schema = schema.$schema;
      if ($schema === "https://json-schema.org/draft/2020-12/schema") {
        return "draft-2020-12";
      }
      if ($schema === "http://json-schema.org/draft-07/schema#") {
        return "draft-7";
      }
      if ($schema === "http://json-schema.org/draft-04/schema#") {
        return "draft-4";
      }
      return defaultTarget ?? "draft-2020-12";
    }
    function resolveRef(ref, ctx) {
      if (!ref.startsWith("#")) {
        throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
      }
      const path = ref.slice(1).split("/").filter(Boolean);
      if (path.length === 0) {
        return ctx.rootSchema;
      }
      const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
      if (path[0] === defsKey) {
        const key = path[1];
        if (!key || !ctx.defs[key]) {
          throw new Error(`Reference not found: ${ref}`);
        }
        return ctx.defs[key];
      }
      throw new Error(`Reference not found: ${ref}`);
    }
    function convertBaseSchema(schema, ctx) {
      if (schema.not !== void 0) {
        if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
          return z.never();
        }
        throw new Error("not is not supported in Zod (except { not: {} } for never)");
      }
      if (schema.unevaluatedItems !== void 0) {
        throw new Error("unevaluatedItems is not supported");
      }
      if (schema.unevaluatedProperties !== void 0) {
        throw new Error("unevaluatedProperties is not supported");
      }
      if (schema.if !== void 0 || schema.then !== void 0 || schema.else !== void 0) {
        throw new Error("Conditional schemas (if/then/else) are not supported");
      }
      if (schema.dependentSchemas !== void 0 || schema.dependentRequired !== void 0) {
        throw new Error("dependentSchemas and dependentRequired are not supported");
      }
      if (schema.$ref) {
        const refPath = schema.$ref;
        if (ctx.refs.has(refPath)) {
          return ctx.refs.get(refPath);
        }
        if (ctx.processing.has(refPath)) {
          return z.lazy(() => {
            if (!ctx.refs.has(refPath)) {
              throw new Error(`Circular reference not resolved: ${refPath}`);
            }
            return ctx.refs.get(refPath);
          });
        }
        ctx.processing.add(refPath);
        const resolved = resolveRef(refPath, ctx);
        const zodSchema2 = convertSchema(resolved, ctx);
        ctx.refs.set(refPath, zodSchema2);
        ctx.processing.delete(refPath);
        return zodSchema2;
      }
      if (schema.enum !== void 0) {
        const enumValues = schema.enum;
        if (ctx.version === "openapi-3.0" && schema.nullable === true && enumValues.length === 1 && enumValues[0] === null) {
          return z.null();
        }
        if (enumValues.length === 0) {
          return z.never();
        }
        if (enumValues.length === 1) {
          return z.literal(enumValues[0]);
        }
        if (enumValues.every((v) => typeof v === "string")) {
          return z.enum(enumValues);
        }
        const literalSchemas = enumValues.map((v) => z.literal(v));
        if (literalSchemas.length < 2) {
          return literalSchemas[0];
        }
        return z.union([literalSchemas[0], literalSchemas[1], ...literalSchemas.slice(2)]);
      }
      if (schema.const !== void 0) {
        return z.literal(schema.const);
      }
      const type = schema.type;
      if (Array.isArray(type)) {
        const typeSchemas = type.map((t) => {
          const typeSchema = { ...schema, type: t };
          return convertBaseSchema(typeSchema, ctx);
        });
        if (typeSchemas.length === 0) {
          return z.never();
        }
        if (typeSchemas.length === 1) {
          return typeSchemas[0];
        }
        return z.union(typeSchemas);
      }
      if (!type) {
        return z.any();
      }
      let zodSchema;
      switch (type) {
        case "string": {
          let stringSchema = z.string();
          if (schema.format) {
            const format = schema.format;
            if (format === "email") {
              stringSchema = stringSchema.check(z.email());
            } else if (format === "uri" || format === "uri-reference") {
              stringSchema = stringSchema.check(z.url());
            } else if (format === "uuid" || format === "guid") {
              stringSchema = stringSchema.check(z.uuid());
            } else if (format === "date-time") {
              stringSchema = stringSchema.check(z.iso.datetime());
            } else if (format === "date") {
              stringSchema = stringSchema.check(z.iso.date());
            } else if (format === "time") {
              stringSchema = stringSchema.check(z.iso.time());
            } else if (format === "duration") {
              stringSchema = stringSchema.check(z.iso.duration());
            } else if (format === "ipv4") {
              stringSchema = stringSchema.check(z.ipv4());
            } else if (format === "ipv6") {
              stringSchema = stringSchema.check(z.ipv6());
            } else if (format === "mac") {
              stringSchema = stringSchema.check(z.mac());
            } else if (format === "cidr") {
              stringSchema = stringSchema.check(z.cidrv4());
            } else if (format === "cidr-v6") {
              stringSchema = stringSchema.check(z.cidrv6());
            } else if (format === "base64") {
              stringSchema = stringSchema.check(z.base64());
            } else if (format === "base64url") {
              stringSchema = stringSchema.check(z.base64url());
            } else if (format === "e164") {
              stringSchema = stringSchema.check(z.e164());
            } else if (format === "jwt") {
              stringSchema = stringSchema.check(z.jwt());
            } else if (format === "emoji") {
              stringSchema = stringSchema.check(z.emoji());
            } else if (format === "nanoid") {
              stringSchema = stringSchema.check(z.nanoid());
            } else if (format === "cuid") {
              stringSchema = stringSchema.check(z.cuid());
            } else if (format === "cuid2") {
              stringSchema = stringSchema.check(z.cuid2());
            } else if (format === "ulid") {
              stringSchema = stringSchema.check(z.ulid());
            } else if (format === "xid") {
              stringSchema = stringSchema.check(z.xid());
            } else if (format === "ksuid") {
              stringSchema = stringSchema.check(z.ksuid());
            }
          }
          if (typeof schema.minLength === "number") {
            stringSchema = stringSchema.min(schema.minLength);
          }
          if (typeof schema.maxLength === "number") {
            stringSchema = stringSchema.max(schema.maxLength);
          }
          if (schema.pattern) {
            stringSchema = stringSchema.regex(new RegExp(schema.pattern));
          }
          zodSchema = stringSchema;
          break;
        }
        case "number":
        case "integer": {
          let numberSchema = type === "integer" ? z.number().int() : z.number();
          if (typeof schema.minimum === "number") {
            numberSchema = numberSchema.min(schema.minimum);
          }
          if (typeof schema.maximum === "number") {
            numberSchema = numberSchema.max(schema.maximum);
          }
          if (typeof schema.exclusiveMinimum === "number") {
            numberSchema = numberSchema.gt(schema.exclusiveMinimum);
          } else if (schema.exclusiveMinimum === true && typeof schema.minimum === "number") {
            numberSchema = numberSchema.gt(schema.minimum);
          }
          if (typeof schema.exclusiveMaximum === "number") {
            numberSchema = numberSchema.lt(schema.exclusiveMaximum);
          } else if (schema.exclusiveMaximum === true && typeof schema.maximum === "number") {
            numberSchema = numberSchema.lt(schema.maximum);
          }
          if (typeof schema.multipleOf === "number") {
            numberSchema = numberSchema.multipleOf(schema.multipleOf);
          }
          zodSchema = numberSchema;
          break;
        }
        case "boolean": {
          zodSchema = z.boolean();
          break;
        }
        case "null": {
          zodSchema = z.null();
          break;
        }
        case "object": {
          const shape = {};
          const properties = schema.properties || {};
          const requiredSet = new Set(schema.required || []);
          for (const [key, propSchema] of Object.entries(properties)) {
            const propZodSchema = convertSchema(propSchema, ctx);
            shape[key] = requiredSet.has(key) ? propZodSchema : propZodSchema.optional();
          }
          if (schema.propertyNames) {
            const keySchema = convertSchema(schema.propertyNames, ctx);
            const valueSchema = schema.additionalProperties && typeof schema.additionalProperties === "object" ? convertSchema(schema.additionalProperties, ctx) : z.any();
            if (Object.keys(shape).length === 0) {
              zodSchema = z.record(keySchema, valueSchema);
              break;
            }
            const objectSchema2 = z.object(shape).passthrough();
            const recordSchema = z.looseRecord(keySchema, valueSchema);
            zodSchema = z.intersection(objectSchema2, recordSchema);
            break;
          }
          if (schema.patternProperties) {
            const patternProps = schema.patternProperties;
            const patternKeys = Object.keys(patternProps);
            const looseRecords = [];
            for (const pattern of patternKeys) {
              const patternValue = convertSchema(patternProps[pattern], ctx);
              const keySchema = z.string().regex(new RegExp(pattern));
              looseRecords.push(z.looseRecord(keySchema, patternValue));
            }
            const schemasToIntersect = [];
            if (Object.keys(shape).length > 0) {
              schemasToIntersect.push(z.object(shape).passthrough());
            }
            schemasToIntersect.push(...looseRecords);
            if (schemasToIntersect.length === 0) {
              zodSchema = z.object({}).passthrough();
            } else if (schemasToIntersect.length === 1) {
              zodSchema = schemasToIntersect[0];
            } else {
              let result = z.intersection(schemasToIntersect[0], schemasToIntersect[1]);
              for (let i = 2; i < schemasToIntersect.length; i++) {
                result = z.intersection(result, schemasToIntersect[i]);
              }
              zodSchema = result;
            }
            break;
          }
          const objectSchema = z.object(shape);
          if (schema.additionalProperties === false) {
            zodSchema = objectSchema.strict();
          } else if (typeof schema.additionalProperties === "object") {
            zodSchema = objectSchema.catchall(convertSchema(schema.additionalProperties, ctx));
          } else {
            zodSchema = objectSchema.passthrough();
          }
          break;
        }
        case "array": {
          const prefixItems = schema.prefixItems;
          const items = schema.items;
          if (prefixItems && Array.isArray(prefixItems)) {
            const tupleItems = prefixItems.map((item) => convertSchema(item, ctx));
            const rest = items && typeof items === "object" && !Array.isArray(items) ? convertSchema(items, ctx) : void 0;
            if (rest) {
              zodSchema = z.tuple(tupleItems).rest(rest);
            } else {
              zodSchema = z.tuple(tupleItems);
            }
            if (typeof schema.minItems === "number") {
              zodSchema = zodSchema.check(z.minLength(schema.minItems));
            }
            if (typeof schema.maxItems === "number") {
              zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
            }
          } else if (Array.isArray(items)) {
            const tupleItems = items.map((item) => convertSchema(item, ctx));
            const rest = schema.additionalItems && typeof schema.additionalItems === "object" ? convertSchema(schema.additionalItems, ctx) : void 0;
            if (rest) {
              zodSchema = z.tuple(tupleItems).rest(rest);
            } else {
              zodSchema = z.tuple(tupleItems);
            }
            if (typeof schema.minItems === "number") {
              zodSchema = zodSchema.check(z.minLength(schema.minItems));
            }
            if (typeof schema.maxItems === "number") {
              zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
            }
          } else if (items !== void 0) {
            const element = convertSchema(items, ctx);
            let arraySchema = z.array(element);
            if (typeof schema.minItems === "number") {
              arraySchema = arraySchema.min(schema.minItems);
            }
            if (typeof schema.maxItems === "number") {
              arraySchema = arraySchema.max(schema.maxItems);
            }
            zodSchema = arraySchema;
          } else {
            zodSchema = z.array(z.any());
          }
          break;
        }
        default:
          throw new Error(`Unsupported type: ${type}`);
      }
      return zodSchema;
    }
    function convertSchema(schema, ctx) {
      if (typeof schema === "boolean") {
        return schema ? z.any() : z.never();
      }
      let baseSchema = convertBaseSchema(schema, ctx);
      const hasExplicitType = schema.type || schema.enum !== void 0 || schema.const !== void 0;
      if (schema.anyOf && Array.isArray(schema.anyOf)) {
        const options = schema.anyOf.map((s) => convertSchema(s, ctx));
        const anyOfUnion = z.union(options);
        baseSchema = hasExplicitType ? z.intersection(baseSchema, anyOfUnion) : anyOfUnion;
      }
      if (schema.oneOf && Array.isArray(schema.oneOf)) {
        const options = schema.oneOf.map((s) => convertSchema(s, ctx));
        const oneOfUnion = z.xor(options);
        baseSchema = hasExplicitType ? z.intersection(baseSchema, oneOfUnion) : oneOfUnion;
      }
      if (schema.allOf && Array.isArray(schema.allOf)) {
        if (schema.allOf.length === 0) {
          baseSchema = hasExplicitType ? baseSchema : z.any();
        } else {
          let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0], ctx);
          const startIdx = hasExplicitType ? 0 : 1;
          for (let i = startIdx; i < schema.allOf.length; i++) {
            result = z.intersection(result, convertSchema(schema.allOf[i], ctx));
          }
          baseSchema = result;
        }
      }
      if (schema.nullable === true && ctx.version === "openapi-3.0") {
        baseSchema = z.nullable(baseSchema);
      }
      if (schema.readOnly === true) {
        baseSchema = z.readonly(baseSchema);
      }
      if (schema.default !== void 0) {
        baseSchema = baseSchema.default(schema.default);
      }
      const extraMeta = {};
      const coreMetadataKeys = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
      for (const key of coreMetadataKeys) {
        if (key in schema) {
          extraMeta[key] = schema[key];
        }
      }
      const contentMetadataKeys = ["contentEncoding", "contentMediaType", "contentSchema"];
      for (const key of contentMetadataKeys) {
        if (key in schema) {
          extraMeta[key] = schema[key];
        }
      }
      for (const key of Object.keys(schema)) {
        if (!RECOGNIZED_KEYS.has(key)) {
          extraMeta[key] = schema[key];
        }
      }
      if (Object.keys(extraMeta).length > 0) {
        ctx.registry.add(baseSchema, extraMeta);
      }
      if (schema.description) {
        baseSchema = baseSchema.describe(schema.description);
      }
      return baseSchema;
    }
    function fromJSONSchema(schema, params) {
      if (typeof schema === "boolean") {
        return schema ? z.any() : z.never();
      }
      let normalized;
      try {
        normalized = JSON.parse(JSON.stringify(schema));
      } catch {
        throw new Error("fromJSONSchema input is not valid JSON (possibly cyclic); use $defs/$ref for recursive schemas");
      }
      const version2 = detectVersion(normalized, params?.defaultTarget);
      const defs = normalized.$defs || normalized.definitions || {};
      const ctx = {
        version: version2,
        defs,
        refs: /* @__PURE__ */ new Map(),
        processing: /* @__PURE__ */ new Set(),
        rootSchema: normalized,
        registry: params?.registry ?? globalRegistry
      };
      return convertSchema(normalized, ctx);
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/coerce.js
    var coerce_exports = {};
    __export(coerce_exports, {
      bigint: () => bigint3,
      boolean: () => boolean3,
      date: () => date4,
      number: () => number3,
      string: () => string3
    });
    function string3(params) {
      return _coercedString(ZodString, params);
    }
    function number3(params) {
      return _coercedNumber(ZodNumber, params);
    }
    function boolean3(params) {
      return _coercedBoolean(ZodBoolean, params);
    }
    function bigint3(params) {
      return _coercedBigint(ZodBigInt, params);
    }
    function date4(params) {
      return _coercedDate(ZodDate, params);
    }

    // ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js
    config(en_default());

    // src/remote-schema.ts
    var scale = external_exports.number().min(0.4).max(2);
    var action = external_exports.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/).max(96);
    var settings = external_exports.object({
      themeId: external_exports.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(64),
      reducedMotion: external_exports.boolean(),
      bubbleVisible: external_exports.boolean(),
      walkingEnabled: external_exports.boolean(),
      scale,
      activationGesture: external_exports.enum(["doubleClick", "longPress"]),
      locale: external_exports.enum(["system", "zh-CN", "en"]),
      autoLaunch: external_exports.boolean(),
      menuActions: external_exports.array(action).max(6),
      position: external_exports.object({ x: external_exports.number(), y: external_exports.number() }).optional()
    });
    var theme = external_exports.object({ id: external_exports.string(), name: external_exports.string(), license: external_exports.string(), author: external_exports.string().optional() });
    var menuExtension = external_exports.object({ id: action, label: external_exports.object({ "zh-CN": external_exports.string(), en: external_exports.string() }), invoke: external_exports.enum(["open-client", "chat", "tap", "settings"]), order: external_exports.number().optional() });
    var launcherResult = external_exports.object({ displayName: external_exports.string().min(1).max(48), platform: external_exports.enum(["macOS", "Windows"]) });
    var snapshot = external_exports.object({ config: settings, themes: external_exports.array(theme), menuExtensions: external_exports.array(menuExtension) });
    var strict = (typeSymbol, schema) => ({ mode: "strict", typeSymbol, schema });
    var PET_REMOTE_DESCRIPTORS = [
      { id: "xy-deepseek-pet#xyPet/snapshot", service: "xyPet", namespace: "xyPet", method: "snapshot", invocation: { kind: "direct" }, parameters: [], result: strict("xy-deepseek-pet#PetSettingsSnapshot", snapshot) },
      { id: "xy-deepseek-pet#xyPet/update", service: "xyPet", namespace: "xyPet", method: "update", invocation: { kind: "direct" }, parameters: [{ name: "config", wire: "config", source: "json", codec: strict("xy-deepseek-pet#PetSettings", settings) }], result: strict("xy-deepseek-pet#PetSettingsSnapshot", snapshot) },
      { id: "xy-deepseek-pet#xyPet/importTheme", service: "xyPet", namespace: "xyPet", method: "importTheme", invocation: { kind: "direct" }, parameters: [
        { name: "fileName", wire: "fileName", source: "json", codec: strict("xy-deepseek-pet#import:fileName", external_exports.string().min(1).max(255)) },
        { name: "dataBase64", wire: "dataBase64", source: "json", codec: strict("xy-deepseek-pet#import:data", external_exports.string().min(1).max(28e6)) }
      ], result: strict("xy-deepseek-pet#PetSettingsSnapshot", snapshot) },
      { id: "xy-deepseek-pet#xyPet/openDesktop", service: "xyPet", namespace: "xyPet", method: "openDesktop", invocation: { kind: "direct" }, parameters: [], result: strict("xy-deepseek-pet#openDesktop:result", external_exports.boolean()) },
      { id: "xy-deepseek-pet#xyPet/desktopStatus", service: "xyPet", namespace: "xyPet", method: "desktopStatus", invocation: { kind: "direct" }, parameters: [], result: strict("xy-deepseek-pet#desktopStatus:result", external_exports.boolean()) },
      { id: "xy-deepseek-pet#xyPet/closeDesktop", service: "xyPet", namespace: "xyPet", method: "closeDesktop", invocation: { kind: "direct" }, parameters: [], result: strict("xy-deepseek-pet#closeDesktop:result", external_exports.boolean()) },
      { id: "xy-deepseek-pet#xyPet/createLauncher", service: "xyPet", namespace: "xyPet", method: "createLauncher", invocation: { kind: "direct" }, parameters: [
        { name: "name", wire: "name", source: "json", codec: strict("xy-deepseek-pet#launcher:name", external_exports.string().min(1).max(48)) },
        { name: "iconId", wire: "iconId", source: "json", codec: strict("xy-deepseek-pet#launcher:iconId", external_exports.enum(["calm", "custom"])) },
        { name: "fileName", wire: "fileName", source: "json", codec: strict("xy-deepseek-pet#launcher:fileName", external_exports.string().max(255)) },
        { name: "dataBase64", wire: "dataBase64", source: "json", codec: strict("xy-deepseek-pet#launcher:data", external_exports.string().max(7e6)) }
      ], result: strict("xy-deepseek-pet#launcher:result", launcherResult) }
    ];

    // src/remote.ts
    var TYPERT_REMOTE = { package: "xy-deepseek-pet", descriptors: PET_REMOTE_DESCRIPTORS };
    var remote_default = TYPERT_REMOTE;

    // assets/whale-calm.png
    var whale_calm_default = "data:image/png;base64,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";

    // src/client.ts
    var name = "xy-deepseek-pet-client";
    var inject = ["remote", "sessions", "slots"];
    function remoteValue2(result) {
      if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
      return result.value;
    }
    function useChinese() {
      return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh");
    }
    function toBase642(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
      return btoa(binary);
    }
    var copy2 = {
      zh: {
        title: "\u684C\u9762\u5BA0\u7269",
        open: "\u6253\u5F00\u5BA0\u7269",
        close: "\u5173\u95ED\u5BA0\u7269",
        sidebarOpen: "\u6253\u5F00\u684C\u5BA0",
        sidebarClose: "\u5173\u95ED\u684C\u5BA0",
        theme: "\u5BA0\u7269\u4E3B\u9898",
        size: "\u5BA0\u7269\u5927\u5C0F",
        more: "\u66F4\u591A\u8BBE\u7F6E",
        walking: "\u5141\u8BB8\u8D70\u52A8",
        motion: "\u51CF\u5C11\u52A8\u753B",
        bubbles: "\u6D88\u606F\u6C14\u6CE1",
        autoLaunch: "\u968F Harness \u542F\u52A8",
        gesture: "\u6253\u5F00 Harness",
        longPress: "\u957F\u6309",
        doubleClick: "\u53CC\u51FB",
        menu: "\u53F3\u952E\u83DC\u5355",
        menuHint: "\u5173\u95ED\u684C\u5BA0\u59CB\u7EC8\u4FDD\u7559\uFF0C\u63D2\u4EF6\u52A8\u4F5C\u4E5F\u53EF\u5728\u8FD9\u91CC\u5F00\u5173\u3002",
        openClient: "\u6253\u5F00 Harness",
        chat: "\u56DE\u590D\u6700\u8FD1\u6D88\u606F",
        settings: "\u6253\u5F00\u8BBE\u7F6E",
        launcher: "\u684C\u9762\u5FEB\u6377\u65B9\u5F0F",
        launcherHint: "\u521B\u5EFA\u4E00\u4E2A\u540C\u65F6\u6253\u5F00 Harness\u3001\u7F51\u9875\u548C\u684C\u5BA0\u7684\u684C\u9762\u5165\u53E3",
        launcherName: "\u540D\u79F0",
        launcherIcon: "\u56FE\u6807",
        calm: "\u5361\u901A\u9CB8\u9C7C",
        customIcon: "\u62D6\u5165\u81EA\u5B9A\u4E49 PNG",
        customIconHint: "\u62D6\u5165 PNG\uFF0C\u6216\u70B9\u51FB\u9009\u62E9",
        createLauncher: "\u521B\u5EFA\u5230\u684C\u9762",
        createdLauncher: "\u5DF2\u521B\u5EFA",
        import: "\u5BFC\u5165\u5BA0\u7269\u5305",
        importHint: "\u62D6\u5165\u4E0B\u8F7D\u7684 ZIP \u5BA0\u7269\u5305\uFF0C\u517C\u5BB9\u672C\u9879\u76EE\u4E3B\u9898\u4E0E Petdex \u683C\u5F0F",
        browse: "\u9009\u62E9 ZIP",
        importing: "\u6B63\u5728\u5BFC\u5165\u2026",
        saved: "\u5DF2\u4FDD\u5B58",
        loading: "\u52A0\u8F7D\u4E2D\u2026"
      },
      en: {
        title: "Desktop pet",
        open: "Open pet",
        close: "Close pet",
        sidebarOpen: "Open pet",
        sidebarClose: "Close pet",
        theme: "Pet theme",
        size: "Pet size",
        more: "More settings",
        walking: "Allow wandering",
        motion: "Reduced motion",
        bubbles: "Message bubbles",
        autoLaunch: "Start with Harness",
        gesture: "Open Harness",
        longPress: "Long press",
        doubleClick: "Double click",
        menu: "Right-click menu",
        menuHint: "Quit pet is always available. Plugin actions can also be toggled here.",
        openClient: "Open Harness",
        chat: "Reply to latest",
        settings: "Open settings",
        launcher: "Desktop shortcut",
        launcherHint: "Create a desktop entry that opens Harness, the web client, and the pet",
        launcherName: "Name",
        launcherIcon: "Icon",
        calm: "Cartoon whale",
        customIcon: "Drop custom PNG",
        customIconHint: "Drop a PNG, or click to choose",
        createLauncher: "Create on desktop",
        createdLauncher: "Created",
        import: "Import pet pack",
        importHint: "Drop a downloaded ZIP pet pack; native themes and Petdex are supported",
        browse: "Choose ZIP",
        importing: "Importing\u2026",
        saved: "Saved",
        loading: "Loading\u2026"
      }
    };
    var styles2 = {
      root: { width: "100%", color: "var(--dsw-alias-label-primary, #f4f5f6)", padding: "12px 0", borderBottom: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.1))", letterSpacing: 0, fontFamily: "inherit", fontSize: 13 },
      header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 },
      title: { margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0 },
      row: { display: "grid", gridTemplateColumns: "minmax(104px, .8fr) minmax(180px, 1.35fr)", alignItems: "center", gap: 12, minHeight: 40 },
      value: { justifySelf: "end", width: "100%", maxWidth: 360 },
      button: { minHeight: 34, padding: "0 12px", border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))", borderRadius: 6, background: "transparent", color: "inherit", cursor: "pointer" },
      primary: { minHeight: 34, padding: "0 12px", border: 0, borderRadius: 6, background: "var(--dsw-alias-accent-primary, #1688f8)", color: "#fff", cursor: "pointer" },
      segment: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 2, borderRadius: 6, background: "var(--dsw-alias-bg-elevated, rgba(255,255,255,.07))" },
      segmentButton: { minHeight: 30, border: 0, borderRadius: 4, color: "inherit", background: "transparent", cursor: "pointer" },
      segmentActive: { background: "var(--dsw-alias-bg-base, rgba(255,255,255,.12))", boxShadow: "0 1px 3px rgba(0,0,0,.16)" },
      checks: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0 16px", padding: "4px 0" },
      check: { display: "flex", minHeight: 30, alignItems: "center", gap: 8, fontSize: 13 },
      checkbox: { width: 16, height: 16, accentColor: "var(--dsw-alias-accent-primary, #1688f8)" },
      range: { width: "100%", accentColor: "var(--dsw-alias-accent-primary, #1688f8)" },
      rangeWrap: { display: "grid", gridTemplateColumns: "1fr 48px", alignItems: "center", gap: 8 },
      output: { textAlign: "right", fontSize: 12, fontVariantNumeric: "tabular-nums" },
      details: { padding: "3px 0" },
      summary: { cursor: "pointer", fontSize: 13 },
      disclosureSummary: { display: "flex", minHeight: 34, alignItems: "center", gap: 7, cursor: "pointer", listStyle: "none", fontSize: 13 },
      disclosure: { display: "inline-block", width: 12, flex: "0 0 12px", fontSize: 10, lineHeight: 1, textAlign: "center" },
      textInput: { width: "100%", minHeight: 34, padding: "5px 9px", color: "inherit", background: "var(--dsw-alias-bg-base, rgba(255,255,255,.04))", border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.16))", borderRadius: 6 },
      choices: { display: "flex", flexWrap: "wrap", gap: 6, padding: "6px 0 2px" },
      iconChoice: { display: "grid", gridTemplateColumns: "38px 1fr", alignItems: "center", gap: 7, minHeight: 46, padding: "4px 8px", textAlign: "left" },
      iconPreview: { width: 34, height: 34, objectFit: "contain", imageRendering: "auto" },
      drop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 52, margin: "5px 0 3px", padding: "7px 10px", border: "1px dashed var(--dsw-alias-border-l2, rgba(255,255,255,.25))", borderRadius: 6 },
      iconDrop: { display: "grid", gridTemplateColumns: "38px 1fr", alignItems: "center", gap: 7, minHeight: 54, padding: "6px 8px", textAlign: "left", borderStyle: "dashed" },
      hint: { margin: "2px 0 0", color: "var(--dsw-alias-label-secondary, #aeb3bb)", fontSize: 12 },
      status: { minHeight: 18, marginTop: 4, fontSize: 12, color: "var(--dsw-alias-label-secondary, #aeb3bb)" },
      error: { minHeight: 18, marginTop: 4, fontSize: 12, color: "var(--dsw-alias-danger, #ff6b6b)" }
    };
    var menuActions = ["open-client", "chat", "settings"];
    var soundsRemote;
    var soundRemoteListeners = /* @__PURE__ */ new Set();
    function useDesktopToggle(remote, reportError) {
      const [open, setOpen] = (0, import_react2.useState)(false);
      const [busy, setBusy] = (0, import_react2.useState)(false);
      (0, import_react2.useEffect)(() => {
        let live = true;
        const refresh = () => remote.desktopStatus().then(remoteValue2).then((value) => {
          if (live) setOpen(value);
        }).catch((reason) => reportError?.(String(reason)));
        void refresh();
        const timer = window.setInterval(refresh, 1e3);
        return () => {
          live = false;
          window.clearInterval(timer);
        };
      }, [remote, reportError]);
      const toggle = (0, import_react2.useCallback)(() => {
        if (busy) return;
        setBusy(true);
        const action2 = open ? remote.closeDesktop() : remote.openDesktop();
        action2.then(remoteValue2).then((accepted) => {
          if (!accepted) throw new Error(open ? "Desktop pet is not running" : "Desktop pet could not be opened");
          setOpen(!open);
        }).catch((reason) => reportError?.(String(reason))).finally(() => setBusy(false));
      }, [busy, open, remote, reportError]);
      return { open, busy, toggle };
    }
    function PetSettingsView({ remote }) {
      const locale = useChinese() ? "zh-CN" : "en";
      const c = locale === "zh-CN" ? copy2.zh : copy2.en;
      const [snapshot2, setSnapshot] = (0, import_react2.useState)();
      const [draft, setDraft] = (0, import_react2.useState)();
      const [status, setStatus] = (0, import_react2.useState)(c.loading);
      const [error51, setError] = (0, import_react2.useState)("");
      const [dragging, setDragging] = (0, import_react2.useState)(false);
      const [iconDragging, setIconDragging] = (0, import_react2.useState)(false);
      const [soundRemote, setSoundRemote] = (0, import_react2.useState)(soundsRemote);
      const [launcherOpen, setLauncherOpen] = (0, import_react2.useState)(false);
      const [moreOpen, setMoreOpen] = (0, import_react2.useState)(false);
      const [launcherName, setLauncherName] = (0, import_react2.useState)("DeepSeek Harness");
      const [launcherIcon, setLauncherIcon] = (0, import_react2.useState)("calm");
      const [launcherFile, setLauncherFile] = (0, import_react2.useState)();
      const [customIconPreview, setCustomIconPreview] = (0, import_react2.useState)("");
      const saveTimer = (0, import_react2.useRef)();
      const fileInput = (0, import_react2.useRef)(null);
      const launcherFileInput = (0, import_react2.useRef)(null);
      const reportToggleError = (0, import_react2.useCallback)((message) => setError(message), []);
      const desktop = useDesktopToggle(remote, reportToggleError);
      (0, import_react2.useEffect)(() => {
        let live = true;
        remote.snapshot().then(remoteValue2).then((value) => {
          if (live) {
            setSnapshot(value);
            setDraft(value.config);
            setStatus("");
          }
        }).catch((reason) => live && setError(String(reason)));
        return () => {
          live = false;
          if (saveTimer.current) clearTimeout(saveTimer.current);
        };
      }, [remote]);
      (0, import_react2.useEffect)(() => {
        soundRemoteListeners.add(setSoundRemote);
        return () => {
          soundRemoteListeners.delete(setSoundRemote);
        };
      }, []);
      (0, import_react2.useEffect)(() => {
        const preventFileNavigation = (event) => {
          if (Array.from(event.dataTransfer?.types ?? []).includes("Files")) event.preventDefault();
        };
        window.addEventListener("dragover", preventFileNavigation);
        window.addEventListener("drop", preventFileNavigation);
        return () => {
          window.removeEventListener("dragover", preventFileNavigation);
          window.removeEventListener("drop", preventFileNavigation);
        };
      }, []);
      const commit = (0, import_react2.useCallback)(async (next) => {
        setError("");
        setStatus("\u2026");
        try {
          const value = remoteValue2(await remote.update(next));
          setSnapshot(value);
          setDraft(value.config);
          setStatus(c.saved);
        } catch (reason) {
          setError(String(reason));
          setStatus("");
        }
      }, [c.saved, remote]);
      const mutate = (0, import_react2.useCallback)((change) => {
        setDraft((current) => {
          if (!current) return current;
          const next = structuredClone(current);
          change(next);
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => void commit(next), 160);
          return next;
        });
      }, [commit]);
      const importFile = (0, import_react2.useCallback)(async (file2) => {
        setError("");
        if (!file2.name.toLowerCase().endsWith(".zip") || file2.size === 0 || file2.size > 20 * 1024 * 1024) {
          setError(locale === "zh-CN" ? "\u8BF7\u9009\u62E9\u4E0D\u8D85\u8FC7 20 MiB \u7684 ZIP \u5BA0\u7269\u5305" : "Choose a ZIP pet pack no larger than 20 MiB");
          return;
        }
        setStatus(c.importing);
        try {
          const value = remoteValue2(await remote.importTheme(file2.name, toBase642(await file2.arrayBuffer())));
          setSnapshot(value);
          setDraft(value.config);
          setStatus(c.saved);
        } catch (reason) {
          setError(String(reason));
          setStatus("");
        }
      }, [c.importing, c.saved, locale, remote]);
      const chooseLauncherFile = (0, import_react2.useCallback)((file2) => {
        if (file2.type !== "image/png" || !file2.name.toLowerCase().endsWith(".png") || file2.size === 0 || file2.size > 5 * 1024 * 1024) {
          setError(locale === "zh-CN" ? "\u8BF7\u9009\u62E9\u4E0D\u8D85\u8FC7 5 MiB \u7684 PNG \u56FE\u6807" : "Choose a PNG icon no larger than 5 MiB");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => setCustomIconPreview(typeof reader.result === "string" ? reader.result : "");
        reader.readAsDataURL(file2);
        setLauncherFile(file2);
        setLauncherIcon("custom");
        setError("");
      }, [locale]);
      const droppedFile = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = Array.from(event.dataTransfer.items).find((candidate) => candidate.kind === "file");
        event.dataTransfer.dropEffect = "copy";
        return item?.getAsFile() ?? event.dataTransfer.files[0] ?? void 0;
      };
      if (!snapshot2 || !draft) return import_react2.default.createElement("div", { style: styles2.root }, error51 || status);
      const checkbox = (label, checked, change) => import_react2.default.createElement("label", { style: styles2.check }, import_react2.default.createElement("input", { type: "checkbox", style: styles2.checkbox, checked, onChange: (event) => change(event.currentTarget.checked) }), label);
      const menuLabel = { "open-client": c.openClient, chat: c.chat, settings: c.settings };
      const selectedTheme = snapshot2.themes.find((theme2) => theme2.id === draft.themeId);
      const iconOption = (id, label, source) => import_react2.default.createElement("button", {
        key: id,
        type: "button",
        style: { ...styles2.button, ...id === "custom" ? styles2.iconDrop : styles2.iconChoice, ...launcherIcon === id || id === "custom" && iconDragging ? { borderColor: "var(--dsw-alias-accent-primary, #1688f8)" } : {} },
        onClick: () => id === "custom" ? launcherFileInput.current?.click() : setLauncherIcon(id),
        onDragEnter: id === "custom" ? (event) => {
          event.preventDefault();
          setIconDragging(true);
        } : void 0,
        onDragOver: id === "custom" ? (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        } : void 0,
        onDragLeave: id === "custom" ? (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIconDragging(false);
        } : void 0,
        onDrop: id === "custom" ? (event) => {
          setIconDragging(false);
          const file2 = droppedFile(event);
          if (file2) chooseLauncherFile(file2);
        } : void 0
      }, source ? import_react2.default.createElement("img", { src: source, alt: "", style: styles2.iconPreview }) : import_react2.default.createElement("span", { style: styles2.iconPreview }), import_react2.default.createElement("span", null, id === "custom" ? import_react2.default.createElement(import_react2.default.Fragment, null, import_react2.default.createElement("span", null, label), import_react2.default.createElement("span", { style: { ...styles2.hint, display: "block" } }, c.customIconHint)) : label));
      const createLauncher = async () => {
        setError("");
        setStatus("\u2026");
        try {
          const fileName = launcherIcon === "custom" ? launcherFile?.name ?? "" : "";
          const dataBase64 = launcherIcon === "custom" && launcherFile ? toBase642(await launcherFile.arrayBuffer()) : "";
          if (launcherIcon === "custom" && !launcherFile) throw new Error(locale === "zh-CN" ? "\u8BF7\u5148\u9009\u62E9 PNG \u56FE\u6807" : "Choose a PNG icon first");
          const result = remoteValue2(await remote.createLauncher(launcherName, launcherIcon, fileName, dataBase64));
          setStatus(`${c.createdLauncher}\uFF1A${result.displayName}`);
        } catch (reason) {
          setError(String(reason));
          setStatus("");
        }
      };
      return import_react2.default.createElement(
        "div",
        { style: styles2.root },
        import_react2.default.createElement("div", { style: styles2.header }, import_react2.default.createElement("h3", { style: styles2.title }, c.title), import_react2.default.createElement("button", { type: "button", style: styles2.primary, disabled: desktop.busy, onClick: desktop.toggle }, desktop.open ? c.close : c.open)),
        import_react2.default.createElement(
          "div",
          { style: styles2.row },
          c.theme,
          import_react2.default.createElement("details", { style: { ...styles2.details, ...styles2.value } }, import_react2.default.createElement("summary", { style: styles2.summary }, selectedTheme?.name ?? draft.themeId), import_react2.default.createElement("div", { style: styles2.choices }, ...snapshot2.themes.map((theme2) => import_react2.default.createElement("button", { key: theme2.id, type: "button", style: { ...styles2.button, ...theme2.id === draft.themeId ? { borderColor: "var(--dsw-alias-accent-primary, #1688f8)" } : {} }, onClick: () => mutate((next) => {
            next.themeId = theme2.id;
          }) }, theme2.name))))
        ),
        import_react2.default.createElement("div", { style: styles2.row }, c.size, import_react2.default.createElement("div", { style: { ...styles2.rangeWrap, ...styles2.value } }, import_react2.default.createElement("input", { type: "range", min: 0.4, max: 2, step: 0.05, value: draft.scale, style: styles2.range, "aria-label": c.size, onChange: (event) => {
          const value = Number(event.currentTarget.value);
          mutate((next) => {
            next.scale = value;
          });
        } }), import_react2.default.createElement("output", { style: styles2.output }, `${Math.round(draft.scale * 100)}%`))),
        import_react2.default.createElement("div", { style: styles2.row }, c.gesture, import_react2.default.createElement(
          "div",
          { style: { ...styles2.segment, ...styles2.value } },
          import_react2.default.createElement("button", { type: "button", style: { ...styles2.segmentButton, ...draft.activationGesture === "longPress" ? styles2.segmentActive : {} }, onClick: () => mutate((next) => {
            next.activationGesture = "longPress";
          }) }, c.longPress),
          import_react2.default.createElement("button", { type: "button", style: { ...styles2.segmentButton, ...draft.activationGesture === "doubleClick" ? styles2.segmentActive : {} }, onClick: () => mutate((next) => {
            next.activationGesture = "doubleClick";
          }) }, c.doubleClick)
        )),
        import_react2.default.createElement(
          "div",
          { style: styles2.checks },
          checkbox(c.walking, draft.walkingEnabled, (value) => mutate((next) => {
            next.walkingEnabled = value;
          })),
          checkbox(c.bubbles, draft.bubbleVisible, (value) => mutate((next) => {
            next.bubbleVisible = value;
          })),
          checkbox(c.autoLaunch, draft.autoLaunch, (value) => mutate((next) => {
            next.autoLaunch = value;
          }))
        ),
        import_react2.default.createElement("div", { role: "button", tabIndex: 0, "aria-label": c.importHint, "data-pet-pack-drop": true, style: { ...styles2.drop, ...dragging ? { borderColor: "var(--dsw-alias-accent-primary, #1688f8)", background: "var(--dsw-alias-bg-elevated, rgba(255,255,255,.07))" } : {} }, onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") fileInput.current?.click();
        }, onDragEnter: (event) => {
          event.preventDefault();
          setDragging(true);
        }, onDragOver: (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }, onDragLeave: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }, onDrop: (event) => {
          setDragging(false);
          const file2 = droppedFile(event);
          if (file2) void importFile(file2);
        } }, import_react2.default.createElement("div", null, import_react2.default.createElement("div", null, c.import), import_react2.default.createElement("p", { style: styles2.hint }, c.importHint)), import_react2.default.createElement("button", { type: "button", style: styles2.button, onClick: (event) => {
          event.stopPropagation();
          fileInput.current?.click();
        } }, c.browse)),
        import_react2.default.createElement("input", { ref: fileInput, type: "file", accept: ".zip,application/zip", hidden: true, onChange: (event) => {
          const file2 = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file2) void importFile(file2);
        } }),
        import_react2.default.createElement(
          "details",
          { open: launcherOpen, onToggle: (event) => setLauncherOpen(event.currentTarget.open), style: styles2.details },
          import_react2.default.createElement("summary", { style: styles2.disclosureSummary }, import_react2.default.createElement("span", { style: styles2.disclosure, "aria-hidden": true }, launcherOpen ? "\u25BC" : "\u25B6"), import_react2.default.createElement("span", null, c.launcher)),
          import_react2.default.createElement(
            "div",
            { style: { padding: "2px 0 8px 20px" } },
            import_react2.default.createElement("p", { style: styles2.hint }, c.launcherHint),
            import_react2.default.createElement("div", { style: styles2.row }, c.launcherName, import_react2.default.createElement("input", { type: "text", maxLength: 48, value: launcherName, style: { ...styles2.textInput, ...styles2.value }, onChange: (event) => setLauncherName(event.currentTarget.value) })),
            import_react2.default.createElement("div", { style: styles2.row }, c.launcherIcon, import_react2.default.createElement("div", { style: { ...styles2.choices, ...styles2.value } }, iconOption("calm", c.calm, whale_calm_default), iconOption("custom", launcherFile?.name ?? c.customIcon, customIconPreview))),
            import_react2.default.createElement("input", { ref: launcherFileInput, type: "file", accept: ".png,image/png", hidden: true, onChange: (event) => {
              const file2 = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file2) chooseLauncherFile(file2);
            } }),
            import_react2.default.createElement("div", { style: { display: "flex", justifyContent: "flex-end", paddingTop: 6 } }, import_react2.default.createElement("button", { type: "button", style: styles2.button, onClick: () => void createLauncher() }, c.createLauncher))
          )
        ),
        import_react2.default.createElement("details", { open: moreOpen, onToggle: (event) => setMoreOpen(event.currentTarget.open), style: styles2.details }, import_react2.default.createElement("summary", { style: styles2.disclosureSummary }, import_react2.default.createElement("span", { style: styles2.disclosure, "aria-hidden": true }, moreOpen ? "\u25BC" : "\u25B6"), import_react2.default.createElement("span", null, c.more)), import_react2.default.createElement(
          "div",
          { style: { padding: "2px 0 6px 20px" } },
          import_react2.default.createElement("div", { style: styles2.checks }, checkbox(c.motion, draft.reducedMotion, (value) => mutate((next) => {
            next.reducedMotion = value;
          }))),
          import_react2.default.createElement("details", { style: styles2.details }, import_react2.default.createElement("summary", { style: styles2.summary }, c.menu), import_react2.default.createElement("p", { style: styles2.hint }, c.menuHint), import_react2.default.createElement(
            "div",
            { style: styles2.checks },
            ...menuActions.map((action2) => checkbox(menuLabel[action2], draft.menuActions.includes(action2), (checked) => mutate((next) => {
              next.menuActions = checked ? [.../* @__PURE__ */ new Set([...next.menuActions, action2])] : next.menuActions.filter((item) => item !== action2);
            }))),
            ...snapshot2.menuExtensions.map((action2) => checkbox(action2.label[locale], draft.menuActions.includes(action2.id), (checked) => mutate((next) => {
              next.menuActions = checked ? [.../* @__PURE__ */ new Set([...next.menuActions, action2.id])] : next.menuActions.filter((item) => item !== action2.id);
            })))
          ))
        )),
        soundRemote && import_react2.default.createElement(SoundSettings, { remote: soundRemote, locale, embedded: true }),
        import_react2.default.createElement("div", { style: error51 ? styles2.error : styles2.status, role: "status" }, error51 || status)
      );
    }
    function OpenPetAction(props) {
      const c = useChinese() ? copy2.zh : copy2.en;
      const desktop = useDesktopToggle(props.remote);
      const label = desktop.open ? c.sidebarClose : c.sidebarOpen;
      return import_react2.default.createElement("button", { type: "button", title: label, "aria-label": label, disabled: desktop.busy, onClick: desktop.toggle, style: { width: props.wide ? "100%" : 36, minHeight: 32, border: "1px solid var(--dsw-alias-border-l2, #d8dee3)", borderRadius: 6, background: "var(--dsw-alias-bg-base, #fff)", color: "var(--dsw-alias-label-primary, #172026)", cursor: "pointer", fontSize: 12 } }, props.wide ? label : "\u{1F40B}");
    }
    async function apply(ctx) {
      const presenceKey = "__xyDeepSeekPetSettingsPresent";
      const presenceEvent = "xy-deepseek-pet-settings-presence";
      globalThis[presenceKey] = true;
      globalThis.dispatchEvent?.(new Event(presenceEvent));
      const unmountRemote = await ctx.remote.$mount(remote_default);
      const settingsFiber = ctx.inject(["remote.xyPet"], (scope) => {
        const remote = scope.remote.xyPet;
        scope.slots.inject("settings.general.item", () => scope.slots.register({ name: "settings.general.item", id: "xy-deepseek-pet", order: 100, label: useChinese() ? "\u684C\u9762\u5BA0\u7269" : "Desktop pet" }, () => import_react2.default.createElement(PetSettingsView, { remote })));
      });
      const soundsFiber = ctx.inject(["remote.xySounds"], (scope) => {
        soundsRemote = scope.remote.xySounds;
        for (const listener of soundRemoteListeners) listener(soundsRemote);
      });
      const actionFiber = ctx.inject(["remote.xyPet"], (scope) => {
        const remote = scope.remote.xyPet;
        scope.slots.inject("sidebar.footer.action", () => scope.slots.register({ name: "sidebar.footer.action", id: "xy-deepseek-pet", order: 20 }, (props) => import_react2.default.createElement(OpenPetAction, { wide: props.wide, remote })));
      });
      await Promise.all([settingsFiber, actionFiber, soundsFiber]);
      return async () => {
        soundsRemote = void 0;
        for (const listener of soundRemoteListeners) listener(void 0);
        await Promise.all([settingsFiber.dispose(), actionFiber.dispose(), soundsFiber.dispose()]);
        await unmountRemote();
        globalThis[presenceKey] = false;
        globalThis.dispatchEvent?.(new Event(presenceEvent));
      };
    }

    return module.exports;
  }
});
