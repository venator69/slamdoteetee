import type { PoseSample, SemanticObject } from "./types";

const CLASS_COLORS: Record<string, string> = {
  person: "#f97316",
  bottle: "#38bdf8",
  chair: "#a78bfa",
  laptop: "#22c55e",
  cup: "#eab308",
  backpack: "#ec4899",
};

export function classColor(name: string) {
  return CLASS_COLORS[name] ?? "#94a3b8";
}

type MapPoint = { x: number; y: number };

type DrawMapOptions = {
  trail: MapPoint[];
  pose: PoseSample | null;
  semanticObjects?: SemanticObject[];
  includeSemantic?: boolean;
  placeholder?: string;
};

export function drawPoseMap(
  canvas: HTMLCanvasElement,
  {
    trail,
    pose,
    semanticObjects = [],
    includeSemantic = false,
    placeholder = "Waiting for map data...",
  }: DrawMapOptions,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, w, h);

  const points: MapPoint[] = [...trail];
  if (pose) {
    points.push({ x: pose.x, y: pose.y });
  }
  if (includeSemantic) {
    semanticObjects.forEach((obj) => {
      points.push({ x: obj.x, y: obj.y });
    });
  }

  if (points.length === 0) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(placeholder, w / 2, h / 2);
    return;
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  const pad = 28;
  const spanX = Math.max(maxX - minX, 0.8);
  const spanY = Math.max(maxY - minY, 0.8);

  const toCanvas = (x: number, y: number) => ({
    cx: pad + ((x - minX) / spanX) * (w - pad * 2),
    cy: h - pad - ((y - minY) / spanY) * (h - pad * 2),
  });

  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.moveTo(pad, h - pad);
  ctx.lineTo(pad, pad);
  ctx.stroke();

  if (includeSemantic) {
    semanticObjects.forEach((obj) => {
      const pt = toCanvas(obj.x, obj.y);
      const color = classColor(obj.class);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pt.cx, pt.cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f9fafb";
      ctx.font = "11px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`#${obj.id} ${obj.class}`, pt.cx + 10, pt.cy + 4);
    });
  }

  if (trail.length > 0) {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    trail.forEach((point, index) => {
      const pt = toCanvas(point.x, point.y);
      if (index === 0) {
        ctx.moveTo(pt.cx, pt.cy);
      } else {
        ctx.lineTo(pt.cx, pt.cy);
      }
    });
    ctx.stroke();
  }

  if (pose) {
    const head = toCanvas(pose.x, pose.y);
    const yawRad = (pose.yaw * Math.PI) / 180;
    const arrowLen = 18;
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(head.cx, head.cy);
    ctx.lineTo(
      head.cx + Math.cos(yawRad) * arrowLen,
      head.cy - Math.sin(yawRad) * arrowLen,
    );
    ctx.stroke();
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(head.cx, head.cy, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
