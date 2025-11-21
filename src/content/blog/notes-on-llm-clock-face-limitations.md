---
title: "Notes on LLM Clock Face Limitations"
description: "LLMs struggle to generalize clock face generation beyond the standard 12 divisions, highlighting a specific gap in reasoning versus training data memorization."
pubDate: "Nov 18 2025"
topics: ["llms", "generative-ai", "failures", "generalization"]
type: "note"
---

An interesting thing I learnt, inspired by a comment on LLM clocks, is that LLMs struggle to generate clock faces with more than twelve divisions. Perhaps there is a type of prompt that would work, but when you ask in a straightforward way it simply does not. The model tries to cheat by changing the numbers rather than the number of divisions.[^1]

A direct approach does not work.

Using historical examples of other clock face divisions also did not work.

I am sure there is some prompt or instruction that would eventually work, but out of the box it is quite interesting how LLMs and diffusion models remain tied to this pattern. Clearly it is a training data issue, but at the same time it nicely shows a gap in generalisation. I am confident that if I gave similar instructions to an eight year old they could easily draw a rough version of what I am looking for.

[^1]: See [Hacker News discussion](https://news.ycombinator.com/item?id=45930664).
