import { AbiCoder } from "ethers/abi";

const blockHeight = 18776360n;
const blockHex = "0x" + blockHeight.toString(16);

const res = await fetch("https://base-sepolia-rpc.publicnode.com", {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_getLogs",
    params: [
      {
        topics: [
          "0xb53ff17696d288361b2a2b43ec1bb1d0057458a4c22b81ae111eeef5ac84a3cf",
        ],
        fromBlock: blockHex,
        toBlock: blockHex,
        address: "0x92eF403CD230231dA2Efb37f228Ef431E1B8fbe5",
      },
    ],
    id: 74,
  }),
});

const responseData = await res.json();

const abiCoder = new AbiCoder();

const logs = responseData.result.map((log) => {
    return abiCoder.decode(["bytes", "bytes", "uint256"], log.data);
});
console.log("[DEBUG]: logs ::: ", logs);
