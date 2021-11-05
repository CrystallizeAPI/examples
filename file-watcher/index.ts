import fs from "fs/promises";
import chokidar from "chokidar";

import { Bootstrapper, EVENT_NAMES } from "@crystallize/import-utilities";
import {
  AreaUpdate,
  AreaWarning,
} from "@crystallize/import-utilities/dist/bootstrap-tenant/bootstrapper";

/**
 * Access tokens for the account used
 * https://crystallize.com/learn/developer-guides/access-tokens
 */
const ACCESS_TOKEN_ID = process.env.CRYSTALLIZE_ACCESS_TOKEN_ID;
const ACCESS_TOKEN_SECRET = process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET;

/**
 * Ensure that only a single spec is being worked on
 * at the time
 */
const worker = (function () {
  const queue: string[] = [];
  let working = false;

  function work() {
    if (working || queue.length === 0) {
      return;
    }

    working = true;
    const [nextSpec] = queue.splice(0, 1);

    runSpec(nextSpec).finally(() => (working = false));
  }

  return {
    add: (path: string) => {
      if (queue[queue.length - 1] !== path) {
        queue.push(path);
      }
    },
    start: () => setInterval(work, 5),
  };
})();

function runSpec(specPath: string): Promise<void> {
  return new Promise(async (resolve) => {
    const specString = await fs.readFile(specPath, "utf-8");
    const spec = JSON.parse(specString);

    const bootstrapper = new Bootstrapper();
    const warnings: AreaWarning[] = [];

    bootstrapper.setAccessToken(ACCESS_TOKEN_ID, ACCESS_TOKEN_SECRET);

    bootstrapper.setTenantIdentifier("hkn-examples");

    bootstrapper.on(EVENT_NAMES.STATUS_UPDATE, (status: AreaUpdate) => {
      // console.log(JSON.stringify(status, null, 1));
      if (status.warning) {
        warnings.push(status.warning);
      }
    });

    console.log(`"${specPath}": starting...`);

    bootstrapper.on(EVENT_NAMES.DONE, async (status) => {
      console.log(
        `"${specPath}": finished in ${status.duration} with ${warnings.length} warnings`
      );

      /**
       * Create a log entry if there are warnings
       */
      if (warnings.length > 1) {
        const folderName = `${__dirname}/logs/log-${Date.now()}`;
        await fs.mkdir(folderName);
        await fs.writeFile(
          `${folderName}/spec.json`,
          JSON.stringify(spec, null, 1),
          "utf-8"
        );
        await fs.writeFile(
          `${folderName}/warnings.json`,
          JSON.stringify(warnings, null, 1),
          "utf-8"
        );
      }

      // Optionally delete the spec file after it is done
      // await fs.unlink(specPath);

      resolve();
    });

    bootstrapper.setSpec(spec);

    bootstrapper.start();
  });
}

async function runAllSpecsInSequence() {
  await runSpec(__dirname + "/specs/run-me-first.json");
  await runSpec(__dirname + "/specs/run-me-next.json");
}

function watchDirectory() {
  chokidar.watch(__dirname + "/specs/**/*.json").on("change", (path) => {
    console.log("Detected change to json file", path);
    worker.add(path);
  });
  chokidar
    .watch(__dirname + "/specs/**/*.json", {
      ignoreInitial: true,
    })
    .on("add", (path) => {
      console.log("Detected addition of json file", path);
      worker.add(path);
    });
  worker.start();
  console.log("🔎 watching specs directory for changes in json files");
}

(async function go() {
  await runAllSpecsInSequence();
  watchDirectory();
})();
