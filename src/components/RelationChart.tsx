import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import axios from 'axios'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import * as echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/graph'
import { useActiveWeb3React } from '../hooks'
import { formatting } from '../utils'
import { http } from './Store'
import { OPENSEA_API_KEY, MORALIS_KEY, PolygonContract, BscContract } from '../constants'

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
export const RelationChart = () => {
  const { account } = useActiveWeb3React()
  const { state } = useLocation() as any
  const [orderData, setOrderData] = useState([] as any)
  const [NFTData, setNFTData] = useState([] as any)
  const { contractName } = useParams() as any
  let contractAddress: any
  let useraddress: any
  if (state) {
    contractAddress = state.contractAddress
    useraddress = state.useraddress
  } else {
    contractAddress = localStorage.getItem('contractAddress')
    useraddress = localStorage.getItem('useraddress')
  }
  useEffect(() => {
    if (state) {
      localStorage.setItem('contractAddress', state.contractAddress)
      localStorage.setItem('useraddress', state.useraddress)
    }
    getNftData()
    componentDidMount()
  }, [contractName])
  const options = {
    title: {
      text: ' Miserables',
      subtext: 'Default layout',
      top: 'bottom',
      left: 'right'
    },
    tooltip: {},
    colorBy: 'series',
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    label: {
      normal: {
        show: true,
        textStyle: {
          fontSize: 24
        }
      }
    },
    legend: {
      x: 'center',
      show: true,
      data: ['夫妻', '战友', '亲戚']
    },
    series: [
      {
        name: 'Les Miserables',
        type: 'graph',
        layout: 'none',
        symbolSize: 45,
        focusNodeAdjacency: true,
        roam: true,
        categories: [
          {
            name: '夫妻',
            itemStyle: {
              color: '#009800'
            }
          },
          {
            name: '战友',
            itemStyle: {
              normal: {
                color: '#4592FF'
              }
            }
          },
          {
            name: '亲戚',
            itemStyle: {
              normal: {
                color: '#3592F'
              }
            }
          }
        ],
        label: {
          normal: {
            show: true,
            textStyle: {
              fontSize: 12
            }
          }
        },
        force: {
          repulsion: 1000
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
        data: [
          {
            name: formatting(account as string),
            symbolSize: 90,
            draggable: true,
            x: -66.82776,
            y: 99.6904,
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '0x17...7cc3',
            symbolSize: 65,
            draggable: true,
            x: -126.82776,
            y: 199.6904,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '0x17...ccd3',
            symbolSize: 65,
            draggable: true,
            x: 166.82776,
            y: 199.6904,
            itemStyle: {
              color: '#fac858'
            }
          },
          {
            name: '0x17...7cdc',
            symbolSize: 65,
            draggable: true,
            x: 26.82776,
            y: 219.6904,
            itemStyle: {
              color: '#ee6666'
            }
          },
          {
            name: '0x27...d6ab',
            symbolSize: 65,
            draggable: true,
            x: -56.82776,
            y: 249.6904,
            itemStyle: {
              color: '#73c0de'
            }
          },
          {
            name: '0x27...8a76',
            symbolSize: 65,
            draggable: true,
            x: -186.82776,
            y: 259.6904,
            itemStyle: {
              color: '#3ba272'
            }
          },
          {
            name: '0x27...992d',
            symbolSize: 65,
            draggable: true,
            x: -266.82776,
            y: 199.6904,
            itemStyle: {
              color: '#fc8452'
            }
          },
          {
            name: '0x27...629a',
            symbolSize: 65,
            draggable: true,
            x: -226.82776,
            y: 49.6904,
            itemStyle: {
              color: '#9a60b4'
            }
          },
          {
            name: '0x27...aar5',
            symbolSize: 65,
            draggable: true,
            x: -26.82776,
            y: 19.6904,
            itemStyle: {
              color: '#ea7ccc'
            }
          }
        ],
        links: [
          {
            source: 0,
            target: 1,
            category: 0,
            value: 'send #591987'
          },
          {
            source: 0,
            target: 2,
            value: 'send #591987'
          },
          {
            source: 0,
            target: 3,
            value: 'send #591987'
          },
          {
            source: 0,
            target: 4,
            value: 'send #591987'
          },
          {
            source: 1,
            target: 5,
            value: 'send #591987'
          },
          {
            source: 6,
            target: 0,
            value: 'send #591987'
          },
          {
            source: 7,
            target: 6,
            value: 'send #591987'
          },
          {
            source: 2,
            target: 8,
            value: 'send #591987'
          },
          {
            source: 5,
            target: 6,
            value: 'send #591987'
          },
          {
            source: 8,
            target: 7,
            value: 'send #591987'
          }
        ],
        lineStyle: {
          normal: {
            opacity: 1,
            width: 1,
            type: 'solid',
            curveness: 0.3
          }
        },
        z: 2,
        coordinateSystem: 'view',
        legendHoverLink: true,
        edgeSymbol: ['circle', 'arrow']
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
    console.log(JSON.parse(filter[0].metadata))
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
      <Listings>
        <div className="title">Listings</div>
        {/* <NoOrder>No listings yet</NoOrder> */}
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
      </Listings>
      <div id="main"></div>
    </RelationChartBox>
  )
}
