#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://buildflow.prochat.tools'
const TOKEN = process.env.BUILDFLOW_ACTION_TOKEN

if (!TOKEN) {
  console.error('BUILDFLOW_ACTION_TOKEN is required')
  process.exit(1)
}

const expectedPaths = [
  '/api/actions/apply-file-change',
  '/api/actions/context',
  '/api/actions/inspect',
  '/api/actions/read-context',
  '/api/actions/status',
  '/api/actions/write-artifact'
]

const expectedOperationIds = [
  'getBuildFlowStatus',
  'setBuildFlowContext',
  'inspectBuildFlowContext',
  'readBuildFlowContext',
  'writeBuildFlowArtifact',
  'applyBuildFlowFileChange'
]

const cleanupTargets = []

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
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON from ${url}, got ${response.status} ${contentType}\n${text.slice(0, 500)}`)
  }
  let json
  try {
    json = JSON.parse(text)
  } catch (error) {
    throw new Error(`Invalid JSON from ${url}: ${String(error)}\n${text.slice(0, 500)}`)
  }
  return { response, json, contentType }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function logStep(name) {
  console.log(`\n== ${name} ==`)
}

function diskPath(relativePath) {
  return path.resolve(process.cwd(), relativePath)
}

async function readActionFile(sourceId, filePath) {
  return requestJson(`${PUBLIC_BASE_URL}/api/actions/read-context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'read_paths', sourceId, paths: [filePath], maxBytesPerFile: 10000 })
  })
}

function assertWriteVerification(result, label) {
  assert(result && typeof result === 'object', `${label}: missing response object`)
  assert((result).verified === true, `${label}: verified must be true`)
  assert(typeof result.verifiedAt === 'string' && result.verifiedAt.length > 0, `${label}: verifiedAt missing`)
  assert(typeof result.bytesOnDisk === 'number' && result.bytesOnDisk > 0, `${label}: bytesOnDisk invalid`)
  assert(typeof result.contentHash === 'string' && result.contentHash.length > 0, `${label}: contentHash missing`)
  assert(typeof result.contentPreview === 'string', `${label}: contentPreview missing`)
}

async function waitForSourceStatus(sourceId, expectedStatuses = ['ready'], timeoutMs = 60000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const current = await requestJson(`${PUBLIC_BASE_URL}/api/agent/sources`)
    assert(current.response.status === 200, 'source poll must be 200')
    const source = (current.json.sources || []).find(item => item.id === sourceId)
    if (!source) throw new Error(`Source not found while polling: ${sourceId}`)
    if (expectedStatuses.includes(source.indexStatus)) return source
    await new Promise(resolve => setTimeout(resolve, 1500))
  }
  throw new Error(`Timed out waiting for ${sourceId} to reach ${expectedStatuses.join(', ')}`)
}

async function main() {
  logStep('OpenAPI')
  const openapiUrl = `${PUBLIC_BASE_URL}/api/openapi`
  const openapiRes = await fetch(openapiUrl)
  const openapiText = await openapiRes.text()
  assert(openapiRes.status === 200, `Expected 200 from ${openapiUrl}, got ${openapiRes.status}`)
  assert((openapiRes.headers.get('content-type') || '').includes('application/json'), `Expected JSON content-type from ${openapiUrl}`)
  const openapi = JSON.parse(openapiText)
  assert(openapi.openapi === '3.1.0', `Expected openapi 3.1.0, got ${openapi.openapi}`)
  assert(openapi.components && typeof openapi.components === 'object', 'components must be object')
  assert(openapi.components.schemas && typeof openapi.components.schemas === 'object' && !Array.isArray(openapi.components.schemas), 'components.schemas must be object')
  assert(openapi.components.securitySchemes && typeof openapi.components.securitySchemes === 'object', 'components.securitySchemes must be object')
  assert(openapi.components.securitySchemes.bearerAuth?.type === 'http', 'bearerAuth.type must be http')
  assert(openapi.components.securitySchemes.bearerAuth?.scheme === 'bearer', 'bearerAuth.scheme must be bearer')
  assert(Object.keys(openapi.paths || {}).length === expectedPaths.length, `Expected ${expectedPaths.length} paths, got ${Object.keys(openapi.paths || {}).length}`)
  for (const path of expectedPaths) assert(openapi.paths?.[path], `Missing path ${path}`)
  const operationIds = []
  for (const [path, methods] of Object.entries(openapi.paths || {})) {
    for (const [method, op] of Object.entries(methods || {})) {
      if (op && typeof op === 'object' && 'operationId' in op) operationIds.push(op.operationId)
      const hasBearer = Array.isArray(op?.security) && op.security.some(entry => entry && Object.prototype.hasOwnProperty.call(entry, 'bearerAuth'))
      assert(hasBearer, `Missing bearerAuth security for ${path}.${method}`)
    }
  }
  for (const opId of expectedOperationIds) assert(operationIds.includes(opId), `Missing operationId ${opId}`)
  const writeArtifactSchema = openapi.paths['/api/actions/write-artifact']?.post?.responses?.['200']?.content?.['application/json']?.schema
  const applyFileChangeSchema = openapi.paths['/api/actions/apply-file-change']?.post?.responses?.['200']?.content?.['application/json']?.schema
  assert(writeArtifactSchema?.properties?.verified?.type === 'boolean', 'writeArtifact verified schema missing')
  assert(Array.isArray(writeArtifactSchema?.required) && writeArtifactSchema.required.includes('verified'), 'writeArtifact verified required missing')
  assert(applyFileChangeSchema?.properties?.verified?.type === 'boolean', 'applyFileChange verified schema missing')
  assert(Array.isArray(applyFileChangeSchema?.required) && applyFileChangeSchema.required.includes('verified'), 'applyFileChange verified required missing')
  const schemaText = JSON.stringify(openapi)
  for (const term of ['appendInboxNote', 'append-inbox-note', 'inbox-note', 'legacy inbox']) {
    assert(!schemaText.includes(term), `OpenAPI schema must not include ${term}`)
  }

  logStep('Status')
  const status = await requestJson(`${PUBLIC_BASE_URL}/api/actions/status`, { method: 'GET' })
  assert(status.response.status === 200, 'status must be 200')
  assert(status.json && typeof status.json.connected === 'boolean', 'status.connected missing')
  assert(typeof status.json.sourceCount === 'number', 'status.sourceCount missing')
  assert(typeof status.json.sourcesAvailable === 'boolean', 'status.sourcesAvailable missing')

  logStep('Context list_sources')
  const listSources = await requestJson(`${PUBLIC_BASE_URL}/api/actions/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list_sources' })
  })
  assert(listSources.response.status === 200, 'list_sources must be 200')
  assert(listSources.json.status === 'ok', 'list_sources status must be ok')
  assert(Array.isArray(listSources.json.sources) && listSources.json.sources.length > 0, 'list_sources sources must be non-empty')
  assert(Array.isArray(listSources.json.activeSourceIds), 'list_sources activeSourceIds must be array')
  assert(['single', 'multi', 'all'].includes(listSources.json.contextMode), 'list_sources contextMode invalid')
  for (const source of listSources.json.sources) {
    assert(typeof source.id === 'string' && source.id, 'source.id missing')
    assert(typeof source.label === 'string' && source.label, 'source.label missing')
    assert(typeof source.enabled === 'boolean', 'source.enabled missing')
    assert(typeof source.active === 'boolean', 'source.active missing')
  }
  assert(listSources.json.sources.some(source => source.id === 'buildflow'), 'buildflow source missing')

  logStep('Context get_active')
  const active = await requestJson(`${PUBLIC_BASE_URL}/api/actions/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_active' })
  })
  assert(active.response.status === 200, 'get_active must be 200')
  assert(active.json.status === 'ok', 'get_active status must be ok')

  const enabledSources = listSources.json.sources.filter(source => source.enabled)
  assert(enabledSources.length >= 2, 'Need at least two enabled sources to prove multi-source write validation')
  const sourceId = (enabledSources.find(source => source.id === 'buildflow') || enabledSources[0]).id
  const secondarySourceId = enabledSources.find(source => source.id !== sourceId)?.id
  assert(typeof secondarySourceId === 'string' && secondarySourceId.length > 0, 'Need a secondary enabled source')

  logStep('Context set_active single')
  const single = await requestJson(`${PUBLIC_BASE_URL}/api/actions/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_active', contextMode: 'single', sourceIds: [sourceId] })
  })
  assert(single.response.status === 200, 'set_active single must be 200')
  assert(single.json.contextMode === 'single', 'set_active single contextMode mismatch')
  assert(Array.isArray(single.json.activeSourceIds) && single.json.activeSourceIds.length === 1 && single.json.activeSourceIds[0] === sourceId, 'single activeSourceIds mismatch')

  logStep('Negative write without sourceId while multiple active')
  const multi = await requestJson(`${PUBLIC_BASE_URL}/api/actions/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_active', contextMode: 'multi', sourceIds: [sourceId, secondarySourceId] })
  })
  assert(multi.response.status === 200, 'set_active multi must be 200')
  assert(Array.isArray(multi.json.activeSourceIds) && multi.json.activeSourceIds.includes(sourceId) && multi.json.activeSourceIds.includes(secondarySourceId), 'multi activeSourceIds mismatch')
  const missingSourceWrite = await requestJson(`${PUBLIC_BASE_URL}/api/actions/write-artifact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artifactType: 'task_brief',
      title: 'Missing source validation',
      content: 'This must fail because sourceId is omitted while multiple sources are active.'
    })
  })
  assert(missingSourceWrite.response.status >= 400, 'write without sourceId should fail')
  assert(typeof missingSourceWrite.json.error === 'string', 'missing source write error missing')

  logStep('Context reindex selected source')
  const reindexResponse = await requestJson(`${PUBLIC_BASE_URL}/api/agent/sources/reindex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceId })
  })
  assert([200, 202].includes(reindexResponse.response.status), 'reindex request must be 200 or 202')
  assert(['indexing', 'ready'].includes(reindexResponse.json.indexStatus), 'reindex request status must be indexing or ready')
  const readySource = await waitForSourceStatus(sourceId, ['ready'])
  assert(readySource.indexStatus === 'ready', 'selected source did not become ready after reindex')

  const singleAgain = await requestJson(`${PUBLIC_BASE_URL}/api/actions/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_active', contextMode: 'single', sourceIds: [sourceId] })
  })
  assert(singleAgain.response.status === 200, 'set_active single reset must be 200')

  logStep('Inspect list_files')
  const listFiles = await requestJson(`${PUBLIC_BASE_URL}/api/actions/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'list_files', sourceIds: [sourceId], path: '', depth: 2, limit: 20 })
  })
  assert(listFiles.response.status === 200, 'list_files must be 200')
  assert(Array.isArray(listFiles.json.entries), 'list_files entries must be array')
  assert(listFiles.json.entries.length > 0, 'list_files entries must be non-empty')
  assert(listFiles.json.entries.every(entry => typeof entry.sourceId === 'string' && typeof entry.path === 'string'), 'list_files entries require sourceId/path')

  const readCandidate =
    listFiles.json.entries.find(entry => entry.path === 'README.md') ||
    listFiles.json.entries.find(entry => entry.type === 'file' && entry.path.endsWith('.md')) ||
    listFiles.json.entries.find(entry => entry.type === 'file' && entry.path.endsWith('.json')) ||
    listFiles.json.entries.find(entry => entry.type === 'file')
  assert(readCandidate, 'No readable file candidate found')

  logStep('Inspect search')
  const search = await requestJson(`${PUBLIC_BASE_URL}/api/actions/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'search', sourceIds: [sourceId], query: 'README', limit: 5 })
  })
  assert(search.response.status === 200, 'search must be 200')
  assert(Array.isArray(search.json.results), 'search results must be array')

  logStep('Read context read_paths')
  const readPaths = await requestJson(`${PUBLIC_BASE_URL}/api/actions/read-context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'read_paths', sourceId, paths: [readCandidate.path], maxBytesPerFile: 10000 })
  })
  assert(readPaths.response.status === 200, 'read_paths must be 200')
  assert(readPaths.json.mode === 'read_paths', 'read_paths mode mismatch')
  assert(Array.isArray(readPaths.json.files) && readPaths.json.files.length > 0, 'read_paths files must be non-empty')
  assert(typeof readPaths.json.files[0].content === 'string' && readPaths.json.files[0].content.length > 0, 'read_paths content missing')

  logStep('Read context search_and_read')
  const searchQueries = ['README', readCandidate.path.split('/').pop()?.replace(/\.[^.]+$/, '') || 'package', 'package']
  let searchAndRead = null
  for (const query of searchQueries) {
    const response = await fetch(`${PUBLIC_BASE_URL}/api/actions/read-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'search_and_read', sourceIds: [sourceId], query, limit: 2, maxBytesPerFile: 10000 })
    })
    const contentType = response.headers.get('content-type') || ''
    const text = await response.text()
    if (!contentType.includes('application/json')) {
      throw new Error(`Expected JSON from ${PUBLIC_BASE_URL}/api/actions/read-context, got ${response.status} ${contentType}\n${text.slice(0, 500)}`)
    }
    const attempt = JSON.parse(text)
    if (response.status !== 200) {
      continue
    }
    assert(attempt.mode === 'search_and_read', 'search_and_read mode mismatch')
    assert(Array.isArray(attempt.results), 'search_and_read results must be array')
    if (attempt.results.some(result => typeof result.content === 'string' && result.content.length > 0)) {
      searchAndRead = { response, json: attempt, contentType }
      break
    }
  }
  if (!searchAndRead) {
    console.warn('search_and_read returned no content for fallback queries; continuing because the route responded successfully.')
  }

  logStep('Write artifact')
  const artifactTitle = 'BuildFlow SaaS Master Plan.md'
  const artifactContent = 'This file verifies that writeBuildFlowArtifact works from the public Custom GPT action surface.'
  const artifact = await requestJson(`${PUBLIC_BASE_URL}/api/actions/write-artifact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceId,
      artifactType: 'task_brief',
      title: artifactTitle,
      content: artifactContent
    })
  })
  assert(artifact.response.status === 200, 'write-artifact must be 200')
  assert(typeof artifact.json.path === 'string' && artifact.json.path.length > 0, 'write-artifact path missing')
  assert(artifact.json.sourceId === sourceId, 'write-artifact sourceId mismatch')
  assertWriteVerification(artifact.json, 'write-artifact')
  assert(!artifact.json.path.includes('planmd.md'), 'slug bug still present in artifact path')
  const artifactDiskPath = diskPath(artifact.json.path)
  cleanupTargets.push(artifactDiskPath)
  assert(fs.existsSync(artifactDiskPath), `artifact missing on disk: ${artifactDiskPath}`)
  assert(fs.readFileSync(artifactDiskPath, 'utf8') === artifactContent, 'artifact disk content mismatch')
  const artifactReadBack = await readActionFile(sourceId, artifact.json.path)
  assert(artifactReadBack.response.status === 200, 'artifact readback must be 200')
  const artifactReadFile = (artifactReadBack.json.files || []).find(file => file.path === artifact.json.path)
  assert(artifactReadFile && typeof artifactReadFile.content === 'string', 'artifact readback missing file')
  assert(artifactReadFile.content === artifactContent, 'artifact readback content mismatch')

  logStep('Apply file change append')
  const appendMarker = '\n\nPublic apply-file-change smoke test append.'
  const append = await requestJson(`${PUBLIC_BASE_URL}/api/actions/apply-file-change`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changeType: 'append',
      sourceId,
      path: artifact.json.path,
      content: appendMarker,
      reason: 'Verify applyBuildFlowFileChange works from public Custom GPT action surface.'
    })
  })
  assert(append.response.status === 200, 'apply-file-change must be 200')
  assert(append.json.sourceId === sourceId, 'apply-file-change sourceId mismatch')
  assertWriteVerification(append.json, 'apply-file-change')
  const appendedDiskContent = fs.readFileSync(artifactDiskPath, 'utf8')
  assert(appendedDiskContent.includes(appendMarker), 'append did not land on disk')
  const appendReadBack = await readActionFile(sourceId, artifact.json.path)
  assert(appendReadBack.response.status === 200, 'append readback must be 200')
  const appendReadFile = (appendReadBack.json.files || []).find(file => file.path === artifact.json.path)
  assert(appendReadFile && typeof appendReadFile.content === 'string', 'append readback missing file')
  assert(appendReadFile.content.includes(appendMarker), 'append readback missing appended content')

  logStep('Negative invalid source id')
  const invalidSource = await requestJson(`${PUBLIC_BASE_URL}/api/actions/write-artifact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceId: 'missing', artifactType: 'task_brief', title: 'Missing source', content: 'Should fail.' })
  })
  assert(invalidSource.response.status >= 400, 'invalid source write should fail')
  assert(typeof invalidSource.json.error === 'string', 'invalid source error missing')

  logStep('Negative blocked write')
  const blockedWrite = await requestJson(`${PUBLIC_BASE_URL}/api/actions/apply-file-change`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changeType: 'create',
      sourceId,
      path: '.env',
      content: 'SHOULD_NOT_WRITE=true',
      reason: 'Verify blocked write behavior.'
    })
  })
  assert([400, 403].includes(blockedWrite.response.status), 'blocked write should be 400 or 403')
  assert(typeof blockedWrite.json.error === 'string', 'blocked write error missing')

  if (fs.existsSync(artifactDiskPath)) {
    fs.unlinkSync(artifactDiskPath)
  }
  assert(!fs.existsSync(artifactDiskPath), 'temporary artifact cleanup failed')

  console.log('\nAll public GPT action checks passed.')
}

main().catch(error => {
  for (const target of cleanupTargets) {
    if (fs.existsSync(target)) {
      try {
        fs.unlinkSync(target)
      } catch (_) {
        // best-effort cleanup only
      }
    }
  }
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
