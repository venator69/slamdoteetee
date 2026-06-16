import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRobotWebSocketUrl } from "../../config/dashboard";
import { fetchPose, fetchSemantic, getYoloStreamUrl } from "../../dashboard/api";
import { classColor, drawPoseMap } from "../../dashboard/drawMap";
import type { PoseSample, SemanticObject } from "../../dashboard/types";

const MAX_TRAIL_POINTS = 200;

function StatusPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      {label}: <span style={{ color }}>{value}</span>
    </div>
  );
}

function HoldButton({
  label,
  startCmd,
  stopCmd,
  onSend,
  className = "",
}: {
  label: string;
  startCmd: string;
  stopCmd: string;
  onSend: (cmd: string) => void;
  className?: string;
}) {
  const activeRef = useRef(false);

  const stop = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    onSend(stopCmd);
  }, [onSend, stopCmd]);

  const start = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (activeRef.current) return;
      activeRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      onSend(startCmd);
    },
    [onSend, startCmd],
  );

  return (
    <button
      type="button"
      className={`rounded-xl bg-slate-700 px-4 py-4 text-base font-bold text-white transition hover:bg-slate-600 active:scale-[0.97] active:bg-slate-800 ${className}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );
}

export function RobotMonitoringPage() {
  const poseCanvasRef = useRef<HTMLCanvasElement>(null);
  const semanticCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const speedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const latestPoseRef = useRef<PoseSample | null>(null);
  const semanticRef = useRef<SemanticObject[]>([]);

  const [wsStatus, setWsStatus] = useState("Connecting...");
  const [poseStatus, setPoseStatus] = useState("Waiting...");
  const [yoloStatus, setYoloStatus] = useState("Waiting...");
  const [semanticStatus, setSemanticStatus] = useState("Waiting...");
  const [poseMetrics, setPoseMetrics] = useState({
    x: "—",
    y: "—",
    z: "—",
    yaw: "—",
    frame: "—",
  });
  const [semanticObjects, setSemanticObjects] = useState<SemanticObject[]>([]);
  const [semanticSource, setSemanticSource] = useState("—");
  const [yoloSrc, setYoloSrc] = useState("");
  const [yoloError, setYoloError] = useState(false);
  const [motorSpeed, setMotorSpeed] = useState(180);
  const [imu, setImu] = useState({
    ax: "0",
    ay: "0",
    az: "0",
    gx: "0",
    gy: "0",
    gz: "0",
    temp: "0",
  });
  const [servo, setServo] = useState({
    base: "90.0°",
    joint1: "155.0°",
    joint2: "20.0°",
    gripper: "20.0°",
  });

  const sendCmd = useCallback((cmd: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(cmd);
    }
  }, []);

  const emergencyStop = useCallback(() => {
    sendCmd("all_stop");
  }, [sendCmd]);

  const redrawMaps = useCallback(() => {
    const poseCanvas = poseCanvasRef.current;
    const semanticCanvas = semanticCanvasRef.current;
    if (poseCanvas) {
      drawPoseMap(poseCanvas, {
        trail: trailRef.current,
        pose: latestPoseRef.current,
      });
    }
    if (semanticCanvas) {
      drawPoseMap(semanticCanvas, {
        trail: trailRef.current,
        pose: latestPoseRef.current,
        semanticObjects: semanticRef.current,
        includeSemantic: true,
      });
    }
  }, []);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(getRobotWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus("Connected");
        sendCmd("status");
      };

      ws.onclose = () => {
        setWsStatus("Disconnected, reconnecting...");
        window.setTimeout(connect, 1000);
      };

      ws.onerror = () => {
        setWsStatus("Error");
      };

      ws.onmessage = (event) => {
        const msg = String(event.data);

        if (msg.startsWith("imu:")) {
          const data = msg.substring(4).split(",");
          if (data[0] === "--") {
            setImu({
              ax: "N/A",
              ay: "N/A",
              az: "N/A",
              gx: "N/A",
              gy: "N/A",
              gz: "N/A",
              temp: "N/A",
            });
            return;
          }
          setImu({
            ax: data[0],
            ay: data[1],
            az: data[2],
            gx: data[3],
            gy: data[4],
            gz: data[5],
            temp: data[6],
          });
        }

        if (msg.startsWith("servo:")) {
          const data = msg.substring(6).split(",");
          setServo({
            base: `${data[0]}°`,
            joint1: `${data[1]}°`,
            joint2: `${data[2]}°`,
            gripper: `${data[3]}°`,
          });
        }

        if (msg.startsWith("speed:")) {
          setMotorSpeed(Number(msg.substring(6)));
        }
      };
    };

    connect();

    const onBlur = () => emergencyStop();
    const onVisibility = () => {
      if (document.hidden) emergencyStop();
    };

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      wsRef.current?.close();
    };
  }, [emergencyStop, sendCmd]);

  useEffect(() => {
    setYoloSrc(getYoloStreamUrl());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const pollPose = async () => {
      try {
        const data = await fetchPose();
        if (cancelled) return;

        if (!data.ros_enabled) {
          setPoseStatus("ROS disabled");
          setYoloStatus("ROS disabled");
          return;
        }

        if (data.status === "live" && data.x !== undefined && data.y !== undefined) {
          setPoseStatus("Live");
          setPoseMetrics({
            x: data.x.toFixed(3),
            y: data.y.toFixed(3),
            z: (data.z ?? 0).toFixed(3),
            yaw: (data.yaw_deg ?? 0).toFixed(1),
            frame: data.frame_id || "odom",
          });
          latestPoseRef.current = {
            x: data.x,
            y: data.y,
            z: data.z ?? 0,
            yaw: data.yaw_deg ?? 0,
          };
          trailRef.current.push({ x: data.x, y: data.y });
          if (trailRef.current.length > MAX_TRAIL_POINTS) {
            trailRef.current.shift();
          }
          redrawMaps();
        } else if (data.status === "stale") {
          setPoseStatus("Stale");
        } else {
          setPoseStatus("No data");
        }

        if (data.yolo_live) {
          const fpsText =
            data.yolo_fps && data.yolo_fps > 0
              ? `${data.yolo_fps.toFixed(1)} FPS`
              : "Live";
          setYoloStatus(fpsText);
        } else {
          setYoloStatus("No stream");
        }
      } catch {
        if (!cancelled) setPoseStatus("API error");
      }
    };

    const pollSemantic = async () => {
      try {
        const data = await fetchSemantic();
        if (cancelled) return;

        if (!data.ros_enabled && data.source === "none") {
          setSemanticStatus("ROS disabled");
          return;
        }

        const objects = data.objects ?? [];
        semanticRef.current = objects;
        setSemanticObjects(objects);
        setSemanticSource(data.source || "—");
        redrawMaps();

        if (data.status === "live") {
          const count = data.count ?? objects.length;
          setSemanticStatus(`${count} landmark${count === 1 ? "" : "s"}`);
        } else if (data.status === "empty") {
          setSemanticStatus("Empty");
        } else if (data.status === "stale") {
          setSemanticStatus("Stale");
        } else {
          setSemanticStatus("No data");
        }
      } catch {
        if (!cancelled) setSemanticStatus("API error");
      }
    };

    const poseTimer = window.setInterval(() => void pollPose(), 500);
    const semanticTimer = window.setInterval(() => void pollSemantic(), 1000);
    void pollPose();
    void pollSemantic();
    redrawMaps();

    return () => {
      cancelled = true;
      window.clearInterval(poseTimer);
      window.clearInterval(semanticTimer);
    };
  }, [redrawMaps]);

  const wsColor = wsStatus === "Connected" ? "#22c55e" : wsStatus.includes("Error") ? "#f97316" : "#ef4444";
  const poseColor = poseStatus === "Live" ? "#22c55e" : poseStatus === "Stale" ? "#f97316" : "#ef4444";
  const yoloColor = yoloStatus.includes("FPS") || yoloStatus === "Live" ? "#22c55e" : "#ef4444";
  const semanticColor =
    semanticStatus.includes("landmark") ? "#22c55e" : semanticStatus === "Empty" || semanticStatus === "Stale" ? "#f97316" : "#ef4444";

  const legendClasses = [...new Set(semanticObjects.map((obj) => obj.class))];

  return (
    <div>
      <div className="mb-4">
        <Link to="/dashboard" className="text-sm text-slate-500 transition hover:text-slate-900">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Robot Control
        </h1>
      </div>

      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <StatusPill label="ESP32 WebSocket" value={wsStatus} color={wsColor} />
        <StatusPill label="Position" value={poseStatus} color={poseColor} />
        <StatusPill label="YOLO" value={yoloStatus} color={yoloColor} />
        <StatusPill label="Semantic map" value={semanticStatus} color={semanticColor} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">YOLO Detection</h2>
          <div className="relative min-h-[220px] overflow-hidden rounded-xl bg-black">
            {yoloSrc && (
              <img
                src={yoloSrc}
                alt="YOLO annotated camera feed"
                className="block min-h-[220px] w-full object-contain"
                onLoad={() => setYoloError(false)}
                onError={() => {
                  setYoloError(true);
                  window.setTimeout(() => setYoloSrc(getYoloStreamUrl()), 3000);
                }}
              />
            )}
            {yoloError && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-slate-500">
                Waiting for /yolo/annotated_image...
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Position Tracking</h2>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {[
              { label: "X (m)", value: poseMetrics.x },
              { label: "Y (m)", value: poseMetrics.y },
              { label: "Z (m)", value: poseMetrics.z },
              { label: "Yaw (°)", value: poseMetrics.yaw },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">{metric.label}</div>
                <div className="font-mono text-lg font-semibold text-slate-900">{metric.value}</div>
              </div>
            ))}
          </div>
          <canvas
            ref={poseCanvasRef}
            width={480}
            height={220}
            className="h-[220px] w-full rounded-xl bg-[#111827]"
          />
          <p className="mt-2 text-xs text-slate-500">
            Top-down trail from <code>/odom</code>. Frame: {poseMetrics.frame}
          </p>
        </section>
      </div>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Semantic Mapping</h2>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <canvas
              ref={semanticCanvasRef}
              width={640}
              height={320}
              className="h-[320px] w-full rounded-xl bg-[#111827]"
            />
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {legendClasses.map((name) => (
                <span key={name} className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: classColor(name) }}
                  />
                  {name}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Source: {semanticSource}
            </p>
          </div>
          <div className="max-h-[320px] overflow-auto rounded-xl border border-slate-200 bg-slate-50">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="sticky top-0 bg-slate-100 text-left text-slate-600">
                  <th className="p-2">ID</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Position (m)</th>
                  <th className="p-2">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {semanticObjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      Waiting for semantic landmarks...
                    </td>
                  </tr>
                ) : (
                  semanticObjects.map((obj) => (
                    <tr key={obj.id} className="border-t border-slate-200">
                      <td className="p-2">#{obj.id}</td>
                      <td className="p-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-bold text-slate-900"
                          style={{ background: classColor(obj.class) }}
                        >
                          {obj.class}
                        </span>
                      </td>
                      <td className="p-2">
                        {obj.x.toFixed(2)}, {obj.y.toFixed(2)}, {obj.z.toFixed(2)}
                      </td>
                      <td className="p-2">{(obj.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">RC Car Control</h2>
          <div className="mx-auto grid w-fit grid-cols-3 gap-2">
            <div />
            <HoldButton label="↑" startCmd="car_forward" stopCmd="car_stop" onSend={sendCmd} />
            <div />
            <HoldButton label="←" startCmd="car_left" stopCmd="car_stop" onSend={sendCmd} />
            <button
              type="button"
              className="rounded-xl bg-red-600 px-4 py-4 font-bold text-white"
              onClick={() => sendCmd("car_stop")}
            >
              STOP
            </button>
            <HoldButton label="→" startCmd="car_right" stopCmd="car_stop" onSend={sendCmd} />
            <div />
            <HoldButton label="↓" startCmd="car_backward" stopCmd="car_stop" onSend={sendCmd} />
            <div />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-sm text-slate-600">
              Motor speed:{" "}
              <strong className="font-semibold text-slate-900">{motorSpeed}</strong> / 255
            </div>
            <input
              type="range"
              min={0}
              max={255}
              value={motorSpeed}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-700"
              onChange={(event) => {
                const value = Number(event.target.value);
                setMotorSpeed(value);
                if (speedTimerRef.current) clearTimeout(speedTimerRef.current);
                speedTimerRef.current = setTimeout(() => {
                  sendCmd(`speed:${value}`);
                }, 35);
              }}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Servo Manipulator</h2>
          {[
            {
              label: "Base",
              leftLabel: "Left",
              rightLabel: "Right",
              left: "base_left_start",
              right: "base_right_start",
              stop: "base_stop",
              angle: servo.base,
            },
            {
              label: "Joint 1",
              leftLabel: "Up",
              rightLabel: "Down",
              left: "joint1_up_start",
              right: "joint1_down_start",
              stop: "joint1_stop",
              angle: servo.joint1,
            },
            {
              label: "Joint 2",
              leftLabel: "Up",
              rightLabel: "Down",
              left: "joint2_up_start",
              right: "joint2_down_start",
              stop: "joint2_stop",
              angle: servo.joint2,
            },
            {
              label: "Gripper",
              leftLabel: "Left",
              rightLabel: "Right",
              left: "gripper_left_start",
              right: "gripper_right_start",
              stop: "gripper_stop",
              angle: servo.gripper,
            },
          ].map((row) => (
            <div key={row.label} className="mb-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">{row.label}</span>
                <span className="shrink-0 font-mono text-sm tabular-nums text-slate-600">
                  {row.angle}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <HoldButton
                  label={row.leftLabel}
                  startCmd={row.left}
                  stopCmd={row.stop}
                  onSend={sendCmd}
                  className="py-3 text-sm"
                />
                <HoldButton
                  label={row.rightLabel}
                  startCmd={row.right}
                  stopCmd={row.stop}
                  onSend={sendCmd}
                  className="py-3 text-sm"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
            onClick={() => sendCmd("servo_relax")}
          >
            Return to Relaxed Position
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Press and hold a button to move the servo incrementally.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">IMU MPU6050</h2>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-relaxed text-slate-800">
            Accel X: {imu.ax} g<br />
            Accel Y: {imu.ay} g<br />
            Accel Z: {imu.az} g<br />
            Gyro X : {imu.gx} °/s<br />
            Gyro Y : {imu.gy} °/s<br />
            Gyro Z : {imu.gz} °/s<br />
            Temp   : {imu.temp} °C
          </div>
        </section>
      </div>
    </div>
  );
}
