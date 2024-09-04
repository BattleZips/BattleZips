# BattleZips
### Zero Knowledge Battleship Game on EVM-compatible chains
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

<p align="center">
  <img width="460" height="460" src="battlezips.png">
</p>

Forked from 2020 `zkbattleship-circuit` by [tommymsz006](https://github.com/tommymsz006/zkbattleship), prototype [Battleship](https://en.wikipedia.org/wiki/Battleship_(game)) game built on GROTH16 proofs for the purpose of demonstrating an arbitrary imperfect information game that would otherwise be impossible in a decentralized context. It employs circom/circomlib to generate two separate circuits. The first circuit "board.circom" accepts board positions as a private input and their hash as a public input. It serves as a proof that a public hash is of an arrangement of ships on the board in the game is valid (within 10x10 range, does not collide with other ships, mimcSponge integrity check). Once run through snarkjs, we provide BattleshipGame.sol function 'joinGame' the board hash as public input and the generated proof. The smart contract stores the hash for future use. 

The second circuit "shot.circom" accepts the previous inputs as well as the new public inputs of a hit boolean and a coordinate pair. This proof acts as an assertion that a given shot in the game hits or misses the position of ships. It is imporant to note that the conditional nature of some of the computations required the integration of circomlib's signal mux to accomplish a zero knowledge computation. These shot proofs were exchanged on chain with hit/ miss flags to advance game state within the contract to a completion state at 17 hits (5, 4, 3, 3, 2). 

circom_tester was employed to test all edge cases of the shot and board proofs. snarkjs integration testing drove basic on-chain tests. Used [Ian Brighton's Front End and Subgraph](https://github.com/Ian-Bright/battlezip-frontend) to provide a user experience to abstract away the technicalities from the end user. Hardhat is configured to verify on block explorers on etherscan and polygonscan. In the testing, BattleZips is demonstrated to be erc2771 compliant.

In order to be considered an example of a production ready software stack, BattleZips still needs to iterate to create a maximally cost-efficient dApp. In BattleZips v0.0.2, board and shot proofs are exchanged on-chain. Our next iteration will use state channels in the form of socket.io to allow two players of a game to use babyjub keys to establish an ECDH shared secret by which they can send their proofs back and forth to eachother. Once an end state is reached, the entire game state is to be stored in a merkle tree rolled up on-chain in a single transaction. In even more future versions, upgrading our state channels to be [WebRTC signalling using IPFS](https://github.com/cretz/webrtc-ipfs-signaling) is also on the radar. Finally, the project will be documented and republished open-source as a cryptozombies analogue for all things zero knowledge.

This project is WIP. Please contact @jp4g_ on twitter or open issues with questions/ comments/ concerns. [Presented on 2/20/22 at EthDenver](https://youtu.be/f_qu2Z0vc9M?t=1249)

## Steps (requires Linux/ OS X)
Since compatibility is a common question, M1 chips will outperform the expected wait times on ptau and setup
Node v16.17.1 was last used to compile this project, and failure to use it will break ipfs in deploy script (either use node 16 or comment out IPFS)

### 0. [Ensure Circom 2.x.x is installed locally](https://github.com/iden3/circom/blob/master/mkdocs/docs/getting-started/installation.md)
```
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
cd ..
```
### 1. run POT15 ceremony (⏰ expected 10 minute run time ⏰)
```
yarn ptau
```
### 2. Build zkeys and verification keys for each circuit, then export to Solidity contract (⌛ expected 3 minute run time ⌛)
```
yarn setup
```
### 3. Add mnemonic, infura key to .env
```
MNEMONIC=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
INFURA=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
### 4. Use entire local test suite (circom_tester, snarkjs integration testing, erc2771 integration testing)
```
yarn hardhat test
```
### 5. Test on-chain demonstration of full battleship game driven by ZK-Snarks (example goerli)
Requires sufficient funding in accounts m/44'/60'/0'/0 - m/44'/60'/0'/2 to test live
```
yarn hardhat test test/game.js --network goerli
```
### 6. Add block explorer api credentials to .env
```
ETHERSCAN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
POLYGONSCAN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
### 7. OPTIONAL: Add biconomy api credentials to .env
api credential will need to be manually changed for each network deployed to
```
BICONOMY_AUTH=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX # global account credential
BICONOMY_API=XXXXXXXXX.XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX # network-specific dApp credential
```
### 8. Deploy and publish all assets for BattleZips Zero Knowledge functionality
 * Deploys `BoardVerifier.sol`, `ShotVerifier.sol`, and `BattleshipGame.sol` to a configured network
 * Connects `BattleshipGame.sol` to Biconomy's minimal trusted forwarder contract if one is known
 * Verifies contracts on block explorer upon deployment for etherscan and polygonscan compatible networks
 * Authenticates and initializes `BattleshipGame.sol` in Biconomy's API to begin gasless transaction relays
 * Hosts `*_verification_key.json`, `*.wasm`, and `*_final.zkey` files on IPFS for `board.circom` and `shot.circom` on client side
```
yarn deploy:mumbai
```
