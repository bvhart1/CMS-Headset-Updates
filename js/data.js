/**
 * CMS Headset Update — event data
 * Event dates: Tuesday Sept 22, 2026 (day1) and Wednesday Sept 23, 2026 (day2)
 *
 * Schedule below is a DRAFT first pass built from the school contact list,
 * grouped into zones using each campus's real street address (looked up
 * individually, not an official CMS directory export -- worth a spot check),
 * and sequenced to fit inside each campus's reported hours. It is easy to
 * edit: every stop is one object below. Reassign a stop by changing its
 * `member` field to a different id from TEAM, or drag times around.
 *
 * Roster (2026-09-15 sign-in sheet): 7 confirmed slots, one of which --
 * West Charlotte/Uptown -- is covered by a different person each day
 * (Johnnie-Lynn Crosby day 1, Larry Bennett day 2). Since this app shows
 * one person's own route, that slot is modeled as two separate TEAM
 * entries rather than one person with day-dependent identity -- each
 * naturally only has stops on their one day.
 *
 * Team Member 8 (Southwest Charlotte / Steele Creek) is not on this
 * roster, so their 4 schools were redistributed to whoever's route
 * already passes near that corridor: Olympic HS + Kennedy MS to Joe's
 * day 2, and Charlotte Virtual to Larry's day 2. Ballantyne Ridge HS
 * moved from Joe to Jackie's day 2 in the same pass, to keep it with
 * her other Ballantyne (28277) stops instead of making Joe zig-zag
 * between South Charlotte and Steele Creek in one day.
 *
 * West Mecklenburg High School (added 2026-09-16, contact Sherri Moore --
 * no hours submitted yet) sits on Larry's day 2 right next to Wilson STEM
 * Academy -- both on Tuckaseegee Rd, a couple minutes apart. Berryhill
 * School moved from Larry to Joe's day 2 (joining Olympic/Kennedy in the
 * Steele Creek corridor) to keep Larry's day from getting too long.
 *
 * Stop counts: 5-4-4-5-4-3-2-3 (Larry's 3 + Johnnie-Lynn's 2 count as one
 * 5-school slot). University City's 5 schools are a genuine 5-10 min
 * apart, so that cluster stays with one person (Luanne) rather than
 * being split just to even out headcount.
 *
 * Travel time: gaps between same-day stops are still a placeholder (~20
 * min), not a real routing calculation -- but stops are grouped by actual
 * address, so same-zone hops should genuinely be short. The one exception
 * is Charlotte Virtual: sources disagree on its physical address (1900
 * Newcastle St vs. 7030 Nations Ford Rd) since it's a virtual school
 * without a normal single campus -- confirm with Terri Donegan-Sanchez
 * where to actually go before Larry's stop there.
 */

const EVENT_DATES = {
  day1: "2026-09-22",
  day2: "2026-09-23",
};

const TEAM = [
  { id: "luanne", name: "Luanne Bumgardner", phone: "234-855-3923" },
  { id: "ben", name: "Ben Hart", phone: "863-944-1058" },
  { id: "johnnielynn", name: "Johnnie-Lynn Crosby", phone: "864-497-7458" },
  { id: "larry", name: "Larry Bennett", phone: "704-650-7642" },
  { id: "celina", name: "Celina Stone", phone: "434-242-4423" },
  { id: "joe", name: "Joe Guillen", phone: "816-853-3515" },
  { id: "jackie", name: "Jackie Smalls", phone: "301-502-6861" },
  { id: "lapaul", name: "LaPaul E. Shelton", phone: "770-617-5670" },
];

// status: "pending" | "in-progress" | "done" | "flagged"
// (live status + notes for each stop are stored in Supabase, keyed by `id`)
const STOPS = [
  // ---- Luanne Bumgardner — University City (5 -- one tight cluster, kept whole) ----
  { id: "mallard-creek-hs", school: "Mallard Creek High School", address: "3825 Johnston Oehler Rd, Charlotte, NC 28269", contact: "Johnny Swift", email: "johnnyl.swift@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "University City", member: "luanne", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "julius-chambers-hs", school: "Julius L. Chambers High School", address: "7600 IBM Dr, Charlotte, NC 28262", contact: "Yewande Colon", email: "yewandec.olugbuyi@cms.k12.nc.us", hours: "7:15a-2:30p", zone: "University City", member: "luanne", day: "day1", start: "9:20a", end: "11:05a" },
  { id: "charlotte-mecklenburg-academy", school: "Charlotte Mecklenburg Academy", address: "5833 Millhaven Ln, Charlotte, NC 28269", contact: "Makeda Terry", email: "makedaj.terry@cms.k12.nc.us", hours: "7:00a-2:00p", zone: "University City", member: "luanne", day: "day1", start: "11:25a", end: "1:10p" },
  { id: "ridge-road-ms", school: "Ridge Road Middle School", address: "7260 Highland Creek Pkwy, Charlotte, NC 28269", contact: "Torila Goggins", email: "torilal.goggins@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "University City", member: "luanne", day: "day2", start: "9:15a", end: "11:00a" },
  { id: "governors-village-stem", school: "Governor's Village STEM Academy", address: "7810 Neal Rd, Charlotte, NC 28262", contact: "Norma Raynor", email: "normaj.raynor@cms.k12.nc.us", hours: "9:15a-4:45p", zone: "University City", member: "luanne", day: "day2", start: "11:20a", end: "1:05p" },

  // ---- Ben Hart — Huntersville / Cornelius (4) ----
  { id: "north-mecklenburg-hs", school: "North Mecklenburg HS", address: "11201 Old Statesville Rd, Huntersville, NC 28078", contact: "Alexis Broome", email: "alexis1.broome@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "Huntersville/Cornelius", member: "ben", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "jm-alexander-ms", school: "J.M. Alexander Middle", address: "12010 Hambright Rd, Huntersville, NC 28078", contact: "Wendell Fant", email: "wendellf.fant@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "Huntersville/Cornelius", member: "ben", day: "day1", start: "9:20a", end: "11:05a" },
  { id: "francis-bradley-ms", school: "Francis Bradley Middle School", address: "13345 Beatties Ford Rd, Huntersville, NC 28078", contact: "Helen Burch", email: "helene.burch@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "Huntersville/Cornelius", member: "ben", day: "day2", start: "9:15a", end: "11:00a" },
  { id: "bailey-ms", school: "Bailey Middle School", address: "11900 Bailey Rd, Cornelius, NC 28031", contact: "Livanga Hines", email: "livanga1.hines@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "Huntersville/Cornelius", member: "ben", day: "day2", start: "11:20a", end: "1:05p" },

  // ---- Johnnie-Lynn Crosby (day 1) / Larry Bennett (day 2) — West Charlotte/Uptown + Southwest Charlotte (5) ----
  { id: "druid-hills-academy", school: "Druid Hills Academy", address: "2801 Lucena St, Charlotte, NC 28206", contact: "Valerie Walker", email: "valeriel.walker@cms.k12.nc.us", hours: "8:00a-3:00p", zone: "West Charlotte/Uptown", member: "johnnielynn", day: "day1", start: "8:00a", end: "9:45a" },
  { id: "oaklawn-language-academy", school: "Oaklawn Language Academy", address: "1810 Oaklawn Ave, Charlotte, NC 28216", contact: "Valerie Walker / Suzette Brown", email: "valeriel.walker@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "West Charlotte/Uptown", member: "johnnielynn", day: "day1", start: "10:05a", end: "11:50a" },
  { id: "charlotte-virtual", school: "Charlotte Virtual", address: "7030 Nations Ford Rd, Charlotte, NC 28217 (unconfirmed -- verify with contact)", contact: "Terri Donegan-Sanchez", email: "tl.donegan-sanchez@cms.k12.nc.us", hours: "7:00a-10:00a (short window)", zone: "Southwest Charlotte", member: "larry", day: "day2", start: "7:00a", end: "8:45a" },
  { id: "wilson-stem-academy", school: "Wilson STEM Academy", address: "7020 Tuckaseegee Rd, Charlotte, NC 28214", contact: "Tangee Kizer", email: "tangeeb.kizer@cms.k12.nc.us", hours: "8:45a-4:15p", zone: "West Charlotte/Uptown", member: "larry", day: "day2", start: "9:10a", end: "10:55a" },
  { id: "west-mecklenburg-hs", school: "West Mecklenburg High School", address: "7400 Tuckaseegee Rd, Charlotte, NC 28214", contact: "Sherri Moore", email: "sherril.moore@cms.k12.nc.us", hours: "Not yet submitted -- assumed within a normal school day; confirm with contact", zone: "West Charlotte/Uptown", member: "larry", day: "day2", start: "11:15a", end: "1:00p" },

  // ---- Celina Stone — East Charlotte (4) ----
  { id: "garinger-hs", school: "Garinger High School", address: "1100 Eastway Dr, Charlotte, NC 28205", contact: "Trib Williamson", email: "tribut.williamson@cms.k12.nc.us", hours: "7:00a-2:30p", zone: "East Charlotte", member: "celina", day: "day1", start: "7:00a", end: "8:45a" },
  { id: "eastway-ms", school: "Eastway Middle School", address: "1501 Norland Rd, Charlotte, NC 28205", contact: "LaLeza Yorn", email: "laleza.yorn@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "East Charlotte", member: "celina", day: "day1", start: "9:05a", end: "10:50a" },
  { id: "east-mecklenburg-hs", school: "East Mecklenburg High School", address: "6800 Monroe Rd, Charlotte, NC 28212", contact: "Betsy McGraw", email: "elizabeth.mcgraw@cms.k12.nc.us", hours: "6:45a-2:15p", zone: "East Charlotte", member: "celina", day: "day2", start: "6:45a", end: "8:30a" },
  { id: "mcclintock-ms", school: "McClintock Middle School", address: "1925 Rama Rd, Charlotte, NC 28212", contact: "Tammy Newton", email: "tammy1.newton@cms.k12.nc.us", hours: "8:00a-3:30p", zone: "East Charlotte", member: "celina", day: "day2", start: "8:50a", end: "10:35a" },

  // ---- Joe Guillen — South Charlotte + Southwest Charlotte (5) ----
  { id: "south-mecklenburg-hs", school: "South Mecklenburg High", address: "8900 Park Rd, Charlotte, NC 28210", contact: "Hermia Snipes", email: "hermiab.snipes@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "South Charlotte", member: "joe", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "providence-hs", school: "Providence High School", address: "1800 Pineville-Matthews Rd, Charlotte, NC 28270", contact: "Danielle Grecu", email: "daniellem.grecu@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "South Charlotte", member: "joe", day: "day1", start: "9:20a", end: "11:05a" },
  { id: "olympic-hs", school: "Olympic High School", address: "4301 Sandy Porter Rd, Charlotte, NC 28273", contact: "Lisa Robinson / Tiffany Johnson", email: "melonie.robinson@cms.k12.nc.us", hours: "6:45a-2:15p", zone: "Southwest Charlotte", member: "joe", day: "day2", start: "6:45a", end: "8:30a" },
  { id: "kennedy-ms", school: "Kennedy Middle School", address: "4000 Gallant Ln, Charlotte, NC 28273", contact: "Tasha Sherrill", email: "tashas.sherrill@cms.k12.nc.us", hours: "9:15a-4:15p", zone: "Southwest Charlotte", member: "joe", day: "day2", start: "9:15a", end: "11:00a" },
  { id: "berryhill-school", school: "Berryhill School", address: "10501 Windy Grove Rd, Charlotte, NC 28278", contact: "Contact not yet submitted", email: "", hours: "8:30a-3:30p", zone: "Southwest Charlotte", member: "joe", day: "day2", start: "11:20a", end: "1:05p" },

  // ---- Jackie Smalls — Ballantyne core (4) ----
  { id: "jay-robinson-ms", school: "Jay M. Robinson Middle School", address: "5925 Ballantyne Commons Pkwy, Charlotte, NC 28277", contact: "Suzie Melton", email: "suzannee.melton@cms.k12.nc.us", hours: "8:00a-3:00p (on site by 7:05a)", zone: "Ballantyne", member: "jackie", day: "day1", start: "7:05a", end: "8:50a" },
  { id: "south-charlotte-ms", school: "South Charlotte MS", address: "8040 Strawberry Ln, Charlotte, NC 28277", contact: "Troy King", email: "troym.king@cms.k12.nc.us", hours: "8:30a-3:30p", zone: "Ballantyne", member: "jackie", day: "day1", start: "9:10a", end: "10:55a" },
  { id: "ballantyne-ridge-hs", school: "Ballantyne Ridge HS", address: "4004 Toringdon Way, Charlotte, NC 28277", contact: "Katherine Fisher", email: "katherineb.fisher@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "Ballantyne", member: "jackie", day: "day2", start: "7:15a", end: "9:00a" },
  { id: "community-house-ms", school: "Community House Middle School", address: "9500 Community House Rd, Charlotte, NC 28277", contact: "Christine Miller", email: "christinea.miller@cms.k12.nc.us", hours: "9:15a-4:10p", zone: "Ballantyne", member: "jackie", day: "day2", start: "9:20a", end: "11:05a" },

  // ---- LaPaul E. Shelton — Matthews / Mint Hill + Independence (3) ----
  { id: "butler-hs", school: "David W. Butler High School", address: "1810 Matthews-Mint Hill Rd, Matthews, NC 28105", contact: "Jessica Walker", email: "jessicam.walker@cms.k12.nc.us", hours: "7:15a-2:30p", zone: "Matthews/Mint Hill", member: "lapaul", day: "day1", start: "7:15a", end: "9:00a" },
  { id: "mint-hill-ms", school: "Mint Hill Middle School", address: "11501 Idlewild Rd, Matthews, NC 28105", contact: "Tressa Blake", email: "tressa.blake@cms.k12.nc.us", hours: "8:15a-3:15p", zone: "Matthews/Mint Hill", member: "lapaul", day: "day1", start: "9:20a", end: "11:05a" },
  { id: "independence-hs", school: "Independence High School", address: "1967 Patriot Dr, Charlotte, NC 28227", contact: "Charise Thomas", email: "charise.thomas@cms.k12.nc.us", hours: "7:15a-2:15p", zone: "East Charlotte", member: "lapaul", day: "day2", start: "7:15a", end: "9:00a" },
];
