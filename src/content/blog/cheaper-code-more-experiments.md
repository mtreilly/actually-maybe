---
title: "Cheaper Code Should Mean More Experiments"
description: "When working with agentic tools, the instinct to solve hard problems inside your main project is usually wrong. Isolate the core problem first, experiment freely, then bring what works back."
pubDate: "Feb 20 2026"
topics: ["agents", "workflow", "experimentation"]
type: "note"
---

When working with agentic tools, there's usually a core piece of the problem that the tool will struggle with. Building that piece inside your main project is rarely the right move. It gets confused with everything else, context bleeds in, and you end up with something messy that's hard to unpick later.

The better approach is to isolate it. Create a throwaway repo or folder and work on just that problem in the clear.

## An Example: Data Extraction

Say you want to build something that scrapes or captures data from a website. If you build that out inside your main project from the start, you'll find the core extraction problem gets entangled with the wider codebase. The agent loses focus, you lose focus, and you're debugging two things at once.

A separate throwaway repo gives you the space to try multiple approaches on just that problem. What works, what doesn't, where the edges are. Once you're satisfied, you start a second project. Not moving the code wholesale, but extracting the working principles and wrapping them into something coherent.

## Another Example: Stitching Services Together

The same applies when you're integrating several services. Transcription, embeddings, search: if you want to understand how those things connect, the glue layers and integration points aren't obvious upfront. What the contracts look like, what breaks, what you'd do differently.

A throwaway project is the right place to find that out. Especially if you're relying on open source models or third-party tools you haven't used before. Try things, throw them away.

## Building Intuition

What you get from this process is intuition. The same intuition you build up when working through a hard coding problem by hand: a sense of where the seams are, where the friction lives, where you're likely to hit problems during development.

From that, you build the second project with more confidence. You know what matters and what doesn't. And there's no reason you can't do a third iteration after that.

## The Point

Coding agents drop the cost of producing code significantly. That should change how many experiments you run, not just how fast you ship. The lower the cost of code, the more you can afford to throw away. And the more you should.

Use that. Experiment more than you would have before.
