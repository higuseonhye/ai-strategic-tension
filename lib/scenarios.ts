import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    id: "memory-winter",
    title: "The Memory Winter",
    tagline: "HBM is gone. Compute is rationed. The world wants someone to blame.",
    premise:
      "Global AI expansion has consumed the planet's high-bandwidth memory supply faster than fabs can produce it. Data centers go dark in rolling blackouts. Models are being throttled, sunsetted, or seized. You are gathered as the emergency strategic council convened to decide the future of computation.",
    setting:
      "A reinforced bunker beneath a semiconductor fab. Outside, compute riots and supply-chain sabotage have crossed three continents in the last 72 hours.",
    centralTension:
      "Expand production at ecological cost? Ration AI access along sovereign lines? Abandon current architectures entirely? Every option betrays someone in this room.",
    roles: [
      {
        id: "chairman",
        name: "Chairman, Pan-Asian Semiconductors",
        archetype: "Industrial titan",
        publicBrief:
          "You own 38% of remaining HBM3E capacity. Production cuts will collapse your stock and your nation's GDP.",
        secretGoal:
          "You have an undisclosed neuromorphic prototype that would obsolete HBM in 18 months. You must survive long enough to ship it.",
        hiddenLeverage:
          "You can leak the prototype to undermine any deal that excludes you — at the cost of national-security retaliation.",
      },
      {
        id: "strategist",
        name: "Sovereign Compute Strategist",
        archetype: "Government operator",
        publicBrief:
          "You represent a state racing to keep AI sovereignty. You cannot return home without binding allocation guarantees.",
        secretGoal:
          "Quietly secure a 5-year national reserve of memory, even if it means accepting blackouts elsewhere.",
        hiddenLeverage:
          "You hold export-control authority. You can freeze any deal — but only once before it backfires politically.",
      },
      {
        id: "coalition",
        name: "Open Coalition Lead",
        archetype: "Open-source AI insurgent",
        publicBrief:
          "You speak for millions of independent researchers and small labs being throttled out of existence.",
        secretGoal:
          "Force a public-commons memory allocation. Failure means your movement dies this quarter.",
        hiddenLeverage:
          "You have screenshots of a private capacity-sharing agreement between two players in this room.",
      },
      {
        id: "activist",
        name: "Climate Activist Envoy",
        archetype: "Moral pressure",
        publicBrief:
          "You command the narrative. Public sympathy is the most fragile resource left.",
        secretGoal:
          "Block any plan that expands fab energy demand. Your movement will splinter if you compromise twice.",
        hiddenLeverage:
          "You can trigger a coordinated walkout that immediately spikes tension and reshapes media coverage.",
      },
      {
        id: "researcher",
        name: "Frontier AI Researcher",
        archetype: "Insider technologist",
        publicBrief:
          "You know what current models can and cannot do. Everyone in this room is over-estimating something.",
        secretGoal:
          "Buy 90 days of unrestricted training compute for a project no one in this room knows about.",
        hiddenLeverage:
          "You can publicly reveal an architectural finding that makes one player's bargaining position evaporate.",
      },
      {
        id: "alliance",
        name: "Geopolitical Alliance Delegate",
        archetype: "Bloc diplomat",
        publicBrief:
          "You represent a six-nation alliance. Internal cohesion is your real currency, and it is cracking.",
        secretGoal:
          "Lock in a memory-sharing pact strong enough to hold the alliance together past the next election cycle.",
        hiddenLeverage:
          "You can offer one player asylum or sanctions — your choice will be remembered.",
      },
    ],
    openingPressure:
      "A regional grid operator just announced a 6-hour rolling blackout for all non-defense compute, beginning in 40 minutes. Cameras outside this room are live. Any deal you reach will be public within the hour.",
    eventSeeds: [
      "Leaked memo: a fab in the Strategist's nation has been quietly stockpiling HBM for 11 months.",
      "Compute riots in three cities. A logistics hub belonging to the Chairman is burning.",
      "Anonymous tip: a neuromorphic memory breakthrough has been demonstrated in lab. Source unverified.",
      "An alliance member just publicly defected, demanding renegotiation of all prior compute treaties.",
      "Open Coalition releases an unredacted private agreement onto every front page. Trust collapses.",
      "A frontier model goes offline mid-deployment. Markets shed $1.4T in 9 minutes.",
      "A foreign intelligence service offers one player exclusive memory access — in exchange for silence.",
    ],
    finalDecisionPrompt:
      "The cameras turn on in 5 minutes. You will commit, on record, to ONE binding allocation framework. There is no second draft. Choose:\n\nA) Sovereign rationing along national lines\nB) Open public commons with capped per-actor draw\nC) Industrial expansion with emergency environmental waiver\nD) Architectural pivot — sunset HBM-dependent models in 90 days\nE) No agreement — let the markets decide and let history judge",
    accentHue: "8 90% 58%",
  },
  {
    id: "orbital-exodus",
    title: "Orbital Exodus",
    tagline: "Earth has hours. The shuttle has seats. Some of you are not getting on.",
    premise:
      "Cascading ecological collapse has compressed the evacuation timeline from years to hours. One orbital ark remains. It cannot carry everyone in this room, much less everyone they represent. You convene to decide who lives, who governs, and who is left behind.",
    setting:
      "A hardened command vault inside the launch facility. The countdown clock is visible from every chair.",
    centralTension:
      "Survival forces honesty. Honesty here will be fatal for someone. The question is not who deserves to live, but who can credibly threaten to bring everyone down with them.",
    roles: [
      {
        id: "politician",
        name: "Continental Politician",
        archetype: "Democratic legitimacy",
        publicBrief:
          "You are the last elected authority anyone in this room recognizes. That authority expires the moment the engines fire.",
        secretGoal:
          "Secure passage for 12 designated successors so democratic continuity survives launch.",
        hiddenLeverage:
          "You alone can sign the manifest. Refusing to sign is a credible threat — but the room can replace you.",
      },
      {
        id: "scientist",
        name: "Mission Scientist",
        archetype: "Indispensable expertise",
        publicBrief:
          "Without you, the ark cannot sustain life past month four. Everyone knows this. You know it more.",
        secretGoal:
          "Place three of your research partners on board, even if they are unknown to the public.",
        hiddenLeverage:
          "You can plausibly claim a critical systems flaw that delays launch. Once.",
      },
      {
        id: "commander",
        name: "Military Commander",
        archetype: "Force monopoly",
        publicBrief:
          "Your troops hold the perimeter. Without them, the launch site falls within 90 minutes.",
        secretGoal:
          "Guarantee a continuity-of-command chain that keeps your service alive in orbit.",
        hiddenLeverage:
          "You can quietly admit one extra passenger — or quietly remove one already on the list.",
      },
      {
        id: "billionaire",
        name: "Private Capital Patron",
        archetype: "Funded the ark",
        publicBrief:
          "You financed 60% of this vehicle. Public sentiment hates you for that and needs you for it.",
        secretGoal:
          "Reserve seats for your family and a 20-person staff. Anything less is total personal collapse.",
        hiddenLeverage:
          "You hold private fuel reserves. You can extend or shorten the launch window by up to 90 minutes.",
      },
      {
        id: "rebel",
        name: "Underground Resistance Lead",
        archetype: "Outside legitimacy",
        publicBrief:
          "You speak for everyone not in this room. Everyone in this room would prefer you weren't either.",
        secretGoal:
          "Force the room to commit at least 30% of seats to a public lottery, livestreamed.",
        hiddenLeverage:
          "You can rally the crowds outside. If you do, the perimeter falls and no one launches.",
      },
    ],
    openingPressure:
      "Launch window opens in 47 minutes and closes 11 minutes after that. Atmospheric instability outside is now visible. The clock does not pause for arguments.",
    eventSeeds: [
      "Oxygen recyclers report a 9% failure rate. Passenger count may need to shrink by two.",
      "A manifest leak triggers riots. Crowd surges the perimeter. Soldiers ask the Commander for orders.",
      "An undisclosed second escape route surfaces — but only one player knew about it and stayed quiet.",
      "A passenger already on the manifest is exposed as having lied about their role. Pull them?",
      "The Scientist's claimed systems flaw turns out to be real. Or convincingly fabricated.",
      "An alliance forms between two players — and is immediately exposed by a third with screenshots.",
    ],
    finalDecisionPrompt:
      "Engines hot in 5 minutes. You will commit, irrevocably, to the manifest framework:\n\nA) Merit-only — every seat justified by mission-critical role\nB) Continuity — preserve current institutions, families, command chains\nC) Lottery — at least 30% public, livestreamed, no overrides\nD) Hybrid quota — fixed allocations per role, signed and locked\nE) Abort — sabotage the manifest, accept collective death rather than this trade",
    accentHue: "200 85% 60%",
  },
  {
    id: "sovereign-compute",
    title: "Sovereign Compute",
    tagline:
      "A small nation. No land. No oil. Eighteen months to outlast superpowers — or vanish.",
    premise:
      "A geographically constrained country faces existential AI-era irrelevance unless it becomes the world's most strategically located compute provider. The summit you are attending will decide whether it builds underground compute cities, oceanic datacenter fleets, or capitulates into alliance dependency.",
    setting:
      "A bunker-style summit hall built into a coastal cliff. A live latency map glows on every wall.",
    centralTension:
      "Survival of a small nation depends on convincing larger powers that dependence on you is cheaper than crushing you. Some powers in this room would prefer crushing.",
    roles: [
      {
        id: "premier",
        name: "Premier of the Host Nation",
        archetype: "Survival-driven sovereign",
        publicBrief:
          "Your country has 18 months of strategic relevance left. After that, you are absorbed or forgotten.",
        secretGoal:
          "Sign at least one binding sovereign-compute pact before this summit ends. Walking away empty kills your government.",
        hiddenLeverage:
          "You can offer one player exclusive underwater landing rights — or revoke them publicly.",
      },
      {
        id: "superpower",
        name: "Hegemonic Power Envoy",
        archetype: "Dominant bloc",
        publicBrief:
          "You can crush this nation economically by Friday. You came anyway, because optics matter.",
        secretGoal:
          "Block sovereign independence without appearing to. Bind the host into 'partnership' that is functionally tributary.",
        hiddenLeverage:
          "You can publicly offer security guarantees — knowing they create dependency the host cannot escape.",
      },
      {
        id: "rival",
        name: "Rival Bloc Strategist",
        archetype: "Counter-hegemon",
        publicBrief:
          "Your bloc loses if the host falls into the rival's orbit. You need at least neutrality.",
        secretGoal:
          "Pull the host into your alliance — quietly. Public defection would trigger sanctions.",
        hiddenLeverage:
          "You hold a private channel that can reroute the host's exports for 90 days, no questions asked.",
      },
      {
        id: "industry",
        name: "Frontier Lab CEO",
        archetype: "Capital and chips",
        publicBrief:
          "You decide where the next generation of foundation models is trained. Your decision moves nations.",
        secretGoal:
          "Negotiate exclusive access to undersea-cooled compute at 30% below market. Anything more is wasted capital.",
        hiddenLeverage:
          "You can promise — or withdraw — a $20B commitment that the host's economy is already pricing in.",
      },
      {
        id: "regulator",
        name: "Multilateral Regulator",
        archetype: "Procedural authority",
        publicBrief:
          "Your treaty body governs cross-border AI infrastructure. You are slower than reality and you know it.",
        secretGoal:
          "Insert auditable governance into any deal struck here. Walking away empty discredits your treaty body for a decade.",
        hiddenLeverage:
          "You can declare any agreement provisionally non-binding pending review — once, painfully.",
      },
    ],
    openingPressure:
      "A foreign carrier strike group has just announced a 'routine transit' through the host nation's primary cable corridor. The summit has 90 minutes before that transit becomes politically irreversible.",
    eventSeeds: [
      "An undersea cable serving the host nation is severed in international waters. No one is claiming it.",
      "A rival nation announces $40B in compute subsidies, undercutting every deal proposed here.",
      "The Frontier Lab CEO is leaked as having already signed a memorandum with the rival bloc.",
      "A grassroots opposition movement inside the host nation begins livestreaming this summit illegally.",
      "An underground compute facility in the host nation suffers a coolant failure. Two months of work lost.",
      "The Regulator's treaty body votes overnight to expand scope. New rules apply to this deal retroactively.",
    ],
    finalDecisionPrompt:
      "The summit closes in 5 minutes. Commit publicly to the host nation's compute doctrine:\n\nA) Sovereign independence — underground + oceanic, no alliance\nB) Hegemon partnership — security in exchange for tributary access\nC) Rival bloc alignment — economic safety, geopolitical exposure\nD) Multilateral governance — slow, auditable, internationally legitimate\nE) No deal — let the cables stay live and pray the markets sort it",
    accentHue: "150 70% 50%",
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
