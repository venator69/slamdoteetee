import type { PoseSample } from "./types";

type TimestampedSample = PoseSample & { t: number };

export class MovingAveragePoseFilter {
  private samples: TimestampedSample[] = [];
  private readonly windowMs: number;

  constructor(windowMs = 1000) {
    this.windowMs = windowMs;
  }

  add(sample: PoseSample) {
    this.samples.push({ ...sample, t: Date.now() });
    this.prune();
  }

  clear() {
    this.samples = [];
  }

  getAverage(): PoseSample | null {
    this.prune();
    if (this.samples.length === 0) {
      return null;
    }

    const total = this.samples.reduce(
      (acc, sample) => ({
        x: acc.x + sample.x,
        y: acc.y + sample.y,
        z: acc.z + sample.z,
        yaw: acc.yaw + sample.yaw,
      }),
      { x: 0, y: 0, z: 0, yaw: 0 },
    );
    const count = this.samples.length;

    return {
      x: total.x / count,
      y: total.y / count,
      z: total.z / count,
      yaw: total.yaw / count,
    };
  }

  private prune() {
    const cutoff = Date.now() - this.windowMs;
    this.samples = this.samples.filter((sample) => sample.t >= cutoff);
  }
}
