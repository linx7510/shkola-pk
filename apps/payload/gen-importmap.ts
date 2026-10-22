// Генерация ПОЛНОЙ importMap в обход payload/dist/exports/node.js (loadEnv-краш)
import { pathToFileURL } from 'node:url'
import config from './payload.config'

async function main() {
  const payloadDist = pathToFileURL(
    process.cwd() + '/node_modules/payload/dist/index.js'
  ).href
  const mod: any = await import(payloadDist)
  const cfg = await (config as any)
  await mod.generateImportMap(cfg, { log: true })
  console.log('OK: полная importMap сгенерирована')
}
main().catch((e) => { console.error('FAIL:', e?.message); process.exit(1) })
