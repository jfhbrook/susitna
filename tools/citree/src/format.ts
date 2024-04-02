import { spawn } from 'child_process';
import which from 'which';

import { Types } from './types';

function formatFile(path: string): Promise<void> {
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

export async function format(types: Types): Promise<void> {
  try {
    await which('prettier');
  } catch (err: any) {
    if (err.message === 'not found: prettier') {
      console.log(`To automatically format citree output, install prettier with:

    npm install --save-dev prettier
`);
      return;
    }
    throw err;
  }

  await Promise.all(Object.keys(types).map(formatFile));
}
