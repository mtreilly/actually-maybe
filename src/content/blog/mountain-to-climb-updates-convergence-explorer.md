---
title: "Mountain to Climb Updates - Convergence Explorer"
description: "New updates to the Convergence Explorer: a tidier sidebar and footer, fresh World Bank data, and energy transition data from Ember."
pubDate: "Sep 28 2026"
topics: ["economics", "visualisation", "data", "development"]
type: "note"
---

This was something I had [worked on before](/blog/mountain-to-climb). I've just given it a new update. It's an easy way to see how and when different places, like Poland and the United Kingdom, will converge, and when Poland will be richer than the United Kingdom on a per capita basis. You could do this for other regions. There are some regions that are quite surprising. I find Kazakhstan is richer than most people would imagine. A lot of the European Union states that joined in 2004 have converged in major ways, particularly the Baltic countries, but it's kind of true of all of them. You get a sense as well that growth in Romania is dramatically underrated.

![The Convergence Explorer comparing Poland with the United Kingdom on GDP per capita (PPP). The headline reads "Poland could match United Kingdom in 4 years by 2030" at 4.0% a year versus 1.0%. A line chart shows both countries from 2000, with the projection meeting in 2030. A sidebar has growth-rate sliders for each country, a "Set a deadline" panel, and a link to development implications.](./images/mountain-to-climb/convergence-explorer.png)

The [Convergence Explorer](https://mountaintoclimb.com) is a tool that I built for myself because it is quite an easy way to see how different rates of economic growth impact convergence for different areas and different regions, and it kind of remaps your sense of the economic geography of the world and where we're going. Inspired by what [Oliver Kim](https://oliverwkim.com/The-Mountain-To-Climb/) has done, this is an ongoing little project. I've made some new updates to the sidebar. The footer was tidied up a bit. There were some translation strings that were missing. And I've updated it with new data from the last year from the World Bank, and some extra information from [Ember](https://ember-energy.org/), who do really excellent work tracking the energy transition.

Ember had a nice API that I was able to plug into. I've made it so the tool sits more or less in one viewport, because it was something I wanted and it's focused on just one thing. There are some elements I'm unsure about. I might actually tidy up the sidebar and remove it, because I think it's perhaps a bit overly technical, and it doesn't convey the point: the connection between energy deployment and economic growth. It would be interesting to add a compute piece to it and the build-out of compute, but I don't know the best reliable data source for that.
