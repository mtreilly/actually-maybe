---
title: "Freeport: A Lightweight Port Management Tool for Development"
description: "A thin wrapper around native commands to simplify port checking and process management during local development."
pubDate: "Jan 08 2026"
topics: ["tools", "cli", "development", "agents"]
type: "note"
---

When running multiple development servers—especially during agentic coding sessions where processes spawn and die frequently—port conflicts become a recurring annoyance.

The native tools exist. You can cobble together `lsof -i :3000` and `kill -9` and get the job done. But the commands are fiddly enough that I never quite remember the exact incantation. So I built a small CLI wrapper called Freeport to make this slightly less tedious.[^1]

## What It Does

The tool does a handful of things:

- **list**: Show all listening TCP ports with their associated processes
- **who**: See exactly what is running on a specific port
- **kill**: Terminate whatever is hogging a port (with sensible safety defaults)
- **check**: Verify if a port is free, useful for scripting
- **pick**: Find an available port within a range
- **run**: Execute a command with an automatically allocated port

That last one is particularly useful. You can run `freeport run --prefer 3000 -- npm run dev` and it will find port 3000 if available, or quietly fall back to the next free port in the range.

## Why Bother

The honest answer is that you do not strictly need this. Everything Freeport does can be accomplished with `lsof`, `ss`, and `kill`. But there is something to be said for reducing friction, especially for operations you perform dozens of times a day.

I have also found it useful in agentic workflows where multiple agents might spawn development servers simultaneously. Having a tool that can atomically pick and lock a port prevents the race condition where two processes both think port 3000 is free and then collide.

The implementation is straightforward Go—a single binary with no daemon, no background services. It queries the OS directly each time you run a command. Nothing clever, just a thin layer of convenience over existing system tools.

## The Broader Point

This fits into something I keep returning to: the value of small, sharp tools in agentic development environments. The temptation is always to build elaborate orchestration systems. But often what you actually need is a handful of reliable primitives that do one thing well.

Freeport is not going to change your life. But the next time you are staring at "address already in use" and cannot remember the `lsof` flags, it might save you thirty seconds.

[^1]: Available at [github.com/mtreilly/freeport](https://github.com/mtreilly/freeport).
