import fs from 'node:fs/promises';
import path from 'node:path';

const preparationDirectory = path.resolve('test-results', 'signup-preparation');

export const signupPreparationPaths = {
  state: path.join(preparationDirectory, 'state.json'),
  storage: path.join(preparationDirectory, 'authenticated-state.json')
};

export async function writeSignupPreparationState(state) {
  await fs.mkdir(preparationDirectory, { recursive: true });
  await fs.writeFile(
    signupPreparationPaths.state,
    JSON.stringify(state, null, 2)
  );
}

export async function readSignupPreparationState() {
  const contents = await fs.readFile(signupPreparationPaths.state, 'utf8');

  return JSON.parse(contents);
}

export async function ensureSignupPreparationDirectory() {
  await fs.mkdir(preparationDirectory, { recursive: true });
}
