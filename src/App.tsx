import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Bird,
  Bug,
  Castle,
  CheckCircle2,
  Cloud,
  CloudSnow,
  Compass,
  Crosshair,
  Eraser,
  Eye,
  Fan,
  Flame,
  Flower2,
  Gauge,
  LampFloor,
  Moon,
  Mountain,
  Pencil,
  Play,
  Radio,
  Rainbow,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Sun,
  Sunset,
  TowerControl,
  Trees,
  Volume2,
  VolumeX,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { PocketWorldController } from './three/PocketWorldScene';
import {
  CameraViewId,
  DustStormAlert,
  DustStormSeverity,
  TimeMode,
  TOOL_DEFINITIONS,
  ToolCategory,
  ToolId,
  WorldState,
} from './types/world';
import {
  generateDustStormAlert,
  playDustAlertSound,
} from './utils/dustStormSystem';

const TOOL_GROUPS: { category: Exclude<ToolCategory, 'all'>; title: string }[] = [
  { category: 'village', title: 'Colony & Infrastructure' },
  { category: 'water', title: 'Expedition & Rovers' },
  { category: 'nature', title: 'Biosphere & Terra-Flora' },
  { category: 'weather', title: 'Dust & Atmosphere' },
  { category: 'sculpt', title: 'Geology & Craters' },
];

function renderToolIcon(id: ToolId) {
  const cls = 'w-4 h-4 shrink-0';
  switch (id) {
    case 'house':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
          <path d="M3 18h18" />
          <path d="M4 18a8 8 0 0 1 16 0" />
          <path d="M12 2v4" />
          <path d="M9 18v-5h6v5" />
        </svg>
      );
    case 'windmill':
      return <Fan className={cls} />;
    case 'lighthouse':
      return <TowerControl className={cls} />;
    case 'watchtower':
      return <Castle className={cls} />;
    case 'campfire':
      return <Flame className={cls} />;
    case 'lantern':
      return <LampFloor className={cls} />;
    case 'balloon':
      return <Wind className={cls} />;
    case 'sailboat':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
          <rect x="5" y="7" width="14" height="7" rx="2" />
          <circle cx="6" cy="17" r="2.5" />
          <circle cx="12" cy="17" r="2.5" />
          <circle cx="18" cy="17" r="2.5" />
          <path d="M15 7l2-4h2" />
        </svg>
      );
    case 'dock':
      return <Anchor className={cls} />;
    case 'duck':
      return <Bird className={cls} />;
    case 'tree':
      return <Trees className={cls} />;
    case 'flower':
      return <Flower2 className={cls} />;
    case 'beehive':
      return <Bug className={cls} />;
    case 'villager':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
          <circle cx="12" cy="11" r="8" />
          <path d="M8 12a4 4 0 0 1 8 0" />
          <path d="M12 3v-2" />
          <path d="M7 19l2 3h6l2-3" />
        </svg>
      );
    case 'sheep':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
          <rect x="6" y="8" width="12" height="6" rx="2" />
          <path d="M18 10l3-2v3l-3 1" />
          <path d="M8 14v5" />
          <path d="M11 14v5" />
          <path d="M14 14v5" />
          <path d="M17 14v5" />
        </svg>
      );
    case 'cloud':
      return <Cloud className={cls} />;
    case 'snowcloud':
      return <CloudSnow className={cls} />;
    case 'rainbow':
      return <Rainbow className={cls} />;
    case 'shootingstar':
      return <Sparkles className={cls} />;
    case 'mountain':
      return <Mountain className={cls} />;
    case 'lake':
      return <Waves className={cls} />;
    case 'raise':
      return <ArrowUpFromLine className={cls} />;
    case 'lower':
      return <ArrowDownToLine className={cls} />;
    case 'remove':
      return <Eraser className={cls} />;
  }
}

function getSeverityMeta(severity: DustStormSeverity) {
  switch (severity) {
    case 'critical':
      return {
        label: 'CRITICAL EVENT',
        badgeClass: 'bg-rose-950/90 text-rose-200 border-rose-500/80 animate-pulse',
        borderClass: 'border-rose-500/70',
        bgGradient: 'from-rose-950/95 via-[#2a171c]/95 to-[#1c1214]/95',
        dotColor: 'bg-rose-500',
        icon: <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />,
        intensity: 0.95,
      };
    case 'severe':
      return {
        label: 'SEVERE STORM',
        badgeClass: 'bg-orange-950/90 text-orange-200 border-orange-500/70',
        borderClass: 'border-orange-500/60',
        bgGradient: 'from-[#3a1a12]/95 via-[#2b1716]/95 to-[#1c1214]/95',
        dotColor: 'bg-orange-500',
        icon: <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />,
        intensity: 0.75,
      };
    case 'warning':
      return {
        label: 'STORM WARNING',
        badgeClass: 'bg-amber-950/90 text-amber-200 border-amber-500/60',
        borderClass: 'border-amber-500/50',
        bgGradient: 'from-[#331c12]/95 via-[#261715]/95 to-[#1a1214]/95',
        dotColor: 'bg-amber-500',
        icon: <Wind className="w-4 h-4 text-amber-400 shrink-0" />,
        intensity: 0.50,
      };
    case 'advisory':
      return {
        label: 'DUST ADVISORY',
        badgeClass: 'bg-[#3d2b17]/90 text-[#ecd29a] border-[#b88c3f]/50',
        borderClass: 'border-[#b88c3f]/40',
        bgGradient: 'from-[#281c16]/95 via-[#201718]/95 to-[#181315]/95',
        dotColor: 'bg-[#d8a848]',
        icon: <Eye className="w-4 h-4 text-[#ecd29a] shrink-0" />,
        intensity: 0.28,
      };
    case 'resolved':
      return {
        label: 'FRONT RESOLVED',
        badgeClass: 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50',
        borderClass: 'border-emerald-500/40',
        bgGradient: 'from-[#12281e]/95 via-[#15211c]/95 to-[#161718]/95',
        dotColor: 'bg-emerald-400',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
        intensity: 0.05,
      };
  }
}

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<PocketWorldController | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [worldState, setWorldState] = useState<WorldState>({
    planetName: 'Ares Prime',
    population: 12, // Colonists
    happiness: 96,  // Biosphere O2 / Terraforming %
    dayCount: 1,    // Sol
    activeTool: 'tree',
    activeView: 'orb',
    timeMode: 'auto',
    timeOfDay: 0.24,
    tourActive: false,
    tourElapsed: 0,
    tourPhase: '',
    objectCounts: {
      houses: 4,
      trees: 22,
      windmills: 1,
      lighthouses: 2,
      villagers: 12,
      sheep: 8,
      clouds: 3,
      flowers: 5,
      boats: 3,
    },
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [webglLost, setWebglLost] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Real-time Dust Storm Notification State
  const [alerts, setAlerts] = useState<DustStormAlert[]>([
    {
      id: 'init_alert_sol1',
      sol: 1,
      marsTime: '08:45 LST',
      severity: 'advisory',
      title: 'Baseline Biosphere Meteorology Active',
      message: 'Ares Weather Radar initialized. Early warning monitors online for convective dust plumes and gale fronts across Mars.',
      region: 'Chryse Planitia',
      windSpeed: 14.8,
      tau: 0.65,
      timestamp: Date.now() - 45000,
      triggerSource: 'MEDA Sensor Mast #1',
      read: true,
    },
  ]);
  const [activeToast, setActiveToast] = useState<DustStormAlert | null>(null);
  const [toastProgress, setToastProgress] = useState(100);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<DustStormSeverity | 'all'>('all');
  const [isAudioMuted, setIsAudioMuted] = useState(() => {
    try {
      return localStorage.getItem('ares_telemetry_muted') === 'true';
    } catch {
      return false;
    }
  });

  // Keep a ref to the latest alerts and world state to avoid stale closures in timers
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;
  const worldStateRef = useRef(worldState);
  worldStateRef.current = worldState;

  // Determine if weather tools are currently active in the biosphere
  const isWeatherToolActive =
    worldState.activeTool === 'cloud' ||
    worldState.activeTool === 'snowcloud' ||
    worldState.activeTool === 'rainbow' ||
    worldState.activeTool === 'shootingstar';
  const hasWeatherEntitiesInBiosphere = worldState.objectCounts.clouds > 0;
  const isWeatherActive = isWeatherToolActive || hasWeatherEntitiesInBiosphere;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const controller = new PocketWorldController(container, setWorldState);
    controllerRef.current = controller;

    const canvas = container.querySelector('canvas');
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const onContextRestored = () => {
      setWebglLost(false);
    };

    if (canvas) {
      canvas.addEventListener('webglcontextlost', onContextLost);
      canvas.addEventListener('webglcontextrestored', onContextRestored);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', onContextLost);
        canvas.removeEventListener('webglcontextrestored', onContextRestored);
      }
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!filtersOpen && !notificationCenterOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFiltersOpen(false);
        setNotificationCenterOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtersOpen, notificationCenterOpen]);

  // Dispatch a new Dust Storm Alert
  const dispatchDustAlert = useCallback(
    (customSeverity?: DustStormSeverity) => {
      const current = worldStateRef.current;
      const recent = alertsRef.current;
      const alert = generateDustStormAlert(
        current.dayCount,
        current.timeOfDay,
        current.activeTool,
        current.objectCounts.clouds,
        recent,
      );

      if (customSeverity) {
        alert.severity = customSeverity;
      }

      // Update 3D scene visual dust intensity
      const meta = getSeverityMeta(alert.severity);
      controllerRef.current?.setDustStormIntensity(meta.intensity);

      // Play soft telemetry chime
      playDustAlertSound(alert.severity, isAudioMuted);

      // Update state
      setAlerts((prev) => [alert, ...prev.slice(0, 39)]);
      setActiveToast(alert);
      setToastProgress(100);

      // Reset auto-dismiss timer
      if (toastTimerRef.current) {
        window.clearInterval(toastTimerRef.current);
      }
      const startTime = performance.now();
      const toastDuration = 8000; // 8 seconds display
      const interval = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / toastDuration) * 100);
        setToastProgress(remaining);
        if (remaining <= 0) {
          window.clearInterval(interval);
          setActiveToast(null);
        }
      }, 50);
      toastTimerRef.current = interval;
    },
    [isAudioMuted],
  );

  // Periodic status alerts about 'Dust Storm' events when weather tools are active in the biosphere
  useEffect(() => {
    if (!isWeatherActive) {
      // Settle dust intensity when weather tools are inactive
      controllerRef.current?.setDustStormIntensity(0.04);
      return;
    }

    // Trigger an immediate initial alert on activation if none recent
    const now = Date.now();
    const lastAlert = alertsRef.current[0];
    if (!lastAlert || now - lastAlert.timestamp > 10000) {
      dispatchDustAlert();
    }

    // Periodic timer: generates periodic status alerts every 14 seconds
    const periodicTimer = window.setInterval(() => {
      dispatchDustAlert();
    }, 14000);

    return () => {
      window.clearInterval(periodicTimer);
    };
  }, [isWeatherActive, dispatchDustAlert]);

  const handleDismissToast = () => {
    if (toastTimerRef.current) {
      window.clearInterval(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setActiveToast(null);
  };

  const handleFocusRegion = (region: string) => {
    controllerRef.current?.focusOnRegion(region);
  };

  const handleToggleAudio = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ares_telemetry_muted', String(next));
      } catch {
        // Safe fallback
      }
      return next;
    });
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleClearAlerts = () => {
    setAlerts([]);
    setActiveToast(null);
  };

  const handleSelectTool = (tool: ToolId) => {
    controllerRef.current?.setTool(tool);
    // If user clicked a weather tool, provide immediate visual & alert feedback
    if (
      tool === 'cloud' ||
      tool === 'snowcloud' ||
      tool === 'rainbow' ||
      tool === 'shootingstar'
    ) {
      const last = alertsRef.current[0];
      if (!last || Date.now() - last.timestamp > 5000) {
        dispatchDustAlert();
      }
    }
  };

  const handleSelectView = (view: CameraViewId) => {
    controllerRef.current?.stopTour();
    controllerRef.current?.applyCameraPreset(view);
  };

  const handleSelectTimeMode = (mode: TimeMode) => {
    controllerRef.current?.setTimeMode(mode);
  };

  const handleGrow = () => {
    controllerRef.current?.triggerGrowVillage();
  };

  const handleToggleTour = () => {
    setFiltersOpen(false);
    setNotificationCenterOpen(false);
    if (worldState.tourActive) {
      controllerRef.current?.stopTour();
    } else {
      controllerRef.current?.startTour();
    }
  };

  const orderedTools = TOOL_GROUPS.flatMap((group) =>
    TOOL_DEFINITIONS.filter((t) => t.category === group.category),
  );

  const unreadCount = alerts.filter((a) => !a.read).length;
  const filteredAlerts =
    severityFilter === 'all'
      ? alerts
      : alerts.filter((a) => a.severity === severityFilter);

  // Latest telemetry numbers for gauge display
  const latestAlert = alerts[0];
  const currentTau = latestAlert ? latestAlert.tau : 0.65;
  const currentWind = latestAlert ? latestAlert.windSpeed : 14.2;

  return (
    <div className="flex w-screen h-screen overflow-hidden select-none bg-[#181416]">
      {/* 3D Three.js Canvas Viewport */}
      <div className="relative flex-1 min-w-0 h-full">
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D Pocket Mars Terrarium Biosphere"
        />

        {/* Mars Top Info Header Overlay & Real-Time Dust Storm Radar Button */}
        {!worldState.tourActive && (
          <header className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100vw-1.5rem)]">
            {/* Colony Identity & Biosphere Stats */}
            <div className="flex items-center gap-2.5 bg-[#2a2221]/90 border border-[#e08a65]/35 text-[#fbf6f2] px-3.5 py-2 rounded-2xl shadow-lg backdrop-blur-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e06836]" />
                  <h1 className="text-sm font-semibold tracking-wide text-[#fdf8f4]">
                    {worldState.planetName}
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#e06836]/20 text-[#fca47a] border border-[#e06836]/30">
                    Mars Biosphere
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#d6c7be] font-mono-tabular mt-0.5">
                  <span>
                    Colonists: <strong className="text-white">{worldState.population}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    O₂ Biosphere:{' '}
                    <strong className="text-[#59df8a]">{worldState.happiness}%</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Sol: <strong className="text-[#fca47a]">{worldState.dayCount}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Atmospheric Dust Storm Radar & Notification Button */}
            <button
              type="button"
              onClick={() => {
                setNotificationCenterOpen(true);
                handleMarkAllRead();
              }}
              title="Ares Atmospheric Telemetry & Dust Storm Warning System"
              aria-label="Dust Storm Telemetry"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer ${
                isWeatherActive
                  ? 'bg-[#3d1f17]/95 border-[#e06836] text-[#ffd2be] hover:bg-[#4d281e]'
                  : 'bg-[#261f21]/90 border-[#4a3937] text-[#c9b7ad] hover:bg-[#342729] hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {isWeatherActive ? (
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7b47] opacity-85" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#e06836]" />
                  </span>
                ) : (
                  <Radio className="w-4 h-4 text-[#a89589]" />
                )}
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
                    {isWeatherActive ? 'Dust Storm Radar' : 'Atmosphere'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#e06836] text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#d6c7be]">
                  {isWeatherActive
                    ? `MONITORING (${worldState.objectCounts.clouds} Vortices · τ ${currentTau})`
                    : 'STANDBY (Nominal)'}
                </span>
              </div>
            </button>
          </header>
        )}

        {/* Real-Time Floating Dust Storm Toast Banner */}
        {!worldState.tourActive && activeToast && (
          <div
            role="status"
            aria-live="polite"
            className="absolute top-16 right-3 left-3 sm:left-auto sm:right-6 sm:w-[440px] z-30 animate-fade-in"
          >
            {(() => {
              const meta = getSeverityMeta(activeToast.severity);
              return (
                <div
                  className={`relative flex flex-col bg-gradient-to-br ${meta.bgGradient} border ${meta.borderClass} rounded-2xl shadow-2xl p-3.5 text-[#fbf6f2] backdrop-blur-md overflow-hidden`}
                >
                  {/* Auto-dismiss progress bar */}
                  <div
                    className="absolute top-0 left-0 h-1 bg-[#e06836] transition-all duration-75"
                    style={{ width: `${toastProgress}%` }}
                  />

                  {/* Top Bar: Severity Badge, Sol Time, and Close */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${meta.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                        {meta.label}
                      </span>
                      <span className="text-[11px] font-mono text-[#ecd8cb]">
                        Sol {activeToast.sol} · {activeToast.marsTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleDismissToast}
                        title="Dismiss Alert"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-[#b8a69e] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Region */}
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold tracking-wide text-white">
                      {activeToast.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#f0e2d8] mt-1 leading-relaxed">
                    {activeToast.message}
                  </p>

                  {/* Telemetry Metric Pills */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-[#ecd8cb]">
                      Region: <strong className="text-white">{activeToast.region}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-[#ecd8cb]">
                      Wind: <strong className="text-[#fca47a]">{activeToast.windSpeed} m/s</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-[#ecd8cb]">
                      Optical Depth τ: <strong className="text-[#fca47a]">{activeToast.tau}</strong>
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleFocusRegion(activeToast.region)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#e06836] hover:bg-[#eb7644] text-white shadow-sm transition-colors cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Focus Region</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationCenterOpen(true);
                        handleMarkAllRead();
                      }}
                      className="text-xs text-[#d6c7be] hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Open Telemetry Feed ({alerts.length})
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Cinematic 30s Mars Tour Subtitle Banner */}
        {worldState.tourActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 px-5 py-2.5 bg-[#1f1a1d]/95 border border-[#e06836]/40 rounded-2xl shadow-2xl backdrop-blur-md max-w-lg text-center animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#fca47a]">
              <span className="w-2 h-2 rounded-full bg-[#e06836] animate-pulse" />
              <span>Ares Expedition // 30s Cinematic Tour</span>
              <span className="text-[11px] font-mono text-white/80">
                ({Math.max(1, Math.ceil(30 - worldState.tourElapsed))}s)
              </span>
            </div>
            <p className="text-xs text-[#fdf8f5] font-medium">
              {worldState.tourPhase || 'Scanning Olympus Mons & Ares Colony Domes...'}
            </p>
            <button
              type="button"
              onClick={handleToggleTour}
              className="mt-0.5 text-[10px] uppercase tracking-wider text-[#d6c7be] hover:text-white px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              Exit Tour (ESC)
            </button>
          </div>
        )}

        {/* WebGL Context Lost Fallback */}
        {webglLost && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1c181a]/95 text-[#faf6ee]">
            <div className="max-w-md p-6 text-center bg-[#2b2426] rounded-2xl border border-[#e08a65]/30">
              <h2 className="text-xl font-semibold mb-2 text-[#fca47a]">
                Mars Telemetry Interrupted
              </h2>
              <p className="text-sm text-[#d6cee2]">
                The 3D WebGL context was interrupted. Reload or restore the tab
                to resume inspecting {worldState.planetName}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Desktop Thin Icon-Only Tool Dock */}
      {!worldState.tourActive && (
        <aside
          aria-label="Mars exploration controls and tool dock"
          className="hidden md:flex w-16 shrink-0 h-full bg-[#241d1f] border-l border-[#453635] text-[#f7ece4] flex-col items-center py-3 gap-2.5 z-20"
        >
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            title="Colony Controls & Filters"
            aria-label="Open Colony Controls"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-[#e06836] text-[#fff8f2] border border-[#ff8855] hover:bg-[#eb7644] active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              setNotificationCenterOpen(true);
              handleMarkAllRead();
            }}
            title="Ares Dust Storm Telemetry Feed"
            aria-label="Open Telemetry Feed"
            className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all cursor-pointer relative ${
              isWeatherActive
                ? 'bg-[#402018] border-[#e06836] text-[#ffb088] shadow-md'
                : 'bg-[#322728] border-[#4a3937] text-[#e0cfc5] hover:bg-[#423234] hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#e06836] animate-pulse" />
            )}
          </button>

          <div className="w-8 h-px bg-[#453635] shrink-0" aria-hidden="true" />

          <div
            className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto no-scrollbar py-0.5"
            role="toolbar"
            aria-orientation="vertical"
            aria-label="Mars terraforming and colony tools"
          >
            {orderedTools.map((tool) => {
              const isSelected = worldState.activeTool === tool.id;
              const isWeather =
                tool.id === 'cloud' ||
                tool.id === 'snowcloud' ||
                tool.id === 'rainbow' ||
                tool.id === 'shootingstar';
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  title={`${tool.label} — ${tool.description}${
                    isWeather ? ' (Triggers Dust Storm Telemetry Monitoring)' : ''
                  }`}
                  aria-label={tool.label}
                  className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer relative ${
                    isSelected
                      ? `${tool.accentBg} ${tool.accentBorder} ${tool.accentText} shadow-md scale-105`
                      : 'bg-[#322728] border-[#4a3937] text-[#e0cfc5] hover:bg-[#423234] hover:text-[#ffffff]'
                  }`}
                >
                  {renderToolIcon(tool.id)}
                  {isWeather && isSelected && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#e06836]" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Desktop Modal for Filters (Planet Info, Expand Base, 30s Mars Tour, Camera, Sol Lighting) */}
      {!worldState.tourActive && filtersOpen && (
        <div className="hidden md:flex fixed inset-0 z-40 items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mars Colony Controls"
            className="relative z-10 w-full max-w-sm max-h-[85vh] bg-[#221b1d] text-[#fbf5f0] rounded-2xl border border-[#e06836]/40 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#423436] shrink-0">
              <h2 className="text-sm font-semibold text-[#fdf8f4]">Mars Colony Controls</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close Controls"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#b8a69e] hover:bg-[#382b2e] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-5 overflow-y-auto">
              {/* 1. Mars Base Identity & Live Stats */}
              <section className="flex flex-col gap-1.5 pb-3 border-b border-[#423436]">
                <div className="flex items-center justify-between gap-2">
                  {isEditingName ? (
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={worldState.planetName}
                      maxLength={28}
                      onChange={(e) =>
                        setWorldState((prev) => ({
                          ...prev,
                          planetName: e.target.value,
                        }))
                      }
                      onBlur={() => {
                        if (!worldState.planetName.trim()) {
                          setWorldState((prev) => ({
                            ...prev,
                            planetName: 'Ares Prime',
                          }));
                        }
                        setIsEditingName(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          nameInputRef.current?.blur();
                        }
                      }}
                      aria-label="Base Name"
                      className="w-full px-2 py-0.5 text-lg font-semibold bg-[#322728] border border-[#e06836]/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#e06836]"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="group flex items-center gap-1.5 text-left cursor-pointer focus:outline-none"
                      title="Click to rename Mars base"
                    >
                      <h3 className="text-lg font-semibold tracking-tight text-[#fdf8f4] group-hover:text-[#fca47a] transition-colors">
                        {worldState.planetName}
                      </h3>
                      <Pencil className="w-3.5 h-3.5 text-[#b8a69e] opacity-70 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>

                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#d6c7be] font-mono-tabular">
                  <span>
                    Colonists <strong className="font-semibold text-white">{worldState.population}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Biosphere <strong className="font-semibold text-[#59df8a]">{worldState.happiness}%</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Sol <strong className="font-semibold text-[#fca47a]">{worldState.dayCount}</strong>
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-[#b8a69e] font-mono-tabular pt-0.5">
                  <span>{worldState.objectCounts.houses} Domes</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.trees} Bio-Flora</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.boats} Rovers</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.sheep} Robodogs</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.clouds} Dust Devils</span>
                </div>
              </section>

              {/* 2. Primary Actions: Expand Base & 30s Mars Tour */}
              <section className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGrow}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#fdf8f4] bg-[#a8441f] hover:bg-[#b84e26] border border-[#e06836] rounded-xl transition-colors cursor-pointer shadow-sm"
                  title="Expand base with new Hab Domes, pipelines, and terra-flora"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Expand Base</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleTour}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl border bg-[#332629] text-[#fca47a] border-[#e06836]/40 hover:bg-[#423236] transition-colors cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-[#e06836]" />
                  <span>30s Tour</span>
                </button>
              </section>

              {/* 3. Camera Views */}
              <section className="flex flex-col gap-1.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#d6c7be]">
                  Camera Perspective
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'orb', label: 'Orb Specimen' },
                      { id: 'village', label: 'Ares Colony' },
                      { id: 'surface', label: 'Olympus Mons' },
                      { id: 'orbit', label: 'Orbit' },
                    ] as { id: CameraViewId; label: string }[]
                  ).map((v) => {
                    const active = worldState.activeView === v.id && !worldState.tourActive;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectView(v.id)}
                        className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#e06836]/25 text-[#fca47a] border-[#e06836] shadow-sm'
                            : 'bg-[#322728] border-transparent text-[#d6c7be] hover:bg-[#403133] hover:text-white'
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 4. Sol Lighting & Martian Sky */}
              <section className="flex flex-col gap-1.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#d6c7be]">
                  Sol Lighting & Sky
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      {
                        id: 'auto',
                        label: 'Sol Cycle',
                        icon: <Compass className="w-3.5 h-3.5" />,
                      },
                      {
                        id: 'day',
                        label: 'Butterscotch',
                        icon: <Sun className="w-3.5 h-3.5 text-[#e5a84b]" />,
                      },
                      {
                        id: 'twilight',
                        label: 'Blue Sunset',
                        icon: <Sunset className="w-3.5 h-3.5 text-[#65d6ff]" />,
                      },
                      {
                        id: 'night',
                        label: 'Deep Cosmos',
                        icon: <Moon className="w-3.5 h-3.5 text-[#c4b5e0]" />,
                      },
                    ] as { id: TimeMode; label: string; icon: React.ReactNode }[]
                  ).map((m) => {
                    const active = worldState.timeMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectTimeMode(m.id)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#3e2d30] text-[#fca47a] border-[#e06836] shadow-sm'
                            : 'bg-[#322728] border-transparent text-[#d6c7be] hover:bg-[#403133] hover:text-white'
                        }`}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Ares Atmospheric Telemetry & Dust Storm Warning Center Dialog */}
      {notificationCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setNotificationCenterOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ares Environmental Telemetry & Dust Storm Warning Center"
            className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-[#20181a] border border-[#e06836]/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#fbf6f2]"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#3d2f32] bg-[#271d20] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#e06836]/20 border border-[#e06836]/40 text-[#fca47a]">
                  <Radio className="w-5 h-5 shrink-0 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white tracking-wide">
                    Ares Atmospheric Telemetry // Dust Storm Warning System
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#d6c7be] mt-0.5">
                    <span>Sol {worldState.dayCount}</span>
                    <span>·</span>
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        isWeatherActive ? 'text-[#ff9562]' : 'text-[#8ee29c]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isWeatherActive ? 'bg-[#e06836] animate-ping' : 'bg-[#35c960]'
                        }`}
                      />
                      {isWeatherActive
                        ? 'WEATHER SENSORS ACTIVE (Periodic Alerts Engaged)'
                        : 'STANDBY (Select weather tools to activate)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  title={isAudioMuted ? 'Unmute Audio Telemetry Chimes' : 'Mute Audio Telemetry'}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                    isAudioMuted
                      ? 'bg-[#322728] border-[#4a3937] text-[#9c8983]'
                      : 'bg-[#47221a] border-[#e06836]/60 text-[#ffb088]'
                  }`}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setNotificationCenterOpen(false)}
                  aria-label="Close Warning Center"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#322728] border border-[#4a3937] text-[#b8a69e] hover:text-white hover:bg-[#403133] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Biosphere Atmospheric Real-Time Telemetry Dashboard */}
            <div className="p-5 overflow-y-auto flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#2a2022] rounded-2xl border border-[#4a3937] flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#b8a69e]">
                    Optical Depth (τ)
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold font-mono-tabular text-white">
                      {currentTau.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        currentTau > 3.0
                          ? 'text-rose-400 font-bold'
                          : currentTau > 1.5
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {currentTau > 3.0 ? 'Extreme' : currentTau > 1.5 ? 'Gale Haze' : 'Nominal'}
                    </span>
                  </div>
                  <div className="w-full bg-[#1c1416] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentTau > 3.0
                          ? 'bg-rose-500'
                          : currentTau > 1.5
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (currentTau / 5.5) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#2a2022] rounded-2xl border border-[#4a3937] flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#b8a69e]">
                    Peak Wind Gusts
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono-tabular text-[#fca47a]">
                      {currentWind.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono text-[#d6c7be]">m/s</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#b8a69e] mt-1">
                    {(currentWind * 3.6).toFixed(0)} km/h cyclonic
                  </span>
                </div>

                <div className="p-3 bg-[#2a2022] rounded-2xl border border-[#4a3937] flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#b8a69e]">
                    Atmospheric Vortices
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono-tabular text-white">
                      {worldState.objectCounts.clouds}
                    </span>
                    <span className="text-xs font-mono text-[#d6c7be]">Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#b8a69e] mt-1">
                    {worldState.objectCounts.clouds > 0
                      ? 'Dust devils in biosphere'
                      : 'Clear atmosphere'}
                  </span>
                </div>

                <div className="p-3 bg-[#2a2022] rounded-2xl border border-[#4a3937] flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#b8a69e]">
                    Biosphere Condition
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono-tabular text-[#59df8a]">
                      {worldState.happiness}%
                    </span>
                    <span className="text-xs font-mono text-[#59df8a]">O₂ Safe</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#b8a69e] mt-1">
                    {worldState.population} Colonists Sheltered
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#3d2f32]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => dispatchDustAlert()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e06836] hover:bg-[#eb7644] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Trigger Weather Scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      controllerRef.current?.setTool('cloud');
                      setWorldState((prev) => ({ ...prev, activeTool: 'cloud' }));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#35292c] hover:bg-[#423438] text-[#fca47a] border border-[#e06836]/40 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Summon Dust Devil</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#b8a69e] hover:text-white transition-colors cursor-pointer"
                  >
                    Mark All Read
                  </button>
                  <span className="text-[#4a3937]">·</span>
                  <button
                    type="button"
                    onClick={handleClearAlerts}
                    className="text-xs text-[#b8a69e] hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear Feed
                  </button>
                </div>
              </div>

              {/* Severity Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
                {(
                  [
                    { id: 'all', label: `All Alerts (${alerts.length})` },
                    { id: 'critical', label: 'Critical' },
                    { id: 'severe', label: 'Severe' },
                    { id: 'warning', label: 'Warnings' },
                    { id: 'advisory', label: 'Advisories' },
                    { id: 'resolved', label: 'Resolved' },
                  ] as { id: DustStormSeverity | 'all'; label: string }[]
                ).map((tab) => {
                  const active = severityFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSeverityFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                        active
                          ? 'bg-[#e06836] text-white shadow-sm'
                          : 'bg-[#2a2022] text-[#c9b7ad] hover:bg-[#382b2e] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Alerts Log Feed */}
              <div className="flex flex-col gap-2.5">
                {filteredAlerts.length === 0 ? (
                  <div className="p-8 text-center bg-[#251d20] rounded-2xl border border-dashed border-[#4a3937] text-[#b8a69e] flex flex-col items-center gap-2">
                    <Cloud className="w-8 h-8 text-[#544347]" />
                    <p className="text-sm font-medium text-white">No Dust Storm Alerts Found</p>
                    <p className="text-xs max-w-sm text-[#b8a69e]">
                      Summon a Dust Devil, CO2 Ice Cloud, or select a weather tool to activate
                      continuous Martian atmospheric telemetry scanning.
                    </p>
                    <button
                      type="button"
                      onClick={() => dispatchDustAlert('warning')}
                      className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#a8441f] text-white text-xs font-semibold hover:bg-[#b84e26] transition-colors cursor-pointer"
                    >
                      Simulate Dust Storm Event
                    </button>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const meta = getSeverityMeta(alert.severity);
                    return (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-2xl border bg-gradient-to-br ${meta.bgGradient} ${meta.borderClass} shadow-md flex flex-col gap-2 transition-all`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${meta.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                              {meta.label}
                            </span>
                            <span className="text-xs font-mono text-[#ecd8cb]">
                              Sol {alert.sol} · {alert.marsTime}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-[#b8a69e]">
                            {alert.triggerSource}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-white tracking-wide">
                            {alert.title}
                          </h4>
                          <p className="text-xs text-[#ebdcd1] mt-0.5 leading-relaxed">
                            {alert.message}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                          <div className="flex items-center gap-2 font-mono text-[11px] text-[#ecd8cb]">
                            <span>
                              Region: <strong className="text-white">{alert.region}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Wind:{' '}
                              <strong className="text-[#fca47a]">{alert.windSpeed} m/s</strong>
                            </span>
                            <span>·</span>
                            <span>
                              τ: <strong className="text-[#fca47a]">{alert.tau}</strong>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              handleFocusRegion(alert.region);
                              setNotificationCenterOpen(false);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>Focus in 3D</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar: Filters Button + Scrollable Row of Square Icon Tool Buttons */}
      {!worldState.tourActive && (
        <div
          aria-label="Mobile Mars tool dock"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#221b1d]/95 backdrop-blur-md border-t border-[#423436] px-3 py-2.5 flex items-center gap-2.5"
        >
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="h-11 px-3.5 shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-[#e06836] text-[#fff8f2] border border-[#ff8855] text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
            aria-label="Open Colony Controls"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
            <span>Base</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNotificationCenterOpen(true);
              handleMarkAllRead();
            }}
            aria-label="Open Dust Storm Alerts"
            className={`h-11 w-11 shrink-0 flex items-center justify-center rounded-xl border transition-colors cursor-pointer relative ${
              isWeatherActive
                ? 'bg-[#47221a] border-[#e06836] text-[#ffab82]'
                : 'bg-[#322728] border-[#4a3937] text-[#e0cfc5]'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#e06836] animate-pulse" />
            )}
          </button>

          <div
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 pr-1"
            role="toolbar"
            aria-label="Mars tools"
          >
            {orderedTools.map((tool) => {
              const isSelected = worldState.activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  title={tool.label}
                  aria-label={tool.label}
                  className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? `${tool.accentBg} ${tool.accentBorder} ${tool.accentText} shadow-md`
                      : 'bg-[#322728] border-[#4a3937] text-[#e0cfc5] hover:bg-[#403133] hover:text-white'
                  }`}
                >
                  {renderToolIcon(tool.id)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet for Filters */}
      {!worldState.tourActive && filtersOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mars Colony Controls"
            className="relative z-10 w-full max-h-[80vh] bg-[#221b1d] text-[#fbf5f0] rounded-t-3xl border-t border-[#e06836]/40 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="w-10 h-1.5 bg-[#524143] rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#423436] shrink-0">
              <h2 className="text-sm font-semibold text-[#fdf8f4]">Mars Colony Controls</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close Controls"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#b8a69e] hover:bg-[#382b2e] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-5 overflow-y-auto">
              {/* Mars Base Identity & Stats */}
              <section className="flex flex-col gap-1.5 pb-3 border-b border-[#423436]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-white">
                    {worldState.planetName}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#d6c7be] font-mono-tabular">
                    <span>
                      Colonists <strong className="font-semibold text-white">{worldState.population}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Biosphere <strong className="font-semibold text-[#59df8a]">{worldState.happiness}%</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Sol <strong className="font-semibold text-[#fca47a]">{worldState.dayCount}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-[#b8a69e] font-mono-tabular">
                  <span>{worldState.objectCounts.houses} Domes</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.trees} Bio-Flora</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.boats} Rovers</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.sheep} Robodogs</span>
                  <span aria-hidden="true">·</span>
                  <span>{worldState.objectCounts.clouds} Dust Devils</span>
                </div>
              </section>

              {/* Primary Actions: Expand Base & 30s Mars Tour */}
              <section className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGrow}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-[#a8441f] hover:bg-[#b84e26] border border-[#e06836] rounded-xl transition-colors cursor-pointer"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Expand Base</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleTour}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl border bg-[#332629] text-[#fca47a] border-[#e06836]/40 hover:bg-[#423236] transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#e06836]" />
                  <span>30s Tour</span>
                </button>
              </section>

              {/* Camera Perspective */}
              <section className="flex flex-col gap-1.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#d6c7be]">
                  Camera Perspective
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'orb', label: 'Orb Specimen' },
                      { id: 'village', label: 'Ares Colony' },
                      { id: 'surface', label: 'Olympus Mons' },
                      { id: 'orbit', label: 'Orbit' },
                    ] as { id: CameraViewId; label: string }[]
                  ).map((v) => {
                    const active = worldState.activeView === v.id && !worldState.tourActive;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectView(v.id)}
                        className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#e06836]/25 text-[#fca47a] border-[#e06836] shadow-sm'
                            : 'bg-[#322728] border-transparent text-[#d6c7be] hover:bg-[#403133] hover:text-white'
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Sol Lighting & Sky */}
              <section className="flex flex-col gap-1.5 pb-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#d6c7be]">
                  Sol Lighting & Sky
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      {
                        id: 'auto',
                        label: 'Sol Cycle',
                        icon: <Compass className="w-3.5 h-3.5" />,
                      },
                      {
                        id: 'day',
                        label: 'Butterscotch',
                        icon: <Sun className="w-3.5 h-3.5 text-[#e5a84b]" />,
                      },
                      {
                        id: 'twilight',
                        label: 'Blue Sunset',
                        icon: <Sunset className="w-3.5 h-3.5 text-[#65d6ff]" />,
                      },
                      {
                        id: 'night',
                        label: 'Deep Cosmos',
                        icon: <Moon className="w-3.5 h-3.5 text-[#c4b5e0]" />,
                      },
                    ] as { id: TimeMode; label: string; icon: React.ReactNode }[]
                  ).map((m) => {
                    const active = worldState.timeMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectTimeMode(m.id)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#3e2d30] text-[#fca47a] border-[#e06836] shadow-sm'
                            : 'bg-[#322728] border-transparent text-[#d6c7be] hover:bg-[#403133] hover:text-white'
                        }`}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
