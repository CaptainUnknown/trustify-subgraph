<img src="https://github.com/user-attachments/assets/ae339287-07d8-4304-a7ff-af584181f27e" alt="Trustify Logo" height="150">

# 📡 Trustify - Subgraph
The counterfeit "Made in Italy" market is a growing issue, causing significant economic and reputational damage to authentic Italian brands. The lack of reliable and decentralized supply chain traceability solutions has allowed counterfeit goods to proliferate. NapulETH, in partnership with the University of Federico II and Confindustria, is developing a blockchain-based digital twin solution leveraging Ethereum, Zero-Knowledge Proofs (ZK), and IoT integrations to ensure full transparency and authenticity in the agrifood sector. This initiative aims to create an immutable, verifiable, and privacy-preserving system to certify product origin and quality.

## Introduction
This subgraph indexes the Trustify Supply Chain contracts deployed on the Holesky testnet. Subgraph is consumed by the Trustify DApp through the Apollo Supergraph.

Subgraph URL: [Trustify Subgraph (v0.0.2-holesky)](https://subgraphs.alchemy.com/subgraphs/11380/versions/39780)

## Overview
This subgraph extracts and structures event data from the following contracts:
- `SupplyChain`: Manages batches as dynamic NFTs (dNFTs) and tracks their state transitions.
- `ActorsManager`: Registers actors involved in the supply chain, assigning them soul-bound NFTs.

## Entities
### Actor:
Stores data about supply chain actors such as farmers, processors, distributors, and retailers.
```gql
type Actor @entity {
  id: ID!
  actorType: String!
  address: Bytes!
  hash: String!
  issuedAt: BigInt!
}
```

### Batch:
Represents a batch of goods in the supply chain, tracking its state and associated actors.
```gql
type Batch @entity {
  id: ID!
  state: String!
  hash: String!
  farmer: Actor
  processor: Actor
  packager: Actor
  distributors: [Actor!]!
  retailers: [Actor!]!
  createdAt: BigInt!
}
```

### SupplyChain
Stores aggregated statistics about the entire supply chain.
```gql
type SupplyChain @entity {
  id: ID! @default(value: "supply-chain")
  batches: [Batch!]!
  totalBatches: BigInt!
  totalActors: BigInt!
  activeBatches: BigInt!
  inTransit: BigInt!
  retailedBatches: BigInt!
  transactions: BigInt!
}
```

## Setup & Running Locally
1. Install dependencies:
```
yarn install
```
2. Generate types:
```
yarn codegen
```
2. Deploy subgraph:
```
yarn deploy
```