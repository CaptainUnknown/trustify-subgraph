import {
  ActorRegistered as ActorRegisteredEvent,
  ActorUpdated as ActorUpdatedEvent,
} from "../generated/ActorsManager/ActorsManager"
import { ActorRegistered, ActorUpdated } from "../generated/schema"

export function handleActorRegistered(event: ActorRegisteredEvent): void {
  let entity = new ActorRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.actorType = event.params.actorType
  entity.actorId = event.params.actorId
  entity.account = event.params.account
  entity.hash = event.params.hash

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleActorUpdated(event: ActorUpdatedEvent): void {
  let entity = new ActorUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.actorType = event.params.actorType
  entity.actorId = event.params.actorId
  entity.newHash = event.params.newHash

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
