# Preserve local projections whilst sharing real invariants

Date: 2026-09-26

## Context

Routes, Markdown builders, graph views, and browser enhancements sometimes repeat
loops or use similar data. Most express different output requirements; a smaller
subset repeats shared publishing, identity, and relevance decisions.

## Decision

For this review, preserve filesystem routes, explicit output builders, local DOM
state, and the graph projection. Recommend sharing public eligibility and factual
identity through their natural owners. Investigate relevance meaning before sharing
selectors. Record implementation opportunities rather than performing a broad rewrite.

## Reason

Adding a post, editing a contact address, or changing recommendations should not
require a generic feature framework. Boundaries should reduce coordination for
these actual changes. The review objective asks for architectural knowledge and
recommendations, not implementation of every recommendation.

## Revisit when

A repeated mature policy changes together across several surfaces, or a new output
requires duplicated editorial facts. Use representative change traces to evaluate
the proposed boundary rather than file size or repetition counts.
