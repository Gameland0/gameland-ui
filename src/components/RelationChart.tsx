import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import axios from 'axios'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import * as echarts from 'echarts/lib/echarts'
// import { TooltipComponent, LegendComponent } from 'echarts/components'
import 'echarts/lib/chart/graph'
import { useActiveWeb3React } from '../hooks'
import { filterAddress, formatting } from '../utils'
import { http, bschttp, polygonhttp } from './Store'
import { OPENSEA_API_KEY, MORALIS_KEY, PolygonContract, BscContract } from '../constants'
import { colorTable } from '../constants/colorTable'
// import { release } from 'os'
// import { resolve } from 'dns'
// import { add, reject } from 'lodash'
// import { logDOM } from '@testing-library/react'

const RelationChartBox = styled.div`
  #main {
    width: 100%;
    height: 640px;
  }
`
const Listings = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 90%;
  min-height: 240px;
  border: 1px solid rgb(229, 232, 235);
  border-radius: 10px;
  .title {
    width: 100%;
    height: 65px;
    border-bottom: 1px solid rgb(229, 232, 235);
    font-size: 20px;
    font-weight: 600;
    padding: 20px;
  }
`
const NoOrder = styled.div`
  height: 172px;
  font-size: 16px;
  text-align: center;
  background-color: rgb(248, 251, 255);
  line-height: 172px;
`
const OrderList = styled.div`
  .orderTitle {
    height: 40px;
    border-bottom: 1px solid rgb(229, 232, 235);
    line-height: 40px;
    div {
      text-align: center;
      flex: 2;
    }
  }
  .orderDetails {
    div {
      text-align: center;
      flex: 2;
    }
  }
`
const findAddressIndex = (arr: any, address: string) => {
  return arr.findIndex((item: any) => {
    return item.toLowerCase() === address.toLowerCase()
  })
}
export const RelationChart = () => {
  const { account } = useActiveWeb3React()
  const { state } = useLocation() as any
  const [orderData, setOrderData] = useState([] as any)
  const [optionData, setOptionData] = useState([] as any)
  const [optionLink, setOptionLink] = useState([] as any)
  const [NFTData, setNFTData] = useState([] as any)
  const { contractName } = useParams() as any
  let contractAddress: any
  let useraddress: any
  let chain: any
  if (state) {
    contractAddress = state.contractAddress
    useraddress = state.useraddress
    chain = state.chain
  } else {
    contractAddress = localStorage.getItem('contractAddress')
    useraddress = localStorage.getItem('useraddress')
    chain = localStorage.getItem('contractChain')
  }
  const getUserInfoAll = async () => {
    // const userinfoAll = await bschttp.get('v0/userinfo')
    let oldOwnersData
    if (chain === 'bsc') {
      oldOwnersData = await bschttp.get(`v0/old_owners/${contractAddress}`)
    } else {
      oldOwnersData = await polygonhttp.get(`v0/old_owners/${contractAddress}`)
    }
    const addressArr: any[] = []
    oldOwnersData.data.data.map((item: any) => {
      if (item.owner_now.toLowerCase() === account?.toLowerCase()) {
        addressArr.push(filterAddress(item.fromadd))
        addressArr.push(filterAddress(item.toadd))
      }
    })
    // setUsarDataAll(userinfoAll.data.data)
    const data: any[] = []
    Array.from(new Set(addressArr)).map((item: any, index: number) => {
      const object = {
        symbolSize: 65,
        name: formatting(item as string),
        itemStyle: {
          color: colorTable[index]
        }
      }
      data.push(object)
    })
    const linkData: any[] = []
    oldOwnersData.data.data.map((item: any) => {
      if (item.owner_now.toLowerCase() === account?.toLowerCase()) {
        const object = {
          source: findAddressIndex(Array.from(new Set(addressArr)), filterAddress(item.fromadd)),
          target: findAddressIndex(Array.from(new Set(addressArr)), filterAddress(item.toadd)),
          value: `send #${item.nftid}`,
          lineStyle: {
            color: colorTable[findAddressIndex(Array.from(new Set(addressArr)), filterAddress(item.fromadd))]
          }
        }
        linkData.push(object)
      }
    })
    setOptionData(data)
    setOptionLink(linkData)
  }
  useEffect(() => {
    if (state) {
      localStorage.setItem('contractAddress', state.contractAddress)
      localStorage.setItem('useraddress', state.useraddress)
      localStorage.setItem('contractChain', state.chain)
    }
    getUserInfoAll()
  }, [contractName])
  useEffect(() => {
    componentDidMount()
  }, [optionData, optionLink])
  const options = {
    animationDurationUpdate: 500,
    animationEasingUpdate: 'quinticInOut',
    animation: true,
    animationEasing: 'cubicInOut',
    animationThreshold: 2000,
    progressiveThreshold: 3000,
    progressive: 400,
    hoverLayerThreshold: 3000,
    useUTC: false,
    label: {
      normal: {
        show: true,
        textStyle: {
          fontSize: 24
        }
      }
    },
    series: [
      {
        name: 'Les Miserables',
        type: 'graph',
        layout: 'circular',
        symbolSize: 45,
        focusNodeAdjacency: true,
        roam: true,
        label: {
          normal: {
            show: true,
            textStyle: {
              fontSize: 12
            }
          }
        },
        force: {
          repulsion: 3000
        },
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          normal: {
            show: true,
            textStyle: {
              fontSize: 10
            },
            formatter: '{c}'
          }
        },
        data: optionData,
        links: optionLink,
        // data: [
        //   {
        //     name: formatting(account as string),
        //     symbolSize: 90,
        //     itemStyle: {
        //       color: colorTable[0]
        //     }
        //   },
        //   {
        //     name: '0x17...7cc3',
        //     symbolSize: 65,
        //     itemStyle: {
        //       color: colorTable[1]
        //     }
        //   },
        //   {
        //     name: '0x17...ccd3',
        //     symbolSize: 65
        //   },
        //   {
        //     name: '0x17...7cdc',
        //     symbolSize: 65
        //   },
        //   {
        //     name: '0x27...d6ab',
        //     symbolSize: 65
        //   },
        //   {
        //     name: '0x27...8a76',
        //     symbolSize: 65
        //   },
        //   {
        //     name: '0x27...992d',
        //     symbolSize: 65
        //   },
        //   {
        //     name: '0x27...629a',
        //     symbolSize: 65
        //   },
        //   {
        //     name: '0x27...aar5',
        //     symbolSize: 65
        //   }
        // ],
        // links: [
        //   {
        //     source: 0,
        //     target: 1,
        //     value: 'send #591987',
        //     lineStyle: {
        //       color: colorTable[0]
        //     }
        //   },
        //   {
        //     source: 0,
        //     target: 2,
        //     value: 'send #591987',
        //     lineStyle: {
        //       color: colorTable[0]
        //     }
        //   },
        //   {
        //     source: 0,
        //     target: 3,
        //     value: 'send #591987',
        //     lineStyle: {
        //       color: colorTable[0]
        //     }
        //   },
        //   {
        //     source: 0,
        //     target: 4,
        //     value: 'send #591987',
        //     lineStyle: {
        //       color: colorTable[0]
        //     }
        //   },
        //   {
        //     source: 1,
        //     target: 5,
        //     value: 'send #591987',
        //     lineStyle: {
        //       color: colorTable[1]
        //     }
        //   },
        //   {
        //     source: 6,
        //     target: 0,
        //     value: 'send #591987'
        //   },
        //   {
        //     source: 7,
        //     target: 6,
        //     value: 'send #591987'
        //   },
        //   {
        //     source: 2,
        //     target: 8,
        //     value: 'send #591987'
        //   },
        //   {
        //     source: 5,
        //     target: 6,
        //     value: 'send #591987'
        //   },
        //   {
        //     source: 8,
        //     target: 7,
        //     value: 'send #591987'
        //   }
        // ],
        lineStyle: {
          normal: {
            opacity: 1,
            width: 1,
            color: 'source',
            curveness: 0.3
          }
        },
        z: 2,
        coordinateSystem: 'view',
        legendHoverLink: true,
        edgeSymbol: ['none', 'arrow']
      }
    ]
  }
  const getPrice = (price: any) => {
    const Price = new BigNumber(price as unknown as string).dividedBy(new BigNumber(1000000000000000000))
    return Price.toString()
  }
  const filterNftData = (data: any) => {
    const filter = NFTData.filter((item: any) => {
      return item.token_id === data
    })
    return JSON.parse(filter[0].metadata).name
  }
  const getNftData = async () => {
    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY
    const BscNft = await http.get(`https://deep-index.moralis.io/api/v2/${useraddress}/nft?chain=bsc&format=decimal`)
    const polygonNft = await http.get(`
      https://deep-index.moralis.io/api/v2/${useraddress}/nft?chain=polygon&format=decimal`)
    const filterDataPolygon = polygonNft.data.result.filter((item: any) => {
      return PolygonContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
    })
    const filterDataBsc = BscNft.data.result.filter((item: any) => {
      return BscContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
    })
    setNFTData([...filterDataBsc, ...filterDataPolygon])
    const getdata = axios.create({
      timeout: 10000,
      headers: {
        'X-Api-Key': OPENSEA_API_KEY
      }
    })
    const filterData = [...filterDataBsc, ...filterDataPolygon].filter((item: any) => {
      return item.token_address.toLowerCase() === contractAddress.toLowerCase()
    })
    let tokenids = `https://api.opensea.io/v2/orders/matic/seaport/listings?asset_contract_address=${contractAddress}`
    filterData.map((item: any) => {
      tokenids = tokenids + `&token_ids=${item.token_id}`
    })
    if (filterData.length) {
      const orderData = await getdata.get(tokenids)
      setOrderData(orderData.data.orders)
    }
  }
  const componentDidMount = () => {
    const dom = document.getElementById('main') as HTMLDivElement
    const myChart = echarts.init(dom)
    myChart.setOption(options)
  }

  return (
    <RelationChartBox>
      {/* <Listings>
        <div className="title">Listings</div>
        {orderData && orderData.length ? (
          <OrderList>
            <div className="orderTitle flex flex-around">
              <div>Price</div>
              <div>Name</div>
              <div>NFTID</div>
              <div>Expiration</div>
              <div>From</div>
            </div>
            {orderData.map((item: any, index: any) => (
              <div key={index} className={(index + 1) % 2 == 0 ? 'orderDetails flex' : 'orderDetails flex bg'}>
                <div>{getPrice(item.current_price)} ETH</div>
                <div>{filterNftData(item.protocol_data.parameters.offer[0].identifierOrCriteria)}</div>
                <div>{formatting(item.protocol_data.parameters.offer[0].identifierOrCriteria)}</div>
                <div>{item.closing_date}</div>
                <div>{formatting(item.protocol_data.parameters.offerer)}</div>
              </div>
            ))}
          </OrderList>
        ) : (
          <NoOrder>No listings yet</NoOrder>
        )}
      </Listings> */}
      <div id="main"></div>
    </RelationChartBox>
  )
}
