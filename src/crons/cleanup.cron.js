import mainQueue from "../queues/main.queue.js";

/* Idempontency key cleanup job cron */
async function addIdempotenKeysCleanUpCron(params) {
  await mainQueue.add(
    "idempontencykeys-cleanup",
    {},
    {
      jobId: "idempontencykeys-cleanup",
      repeat: {
        cron: "0 * * * *",
      },
    },
  );
}

async function intiateCronJobs() {
  await addIdempotenKeysCleanUpCron();
}

export default intiateCronJobs;
