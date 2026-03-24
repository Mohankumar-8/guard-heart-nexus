import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronDown } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CameraOption {
  id: string;
  label: string;
  resolution: string;
  boxes: { id: number; x: number; y: number; w: number; h: number; label: string }[];
}

const cameraOptions: CameraOption[] = [
  {
    id: "cam1",
    label: "Camera 1 — Entrance",
    resolution: "1920×1080 · 30fps",
    boxes: [
      { id: 1, x: 12, y: 28, w: 8, h: 18, label: "P-01" },
      { id: 2, x: 35, y: 32, w: 7, h: 16, label: "P-02" },
      { id: 3, x: 55, y: 25, w: 9, h: 20, label: "P-03" },
      { id: 4, x: 75, y: 30, w: 7, h: 17, label: "P-04" },
      { id: 5, x: 22, y: 50, w: 8, h: 19, label: "P-05" },
      { id: 6, x: 62, y: 55, w: 7, h: 15, label: "P-06" },
      { id: 7, x: 45, y: 45, w: 8, h: 18, label: "P-07" },
    ],
  },
  {
    id: "cam2",
    label: "Camera 2 — Hall",
    resolution: "1280×720 · 25fps",
    boxes: [
      { id: 1, x: 10, y: 20, w: 9, h: 20, label: "P-01" },
      { id: 2, x: 30, y: 40, w: 8, h: 17, label: "P-02" },
      { id: 3, x: 50, y: 22, w: 7, h: 19, label: "P-03" },
      { id: 4, x: 70, y: 48, w: 8, h: 16, label: "P-04" },
      { id: 5, x: 42, y: 60, w: 7, h: 15, label: "P-05" },
    ],
  },
  {
    id: "cam3",
    label: "Camera 3 — Exit",
    resolution: "1920×1080 · 30fps",
    boxes: [
      { id: 1, x: 18, y: 35, w: 8, h: 18, label: "P-01" },
      { id: 2, x: 40, y: 28, w: 7, h: 16, label: "P-02" },
      { id: 3, x: 65, y: 40, w: 9, h: 20, label: "P-03" },
      { id: 4, x: 80, y: 55, w: 7, h: 15, label: "P-04" },
    ],
  },
];

const LiveCameraFeed = () => {
  const [time, setTime] = useState(new Date());
  const [selectedCam, setSelectedCam] = useState("cam1");
  const [animKey, setAnimKey] = useState(0);

  const camera = useMemo(
    () => cameraOptions.find((c) => c.id === selectedCam)!,
    [selectedCam]
  );

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCameraChange = (value: string) => {
    setSelectedCam(value);
    setAnimKey((k) => k + 1);
  };

  const timestamp = time.toLocaleTimeString("en-US", { hour12: false });

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          Live Camera Feed
        </h2>
        <div className="flex items-center gap-3">
          <Select value={selectedCam} onValueChange={handleCameraChange}>
            <SelectTrigger className="h-7 w-[180px] text-[11px] bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cameraOptions.map((cam) => (
                <SelectItem key={cam.id} value={cam.id} className="text-xs">
                  {cam.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[11px] font-bold uppercase tracking-wider live-badge">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border/50">
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
          }}
        />

        {/* Slight vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Simulated scene background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,15%,8%)] via-[hsl(220,12%,12%)] to-[hsl(220,10%,6%)]" />

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] z-10" preserveAspectRatio="none">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v${i}`} x1={`${i * 5}%`} y1="0%" x2={`${i * 5}%`} y2="100%" stroke="white" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0%" y1={`${i * 8.3}%`} x2="100%" y2={`${i * 8.3}%`} stroke="white" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Bounding boxes — re-animate on camera switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {camera.boxes.map((box) => (
              <motion.div
                key={box.id}
                className="absolute border border-primary rounded-sm"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, delay: box.id * 0.15 }}
              >
                <span className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-primary" />
                <span className="absolute -top-px -right-px w-2 h-2 border-t-2 border-r-2 border-primary" />
                <span className="absolute -bottom-px -left-px w-2 h-2 border-b-2 border-l-2 border-primary" />
                <span className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-primary" />
                <span className="absolute -top-4 left-0 text-[9px] font-mono bg-primary/80 text-primary-foreground px-1 rounded-sm leading-tight">
                  {box.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* HUD — top left */}
        <div className="absolute top-3 left-3 z-30 space-y-0.5">
          <p className="text-[10px] font-mono text-primary/90 leading-none">{camera.label}</p>
          <p className="text-[10px] font-mono text-muted-foreground leading-none">RES {camera.resolution}</p>
        </div>

        {/* HUD — top right */}
        <div className="absolute top-3 right-3 z-30">
          <p className="text-[10px] font-mono text-primary/90 tabular-nums">{timestamp}</p>
        </div>

        {/* HUD — bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/60 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-mono text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              REC
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">AI Detection: ON</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Detected: <span className="text-foreground font-semibold">{camera.boxes.length}</span> persons
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveCameraFeed;
