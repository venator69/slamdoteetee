const robotApiBase =
  import.meta.env.VITE_ROBOT_API_BASE_URL ?? "http://127.0.0.1:8080";

export function getRobotApiUrl(path: string) {
  const base = robotApiBase.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getRobotWebSocketUrl() {
  const base = robotApiBase.replace(/\/$/, "");
  const url = new URL(base);
  const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
  const port = url.port
    ? String(parseInt(url.port, 10) + 1)
    : url.protocol === "https:"
      ? ""
      : "8081";
  const host = url.hostname;
  const portSuffix = port ? `:${port}` : "";
  return `${wsProtocol}//${host}${portSuffix}/`;
}
