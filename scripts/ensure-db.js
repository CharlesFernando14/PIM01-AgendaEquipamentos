const { execSync, spawn } = require("child_process");

const PG_BIN = "C:\\Program Files\\PostgreSQL\\17\\bin";
const PG_CTL = `${PG_BIN}\\pg_ctl.exe`;
const PG_ISREADY = `${PG_BIN}\\pg_isready.exe`;
const PG_DATA = "C:\\Program Files\\PostgreSQL\\17\\data";
const PG_LOG = "C:\\Program Files\\PostgreSQL\\17\\data\\log\\postgresql.log";

function isReady() {
  try {
    execSync(`"${PG_ISREADY}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function waitForReady(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (isReady()) {
        clearInterval(interval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error("PostgreSQL não ficou pronto a tempo."));
      }
    }, 1000);
  });
}

async function main() {
  if (isReady()) {
    console.log("[ensure-db] PostgreSQL já está rodando.");
    return;
  }

  console.log("[ensure-db] PostgreSQL parado. Iniciando...");
  const child = spawn(PG_CTL, ["-D", PG_DATA, "-l", PG_LOG, "start"], {
    stdio: "ignore",
    detached: true,
  });
  child.unref();

  try {
    await waitForReady();
    console.log("[ensure-db] PostgreSQL iniciado com sucesso.");
  } catch (err) {
    console.error("[ensure-db]", err.message);
    process.exit(1);
  }
}

main();
