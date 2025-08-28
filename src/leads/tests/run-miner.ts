import "dotenv/config";
import { runMiner } from "../ai/run-miner";

const result = await runMiner("Growplex");
console.log(result);
