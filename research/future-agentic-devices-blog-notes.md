# Future Agentic Devices Blog Research Notes

Loose ideas about hardware that lets coding agents develop, test, and revise applications on actual devices. Product concepts, competing arguments, examples, and research questions are intentionally mixed. Suggested category names, market predictions, and prices are hypotheses.

**The starting thought**

- Coding agents become more useful when they can close the loop: change something, execute it, observe the result, verify it, and try again.
- A recurring boundary: “Now open this on your phone and tell me what happens.” What product would let the agent complete that step?
- The target is the application on its actual receiving device. A web developer needs to test a compass interface on a moving phone. A voice developer needs speech to reach the real microphone.
- The loop includes the application, browser or runtime, operating system, physical device, environment, and user interaction.
- A command returning success is one observation. The experience reaching the user is another.
- Possible thesis: as agents make implementation faster, the value of accessible, repeatable validation increases.
- Counterpoint: implementation may remain the hard part for many projects. Hardware matters only when physical validation is actually blocking progress.

**What might this category be called**

- Existing foundations: hardware-in-the-loop testing, automated test equipment, device farms, robotics, and closed-loop experimentation.
- Self-driving laboratories already connect AI decisions to physical experiments. The desktop developer version could be much smaller. [Nature collection](https://www.nature.com/collections/igbhhbedgi).
- Candidate product descriptions: “real-device development stations,” “agent-accessible test hardware,” “agent peripherals,” or “desktop agent labs.” These are proposed labels.
- “Embodied agents” captures physical interaction, but a USB-controlled phone cradle does not need a humanoid robot.
- “Agent device” could mean three things: the device running the agent, the device the agent operates, or the fixture making that device testable. Keep these meanings separate.
- Perhaps the category belongs beside developer tools and lab instruments as much as consumer AI hardware.
- OpenTAP already describes support for agentic test automation. The direction has existing participants. [OpenTAP](https://opentap.io/).

**Application scenarios worth picturing**

- **Navigation web app:** deploy to a phone, grant permissions, rotate through a known sequence, compare heading changes with the rendered compass, fix the wraparound bug, rerun.
- **Motion-sensitive game:** tilt the phone at different speeds; check control response, orientation changes, and recovery after backgrounding.
- **Voice assistant:** speak through a room speaker to the actual device microphone; interrupt its answer; measure when it stops and whether the next turn makes sense.
- **Browser voice app:** test microphone permission, audio playback restrictions, backgrounding, and headphone routing on the actual browser/device combination.
- **Document scanner:** present the same document at different angles and lighting; check capture, processing, and the saved result.
- **Video call:** two real devices join; vary background noise and connectivity; check what each participant sees and hears.
- **School application:** teacher records attendance, parent receives the update, administrator checks the report. Verify the source record and each role’s view.
- **Wearable companion app:** pair a real accessory, interrupt its connection, reconnect, and verify that the application recovers without duplicate events.
- These scenarios suggest fixtures that reproduce parts of a user’s environment. They do not establish complete coverage of real life.

**Products that could grow from this**

- **Personal phone test dock:** one to six user-supplied phones, reliable USB connections, charging, device reservation, screen access, and evidence capture.
- **Motorised phone cradle:** controlled rotation and tilt while the actual application runs. Its own position reference provides an independent comparison.
- **Acoustic development station:** repeatable device placement, speech playback, background sound, and external recording. Test the actual microphone/speaker path.
- **Camera scene station:** controlled lighting and a display or physical target facing the device camera. Reproduce QR scanning and document-capture failures.
- **Network scenario appliance:** a dedicated test network with saved delay, bandwidth, and outage sequences. “Disconnect during upload, restore, check for duplicates.”
- **Accessory scenario dock:** connect real Bluetooth peripherals and coordinate pairing, routing changes, and reconnects.
- **Multi-device workflow station:** assign participant roles to devices and coordinate a complete interaction, such as a call, notification, or handoff.
- **External computer test adapter:** observe display output and provide keyboard/mouse input through installation, restart, and login. PiKVM is an existing foundation. [PiKVM API](https://docs.pikvm.org/api/).
- **Embedded application station:** deploy firmware to the actual board or product, run physical inputs, collect output and logs, recover, and repeat.
- **Recovery attachment:** adjustable mechanisms for power and volume buttons. Small accessory, potentially large impact on unattended operation.
- **Independent observation attachment:** light, sound, vibration, or power measurement alongside an application scenario. Useful as evidence within the whole-system test.
- **Portable lab case:** a few devices and fixtures in one transportable setup. A team could take the same reproducible test environment to an office or customer demo.

**The compass and audio examples expose useful complications**

- Turning a phone tests a different path from injecting orientation values. Both methods belong in development; physical tests can investigate discrepancies.
- Chrome already provides sensor emulation. A physical station must add enough value beyond that convenient baseline. [Chrome Sensors documentation](https://developer.chrome.com/docs/devtools/sensors).
- Compass fixtures need to account for magnetic interference from motors, cables, and nearby electronics. A poorly designed fixture can create misleading failures.
- A rotation fixture can reproduce defined movements. Walking, translation, vehicle vibration, and changing surroundings are further requirements.
- Playing a recording into a microphone exercises the acoustic path. Passing the same file directly to the speech service bypasses that path.
- Playback is repeatable, but it does not represent every person, room, microphone position, or live interaction.
- A voice test can distinguish transcription errors, application decisions, response content, playback failure, and interruption timing.
- Measuring the actual speaker output can expose a failure even when the application logs say “audio played.”
- Existing platforms already offer real-device audio and voice testing. Research what a personal desktop version could simplify or make accessible. [HeadSpin examples](https://www.headspin.io/blog/improving-audio-quality-in-mobile-apps).

**The software could be the product’s centre**

- One agent interface: deploy, reserve device, open application, apply scenario, observe, collect evidence, reset, repeat.
- Physical controls should be narrow and explicit: rotation angle, playback file, disconnect duration, timeout. “Test everything” is not a useful hardware operation.
- The agent chooses experiments and investigates failures. Explicit assertions should determine outcomes where possible.
- A saved scenario should include application revision, device/browser versions, fixture settings, test data, actions, observations, and pass criteria.
- A discovered bug should become a reproducible regression scenario. Otherwise each agent session starts the investigation again.
- Synchronised timestamps connect physical actions to UI changes, logs, network events, and recordings.
- A manual takeover should let the developer inspect the same device and evidence the agent is using.
- Device reservations prevent a human, test runner, and agent from competing for control.
- Browser screen access alone does not guarantee visibility into application state. DOM inspection, accessibility data, logs, and backend checks can complement recordings.
- Test-data reset matters as much as device reset. A clean phone with a contaminated database is still an unreliable test environment.

**The earlier mobile development idea**

- Could an Android phone host PostgreSQL, a backend, a frontend, and a coding agent? Termux and a Linux userland provide a plausible route, subject to device and application compatibility. [PRoot-Distro](https://github.com/termux/proot-distro).
- For the VSWare checkout discussed: Java 8/Gradle for MIS, Node 26/pnpm 12 for the frontend, and local PostgreSQL. The full Android stack remains a setup hypothesis.
- A database copy does not reproduce every dependency. Tenant configuration, cache, private build dependencies, other services, and external integrations still matter.
- Logical database dumps are appropriate for transferring across machine architectures. [PostgreSQL documentation](https://www.postgresql.org/docs/current/backup-dump.html).
- Four to six phones could act as independent workers, a reference environment, and test targets. Their RAM does not automatically pool into one machine.
- Possible appeal: reuse devices already owned, and let the agent do much of the terminal work.
- Counterpoint: a small computer may be a simpler host. Phone heat, storage, and Android process termination can undermine unattended work. [Termux project warning](https://github.com/termux/termux-app).
- Development workloads on the test phone can distort performance measurements. Separate roles when that matters.
- Local execution does not mean local intelligence. An agent can operate local tools while calling an online model.

**Persistent agents and Pi Durable**

- Pi Durable provides persistent conversations and tasks, storage adapters, execution tools, and recovery behaviour. It is an experimental library. [Official documentation](https://github.com/earendil-works/pi/blob/main/packages/durable/README.md).
- Potential role: retain the investigation while the developer closes the interface or the host restarts.
- It could sit inside the dock controller or on each worker. Device scheduling and fixture drivers would still need implementation.
- Durable conversation state does not keep Android processes alive, preserve arbitrary shell processes, or make database mutations safe to repeat.
- Interrupted tool replay requires deliberate policy. Recovery must check what happened before retrying an action.
- Each storage has one process owner. A phone cluster needs APIs and stable job identities rather than several processes opening the same storage.
- Moving work between phones also needs the right source revision, files, data, artifacts, and device capabilities.

**Existing products and building blocks to research**

- [DeviceFarmer/STF](https://github.com/DeviceFarmer/stf): browser-based Android device control and management.
- [Appium Device Farm](https://devicefarm.org/): device allocation and test execution infrastructure.
- [scrcpy](https://github.com/Genymobile/scrcpy): Android screen viewing and control over USB or TCP/IP.
- [Droidrun/Mobilerun](https://github.com/droidrun/mobilerun): agents operating mobile devices through UI inspection and actions.
- [Cambrionix](https://www.cambrionix.com/pages/cambrionix-api): managed USB infrastructure and programmatic hub control.
- [Mobot](https://www.mobot.io/faq): physical robotic testing of application journeys on real devices.
- [BrowserStack](https://www.browserstack.com/cloud-mobile-testing) and [HeadSpin](https://www.headspin.io/global-device-infrastructure): real-device access and testing platforms.
- [Toxiproxy](https://github.com/Shopify/toxiproxy): controlled TCP faults, a software foundation for some network scenarios.
- [Saleae automation](https://www.saleae.com/support/extensions-api/automation-api/saleae-api-and-sdk): existing instrumentation an agent could operate through software integration.
- Research distinction: an existing feature, a better workflow, a new package for a different customer, and a technically novel invention are separate claims.

**Contradictions worth leaving in the post**

- Real hardware gives valuable feedback; emulation is faster, cheaper, and easier to scale. Which failures justify the physical fixture?
- A desktop lab provides ownership and convenient local access; a cloud lab provides broader device coverage and less maintenance.
- A general robot could operate many products; a specialised fixture may be cheaper, more repeatable, and easier to recover.
- An adaptive agent can explore unexpected behaviour; a fixed script can provide clearer regression evidence.
- More sensors provide more observations; they can also produce confusing measurements and calibration work.
- A fixture can make a scenario repeatable while making it less representative of an actual person using the device.
- Local data access can be attractive; maintaining a local lab can become another developer chore.
- Agents may increase testing demand as they produce more changes. They may also generate unnecessary tests and consume device time without improving confidence.
- A visually impressive robot could sell the idea while a quiet charging and recovery system delivers most of the everyday value.
- One phone on the desk might be a better first product than a six-phone farm.

**Commercial thoughts from the earlier discussion**

- Bring-your-own-device reduces the need to inventory phones and lets developers test hardware they already use.
- A four-slot dock using the customer’s computer is a smaller commitment than a standalone appliance.
- Preliminary concept estimates were approximately $83–137 materials BOM and $113–187 landed cost at around 300 units, with a proposed $349 campaign price. These are planning assumptions, not manufacturer quotes or validated willingness to pay.
- A standalone version adds a computer, storage, thermal design, software maintenance, and support. Earlier proposed prices of $599–699 require a separate cost model.
- Those dock estimates do not cover a motorised motion station or acoustic fixture. Each is another product to cost and validate.
- Kickstarter charges 5% plus payment processing of roughly 3–5%. Unit margin must also fund development, tooling, testing, failures, support, and contingency. [Official fees](https://www.kickstarter.com/help/fees).
- A working demonstration could be compelling: the agent reproduces a physical-device bug, changes code, reruns the same scenario, and shows the result.
- A hardware Kickstarter needs a demonstrated prototype and clear disclosure of integration status. [Kickstarter rules](https://www.kickstarter.com/rules).
- Possible business split: sell durable hardware, include useful local testing software, and charge separately for optional fleet/team services. Model usage needs an explicit funding model.
- The software and repeatable scenarios may create more lasting value than the enclosure or circuit board.

**Possible first products and experiments**

- Prediction: early offerings may wrap existing device and instrument APIs before introducing custom hardware.
- Prediction: recovery accessories and scenario-specific fixtures could emerge before broad autonomous desktop labs.
- Prototype a motion cradle around one browser compass application. Compare emulated testing, manual physical testing, and agent-driven physical testing.
- Prototype an audio station around one conversational app. Preserve speech input, background audio, application trace, recorded response, and timing.
- Run a paid pilot with developers who currently perform the same physical check repeatedly. The purchase signal matters more than enthusiasm for the demo.
- Measure setup time, experiments completed without intervention, reproducibility, useful defects found, and time saved.
- Deliberately disconnect the device and restart the controller. Recovery is part of the product demonstration.
- Begin with supported combinations. Universal phones, operating systems, accessories, and scenarios could overwhelm a small team.
- A shared controller and accessory standard might emerge from successful fixtures. Building the universal platform first could delay finding a real customer.

**Questions and lines to explore**

- What physical step currently makes the agent stop and ask a human for help?
- What does the developer still have to plug in, move, say, press, watch, or listen to?
- Can the agent reproduce the failure tomorrow on the same device? Can another developer reproduce it elsewhere?
- What independent observation establishes that the result reached the user?
- How much realism is enough to answer the particular question?
- When does physical testing add information beyond emulation or direct API testing?
- Does every developer need a device lab, or does one team share it?
- Will developers buy fixtures, or buy access to scenarios hosted somewhere else?
- What is the cheapest complete loop that removes a recurring manual task?
- Possible blog line: “The next developer peripheral might move the phone, speak to the microphone, or interrupt the connection while the coding agent watches.”
- Possible blog line: “An agent’s workspace could extend from its repository into a small, programmable physical environment.”
- Possible blog line: “The useful question is what the agent can prove before it asks you to try the application yourself.”
