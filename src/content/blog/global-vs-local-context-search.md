---
title: "The Different Problems of Searching Global and Local Context"
description: "Exploring why global-context search is easier than local-context search, and what tools built with local context in mind might look like"
pubDate: "Oct 31 2022"
topics: ["search", "context", "information-retrieval", "ux", "tools"]
type: "essay"
---

Searching via global context and searching via local context are two different problems. While both require the ability to recognise and index information, global-context search is considerably easier. When you search for a tutorial on Python decorators, facts about pandas, or the president of a particular country, you're not relying on deeper background information that a system must infer. It can therefore direct you relatively easily to the correct source.

Global-context search does not rely on personal information. It's invariant across people.

Local-context search, however, is heavily influenced by an individual's needs, interests, and history.

## The Blurred Line Between Global and Local

This distinction is often blurred, though. Simplifying assumptions are often introduced to give the appearance of improved local context. For example, searching for the current weather based on your device location seems sensible when no other information is provided. A general search becomes a local-contextual search.

But these assumptions are rarely simple. Even the weather example can fail if the system's inferred context is based on outdated or incorrect assumptions. If I'm flying to Berlin and then ask for the current weather, using my physical location alone would produce an erroneous result. The correct contextual answer depends on the previously implied knowledge about my travel plans.

This simple weather example is not unique. Many similar scenarios exist, and people are working on variants that attempt to preserve relative context. But once we move beyond straightforward informational tasks, the limitations of our tools become apparent.

Our tools are built with a global-context-first approach, with local context bolted on afterwards. The abstractions are incredibly leaky.

## So What Would a Better Tool Look Like?

### Thinking About Local Context

Earlier, I mentioned the search term *"Python decorators"* as an example of global-context search. That's true—insofar as we're searching for information about decorators. But rarely is that the true goal of the search. Implicitly, the actual query might be something like:

> "Look for more details about Python decorators. I already understand wrapped functions, but I'm specifically looking for API design patterns related to decorators in a web framework context. I'm working on a new ASGI-based framework."

The real question becomes: **how do we retrieve this local information to shape the search appropriately?**

A useful system would need to know:

- what your existing knowledge is
- what you've previously explored
- what you're currently trying to achieve

Exploring this in detail is something I want to tackle in later posts. But before closing, I want to leave a few thoughts.

## Some Observations About Local Context

- We have enormous contextual knowledge embedded in our trail of interactions.
- As a rule, our tastes and knowledge shift gradually, not abruptly.
- Our local context forms a kind of graph. New knowledge integrates successfully when it aligns with existing nodes and with our directional interests.
- This graph decays over time—older interests become less relevant.
- Our local graph exists within a universe of other graphs:
  - the ones we've had over time
  - the ones others have
  - and those built from broader world knowledge

Understanding these graphs—and searching within them—is the key to moving from global search to truly meaningful local-context search.
