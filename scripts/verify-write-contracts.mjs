#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = process.env.LOCAL_DASHBOARD_BASE_URL || 'http://127.0.0.1:3054'
const TOKEN = process.env.BUILDFLOW_ACTION_TOKEN || ''

if (!TOKEN) {
  console.error('BUILDFLOW_ACTION_TOKEN is required')
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {})
    }
  })
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  assert(contentType.includes('application/json'), `Expected JSON from ${url}, got ${response.status} ${contentType}\n${text.slice(0, 500)}`)
  const json = JSON.parse(text)
  return { response, json }
}

async function main() {
  const title = `Internal write contract smoke ${Date.now()}.md`
  const content = 'Internal write contract smoke test.'

  const createPlan = await requestJson(`${BASE_URL}/api/actions/create-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceId: 'buildflow',
      title,
      content
    })
  })

  assert(createPlan.response.status === 200, `create-plan should return 200, got ${createPlan.response.status}`)
  assert(createPlan.json.verified === true, 'create-plan must return verified:true')
  assert(typeof createPlan.json.path === 'string' && createPlan.json.path.length > 0, 'create-plan path missing')
  const artifactPath = createPlan.json.path
  const diskPath = path.resolve(process.cwd(), artifactPath)
  assert(fs.existsSync(diskPath), `created file missing on disk: ${diskPath}`)
  assert(fs.readFileSync(diskPath, 'utf8') === content, 'created file content mismatch')

  const readBack = await requestJson(`${BASE_URL}/api/actions/read-context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'read_paths', sourceId: 'buildflow', paths: [artifactPath], maxBytesPerFile: 10000 })
  })
  assert(readBack.response.status === 200, `read-context should return 200, got ${readBack.response.status}`)
  const file = (readBack.json.files || []).find(entry => entry.path === artifactPath)
  assert(file && typeof file.content === 'string' && file.content === content, 'read-back content mismatch')

  if (fs.existsSync(diskPath)) {
    fs.unlinkSync(diskPath)
  }
  assert(!fs.existsSync(diskPath), 'cleanup failed')

  console.log('Write contract verification passed.')
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
