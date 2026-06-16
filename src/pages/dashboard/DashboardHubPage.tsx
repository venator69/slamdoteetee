import { Link } from "react-router-dom";

const modes = [
  {
    title: "Robot Monitoring",
    description:
      "Live YOLO feed, pose tracking, semantic map, RC car control, and IMU telemetry.",
    href: "/dashboard/robot",
    accent: "border-red-200 hover:border-red-400 hover:bg-red-50/50",
  },
  {
    title: "Drone Monitoring",
    description:
      "Top-down map with smoothed pose overlay. Position updates every 1 second.",
    href: "/dashboard/drone",
    accent: "border-red-200 hover:border-red-400 hover:bg-red-50/50",
  },
];

export function DashboardHubPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Monitoring Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Choose a monitoring mode for your SLAM.et deployment.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            to={mode.href}
            className={`group rounded-2xl border bg-white p-6 shadow-sm transition hover:scale-[1.02] hover:shadow-md ${mode.accent}`}
          >
            <h2 className="text-xl font-semibold text-slate-900 group-hover:text-red-600">
              {mode.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {mode.description}
            </p>
            <span className="mt-6 inline-flex text-sm font-semibold text-red-500">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
