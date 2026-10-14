// Tests für api/pvgis.js und api/geocode.js (node --test tests/).
// fetch wird gemockt: kein Netzwerk, keine Last auf PVGIS/Nominatim.
import test from "node:test";
import assert from "node:assert/strict";

function makeRes() {
  const res = { headers: {}, statusCode: 200, body: undefined };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}
let ipCounter = 0;
const req = (query, { method = "GET", ip } = {}) => ({
  method, query, headers: { "x-real-ip": ip ?? `10.0.0.${++ipCounter}` },
});

const pvgisBody = (n = 12) => ({
  inputs: { big: "x".repeat(500) },
  outputs: {
    monthly: { fixed: Array.from({ length: n }, (_, i) => ({ month: i + 1, E_m: 100 + i })) },
    totals: { fixed: { E_y: 1234 } },
    junk: "x".repeat(500),
  },
});

let calls = [];
const realFetch = globalThis.fetch;
function mockFetch(impl) {
  calls = [];
  globalThis.fetch = async (url, opts) => { calls.push({ url: String(url), opts }); return impl(String(url), opts); };
}
test.afterEach(() => { globalThis.fetch = realFetch; });
const jsonRes = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

const pvgis = (await import("../api/pvgis.js")).default;
const geocode = (await import("../api/geocode.js")).default;

// ── PVGIS ───────────────────────────────────────────────────────────────────
test("pvgis: gültige Anfrage, Antwort gekürzt, CDN-Cache gesetzt", async () => {
  mockFetch(() => jsonRes(pvgisBody()));
  const res = makeRes();
  await pvgis(req({ lat: "49.234", lon: "6.996", peakpower: "1", loss: "14", angle: "30", aspect: "0" }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.outputs.monthly.fixed.length, 12);
  assert.equal(res.body.outputs.junk, undefined);
  assert.equal(res.body.inputs, undefined);
  assert.match(res.headers["cache-control"], /s-maxage=2592000/);
});

test("pvgis: Koordinaten werden auf 3 Stellen normalisiert, Upstream bekommt feste Parameter", async () => {
  mockFetch(() => jsonRes(pvgisBody()));
  await pvgis(req({ lat: "49.2341234", lon: "6.9961999", peakpower: "1", loss: "14", angle: "30", aspect: "-45" }), makeRes());
  const u = new URL(calls[0].url);
  assert.equal(u.searchParams.get("lat"), "49.234");
  assert.equal(u.searchParams.get("lon"), "6.996");
  assert.equal(u.searchParams.get("aspect"), "-45");
  assert.equal(u.searchParams.get("outputformat"), "json");
  assert.deepEqual([...u.searchParams.keys()].sort(), ["angle", "aspect", "lat", "lon", "loss", "outputformat", "peakpower"]);
});

test("pvgis: zweite gleiche Anfrage kommt aus dem Cache (1 Upstream-Aufruf)", async () => {
  mockFetch(() => jsonRes(pvgisBody()));
  const q = { lat: "50.111", lon: "8.222", peakpower: "1", loss: "14", angle: "50", aspect: "90" };
  await pvgis(req(q), makeRes());
  const res = makeRes();
  await pvgis(req(q), res);
  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 200);
});

test("pvgis: parallele gleiche Anfragen werden zusammengefasst", async () => {
  mockFetch(async () => { await new Promise((r) => setTimeout(r, 30)); return jsonRes(pvgisBody()); });
  const q = { lat: "51.511", lon: "7.333", peakpower: "1", loss: "14", angle: "10", aspect: "180" };
  const rs = [makeRes(), makeRes(), makeRes()];
  await Promise.all(rs.map((r) => pvgis(req(q), r)));
  assert.equal(calls.length, 1);
  assert.ok(rs.every((r) => r.statusCode === 200));
});

test("pvgis: ungültige Eingaben → 400, kein Upstream-Aufruf", async () => {
  mockFetch(() => jsonRes(pvgisBody()));
  const bad = [
    {}, { lat: "49" }, { lat: "abc", lon: "6" }, { lat: "1e3", lon: "6" }, { lat: "49", lon: "6", angle: "200" },
    { lat: "49", lon: "6", peakpower: "-1" }, { lat: "49", lon: "6", aspect: "400" },
    { lat: ["49", "50"], lon: "6" }, { lat: "10", lon: "6" }, { lat: "49", lon: "6", loss: "99" },
    { lat: "49&usehorizon=0", lon: "6" },
  ];
  for (const q of bad) {
    const res = makeRes();
    await pvgis(req(q), res);
    assert.equal(res.statusCode, 400, JSON.stringify(q));
    assert.equal(res.headers["cache-control"], "no-store");
  }
  assert.equal(calls.length, 0);
});

test("pvgis: POST → 405", async () => {
  const res = makeRes();
  await pvgis(req({ lat: "49", lon: "6" }, { method: "POST" }), res);
  assert.equal(res.statusCode, 405);
});

test("pvgis: Rate-Limit je IP (40/min), andere IP unberührt", async () => {
  mockFetch(() => jsonRes(pvgisBody()));
  const q = { lat: "52.521", lon: "13.405", peakpower: "1", loss: "14", angle: "30", aspect: "0" };
  let last;
  for (let i = 0; i < 41; i += 1) { last = makeRes(); await pvgis(req(q, { ip: "9.9.9.9" }), last); }
  assert.equal(last.statusCode, 429);
  assert.equal(last.headers["retry-after"], "30");
  const other = makeRes();
  await pvgis(req(q, { ip: "8.8.8.8" }), other);
  assert.equal(other.statusCode, 200);
});

test("pvgis: Upstream-5xx → ein Retry, dann Erfolg", async () => {
  let n = 0;
  mockFetch(() => (++n === 1 ? jsonRes({}, 500) : jsonRes(pvgisBody())));
  const res = makeRes();
  await pvgis(req({ lat: "48.137", lon: "11.575", peakpower: "1", loss: "14", angle: "30", aspect: "0" }), res);
  assert.equal(calls.length, 2);
  assert.equal(res.statusCode, 200);
});

test("pvgis: Upstream dauerhaft 5xx → 502 ohne Caching", async () => {
  mockFetch(() => jsonRes({}, 500));
  const res = makeRes();
  await pvgis(req({ lat: "53.551", lon: "9.993", peakpower: "1", loss: "14", angle: "30", aspect: "0" }), res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.headers["cache-control"], "no-store");
});

test("pvgis: Upstream 4xx (kein Datenbereich) → 422, kurz cachebar, kein Retry", async () => {
  mockFetch(() => jsonRes({ message: "Location over the sea" }, 400));
  const res = makeRes();
  await pvgis(req({ lat: "54.9", lon: "6.1", peakpower: "1", loss: "14", angle: "30", aspect: "0" }), res);
  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 422);
  assert.match(res.headers["cache-control"], /s-maxage=3600/);
});

test("pvgis: Antwort ohne Monatswerte → 502, nicht gecacht", async () => {
  mockFetch(() => jsonRes({ outputs: { monthly: { fixed: [] } } }));
  const res = makeRes();
  await pvgis(req({ lat: "47.5", lon: "9.5", peakpower: "1", loss: "14", angle: "30", aspect: "0" }), res);
  assert.equal(res.statusCode, 502);
});

// ── Geocode ─────────────────────────────────────────────────────────────────
const nomi = [{ lat: "49.2354321", lon: "6.9876543" }];

test("geocode: Treffer, User-Agent gesetzt, Anfrage serverseitig gebaut", async () => {
  mockFetch(() => jsonRes(nomi));
  const res = makeRes();
  await geocode(req({ address: "viktoriastr. 19", plz: "66111", city: "saarbrücken" }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { lat: 49.23543, lon: 6.98765 });
  assert.match(calls[0].opts.headers["User-Agent"], /rechner\.photovoltaik\.marketing/);
  const u = new URL(calls[0].url);
  assert.equal(u.searchParams.get("countrycodes"), "de");
  assert.equal(u.searchParams.get("limit"), "1");
  assert.match(u.searchParams.get("q"), /viktoriastr\. 19, 66111 saarbrücken, germany/);
  assert.match(res.headers["cache-control"], /s-maxage=2592000/);
});

test("geocode: gleiche Adresse nur 1× bei Nominatim (Cache)", async () => {
  mockFetch(() => jsonRes(nomi));
  const q = { address: "hauptstraße 5", plz: "10115" };
  await geocode(req(q), makeRes());
  await geocode(req(q), makeRes());
  assert.equal(calls.length, 1);
});

test("geocode: kein Treffer → 404, ebenfalls gecacht", async () => {
  mockFetch(() => jsonRes([]));
  const q = { address: "nirgendwostraße 99", plz: "10115" };
  const res = makeRes();
  await geocode(req(q), res);
  assert.equal(res.statusCode, 404);
  await geocode(req(q), makeRes());
  assert.equal(calls.length, 1);
});

test("geocode: ungültige Eingaben → 400, kein Nominatim-Aufruf", async () => {
  mockFetch(() => jsonRes(nomi));
  for (const q of [{}, { address: "ab", plz: "66111" }, { address: "abc", plz: "6611" }, { address: "abc", plz: "66111x" }, { address: ["a", "b"], plz: "66111" }]) {
    const res = makeRes();
    await geocode(req(q), res);
    assert.equal(res.statusCode, 400, JSON.stringify(q));
  }
  assert.equal(calls.length, 0);
});

test("geocode: Steuerzeichen und überlange Eingaben werden bereinigt", async () => {
  mockFetch(() => jsonRes(nomi));
  await geocode(req({ address: "stra\u0000ße\n\n" + "x".repeat(500), plz: "10117" }), makeRes());
  const q = new URL(calls[0].url).searchParams.get("q");
  assert.ok(!/[\u0000-\u001f]/.test(q));
  assert.ok(q.length < 160);
});

test("geocode: Nominatim 429/5xx → 503 ohne Caching", async () => {
  mockFetch(() => jsonRes({}, 429));
  const res = makeRes();
  await geocode(req({ address: "fehlerstraße 1", plz: "20095" }), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers["cache-control"], "no-store");
});

test("geocode: Drosselung — zwei verschiedene Adressen starten ≥ 1 s auseinander", async () => {
  const starts = [];
  mockFetch(() => { starts.push(Date.now()); return jsonRes(nomi); });
  await Promise.all([
    geocode(req({ address: "drosselweg 1", plz: "30159" }), makeRes()),
    geocode(req({ address: "drosselweg 2", plz: "30159" }), makeRes()),
  ]);
  assert.equal(starts.length, 2);
  assert.ok(starts[1] - starts[0] >= 1000, `Abstand ${starts[1] - starts[0]} ms`);
});

test("geocode: Rate-Limit je IP (15/min)", async () => {
  mockFetch(() => jsonRes(nomi));
  let last;
  for (let i = 0; i < 16; i += 1) { last = makeRes(); await geocode(req({ address: "limitstraße 1", plz: "40213" }, { ip: "7.7.7.7" }), last); }
  assert.equal(last.statusCode, 429);
});
