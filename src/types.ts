export interface PipelineStep {
  name: string;
  dependencies: string[];
  command: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  durationMs?: number;
}

export interface PipelineExecutionPlan {
  levels: PipelineStep[][];
  totalSteps: number;
}
