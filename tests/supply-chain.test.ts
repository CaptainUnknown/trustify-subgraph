import {
  assert,
  describe,
  test,
  clearStore,
  newMockEvent,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  handleBatchCreated,
  handleBatchStatusUpdated
} from "../src/supply-chain"
import { Batch, SupplyChain, Actor } from "../generated/schema"
import {
  BatchCreated as BatchCreatedEvent,
  BatchStatusUpdated as BatchStatusUpdatedEvent
} from "../generated/SupplyChain/SupplyChain"

function createBatchCreatedEvent(
  batchId: BigInt,
  actorId: Address,
  hash: Bytes,
  timestamp: BigInt
): BatchCreatedEvent {
  let event = changetype<BatchCreatedEvent>(newMockEvent())
  event.parameters = new Array()
  event.parameters.push(
    new ethereum.EventParam("batchId", ethereum.Value.fromUnsignedBigInt(batchId))
  )
  event.parameters.push(
    new ethereum.EventParam("actorId", ethereum.Value.fromAddress(actorId))
  )
  event.parameters.push(
    new ethereum.EventParam("hash", ethereum.Value.fromBytes(hash))
  )
  event.parameters.push(
    new ethereum.EventParam("timestamp", ethereum.Value.fromUnsignedBigInt(timestamp))
  )
  return event
}

function createBatchStatusUpdatedEvent(
  batchId: BigInt,
  state: i32,
  hash: Bytes,
  actorId: Address
): BatchStatusUpdatedEvent {
  let event = changetype<BatchStatusUpdatedEvent>(newMockEvent())
  event.parameters = new Array()
  event.parameters.push(
    new ethereum.EventParam("batchId", ethereum.Value.fromUnsignedBigInt(batchId))
  )
  event.parameters.push(
    new ethereum.EventParam("state", ethereum.Value.fromI32(state))
  )
  event.parameters.push(
    new ethereum.EventParam("hash", ethereum.Value.fromBytes(hash))
  )
  event.parameters.push(
    new ethereum.EventParam("actorId", ethereum.Value.fromAddress(actorId))
  )
  return event
}

describe("SupplyChain Mapping Tests", () => {
  afterAll(() => {
    clearStore()
  })

  test("handleBatchCreated creates a Batch and updates SupplyChain", () => {
    let actorId = "0x0000000000000000000000000000000000000001"
    let actor = new Actor(actorId)
    actor.save()

    let batchId = BigInt.fromI32(1)
    let hash = Bytes.fromHexString("0xabc123") as Bytes
    let timestamp = BigInt.fromI32(1000)
    let event = createBatchCreatedEvent(
      batchId,
      Address.fromString(actorId),
      hash,
      timestamp
    )

    handleBatchCreated(event)

    assert.fieldEquals("Batch", "1", "state", "HARVESTED")
    assert.fieldEquals("Batch", "1", "hash", "0xabc123")
    assert.fieldEquals("Batch", "1", "createdAt", "1000")
    assert.fieldEquals("Batch", "1", "farmer", actorId)

    assert.fieldEquals("SupplyChain", "supply-chain", "totalBatches", "1")
    assert.fieldEquals("SupplyChain", "supply-chain", "activeBatches", "1")
    assert.fieldEquals("SupplyChain", "supply-chain", "transactions", "1")
  })

  test("handleBatchStatusUpdated updates Batch to INTRANSIT", () => {
    let batchId = BigInt.fromI32(10)
    let eventCreate = createBatchCreatedEvent(
      batchId,
      Address.fromString("0x0000000000000000000000000000000000000001"),
      Bytes.fromHexString("0xhash1") as Bytes,
      BigInt.fromI32(1000)
    )
    handleBatchCreated(eventCreate)

    let newHash = Bytes.fromHexString("0xdef456") as Bytes
    let dummyActor = Address.fromString("0x0000000000000000000000000000000000000002")
    let eventStatus = createBatchStatusUpdatedEvent(batchId, 1, newHash, dummyActor)
    handleBatchStatusUpdated(eventStatus)

    assert.fieldEquals("Batch", "10", "state", "INTRANSIT")
    assert.fieldEquals("Batch", "10", "hash", "0xdef456")

    assert.fieldEquals("SupplyChain", "supply-chain", "inTransit", "1")
    assert.fieldEquals("SupplyChain", "supply-chain", "activeBatches", "1")
    assert.fieldEquals("SupplyChain", "supply-chain", "transactions", "2")
  })

  test("handleBatchStatusUpdated updates Batch to ATRETAILERS and adds retailer", () => {
    let batchId = BigInt.fromI32(20)
    let eventCreate = createBatchCreatedEvent(
      batchId,
      Address.fromString("0x0000000000000000000000000000000000000001"),
      Bytes.fromHexString("0xhash2") as Bytes,
      BigInt.fromI32(2000)
    )
    handleBatchCreated(eventCreate)

    let retailerId = "0x0000000000000000000000000000000000000003"
    let retailer = new Actor(retailerId)
    retailer.save()

    let newHash = Bytes.fromHexString("0xretailhash") as Bytes
    let eventStatus = createBatchStatusUpdatedEvent(
      batchId,
      3,
      newHash,
      Address.fromString(retailerId)
    )
    handleBatchStatusUpdated(eventStatus)

    assert.fieldEquals("Batch", "20", "state", "ATRETAILERS")
    assert.fieldEquals("Batch", "20", "hash", "0xretailhash")
    let batch = Batch.load("20")
    if (batch) {
      assert.stringEquals(batch.retailers[0], retailerId, "Retailer should be added")
    }
  })

  test("handleBatchStatusUpdated updates Batch to ATDISTRIBUTORS and adds distributor", () => {
    let batchId = BigInt.fromI32(30)
    let eventCreate = createBatchCreatedEvent(
      batchId,
      Address.fromString("0x0000000000000000000000000000000000000001"),
      Bytes.fromHexString("0xhash3") as Bytes,
      BigInt.fromI32(3000)
    )
    handleBatchCreated(eventCreate)

    let distributorId = "0x0000000000000000000000000000000000000004"
    let distributor = new Actor(distributorId)
    distributor.save()

    let newHash = Bytes.fromHexString("0xdistrihash") as Bytes
    let eventStatus = createBatchStatusUpdatedEvent(
      batchId,
      2,
      newHash,
      Address.fromString(distributorId)
    )
    handleBatchStatusUpdated(eventStatus)

    assert.fieldEquals("Batch", "30", "state", "ATDISTRIBUTORS")
    assert.fieldEquals("Batch", "30", "hash", "0xdistrihash")
    let batch = Batch.load("30")
    if (batch) {
      assert.stringEquals(batch.distributors[0], distributorId, "Distributor should be added")
    }
  })

  test("handleBatchStatusUpdated updates SupplyChain for TOCUSTOMERS", () => {
    let batchId = BigInt.fromI32(40)
    let eventCreate = createBatchCreatedEvent(
      batchId,
      Address.fromString("0x0000000000000000000000000000000000000001"),
      Bytes.fromHexString("0xhash4") as Bytes,
      BigInt.fromI32(4000)
    )
    handleBatchCreated(eventCreate)

    let supplyChainBefore = SupplyChain.load("supply-chain")
    let activeBefore = supplyChainBefore ? supplyChainBefore.activeBatches.toI32() : 0

    let newHash = Bytes.fromHexString("0xtocust") as Bytes
    let dummyActor = Address.fromString("0x0000000000000000000000000000000000000005")
    let eventStatus = createBatchStatusUpdatedEvent(batchId, 4, newHash, dummyActor)
    handleBatchStatusUpdated(eventStatus)

    assert.fieldEquals("Batch", "40", "state", "TOCUSTOMERS")
    assert.fieldEquals("Batch", "40", "hash", "0xtocust")
    let supplyChainAfter = SupplyChain.load("supply-chain")
    if (supplyChainAfter) {
      assert.i32Equals(supplyChainAfter.activeBatches.toI32(), activeBefore - 1)
    }
  })

  test("handleBatchStatusUpdated does not update when state index is invalid", () => {
    let batchId = BigInt.fromI32(50)
    let eventCreate = createBatchCreatedEvent(
      batchId,
      Address.fromString("0x0000000000000000000000000000000000000001"),
      Bytes.fromHexString("0xhash5") as Bytes,
      BigInt.fromI32(5000)
    )
    handleBatchCreated(eventCreate)

    let batchBefore = Batch.load("50")
    let supplyChainBefore = SupplyChain.load("supply-chain")
    let transactionsBefore = supplyChainBefore ? supplyChainBefore.transactions.toI32() : 0

    let eventStatus = createBatchStatusUpdatedEvent(
      batchId,
      5,
      Bytes.fromHexString("0xinvalid") as Bytes,
      Address.fromString("0x0000000000000000000000000000000000000006")
    )
    handleBatchStatusUpdated(eventStatus)

    let batchAfter = Batch.load("50")
    if (batchBefore && batchAfter) {
      assert.stringEquals(batchAfter.state, batchBefore.state, "State should remain unchanged")
      assert.stringEquals(batchAfter.hash, batchBefore.hash, "Hash should remain unchanged")
    }

    let supplyChainAfter = SupplyChain.load("supply-chain")
    if (supplyChainAfter) {
      assert.i32Equals(
        supplyChainAfter.transactions.toI32(),
        transactionsBefore,
        "Transactions should remain unchanged"
      )
    }
  })
})
