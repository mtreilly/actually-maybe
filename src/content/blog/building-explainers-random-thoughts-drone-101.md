---
title: "Building Explainers Random Thoughts - Drone 101"
description: "An experiment in interactive explainers: drone control, Fourier, Bret Victor, philosophical prompts, accessibility, and learning with LLMs."
pubDate: "Sep 26 2026"
topics: ["learning", "agents", "llms", "experimentation", "visualisation", "drones", "accessibility", "languages", "mathematics", "philosophy"]
type: "note"
---

I wanted to experiment with the explainer-style creations I have seen floating around with the newer Claude models. There is some material that I have liked and used myself that I wanted to integrate into an idea. I chose a subject that has a certain progression: how a drone keeps itself in the air.

The result is [Who Keeps the Drone Up?](https://drone.actuallymaybe.com), an interactive course that starts with an uncooperative shower and builds towards feedback, Laplace transforms, poles, and PID control. It was built mostly with Claude Opus 5.5, with GPT-Sol 6 used for cross-checking and code-quality reviews.

This may or may not work for other subjects, so I will probably try further experiments later. It connects to something I have [written about before: learning concepts that build on other concepts](/blog/conceptual-learning-anki-books/). How do you preserve the relationships between the pieces whilst giving someone a feel for them?

## Building up the intuition

I am drawing on the ideas from the book *Who Is Fourier?*.[^fourier] It has this pedagogical style where characters talk through things, and each subsequent chapter builds up an intuitive understanding. I recommend it. The approach to learning the mathematical concept of a Fourier transform as if you were learning a language is a cool thing to do.

Then there are some ideas popularised by Bret Victor, but only very slightly.[^victor] It was a small bit I added towards the end, just to make the numbers slightly more explorable. I would like to do more of that, because this is a very shallow take on that wider idea.

There are other ideas you see quite commonly in explainers. You start with some limited, compressed idea. You have a picture, some symbolic manipulation, and hopefully you can build up an intuition or a feel for the thing.

One thing I was unsure about was whether to make it so mathematically explicit. Should I err on the side of removing the mathematics altogether? I think that would be a useful experiment to try later. For this one, I assumed the person already has some background in algebra or basic mathematical symbolic manipulation.

## Philosophical prompts and engineering

Another part of the experiment came from something I have noticed: broader philosophical works can work quite well with LLMs within engineering.

It is a strange thing. I do not want to be heavily prescriptive about how something should be done. I have found that nudging the model with philosophically drawn ideas can move it into a basin where it exercises a bit more judgement, or is, for want of a better word, more holistic. It kind of works, and kind of does not. I will probably experiment more with different pieces.

You still need to ground it in engineering, but I think it is an unexplored space. Here I used ideas from Simone Weil's *Gravity and Grace* and her wider work.[^weil] In the quality prompts, those became ideas about attention before judgement, where responsibilities accumulate, and where a small change might remove several sources of complexity.

From what I have been reading from that period, I also find Simone de Beauvoir's *The Ethics of Ambiguity* peculiarly well suited as a framework to think about engineering.[^beauvoir] I think it is something about how it deals with the relation of things to others. But these are rambling thoughts, probably something to tease out and explore more.

## Little delights, and useful constraints

With the animations, I tried to include little bits of delight. When you push things to an extreme, the drone can go off its picture and bump into the text. There are also subtle animations that I hope are not too distracting.

Another thing I have found with these LLM-assisted projects is that it can be better to add more constraints for yourself, and more best practices. The feel of the software and the structure of the code can end up in a better position if you strive to make it accessible, internationalised, and responsive across different viewports and situations.

All these constraints work as a sieve to filter out some of the code smells that can creep in with heavily LLM-assisted development. It is not a panacea, but it is something I have found consistently. If you try to make it well internationalised, accessible, and responsive in the cleanest way possible, the LLM engages in a level of self-validation that seems to improve the overall product.

That still does not leave enough room to let it do everything autonomously. You can probably refine certain pieces, but they need checking.

I find that even the best LLMs fail in unintuitive ways. They will have a lot done, but then the text will be hidden behind another element and completely unreadable. That is a strange error to imagine a human making, because it would be obvious to the person that it was broken before showing it to someone. It reminds me of the [odd failures I noticed with clock faces](/blog/notes-on-llm-clock-face-limitations/): something seemingly straightforward becomes the thing that does not work.

The better LLMs do this less, but they still do it. Even the best ones. I have tried Astra and Fable as well. Sometimes I think the LLM gets a bit lazy in cross-validating or checking things. I am not too sure.

Or perhaps it is falling prey to the same things humans do: coupling between pieces means a change in one area breaks something elsewhere, and it never goes back to double-check. Not too sure.

## What I might try next

The next experiment might be something more bounded: building up an explanation of a grammatical concept. Polish cases are a good example. You get a piece of text, break down the cases in use, and then work from the start to the end until you understand the text more deeply.

That connects to my experiments with [agentic tools for Anki flashcard creation](/blog/agentic-ai-anki-flashcard-creation/), especially contextual examples of Polish declension. Here, though, I would be trying to make the explanation itself something you work through.

I think that may work. If you design a few initial prototypes, perhaps you can subsequently get the LLM to do it for new text somewhat semi-autonomously. It would need to be checked, of course. My sense is that it would still have strange errors.

This is also the sort of thing I meant in [Cheaper Code Should Mean More Experiments](/blog/cheaper-code-more-experiments/). There is room to try a narrow idea, see what works, and then try another version.

Grounding the experiment in material like *Who Is Fourier?* is something I think works quite well. It would be interesting to try other mathematical concepts, perhaps complex analysis. Tristan Needham's *Visual Complex Analysis* is a good book for that.[^complex] Compiler construction could also be interesting.

In language learning, there are a few areas I would like to explore. There is the EuroCom series, including EuroComRom and its concept of the Seven Sieves.[^eurocom] That is an interesting space for exploring intelligibility between languages, and how different heuristics can help you read a text.

Language learning, like many subjects in mathematics, involves somewhat distinct skills. Being able to read something, speak it, and write it are different things. I would not expect any one experiment to do more than a narrow slice of the targeted learning. In the case I am thinking about, that would be grammatical understanding when reading.

[^fourier]: Transnational College of LEX, [*Who Is Fourier? A Mathematical Adventure*](https://www.lexlrf.org/store/p82/who-is-fourier.html). The LEX Language Project describes the student authors' journey through Fourier's wave analysis.

[^victor]: Bret Victor, [*Explorable Explanations*](https://worrydream.com/ExplorableExplanations/), especially the section on reactive documents, where readers can change assumptions and see their consequences inside the explanation.

[^weil]: Simone Weil, [*Gravity and Grace*](https://www.nebraskapress.unl.edu/bison-books/9780803298002/gravity-and-grace/). The engineering application here is my interpretation of those ideas.

[^beauvoir]: Simone de Beauvoir, [*The Ethics of Ambiguity*](https://www.ipgbook.com/the-ethics-of-ambiguity-products-9781504054225.php). Again, the connection to engineering is something I am exploring, rather than a claim about the book's intended application.

[^complex]: Tristan Needham, [*Visual Complex Analysis*](https://academic.oup.com/book/52945), Oxford University Press. A geometric approach to developing intuition for complex analysis.

[^eurocom]: Horst G. Klein and Tilbert D. Stegmann, *EuroComRom: The Seven Sieves*. See the publisher's [Editiones EuroCom catalogue](https://www.shaker.de/de/site/content/shop/index.asp?ID=6&category=191&lang=de&ucategory=-1) for the series and related materials. EuroComRom focuses on reading related Romance languages; it is a separate idea from the Polish-case experiment above.
