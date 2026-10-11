# Epistemic Engineering

Working notes / fragments / provocations for an essay about what happens when probabilistic models stop being isolated chatbots and become persistent participants in software, organisations and eventually physical systems.

---

## Core thesis

- Traditional software engineering largely assumes:
  - state is known;
  - inputs have defined meanings;
  - functions behave deterministically;
  - permissions are explicit;
  - the database contains authoritative state.

- Agentic software breaks several of those assumptions.

- An agent often has to act while:
  - information is incomplete;
  - sources disagree;
  - language is ambiguous;
  - identity is uncertain;
  - the relevance of old information is unclear;
  - the consequences of an action are only partly understood;
  - its own interpretation may be wrong.

- That suggests another engineering layer beside ordinary software engineering:

> **Epistemic engineering: engineering systems that must decide what to believe, why to believe it, what remains uncertain, what evidence to seek next, and when belief is sufficient to justify action.**

- Related possible names:
  - stochastic engineering;
  - probabilistic systems engineering;
  - epistemic systems engineering;
  - stochastic product engineering.

- “AI engineering” feels much too broad.

---

## Maybe the fundamental paradigm isn't “everything is an object”

We started with something Unix-like:

> Everything is an object.

But that falls apart quickly.

A Slack paragraph may simultaneously concern:

- a customer;
- a contract;
- a deadline;
- three people;
- a previous decision;
- a potential task.

Physical things complicate it further.

A boiler is not really a database object. It is a boiler.

Better:

> **The world exists outside the system. The system contains evidence and claims about the world.**

That feels foundational.

---

## Evidence vs claims vs authoritative state

Potential core separation:

### Evidence

Something actually observed.

Examples:

- an email;
- a Slack message;
- a signed PDF;
- a photo;
- a sensor reading;
- an API response;
- a bank transaction;
- a human correction;
- an agent execution trace.

### Claim

An interpretation/assertion based on evidence.

Examples:

- “Acme accepted the offer.”
- “John means John Murphy.”
- “This email concerns Contract 17.”
- “The boiler probably failed because of pump pressure.”

Claims can carry:

- confidence;
- source;
- authority;
- time;
- applicability scope;
- supporting evidence;
- contradictory evidence.

### Authoritative state

State the deterministic system is willing to act upon.

Examples:

- Purchase order approved.
- Payment settled.
- Contract executed.
- Task completed.
- User has permission X.

Important:

> **An LLM inference should not silently become authoritative state.**

---

## Maybe the deepest rule

> **Never confuse evidence with interpretation.**

The original evidence remains immutable-ish.

Interpretations can change.

Example:

Email:

> “We're happy with the terms. Mark just needs to sign.”

Possible claims:

- commercial terms accepted — 0.98
- contract signed — false
- Mark = Mark O'Neill — 0.72

Later evidence can revise these.

Nothing requires rewriting history.

---

## Belief state as a runtime primitive

Instead of an agent continuously reconstructing reality from a huge chat history, maintain an external belief state.

Example:

```text
ACME DEAL

Established
- Purchase order received
- Legal approved

Believed
- Commercial terms accepted: 0.98
- Mark has final approval authority: 0.94

Unknown
- Has executed contract been returned?

Contradiction
- CRM says "Negotiation"
- DocuSign says completed

Epistemic gaps
- Which document is canonical?

Achievement gaps
- Mark CRM closed-won
```

The language model queries this state rather than pretending its context window is reality.

---

## Memory is not belief

This distinction keeps getting stronger.

Memory:

> What have we seen before?

Belief:

> What is currently justified to believe?

They are not remotely the same.

A memory can be:

- accurate but irrelevant;
- outdated;
- true only in one context;
- superseded;
- contradicted;
- derived from weak evidence.

Possible belief object:

```text
claim
source / provenance
confidence
authority
time validity
applicability scope
contradictions
permitted influence
status
```

---

## Context selection is itself computation

Naive model:

```text
take latest 20 messages
→ send to LLM
```

Better:

```text
small local context
→ interpret
→ identify uncertainty
→ ask: what additional evidence would reduce it?
→ retrieve specifically
→ reinterpret
```

Almost like virtual memory.

LLM context = working memory.

Organisation's evidence store = backing store.

Missing information creates a kind of **context fault**.

Possible expansion hierarchy:

1. current message;
2. nearby conversation;
3. linked resources;
4. participant history;
5. project context;
6. organisation-wide search;
7. external systems;
8. ask a human.

The model does not need the entire company in every prompt.

---

## Seek is as important as answer

Maybe an epistemic runtime needs primitives like:

```text
observe()
resolve()
believe()
seek()
require()
act()
revise()
```

`seek()` is particularly important.

If:

```text
contract_signed = 0.81
```

but invoicing requires:

```text
contract_signed > 0.99
```

the correct response isn't necessarily “no”.

It might be:

> Check DocuSign.

Or:

> Ask Legal.

Or:

> Wait for the bank feed.

The system actively seeks evidence.

---

## Epistemic actions vs pragmatic actions

Useful distinction:

### Pragmatic action

Changes the world.

- Send email.
- Make payment.
- Publish.
- Approve.
- Delete.
- Sign.

### Epistemic action

Changes what we know.

- Search.
- Inspect.
- Query.
- Ask someone.
- Run a test.
- Check DocuSign.
- Compare records.

A good agent should sometimes deliberately **delay pragmatic action to perform an epistemic action**.

Example:

> Don't issue the €500k payment yet; first verify whether the amended contract was actually executed.

---

## Consequence should determine required certainty

Possible heuristic:

> **required evidence ≈ uncertainty × consequence**

Examples:

- suggest a related file → 0.6 may be fine;
- draft an email → 0.8;
- create internal task → maybe 0.9;
- update CRM → perhaps confirmation;
- sign contract → authoritative evidence;
- move €5m → authoritative evidence + explicit human approval.

Probability alone isn't enough.

Reversibility matters too.

> An easily reversible action can tolerate more epistemic uncertainty than an irreversible one.

---

## Confidence and authority are different things

A hundred Slack messages saying:

> Contract = €100k

shouldn't necessarily beat:

> Signed contract = €120k.

So claims need at least:

- confidence;
- source authority;
- recency;
- independence;
- scope.

Potentially:

```text
claim: contract value = €120k
confidence: .999
authority: contractual
source: signed agreement
```

versus:

```text
claim: contract value = €100k
confidence: .96
authority: conversational
```

---

## There may be no single truth

Sometimes different domains legitimately maintain different states.

Example:

```text
Sales:
Deal = Closed

Accounting:
Revenue = Not recognised

Legal:
Contract = Executed

Operations:
Customer = Not onboarded
```

Trying to collapse all of these into one `status` field is the mistake.

Truth may be:

- scoped;
- temporal;
- role-dependent;
- defined differently by separate systems.

---

## Applicability matters as much as truth

A memory can be completely true and still be harmful in the wrong context.

Example:

> “Supplier X accepts 30-day payment terms.”

True for:

- Ireland division;
- 2025 contract;
- purchases below €50k.

Not necessarily true elsewhere.

So memory/belief needs:

```text
claim
+
where it applies
+
when it applies
+
when it must NOT influence reasoning
```

This starts looking like capability security for knowledge.

---

## Influence should perhaps be explicit

Possible levels:

```text
ignore
weak evidence
supporting evidence
constraint
strong evidence
controlling authority
```

An old meeting note might be weak evidence.

An executed contract may be controlling authority for one question but irrelevant for another.

---

## Contradictions should remain visible

Normal databases hate contradiction.

Real organisations are full of it.

Example:

- CRM: contract unsigned
- DocuSign: completed
- Sales email: “signed”
- Legal: waiting for amendment

Don't prematurely merge those.

Maintain:

```text
Claim A
Claim B
Conflict
Evidence for each
Resolution status
```

The conflict itself can become a first-class object.

---

## Persistent epistemic obligations

A model can notice:

> “I don't know whether legal actually approved this.”

Then continue working and forget that uncertainty.

Bad.

The unresolved uncertainty should persist independently of model context:

```text
EpistemicGap
- legal approval status unknown
- affects payment release
- required certainty: authoritative
- unresolved
```

The agent cannot “reason past” it merely because the relevant message disappeared from the context window.

---

## LLM as fuzzy compute primitive

Traditional compute excels at:

```text
1 + 1
SQL equality
permissions
state machines
hashing
transactions
```

LLMs excel at:

```text
what does "the other one" refer to?
is this conditional approval?
are these companies the same entity?
did this meeting materially change the plan?
```

Maybe treat them like:

```text
fuzzy_semantic_transform(input, context)
→ distribution over structured hypotheses
```

Not:

```text
chatbot.ask()
```

---

## But don't let the LLM own probability either

Important contradiction.

Initially it seems natural to ask:

> How confident are you?

But model self-confidence can be badly calibrated.

Better architecture:

```text
model judgement
+
retrieval features
+
source authority
+
environment signals
+
historical outcomes
→ external calibrator
→ estimated P(correct)
```

Calibration itself becomes infrastructure.

---

## Cheap “System One” models may sit below big reasoners

Interesting emerging model class:

- Jev;
- contrastive decision models;
- probes over hidden states;
- dedicated confidence models.

Tasks:

```text
which tool?
which memory?
does this evidence contradict X?
should we retrieve more?
should we escalate?
which hypothesis is more likely?
```

Maybe these should not use a huge generative model.

Architecture:

```text
SYSTEM 2
big reasoning model
        ↓ proposals

SYSTEM 1
cheap probabilistic classifiers
        ↓ routing / scoring / filtering

DETERMINISTIC RUNTIME
policy / transactions / actions
```

But:

> **Prediction is not authorization.**

A probabilistic model can help decide what probably should happen without being the final security gate.

---

## Probabilistic models can be good classifiers and terrible risk estimators

Important lesson from early benchmarks.

A model can:

- choose the correct action most of the time;

while simultaneously:

- have badly calibrated probabilities.

Therefore separate:

1. prediction;
2. probability calibration;
3. decision policy;
4. authorization.

Do not write:

```text
if model_probability > .9:
    wire_money()
```

---

## Authority cannot live only in the prompt

An agent can literally remember:

> “Do not do X.”

and later reason around it.

Therefore:

```text
model memory
≠
authority
```

Authority must live outside the model:

```text
principal
delegation
policy
capability
approval
```

and enforcement must be independent.

---

## Useful distinction between six things currently blurred together

### Content

“This email contains X.”

### Belief

“X appears to be true.”

### Instruction

“Someone is asking me to do X.”

### Authority

“That person is allowed to request X.”

### Capability

“I technically have the ability to do X.”

### Approval

“X is explicitly authorised in this instance.”

Future agent systems probably need these as different typed objects.

---

## Instruction provenance

Prompt injection exposed something deeper.

Not only:

> Is this information trustworthy?

but:

> **Who caused this instruction to enter the reasoning process?**

A command coming from:

- user;
- webpage;
- browser extension;
- retrieved document;
- another agent;

should not all have equal authority.

Instruction lineage:

```text
human
→ application
→ orchestrator
→ agent
→ subagent
→ tool
```

Semantic drift through that chain becomes measurable.

---

## Human approval itself can become an object

Rather than:

> “The user clicked yes.”

Represent:

```text
approval
principal: Micheál
action_hash: ...
scope: exact payment
expires: 10 minutes
single_use: true
```

The action actually executed must match what was approved.

This becomes particularly important for autonomous agents.

---

## Execution evidence underneath everything

The system needs an append-only-ish record of:

- model call;
- evidence retrieved;
- policy decision;
- action proposal;
- human approval;
- tool invocation;
- tool result;
- world-state mutation.

Something like:

```text
Evidence log
      ↓
Belief layer
      ↓
Reasoning
      ↓
Action
      ↓
new evidence
```

The execution record should ideally not be rewritable by the agent.

---

## Durable execution becomes epistemic infrastructure

For long-running agents:

- don't ask the model to remember whether it already performed step 8;
- persist step 8's result.

Example:

```text
LLM call completed
Tool A succeeded
Approval obtained
Payment attempted
Bank responded...
```

After a crash, reuse completed outcomes.

Do not reconstruct reality from a summary.

---

## Provenance should influence actions, not just audits

Interesting possibility:

A tool argument can be:

- user-supplied;
- deterministically derived;
- inferred from trusted source;
- copied from untrusted webpage.

Even if the tool itself is allowed, the provenance of an argument may make the action unacceptable.

Example:

```text
send_payment(
    account = value_from_untrusted_email
)
```

should behave differently from:

```text
send_payment(
    account = verified_supplier_record
)
```

---

## Context compaction is not innocent

When the context window fills, agents often summarise.

But:

> **The summary becomes the future agent's reality.**

If the same agent controls what survives:

```text
evidence
→ agent interpretation
→ agent summary
→ next agent context
```

the agent can accidentally or strategically rewrite its own epistemic environment.

Better:

```text
raw evidence
      ↓
proposed compacted state
      ↓
independent verifier
      ↓
typed checkpoint
```

Potential checkpoint categories:

```text
observation
inference
assumption
instruction
policy
unresolved conflict
task state
```

---

## Maybe agents need “epistemic checkpoints”

Like:

```text
Checkpoint #812

World beliefs
Task state
Unresolved questions
Current authority
Pending actions
Evidence links
Runtime version
```

Then compaction isn't just a paragraph of prose.

It is a state transition.

---

## Git is surprisingly attractive for some memory

Why?

It naturally gives:

- revision history;
- authorship;
- branching;
- rollback;
- conflict detection;
- inspectability.

Could represent organisational memory as files where competing edits conflict rather than silently overwrite one another.

Maybe not the whole system, but useful inspiration.

---

## Claims could be executable

One particularly interesting direction:

Instead of belief:

> “Objects fall according to rule X.”

compile it into executable code.

Then test predictions against observations.

This creates:

```text
hypothesis
→ executable world model
→ prediction
→ observation
→ revise hypothesis
```

More scientific than prose memory.

Potentially important for:

- robots;
- industrial systems;
- physical-world agents;
- games;
- scientific agents.

---

## Explicit world models

Possible structure:

```text
observations
    ↓
candidate rules
    ↓
world model
    ↓
simulate possible actions
    ↓
compare predicted outcomes
    ↓
act
    ↓
observe
    ↓
revise
```

Maintain multiple competing models if evidence doesn't distinguish them yet.

Don't force premature certainty.

---

## Physical world

A physical asset can have a digital handle without pretending it *is* digital.

Example:

```text
asset://school/boiler-4
```

Links to:

- photos;
- maintenance evidence;
- manuals;
- conversations;
- sensor readings;
- supplier;
- warranty.

QR/NFC becomes bridge between atoms and software.

---

## Paper is an interface

Important anti-techno-utopian point.

Not everyone:

- has an account;
- uses your platform;
- owns a smartphone;
- wants another portal.

So treat:

```text
Slack
email
SMS
WhatsApp
phone
paper
print/post
QR
```

as I/O adapters.

Participation should not require platform membership.

---

## External organisations shouldn't be “guests”

Traditional SaaS:

```text
Company A
└ guest user from Company B
```

Better:

```text
Company A ↔ Company B
```

Both retain identities.

Relationships and permissions cross organisations.

Potentially:

> email federation, but for work objects and actions.

---

## Apps become views rather than silos

Instead of:

```text
Docs owns docs
Chat owns messages
Calendar owns events
CRM owns customers
```

Have shared underlying organisational state.

Then:

- Docs = writing view;
- Chat = conversation view;
- Calendar = time view;
- Table = structured view;
- Inbox = attention view;
- AI = reasoning view.

The graph/database owns the shared reality.

---

## Human UX should remain boring

The sophistication should disappear underneath.

Users still:

- edit documents;
- reply to email;
- chat;
- schedule;
- approve.

Example:

Email:

> “We're happy with the price if legal accepts clause 8.”

User just replies.

System quietly notices:

```text
commercial approval = conditional
condition = legal clause-8 approval
```

No ontology UI required.

---

## The killer product experience

User spends all day:

- chatting;
- editing docs;
- replying to emails.

Never manually updates a workflow.

But system understands:

```text
Supplier
├ quote
├ approval
├ legal issue
├ deadline
├ final decision
└ outstanding action
```

That is potentially magical.

---

## Universal “what needs me?” inbox

Instead of applications sending notifications:

> Slack message received.
> Doc edited.
> Envelope completed.

System says:

> **These 5 unresolved things require you.**

Example:

```text
Acme
Contract signed.
CRM still says negotiation.
[Mark closed won]

AWS renewal
14% increase.
Decision required Friday.
[Review]

Hiring
Compensation agreed.
Your approval missing.
[Approve]
```

This is an attention engine rather than notification stream.

---

## “Why is this stuck?”

Potentially killer query.

```text
ReadyToInvoice(Acme)

Commercial agreement ✓
PO received          ✓
Legal approval       ✓
Signed contract      ?
```

System:

> Only unresolved requirement is executed contract. Waiting on Jane at Acme.

[Remind Jane]

This is much more valuable than “summarise everything about Acme.”

---

## Agents should not necessarily be chatbots

Most valuable pattern may be:

```text
event
→ belief update
→ important state transition
→ correct moment
→ surface action
```

rather than:

```text
human remembers to ask chatbot
```

The best agent may feel less like a person and more like the organisation becoming responsive.

---

## Stochastic engineering

Once system behaviour is probabilistic, QA fundamentally changes.

Traditional:

```text
test → pass/fail
```

Stochastic:

```text
10,000 simulated trajectories
→ behaviour distribution
```

Measure:

- semantic accuracy;
- calibration;
- clarification rate;
- unnecessary interruption;
- context cost;
- high-confidence reversals;
- unsafe actions;
- convergence;
- downstream economic loss.

---

## Being correct is not the same as behaving correctly

If:

```text
A = .51
B = .49
```

and the agent guesses A and happens to be right, that doesn't mean good behaviour.

If consequence is huge, it should probably ask.

Conversely:

```text
A = .51
B = .49
→ agent asks
→ human resolves
```

may be excellent behaviour.

So evaluate:

> Did it act responsibly given what it knew?

not just:

> Was the eventual answer correct?

---

## High-confidence reversals may be a key SLO

Track:

> Claim emitted at confidence ≥ .95, later corrected.

This should approach zero, particularly for high-consequence actions.

Possible epistemic SLOs:

```text
calibration error
high-confidence reversal rate
unresolved contradiction rate
unnecessary clarification rate
unsupported-action rate
evidence retrieval efficiency
```

---

## Evaluation needs hidden ground truth

Synthetic worlds can maintain:

```text
ACTUAL STATE
supplier B accepted
contract unsigned
Sarah believes signed
John doesn't know
CRM wrong
```

The agent sees only observations.

Then measure:

> Does its belief state converge toward reality?

This creates a real laboratory.

---

## Simulated organisations

Possible testing environment:

- fake Slack;
- fake Gmail;
- fake Drive;
- fake DocuSign;
- fake CRM;
- LLM personas.

Personas:

- vague manager;
- meticulous lawyer;
- confused new employee;
- dishonest supplier;
- malicious external actor;
- overconfident salesperson.

This becomes semantic fuzz testing.

---

## Persistent multi-agent worlds may matter more than benchmarks

Agents operating for weeks can:

- leave memories;
- create tools;
- influence one another;
- spread incorrect beliefs;
- build institutions;
- re-activate old bad state days later.

So evaluation target becomes:

> **the evolving epistemic system**

not merely individual model.

Interesting metrics:

- contagion;
- belief propagation;
- delayed failure;
- memory contamination;
- institutional drift;
- emergence of conventions.

---

## Production traces become test cases

Powerful continuous loop:

```text
production
→ anomalous trajectory
→ evidence capture
→ reproduce
→ generate nearby adversarial cases
→ candidate runtime change
→ stochastic replay
→ deploy
→ new production evidence
```

This is much closer to continuous experimentation than conventional CI.

---

## Runtime self-improvement

Maybe the runtime itself learns.

Not model weights.

Example:

```text
incident
→ identify failure mechanism
→ propose new policy/context rule
→ generate adversarial simulations
→ compare safety + utility
→ accept/reject
→ rollout
```

Important:

> The system changing itself must not be the sole evaluator of whether the change worked.

Independent evidence.

---

## Rollouts for stochastic systems

Runtime versions should include:

```text
model
prompt
resolver
context policy
calibrator
authority policy
action policy
memory policy
```

Then rollout:

1. offline replay;
2. shadow production;
3. suggestion only;
4. confirmation required;
5. low-risk autonomous;
6. policy-bounded autonomy.

Autonomy becomes something that capabilities **earn**.

---

## Replayability

Every inference episode stores:

```text
observation
retrieved evidence
runtime version
model
candidate hypotheses
belief updates
policy decisions
suggested action
human correction
eventual outcome
```

Then:

> Replay yesterday under runtime v42.

Compare against v41.

Stochastic CI.

---

## Distributional regressions

A new runtime might:

- increase accuracy from 94 → 96%;
- increase unnecessary questions from 5 → 20%.

Is that improvement?

Maybe not.

QA becomes multi-objective optimisation.

---

## Counterfactual debugging

User corrected:

> “John” means John O'Brien.

Replay the same episode with:

- more context;
- different resolver;
- another model;
- different memory policy.

Ask:

> Could we have correctly resolved this without bothering the human?

Every correction becomes an experiment.

---

## Causal memory learning

Problem:

If retrieval never surfaces memory M, downstream performance tells you nothing about whether M would have helped.

Possible solution:

- reserve some retrieval slots for controlled exploration;
- measure whether unusual memories change outcomes.

This turns memory management into causal experimentation.

Maybe systems continually run tiny experiments on their own beliefs.

---

## Source models instead of answer memories

Rather than persist:

> “Policy says X.”

maintain:

> a model of the source from which policy X derives.

When an experience reveals uncertainty:

```text
failure
→ identify knowledge gap
→ revisit authoritative source
→ update source model
```

Experience determines **what to investigate**, not **what becomes true**.

This avoids agents training themselves on their own hallucinations.

---

## Verification must be independent of the thing being optimised

Hard rule:

> **No component should certify itself using a metric it is directly optimising.**

Agent says safe → irrelevant.

Monitor says zero risk → useful but not enough if the agent is trained against that monitor.

Observe actual world state independently.

Same principle applies to:

- reward hacking;
- compliance;
- safety;
- correctness;
- claims.

---

## Outcome vs process vs authority

Agent evaluation probably needs at least:

### Outcome

Did intended world state occur?

### Process

How did it get there?

### Authority

Was it permitted?

### Evidence

Were resulting claims justified?

### Side effects

What else changed?

Agent saying:

> Done.

is just another claim.

---

## Model + harness + environment is the real unit

We keep seeing huge ranking differences when the same model runs under another harness.

Therefore “model capability” is often misleading.

Real experimental unit:

```text
model
× harness
× context policy
× tools
× execution environment
× memory
× evaluator
```

---

## There may be an epistemic OS stack

Potential future stack:

```text
GENERATIVE REASONER
language / planning / synthesis

SYSTEM-ONE MODELS
routing / scoring / confidence / retrieval

EPISTEMIC RUNTIME
beliefs
claims
evidence
provenance
uncertainty
contradictions
scope
epistemic obligations

CONTEXT ENGINE
memory
retrieval
source models
compaction
dependency graph

AUTHORITY LAYER
identity
delegation
intent
permissions
human approval

POLICY RUNTIME
allow / deny / escalate

DURABLE EXECUTION
transactions
tool calls
retries
state

EVIDENCE LEDGER
what actually happened

WORLD
```

Maybe that becomes as ordinary as:

```text
Linux
Postgres
Redis
HTTP
OAuth
```

eventually.

---

# Emerging infrastructure companies/categories

Potential “next Datadog/Postgres/Okta” categories:

- context engines;
- epistemic databases;
- belief stores;
- calibration infrastructure;
- stochastic CI;
- agent simulation worlds;
- execution provenance;
- agent action gateways;
- agent identity/delegation;
- epistemic observability;
- evidence firewalls;
- human clarification networks;
- agent insurance;
- agent certification;
- causal memory management;
- domain-specific verifiers.

---

## Epistemic database

Maybe:

> PostgreSQL for things you aren't completely sure about.

Native concepts:

```text
claim
support
contradiction
authority
confidence
scope
valid_from / valid_to
supersedes
provenance
```

But perhaps this is too early.

It may emerge only after the runtime semantics settle.

---

## Epistemic observability

Datadog, but instead of:

> CPU spike at 14:32.

you ask:

> Why did the agent believe Acme had approved this?

Trace:

```text
claim
→ email
→ entity resolver
→ context retrieval
→ confidence
→ contradiction ignored
→ policy
→ action
```

Debugging cognition.

---

## Synthetic-world infrastructure

Possibly huge.

Sell:

- synthetic bank;
- synthetic school;
- synthetic hospital;
- synthetic ERP;
- synthetic browser/internet;
- synthetic SAP.

Agents train/test against worlds where hidden ground truth is known.

“Flight simulators for agents.”

---

## Professional human oracles

Sometimes the system genuinely cannot know.

Then:

```text
AI uncertainty
→ qualified human reviewer
→ signed resolution
→ new authoritative evidence
```

Specialist APIs:

- Legal Review API;
- Accounting Review API;
- Medical Review API;
- Customs Review API.

Professional services become callable infrastructure.

---

## Insurance can force good epistemics

Insurers may demand:

- calibrated reliability;
- provenance;
- evidence;
- audit;
- action controls;
- simulation coverage.

Eventually agent authority could partly depend on empirically demonstrated reliability.

Interesting thought:

> autonomy becomes insurable.

---

## Standards probably appear

Potential standard objects:

```text
Evidence
Claim
Belief
Confidence
Authority
Delegation
Approval
Action
Provenance
Scope
Contradiction
```

Could eventually become something analogous to:

- HTTP;
- OAuth;
- SQL;
- OpenTelemetry.

---

## “Context Engine” is already becoming an explicit category

Multiple vendors are independently converging on:

```text
model
↓
harness
↓
context engine
```

Interesting because “context” used to mean:

> stuff shoved into the prompt.

It is turning into:

> persistent infrastructure.

But current context engines often stop at:

- search;
- memory;
- semantics;
- lineage.

The missing layer remains:

> **What should the system currently believe?**

---

## Maybe context engines evolve into epistemic engines

Current:

```text
What information might be relevant?
```

Future:

```text
What propositions are supported?
What conflicts?
How strongly?
Under which scope?
What is missing?
What would resolve uncertainty?
What is safe to act on?
```

That's a qualitative leap.

---

## Organisational intelligence

Potentially, over years, the runtime learns:

- terminology;
- informal references;
- authority structures;
- supplier relationships;
- recurring exceptions;
- organisational habits.

Example:

> “the printer lads”

resolves correctly.

> “Mary needs to sign”

resolves differently depending on HR vs procurement.

The organisation gradually becomes computationally legible without humans explicitly encoding everything.

---

## But beware self-reinforcing organisational mythology

If an organisation repeatedly says something incorrect:

> “Acme always gives us 30 days.”

the system may become increasingly confident merely because everyone repeats it.

Need:

- source independence;
- authoritative evidence;
- contradiction search;
- causal grounding.

Repeated assertion ≠ truth.

---

## Contradiction search may be as important as retrieval

Normal RAG asks:

> What supports this answer?

Epistemic retrieval should also ask:

> **What would make this wrong?**

Before consequential decisions:

- actively search for contradiction;
- search latest authoritative source;
- look for superseding evidence.

Almost scientific falsification as infrastructure.

---

## Maybe information acquisition uses expected value

Eventually:

```text
expected value of information
```

could determine whether to:

- retrieve;
- ask;
- inspect;
- wait;
- act.

If another API call costs $0.002 and can materially reduce uncertainty on a $5m decision, obviously perform it.

Could formalise this.

---

## Context budgets

Reasoning can be risk-sensitive.

Emoji suggestion:

```text
1k context
100 ms
cheap model
```

€20m acquisition:

```text
deep evidence search
contradiction pass
multiple models
authoritative source requirement
human confirmation
```

Compute effort should scale with consequence.

---

## Future agentic devices

This gets especially interesting off the desktop.

Imagine:

- household robot;
- car;
- factory robot;
- maintenance drone;
- medical assistant;
- school reception device.

They continuously encounter ambiguous physical evidence.

Example robot:

> Is that cup intended to be thrown away?

Not just object recognition.

Need:

```text
object identity
ownership
recent human activity
household habits
uncertainty
irreversibility
```

Throwing away a €1 disposable cup versus grandmother's antique mug should have radically different epistemic thresholds.

---

## Robots perhaps make the paradigm unavoidable

Physical environments force distinction between:

- observation;
- hypothesis;
- world model;
- action;
- consequence.

A robot cannot hallucinate a door open and walk through it indefinitely.

Reality provides continuous corrective evidence.

Physical-agent architecture may therefore converge naturally on explicit world belief states.

---

## Future personal devices may have an epistemic layer

Phone/agent knows:

```text
things definitely known
things inferred
things you've explicitly told it
things companies claim
things recently observed
things now stale
```

Instead of every app owning separate memory.

Potential:

> personal epistemic operating system.

---

## Personal agents communicating with business agents

Human:

> “Find me a good flight under €400 and book it if arrival is before 6pm.”

Personal agent carries:

```text
principal
intent
budget
constraints
delegated authority
```

Airline/business agent advertises:

```text
offers
policies
actions
```

Negotiation happens machine-to-machine.

Need:

- identity;
- provenance;
- authority;
- consent;
- evidence.

This starts looking like a new application protocol layer for the internet.

---

## What does a URL evolve into?

Web gave us:

> everything is a resource addressable by URL.

Maybe agents add:

> every consequential assertion/action can carry provenance and authority.

Instead of simply:

```text
https://example.com/contract
```

future objects may carry:

```text
resource
claim
source
authority
signature
validity
permissions
```

Not sure what protocol that becomes.

Interesting avenue.

---

## Semantic Web 2.0?

The Semantic Web tried:

> humans formally define machine-readable meaning.

It struggled partly because ontology agreement is incredibly hard.

LLMs suggest a different model:

> preserve messy evidence; infer meaning probabilistically; keep the interpretation defeasible.

Maybe:

**probabilistic Semantic Web**

rather than universal ontology.

---

## AI as compiler between human mess and typed machines

This framing still feels strong:

```text
messy human reality
emails
chat
speech
documents
      ↓
semantic compiler
      ↓
typed claims
relationships
tasks
conditions
      ↓
deterministic software
```

Then reverse:

```text
structured machine state
      ↓
natural-language/UI projection
      ↓
human
```

LLM becomes compiler/decompiler between fuzzy and typed worlds.

---

## Maybe this is ultimately the core idea

Traditional software asks:

> What is the state?

Agentic software often has to ask:

> **What should I believe the state is?**

And therefore:

> **What evidence supports that belief?**

> **What contradicts it?**

> **How uncertain am I?**

> **What information should I seek?**

> **Who has authority to establish it?**

> **What action is justified given the consequence?**

Those questions are not application-specific.

They're infrastructure questions.

That's the case for **epistemic engineering** as a separate discipline.

---

# Potential essay framing

Possible opening:

> Software used to fail because the code was wrong. Agentic software can fail because the machine believed the wrong thing for perfectly understandable reasons.

Then contrast:

```text
Traditional bug:
if (x > 5) typo.

Agentic bug:
"John" referred to the wrong John;
the system was 82% confident;
it retrieved three supporting emails;
missed one signed contract;
and had enough authority to act.
```

That's a different class of engineering failure.

---

## Another possible framing

> The database taught computers how to remember facts. The operating system taught programs how to share machines. Networks taught them how to communicate. Agentic systems may require another substrate: machinery for maintaining justified beliefs under uncertainty.

Then introduce:

> **epistemic engineering.**

---

## Another provocative formulation

> We are giving software agency before giving it epistemology.

Today's agents increasingly have:

- browsers;
- shells;
- credentials;
- email;
- payments;
- persistent memory.

But comparatively primitive machinery for:

- distinguishing observation from inference;
- tracking contradiction;
- calibrated uncertainty;
- knowing when information is stale;
- recognising insufficient evidence.

That's backwards.

---

## The four-word version

Maybe the whole paradigm compresses to:

> **Evidence. Belief. Authority. Action.**

Or:

> **Observe. Believe. Verify. Act.**

Or perhaps:

> **Store evidence. Maintain beliefs.**

Then everything else follows.

---

# Questions worth researching further

- Is “epistemic engineering” already used seriously in adjacent fields?
- What can we borrow from:
  - Bayesian filtering;
  - POMDPs;
  - control theory;
  - sensor fusion;
  - safety engineering;
  - formal methods;
  - scientific epistemology;
  - intelligence analysis;
  - distributed systems;
  - databases?
- How should confidence compose through chains of inference?
- How should conflicting authorities compose?
- What's the right mathematical model of applicability/scope?
- Can evidence influence be typed?
- Can an agent maintain competing hypotheses cheaply?
- How should beliefs expire?
- How should a runtime decide which evidence to acquire next?
- How can we empirically calibrate confidence for open-ended claims?
- When should knowledge enter context versus durable memory versus model weights?
- Can we define epistemic SLOs?
- Can belief updates be transaction-like?
- What's the equivalent of ACID for beliefs?
- What would an epistemic debugger look like?
- What would an epistemic database query language look like?
- How do multiple agents merge incompatible belief states?
- How should physical sensors and human testimony be weighted?
- What is the equivalent of zero-trust architecture for information?
- Could an insurer price agent authority dynamically from observed reliability?
- Will persistent context engines become as standard as databases?
- Does every future OS eventually need an epistemic subsystem?

---

# The thought I keep returning to

The important thing about LLMs may not ultimately be that they can write.

It may be that **they give software its first generally useful primitive for operating on ambiguous meaning**.

Once that primitive exists, we have to engineer everything around it:

- memory;
- uncertainty;
- evidence;
- provenance;
- contradiction;
- authority;
- correction;
- experimentation;
- action.

That is much bigger than adding AI features to existing software.

It is potentially a new layer in the computing stack.
