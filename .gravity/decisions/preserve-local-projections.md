# Preserve local projections whilst sharing real invariants

Date: 2026-09-26

## Context

Routes, Markdown builders, graph views, and browser enhancements sometimes repeat
loops or use similar data. Most express different output requirements; a smaller
subset repeats shared publishing, identity, and relevance decisions.

## Decision

Preserve filesystem routes, explicit output builders, local DOM state, and the graph
projection. Implementation shares public eligibility and identity facts through their
natural owners. Sidebar/Markdown reading selection, latest home selection, post kinds,
and graph-page selections share their actual invariants, without a generic registry.

## Reason

Adding a post or editing an identity fact should not require coordinated factual edits.
Separate markup and local grouping still express different needs. The five fixes address
observed ownership failures without reorganising unrelated workflows.

## Revisit when

A repeated mature policy changes together across several surfaces, or a new output
requires duplicated editorial facts. Use representative change traces to evaluate
the proposed boundary rather than file size or repetition counts.
