# {canary,prod}-config.json

These config files are used to bootstrap experiment values into the runtime and are merged directly into the `AMP_CONFIG` field during the build. `prod-config.json` is used in all [release channels](../../docs/release-schedule.md#release-channels) except Experimental, which uses `canary-config.json`.

# custom-config.json

If `build-system/global-configs/custom-config.json` exists at build time, its properties will overlay the active config. For example, consider `amp dist --config=canary` with the following configs:

`canary-config.json` (simplified for brevity)

```json
{
  "canary": 1,
  "chunked-amp": 1,
  "version-locking": 1
}
```

`custom-config.json`

```json
{
  "cdnUrl": "https://example.com/amp",
  "version-locking": 0
}
```

The resulting config is

```json
{
  "canary": 1,
  "chunked-amp": 1,
  "version-locking": 0,
  "cdnUrl": "https://example.com/amp"
}
```
