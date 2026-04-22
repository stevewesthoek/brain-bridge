# BuildFlow Domain and Endpoint Migration Checklist

Objective: move the canonical public endpoint from the legacy domains:

- `buildflow.prochat.tools`
- `buildflow.prochat.tools`

to:

- `buildflow.prochat.tools`

without breaking existing imports during the transition.

## Infrastructure

- [ ] Provision `buildflow.prochat.tools`
- [ ] Point it to the current web/API layer
- [ ] Verify TLS / certificate issuance
- [ ] Verify app routing under the new domain

## Application Config

- [ ] Update canonical app URL in environment/config
- [ ] Update metadata / SEO / page titles
- [ ] Update any hardcoded domain references in the web app
- [ ] Update OpenAPI endpoint generation if domain-aware

## GPT / OpenAPI

- [ ] Update canonical OpenAPI URL to `https://buildflow.prochat.tools/api/openapi`
- [ ] Update Custom GPT instructions in docs
- [ ] Update Custom GPT schema to BuildFlow naming
- [ ] Test action import from the new endpoint
- [ ] Test bearer auth flow from the new endpoint
- [ ] Test action calls end-to-end

## Compatibility

- [ ] Keep `buildflow.prochat.tools` active temporarily
- [ ] Keep `buildflow.prochat.tools` active temporarily
- [ ] Redirect or proxy legacy domains to the new canonical domain where sensible
- [ ] Avoid breaking existing imports abruptly

## Docs

- [ ] Replace all public docs references to old endpoints
- [ ] Update README quickstart
- [ ] Update deployment docs
- [ ] Update screenshots / examples
- [ ] Update site copy and CTA links

## QA

- [ ] Test `/api/openapi`
- [ ] Test health endpoint(s)
- [ ] Test readiness endpoint(s)
- [ ] Test search/read action flow
- [ ] Test any write action currently exposed
- [ ] Verify CORS / auth / proxy behavior if relevant

## Acceptance criteria

- `buildflow.prochat.tools` is canonical everywhere public
- legacy domains do not break existing workflows during transition
- Custom GPT setup works against the new domain
- public docs no longer present BuildFlow or BuildFlow as the main endpoint identity