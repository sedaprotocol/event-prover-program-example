import { Tally, Process, Bytes } from "@seda-protocol/as-sdk/assembly";

@json
class ExecutionReport {
  included!: boolean;
}

export function tallyPhase(): void {
  const reveals = Tally.getReveals();
  const totalReveals: u32 = Tally.getUnfilteredReveals().length;

  let totalHits: u32 = 0;

  for (let i = 0; i < reveals.length; i++) {
    const result = reveals[i].reveal.toJSON<ExecutionReport>();
    totalHits += result.included ? 1 : 0;
  }

  // Verify that more than 2/3 of the total reveals reported the process_id as present
  const success = totalHits > totalReveals * 2 / 3;

  // Report success as a u8, 1 for success and 0 for failure
  const successResult: u8 = success ? 1 : 0;
  Process.success(Bytes.fromNumber(successResult));
}
