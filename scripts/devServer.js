const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const nodeCommand = isWindows ? 'node.exe' : 'node';

const webpackProcess = spawn(npmCommand, ['run', 'dev'], { stdio: 'inherit' });
const serverProcess = spawn(nodeCommand, ['server.js'], { stdio: 'inherit' });

const shutdown = (signal) => {
  if (!webpackProcess.killed) {
    webpackProcess.kill(signal);
  }
  if (!serverProcess.killed) {
    serverProcess.kill(signal);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

webpackProcess.on('close', (code) => {
  if (code && code !== 0) {
    process.exitCode = code;
  }
  shutdown('SIGTERM');
});

serverProcess.on('close', (code) => {
  if (code && code !== 0) {
    process.exitCode = code;
  }
  shutdown('SIGTERM');
});
