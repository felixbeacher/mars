export type ToolId =
  // Colony & Infrastructure
  | 'house'
  | 'windmill'
  | 'lighthouse'
  | 'watchtower'
  | 'campfire'
  | 'lantern'
  | 'balloon'
  // Expedition & Rovers
  | 'sailboat'
  | 'dock'
  | 'duck'
  // Biosphere & Terra-Flora
  | 'tree'
  | 'flower'
  | 'beehive'
  | 'villager'
  | 'sheep'
  // Dust & Atmosphere
  | 'cloud'
  | 'snowcloud'
  | 'rainbow'
  | 'shootingstar'
  // Geology & Craters
  | 'mountain'
  | 'lake'
  | 'raise'
  | 'lower'
  | 'remove';

export type ToolCategory = 'all' | 'village' | 'water' | 'nature' | 'weather' | 'sculpt';

export type CameraViewId = 'orb' | 'surface' | 'orbit' | 'village';

export type TimeMode = 'auto' | 'day' | 'twilight' | 'night';

export interface WorldState {
  planetName: string;
  population: number;
  happiness: number;
  dayCount: number;
  activeTool: ToolId;
  activeView: CameraViewId;
  timeMode: TimeMode;
  /** 0..1 where 0.25 = butterscotch sunlit noon, 0.52 = Martian blue sunset, 0.78 = starry deep night */
  timeOfDay: number;
  tourActive: boolean;
  tourElapsed: number;
  tourPhase: string;
  objectCounts: {
    houses: number;
    trees: number;
    windmills: number;
    lighthouses: number;
    villagers: number;
    sheep: number;
    clouds: number;
    flowers: number;
    boats: number;
  };
}

export type DustStormSeverity = 'advisory' | 'warning' | 'severe' | 'critical' | 'resolved';

export interface DustStormAlert {
  id: string;
  sol: number;
  marsTime: string;
  severity: DustStormSeverity;
  title: string;
  message: string;
  region: string;
  windSpeed: number; // in m/s
  tau: number; // optical atmospheric depth
  timestamp: number;
  triggerSource: string;
  read?: boolean;
}

export interface ToolDefinition {
  id: ToolId;
  label: string;
  category: Exclude<ToolCategory, 'all'>;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  description: string;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // Colony & Infrastructure
  {
    id: 'house',
    label: 'Hab Dome',
    category: 'village',
    accentBg: 'bg-[#ffeedd]',
    accentBorder: 'border-[#e09875]',
    accentText: 'text-[#87381b]',
    description: 'Construct a pressurized geodesic bio-dome with glowing hydroponics & airlock',
  },
  {
    id: 'windmill',
    label: 'Vortex Turbine',
    category: 'village',
    accentBg: 'bg-[#fff4d6]',
    accentBorder: 'border-[#dfba60]',
    accentText: 'text-[#7d5312]',
    description: 'Erect an aerodynamic Martian wind turbine with tracking solar panels',
  },
  {
    id: 'lighthouse',
    label: 'Comms Relay',
    category: 'village',
    accentBg: 'bg-[#ffe4dc]',
    accentBorder: 'border-[#e58a74]',
    accentText: 'text-[#822718]',
    description: 'Build a deep space parabolic dish array with sweeping telemetry beam',
  },
  {
    id: 'watchtower',
    label: 'Rocket Gantry',
    category: 'village',
    accentBg: 'bg-[#f0e8dc]',
    accentBorder: 'border-[#c7b297]',
    accentText: 'text-[#59442b]',
    description: 'Assemble a steel Starship launch gantry with flashing navigation beacons',
  },
  {
    id: 'campfire',
    label: 'Thermal Tap',
    category: 'village',
    accentBg: 'bg-[#feddc9]',
    accentBorder: 'border-[#eb8957]',
    accentText: 'text-[#802f0a]',
    description: 'Tap a geothermal volcanic fumarole with radiant heat shimmer and embers',
  },
  {
    id: 'lantern',
    label: 'Way Beacon',
    category: 'village',
    accentBg: 'bg-[#fef2cb]',
    accentBorder: 'border-[#e0be5a]',
    accentText: 'text-[#75500d]',
    description: 'Place a solar waypoint pylon & illuminated rover trail marker',
  },
  {
    id: 'balloon',
    label: 'Survey Aerostat',
    category: 'village',
    accentBg: 'bg-[#fce6dc]',
    accentBorder: 'border-[#df9e86]',
    accentText: 'text-[#75341c]',
    description: 'Launch a high-altitude atmospheric probe blimp with sensor telemetry',
  },

  // Expedition & Rovers
  {
    id: 'sailboat',
    label: 'Mars Rover',
    category: 'water',
    accentBg: 'bg-[#e2f0f7]',
    accentBorder: 'border-[#8ebbd6]',
    accentText: 'text-[#1e5473]',
    description: 'Deploy a 6-wheeled scientific exploration rover with camera mast & robotic arm',
  },
  {
    id: 'dock',
    label: 'Landing Pad',
    category: 'water',
    accentBg: 'bg-[#ede5dc]',
    accentBorder: 'border-[#c4b19c]',
    accentText: 'text-[#52402d]',
    description: 'Construct a reinforced cargo landing pad & airlock loading pier',
  },
  {
    id: 'duck',
    label: 'Ingenuity Drone',
    category: 'water',
    accentBg: 'bg-[#e0f4f0]',
    accentBorder: 'border-[#8ed3c5]',
    accentText: 'text-[#1d594e]',
    description: 'Launch a twin-rotor aerial scout helicopter buzzing over red dunes',
  },

  // Biosphere & Terra-Flora
  {
    id: 'tree',
    label: 'Terra-Flora',
    category: 'nature',
    accentBg: 'bg-[#e2edd8]',
    accentBorder: 'border-[#a2cb8e]',
    accentText: 'text-[#2b591b]',
    description: 'Plant bio-engineered oxygenating succulents, Martian pines, and spore spires',
  },
  {
    id: 'flower',
    label: 'Lichen & Crystal',
    category: 'nature',
    accentBg: 'bg-[#f8e0ee]',
    accentBorder: 'border-[#d897c2]',
    accentText: 'text-[#6e2755]',
    description: 'Scatter glowing violet silica geodes and crimson cyanobacteria lichen',
  },
  {
    id: 'beehive',
    label: 'Mining Crawler',
    category: 'nature',
    accentBg: 'bg-[#fdf0cf]',
    accentBorder: 'border-[#dfc168]',
    accentText: 'text-[#73550f]',
    description: 'Place an automated regolith excavator & mineral extraction pod',
  },
  {
    id: 'villager',
    label: 'EVA Astronaut',
    category: 'nature',
    accentBg: 'bg-[#fee8d4]',
    accentBorder: 'border-[#e8a97b]',
    accentText: 'text-[#753c15]',
    description: 'Welcome a space-suited astronaut hopping across the 0.38g regolith',
  },
  {
    id: 'sheep',
    label: 'Robodog Unit',
    category: 'nature',
    accentBg: 'bg-[#f1eee8]',
    accentBorder: 'border-[#c9c1b3]',
    accentText: 'text-[#474136]',
    description: 'Deploy an agile quadruped robotic scout patrolling the perimeter',
  },

  // Dust & Atmosphere
  {
    id: 'cloud',
    label: 'Dust Devil',
    category: 'weather',
    accentBg: 'bg-[#fbe7d5]',
    accentBorder: 'border-[#e3a87f]',
    accentText: 'text-[#783e18]',
    description: 'Summon a swirling Martian dust devil spinning across the plains',
  },
  {
    id: 'snowcloud',
    label: 'CO2 Ice Cloud',
    category: 'weather',
    accentBg: 'bg-[#e3f0fb]',
    accentBorder: 'border-[#99c4eb]',
    accentText: 'text-[#1c4b75]',
    description: 'Summon a frosty dry-ice cloud that dusts craters & peaks in white frost',
  },
  {
    id: 'rainbow',
    label: 'Martian Aurora',
    category: 'weather',
    accentBg: 'bg-[#ebf8ea]',
    accentBorder: 'border-[#9ed69c]',
    accentText: 'text-[#236321]',
    description: 'Ignite an ethereal emerald & magenta ionospheric aurora arch',
  },
  {
    id: 'shootingstar',
    label: 'Meteor Shower',
    category: 'weather',
    accentBg: 'bg-[#ede6fc]',
    accentBorder: 'border-[#bca3f0]',
    accentText: 'text-[#472685]',
    description: 'Streak a fiery meteor trail through the thin carbon-dioxide atmosphere',
  },

  // Geology & Craters
  {
    id: 'mountain',
    label: 'Olympus Mons',
    category: 'sculpt',
    accentBg: 'bg-[#f0dfd5]',
    accentBorder: 'border-[#cba28c]',
    accentText: 'text-[#5e341f]',
    description: 'Elevate a massive Martian shield volcano with rugged caldera rim',
  },
  {
    id: 'lake',
    label: 'Impact Crater',
    category: 'sculpt',
    accentBg: 'bg-[#d8edf4]',
    accentBorder: 'border-[#8fc2d4]',
    accentText: 'text-[#1d5061]',
    description: 'Carve a circular meteorite impact crater & ancient paleolake basin',
  },
  {
    id: 'raise',
    label: 'Raise Dunes',
    category: 'sculpt',
    accentBg: 'bg-[#f5e3d7]',
    accentBorder: 'border-[#d6a589]',
    accentText: 'text-[#69361c]',
    description: 'Elevate red regolith dunes, canyon mesas & highland plateaus',
  },
  {
    id: 'lower',
    label: 'Valles Rift',
    category: 'sculpt',
    accentBg: 'bg-[#ebdfd5]',
    accentBorder: 'border-[#c4a997]',
    accentText: 'text-[#573926]',
    description: 'Carve a deep tectonic canyon chasm inspired by Valles Marineris',
  },
  {
    id: 'remove',
    label: 'Decommission',
    category: 'sculpt',
    accentBg: 'bg-[#fae1e1]',
    accentBorder: 'border-[#df9e9e]',
    accentText: 'text-[#7a2222]',
    description: 'Dismantle or clear a surface structure from the Mars terrain',
  },
];
