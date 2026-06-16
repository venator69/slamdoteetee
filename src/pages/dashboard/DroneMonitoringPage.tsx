import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPose } from "../../dashboard/api";
import { drawPoseMap } from "../../dashboard/drawMap";
import { MovingAveragePoseFilter } from "../../dashboard/poseFilter";
import type { PoseSample } from "../../dashboard/types";

const MAX_TRAIL_POINTS = 200;
const POLL_MS = 200;
const DISPLAY_MS = 1000;

function statusColor(status: string) {
  if (status === "Live") return "#22c55e";
  if (status === "Stale") return "#f97316";
  return "#ef4444";
}

export function DroneMonitoringPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef(new MovingAveragePoseFilter(1000));
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const [pose, setPose] = useState<PoseSample | null>(null);
  const [status, setStatus] = useState("Waiting...");
  const [frameId, setFrameId] = useState("—");

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchPose();
        if (cancelled) return;

        if (!data.ros_enabled) {
          setStatus("ROS disabled");
          return;
        }

        if (
          data.status === "live" &&
          data.x !== undefined &&
          data.y !== undefined &&
          data.z !== undefined &&
          data.yaw_deg !== undefined
        ) {
          filterRef.current.add({
            x: data.x,
            y: data.y,
            z: data.z,
            yaw: data.yaw_deg,
          });
          setStatus("Receiving");
          setFrameId(data.frame_id || "odom");
        } else if (data.status === "stale") {
          setStatus("Stale");
        } else {
          setStatus("No data");
        }
      } catch {
        if (!cancelled) {
          setStatus("API error");
        }
      }
    };

    const pollTimer = window.setInterval(() => void poll(), POLL_MS);
    void poll();

    const displayTimer = window.setInterval(() => {
      const averaged = filterRef.current.getAverage();
      if (!averaged) {
        return;
      }

      setPose(averaged);
      trailRef.current.push({ x: averaged.x, y: averaged.y });
      if (trailRef.current.length > MAX_TRAIL_POINTS) {
        trailRef.current.shift();
      }

      const canvas = canvasRef.current;
      if (canvas) {
        drawPoseMap(canvas, {
          trail: trailRef.current,
          pose: averaged,
        });
      }

      setStatus("Live");
    }, DISPLAY_MS);

    return () => {
      cancelled = true;
      window.clearInterval(pollTimer);
      window.clearInterval(displayTimer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pose) {
      return;
    }

    drawPoseMap(canvas, {
      trail: trailRef.current,
      pose,
    });
  }, [pose]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/dashboard"
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Drone Monitoring</h1>
          <p className="mt-1 text-sm text-slate-600">
            Map and pose smoothed with a 1s moving average.
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          Pose:{" "}
          <span style={{ color: statusColor(status) }}>{status}</span>
        </div>
      </div>

      {pose && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "X (m)", value: pose.x.toFixed(3) },
            { label: "Y (m)", value: pose.y.toFixed(3) },
            { label: "Z (m)", value: pose.z.toFixed(3) },
            { label: "Yaw (°)", value: pose.yaw.toFixed(1) },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
            >
              <div className="text-xs text-slate-500">{metric.label}</div>
              <div className="font-mono text-lg font-semibold text-slate-900">{metric.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          className="h-[min(70vh,480px)] w-full rounded-xl bg-[#111827]"
        />
        <p className="mt-3 text-xs text-slate-500">
          Top-down pose from <code>/odom</code>. Frame: {frameId}. Display refresh: 1s.
        </p>
      </div>
    </div>
  );
}
