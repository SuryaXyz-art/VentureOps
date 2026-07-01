import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [nextBin, "dev", ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"]
});

const noisyPatterns = [
  /\bCompil(?:ing|ed)\b/,
  /^\s*GET\s+\/.*\s+\d{3}\s+in\s+\d+ms\s*$/,
  /^\s*POST\s+\/.*\s+\d{3}\s+in\s+\d+ms\s*$/,
  /^\s*HEAD\s+\/.*\s+\d{3}\s+in\s+\d+ms\s*$/
];

function shouldHide(line) {
  return noisyPatterns.some((pattern) => pattern.test(line));
}

function pipeClean(stream, target) {
  const reader = createInterface({ input: stream });
  reader.on("line", (line) => {
    if (!shouldHide(line)) target.write(`${line}\n`);
  });
}

console.log("VentureOps quiet dev mode: normal route compile/request logs are hidden; real errors still print.");
pipeClean(child.stdout, process.stdout);
pipeClean(child.stderr, process.stderr);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});


