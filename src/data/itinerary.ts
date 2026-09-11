/**
 * Georgia, 26 Sep – 4 Oct 2026.
 *
 * Transcribed from "Georgia Detailed Itinerary". Times, drive legs and stop
 * order come from that document; blurbs are rewritten for a phone screen.
 *
 * elevationM is written by scripts/fetch-elevation.mjs — do not hand-edit.
 * Coordinates marked needsVerify have not yet been confirmed against OSM.
 */
import type { Day } from './types';

export const TRIP = {
  title: 'Georgia',
  start: '2026-09-26',
  end: '2026-10-04',
  hotelTbilisi: 'Panorama Boutique Hotel, Avlabari',
} as const;

export const DAYS: Day[] = [
  /* ══════════════════════════════════ DAY 1 ══════════════════════════════ */
  {
    n: 1, date: '2026-09-26', dd: '26', label: '26 Sep',
    from: 'Dubai', to: 'Tbilisi',
    headline: 'Dubai <em>→</em> Tbilisi',
    sub: 'Land, drop the bags in Avlabari, and walk the old city from the cathedral on the hill down to the sulfur domes.',
    checklist: [
      'Buy a SIM at the airport (Magti / Silknet)',
      'Draw lari from an ATM — much of the old city is cash-only',
      'Bolt app installed and working',
    ],
    stops: [
      {
        id: 'tbs-arrival', time: '—', title: 'Arrive Tbilisi Airport', kicker: 'TBS',
        kind: 'plane', lat: 41.6692, lon: 44.9547,
        blurb: ['Through immigration, then a Bolt or taxi into town — 20–30 minutes. Bus 337 runs the same route for a few lari if you would rather.'],
        tips: ['Buy the SIM and draw cash here before leaving the terminal.'],
        photoQuery: 'Tbilisi International Airport',
        food: [], foodNote: 'Eat in town. Check in first — the cathedral is a two-minute walk from the hotel.',
      },
      {
        id: 'sameba-cathedral', time: '15:00', title: 'Holy Trinity Cathedral', kicker: 'Sameba, on the Avlabari hillside',
        kind: 'church', lat: 41.6977, lon: 44.8189, dwell: '1 h',
        blurb: [
          'Drop your bags at Panorama Boutique Hotel and walk straight over to Sameba — the largest church in Georgia, finished in 2004 and visible from most of the city.',
          'Gold dome, vast echoing interior, and a terrace looking back across the river at the old town you are about to walk into.',
        ],
        photoQuery: 'Holy Trinity Cathedral Tbilisi Sameba',
        tips: ['Shoulders and knees covered; women are given scarves at the door.', 'Free entry.'],
        food: [], foodNote: 'Save your appetite — dinner is back on this side of the river at 19:30.',
      },
      {
        id: 'rike-park', time: '16:30', title: 'Rike Park & the cable car', kicker: 'Across the river and up',
        kind: 'cablecar', lat: 41.6931, lon: 44.8090, drive: { mins: 10, km: 1 }, dwell: '30 min',
        blurb: ['Walk downhill into Rike Park on the riverbank. The cable car station is here — a short glass-cabin ride up over the river to the Narikala ridge.'],
        photoQuery: 'Rike Park Tbilisi cable car',
        ticket: { priceGel: 2.5, note: 'Needs a Metromoney travel card, not cash — buy one at the station.' },
        food: [], foodNote: 'Kiosks in the park if you need water before the climb.',
      },
      {
        id: 'narikala', time: '17:00', title: 'Narikala Fortress', kicker: 'Mother of Georgia on the ridge',
        kind: 'fortress', lat: 41.6875, lon: 44.8072, dwell: '45 min',
        blurb: [
          'A 4th-century fortress on the spine of the hill, rebuilt many times over. Scramble the walls for the full sweep of the old town, the river and the Sameba dome opposite.',
          'A short walk along the ridge is Kartlis Deda — the Mother of Georgia, holding a wine bowl for friends and a sword for enemies.',
        ],
        photoQuery: 'Narikala Fortress Tbilisi',
        tips: ['Uneven stone and no railings in places — mind your footing near the edges.'],
        food: [], foodNote: 'A café sits by the upper cable car station if you want a drink with the view.',
      },
      {
        id: 'abanotubani', time: '18:00', title: 'Abanotubani', kicker: 'The sulfur bath district',
        kind: 'spa', lat: 41.6890, lon: 44.8093, dwell: '1 h 15',
        blurb: [
          'Instead of riding the cable car back, follow the path down the back of the fortress ridge. It drops you straight into Abanotubani and its low brick domes — the bathhouses are underground, the domes are their skylights.',
          'The sulfur smell is the point. Bathe if you have the energy, or just wander the lane and the little waterfall at the end of it.',
        ],
        photoQuery: 'Abanotubani sulphur baths Tbilisi',
        ticket: { note: 'Private rooms roughly 50–150 GEL/hour depending on the bathhouse. Cash.' },
        tips: ['Walk to the end of the gorge for the Leghvtakhevi waterfall — two minutes past the domes.'],
        food: [], foodNote: 'Dinner is a short walk across the river from here.',
      },
      {
        id: 'metekhi-dinner', time: '19:30', title: 'Dinner on the east side', kicker: 'Above the river cliffs',
        kind: 'khinkali', lat: 41.6906, lon: 44.8119, drive: { mins: 10, km: 1 },
        blurb: ['Cross Metekhi Bridge back to the Avlabari side and eat somewhere on the cliff above the Mtkvari, under the Metekhi church and its statue of King Vakhtang.'],
        photoQuery: 'Metekhi Church Tbilisi',
        food: [
          { name: 'Shemomechama', price: '₾₾', kind: 'restaurant', why: 'Classic Georgian done properly in an Old Town courtyard — a safe, very good first meal.', dish: 'khinkali and adjaruli khachapuri', source: 'https://wander-lush.org/tbilisi-georgia-food-best-restaurants-cafes-guide/' },
          { name: 'Barbarestan', price: '₾₾₾', kind: 'restaurant', why: 'A converted butcher shop cooking from a 19th-century Georgian cookbook — forgotten dishes, lace tablecloths, book ahead.', dish: 'whatever the historic menu is running', source: 'https://wander-lush.org/tbilisi-georgia-food-best-restaurants-cafes-guide/' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════ DAY 2 ══════════════════════════════ */
  {
    n: 2, date: '2026-09-27', dd: '27', label: '27 Sep',
    from: 'Tbilisi', to: 'Tbilisi',
    headline: 'Tbilisi <em>on foot</em>',
    sub: 'A full walking day across the west bank — the glass bridge, the leaning clock tower, Rustaveli, the flea market, and the funicular up Mtatsminda for sunset.',
    checklist: ['No car today — walk or metro', 'Metromoney card tops up at any metro station'],
    stops: [
      {
        id: 'bridge-of-peace', time: '09:30', title: 'Bridge of Peace', kicker: 'Glass and steel over the Mtkvari',
        kind: 'monument', lat: 41.6934, lon: 44.8085, dwell: '20 min',
        blurb: ['Cross the curving glass-and-steel footbridge into the west bank. Divisive when it opened in 2010, now the shot everyone takes.'],
        photoQuery: 'Bridge of Peace Tbilisi',
        food: [], foodNote: 'Coffee in the Old Town lanes on the far side.',
      },
      {
        id: 'clock-tower', time: '10:15', title: 'Tbilisi Clock Tower', kicker: 'Gabriadze\'s leaning folly',
        kind: 'monument', lat: 41.6938, lon: 44.8021, drive: { mins: 10, km: 1 }, dwell: '20 min',
        blurb: [
          'Wind through the narrow Old Town streets to the deliberately crooked clock tower the puppeteer Rezo Gabriadze built out of salvage in 2010.',
          'On the hour an angel comes out and strikes the bell. Worth timing your arrival for.',
        ],
        photoQuery: 'Tbilisi Clock Tower Gabriadze',
        tips: ['Angel appears on the hour, and there is a fuller puppet show at 12:00 and 19:00.'],
        food: [], foodNote: 'The lanes around here are thick with cafés — pick one with a courtyard.',
      },
      {
        id: 'freedom-square', time: '11:00', title: 'Freedom Square & Rustaveli', kicker: 'The civic spine',
        kind: 'city', lat: 41.6934, lon: 44.8015, dwell: '1 h 30',
        blurb: [
          'Up the pedestrian streets to Freedom Square with its gold St George column, then northwest along Rustaveli Avenue — the Parliament Building, the Opera, the National Gallery, all plane trees and grand facades.',
        ],
        photoQuery: 'Rustaveli Avenue Tbilisi Parliament',
        food: [], foodNote: 'Lunch is the next stop, on the side streets off this avenue.',
      },
      {
        id: 'vera-lunch', time: '13:00', title: 'Lunch in Vera', kicker: 'Off the leafy side streets',
        kind: 'khinkali', lat: 41.7047, lon: 44.7908, drive: { mins: 12, km: 1 },
        blurb: ['Duck off Rustaveli into Vera — quieter, greener, and where the good modern cafés are.'],
        photoQuery: 'Khachapuri Adjaruli',
        food: [
          { name: 'Café Stamba', price: '₾₾₾', kind: 'cafe', why: 'Inside a converted Soviet publishing house off Rustaveli — vertical herb farm indoors, farm-to-table kitchen, the best-looking room in the city.', dish: 'breakfast plates served all day', source: 'https://wander-lush.org/tbilisi-georgia-food-best-restaurants-cafes-guide/' },
          { name: 'Shavi Lomi', price: '₾₾', kind: 'restaurant', why: 'The Black Lion, in Sololaki — contemporary takes on Georgian classics under vaulted ceilings, mismatched furniture, candles everywhere.', dish: 'eggplant with walnut sauce; blackberry chicken', source: 'https://wander-lush.org/tbilisi-georgia-food-best-restaurants-cafes-guide/' },
        ],
      },
      {
        id: 'dry-bridge', time: '14:30', title: 'Dry Bridge Market', kicker: 'Soviet junk and treasure',
        kind: 'market', lat: 41.6976, lon: 44.8060, drive: { mins: 15, km: 1.5 }, dwell: '1 h 15',
        blurb: [
          'An open-air flea market sprawling along the riverbank — Soviet medals and cameras, Georgian enamel, painted plates, old watches, genuine antiques and cheerful fakes side by side.',
          'Haggling is expected and good-natured.',
        ],
        photoQuery: 'Dry Bridge Market Tbilisi',
        tips: ['Bring small notes — nobody has change for a 100.', 'Busiest and best at weekends.'],
        food: [], foodNote: 'Snack stalls only. Dinner is up the mountain tonight.',
      },
      {
        id: 'mtatsminda', time: '16:30', title: 'Mtatsminda Funicular', kicker: 'Sunset over the whole city',
        kind: 'cablecar', lat: 41.6990, lon: 44.7907, drive: { mins: 20, km: 2 }, dwell: '2 h',
        blurb: [
          'The historic funicular railway climbs the mountain that stands over Tbilisi. At the top: a park, a ferris wheel, the Pantheon of writers, and the city laid out end to end.',
          'Time it for golden hour and stay for the lights coming on.',
        ],
        photoQuery: 'Mtatsminda Park Tbilisi funicular',
        ticket: { note: 'Funicular needs its own card, bought at the lower station.' },
        food: [], foodNote: 'The restaurant at the top station is the classic choice for tonight.',
      },
      {
        id: 'farewell-dinner', time: '19:30', title: 'Dinner at the top', kicker: 'Last night before the road',
        kind: 'khinkali', lat: 41.6951, lon: 44.7860,
        blurb: ['Eat at the funicular restaurant with the city below you, or ride back down and find something in the Rustaveli streets. The car arrives at 09:00 tomorrow.'],
        photoQuery: 'Mtatsminda restaurant Tbilisi view',
        food: [
          { name: 'Funicular Restaurant', price: '₾₾₾', kind: 'restaurant', why: 'At the top station, glass wall onto the whole city. You are paying partly for the view and it is worth it once.', dish: 'Georgian standards, well executed', source: 'https://wander-lush.org/tbilisi-georgia-food-best-restaurants-cafes-guide/' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════ DAY 3 ══════════════════════════════ */
  {
    n: 3, date: '2026-09-28', dd: '28', label: '28 Sep',
    from: 'Tbilisi', to: 'Kazbegi', departAt: '09:00', distanceKm: 160,
    headline: 'Tbilisi <em>→</em> Kazbegi',
    sub: 'Six stops climbing the Georgian Military Highway from the city into the high Caucasus — a 1,945 m ascent to Jvari Pass before dropping into Stepantsminda for golden hour.',
    checklist: [
      'Check out of Panorama Boutique Hotel',
      'Collect rental car — photograph every existing scratch',
      'Fuel up before the Gudauri climb',
      'Passport + licence on you for the rental',
    ],
    stops: [
      {
        id: 'depart-tbilisi', time: '09:00', title: 'Depart Tbilisi', kicker: 'Pick up the rental car',
        kind: 'car', lat: 41.6938, lon: 44.8015,
        blurb: ['Pack up, check out of Panorama Boutique Hotel and head directly north out of the city centre. The whole day runs one direction — no backtracking.'],
        photoNote: 'No free photo — illustrated fallback',
        food: [], foodNote: 'Breakfast at the hotel before you go. The next real food stop is Pasanauri at 12:30 — over three hours away.',
      },
      {
        id: 'chronicles-of-georgia', time: '09:30', title: 'Chronicles of Georgia', kicker: "Georgia's Stonehenge",
        kind: 'monument', lat: 41.7707, lon: 44.8104, drive: { mins: 20, km: 18 }, dwell: '30–45 min',
        blurb: [
          "Sixteen bronze pillars, each 35 m tall, carved with Georgian kings on the upper half and the life of Christ below — Tsereteli's unfinished monument on a hill above the Tbilisi Sea reservoir.",
          'You skipped this on the walking days, so it goes first while the morning light is still crisp.',
        ],
        photos: [{ commons: 'Georgiaren Kronikak (Tbilisi) - The Chronicle of Georgia - Tagzania - 1775459623095.jpg' }],
        tips: ['Parking lot right at the base — no walk in.', 'Free to enter, no ticket office.'],
        food: [], foodNote: 'Nothing up here. Grab coffee in the city before you leave.',
      },
      {
        id: 'ananuri-fortress', time: '11:00', title: 'Ananuri Fortress', kicker: 'A castle on turquoise water',
        kind: 'fortress', lat: 42.1647, lon: 44.7031, drive: { mins: 60, km: 70 }, dwell: '45 min',
        blurb: [
          'A 17th-century castle complex right on the edge of the Zhinvali Reservoir, where the Aragvi backs up into an improbable turquoise. Two churches, stone watchtowers and a curtain wall you can walk.',
          'The shot is the church against the bright blue water — best from the wall on the reservoir side.',
        ],
        photos: [{ commons: 'Georgia - Ananuri castle complex.jpg' }],
        tips: ['Park by the bridge below the complex.', 'Free to enter the grounds; cover shoulders inside the churches.'],
        food: [], foodNote: 'Only churchkhela and snack stalls by the car park. Hold out for Pasanauri — you are 25 minutes from the best khinkali in the country.',
      },
      {
        id: 'pasanauri', time: '12:30', title: 'Pasanauri', kicker: 'Where khinkali was invented',
        kind: 'khinkali', lat: 42.3536, lon: 44.6872, drive: { mins: 25, km: 24 }, dwell: '1 h 15',
        blurb: [
          'A small riverside village that claims — with reasonable authority — to be the birthplace of khinkali. This is the lunch stop the whole morning is built around.',
          'Order them plain, twist off the doughy top-knot, bite a hole, drink the broth first. Never with a fork. Count your knots and leave them on the plate.',
        ],
        photos: [{ commons: 'Kazbegi, Khinkali, Georgia.jpg' }],
        tips: ['Sit on a river-side terrace if the weather holds.', 'Khinkali are made to order — budget the full hour.'],
        food: [
          { name: 'Restaurant Chabarukhi', price: '₾₾', kind: 'duqani', why: 'Rustic roadside duqani in the village itself, the one the itinerary names. Hand-rolled to order.', dish: 'plain beef khinkali, freshly rolled', source: 'Georgia Detailed Itinerary' },
          { name: 'Pasanauri Restaurant', price: '₾', kind: 'duqani', why: 'The other village institution, right on the main road. Simple, generous, riverside seating.', dish: 'khinkali + mtsvadi off the coals', source: 'Georgia Detailed Itinerary' },
        ],
      },
      {
        id: 'aragvi-confluence', time: '14:15', title: 'Black & White Aragvi Confluence', kicker: 'Two rivers, one riverbed',
        kind: 'river', lat: 42.3722, lon: 44.6797, drive: { mins: 5, km: 3 }, dwell: '15 min', needsVerify: true,
        blurb: [
          'Just north of Pasanauri the Black Aragvi and White Aragvi meet — and for a few hundred metres refuse to mix, running side by side in the same bed with a hard line down the middle.',
          'A small roadside pull-off, easy to blow straight past at speed.',
        ],
        photoNote: 'No freely-licensed photo found — illustrated fallback',
        tips: ['Northbound, roughly 3 km past the village. Slow down early.', 'Clearest after rain, when the dark branch runs darker.'],
        food: [], foodNote: 'A 15-minute photo stop, nothing more. You have just eaten.',
      },
      {
        id: 'friendship-monument', time: '15:15', title: 'Russia–Georgia Friendship Monument', kicker: "On the lip of Devil's Valley",
        kind: 'peak', lat: 42.4899, lon: 44.4547, drive: { mins: 45, km: 34 }, dwell: '45 min',
        blurb: [
          "A huge circular concrete drum built in 1983, its inner face covered in a bright tiled mosaic of Georgian and Russian history — perched on the very edge of a cliff above the valley they call the Devil's.",
          'The panorama is the best on the road. Watch for paragliders drifting past the observation deck at eye level.',
        ],
        photos: [{ commons: 'Russia–Georgia Friendship Monument 09.23.jpg' }],
        tips: ['You have climbed 1,284 m since lunch — far colder and windier. Grab a jacket from the boot.', 'Short unpaved access track off the highway past Gudauri.'],
        food: [], foodNote: 'Coffee and corn vans in the car park in season. Proper food is back down in Gudauri.',
      },
      {
        id: 'jvari-pass-springs', time: '16:30', title: 'Jvari Pass Mineral Springs', kicker: 'Travertine terraces at the top',
        kind: 'river', lat: 42.5060, lon: 44.4530, drive: { mins: 15, km: 9 }, dwell: '20 min',
        blurb: [
          'The highest point of the whole highway. Mineral-rich spring water runs down the mountain face beside the asphalt and has, over centuries, built a terrace of rust-and-cream limestone you can walk right up to.',
          'Rare geology, ten steps from the car.',
        ],
        photos: [{ commons: 'Georgia - Jvari pass, 2395 m.jpg' }],
        tips: ['2,395 m — the top. Weather turns here fast and first.', 'Terrace is right beside the road; do not climb the wet rust-coloured rock.'],
        food: [], foodNote: 'Nothing at the pass. Next food is in Stepantsminda, 35 minutes downhill.',
      },
      {
        id: 'kazbegi-checkin', time: '17:30', title: 'Kazbegi · Stepantsminda', kicker: 'Golden hour on Mount Kazbek',
        kind: 'bed', lat: 42.6572, lon: 44.6425, drive: { mins: 35, km: 30 },
        blurb: [
          'Down through the tunnels into Stepantsminda, arriving just as the late sun hits the 5,054 m face of Kazbek. Check in, then dinner in town.',
          'Rest up — Gergeti Trinity Church is an 08:30 start tomorrow.',
        ],
        photos: [{ commons: 'Kazbegi, Stepantsminda, Gergeti, Georgia.jpg' }],
        tips: ['Kazbek clears and clouds over within minutes — shoot it the moment it shows.'],
        food: [
          { name: 'Tiba', price: '₾₾₾', kind: 'restaurant', why: 'On the hill opposite, facing Gergeti Trinity through floor-to-ceiling windows. The serious dinner.', dish: 'khabidzgina with mountain potatoes; kartokha khinkali', source: 'https://wander-lush.org/best-restaurants-in-kazbegi-georgia/' },
          { name: 'Kazbegi Good Food', price: '₾', kind: 'duqani', why: 'Proper duqani run by an elderly couple. No frills, no menu theatre, excellent.', dish: 'mtsvadi, kupati sausage, ostri stew', source: 'https://wander-lush.org/best-restaurants-in-kazbegi-georgia/' },
          { name: 'Rooms Hotel Kazbegi', price: '₾₾₾', kind: 'restaurant', why: 'The famous Kazbek-view terrace. Book ahead in season.', dish: 'drinks at sunset even if you eat elsewhere', source: 'https://wander-lush.org/best-restaurants-in-kazbegi-georgia/' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════ DAY 4 ══════════════════════════════ */
  {
    n: 4, date: '2026-09-29', dd: '29', label: '29 Sep',
    from: 'Kazbegi', to: 'Gori',
    headline: 'Kazbegi <em>→</em> Gori',
    sub: 'The church on the ridge first, then the whole highway back down and west — ancient capital, cave city, and a citadel in the middle of Gori.',
    checklist: [
      'Check out of the Kazbegi hotel',
      'Full tank before leaving the mountains',
      'Uplistsikhe closes around 18:00 — do not lose the afternoon',
    ],
    stops: [
      {
        id: 'gergeti-trinity', time: '08:30', title: 'Gergeti Trinity Church', kicker: 'The one on the ridge under Kazbek',
        kind: 'church', lat: 42.6625, lon: 44.6206, dwell: '1 h',
        blurb: [
          'A 14th-century stone church standing alone at 2,170 m with Mount Kazbek behind it — the single most photographed thing in Georgia, and it earns it.',
          'The road up is paved now, so it is a 15-minute drive rather than the old two-hour slog. Start early for clear morning light before the cloud builds.',
        ],
        photos: [{ commons: 'Gergeti Trinity Church 05.jpg' }],
        tips: ['Paved road up from Stepantsminda — any car manages it in dry weather.', 'Covered shoulders and knees; skirts are lent at the gate.'],
        food: [], foodNote: 'Nothing up here. Breakfast in town first.',
      },
      {
        id: 'sno-stone-heads', time: '10:15', title: 'The Stone Heads of Sno', kicker: 'Giant faces in an empty field',
        kind: 'monument', lat: 42.6100, lon: 44.6700, drive: { mins: 15, km: 10 }, dwell: '20 min', needsVerify: true,
        blurb: [
          'Fifteen minutes up the Sno valley, a local sculptor has carved enormous stone portrait heads of Georgian writers and kings and left them standing in an open field.',
          'Utterly unexplained, right off the road, and a far better photo stop than it has any right to be.',
        ],
        photoQuery: 'Sno Kazbegi valley',
        tips: ['Free, unfenced, no facilities.'],
        food: [], foodNote: 'Last chance for a coffee is back in Stepantsminda. Lunch is three hours away in Mtskheta.',
      },
      {
        id: 'jvari-monastery', time: '12:30', title: 'Jvari Monastery', kicker: 'Above the meeting of two rivers',
        kind: 'church', lat: 41.8383, lon: 44.7331, drive: { mins: 135, km: 140 }, dwell: '30 min',
        blurb: [
          'A 6th-century church on the bluff overlooking Mtskheta, where the Aragvi you have been following all trip finally runs into the Mtkvari. You can see the two colours meet from up here.',
          'Small, severe, and one of the oldest surviving churches in the country.',
        ],
        photoQuery: 'Jvari Monastery Mtskheta',
        tips: ['Windy on the bluff even on a still day.'],
        food: [], foodNote: 'Down in Mtskheta in ten minutes — eat there.',
      },
      {
        id: 'svetitskhoveli', time: '13:15', title: 'Svetitskhoveli Cathedral', kicker: 'Where the robe of Christ is buried',
        kind: 'church', lat: 41.8422, lon: 44.7211, drive: { mins: 12, km: 8 }, dwell: '40 min',
        blurb: [
          'The cathedral at the heart of the old capital, and the spiritual centre of Georgia — a UNESCO site holding the tombs of Georgian kings and, by tradition, the robe of Christ.',
          'Park in the tourist lot at the edge of the pedestrian zone and walk in through the cobbled streets.',
        ],
        photoQuery: 'Svetitskhoveli Cathedral Mtskheta',
        tips: ['Busy with tour groups mid-morning; early afternoon is calmer.'],
        food: [], foodNote: 'Lunch next, either in town or at Salobie just off the highway.',
      },
      {
        id: 'salobie-lunch', time: '14:00', title: 'Lunch at Salobie', kicker: 'The house of beans, since 1967',
        kind: 'khinkali', lat: 41.8284, lon: 44.7251, drive: { mins: 10, km: 7 }, dwell: '1 h',
        blurb: [
          'A roadside institution on the Mtskheta–Gori road, open since 1967 and famous for one thing: lobio, spiced beans cooked in a clay pot with a cap of hot cornbread on top.',
          'Order it with mtsvadi off the coals and eat outside under the trees.',
        ],
        photoQuery: 'lobio clay pot Georgian beans',
        food: [
          { name: 'Salobie', price: '₾', kind: 'restaurant', why: 'Open since 1967 and still the benchmark for lobio. Cheap, busy with locals, terrace under tall trees.', dish: 'clay-pot lobio with mchadi; khinkali', source: 'https://culinarybackstreets.com/stories/tbilisi/salobie-2' },
        ],
        tips: ['Open 10:30–23:00 daily.'],
      },
      {
        id: 'uplistsikhe', time: '15:45', title: 'Uplistsikhe Cave Town', kicker: 'A pagan city cut into the rock',
        kind: 'cave', lat: 41.9661, lon: 44.2078, drive: { mins: 45, km: 55 }, dwell: '1 h 30 – 2 h',
        blurb: [
          'An entire city carved into a sandstone cliff, lived in from the Early Iron Age. Rock-cut streets, a pagan temple hall, wine cellars, secret tunnels down to the river.',
          'A 9th-century Christian basilica sits on top of the old sacrificial sites — the whole religious history of the country stacked in one hillside.',
        ],
        photoQuery: 'Uplistsikhe cave town Georgia',
        ticket: { priceGel: 25, note: 'Last entry is well before dusk — check on arrival.' },
        tips: ['The rock is polished slippery by 3,000 years of feet. Proper shoes.', 'Almost no shade — hat and water.'],
        food: [], foodNote: 'A café sits by the ticket office. Better to wait for dinner in Gori.',
      },
      {
        id: 'gori-fortress', time: '17:30', title: 'Gori Fortress', kicker: 'Goris Tsikhe, golden hour',
        kind: 'fortress', lat: 41.9847, lon: 44.1072, drive: { mins: 15, km: 14 }, dwell: '45 min',
        blurb: [
          'A medieval citadel on a rock in the dead centre of the city. Short walk up to the walls for the whole Gori cityscape in low sun.',
          'At the base, look for the circle of stone statues of wounded Georgian warriors — strange, stark, and easily missed.',
        ],
        photoQuery: 'Gori Fortress Georgia citadel',
        tips: ['Free. Uneven steps up.'],
        food: [], foodNote: 'Dinner is a few minutes away in the centre.',
      },
      {
        id: 'gori-checkin', time: '18:30', title: 'Gori · check in & dinner', kicker: 'Shida Kartli on a plate',
        kind: 'bed', lat: 41.9847, lon: 44.1128,
        blurb: ['Check in, then find a tavern doing Shida Kartli cooking — the regional chinuri wine and traditional cutlets are what to ask for.'],
        photoQuery: 'Gori Georgia city',
        food: [
          { name: 'Chinebuli', price: '₾', kind: 'restaurant', why: 'Straight across from the Stalin Museum. Long menu of Georgian standards at genuinely low prices.', dish: 'khinkali, cutlets, bbq', source: 'https://www.tripadvisor.com/RestaurantsNear-g317094-d1128827-Stalin_Museum-Gori_Shida_Kartli_Region.html' },
          { name: 'Berikoni', price: '₾₾', kind: 'restaurant', why: 'A solid sit-down option in the centre when you want something more than a canteen.', dish: 'Shida Kartli regional dishes; chinuri wine', source: 'https://evendo.com/locations/georgia/gori/bar/berikoni' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════ DAY 5 ══════════════════════════════ */
  {
    n: 5, date: '2026-09-30', dd: '30', label: '30 Sep',
    from: 'Gori', to: 'Kutaisi', departAt: '09:00',
    headline: 'Gori <em>→</em> Kutaisi',
    sub: 'The long westbound drive through the Rikoti tunnel into green Imereti, then a canyon, a cave, and three monasteries stacked into the afternoon.',
    checklist: [
      'Check out of Gori',
      'Prometheus Cave runs guided tours only — last one is mid-afternoon',
      'Gelati and Motsameta close around sunset',
    ],
    stops: [
      {
        id: 'stalin-museum', time: '08:30', title: 'Stalin Museum', kicker: 'Or Uplistsikhe, if you missed it',
        kind: 'monument', lat: 41.9872, lon: 44.1137, dwell: '1 h',
        blurb: [
          'A backup morning window. If Uplistsikhe slipped yesterday, drive 15 minutes east and do it now.',
          'Otherwise: the Stalin Museum in central Gori, largely unreconstructed since Soviet times, with his birthplace cabin preserved under a portico outside and his armoured railway carriage parked alongside.',
        ],
        photoQuery: 'Joseph Stalin Museum Gori',
        ticket: { priceGel: 20, note: 'Carriage and cabin included in the ticket.' },
        food: [], foodNote: 'Breakfast in Gori before you go. It is a long drive to lunch.',
      },
      {
        id: 'drive-to-martvili', time: '10:00', title: 'Westbound on the E60', kicker: 'Through the Rikoti tunnel',
        kind: 'car', lat: 42.0100, lon: 43.4700, drive: { mins: 150, km: 170 }, transit: true,
        blurb: [
          'Check out and take the E60 west. The road climbs the Likhi range, punches through the Rikoti tunnel, and drops into the lush subtropical lowlands of western Georgia — a genuinely different country on the other side.',
          'Two and a half to three hours. Bypass Kutaisi for now.',
        ],
        photoQuery: 'Rikoti Pass Georgia highway',
        tips: ['Fuel and toilets at the service areas either side of the tunnel.'],
        food: [], foodNote: 'Lunch is after the canyon, in Martvili, at 14:15.',
      },
      {
        id: 'martvili-canyon', time: '13:00', title: 'Martvili Canyon', kicker: 'Emerald water in a limestone slot',
        kind: 'river', lat: 42.4584, lon: 42.3729, drive: { mins: 60, km: 60 }, dwell: '1 h',
        blurb: [
          'Stone walkways run along a narrow limestone gorge of startling green water, with waterfalls dropping in from the moss-covered walls.',
          'There is a short inflatable boat ride through the tightest section — touristy, brief, and worth doing anyway.',
        ],
        photoQuery: 'Martvili Canyon Georgia',
        ticket: { priceGel: 20, note: 'Boat ride is a separate ticket, around 20 GEL.' },
        tips: ['Walkways get slick — grippy shoes.', 'You will get splashed on the boat.'],
        food: [], foodNote: 'Megrelian restaurants sit right outside the canyon gates — that is lunch.',
      },
      {
        id: 'martvili-lunch', time: '14:15', title: 'Lunch in Martvili', kicker: 'Megrelian cooking, the spicy one',
        kind: 'khinkali', lat: 42.4147, lon: 42.3789, drive: { mins: 8, km: 4 }, dwell: '1 h', needsVerify: true,
        blurb: [
          'Samegrelo cooks hotter and cheesier than the rest of Georgia. This is the region for elarji — cornmeal beaten with sulguni until it pulls into cheese threads — and shkmeruli, chicken drowned in garlic and milk.',
        ],
        photoQuery: 'Elarji',
        food: [
          { name: 'Sanapiro', price: '₾₾', kind: 'restaurant', why: 'Family-run by the river and the local favourite. Elarji made properly — stretchy, hot, generous with the cheese.', dish: 'elarji; kupati grilled to order', source: 'https://thegeorgianguide.com/destinations/samegrelo-zugdidi-guide/' },
          { name: "Odo's Marani", price: '₾₾', kind: 'restaurant', why: 'The other Martvili option for traditional Megrelian plates, made with what is in season.', dish: 'elarji; gebzhalia — cheese rolled around mint', source: 'https://thegeorgianguide.com/destinations/samegrelo-zugdidi-guide/' },
        ],
        tips: ['Reckon on 25–40 GEL a head with drinks.'],
      },
      {
        id: 'prometheus-cave', time: '16:00', title: 'Prometheus Cave', kicker: 'Six halls and an underground river',
        kind: 'cave', lat: 42.3764, lon: 42.6019, drive: { mins: 45, km: 45 }, dwell: '1 h',
        blurb: [
          'A 1.4 km walkway through six enormous chambers of stalactites and stalagmites, theatrically lit in colours, with an underground river running through.',
          'Guided tour only, and it leaves on a schedule.',
        ],
        photoQuery: 'Prometheus Cave Kumistavi Georgia',
        ticket: { priceGel: 23, note: 'Guided tours leave on a fixed timetable; optional boat exit costs extra.' },
        tips: ['Constant 14 °C inside — take a layer even on a hot day.', 'Check the last tour time before you set off.'],
        food: [], foodNote: 'Café at the entrance. Dinner is in Kutaisi tonight.',
      },
      {
        id: 'motsameta', time: '17:45', title: 'Motsameta Monastery', kicker: 'On a cliff above a river bend',
        kind: 'church', lat: 42.2861, lon: 42.7592, drive: { mins: 30, km: 28 }, dwell: '30 min',
        blurb: [
          'A tiny monastery on a rock spur inside a horseshoe bend of the Tskhaltsitela river. Short walk through the woods to get there, and almost nobody around.',
          'The most peaceful stop of the day, and the views down the canyon are the reason to make the detour.',
        ],
        photoQuery: 'Motsameta Monastery Georgia',
        tips: ['Narrow access road — take it slowly.'],
        food: [], foodNote: 'Nothing here. Gelati next, then down into Kutaisi.',
      },
      {
        id: 'gelati', time: '18:30', title: 'Gelati Monastery', kicker: "David the Builder's academy, 1106",
        kind: 'church', lat: 42.2950, lon: 42.7678, drive: { mins: 10, km: 6 }, dwell: '45 min',
        blurb: [
          'A monumental medieval complex and UNESCO site, founded in 1106 by King David the Builder and for centuries the intellectual centre of Georgia — it had an academy attached.',
          'Go inside for the wall frescoes: 12th to 18th century, recently restored, floor to ceiling.',
        ],
        photoQuery: 'Gelati Monastery Georgia frescoes',
        tips: ['Closes around sunset — this is why the day is paced hard.'],
        food: [], foodNote: 'Dinner is in the Kutaisi historic centre.',
      },
      {
        id: 'bagrati', time: '19:15', title: 'Bagrati Cathedral', kicker: 'Sunset over Kutaisi',
        kind: 'church', lat: 42.2775, lon: 42.7064, drive: { mins: 15, km: 10 }, dwell: '30 min',
        blurb: ['On Ukimerioni Hill directly above the city centre. Arrive for golden hour and watch the light go across the green dome and the rooftops below.'],
        photoQuery: 'Bagrati Cathedral Kutaisi',
        food: [], foodNote: 'Drive down the hill and eat in the centre.',
      },
      {
        id: 'kutaisi-checkin', time: '19:45', title: 'Kutaisi · check in & dinner', kicker: 'Imeretian whites',
        kind: 'bed', lat: 42.2679, lon: 42.7180,
        blurb: ['Into the historic centre for dinner. Drink the local Imeretian whites — Tsolikouri and Tsitska — rather than defaulting to Kakhetian red.'],
        photoQuery: 'Kutaisi Georgia city centre',
        food: [
          { name: 'Palaty', price: '₾₾', kind: 'restaurant', why: 'Bohemian room in the centre, Georgian cooking with a European hand, often live acoustic music.', dish: 'Imeretian khachapuri; Tsolikouri by the glass', source: 'https://wander-lush.org/best-kutaisi-restaurants/' },
          { name: 'Baraqa', price: '₾₾', kind: 'restaurant', why: 'Straightforwardly authentic Georgian, the one locals send you to.', dish: 'ojakhuri; badrijani nigvzit', source: 'https://wander-lush.org/best-kutaisi-restaurants/' },
          { name: "Toma's Wine Cellar", price: '₾₾', kind: 'wine-bar', why: 'For the qvevri wine more than the food, though the food holds up.', dish: 'Tsitska and Tsolikouri tasting', source: 'https://wander-lush.org/best-kutaisi-restaurants/' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════ DAY 6 ══════════════════════════════ */
  {
    n: 6, date: '2026-10-01', dd: '01', label: '1 Oct', departAt: '09:00',
    from: 'Kutaisi', to: 'Borjomi',
    headline: 'Kutaisi <em>→</em> Borjomi',
    sub: 'The longest day. South to the Turkish border country for a cave monastery cut thirteen storeys into a cliff, a fairy-tale castle on the way back, and a night soak in open-air sulfur pools.',
    checklist: [
      'Check out of Kutaisi',
      'Full tank — the southern gorge has few stations',
      'Pack swimwear and a towel in the car for the sulfur pools tonight',
      'Cash for Vardzia tickets',
    ],
    stops: [
      {
        id: 'white-bridge', time: '08:00', title: 'White Bridge & Colchis Fountain', kicker: 'Kutaisi leftovers',
        kind: 'city', lat: 42.2720, lon: 42.7031, dwell: '45 min',
        blurb: [
          'The Colchis Fountain in the central square — thirty gold Bronze Age animal figures, scaled up from jewellery found in local graves.',
          'Then the White Bridge with its wooden planks and the little "Picasso Boy" statue perched on the rail.',
        ],
        photoQuery: 'Colchis Fountain Kutaisi',
        food: [], foodNote: 'Coffee in the centre before the drive. Lunch is four hours south.',
      },
      {
        id: 'monastery-blitz', time: '08:45', title: 'Bagrati / Gelati blitz', kicker: 'Only if you missed them',
        kind: 'church', lat: 42.2775, lon: 42.7064, drive: { mins: 10, km: 5 }, dwell: '15–45 min',
        blurb: [
          'A fast panoramic look at Bagrati over the morning mist. If Motsameta and Gelati got away from you yesterday, drive the ridge now.',
          'Cap it at 45 minutes. Daylight at Vardzia is worth more than a second look here.',
        ],
        photoAlias: 'bagrati',
        food: [], foodNote: 'No stopping for food — you are heading south at 10:00.',
      },
      {
        id: 'akhaltsikhe-lunch', time: '12:00', title: 'Roadside lunch', kicker: 'Akhaltsikhe or Aspindza',
        kind: 'khinkali', lat: 41.6403, lon: 42.9822, drive: { mins: 180, km: 200 }, dwell: '45 min',
        blurb: [
          'Straight past Borjomi and on south into the gorge. Stop wherever the road offers in Akhaltsikhe or Aspindza and eat fast — you want the afternoon at Vardzia.',
        ],
        photoQuery: 'Akhaltsikhe Georgia town',
        food: [
          { name: 'Old Rabati', price: '₾₾', kind: 'restaurant', why: 'Right by the castle, Georgian dishes with homemade wine, often live music. Convenient rather than remarkable — which is the point today.', dish: 'khachapuri; homemade wine', source: 'https://www.tripadvisor.com/Restaurant_Review-g3316797-d17383911-Reviews-Old_Rabati-Akhaltsikhe_Samtskhe_Javakheti_Region.html' },
          { name: 'Restaurant inside Rabati Castle', price: '₾₾', kind: 'restaurant', why: 'By the castle gate next to the information centre — useful if you decide to see Rabati now rather than on the way back.', dish: 'khachapuri and local plates', source: 'https://www.tripadvisor.com/RestaurantsNear-g3316797-d4049313-Rabati_Castle-Akhaltsikhe_Samtskhe_Javakheti_Region.html' },
        ],
      },
      {
        id: 'khertvisi', time: '13:45', title: 'Khertvisi Fortress', kicker: 'Ten minutes, no ticket',
        kind: 'fortress', lat: 41.4797, lon: 43.2865, drive: { mins: 35, km: 35 }, dwell: '10 min',
        blurb: [
          'One of the oldest fortresses in Georgia, on a rock spur where two rivers meet, right beside the road.',
          'Shoot it from the bridge or the base of the wall and move on — the photo is the point, not the interior.',
        ],
        photoQuery: 'Khertvisi Fortress Georgia',
        food: [], foodNote: 'Nothing here. You have just eaten.',
      },
      {
        id: 'vardzia', time: '14:15', title: 'Vardzia Cave Town', kicker: 'Thirteen storeys into the cliff',
        kind: 'cave', lat: 41.3814, lon: 43.2847, drive: { mins: 25, km: 18 }, dwell: '1 h 30 – 2 h',
        blurb: [
          'A monastery city dug into the face of Erusheti mountain in the 12th century under Queen Tamar — thirteen levels, hundreds of chambers, churches, wine cellars, and tunnels connecting it all.',
          'An earthquake in 1283 sheared the outer wall away, which is why you can now see the whole warren in cross-section.',
        ],
        photoQuery: 'Vardzia cave monastery Georgia',
        ticket: { priceGel: 15, note: '2 GEL shuttle bus up the first incline — take it and save your legs for inside.' },
        tips: ['Low tunnels and steep steps. Not one for anyone uneasy in tight spaces.', 'Almost no shade on the cliff face.'],
        food: [], foodNote: 'A café by the ticket office. Dinner is late tonight, back in Borjomi at 21:30.',
      },
      {
        id: 'rabati-castle', time: '17:15', title: 'Rabati Castle', kicker: 'A mosque, a church and a synagogue in one wall',
        kind: 'fortress', lat: 41.6403, lon: 42.9822, drive: { mins: 60, km: 60 }, dwell: '1 h 15',
        blurb: [
          'Heavily and controversially restored in 2012, so it looks almost too perfect — but the multi-faith complex is genuine: an Ottoman mosque, an Orthodox church and a synagogue inside one set of walls.',
          'Lower towers and gardens are free to wander. The upper citadel, mosque and museum need a ticket. Gorgeous at golden hour.',
        ],
        photoQuery: 'Rabati Castle Akhaltsikhe',
        ticket: { priceGel: 15, note: 'Lower courtyards free; upper citadel ticketed.' },
        food: [], foodNote: 'Hold out — you eat in Borjomi after the pools.',
      },
      {
        id: 'borjomi-checkin', time: '19:30', title: 'Borjomi · check in', kicker: 'Into the pine valleys',
        kind: 'bed', lat: 41.8383, lon: 43.3831, drive: { mins: 45, km: 50 },
        blurb: ['The last 45 minutes north back into the forested Borjomi valley. Drop the bags and walk straight into Central Park — you are not finished today.'],
        photoQuery: 'Borjomi Georgia town',
        food: [], foodNote: 'Dinner at 21:30, after the pools.',
      },
      {
        id: 'borjomi-sulfur-pools', time: '20:00', title: 'Open-air sulfur pools', kicker: 'Three km through the woods, in the dark',
        kind: 'spa', lat: 41.8317, lon: 43.3706, dwell: '1 h', needsVerify: true,
        blurb: [
          'Walk to the very back of Central Park — a flat, wooded 3 km path along the river — to reach the open-air sulfur pools.',
          'Naturally warm mineral water, outdoors, under pines, at night. After Vardzia your legs will have earned it.',
        ],
        photoNote: 'No free photo of the pools — they are 3 km behind the park',
        tips: ['3 km each way in the dark — take a torch or phone light.', 'Swimwear and a towel; changing facilities are basic.'],
        food: [], foodNote: 'Nothing at the pools. Dinner is back in town.',
      },
      {
        id: 'borjomi-dinner', time: '21:30', title: 'Late dinner in Borjomi', kicker: 'And the warm bubbly water',
        kind: 'khinkali', lat: 41.8400, lon: 43.3800,
        blurb: ['Walk back into town and eat late. Do not leave without tasting the original mineral water straight from the dome spring inside the park — warm, salty, fizzy, and nothing like the bottled version.'],
        photoAlias: 'borjomi-lunch',
        food: [
          { name: 'Cafe Iggy', price: '₾₾', kind: 'cafe', why: 'Opened 2022 in a heritage building on Kostava Square — the one genuinely good modern room in Borjomi.', dish: 'seasonal plates; proper coffee', source: 'https://wander-lush.org/things-to-do-in-borjomi-georgia/' },
          { name: 'Bergi Terrace', price: '₾₾', kind: 'restaurant', why: 'Reliable terrace dining a short walk from the park entrance.', dish: 'Georgian mountain dishes', source: 'https://www.tripadvisor.com/RestaurantsNear-g3150219-d7050493-Borjomi_Central_Park-Borjomi_Samtskhe_Javakheti_Region.html' },
        ],
        tips: ['Check kitchen closing times — 21:30 is late for a small town.'],
      },
    ],
  },

  /* ══════════════════════════════════ DAY 7 ══════════════════════════════ */
  {
    n: 7, date: '2026-10-02', dd: '02', label: '2 Oct', departAt: '08:00',
    from: 'Borjomi', to: 'Tbilisi',
    headline: 'Borjomi <em>→</em> Tbilisi',
    sub: 'A green monastery in a river gorge, the spring and the cable car, then the drive east and the car goes back.',
    checklist: [
      'Check out of Borjomi',
      'Empty bottle in the bag to fill at the mineral spring',
      'Refuel to the level the rental contract requires — before you reach the drop-off',
      'Rental return by 16:00',
    ],
    stops: [
      {
        id: 'green-monastery', time: '08:30', title: 'Mtsvane (Green) Monastery', kicker: 'Swallowed by the forest',
        kind: 'church', lat: 41.8108, lon: 43.3098, drive: { mins: 15, km: 10 }, dwell: '45 min',
        blurb: [
          'Ten minutes out of town into a deep forested river gorge, then a short path lined with mossy stones to Chitakhevi St George — a small 9th-century stone church that looks like the woods are reclaiming it.',
          'Go early. The point of this stop is the quiet.',
        ],
        photos: [{ commons: 'Green Monastery of Chitakhevi.jpg' }],
        tips: ['Rough track for the last stretch — fine in the dry.'],
        food: [], foodNote: 'Back in town for coffee afterwards.',
      },
      {
        id: 'borjomi-spring', time: '09:45', title: 'Borjomi Mineral Spring', kicker: 'The blue pavilion in the park',
        kind: 'spa', lat: 41.8383, lon: 43.3831, drive: { mins: 15, km: 10 }, dwell: '45 min',
        blurb: [
          'Into Central Park to the ornate blue pavilion dome, where the water comes up warm, salty and carbonated straight from the ground.',
          'It tastes nothing like the bottle. Bring an empty one and fill it.',
        ],
        photoAlias: 'borjomi-checkin',
        ticket: { priceGel: 3, note: 'Small entry fee for Central Park.' },
        food: [], foodNote: 'Early lunch at 12:00 by the park gates.',
      },
      {
        id: 'borjomi-cable-car', time: '10:30', title: 'Borjomi Cable Car', kicker: 'One glass cabin up a cliff',
        kind: 'cablecar', lat: 41.8397, lon: 43.3819, dwell: '1 h 15',
        blurb: [
          'A single retro glass-walled cabin lifts you straight up the cliffside to a plateau above the town. Pine woods, mountain views, a ferris wheel, and a coffee at the top before riding back down.',
        ],
        photoAlias: 'borjomi-checkin',
        food: [], foodNote: 'Coffee at the top; proper lunch back down at the park gates.',
      },
      {
        id: 'borjomi-lunch', time: '12:00', title: 'Early lunch', kicker: 'Fuel for the highway',
        kind: 'khinkali', lat: 41.8400, lon: 43.3800, dwell: '45 min',
        blurb: ['Eat just outside the park gates before the drive east. Two and a half hours to Tbilisi from here.'],
        photoQuery: 'Borjomi cafe Georgia',
        food: [
          { name: 'Inka Café', price: '₾', kind: 'cafe', why: 'Right at the park entrance, good coffee and a broad menu — the convenient one.', dish: 'coffee and cake, or a full plate', source: 'https://www.tripadvisor.com/RestaurantsNear-g3150219-d7050493-Borjomi_Central_Park-Borjomi_Samtskhe_Javakheti_Region.html' },
          { name: 'Cafe 1+2', price: '₾', kind: 'cafe', why: 'Also by the park entrance, straightforward and quick.', dish: 'Georgian standards', source: 'https://www.tripadvisor.com/Restaurant_Review-g3150219-d8698211-Reviews-Borjomi_Cafe_1_2-Borjomi_Samtskhe_Javakheti_Region.html' },
        ],
      },
      {
        id: 'drive-back-tbilisi', time: '13:00', title: 'Drive east to Tbilisi', kicker: 'Past Khashuri, through the lowlands',
        kind: 'car', lat: 41.8500, lon: 44.2000, drive: { mins: 150, km: 160 }, transit: true,
        blurb: ['Back on the main road east — Khashuri, the central lowlands, and into the capital. Roughly two and a half hours of driving.'],
        photoQuery: 'Georgia highway landscape',
        food: [], foodNote: 'Service stations on the E60 if you need a stop.',
      },
      {
        id: 'refuel', time: '15:30', title: 'Refuel', kicker: 'Before the drop-off, not after',
        kind: 'car', lat: 41.7100, lon: 44.8300, dwell: '15 min', transit: true,
        blurb: ['On the Tbilisi outskirts, stop at a proper chain — Wissol, Gulf or SOCAR — and fill to whatever level the rental contract demands. Keep the receipt.'],
        photoNote: 'No photo needed — practical stop',
        food: [], foodNote: 'Not a food stop.',
      },
      {
        id: 'return-rental', time: '16:00', title: 'Return the rental car', kicker: 'Inspection and done',
        kind: 'car', lat: 41.6692, lon: 44.9547,
        blurb: ['Drive to the drop-off — downtown or the airport, per your booking — and walk the inspection with them. Photograph the car again at handover.'],
        photoNote: 'No photo needed — practical stop',
        tips: ['You are back on foot and Bolt from here. Tomorrow is a guided tour with a driver.'],
        food: [], foodNote: 'Free choice tonight — you are back in Tbilisi with everything open.',
      },
    ],
  },

  /* ══════════════════════════════════ DAY 8 ══════════════════════════════ */
  {
    n: 8, date: '2026-10-03', dd: '03', label: '3 Oct', departAt: '08:30',
    from: 'Tbilisi', to: 'Kakheti',
    headline: 'Kakheti <em>wine day</em>',
    sub: 'Guided, with a driver — which means you can both drink. Sighnaghi on its hilltop, the monastery below it, and two or three wineries with lunch.',
    checklist: [
      'Guided tour — no driving, so tasting is fine',
      'Cash for wine you will inevitably buy',
      'Bubble wrap or socks if you plan to fly bottles home',
    ],
    stops: [
      {
        id: 'depart-kakheti', time: '08:30', title: 'Depart Tbilisi', kicker: 'East into wine country',
        kind: 'car', lat: 41.6938, lon: 44.8015,
        blurb: ['Pickup from the hotel. Kakheti is where roughly three quarters of Georgian wine comes from, and where qvevri — clay amphorae buried in the ground — have been used continuously for 8,000 years.'],
        photoQuery: 'Kakheti vineyards Georgia',
        food: [], foodNote: 'Breakfast at the hotel. Lunch comes with a winery.',
      },
      {
        id: 'bodbe', time: '10:30', title: 'Bodbe Monastery', kicker: 'St Nino, and the cypress avenue',
        kind: 'church', lat: 41.6083, lon: 45.9294, drive: { mins: 105, km: 110 }, dwell: '1 h',
        blurb: [
          'A 9th-century monastery holding the grave of St Nino, the woman who converted Georgia to Christianity in the 4th century. One of the most significant religious sites in the country.',
          'The approach down the cypress avenue, with the Alazani valley and the Greater Caucasus laid out behind, is the thing people remember.',
        ],
        photoQuery: 'Bodbe Monastery Sighnaghi Georgia',
        tips: ['Working convent — modest dress, and skirts are lent at the gate.'],
        food: [], foodNote: 'Sighnaghi is ten minutes up the hill.',
      },
      {
        id: 'sighnaghi', time: '11:45', title: 'Sighnaghi', kicker: 'The city of love, inside 23 towers',
        kind: 'city', lat: 41.6197, lon: 45.9219, drive: { mins: 12, km: 3 }, dwell: '2 h',
        blurb: [
          'A small walled Silk Road town on a hilltop, wrapped in 4 km of 18th-century defensive wall with 23 towers still standing. Cobbled streets, pastel houses, balconies, and the Alazani valley dropping away below.',
          'You can walk a stretch of the wall itself for the full view across to the mountains.',
        ],
        photoQuery: 'Sighnaghi Georgia town walls',
        food: [
          { name: "Pheasant's Tears", price: '₾₾₾', kind: 'winery', why: '18 Baratashvili St. Qvevri natural wines and a kitchen cooking local, seasonal and organic around them. The reason people come to Sighnaghi.', dish: 'the tasting flight with whatever the kitchen is doing', source: 'https://www.raisin.digital/en/explore/georgia/kakheti/venues/pheasants-tears-2323/' },
          { name: "Okro's Wine", price: '₾₾', kind: 'wine-bar', why: 'Small natural-wine producer with a terrace and a valley view.', dish: 'amber wine by the glass', source: 'https://www.tripadvisor.com/Restaurants-g1596951-Signagi_Kakheti_Region.html' },
          { name: 'Kusika', price: '₾₾', kind: 'restaurant', why: 'Well-rated Georgian cooking in town if you want a straightforward lunch rather than a tasting.', dish: 'Kakhetian mtsvadi', source: 'https://www.tripadvisor.com/Restaurants-g1596951-Signagi_Kakheti_Region.html' },
        ],
      },
      {
        id: 'wineries', time: '14:30', title: 'Wineries & tastings', kicker: 'Two or three, plus lunch',
        kind: 'wine', lat: 41.8900, lon: 45.7000, drive: { mins: 45, km: 45 }, dwell: '3 h', needsVerify: true,
        blurb: [
          'Whatever your tour includes — typically a large producer and a small family marani. Ask specifically to see a qvevri: the clay vessel buried to its neck in the cellar floor, which is what makes Georgian wine taste the way it does.',
          'Drink the amber wines. White grapes fermented on skins in qvevri is the thing Georgia does that nowhere else does the same way.',
        ],
        photoQuery: 'Qvevri',
        tips: ['Tsinandali estate, Khareba tunnel and Shumi are the usual stops; confirm with your operator.', 'Buy at the cellar door — it is cheaper than Tbilisi and often not exported at all.'],
        food: [], foodNote: 'Lunch is normally included at one of the wineries — check when booking.',
      },
      {
        id: 'return-tbilisi-kakheti', time: '19:00', title: 'Back in Tbilisi', kicker: 'Last night',
        kind: 'bed', lat: 41.6938, lon: 44.8015, drive: { mins: 120, km: 120 },
        blurb: ['Dropped back at the hotel. Pack tonight — tomorrow is an early, unhurried departure if you do it now and a scramble if you do not.'],
        photoQuery: 'Tbilisi night old town',
        food: [], foodNote: 'You will have eaten and drunk plenty. Something light in the old town if anything.',
      },
    ],
  },

  /* ══════════════════════════════════ DAY 9 ══════════════════════════════ */
  {
    n: 9, date: '2026-10-04', dd: '04', label: '4 Oct',
    from: 'Tbilisi', to: 'Dubai',
    headline: 'Tbilisi <em>→</em> Dubai',
    sub: 'Breakfast, Bolt, and home.',
    checklist: [
      'Bolt to the airport — 20–30 min, longer in morning traffic',
      'Arrive three hours early',
      'Wine in checked baggage, wrapped',
      'Leftover lari spent or changed at the airport',
    ],
    stops: [
      {
        id: 'breakfast-checkout', time: '—', title: 'Breakfast & check out', kicker: 'Last khachapuri',
        kind: 'bed', lat: 41.6938, lon: 44.8015,
        blurb: ['Breakfast at the hotel, final pack, check out. Leave time for the traffic — the airport road backs up in the morning.'],
        photoQuery: 'Tonis puri Georgian bread',
        food: [], foodNote: 'Hotel breakfast. There is food airside too, but it is airport food.',
      },
      {
        id: 'tbs-departure', time: '—', title: 'Tbilisi Airport', kicker: 'Three hours before wheels up',
        kind: 'plane', lat: 41.6692, lon: 44.9547, drive: { mins: 25, km: 18 },
        blurb: ['Bolt out to TBS and arrive three hours early as planned.'],
        photoQuery: 'Tbilisi International Airport terminal',
        tips: ['Duty free carries Georgian wine if you did not buy enough in Kakheti.'],
        food: [], foodNote: 'Airside cafés only.',
      },
    ],
  },
];

/** Every stop, flat, in trip order. */
export const ALL_STOPS = DAYS.flatMap(d => d.stops.map(s => ({ ...s, day: d.n })));
