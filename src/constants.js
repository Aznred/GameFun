// ============================================================
//  CONSTANTS.JS — All static game data
//  Board: 40 tiles, 10 per side (classic layout, MEGAOPOLY skin)
// ============================================================

// Position helper: tile index → {x, z} on the 3D board
// Corners at (10,10), (-10,10), (-10,-10), (10,-10)
export function tilePos(i) {
  if (i < 10)  return { x: 10 - i * 2,        z: 10 };          // bottom  R→L
  if (i < 20)  return { x: -10,               z: 10 - (i-10)*2 }; // left   B→T
  if (i < 30)  return { x: -10 + (i-20)*2,   z: -10 };           // top    L→R
               return { x: 10,               z: -10 + (i-30)*2 };  // right  T→B
}

// ── Tile types ──────────────────────────────────────────────
export const T = {
  PROP:       'property',
  GO:         'go',
  JAIL:       'jail',
  FREE:       'free_parking',
  GOTOJAIL:   'go_to_jail',
  TAX:        'tax',
  METRO:      'metro',
  LOTTERY:    'lottery',
  STOCK:      'stock',
  POLICE:     'police',
  CARD_CHAOS: 'card_chaos',
  CARD_BUSI:  'card_busi',
  CARD_CRIME: 'card_crime',
  CARD_GOV:   'card_gov',
  EVENT:      'event',
};

// ── Districts ────────────────────────────────────────────────
export const DISTRICTS = {
  residential: { name: 'Residential',  color: '#a855f7', hex: 0xa855f7 },
  industrial:  { name: 'Industrial',   color: '#6b7280', hex: 0x6b7280 },
  tech:        { name: 'Tech',         color: '#06b6d4', hex: 0x06b6d4 },
  luxury:      { name: 'Luxury',       color: '#f59e0b', hex: 0xf59e0b },
  casino:      { name: 'Casino',       color: '#ef4444', hex: 0xef4444 },
  nature:      { name: 'Nature',       color: '#22c55e', hex: 0x22c55e },
  underground: { name: 'Underground',  color: '#374151', hex: 0x374151 },
  commercial:  { name: 'Commercial',   color: '#3b82f6', hex: 0x3b82f6 },
};

// ── 40 Tiles ─────────────────────────────────────────────────
// id, type, name, district?, price?, rent[], color, hex
// rent[] = [base, house, hotel, skyscraper]
export const TILES = [
  // ─── BOTTOM ROW (right → left) ───
  { id:0,  type:T.GO,        name:'GO!',          color:'#22c55e', hex:0x22c55e },
  { id:1,  type:T.PROP,      name:'Oak Street',   district:'residential', price:120000, rent:[8000,25000,60000,120000],  color:'#a855f7', hex:0xa855f7 },
  { id:2,  type:T.CARD_CHAOS,name:'CHAOS',        color:'#ec4899', hex:0xec4899 },
  { id:3,  type:T.PROP,      name:'Maple Ave',    district:'residential', price:150000, rent:[10000,30000,75000,150000], color:'#a855f7', hex:0xa855f7 },
  { id:4,  type:T.TAX,       name:'Income Tax',   taxAmount:150000, color:'#dc2626', hex:0xdc2626 },
  { id:5,  type:T.METRO,     name:'Metro A',      price:200000, rent:40000,           color:'#0ea5e9', hex:0x0ea5e9 },
  { id:6,  type:T.PROP,      name:'Steel Mill',   district:'industrial',  price:180000, rent:[12000,35000,80000,160000], color:'#6b7280', hex:0x6b7280 },
  { id:7,  type:T.CARD_BUSI, name:'BUSINESS',     color:'#0891b2', hex:0x0891b2 },
  { id:8,  type:T.PROP,      name:'Power Plant',  district:'industrial',  price:200000, rent:[14000,40000,90000,175000], color:'#6b7280', hex:0x6b7280 },
  { id:9,  type:T.PROP,      name:'Port Docks',   district:'industrial',  price:220000, rent:[16000,45000,100000,190000],color:'#6b7280', hex:0x6b7280 },

  // ─── LEFT COLUMN (bottom → top) ───
  { id:10, type:T.JAIL,      name:'Jail',         color:'#78716c', hex:0x78716c },
  { id:11, type:T.PROP,      name:'Silicon Alley',district:'tech',         price:280000, rent:[22000,60000,130000,250000],color:'#06b6d4', hex:0x06b6d4 },
  { id:12, type:T.EVENT,     name:'CITY EVENT',   color:'#7c3aed', hex:0x7c3aed },
  { id:13, type:T.PROP,      name:'Code Campus',  district:'tech',         price:320000, rent:[26000,70000,150000,280000],color:'#06b6d4', hex:0x06b6d4 },
  { id:14, type:T.PROP,      name:'Quantum Labs', district:'tech',         price:360000, rent:[30000,80000,170000,310000],color:'#06b6d4', hex:0x06b6d4 },
  { id:15, type:T.METRO,     name:'Metro B',      price:200000, rent:40000,              color:'#0ea5e9', hex:0x0ea5e9 },
  { id:16, type:T.PROP,      name:'Penthouse Row',district:'luxury',       price:500000, rent:[50000,120000,250000,450000],color:'#f59e0b', hex:0xf59e0b },
  { id:17, type:T.CARD_CRIME,name:'CRIME',        color:'#7f1d1d', hex:0x7f1d1d },
  { id:18, type:T.PROP,      name:'Diamond Tower',district:'luxury',       price:550000, rent:[55000,130000,270000,480000],color:'#f59e0b', hex:0xf59e0b },
  { id:19, type:T.PROP,      name:'Gold Coast',   district:'luxury',       price:600000, rent:[60000,140000,290000,500000],color:'#f59e0b', hex:0xf59e0b },

  // ─── TOP ROW (left → right) ───
  { id:20, type:T.FREE,      name:'FREE PARKING', color:'#16a34a', hex:0x16a34a },
  { id:21, type:T.PROP,      name:'Neon Palace',  district:'casino',       price:400000, rent:[40000,100000,210000,380000],color:'#ef4444', hex:0xef4444 },
  { id:22, type:T.CARD_CHAOS,name:'CHAOS',        color:'#ec4899', hex:0xec4899 },
  { id:23, type:T.PROP,      name:'Lucky Dragon', district:'casino',       price:440000, rent:[44000,110000,230000,400000],color:'#ef4444', hex:0xef4444 },
  { id:24, type:T.PROP,      name:'High Roller',  district:'casino',       price:480000, rent:[48000,120000,250000,440000],color:'#ef4444', hex:0xef4444 },
  { id:25, type:T.METRO,     name:'Metro C',      price:200000, rent:40000,              color:'#0ea5e9', hex:0x0ea5e9 },
  { id:26, type:T.PROP,      name:'Green Park',   district:'nature',       price:300000, rent:[28000,72000,155000,290000], color:'#22c55e', hex:0x22c55e },
  { id:27, type:T.CARD_GOV,  name:'GOVERNMENT',   color:'#854d0e', hex:0x854d0e },
  { id:28, type:T.PROP,      name:'Forest Hills', district:'nature',       price:330000, rent:[32000,80000,170000,310000], color:'#22c55e', hex:0x22c55e },
  { id:29, type:T.PROP,      name:'Eco Village',  district:'nature',       price:360000, rent:[36000,88000,185000,330000], color:'#22c55e', hex:0x22c55e },

  // ─── RIGHT COLUMN (top → bottom) ───
  { id:30, type:T.GOTOJAIL,  name:'GO TO JAIL!',  color:'#dc2626', hex:0xdc2626 },
  { id:31, type:T.PROP,      name:'Dark Alley',   district:'underground',  price:250000, rent:[20000,52000,115000,220000], color:'#374151', hex:0x374151 },
  { id:32, type:T.POLICE,    name:'POLICE RAID',  color:'#1d4ed8', hex:0x1d4ed8 },
  { id:33, type:T.PROP,      name:'Shadow Plaza', district:'underground',  price:280000, rent:[24000,60000,130000,250000], color:'#374151', hex:0x374151 },
  { id:34, type:T.STOCK,     name:'STOCK XCHG',   color:'#0369a1', hex:0x0369a1 },
  { id:35, type:T.METRO,     name:'Metro D',      price:200000, rent:40000,              color:'#0ea5e9', hex:0x0ea5e9 },
  { id:36, type:T.PROP,      name:'Market Street',district:'commercial',   price:340000, rent:[34000,85000,180000,320000], color:'#3b82f6', hex:0x3b82f6 },
  { id:37, type:T.CARD_BUSI, name:'BUSINESS',     color:'#0891b2', hex:0x0891b2 },
  { id:38, type:T.PROP,      name:'Trade Center', district:'commercial',   price:380000, rent:[38000,95000,200000,360000], color:'#3b82f6', hex:0x3b82f6 },
  { id:39, type:T.LOTTERY,   name:'LOTTERY',      color:'#16a34a', hex:0x16a34a },
];

export const PROP_TILES = TILES.filter(t => t.type === T.PROP);
export const METRO_TILES = TILES.filter(t => t.type === T.METRO);
export const getTile = id => TILES[id];

// ── Characters (6 playable, 2 bonus) ─────────────────────────
export const CHARACTERS = [
  { id:'duck',      name:'Billionaire Duck', emoji:'🦆', color:'#fbbf24', hex:0xfbbf24,
    passive:'+10% GO salary',
    abilityName:'Lucky Duck', ability:'LUCKY',
    abilityDesc:'Reroll once — keep the better result.' },

  { id:'mafia',     name:'Mafia Boss',       emoji:'🤌', color:'#374151', hex:0x374151,
    passive:'Collect rent even from jail',
    abilityName:'Extortion', ability:'EXTORT',
    abilityDesc:'Force any player to pay you 20% of their cash.' },

  { id:'crypto',    name:'Crypto Bro',       emoji:'₿',  color:'#f59e0b', hex:0xf59e0b,
    passive:'+30% rent on Tech properties',
    abilityName:'HODL', ability:'HODL',
    abilityDesc:'Double all Tech income for 3 turns.' },

  { id:'shark',     name:'Real Estate Shark',emoji:'🦈', color:'#0891b2', hex:0x0891b2,
    passive:'Can build one extra level per turn',
    abilityName:'Hostile Takeover', ability:'TAKEOVER',
    abilityDesc:'Buy any un-built property from a player at 60% price.' },

  { id:'influencer',name:'Influencer',       emoji:'📸', color:'#ec4899', hex:0xec4899,
    passive:'20% discount on Casino & Luxury',
    abilityName:'Viral Moment', ability:'VIRAL',
    abilityDesc:'Each player pays you $50K per property they own.' },

  { id:'nerd',      name:'Startup Nerd',     emoji:'🤓', color:'#7c3aed', hex:0x7c3aed,
    passive:'Skyscrapers earn 2× income',
    abilityName:'Seed Round', ability:'SEED',
    abilityDesc:'Build a free Skyscraper on any property you own.' },

  { id:'landlord',  name:'Evil Landlord',    emoji:'😈', color:'#dc2626', hex:0xdc2626,
    passive:'+15% rent on all properties',
    abilityName:'Rent Hike', ability:'RENTUP',
    abilityDesc:'Triple rent on ALL your properties for 2 full rounds.' },

  { id:'banker',    name:'Shady Banker',     emoji:'🕴️', color:'#1f2937', hex:0x1f2937,
    passive:'Mortgage properties for 70% value',
    abilityName:'Insider Trading', ability:'INSIDER',
    abilityDesc:'Steal 15% of any one player\'s current cash.' },
];

// ── Buildings ─────────────────────────────────────────────────
export const BUILDINGS = [
  { id:'house',       emoji:'🏠', name:'House',       cost:100000, level:1,
    rentIdx:1, desc:'Basic shelter. Modest income.' },
  { id:'hotel',       emoji:'🏨', name:'Hotel',       cost:250000, level:2,
    rentIdx:2, desc:'Luxury lodging. Good income.' },
  { id:'skyscraper',  emoji:'🏙️', name:'Skyscraper',  cost:450000, level:3,
    rentIdx:3, desc:'Megastructure. Maximum rent.' },
  { id:'casino_b',    emoji:'🎰', name:'Casino',      cost:350000, level:2,
    rentIdx:0, randomIncome:[50000,400000], desc:'Random income: $50K–$400K/turn!' },
  { id:'startup',     emoji:'💻', name:'Tech Startup',cost:300000, level:2,
    rentIdx:0, riskyIncome:{ prob:0.35, high:500000, low:20000 }, desc:'30% chance $500K, else $20K.' },
  { id:'factory',     emoji:'🏭', name:'Factory',     cost:200000, level:2,
    rentIdx:0, stableBonus:60000, desc:'+$60K stable income/turn.' },
];

// ── Cards ──────────────────────────────────────────────────────
export const CARDS = {
  chaos: [
    { emoji:'🌪️', title:'TORNADO',       effect:'destroy_building',  desc:'Destroy the most expensive building on the board.' },
    { emoji:'🛸', title:'UFO ABDUCTION', effect:'steal_property',    desc:'Steal a random property from any player you choose.' },
    { emoji:'💸', title:'FREE MONEY',    effect:'earn',       amount:200000, desc:'Collect $200K. No questions asked.' },
    { emoji:'🎲', title:'DICE FEVER',    effect:'roll_again',        desc:'Roll the dice again immediately after this turn.' },
    { emoji:'🔀', title:'CHAOS SWAP',    effect:'swap_position',     desc:'Swap board positions with any player you choose.' },
    { emoji:'💥', title:'MARKET CRASH',  effect:'all_lose_pct', pct:0.20, desc:'All players lose 20% of their cash.' },
    { emoji:'🎁', title:'BENEFACTOR',    effect:'earn_random', min:50000, max:350000, desc:'Earn between $50K and $350K from a mystery donor.' },
    { emoji:'🔥', title:'DUMPSTER FIRE', effect:'pay',        amount:80000, desc:'Pay $80K or your property burns down.' },
    { emoji:'🌀', title:'TELEPORT',      effect:'teleport',          desc:'Move to any tile on the board immediately.' },
    { emoji:'🎰', title:'CASINO NIGHT',  effect:'double_or_half',    desc:'50/50 chance to double or halve your cash.' },
  ],
  business: [
    { emoji:'📈', title:'BULL MARKET',   effect:'rent_mult',  mult:2, turns:3, desc:'Double rents on all your properties for 3 turns.' },
    { emoji:'💼', title:'MERGER',        effect:'earn_per_prop', amount:50000, desc:'Earn $50K per property you own.' },
    { emoji:'🏗️', title:'FREE BUILD',   effect:'free_build',        desc:'Build one structure on any property for free.' },
    { emoji:'📊', title:'AUDIT',         effect:'richest_pays',      desc:'The richest player pays every other player $80K.' },
    { emoji:'🤝', title:'JOINT VENTURE', effect:'earn',       amount:300000, desc:'Collect $300K from a highly suspicious deal.' },
    { emoji:'🔧', title:'RENOVATION',    effect:'build_discount',    desc:'50% off your next building.' },
    { emoji:'✈️', title:'BUSINESS TRIP', effect:'move_to_metro',     desc:'Move to the nearest Metro station for free.' },
    { emoji:'💰', title:'BOOM',          effect:'property_up', pct:0.25, turns:3, desc:'All property values +25% for 3 turns.' },
  ],
  crime: [
    { emoji:'🔫', title:'BANK HEIST',    effect:'steal_pool',        desc:'Take all money from the Free Parking pool.' },
    { emoji:'💊', title:'BRIBE',         effect:'jail_free',         desc:'Get Out of Jail Free. Keep for later.' },
    { emoji:'🕶️', title:'LAUNDERING',   effect:'tax_exempt', turns:3, desc:'Tax exempt for 3 turns.' },
    { emoji:'🔪', title:'EXTORTION',     effect:'extort_target',     desc:'Force any player to pay you 25% of their cash.' },
    { emoji:'📞', title:'CALL LAWYER',   effect:'cancel_rent',       desc:'Avoid paying rent on this tile this turn.' },
    { emoji:'🔓', title:'BLACKMAIL',     effect:'steal_property',    desc:'Take one property from any player for free.' },
    { emoji:'🚗', title:'GETAWAY',       effect:'choose_tile',       desc:'Move to any tile of your choice.' },
    { emoji:'🎭', title:'IDENTITY',      effect:'copy_ability',      desc:'Use any other player\'s character ability.' },
  ],
  gov: [
    { emoji:'🏛️', title:'EMINENT DOMAIN',effect:'govt_seize',        desc:'Government seizes 1 property from the richest player.' },
    { emoji:'📜', title:'TAX REFORM',    effect:'all_tax', pct:0.10,  desc:'Everyone pays 10% wealth tax.' },
    { emoji:'💡', title:'STIMULUS',      effect:'all_earn', amount:120000, desc:'All players receive $120K stimulus.' },
    { emoji:'🔒', title:'LOCKDOWN',      effect:'all_skip',          desc:'Nobody moves next turn.' },
    { emoji:'🚔', title:'MASS ARREST',   effect:'jail_richest',      desc:'The wealthiest player goes straight to jail.' },
    { emoji:'🌱', title:'GREEN DEAL',    effect:'nature_boost', turns:3, desc:'Nature district rent ×3 for 3 turns.' },
    { emoji:'💉', title:'SUBSIDY',       effect:'all_earn_per_prop', amount:40000, desc:'All players earn $40K per property.' },
    { emoji:'📉', title:'COLLAPSE',      effect:'property_down', pct:0.30, turns:2, desc:'All property values −30% for 2 turns.' },
  ],
};

// ── Random Events ─────────────────────────────────────────────
export const EVENTS = [
  { emoji:'📉', name:'ECONOMIC CRISIS',   type:'bad',    effect:'all_lose_pct',  pct:0.20,
    desc:'Everyone loses 20% of their cash. Economy tanked.' },
  { emoji:'🚀', name:'REAL ESTATE BOOM',  type:'good',   effect:'rent_double_global', turns:3,
    desc:'All rents doubled for 3 turns! Landlords rejoice.' },
  { emoji:'💸', name:'LOTTERY JACKPOT',   type:'luck',   effect:'random_winner', amount:600000,
    desc:'A random player wins the $600K jackpot!' },
  { emoji:'🛸', name:'UFO ATTACK!',       type:'chaos',  effect:'ufo',
    desc:'A UFO destroys the most expensive building on the board!' },
  { emoji:'🔥', name:'MARKET FIRE SALE',  type:'chaos',  effect:'all_sell_pct', pct:0.50,
    desc:'All unimproved properties drop to 50% value for 2 turns.' },
  { emoji:'₿',  name:'CRYPTO CRASH',      type:'bad',    effect:'tech_halved', turns:2,
    desc:'Tech district income halved for 2 turns.' },
  { emoji:'🌍', name:'TOURISM BOOM',      type:'good',   effect:'casino_boost', turns:2,
    desc:'Casino income ×3 for 2 turns. Vegas baby!' },
  { emoji:'🤖', name:'AI MAYOR',          type:'chaos',  effect:'random_tax', turns:3,
    desc:'AI Mayor randomizes all tax rates for 3 turns.' },
  { emoji:'☄️', name:'METEOR SHOWER',     type:'chaos',  effect:'random_destroy',
    desc:'Random buildings across the city are destroyed!' },
  { emoji:'🏦', name:'BANK ROBBERY',      type:'luck',   effect:'double_pool',
    desc:'Bank robbed! Free Parking pool doubled.' },
  { emoji:'✊', name:'RENT STRIKE!',       type:'bad',    effect:'no_rent', turns:2,
    desc:'Tenants strike! No rent collected for 2 turns.' },
  { emoji:'🏆', name:'GOLD RUSH',         type:'luck',   effect:'poorest_wins', amount:450000,
    desc:'The player with fewest properties gets $450K!' },
];
