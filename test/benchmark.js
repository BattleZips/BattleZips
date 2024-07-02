const { ethers } = require('hardhat')
const snarkjs = require('snarkjs')
const {
    boards,
    shots,
    verificationKeys,
    initialize,
    buildProofArgs,
    printLog,
} = require("./utils")

describe('Benchmark proving', async () => {
    let operator, alice, bob // players
    let F // ffjavascript BN254 construct
    let boardHashes // store hashed board for alice and bob

    before(async () => {
        // set players
        const signers = await ethers.getSigners()
        operator = signers[0];
        alice = signers[1];
        bob = signers[2];
        // initialize and store 
        ({ bv, sv, game, F, boardHashes } = await initialize(ethers.constants.AddressZero))
    })

    describe("Benchmarks", async () => {
        it("Benchmark board proof", async () => {
            const input = {
                ships: boards.alice,
                hash: F.toObject(boardHashes.alice)
            }
            let samples = [];
            for (let i = 0; i < 30; i++) {
                if (i % 10 == 0) console.log(`Benchmarked ${i} of 30`);
                let start = Date.now();
                await snarkjs.groth16.fullProve(
                    input,
                    'zk/board_js/board.wasm',
                    'zk/zkey/board_final.zkey',
                );
                let end = Date.now();
                samples.push(end - start);
            }
            let avgMs = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
            let avgSec = avgMs / 1000;
            console.log("=========[SHOT BENCHMARK]=========");
            console.log(`Average proof: ${avgSec} seconds (30 samples)`);
        })
        it('Benchmark shot proof', async () => {
            const input = {
                ships: boards.bob,
                hash: F.toObject(boardHashes.bob),
                shot: shots.alice[16],
                hit: 1
            }
            let samples = [];
            for (let i = 0; i < 30; i++) {
                if (i % 10 == 0) console.log(`Benchmarked ${i} of 30`);
                let start = Date.now();
                await snarkjs.groth16.fullProve(
                    input,
                    'zk/shot_js/shot.wasm',
                    'zk/zkey/shot_final.zkey'
                )
                let end = Date.now();
                samples.push(end - start);
            }
            let avgMs = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
            let avgSec = avgMs / 1000;
            console.log("=========[BOARD BENCHMARK]=========");
            console.log(`Average proof: ${avgSec} seconds (30 samples)`);            
        });
    })
})
