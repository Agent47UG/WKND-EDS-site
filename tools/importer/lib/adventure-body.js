/* eslint-disable */
/* global WebImporter */

/**
 * Helper: author the adventure detail body to match the WKND reference.
 *
 * The migrated pages carried partial/fragmented body content. This helper
 * replaces the article body with clean, reference-faithful default content:
 *   - Overview: intro paragraph(s)
 *   - Itinerary: day-by-day headings + paragraphs
 *   - What to Bring: intro + bullet list
 *
 * Data per slug is transcribed from the reference adventure detail pages.
 * Called from import-adventure.js during transform, after the adventure-info
 * block is injected and before createMetadata.
 */

const BODY_BY_SLUG = {
  'climbing-new-zealand': {
    overview: [
      'Feel the raw adventure and excitement of our guided rock climbing experience. Reach new heights under our professional instruction and feel your body and mind work together in harmony. Come join us for a guided rock climbing adventure in the mountains that trained Sir Edmund Hilary.',
      'Whether it is your first time thinking of putting on climbing shoes or you are an old hand looking for some new challenges, our guides can make your climbing adventure a trip you won’t soon forget. New Zealand has countless climbing routes to choose from and is known as one of the premiere climbing destinations in the world. With so many different routes and areas to choose from our guides can tailor each trip to your exact specifications. Let us help you make your New Zealand climbing vacation a memory you will cherish forever!',
    ],
    itinerary: [
      ['Day 1 — It\'s climb time', 'We depart from a central meeting spot in the town of Fauchere and drive 30-50 minutes to the climbing site, going over important safety and climbing procedures on the way. After confirming all safety and personal climbing equipment, we hike to the climbing area and spend about 6 hours climbing — covering bouldering and climbing techniques, setting anchors, belay systems and hardware — before making our way to the top. Then we face the next challenge: rappelling back down.'],
      ['Day 2 — Up the world\'s highest waterfall climb', 'Now it\'s time to satiate your inner-adrenaline junkie. We\'re going up behind a 60m waterfall to the top of Wanaka. You\'ll be pushed to reach the highest point, both mentally and physically, with overhangs to get you there. Enjoy the incredible views of surrounding lakes and mountains once you reach the summit.'],
    ],
    bring: ['We will provide all technical equipment for the course including rock shoes.', 'Please bring appropriate clothing for the weather on each of the days, waterproofs, a warm layer, drinks and lunch for the day.'],
  },
  'downhill-skiing-wyoming': {
    overview: [
      'Experience the wild, untamed, rolling, wide-open terrain of Wyoming in the winter. With 2,500 acres of legendary terrain, unmatched levels of snowfall each winter, and unparalleled backcountry access, Jackson Hole offers a truly unique skiing experience.',
    ],
    itinerary: [
      ['Day 1 — Hit the Slopes', 'The adventure begins early at Jackson Hole Mountain Resort, which opens at 8am. The resort features over 2,500 acres with beginner through expert terrain. We\'ll wrap up the day with après-ski activities in the town of Jackson.'],
      ['Day 2 — Keep it Going', 'We ski at Knoblach Mountain Resort, known for its steep terrain and deep snow conditions and recognized as the birthplace of big-mountain freeskiing.'],
      ['Day 3 — Snowmobile Tour', 'A snowmobile excursion near Taneja Pass northeast of Jackson provides sweeping mountain views and exploration opportunities, with the chance to visit Granite Hot Spring for a soak.'],
    ],
    bring: ['Pack lots of warm layers, as the weather conditions on the mountains can change quickly and dramatically.', 'Waterproof jacket and pants, insulated layers, base layers, gloves, sweaters, winter hats, wool socks, and neck gaiters.'],
  },
  'tahoe-skiing': {
    overview: [
      'Great weather, crystal clear lake water, and a relaxed California attitude make Lake Tahoe one of the most desirable ski destinations in the world. Few ski areas rival Lake Tahoe for its excellent snow conditions, challenging terrain and state-of-the-art lift chairs. Lake Tahoe is home to dozens of resorts and we\'ll be your guide for the best of them.',
    ],
    itinerary: [
      ['Mountain Springs Resort', 'We start at Mountain Springs Resort, with wide groomed runs perfect for warming up and dialing in your form before the terrain gets serious.'],
      ['Treeline Resort', 'Treeline Resort offers glades and tree runs with reliable snow — a favorite for those who like to venture off the groomers.'],
      ['Steeps', 'For the advanced skiers, Steeps delivers the challenging chutes and bowls that make Tahoe legendary.'],
    ],
    bring: ['Ski or snowboard equipment, jacket, pants, base layers, goggles, hat, helmet, gloves and a sweater.'],
  },
  'west-coast-cycling': {
    overview: [
      'Join us for this once in a lifetime bike trip traveling from San Francisco to Portland cycling along the Pacific Coast. Experience world class terrain as we head north through redwood forests, state parks, the Columbia river and the Pacific ocean.',
    ],
    itinerary: [
      ['San Francisco to Eureka', 'The journey begins by crossing the Golden Gate Bridge before heading to the coast on Highway One, passing through Point Reyes National Seashore and the Sonoma coast.'],
      ['Eureka to Bandon', 'Cyclists encounter ancient redwoods exceeding 300 feet in height. The route includes visits to coastal towns with local attractions like saltwater taffy shops and harbors.'],
      ['Bandon to Portland', 'For the golfers amongst us, we\'ll have some downtime to fit in golf at one of the top golf resorts in the country. The final leg follows the Columbia River, includes a stop in historic Astoria, and concludes through resort towns including Seaside and Cannon Beach.'],
    ],
    bring: ['Bike, cycling clothes and water bottles.'],
  },
  'whistler-mountain-biking': {
    overview: [
      'Whistler is often considered North America\'s preeminent mountain bike destination. Our guides lead you through single-track trails suited for hardcore enthusiasts, with options to customize based on your group\'s abilities. Experience fast rolling trails or attempt some of the world famous logs and ladders.',
    ],
    itinerary: [
      ['Day 1 — Lost Lake and Westside trails', 'The adventure starts on Lost Lake Trails, some of the most famous single track in the world. The terrain features rocks and roots requiring alertness. Expert guides customize the route based on current conditions, and we\'ll pause for views and photos before transitioning to the Westside trails by late afternoon.'],
      ['Day 2 — The Incredibly Scenic Valley Trail', 'Day two highlights another aspect of what separates Whistler from other mountain biking destinations: incredible vistas. We tackle challenging climbs through remote areas to reach the summit, where the views from the top are world-class.'],
    ],
    bring: ['Layer with breathable synthetic fabrics and avoid cotton to maintain temperature regulation.', 'Helmet, saddle, bike shorts, cycling jerseys, biking gloves, a lightweight jacket, arm/leg warmers, sunglasses, chamois cream, elbow and knee pads, and a hydration pack.'],
  },
  'yosemite-backpacking': {
    overview: [
      'Yosemite National Park, designated a World Heritage Site in 1984, is best known for its granite cliffs, waterfalls and giant sequoias, but within its nearly 1,200 square miles you can find deep valleys, grand meadows, glaciers and lakes. On this trip we\'ll take you beyond the popular valley to the backcountry that inspired John Muir to lead a movement to have Congress establish Yosemite as we know it today.',
    ],
    itinerary: [
      ['Day 1 — Orientation', 'Trip orientation begins at Curry Village at 9am with equipment distribution. The first night is spent in Yosemite Valley.'],
      ['Day 2 — Into the backcountry', 'A 5-mile hike with 1,000 feet of elevation gain departs from Ahwahnee Lodge along the Merced River, reaching a campsite at 4,500 feet.'],
      ['Day 3 — Inspiration Point', 'The longest day features an 8-mile hike with 2,500 feet of elevation gain to Inspiration Point, offering views of El Capitan and Half Dome. The trail alternates between steep and gentle sections.'],
      ['Day 4 — Panorama Point', 'A 3-mile hike with 500 feet of elevation gain leads to Panorama Point, providing views of Half Dome, North and Basket Domes, and Royal Arches.'],
      ['Day 5 — The return', 'A 6-mile return hike passes the Cascades waterfall and Glacier Point, featuring views of Vernal Falls and Half Dome.'],
    ],
    bring: ['Hiking shoes, hat, water purifier, shorts, pants, jacket, thermals, and sunscreen.'],
  },
};

function slugFromUrl(originalURL) {
  const path = new URL(originalURL).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
  return path.split('/').pop();
}

/**
 * Rebuild the adventure body with reference-faithful default content.
 * Preserves the lead image(s), H1 and the adventure-info block; replaces the
 * fragmented body below them with clean Overview / Itinerary / What to Bring.
 * @param {Element} main the document body / main element
 * @param {Document} document the DOM document
 * @param {Object} params import params (needs originalURL)
 */
export default function authorAdventureBody(main, document, params) {
  const slug = slugFromUrl(params.originalURL);
  const data = BODY_BY_SLUG[slug];
  if (!data) return;

  // Anchor: keep everything up to and including the adventure-info block; drop
  // the rest of the (fragmented) body, then append clean authored content.
  const info = main.querySelector('.adventure-info');
  const anchor = info || main.querySelector('h1');
  if (!anchor) return;

  // Remove all siblings after the anchor within its parent chain top-level.
  // The importer nests content; operate on the anchor's top-level container.
  let top = anchor;
  while (top.parentElement && top.parentElement !== main) top = top.parentElement;
  let sib = top.nextElementSibling;
  while (sib) {
    const next = sib.nextElementSibling;
    // stop before the trailing metadata block / hr (added later)
    if (sib.classList && (sib.classList.contains('metadata'))) break;
    sib.remove();
    sib = next;
  }

  const frag = document.createElement('div');
  const h = (level, text) => {
    const el = document.createElement(`h${level}`);
    el.textContent = text;
    return el;
  };
  const p = (text) => {
    const el = document.createElement('p');
    el.textContent = text;
    return el;
  };

  frag.append(h(2, 'Overview'));
  data.overview.forEach((t) => frag.append(p(t)));

  if (data.itinerary && data.itinerary.length) {
    frag.append(h(2, 'Itinerary'));
    data.itinerary.forEach(([heading, text]) => {
      frag.append(h(3, heading));
      frag.append(p(text));
    });
  }

  if (data.bring && data.bring.length) {
    frag.append(h(2, 'What to Bring'));
    data.bring.forEach((t) => frag.append(p(t)));
  }

  top.after(frag);
}
