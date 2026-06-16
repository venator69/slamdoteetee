export type PoseSample = {
  x: number;
  y: number;
  z: number;
  yaw: number;
};

export type PoseApiResponse = {
  ros_enabled?: boolean;
  status?: "live" | "stale" | string;
  x?: number;
  y?: number;
  z?: number;
  yaw_deg?: number;
  frame_id?: string;
  yolo_live?: boolean;
  yolo_fps?: number;
};

export type SemanticObject = {
  id: number;
  class: string;
  x: number;
  y: number;
  z: number;
  confidence: number;
};

export type SemanticApiResponse = {
  ros_enabled?: boolean;
  status?: string;
  source?: string;
  count?: number;
  objects?: SemanticObject[];
};
