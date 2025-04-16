import assert from 'node:assert';
import test from 'node:test';
import { PipelineDAG } from '../dist/dag-runner.js';

test('PipelineDAG resolves dependencies into parallel stages and runs cleanly', async () => {
  const dag = new PipelineDAG();
  dag.addStep({ name: 'lint', dependencies: [], command: 'npm run lint' });
  dag.addStep({ name: 'test', dependencies: [], command: 'npm test' });
  dag.addStep({ name: 'build', dependencies: ['lint', 'test'], command: 'npm run build' });
  dag.addStep({ name: 'deploy', dependencies: ['build'], command: 'npm run deploy' });

  const plan = dag.compileExecutionPlan();
  assert.strictEqual(plan.levels.length, 3);
  assert.strictEqual(plan.levels[0].length, 2); // lint & test parallel
  assert.strictEqual(plan.levels[1][0].name, 'build');
  assert.strictEqual(plan.levels[2][0].name, 'deploy');

  const ok = await dag.runPipeline();
  assert.strictEqual(ok, true);
});
