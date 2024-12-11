import { spawn } from 'child_process';

export function formatFile(path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const format = spawn('prettier', [path, '--write'], {
      stdio: 'pipe',
    });
    format.on('exit', (code) => {
      if (code) {
        reject(
          new Error(`prettier '${path}' --write exited with code ${code}`),
        );
        return;
      }
      resolve();
    });
  });
}
