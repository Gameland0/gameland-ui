import { createData, DataItemCreateOptions } from 'arseeding-arbundles'
import DataItem from 'arseeding-arbundles/src/DataItem'
import { Signer } from 'arseeding-arbundles/src/signing'
import axios from 'axios'
import Everpay from 'everpay'
import BigNumber from 'bignumber.js'
import key from '../constants/arweave-keyfile.json'

export interface Config {
  signer: Signer
  path: string
  currency: string
  arseedUrl: string
  apiKey?: string
}
export async function createAndSubmitItem(data: Buffer, opts: DataItemCreateOptions, cfg: Config): Promise<any> {
  const dataItem = await createAndSignItem(cfg.signer, data, opts)
  return await submit(cfg.arseedUrl, dataItem, cfg.currency, cfg.apiKey)
}

async function createAndSignItem(signer: Signer, data: Buffer, opts: DataItemCreateOptions): Promise<DataItem> {
  const dataItem = createData(data, signer, opts)
  await dataItem.sign(signer)
  return dataItem
}

async function submit(arseedingUrl: string, dataItem: DataItem, tokenSymbol: string, apiKey?: string): Promise<any> {
  const api = axios.create({ baseURL: arseedingUrl })
  let header = {
    'Content-Type': 'application/octet-stream'
  } as any
  if (apiKey != null) {
    header = {
      'Content-Type': 'application/octet-stream',
      'X-API-KEY': apiKey
    }
  }
  const res = await api.post(`/bundle/tx/${tokenSymbol}`, dataItem.getRaw(), {
    headers: header,
    maxBodyLength: Infinity,
    timeout: 10000
  })
  return res.data
}

export async function payBill(orders: any) {
  const pay = newEverpayByRSA(key, 'NUSdwUJYMoasVTqWfCowEy_q6-9lJI4CAenSyqr6R58')
  const everHash = await payOrder(pay, orders)
  return everHash
}

function newEverpayByRSA(arJWK: any, arAddress: string): Everpay {
  const everpay = new Everpay({
    account: arAddress,
    chainType: 'arweave' as any,
    arJWK: arJWK as any
  })
  return everpay
}
async function payOrder(everpay: Everpay, order: any): Promise<string> {
  const ords = []
  ords.push(order)
  return await payOrders(everpay, ords)
}

async function payOrders(everpay: Everpay, orders: any[]): Promise<string> {
  if (orders.length === 0) {
    return 'No Order Need to Pay'
  }
  const to = orders[0].bundler
  const currency = orders[0].currency
  let fee = 0
  const decimals = orders[0].decimals
  const ids = []
  for (const ord of orders) {
    ids.push(ord.itemId)
    fee += +ord.fee
  }

  const result = await everpay.transfer({
    amount: new BigNumber(fee).dividedBy(new BigNumber(10).pow(decimals)).toString(),
    symbol: currency,
    to: to,
    data: {
      appName: 'arseeding',
      action: 'payment',
      itemIds: ids
    }
  })
  return result.everHash
}
