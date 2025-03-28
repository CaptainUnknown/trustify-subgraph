import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ActorRegistered,
  ActorUpdated
} from "../generated/AccessManager/AccessManager"

export function createActorRegisteredEvent(
  actorType: i32,
  actorId: BigInt,
  account: Address,
  hash: string
): ActorRegistered {
  let actorRegisteredEvent = changetype<ActorRegistered>(newMockEvent())

  actorRegisteredEvent.parameters = new Array()

  actorRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "actorType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(actorType))
    )
  )
  actorRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "actorId",
      ethereum.Value.fromUnsignedBigInt(actorId)
    )
  )
  actorRegisteredEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  actorRegisteredEvent.parameters.push(
    new ethereum.EventParam("hash", ethereum.Value.fromString(hash))
  )

  return actorRegisteredEvent
}

export function createActorUpdatedEvent(
  actorType: i32,
  actorId: BigInt,
  newHash: string
): ActorUpdated {
  let actorUpdatedEvent = changetype<ActorUpdated>(newMockEvent())

  actorUpdatedEvent.parameters = new Array()

  actorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "actorType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(actorType))
    )
  )
  actorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "actorId",
      ethereum.Value.fromUnsignedBigInt(actorId)
    )
  )
  actorUpdatedEvent.parameters.push(
    new ethereum.EventParam("newHash", ethereum.Value.fromString(newHash))
  )

  return actorUpdatedEvent
}
