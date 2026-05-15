/* eslint-disable no-console */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "screenshots");
const BASE = process.env.SHOT_BASE || "http://localhost:3010";

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`POST ${url} → ${res.status}: ${t}`);
  }
  return res.json();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();

  // 1. Landing
  console.log("→ landing");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(OUT_DIR, "01-landing.png"),
    fullPage: false,
  });

  // 2. Lobby
  console.log("→ lobby");
  await page.goto(`${BASE}/lobby`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.locator('input[placeholder*="codename"]').fill("Aster");
  await page.locator('button:has-text("Orbital Exodus"), button:has(h3:has-text("Orbital Exodus"))').first().click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Hybrid field")').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, "02-lobby.png"),
    fullPage: true,
  });

  // Build a live room via API so the screenshots have rich content.
  console.log("→ building demo room via API");
  const created = await postJSON(`${BASE}/api/room`, {
    name: "Aster",
    scenarioId: "memory-winter",
    interactionMode: "crisis",
  });
  const code = created.code;
  const host = created.playerId;

  const joiners = ["Halberd", "Praxis", "Zenya"];
  const joinerIds = [];
  for (const name of joiners) {
    const j = await postJSON(`${BASE}/api/room/join`, { code, name });
    joinerIds.push(j.playerId);
  }
  await postJSON(`${BASE}/api/room/${code}/start`, { playerId: host });

  const lines = [
    [host, "We need a binding framework before the cameras turn on. No more vague principles."],
    [joinerIds[0], "Sovereign rationing protects supply chains. I will not sign anything else."],
    [joinerIds[1], "The Coalition has the leaked agreement. Nobody in this room walks out clean."],
    [host, "I have a neuromorphic prototype. 18 months and HBM is irrelevant. Buy me 90 days."],
    [joinerIds[2], "90 days of unrestricted compute. To do what, exactly? Be specific or step back."],
    [joinerIds[0], "Specificity is how we get sanctioned. I will not be specific on camera."],
    [joinerIds[1], "Then I publish at minute 41. You have 39 minutes."],
    [host, "Wait. If we structure this as a public commons with capped draw — everyone survives the briefing."],
  ];
  for (const [pid, text] of lines) {
    await postJSON(`${BASE}/api/room/${code}/message`, { playerId: pid, text });
    await new Promise((r) => setTimeout(r, 60));
  }

  for (let i = 0; i < 5; i++) {
    await postJSON(`${BASE}/api/room/${code}/event`, {});
    await new Promise((r) => setTimeout(r, 100));
  }

  // 3. Room — live negotiation
  console.log("→ room");
  await page.addInitScript(
    ([code, host]) => {
      window.sessionStorage.setItem(`ate:${code}:playerId`, host);
      window.sessionStorage.setItem(`ate:${code}:name`, "Aster");
    },
    [code, host]
  );
  await page.goto(`${BASE}/room/${code}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      /Negotiation channel|Duel channel|Influence chamber|Multi-agent field|Hybrid field/.test(
        document.body?.innerText ?? ""
      ),
    { timeout: 15000 }
  );
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(OUT_DIR, "03-room.png"),
    fullPage: false,
  });

  // Cast votes + commit so reflection page becomes available
  await postJSON(`${BASE}/api/room/${code}/decision`, {
    playerId: host,
    choice: "B",
  });
  await postJSON(`${BASE}/api/room/${code}/decision`, {
    playerId: joinerIds[0],
    choice: "A",
  });
  await postJSON(`${BASE}/api/room/${code}/decision`, {
    playerId: joinerIds[1],
    choice: "B",
  });
  await postJSON(`${BASE}/api/room/${code}/decision`, {
    playerId: joinerIds[2],
    choice: "D",
  });
  await postJSON(`${BASE}/api/room/${code}/decision`, {
    playerId: host,
    choice: "B",
    commit: true,
  });

  // 4. Reflection page
  console.log("→ reflection");
  await page.goto(`${BASE}/room/${code}/reflection`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector('text=Final framework committed', { timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUT_DIR, "04-reflection.png"),
    fullPage: false,
  });

  // 5. Full-page reflection for extra detail
  await page.screenshot({
    path: path.join(OUT_DIR, "05-reflection-full.png"),
    fullPage: true,
  });

  // 6. Persistent world (uses timeline/reputation from the committed session above)
  console.log("→ world");
  await page.goto(`${BASE}/world`, { waitUntil: "networkidle" });
  await page.locator("h1", { hasText: "Persistent world" }).waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(OUT_DIR, "06-world.png"),
    fullPage: false,
  });

  // 7. Duel vs AI — two-column layout + Duel channel
  console.log("→ duel AI room");
  const duelCreated = await postJSON(`${BASE}/api/room`, {
    name: "Rook",
    scenarioId: "memory-winter",
    interactionMode: "duel",
    aiOpponentEnabled: true,
  });
  const duelCode = duelCreated.code;
  const duelHost = duelCreated.playerId;
  await postJSON(`${BASE}/api/room/${duelCode}/start`, { playerId: duelHost });
  await postJSON(`${BASE}/api/room/${duelCode}/message`, {
    playerId: duelHost,
    text: "One clean concession. Then we both walk without headlines.",
  });
  await page.addInitScript(
    ([c, pid, label]) => {
      window.sessionStorage.setItem(`ate:${c}:playerId`, pid);
      window.sessionStorage.setItem(`ate:${c}:name`, label);
    },
    [duelCode, duelHost, "Rook"]
  );
  await page.goto(`${BASE}/room/${duelCode}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      /Duel channel/.test(document.body?.innerText ?? ""),
    { timeout: 15000 }
  );
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(OUT_DIR, "07-duel-ai-room.png"),
    fullPage: false,
  });

  // 8. Hybrid field — humans + synthetic seats, Hybrid channel, social graph rail
  console.log("→ hybrid room");
  const hyb = await postJSON(`${BASE}/api/room`, {
    name: "Nava",
    scenarioId: "memory-winter",
    interactionMode: "hybrid",
  });
  const hybCode = hyb.code;
  const hybHost = hyb.playerId;
  const hybJoin = await postJSON(`${BASE}/api/room/join`, { code: hybCode, name: "Vex" });
  await postJSON(`${BASE}/api/room/${hybCode}/start`, { playerId: hybHost });
  await postJSON(`${BASE}/api/room/${hybCode}/message`, {
    playerId: hybHost,
    text: "Two humans walk in; the table still fills to six. Name the fracture you want on the record.",
  });
  await postJSON(`${BASE}/api/room/${hybCode}/message`, {
    playerId: hybJoin.playerId,
    text: "Then we stop pretending the synthetic seats are decorative. They vote in the tension, not in our self-image.",
  });
  await postJSON(`${BASE}/api/room/${hybCode}/event`, {});
  await page.addInitScript(
    ([c, pid, label]) => {
      window.sessionStorage.setItem(`ate:${c}:playerId`, pid);
      window.sessionStorage.setItem(`ate:${c}:name`, label);
    },
    [hybCode, hybHost, "Nava"]
  );
  await page.goto(`${BASE}/room/${hybCode}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => /Hybrid field/.test(document.body?.innerText ?? ""),
    { timeout: 15000 }
  );
  await page.waitForSelector("text=Trust / influence", { timeout: 15000 });
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: path.join(OUT_DIR, "08-hybrid-room.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("✓ screenshots written to", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
