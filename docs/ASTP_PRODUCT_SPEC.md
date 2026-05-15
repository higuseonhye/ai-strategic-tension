# AI Strategic Tension Platform (ASTP) — product spec

This document is the **canonical framing** for what this codebase implements.
ASTP is **not** a chatbot, casual game, or productivity tool.

It is a **multi-agent cognitive participation system**: humans and AI agents
co-exist in a shared **strategic tension** environment where reasoning is
embedded in interaction, not outsourced.

---

## 1. Core problem (non-negotiable)

In the AI era, people increasingly outsource thinking to systems, which erodes
**judgment, negotiation, and irreversible decision-making**.

ASTP exists to **prevent cognitive offloading** by embedding reasoning in
interactive tension.

**Language we use**

- Cognitive participation system  
- Reasoning-as-experience  
- Thinking-embedded interaction  

---

## 2. Core principle

**AI is not the main character.** It participates as a system agent that:

- designs pressure  
- generates constraints  
- injects events  
- simulates seated agents  
- distorts equilibrium  
- amplifies tension  

**Humans are not passive users.** They are decision-makers, negotiators, and
strategists inside that field.

---

## 3. Architecture (four layers)

### (1) Tension field engine (core)

Generates scarcity, asymmetric information, time pressure, reversals, hidden
incentives, and narrative ruptures. Implemented today primarily via scenario
design + `generateEvent` + phase/tension coupling in `lib/store.ts`.

### (2) Interaction topology (critical)

The system must support multiple **interaction structures** over time:

| Topology | Intent |
|----------|--------|
| **Solo** | One human vs **multiple** seated AI agents (hidden goals, asymmetric info); agents may react to each other — **primary entry** for solo cognitive load. |
| **User vs single AI** | 1:1 duel (implemented as duel + optional AI adversary). |
| **User vs user** | Multiplayer crisis / influence — AI as facilitator + pressure designer. |
| **Hybrid** | **Shipped (MVP):** 2–6 humans in lobby; on start, unused scenario seats become **synthetic agents** in the same channel. Inter-agent lines can fire without a human turn (throttled). Heuristic **trust / influence edges** update from whispers, reply chains, GM events, and synthetic traffic (`lib/social-graph.ts`). |

### (3) State layer

Tracks tension, negotiation history, votes, phase, roles, room topology, and a
**v1 heuristic social sketch**: directed `socialGraph` edges (trust / influence)
mutated from messages and events — not a full graph database, but first-class
room state for UI and future persistence.

### (4) Outcome layer

Every session ends with:

- an **irreversible** final decision (host commit)  
- a **cinematic reflection report** (narrative reconstruction, not analytics)  
- optional **world** + reputation / legacy updates  

---

## 4. Interaction principle

**Interaction is the product** — not content dumps, not open-ended chat, not
deterministic simulation output.

---

## 5. Core loop

1. Enter a topology (solo / duel / multiplayer / future hybrid).  
2. System assigns roles (hidden + public) and constraints.  
3. AI injects events and pressure shifts.  
4. Humans (and agents) negotiate in real time.  
5. Tension escalates; phases advance.  
6. A final irreversible decision is forced.  
7. Reflection report is generated.  
8. Optional persistent world updates.  

---

## 6. Design rules

- AI must not dominate the channel.  
- Users must retain agency.  
- Systems create tension, not answers.  
- Sessions should feel like a **narrative shift** (“something changed”).  

---

## 7. Persistent world

Narrative memory: timeline, civilization-scale meters, reputation tags, optional
player legacy in Supabase. **No XP, no coins.**

---

## 8. Implementation priorities (engineering)

1. **Solo mode** — multi-agent seated AIs, tension loop, same outcome layer as
   multiplayer.  
2. **Hybrid field (MVP)** — humans + synthetic seats at one table; inter-agent
   banter; heuristic trust/influence edges.  
3. **Multiplayer** on the same engine (crisis / influence / duel).  
4. **AI as designer + participant** — GM events + seated agents (duel adversary,
   solo / hybrid cohort).  
5. **Every session** — irreversible decision + reflection.  

---

## 9. What we are not building

Not: generic assistant, tutoring app, grind game, or summarization product.

We are building: **tension fields, multi-agent pressure, and cognitive
participation through irreversible stakes.**
