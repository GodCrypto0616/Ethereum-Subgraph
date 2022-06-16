/* eslint-disable prefer-const */
import { Auction, Bid, Event, Item } from '../generated/schema'
import { BidSuccess, AuctionCreated, AuctionCanceled,AuctionFinalized} from '../generated/BoatsailAuction/BoatsailAuction'
import { constants } from '@amxx/graphprotocol-utils'

export function handleBidSuccess(event: BidSuccess): void {
  let auction = Auction.load(event.params._auctionId.toString())
  if (auction != null) {
    let bidId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
    let bid = new Bid(bidId)
    bid.timestamp = event.block.timestamp
    bid.txhash = event.transaction.hash.toHexString()
    bid.logIndex = event.transactionLogIndex

    bid.collection = auction.collection
    bid.tokenId = auction.tokenId
    bid.auctionId = event.params._auctionId
    bid.from = event.params._from
    bid.tokenAdr = event.params.tokenAdr.toHex()
    bid.bidPrice = event.params._price
    bid.save()

    let itemId = auction.collection.toHex() + '-' + auction.tokenId.toString()
    let item = Item.load(itemId)
    if (item) {
      item.lastBid = event.params._price
      item.save()
    }

    let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
    let eventItem = new Event(eventId)
    eventItem.timestamp = event.block.timestamp
    eventItem.txhash = event.transaction.hash.toHexString()
    eventItem.logIndex = event.transactionLogIndex

    eventItem.collection = auction.collection
    eventItem.tokenId = auction.tokenId
    eventItem.name = 'Bid'
    eventItem.from = event.params._from.toHex()
    eventItem.to = auction.owner.toHex()
    eventItem.tokenAdr = event.params.tokenAdr.toHex()
    eventItem.price = event.params._price	
    eventItem.save()
  }
}

export function handleAuctionCreated(event: AuctionCreated): void {
  let auction = Auction.load(event.params.auction.auctionId.toString())
  if (auction == null) {
    auction = new Auction(event.params.auction.auctionId.toString())
  }
  auction.timestamp = event.block.timestamp
  auction.txhash = event.transaction.hash.toHexString()
  auction.logIndex = event.transactionLogIndex

  auction.collection = event.params.auction.collectionId
  auction.tokenId = event.params.auction.tokenId
  auction.startTime = event.params.auction.startTime
  auction.endTime = event.params.auction.endTime
  auction.tokenAdr = event.params.auction.tokenAdr.toHex()
  auction.startPrice = event.params.auction.startPrice
  auction.owner = event.params.auction.owner  
  auction.active = true
  auction.save()

  let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
  let eventItem = new Event(eventId)
  eventItem.timestamp = event.block.timestamp
  eventItem.txhash = event.transaction.hash.toHexString()
  eventItem.logIndex = event.transactionLogIndex

  eventItem.collection = event.params.auction.collectionId
  eventItem.tokenId = event.params.auction.tokenId
  eventItem.name = 'Auction Created'
  eventItem.from = event.params.auction.owner.toHex()
  eventItem.to = ''
  eventItem.tokenAdr = event.params.auction.tokenAdr.toHex()
  eventItem.price = event.params.auction.startPrice	
  eventItem.save()
}

export function handleAuctionCanceled(event: AuctionCanceled): void {
  let auction = Auction.load(event.params._auctionId.toString())
  
  if (auction != null) {
    auction.timestamp = event.block.timestamp
    auction.txhash = event.transaction.hash.toHexString()
    auction.logIndex = event.transactionLogIndex

    auction.active = false
    auction.save()

    let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
    let eventItem = new Event(eventId)
    eventItem.timestamp = event.block.timestamp
    eventItem.txhash = event.transaction.hash.toHexString()
    eventItem.logIndex = event.transactionLogIndex

    eventItem.collection = auction.collection
    eventItem.tokenId = auction.tokenId
    eventItem.name = 'Auction Canceled'
    eventItem.from = ''
    eventItem.to = auction.owner.toHex()
    eventItem.tokenAdr = constants.ADDRESS_ZERO
    eventItem.price = constants.BIGINT_ZERO	
    eventItem.save()
  }
}

export function handleAuctionFinalized(event: AuctionFinalized): void {
  let auction = Auction.load(event.params.auction.auctionId.toString())
  
  if (auction != null) {
    auction.timestamp = event.block.timestamp
    auction.txhash = event.transaction.hash.toHexString()
    auction.logIndex = event.transactionLogIndex

    auction.active = false
    auction.save()

    let itemId = auction.collection.toHex() + '-' + auction.tokenId.toString()
    let item = Item.load(itemId)
    if (item) {
      let lastBidPrice = item.lastBid
      item.lastSold = lastBidPrice
      item.soldTimeStamp = event.block.timestamp
      item.save()
    }

    let eventId = event.transaction.hash.toHexString() + '-' + event.transactionLogIndex.toString()
    let eventItem = new Event(eventId)
    eventItem.timestamp = event.block.timestamp
    eventItem.txhash = event.transaction.hash.toHexString()
    eventItem.logIndex = event.transactionLogIndex

    eventItem.collection = auction.collection
    eventItem.tokenId = auction.tokenId
    eventItem.name = 'Auction Finalized'
    eventItem.from = event.params.auction.owner.toHex()
    eventItem.to = event.params.buyer.toHex()
    eventItem.tokenAdr = event.params.auction.tokenAdr.toHex() 
    eventItem.price = event.params.price    
    eventItem.save()
  }
}