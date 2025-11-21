---
title: "Exploring the Primitives of an Agentic Coding Setup"
description: "Reflecting on the foundational layers of agentic systems—from Git workflows and networking to storage and sandboxing—rather than high-level orchestration."
pubDate: "Nov 18 2025"
topics: ["agents", "git", "infrastructure", "networking", "sqlite"]
type: "note"
---

I learnt about a cool little tool for checking the Git status of multiple projects. I find myself leaning more and more on submodules, worktrees and multiple Git projects as a very simple baseline setup for exploratory agentic work.

[Hacker News discussion](https://news.ycombinator.com/item?id=45925109) | [Tool: myrepos](https://myrepos.branchable.com/related/)

I find myself exploring the space of ideas around the basic primitives of a good agentic coding setup. At the moment many of the projects and tools in this space jump straight to the top of the stack and try to knit together too many things at the application layer. I do not have strong evidence, but my sense is that grounding yourself in solid underlying principles and moving closer, though not necessarily all the way, to the bare metal of the software stack will lead to better ideas.

## Networking

Networking is one example. I think there is far too much effort placed on orchestration at the wrong level and this limits the potential of the systems that are built on top of it. My feeling is that a small number of well chosen primitives built on solid networking understanding will lead to something better. In this area I am inspired by the WireGuard protocol and by what Tailscale has achieved.

## Data Storage

There are other interesting primitives as well. The data storage layer is one and there are promising projects from the likes of the Turso team and others that use SQLite much more intensively for recording and tracking changes in an agentic workflow.

## Sandboxing

Sandboxing is another area with many layers such as dedicated virtual machines, Docker containers, permission restrictions and WebAssembly sandboxes. There is a lot to explore here. My intuition again is that we should start from a set of core primitives and ignore much of the existing higher level application noise.

## File Systems

Using something like a FUSE file system or macFUSE it becomes possible to imagine a link between SQLite and the primitives of the file system to create something that more automatically manages the multi file creation process that you see in agentic coding projects. This includes planning documents, summary documents, idea documents, scoping, research notes, throwaway code and short term scripts.
