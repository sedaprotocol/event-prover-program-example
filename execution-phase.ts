import {
  Bytes,
  Console,
  Process,
  httpFetch,
} from "@seda-protocol/as-sdk/assembly";

@json
class Log {
  topics!: Array<string>;
}

@json
class RpcResponse {
  result!: Array<Log>;
}

@json
class RpcRequestParams {
  topics!: Array<string>;
  fromBlock!: string;
  toBlock!: string;
  address!: string;
}

@json
class RpcRequest {
  jsonrpc: string = "2.0";
  method: string = "eth_getLogs";
  params!: Array<RpcRequestParams>;
  id: u8 = 1;
}

// Bytes slices
@json
class Inputs {
  messageId!: string;
  inBlockHex!: string;
  address!: string;
  topic!: string;
}

@json
class ExecutionReport {
  included: boolean;

  constructor(included: boolean) {
    this.included = included;
  }
}

export function executionPhase(): void {
  const inputs = Process.getInputs().toJSON<Inputs>();

  const params = new RpcRequestParams();

  params.topics = [inputs.topic];
  params.fromBlock = inputs.inBlockHex;
  params.toBlock = inputs.inBlockHex;
  params.address = inputs.address;

  const request = new RpcRequest();
  request.params = [params];

  const response = httpFetch(
    `https://base-sepolia-rpc.publicnode.com`,
    {
      method: "POST",
      headers: new Map(),
      body: Bytes.fromJSON(request),
    }
  );

  if (!response.ok) {
    Console.error(
      `HTTP Response was rejected: ${response.status.toString()} - ${response.bytes.toUtf8String()}`
    );
    Process.error(Bytes.fromUtf8String("Error while fetching logs"));
  }

  const responseData = response.bytes.toJSON<RpcResponse>();
  for (let i = 0; i < responseData.result.length; i++) {
    const log = responseData.result[i];
    if (log.topics.includes(inputs.messageId)) {
      Process.success(Bytes.fromJSON(new ExecutionReport(true)));
    }
  }

  Process.success(Bytes.fromJSON(new ExecutionReport(false)));
}
