import { executionPhase } from "./execution-phase";
import { tallyPhase } from "./tally-phase";
import { OracleProgram } from "@seda-protocol/as-sdk/assembly";

class MessageVerification extends OracleProgram {
  execution(): void {
    executionPhase();
  }

  tally(): void {
    tallyPhase();
  }
}

new MessageVerification().run();
