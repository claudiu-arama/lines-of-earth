import app from "./app.ts";

const startTime = performance.now();
const port = process.env.PORT ?? 3000;

const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;

app.listen(port, () => {
  const elapsed = Math.round(performance.now() - startTime);

  console.log();
  console.log(
    `${bold(green("Lines of Earth API (v0.1)"))}  ready in ${elapsed} ms`
  );
  console.log();
  console.log(`  ${green("➜")}  Local:   http://localhost:${port}/`);
  console.log(`  ${green("➜")}  Health:  http://localhost:${port}/health`);
  console.log();
});
