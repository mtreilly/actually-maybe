---
title: "Software Architecture That Agents Actually Like"
description: "Structural patterns that make codebases easier for AI agents to navigate: composition over monoliths, stateless mini-CLIs, typed languages, and the editor navigation test."
pubDate: "Jan 30 2026"
topics: ["agents", "architecture", "software-design"]
type: "note"
---

I've been thinking a lot about the structural techniques that agents seem to favor. There are patterns I keep noticing—things that make them work better, and things that confuse them.

## Composition Over Monoliths

Agents really like composition out of different parts. Monorepos where they can see over everything. One big project? They tend to get confused. But if you can break it down into multiple projects, things go smoother.

So rather than have a CLI that does all the different things, what you want is lots of little tiny mini CLIs and a CLI router between them. Then try to think of each CLI as stateless as possible, or centralize all the data management in one place.

These are ideas I've noticed agents seem to favor. And structurally, they're just good software practices anyway. If you can have a design that's limited in scope and stateless, you're gonna have a better outcome. This carries over to more complex systems too—you're just building them out of compositional pieces, smaller pieces.

## The Multi-Service Sweet Spot

There's a nicer experience when you can push towards more of a multi-service architecture in a monorepo. You iterate on different pieces and there's a defined contract between them.

Lots of linting rules help. You can make custom linting rules—agents don't really care about the overhead, they just follow them. Git hooks too. I don't really like git hooks personally, but agents work quite well with them because it forces them to check things. And because there are so many different standards between different agents, git hooks are a nice standard way that just forces them to confront issues before they become problems.

## Types Are Your Friend

I do think there are other things worth exploring. Compiled languages have a nice experience. I've had some luck with Go when building things because there are explicit errors when you compile. But I think that's kind of a known thing already—you can see that drive towards adding types to Python, the usage of TypeScript, or some sort of types for JavaScript like JSDoc.

## The Editor Navigation Test

Here's another pattern I've noticed: if a codebase is easy to navigate in your editor, agents will probably handle it well too.

Think about it—you're looking for how routes are handled in some large React application. If you can think ahead of time about where that code lives, bring up the command menu, and jump directly to that file... that feeling of navigating a codebase like that? That's generally also a codebase where agents work quite well.

There's something implicit here. By the weakness of your own working memory, if you can have a codebase where you can do that kind of navigation, then agents can handle it better. They can infer and understand the structure.

If you're lost, they're lost.
