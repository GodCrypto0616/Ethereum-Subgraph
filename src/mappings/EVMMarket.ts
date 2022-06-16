/* eslint-disable prefer-const */
import { Collection, Pair, Event, Item } from '../generated/schema'
import { CollectionCreated, ItemListed, ItemDelisted, Swapped } from '../generated/EVMMarket/EVMMarket'
import { EVMNFT as EVMNFTTemplate } from '../generated/templates'
import { constants } from '@amxx/graphprotocol-utils'

export function handleCollectionCreated(event: CollectionCreated): void {
  let entityId = event.params.collection_address.toHex()
  let entity = new Collection(entityId)
  entity.timestamp = event.block.timestamp
  entity.txhash = event.transaction.hash.toHexString()
  entity.logIndex = event.transactionLogIndex

  entity.address = event.params.collection_address
  entity.owner = event.params.owner
  entity.isPublic = event.params.isPublic

  EVMNFTTemplate.create(event.params.collection_address)
  entity.save()
}

export function handleItemListed(event: ItemListed): void {
  let pair = Pair.load(event.params.id.toString())
  if (pair == null) {
    pair = new Pair(event.params.id.toString())
  }
  pair.timestamp = event.block.timestamp
  pair.txhash = event.transaction.hash.toHexString()
  pair.logIndex = event.transactionLogIndex

  pair.collection = event.params.collection
  pair.tokenId = event.params.token_id
  pair.price = event.params.price
  pair.tokenAdr = event.params.tokenAdr.toHex()
  pair.creator = event.params.creator
  pair.owner = event.params.owner
  pair.creatorFee = event.params.creatorFee
  pair.bValid = true
  pair.save()

  let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp
  eventItem.txhash = event.transaction.hash.toHexString()
  eventItem.logIndex = event.transactionLogIndex

  eventItem.collection = event.params.collection
  eventItem.tokenId = event.params.token_id
  eventItem.name = 'Listed'
  eventItem.from = event.params.owner.toHex()
  eventItem.to = ''
  eventItem.tokenAdr = event.params.tokenAdr.toHex()
  eventItem.price = event.params.price
  eventItem.save()
}

export function handleItemDelisted(event: ItemDelisted): void {
  let pair = Pair.load(event.params.id.toString())
  if (pair != null) {
    pair.timestamp = event.block.timestamp
    pair.txhash = event.transaction.hash.toHexString()
    pair.logIndex = event.transactionLogIndex

    pair.bValid = false
    pair.save()

    let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
    let eventItem = new Event(eventId)
    eventItem.timestamp = event.block.timestamp
    eventItem.txhash = event.transaction.hash.toHexString()
    eventItem.logIndex = event.transactionLogIndex

    eventItem.collection = pair.collection
    eventItem.tokenId = pair.tokenId
    eventItem.name = 'Delisted'
    eventItem.from = ''
    eventItem.to = pair.owner.toHex()
    eventItem.tokenAdr = constants.ADDRESS_ZERO
    eventItem.price = constants.BIGINT_ZERO	
    eventItem.save()
  }
}

export function handleSwapped(event: Swapped): void {
  let pair = Pair.load(event.params.pair.pair_id.toString())
  if (pair == null) {
    pair = new Pair(event.params.pair.pair_id.toString())
  }

  pair.timestamp = event.block.timestamp
  pair.txhash = event.transaction.hash.toHexString()
  pair.logIndex = event.transactionLogIndex

  pair.collection = event.params.pair.collection
  pair.tokenId = event.params.pair.token_id
  pair.tokenAdr = event.params.pair.tokenAdr.toHex()
  pair.price = event.params.pair.price
  pair.creator = event.params.pair.creator
  pair.owner = event.params.pair.owner
  pair.creatorFee = event.params.pair.creatorFee
  pair.bValid = false
  pair.save()

  let itemId = event.params.pair.collection.toHex() + '-' + event.params.pair.token_id.toString()
  let item = Item.load(itemId)
  if (item) {    
    item.lastSold = event.params.pair.price
    item.soldTimeStamp = event.block.timestamp
    item.save()
  }

  let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp
  eventItem.txhash = event.transaction.hash.toHexString()
  eventItem.logIndex = event.transactionLogIndex

  eventItem.collection = event.params.pair.collection
  eventItem.tokenId = event.params.pair.token_id
  eventItem.name = 'Purchased'
  eventItem.from = event.params.pair.owner.toHex()
  eventItem.to = event.params.buyer.toHex()
  eventItem.tokenAdr = event.params.pair.tokenAdr.toHex()
  eventItem.price = event.params.pair.price
  eventItem.save()
}
