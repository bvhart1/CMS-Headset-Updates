/* CMS Headset Update — app logic */

const DAY_LABELS = {
  day1: "Day 1 — Tue, Sept 22",
  day2: "Day 2 — Wed, Sept 23",
};

const STATUS_LABELS = {
  pending: "Not started",
  "in-progress": "In progress",
  done: "Done",
  flagged: "Needs follow-up",
};

const STATUS_ORDER = ["pending", "in-progress", "done", "flagged"];

function directionsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

// Keyless Google Maps embed (no API key needed): draws the day's stops, in
// order, as a driving route. Single-stop days fall back to a plain pin.
function dayMapEmbedUrl(stops) {
  if (!stops.length) return null;
  const addrs = stops.map((s) => encodeURIComponent(s.address));
  if (addrs.length === 1) {
    return `https://www.google.com/maps?q=${addrs[0]}&output=embed`;
  }
  const saddr = addrs[0];
  const daddr = addrs.slice(1).join("+to:");
  return `https://www.google.com/maps?saddr=${saddr}&daddr=${daddr}&output=embed`;
}

// ---------------------------------------------------------------------
// Data store: talks to Supabase when configured, otherwise falls back to
// localStorage (per-device only) so the site is usable before setup.
// ---------------------------------------------------------------------
const store = {
  supabase: null,
  statuses: {}, // stop_id -> {status, updated_by, updated_at}
  notes: {}, // stop_id -> [{author, note, created_at}]
  listeners: [],

  onChange(fn) {
    this.listeners.push(fn);
  },

  notify() {
    this.listeners.forEach((fn) => fn());
  },

  async init() {
    if (SUPABASE_CONFIGURED && window.supabase) {
      this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await this.refetchAll();
      this.supabase
        .channel("cms-headset-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "visit_status" }, () => this.refetchAll())
        .on("postgres_changes", { event: "*", schema: "public", table: "campus_notes" }, () => this.refetchAll())
        .subscribe();
      setInterval(() => this.refetchAll(), 30000); // backup poll
    } else {
      this.loadLocal();
    }
  },

  loadLocal() {
    try {
      this.statuses = JSON.parse(localStorage.getItem("cms_status") || "{}");
      this.notes = JSON.parse(localStorage.getItem("cms_notes") || "{}");
    } catch (e) {
      this.statuses = {};
      this.notes = {};
    }
  },

  saveLocal() {
    localStorage.setItem("cms_status", JSON.stringify(this.statuses));
    localStorage.setItem("cms_notes", JSON.stringify(this.notes));
  },

  async refetchAll() {
    if (!this.supabase) return;
    const [{ data: statusRows }, { data: noteRows }] = await Promise.all([
      this.supabase.from("visit_status").select("*"),
      this.supabase.from("campus_notes").select("*").order("created_at", { ascending: true }),
    ]);
    this.statuses = {};
    (statusRows || []).forEach((row) => {
      this.statuses[row.stop_id] = row;
    });
    this.notes = {};
    (noteRows || []).forEach((row) => {
      if (!this.notes[row.stop_id]) this.notes[row.stop_id] = [];
      this.notes[row.stop_id].push(row);
    });
    this.notify();
  },

  getStatus(stopId) {
    return (this.statuses[stopId] && this.statuses[stopId].status) || "pending";
  },

  async setStatus(stopId, status, updatedBy) {
    if (this.supabase) {
      await this.supabase
        .from("visit_status")
        .upsert({ stop_id: stopId, status, updated_by: updatedBy, updated_at: new Date().toISOString() }, { onConflict: "stop_id" });
      // realtime subscription will refetch; refetch immediately too for snappy UI
      await this.refetchAll();
    } else {
      this.statuses[stopId] = { stop_id: stopId, status, updated_by: updatedBy, updated_at: new Date().toISOString() };
      this.saveLocal();
      this.notify();
    }
  },

  getNotes(stopId) {
    return this.notes[stopId] || [];
  },

  async addNote(stopId, author, note) {
    if (this.supabase) {
      await this.supabase.from("campus_notes").insert({ stop_id: stopId, author, note });
      await this.refetchAll();
    } else {
      if (!this.notes[stopId]) this.notes[stopId] = [];
      this.notes[stopId].push({ stop_id: stopId, author, note, created_at: new Date().toISOString() });
      this.saveLocal();
      this.notify();
    }
  },
};

// ---------------------------------------------------------------------
// UI state
// ---------------------------------------------------------------------
const ui = {
  memberId: localStorage.getItem("cms_member_id") || TEAM[0].id,
  activeTab: "route",
  noteFilter: "",
};

function parseTimeToMinutes(str) {
  const m = /^(\d{1,2}):(\d{2})([ap])$/.exec(str.trim().toLowerCase());
  if (!m) return 0;
  let hour = parseInt(m[1], 10) % 12;
  if (m[3] === "p") hour += 12;
  return hour * 60 + parseInt(m[2], 10);
}

function memberName(id) {
  const m = TEAM.find((t) => t.id === id);
  return m ? m.name : id;
}

function fmtUpdated(row) {
  if (!row || !row.updated_at) return "";
  const d = new Date(row.updated_at);
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------------------------------------------------------------------
// Name gate — block the app until someone picks who they are
// ---------------------------------------------------------------------
function renderNameGate() {
  const grid = document.getElementById("name-gate-grid");
  const lastId = localStorage.getItem("cms_member_id");
  grid.innerHTML = TEAM.map(
    (t) => `<button data-id="${t.id}" class="${t.id === lastId ? "last-selected" : ""}">${t.name}</button>`
  ).join("");
  grid.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => chooseIdentity(btn.dataset.id));
  });
}

function chooseIdentity(memberId) {
  ui.memberId = memberId;
  localStorage.setItem("cms_member_id", memberId);
  document.body.classList.remove("gate-open");
  render();
}

function openNameGate() {
  renderNameGate();
  document.body.classList.add("gate-open");
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------
function render() {
  renderConfigBanner();
  renderMemberSelect();
  renderRoute();
  renderBoard();
  renderNotesBrowser();
}

function renderConfigBanner() {
  const el = document.getElementById("config-banner");
  if (SUPABASE_CONFIGURED) {
    el.classList.remove("show");
    el.style.display = "none";
  } else {
    el.style.display = "block";
    el.innerHTML =
      "<strong>Supabase not connected yet.</strong> Status &amp; notes are only saved on this device for now. " +
      "Fill in <code>js/supabase-config.js</code> and run <code>schema.sql</code> to sync live across the whole team. See README.md.";
  }
}

function renderMemberSelect() {
  const select = document.getElementById("member-select");
  select.innerHTML = TEAM.map((t) => `<option value="${t.id}" ${t.id === ui.memberId ? "selected" : ""}>${t.name}</option>`).join("");
}

function stopsForMember(memberId) {
  return STOPS.filter((s) => s.member === memberId).sort((a, b) => {
    if (a.day !== b.day) return a.day < b.day ? -1 : 1;
    return parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start);
  });
}

function renderRoute() {
  const mine = stopsForMember(ui.memberId);
  const byDay = { day1: [], day2: [] };
  mine.forEach((s) => byDay[s.day].push(s));

  renderRouteSummary(byDay);
  renderNextBanner(mine);

  const container = document.getElementById("route-days");

  container.innerHTML = ["day1", "day2"]
    .map((dayKey) => {
      const stops = byDay[dayKey];
      if (!stops.length) return "";
      const pieces = [];
      stops.forEach((s, i) => {
        if (i > 0) pieces.push(travelGapHtml(stops[i - 1], s));
        pieces.push(stopCardHtml(s));
      });
      return `
        <div class="day-heading">${DAY_LABELS[dayKey]}</div>
        ${pieces.join("")}
      `;
    })
    .join("");

  wireStopCardEvents(container);
}

function daySummaryStats(stops) {
  if (!stops.length) return null;
  const zones = [...new Set(stops.map((s) => s.zone))];
  const totalBufferMin = stops.slice(1).reduce((sum, s, i) => sum + (parseTimeToMinutes(s.start) - parseTimeToMinutes(stops[i].end)), 0);
  return {
    count: stops.length,
    zones,
    start: stops[0].start,
    end: stops[stops.length - 1].end,
    totalBufferMin,
  };
}

function renderRouteSummary(byDay) {
  const wrap = document.getElementById("route-summary");
  const days = ["day1", "day2"].filter((d) => byDay[d].length);

  if (!days.length) {
    wrap.innerHTML = "";
    return;
  }

  const totalStops = days.reduce((sum, d) => sum + byDay[d].length, 0);

  wrap.innerHTML = `
    <details class="route-summary-card">
      <summary>
        <span class="summary-title">${escapeHtml(memberName(ui.memberId))}'s route summary</span>
        <span class="summary-subtitle">${totalStops} stop${totalStops === 1 ? "" : "s"} over ${days.length} day${days.length === 1 ? "" : "s"} · tap to view map &amp; details</span>
      </summary>
      <div class="summary-days">
        ${days
          .map((dayKey) => {
            const stops = byDay[dayKey];
            const stat = daySummaryStats(stops);
            const mapUrl = dayMapEmbedUrl(stops);
            return `
              <div class="summary-day">
                <div class="summary-day-head">
                  <strong>${DAY_LABELS[dayKey]}</strong>
                  <span>${stat.count} stop${stat.count === 1 ? "" : "s"} · ${stat.start}–${stat.end} · ${escapeHtml(stat.zones.join(" + "))}${
              stat.totalBufferMin ? ` · ~${stat.totalBufferMin} min drive buffer` : ""
            }</span>
                </div>
                <ol class="summary-stop-list">
                  ${stops.map((s) => `<li>${s.start} ${escapeHtml(s.school)}</li>`).join("")}
                </ol>
                ${mapUrl ? `<iframe class="route-map" src="${mapUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${DAY_LABELS[dayKey]} map for ${escapeHtml(memberName(ui.memberId))}"></iframe>` : ""}
              </div>
            `;
          })
          .join("")}
      </div>
    </details>
  `;
}

function travelGapHtml(prev, next) {
  const gap = parseTimeToMinutes(next.start) - parseTimeToMinutes(prev.end);
  const sameZone = prev.zone === next.zone;
  const tight = gap < 20;
  return `
    <div class="travel-gap ${tight ? "tight" : ""}">
      <span class="travel-icon">🚗</span>
      <span>${gap} min buffer${sameZone ? "" : ` — heads to ${escapeHtml(next.zone)} zone`}</span>
      <span class="travel-note">(estimate — confirm real drive time)</span>
    </div>
  `;
}

function renderNextBanner(mine) {
  const banner = document.getElementById("next-banner");
  const next = mine.find((s) => store.getStatus(s.id) !== "done");
  if (!next) {
    if (mine.length) {
      banner.classList.add("show");
      banner.innerHTML = `<div class="label">All done</div><div class="school">Every stop on your route is complete. 🎉</div>`;
    } else {
      banner.classList.remove("show");
    }
    return;
  }
  const status = store.getStatus(next.id);
  const label = status === "in-progress" ? "Currently at" : "Up next";
  banner.classList.add("show");
  banner.innerHTML = `
    <div class="label">${label} — ${DAY_LABELS[next.day]}</div>
    <div class="school">${escapeHtml(next.school)}</div>
    <div class="meta">${next.start}–${next.end} · ${escapeHtml(next.zone)} zone · Contact: ${escapeHtml(next.contact)}</div>
    <a class="directions-btn on-banner" href="${directionsUrl(next.address)}" target="_blank" rel="noopener">🧭 Directions</a>
  `;
}

function stopCardHtml(s) {
  const status = store.getStatus(s.id);
  const statusRow = store.statuses[s.id];
  const notes = store.getNotes(s.id);
  return `
    <div class="stop-card" data-stop="${s.id}">
      <div class="stop-top">
        <div>
          <div class="stop-time-row">
            <span class="stop-time-big">${s.start}–${s.end}</span>
            <span class="zone-badge">${escapeHtml(s.zone)}</span>
          </div>
          <div class="stop-school">${escapeHtml(s.school)}</div>
          <a class="directions-btn" href="${directionsUrl(s.address)}" target="_blank" rel="noopener">🧭 Directions</a>
        </div>
        <span class="pill big ${status}">${STATUS_LABELS[status]}</span>
      </div>
      <details class="stop-details">
        <summary>Contact, address &amp; campus hours</summary>
        <div class="stop-contact">${escapeHtml(s.contact)}${s.email ? " · " + escapeHtml(s.email) : ""}</div>
        <div class="stop-contact">${escapeHtml(s.address)}</div>
        <div class="stop-contact">Campus hours: ${escapeHtml(s.hours)}</div>
      </details>
      <div class="status-buttons">
        ${STATUS_ORDER.map(
          (st) => `<button data-action="status" data-status="${st}" class="${status === st ? "active-" + st : ""}">${STATUS_LABELS[st]}</button>`
        ).join("")}
      </div>
      ${statusRow && statusRow.updated_by ? `<div class="stop-contact" style="margin-top:6px;">Last updated by ${escapeHtml(statusRow.updated_by)} · ${fmtUpdated(statusRow)}</div>` : ""}
      <div class="notes-block">
        <div class="notes-list">
          ${
            notes.length
              ? notes
                  .map(
                    (n) => `<div class="note-item"><div class="note-meta">${escapeHtml(n.author || "Anonymous")} · ${fmtUpdated(n)}</div>${escapeHtml(n.note)}</div>`
                  )
                  .join("")
              : `<div class="note-empty">No notes yet for this campus.</div>`
          }
        </div>
        <div class="note-form">
          <textarea placeholder="Add a note for this campus (access issues, contact changed, headsets missing, etc.)"></textarea>
          <button data-action="add-note">Save</button>
        </div>
      </div>
    </div>
  `;
}

function wireStopCardEvents(container) {
  container.querySelectorAll(".stop-card").forEach((card) => {
    const stopId = card.dataset.stop;
    card.querySelectorAll('[data-action="status"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        store.setStatus(stopId, btn.dataset.status, memberName(ui.memberId));
      });
    });
    const addBtn = card.querySelector('[data-action="add-note"]');
    const textarea = card.querySelector("textarea");
    addBtn.addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text) return;
      store.addNote(stopId, memberName(ui.memberId), text);
      textarea.value = "";
    });
  });
}

function renderBoard() {
  const wrap = document.getElementById("board-wrap");
  const rows = TEAM.map((t) => {
    const stops = stopsForMember(t.id);
    const day1 = stops.filter((s) => s.day === "day1");
    const day2 = stops.filter((s) => s.day === "day2");
    return `
      <tr>
        <td class="member-cell">${t.name}</td>
        <td>${day1.map(boardStopHtml).join("") || "<em>—</em>"}</td>
        <td>${day2.map(boardStopHtml).join("") || "<em>—</em>"}</td>
      </tr>
    `;
  }).join("");

  wrap.innerHTML = `
    <table class="board">
      <thead>
        <tr>
          <th>Team member</th>
          <th>${DAY_LABELS.day1}</th>
          <th>${DAY_LABELS.day2}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function boardStopHtml(s) {
  const status = store.getStatus(s.id);
  return `
    <div class="board-stop">
      <div class="b-time">${s.start}–${s.end} · ${escapeHtml(s.zone)}</div>
      <div class="b-school">${escapeHtml(s.school)} <a href="${directionsUrl(s.address)}" target="_blank" rel="noopener" title="Directions">🧭</a></div>
      <span class="pill ${status}">${STATUS_LABELS[status]}</span>
    </div>
  `;
}

function renderNotesBrowser() {
  const wrap = document.getElementById("notes-browser-list");
  const filter = ui.noteFilter.trim().toLowerCase();
  const withNotes = STOPS.filter((s) => store.getNotes(s.id).length > 0).filter((s) => !filter || s.school.toLowerCase().includes(filter));

  if (!withNotes.length) {
    wrap.innerHTML = `<p class="note-empty">${filter ? "No campuses match your search." : "No campus notes yet. Notes added on the My Route tab will show up here for the whole team."}</p>`;
    return;
  }

  wrap.innerHTML = withNotes
    .map((s) => {
      const notes = store.getNotes(s.id);
      return `
        <div class="campus-block">
          <h3>${escapeHtml(s.school)} <span class="pill ${store.getStatus(s.id)}">${STATUS_LABELS[store.getStatus(s.id)]}</span></h3>
          <div class="notes-list" style="max-height:none;">
            ${notes.map((n) => `<div class="note-item"><div class="note-meta">${escapeHtml(n.author || "Anonymous")} · ${fmtUpdated(n)}</div>${escapeHtml(n.note)}</div>`).join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

// ---------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------
function initTabs() {
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.activeTab = btn.dataset.tab;
      document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll("section.view").forEach((v) => v.classList.toggle("active", v.id === "view-" + ui.activeTab));
    });
  });
}

function initControls() {
  document.getElementById("member-select").addEventListener("change", (e) => {
    ui.memberId = e.target.value;
    localStorage.setItem("cms_member_id", ui.memberId);
    renderRoute();
  });

  document.getElementById("notes-search").addEventListener("input", (e) => {
    ui.noteFilter = e.target.value;
    renderNotesBrowser();
  });

  document.getElementById("switch-identity").addEventListener("click", () => {
    openNameGate();
  });
}

async function boot() {
  initTabs();
  initControls();
  openNameGate();
  store.onChange(() => {
    if (!document.body.classList.contains("gate-open")) render();
  });
  await store.init();
  if (!document.body.classList.contains("gate-open")) render();
}

boot();
