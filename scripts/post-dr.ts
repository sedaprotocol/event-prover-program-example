import { Signer, buildSigningConfig, postAndAwaitDataRequest } from '@seda-protocol/dev-tools';

async function main() {
    if (!process.env.ORACLE_PROGRAM_ID) {
        throw new Error('Please set the ORACLE_PROGRAM_ID in your env file');
    }

    // Takes the mnemonic from the .env file (SEDA_MNEMONIC and SEDA_RPC_ENDPOINT)
    const signingConfig = buildSigningConfig({});
    const signer = await Signer.fromPartial(signingConfig);

    console.log('Posting and waiting for a result, this may take a lil while..');


    const targetEvent = JSON.stringify({
        messageId:
            "MESSAGE_ID",
        inBlockHex: "0x" + 19467085n.toString(16),
        topic:
            "FILTER_TOPIC",
        address: "CONTRACT_ADDRESS",
    })

    const result = await postAndAwaitDataRequest(signer, {
        consensusOptions: {
            method: 'mode',
            jsonPath: '$.included',
        },
        execProgramId: process.env.ORACLE_PROGRAM_ID,
        execInputs: Buffer.from(targetEvent),
        tallyInputs: Buffer.from([]),
        memo: Buffer.from(new Date().toISOString()),
    }, {});

    console.table(result);
}

main();