import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ActorRegistered } from "../generated/schema"
import { ActorRegistered as ActorRegisteredEvent } from "../generated/AccessManager/AccessManager"
import { handleActorRegistered } from "../src/access-manager"
import { createActorRegisteredEvent } from "./access-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let actorType = 123
    let actorId = BigInt.fromI32(234)
    let account = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let hash = "Example string value"
    let newActorRegisteredEvent = createActorRegisteredEvent(
      actorType,
      actorId,
      account,
      hash
    )
    handleActorRegistered(newActorRegisteredEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ActorRegistered created and stored", () => {
    assert.entityCount("ActorRegistered", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ActorRegistered",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "actorType",
      "123"
    )
    assert.fieldEquals(
      "ActorRegistered",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "actorId",
      "234"
    )
    assert.fieldEquals(
      "ActorRegistered",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "account",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ActorRegistered",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "hash",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
