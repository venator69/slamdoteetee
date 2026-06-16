import { getRobotApiUrl } from "../config/dashboard";
import type { PoseApiResponse, SemanticApiResponse } from "./types";

export async function fetchPose(): Promise<PoseApiResponse> {
  const response = await fetch(getRobotApiUrl("/api/pose"), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Pose API unavailable");
  }
  return response.json() as Promise<PoseApiResponse>;
}

export async function fetchSemantic(): Promise<SemanticApiResponse> {
  const response = await fetch(getRobotApiUrl("/api/semantic"), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Semantic API unavailable");
  }
  return response.json() as Promise<SemanticApiResponse>;
}

export function getYoloStreamUrl() {
  return `${getRobotApiUrl("/stream/yolo")}?${Date.now()}`;
}
