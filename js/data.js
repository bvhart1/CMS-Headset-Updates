/**
 * CMS Headset Update — event data
 * Event dates: Tuesday Sept 22, 2026 (day1) and Wednesday Sept 23, 2026 (day2)
 *
 * Schedule below is a DRAFT first pass built from the school contact list
 * (grouped by rough Charlotte-Mecklenburg region to keep drive time down,
 * and sequenced to fit inside each campus's reported hours). It is easy to
 * edit: every stop is one object below. Reassign a stop by changing its
 * `member` field to a different id from TEAM, or drag times around.
 *
 * IMPORTANT — travel time: the 30-minute gaps baked into the times below
 * are a flat placeholder, not real drive times. `zone` groups stops by
 * rough part of Mecklenburg County (from general geography, not an actual
 * address lookup) so same-zone stops should be a short hop, but every gap
 * should be sanity-checked against Google/Apple Maps before the event,
 * especially any pair that's a longer drive than expected.
 */

const EVENT_DATES = {
  day1: "2026-09-22",
  day2: "2026-09-23",
};

const TEAM = [
  { id: "ben", name: "Ben" },
  { id: "ej", name: "EJ" },
  { id: "lapaul", name: "LaPaul" },
  { id: "jackie", name: "Jackie" },
  { id: "celina", name: "Celina" },
  { id: "joe", name: "Joe" },
  { id: "tm7", name: "Team Member 7" },
  { id: "tm8", name: "Team Member 8" },
];

// status: "pending" | "in-progress" | "done" | "flagged"
// (live status + notes for each stop are stored in Supabase, keyed by `id`)
const STOPS = [
  // ---- Ben — North zone ----
  { id: "north-mecklenburg-hs", school: "North Mecklenburg HS", contact: "Alexis Broome", email: "alexis1.broome@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "North", member: "ben", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "jm-alexander-ms", school: "J.M. Alexander Middle", contact: "Wendell Fant", email: "wendellf.fant@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "North", member: "ben", day: "day1", start: "9:30a", end: "11:15a" },
  { id: "ridge-road-ms", school: "Ridge Road Middle School", contact: "Torila Goggins", email: "torilal.goggins@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "North", member: "ben", day: "day2", start: "9:15a", end: "11:00a" },

  // ---- Team Member 7 — North zone (2nd route) ----
  { id: "governors-village-stem", school: "Governor's Village STEM Academy", contact: "Norma Raynor", email: "normaj.raynor@cms.k12.nc.us", hours: "9:15a-4:45p", zone: "North", member: "tm7", day: "day1", start: "9:15a", end: "11:00a" },
  { id: "francis-bradley-ms", school: "Francis Bradley Middle School", contact: "Helen Burch", email: "helene.burch@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "North", member: "tm7", day: "day1", start: "11:30a", end: "1:15p" },
  { id: "bailey-ms", school: "Bailey Middle School", contact: "Livanga Hines", email: "livanga1.hines@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "North", member: "tm7", day: "day2", start: "9:15a", end: "11:00a" },

  // ---- EJ — Northeast / East zone ----
  { id: "mallard-creek-hs", school: "Mallard Creek High School", contact: "Johnny Swift", email: "johnnyl.swift@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "Northeast", member: "ej", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "julius-chambers-hs", school: "Julius L. Chambers High School", contact: "Yewande Colon", email: "yewandec.olugbuyi@cms.k12.nc.us", hours: "7:15a-2:30p", zone: "Northeast", member: "ej", day: "day1", start: "9:30a", end: "11:15a" },
  { id: "mcclintock-ms", school: "McClintock Middle School", contact: "Tammy Newton", email: "tammy1.newton@cms.k12.nc.us", hours: "8:00a-3:30p", zone: "East", member: "ej", day: "day2", start: "8:00a", end: "9:45a" },

  // ---- Celina — East zone ----
  { id: "garinger-hs", school: "Garinger High School", contact: "Trib Williamson", email: "tribut.williamson@cms.k12.nc.us", hours: "7:00a-2:30p", zone: "East", member: "celina", day: "day1", start: "7:00a", end: "8:45a" },
  { id: "eastway-ms", school: "Eastway Middle School", contact: "LaLeza Yorn", email: "laleza.yorn@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "East", member: "celina", day: "day1", start: "9:15a", end: "11:00a" },
  { id: "east-mecklenburg-hs", school: "East Mecklenburg High School", contact: "Betsy McGraw", email: "elizabeth.mcgraw@cms.k12.nc.us", hours: "6:45a-2:15p", zone: "East", member: "celina", day: "day2", start: "6:45a", end: "8:30a" },
  { id: "independence-hs", school: "Independence High School", contact: "Charise Thomas", email: "charise.thomas@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "East", member: "celina", day: "day2", start: "9:00a", end: "10:45a" },

  // ---- LaPaul — Southeast zone ----
  { id: "butler-hs", school: "David W. Butler High School", contact: "Jessica Walker", email: "jessicam.walker@cms.k12.nc.us", hours: "7:15a-2:30p", zone: "Southeast", member: "lapaul", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "mint-hill-ms", school: "Mint Hill Middle School", contact: "Tressa Blake", email: "tressa.blake@cms.k12.nc.us", hours: "8:15a-3:15p", zone: "Southeast", member: "lapaul", day: "day1", start: "9:30a", end: "11:15a" },
  { id: "jay-robinson-ms", school: "Jay M. Robinson Middle School", contact: "Suzie Melton", email: "suzannee.melton@cms.k12.nc.us", hours: "8:00a-3:00p (on site by 7:05a)", zone: "Southeast", member: "lapaul", day: "day2", start: "7:05a", end: "8:50a" },

  // ---- Joe — South zone ----
  { id: "south-mecklenburg-hs", school: "South Mecklenburg High", contact: "Hermia Snipes", email: "hermiab.snipes@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "South", member: "joe", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "ballantyne-ridge-hs", school: "Ballantyne Ridge HS", contact: "Katherine Fisher", email: "katherineb.fisher@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "South", member: "joe", day: "day1", start: "9:30a", end: "11:15a" },
  { id: "south-charlotte-ms", school: "South Charlotte MS", contact: "Troy King", email: "troym.king@cms.k12.nc.us", hours: "8:30a-3:30p", zone: "South", member: "joe", day: "day2", start: "8:30a", end: "10:15a" },

  // ---- Jackie — South / West zone ----
  { id: "providence-hs", school: "Providence High School", contact: "Danielle Grecu", email: "daniellem.grecu@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "South", member: "jackie", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "community-house-ms", school: "Community House Middle School", contact: "Christine Miller", email: "christinea.miller@cms.k12.nc.us", hours: "9:15a-4:10p", zone: "South", member: "jackie", day: "day1", start: "9:30a", end: "11:15a" },
  { id: "charlotte-virtual", school: "Charlotte Virtual", contact: "Terri Donegan-Sanchez", email: "tl.donegan-sanchez@cms.k12.nc.us", hours: "7:00a-10:00a (short window)", zone: "West/Central", member: "jackie", day: "day2", start: "7:00a", end: "8:45a" },
  { id: "oaklawn-language-academy", school: "Oaklawn Language Academy", contact: "Valerie Walker / Suzette Brown", email: "valeriel.walker@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "West/Central", member: "jackie", day: "day2", start: "9:15a", end: "11:00a" },

  // ---- Team Member 8 — West / Central + Southwest zone ----
  { id: "druid-hills-academy", school: "Druid Hills Academy", contact: "Valerie Walker", email: "valeriel.walker@cms.k12.nc.us", hours: "8:00a-3:00p", zone: "West/Central", member: "tm8", day: "day1", start: "8:00a", end: "9:45a" },
  { id: "kennedy-ms", school: "Kennedy Middle School", contact: "Tasha Sherrill", email: "tashas.sherrill@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "West/Central", member: "tm8", day: "day1", start: "10:15a", end: "12:00p" },
  { id: "olympic-hs", school: "Olympic High School", contact: "Lisa Robinson / Tiffany Johnson", email: "melonie.robinson@cms.k12.nc.us", hours: "6:45a-2:15p", zone: "Southwest", member: "tm8", day: "day2", start: "6:45a", end: "8:30a" },
  { id: "charlotte-mecklenburg-academy", school: "Charlotte Mecklenburg Academy", contact: "Makeda Terry", email: "makedaj.terry@cms.k12.nc.us", hours: "7:00a-2:00p", zone: "West/Central", member: "tm8", day: "day2", start: "9:00a", end: "10:45a" },
  { id: "wilson-stem-academy", school: "Wilson STEM Academy", contact: "Tangee Kizer", email: "tangeeb.kizer@cms.k12.nc.us", hours: "8:45a-4:15p", zone: "West/Central", member: "tm8", day: "day2", start: "11:15a", end: "1:00p" },
];
