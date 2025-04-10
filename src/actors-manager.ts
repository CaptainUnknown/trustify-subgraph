import { BigInt } from "@graphprotocol/graph-ts"
import {
  ActorRegistered as ActorRegisteredEvent,
  ActorUpdated as ActorUpdatedEvent,
} from "../generated/ActorsManager/ActorsManager"
import { Actor, SupplyChain } from "../generated/schema"
import { ACTOR_TYPE_MAP } from "./constants"

export function handleActorRegistered(event: ActorRegisteredEvent): void {
  let supplyChain = SupplyChain.load("supply-chain")
  if (supplyChain == null) {
    supplyChain = new SupplyChain("supply-chain")
    supplyChain.totalBatches = BigInt.fromI32(0)
    supplyChain.totalActors = BigInt.fromI32(0)
    supplyChain.activeBatches = BigInt.fromI32(0)
    supplyChain.inTransit = BigInt.fromI32(0)
    supplyChain.retailedBatches = BigInt.fromI32(0)
    supplyChain.transactions = BigInt.fromI32(0)
    supplyChain.batches = []
    supplyChain.actors = []
  }
  
  let actor = new Actor(event.params.actorId.toString())

  let actorType = changetype<i32>(event.params.actorType);
  if (actorType < 0 || actorType >= ACTOR_TYPE_MAP.length) return

  actor.actorType = ACTOR_TYPE_MAP[actorType]
  actor.address = event.params.account
  actor.hash = event.params.hash
  actor.issuedAt = event.block.timestamp
  actor.batches = []

  supplyChain.totalActors = supplyChain.totalActors.plus(BigInt.fromI32(1))
  supplyChain.transactions = supplyChain.transactions.plus(BigInt.fromI32(1))
  const actors = supplyChain.actors
  actors.push(actor.id)
  supplyChain.actors = actors

  supplyChain.save()
  actor.save()
}

export function handleActorUpdated(event: ActorUpdatedEvent): void {
  let supplyChain = SupplyChain.load("supply-chain")
  let actor = Actor.load(event.params.actorId.toString())
  if (actor == null || supplyChain == null) return

  supplyChain.transactions = supplyChain.transactions.plus(BigInt.fromI32(1))
  supplyChain.save()

  actor.issuedAt = event.block.timestamp
  actor.hash = event.params.newHash
  actor.save()
}