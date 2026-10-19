import { DustStormAlert, DustStormSeverity } from '../types/world';

export interface DustScenarioTemplate {
  severity: DustStormSeverity;
  title: string;
  message: string;
  region: string;
  baseWind: number; // m/s
  baseTau: number; // Optical depth
  triggerSource: string;
}

export const DUST_SCENARIOS: DustScenarioTemplate[] = [
  {
    severity: 'advisory',
    title: 'Mesoscale Dust Whirlwind Sighted',
    message: 'Surface microbarometers detected a 3.8 Pa pressure drop. A swirling cyclonic dust column is tracking across the northern dunes.',
    region: 'Chryse Planitia',
    baseWind: 16.5,
    baseTau: 0.82,
    triggerSource: 'MEDA Wind Sensor Mast #2',
  },
  {
    severity: 'advisory',
    title: 'CO2 Dry-Ice & Dust Nucleation',
    message: 'High-altitude cold atmospheric pocket precipitating CO2 crystals onto airborne iron-oxide grains. Thin haze over north rim.',
    region: 'North Polar Cap Margin',
    baseWind: 14.2,
    baseTau: 0.74,
    triggerSource: 'LIDAR Backscatter Radar',
  },
  {
    severity: 'warning',
    title: 'Convective Dust Plume Rising',
    message: 'Intense diurnal solar insolation has triggered vertical lofting along canyon scarps. A reddish-ochre dust wall is expanding eastward.',
    region: 'Valles Marineris Rift',
    baseWind: 27.8,
    baseTau: 1.88,
    triggerSource: 'MRO / MARCI Satellite Sweep',
  },
  {
    severity: 'warning',
    title: 'Regional Gale Front Advancing',
    message: 'Dense particulate front approaching hab modules. Rover photovoltaic telemetry indicates an 18% reduction in solar array insolation.',
    region: 'Gale Crater Basin',
    baseWind: 32.4,
    baseTau: 2.35,
    triggerSource: 'Curiosity Environmental Station',
  },
  {
    severity: 'warning',
    title: 'Katabatic Basin Windstorm',
    message: 'Cold air spilling down the 7-kilometer scarps of the impact basin, kicking up massive silt plumes. Visibility dropping to 800m.',
    region: 'Hellas Impact Basin',
    baseWind: 34.1,
    baseTau: 2.65,
    triggerSource: 'Ares Telemetry Doppler Array',
  },
  {
    severity: 'severe',
    title: 'Severe Dust Wall Impinging on Hab Domes',
    message: 'Atmospheric optical depth surging past tau 3.5. Automated electrostatic sweepers deployed to keep primary dome solar arrays clear.',
    region: 'Ares Habitation Domes',
    baseWind: 39.5,
    baseTau: 3.85,
    triggerSource: 'Colony Biosphere Sensor Ring',
  },
  {
    severity: 'severe',
    title: 'High-Altitude Caldera Dust Vortex',
    message: 'Towering cyclonic dust front cresting the caldera rim at 21 km altitude. Severe atmospheric turbulence; grounded all scout drones.',
    region: 'Olympus Mons Flank',
    baseWind: 43.2,
    baseTau: 4.15,
    triggerSource: 'High-Resolution Stereo Imager',
  },
  {
    severity: 'critical',
    title: 'Planet-Encircling Dust Event (PEDE) Threat',
    message: 'Multiple regional dust storms coalescing across hemispheres. Atmospheric opacity tau > 5.0. All EVA sorties suspended; backup fuel cells on.',
    region: 'Jezero & Chryse Corridor',
    baseWind: 48.6,
    baseTau: 5.42,
    triggerSource: 'Global Mars Climate Sounder',
  },
  {
    severity: 'resolved',
    title: 'Dust Front Dissipating & Atmosphere Clearing',
    message: 'Gale winds have subsided. Airborne particulate density settling rapidly into paleolake floor. Solar insolation recovering to 94%.',
    region: 'Jezero Crater Basin',
    baseWind: 11.2,
    baseTau: 0.45,
    triggerSource: 'Perseverance SuperCam Mast',
  },
];

/**
 * Format Mars Local Solar Time (LST) from 0..1 normalized timeOfDay
 */
export function formatMarsTime(timeOfDay: number): string {
  const totalMinutes = Math.floor(timeOfDay * 24 * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  return `${hh}:${mm} LST`;
}

/**
 * Generate a new context-aware Dust Storm Alert based on active biosphere conditions
 */
export function generateDustStormAlert(
  sol: number,
  timeOfDay: number,
  activeTool: string,
  cloudCount: number,
  recentAlerts: DustStormAlert[] = [],
): DustStormAlert {
  const marsTime = formatMarsTime(timeOfDay);

  // Filter templates: avoid immediately repeating the exact same title as last alert
  const lastAlert = recentAlerts[0];
  let eligibleTemplates = DUST_SCENARIOS.filter(
    (t) => !lastAlert || t.title !== lastAlert.title,
  );

  // If cloud count is high (> 3) or weather tool is 'cloud'/'snowcloud', weigh toward warnings & severe
  if (cloudCount >= 4 || activeTool === 'snowcloud') {
    const heavy = eligibleTemplates.filter(
      (t) => t.severity === 'severe' || t.severity === 'warning' || t.severity === 'critical',
    );
    if (heavy.length > 0) eligibleTemplates = heavy;
  } else if (cloudCount === 0 && activeTool !== 'cloud') {
    // If clouds cleared, allow resolved or advisory
    const mild = eligibleTemplates.filter(
      (t) => t.severity === 'advisory' || t.severity === 'resolved',
    );
    if (mild.length > 0) eligibleTemplates = mild;
  }

  const template =
    eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)] ||
    DUST_SCENARIOS[0];

  // Add realistic jitter
  const windJitter = (Math.random() - 0.5) * 4.2;
  const tauJitter = (Math.random() - 0.5) * 0.35;
  const windSpeed = Math.max(8.0, Number((template.baseWind + windJitter).toFixed(1)));
  const tau = Math.max(0.2, Number((template.baseTau + tauJitter).toFixed(2)));

  // Dynamic context message customization
  let customTrigger = template.triggerSource;
  if (activeTool === 'cloud') {
    customTrigger = `Atmosphere Vortex Sensor // Dust Devil Active`;
  } else if (activeTool === 'snowcloud') {
    customTrigger = `Cryo-Spectrometer // CO2 Dry-Ice Cloud Active`;
  } else if (activeTool === 'rainbow') {
    customTrigger = `Ionospheric Radar // Martian Aurora Resonance`;
  } else if (activeTool === 'shootingstar') {
    customTrigger = `Meteor Tracking Array // Atmospheric Entry Shock`;
  }

  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    sol,
    marsTime,
    severity: template.severity,
    title: template.title,
    message: template.message,
    region: template.region,
    windSpeed,
    tau,
    timestamp: Date.now(),
    triggerSource: customTrigger,
    read: false,
  };
}

/**
 * Synthesize a soft telemetry sci-fi alert sound via Web Audio API.
 * Muted by default if user disabled sound.
 */
let audioCtx: AudioContext | null = null;

export function playDustAlertSound(severity: DustStormSeverity, isMuted = false): void {
  if (isMuted || typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Frequencies tailored to severity
    let freq1 = 587.33; // D5
    let freq2 = 880.0; // A5
    let duration = 0.28;

    if (severity === 'critical') {
      freq1 = 880.0;
      freq2 = 1174.66; // D6
      duration = 0.45;
    } else if (severity === 'severe') {
      freq1 = 659.25; // E5
      freq2 = 987.77; // B5
      duration = 0.35;
    } else if (severity === 'resolved') {
      freq1 = 783.99; // G5
      freq2 = 1046.5; // C6
      duration = 0.32;
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = severity === 'critical' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq1, now);
    osc.frequency.exponentialRampToValueAtTime(freq2, now + duration * 0.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Non-blocking fallback for browsers restricting auto-play
  }
}
