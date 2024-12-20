import { afterEach, describe, it, expect, mock } from "bun:test";
import { file } from "bun";
import {
  testOracleProgramExecution,
  testOracleProgramTally,
} from "@seda-protocol/dev-tools";

const WASM_PATH = "build/debug.wasm";

const fetchMock = mock();

afterEach(() => {
  fetchMock.mockRestore();
});

describe("data request execution", () => {
  it("should aggregate the results from the different APIs", async () => {
    fetchMock.mockImplementation((url) => {
      if (url.host === "base-sepolia-rpc.publicnode.com") {
        return new Response(JSON.stringify({ notImplemented: "" }));
      }

      return new Response("Unknown request");
    });

    const oracleProgram = await file(WASM_PATH).arrayBuffer();

    const vmResult = await testOracleProgramExecution(
      Buffer.from(oracleProgram),
      Buffer.from(
        JSON.stringify({
          messageId:
            "0xd539cb42d65c3c2eafa3927bccc3d47bbf908545dcfceadae7e137cf5edf13f5",
          inBlockHex: "0x" + 18776360n.toString(16),
          topic:
            "0xb53ff17696d288361b2a2b43ec1bb1d0057458a4c22b81ae111eeef5ac84a3cf",
          address: "0x92eF403CD230231dA2Efb37f228Ef431E1B8fbe5",
        })
      ),
      // fetchMock
    );

    expect(vmResult.exitCode).toBe(0);
    const resultString = Buffer.from(vmResult.result).toString("utf8");
    const result = JSON.parse(resultString);
    expect(result).toEqual({ included: true });
  });

  it("should tally all results in a single data point", async () => {
    const oracleProgram = await file(WASM_PATH).arrayBuffer();

    // Result from the execution test
    const executionReports = [1, 1, 1, 1, 0, 1, 1, 0];
    const vmResult = await testOracleProgramTally(
      Buffer.from(oracleProgram),
      Buffer.from("tally-inputs"),
      executionReports.map((report) => ({
        exitCode: 0,
        gasUsed: 0,
        inConsensus: report === 1,
        result: Buffer.from(JSON.stringify({ included: report === 1 })),
      }))
    );

    expect(vmResult.exitCode).toBe(0);
    const resultHex = Buffer.from(vmResult.result).toString("hex");
    expect(resultHex).toEqual("01");
  });
});
