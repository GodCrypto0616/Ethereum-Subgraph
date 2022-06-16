/* eslint-disable prefer-const */
import { Item, Event, Collection} from '../generated/schema'
import { ItemCreated, Transfer } from '../generated/templates/EVMNFT/EVMNFT'
import { constants } from '@amxx/graphprotocol-utils'

export function handleTransfer(event: Transfer): void
{
	let collection = Collection.load(event.address.toHex())
	if (collection != null) {
		let entityId = event.address.toHex() + '-' + event.params.tokenId.toString()
		let item = Item.load(entityId)
		if (item != null) {
			item.timestamp = event.block.timestamp
			item.owner = event.params.to
			item.save()
		}
	}	
}

export function handleItemCreated(event: ItemCreated): void {
	let collection = Collection.load(event.address.toHex())
	if (collection != null) {
		let entityId = event.address.toHex() + '-' + event.params.id.toString()
		let entity = new Item(entityId)
		entity.timestamp = event.block.timestamp
		entity.txhash = event.transaction.hash.toHexString()
		entity.logIndex = event.transactionLogIndex

		entity.collection = event.address
		entity.tokenId = event.params.id
		entity.uri = event.params.uri
		entity.creator = event.params.creator
		entity.owner = event.params.creator
		entity.royalty = event.params.royalty
		entity.lastBid = constants.BIGINT_ZERO
		entity.lastSold = constants.BIGINT_ZERO
		entity.soldTimeStamp = constants.BIGINT_ZERO
		entity.save()
		

		let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
		let eventItem = new Event(eventId)
		eventItem.timestamp = event.block.timestamp
		eventItem.txhash = event.transaction.hash.toHexString()
		eventItem.logIndex = event.transactionLogIndex

		eventItem.collection = event.address
		eventItem.tokenId = event.params.id
		eventItem.name = "Minted"
		eventItem.from = event.params.creator.toHex()
		eventItem.to = event.params.creator.toHex()
		eventItem.tokenAdr = constants.ADDRESS_ZERO
		eventItem.price = constants.BIGINT_ZERO
		eventItem.save()
	}
}
