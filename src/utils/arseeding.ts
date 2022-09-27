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
  // const dataItem = await createAndSignItem(cfg.signer, data, opts)
  const dataItem = createData(data, cfg.signer, opts)
  await dataItem.sign(cfg.signer)
  const api = axios.create({ baseURL: cfg.arseedUrl })
  const header = {
    'Content-Type': 'application/octet-stream'
  } as any
  const res = await api.post(`/bundle/tx/${cfg.currency}`, dataItem.getRaw(), {
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
  const to = order.bundler
  const currency = order.currency
  const fee = order.fee * 1
  const decimals = order.decimals as number

  const result = await everpay.transfer({
    amount: new BigNumber(fee).dividedBy(new BigNumber(10).pow(decimals)).toString(),
    symbol: currency,
    to: to,
    data: {
      appName: 'arseeding',
      action: 'payment',
      itemIds: order.itemId
    }
  })
  return result.everHash
}
