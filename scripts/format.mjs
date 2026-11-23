import { execFileSync } from 'node:child_process';

const check = process.argv.includes('--check');
const pnpmCommand = process.platform === 'win32' ? 'pnpm.exe' : 'pnpm';

execFileSync(
    pnpmCommand,
    ['exec', 'prettier', check ? '--check' : '--write', '--ignore-unknown', '.'],
    {
        stdio: 'inherit',
    },
);
