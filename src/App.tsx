import React, { useEffect, useRef, useState } from 'react';
import {
  Anchor,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bird,
  Bug,
  Castle,
  Cloud,
  CloudSnow,
  Compass,
  Eraser,
  Fan,
  Flame,
  Flower2,
  LampFloor,
  Moon,
  Mountain,
  Pencil,
  Play,
  Rainbow,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Sun,
  Sunset,
  TowerControl,
  Trees,
  Waves,
  Wind,
  X,
} from 'lucide-react';
import { PocketWorldController } from './three/PocketWorldScene';
import {
  CameraViewId,
  TimeMode,
  TOOL_DEFINITIONS,
  ToolCategory,
  ToolId,
  WorldState,
} from './types/world';

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

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<PocketWorldController | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

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
    if (!filtersOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtersOpen]);

  const handleSelectTool = (tool: ToolId) => {
    controllerRef.current?.setTool(tool);
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
    if (worldState.tourActive) {
      controllerRef.current?.stopTour();
    } else {
      controllerRef.current?.startTour();
    }
  };

  const orderedTools = TOOL_GROUPS.flatMap((group) =>
    TOOL_DEFINITIONS.filter((t) => t.category === group.category),
  );

  return (
    <div className="flex w-screen h-screen overflow-hidden select-none bg-[#181416]">
      {/* 3D Three.js Canvas Viewport */}
      <div className="relative flex-1 min-w-0 h-full">
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D Pocket Mars Terrarium Biosphere"
        />

        {/* Mars Top Info Header Overlay */}
        {!worldState.tourActive && (
          <header className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#2a2221]/90 border border-[#e08a65]/30 text-[#fbf6f2] px-3.5 py-2 rounded-2xl shadow-lg backdrop-blur-md">
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
                <span>Colonists: <strong className="text-white">{worldState.population}</strong></span>
                <span>·</span>
                <span>O₂ Biosphere: <strong className="text-[#59df8a]">{worldState.happiness}%</strong></span>
                <span>·</span>
                <span>Sol: <strong className="text-[#fca47a]">{worldState.dayCount}</strong></span>
              </div>
            </div>
          </header>
        )}

        {/* Cinematic 30s Mars Tour Subtitle Banner */}
        {worldState.tourActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 px-5 py-2.5 bg-[#1f1a1d]/95 border border-[#e06836]/40 rounded-2xl shadow-2xl backdrop-blur-md max-w-lg text-center animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#fca47a]">
              <span className="w-2 h-2 rounded-full bg-[#e06836] animate-pulse" />
              <span>Ares Expedition // 30s Cinematic Tour</span>
              <span className="text-[11px] font-mono text-white/80">({Math.max(1, Math.ceil(30 - worldState.tourElapsed))}s)</span>
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

          <div className="w-8 h-px bg-[#453635] shrink-0" aria-hidden="true" />

          <div
            className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto no-scrollbar py-0.5"
            role="toolbar"
            aria-orientation="vertical"
            aria-label="Mars terraforming and colony tools"
          >
            {orderedTools.map((tool) => {
              const isSelected = worldState.activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  title={`${tool.label} — ${tool.description}`}
                  aria-label={tool.label}
                  className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? `${tool.accentBg} ${tool.accentBorder} ${tool.accentText} shadow-md scale-105`
                      : 'bg-[#322728] border-[#4a3937] text-[#e0cfc5] hover:bg-[#423234] hover:text-[#ffffff]'
                  }`}
                >
                  {renderToolIcon(tool.id)}
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
                    <span>Colonists <strong className="font-semibold text-white">{worldState.population}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Biosphere <strong className="font-semibold text-[#59df8a]">{worldState.happiness}%</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Sol <strong className="font-semibold text-[#fca47a]">{worldState.dayCount}</strong></span>
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
