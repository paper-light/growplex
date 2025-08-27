import "dotenv/config";
import { runMiner } from "../ai/miner/run";

const result = await runMiner("Growplex");
console.log(result);
