import { PipelineStep, PipelineExecutionPlan } from './types.js';

export class PipelineDAG {
  private steps = new Map<string, PipelineStep>();

  addStep(step: Omit<PipelineStep, 'status'>): void {
    this.steps.set(step.name, { ...step, status: 'PENDING' });
  }

  compileExecutionPlan(): PipelineExecutionPlan {
    // Kahn's Topological Sort with Level Partitioning (Parallel stages)
    const inDegree = new Map<string, number>();
    for (const name of this.steps.keys()) inDegree.set(name, 0);

    for (const step of this.steps.values()) {
      for (const dep of step.dependencies) {
        if (!this.steps.has(dep)) throw new Error(`Undefined dependency: ${dep}`);
      }
      inDegree.set(step.name, step.dependencies.length);
    }

    const levels: PipelineStep[][] = [];
    const visited = new Set<string>();

    while (visited.size < this.steps.size) {
      const currentLevel: PipelineStep[] = [];
      for (const [name, deg] of inDegree.entries()) {
        if (!visited.has(name) && deg === 0) {
          currentLevel.push(this.steps.get(name)!);
        }
      }

      if (currentLevel.length === 0) {
        throw new Error('Cyclic dependency detected in pipeline graph');
      }

      for (const step of currentLevel) {
        visited.add(step.name);
        // Reduce degree of dependents
        for (const dependent of this.steps.values()) {
          if (dependent.dependencies.includes(step.name)) {
            inDegree.set(dependent.name, inDegree.get(dependent.name)! - 1);
          }
        }
      }
      levels.push(currentLevel);
    }

    return { levels, totalSteps: this.steps.size };
  }

  async runPipeline(): Promise<boolean> {
    const plan = this.compileExecutionPlan();
    for (const stage of plan.levels) {
      // Run steps in current level in parallel
      await Promise.all(stage.map(async (step) => {
        step.status = 'RUNNING';
        const start = Date.now();
        // Simulated command execution
        step.status = 'SUCCESS';
        step.durationMs = Date.now() - start;
      }));
    }
    return true;
  }
}
