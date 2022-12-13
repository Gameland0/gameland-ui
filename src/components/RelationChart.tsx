import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import axios from 'axios'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import * as echarts from 'echarts/lib/echarts'
// import { TooltipComponent, LegendComponent } from 'echarts/components'
import 'echarts/lib/chart/graph'
import { useActiveWeb3React } from '../hooks'
import { formatting } from '../utils'
import { http, bschttp } from './Store'
import { OPENSEA_API_KEY, MORALIS_KEY, PolygonContract, BscContract } from '../constants'
// import { add } from 'lodash'
import avatar1 from '../assets/icon_avatar_1.svg'
import avatar2 from '../assets/icon_avatar_2.png'
import { release } from 'os'
import { resolve } from 'dns'
import { add, reject } from 'lodash'
import { logDOM } from '@testing-library/react'

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
  const [usarDataAll, setUsarDataAll] = useState([] as any)
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
  const getUserInfoAll = async () => {
    const userinfoAll = await bschttp.get('v0/userinfo')
    setUsarDataAll(userinfoAll.data.data)
  }
  const getUserImage = (address: any) => {
    const data = usarDataAll.filter((item: any) => {
      return item.useraddress.toLowerCase() === address.toLowerCase()
    })
    if (data.length) {
      return data[0]?.image
    } else {
      return avatar1
    }
  }
  useEffect(()=> {
    if (state) {
      localStorage.setItem('contractAddress', state.contractAddress)
      localStorage.setItem('useraddress', state.useraddress)
    }
    getUserInfoAll()
  }, [contractName])
  useEffect(() => {
    // getNftData()
    componentDidMount()
    console.log(getUserImage(useraddress))
  }, [contractName])
  const options = {
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
    series: [
      {
        name: 'Les Miserables',
        type: 'graph',
        layout: 'none',
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
            x: 0,
            y: 0,
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
  const option = {
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    darkMode: 'auto',
    colorBy: 'series',
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    gradientColor: ['#f6efa6', '#d88273', '#bf444c'],
    aria: {
      decal: {
        decals: [
          {
            color: 'rgba(0, 0, 0, 0.2)',
            dashArrayX: [1, 0],
            dashArrayY: [2, 5],
            symbolSize: 1,
            rotation: 0.5235987755982988
          },
          {
            color: 'rgba(0, 0, 0, 0.2)',
            symbol: 'circle',
            dashArrayX: [
              [8, 8],
              [0, 8, 8, 0]
            ],
            dashArrayY: [6, 0],
            symbolSize: 0.8
          },
          {
            color: 'rgba(0, 0, 0, 0.2)',
            dashArrayX: [1, 0],
            dashArrayY: [4, 3],
            rotation: -0.7853981633974483
          },
          {
            color: 'rgba(0, 0, 0, 0.2)',
            dashArrayX: [
              [6, 6],
              [0, 6, 6, 0]
            ],
            dashArrayY: [6, 0]
          },
          {
            color: 'rgba(0, 0, 0, 0.2)',
            dashArrayX: [
              [1, 0],
              [1, 6]
            ],
            dashArrayY: [1, 0, 6, 0],
            rotation: 0.7853981633974483
          },
          {
            color: 'rgba(0, 0, 0, 0.2)',
            symbol: 'triangle',
            dashArrayX: [
              [9, 9],
              [0, 9, 9, 0]
            ],
            dashArrayY: [7, 2],
            symbolSize: 0.75
          }
        ]
      }
    },
    stateAnimation: {
      duration: 300,
      easing: 'cubicOut'
    },
    animation: true,
    animationDurationUpdate: 500,
    animationEasing: 'cubicInOut',
    animationThreshold: 2000,
    progressiveThreshold: 3000,
    progressive: 400,
    hoverLayerThreshold: 3000,
    useUTC: false,
    series: [
      {
        name: 'Les Miserables',
        type: 'graph',
        layout: 'none',
        data: [
          {
            id: '0',
            name: 'Myriel',
            symbolSize: 19.12381,
            x: -266.82776,
            y: 299.6904,
            value: 28.685715,
            category: 0,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '1',
            name: 'MmeBurgon',
            symbolSize: 4.495239333333333,
            x: 488.13535,
            y: 356.8573,
            value: 6.742859,
            category: 5,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '2',
            name: 'Valjean',
            symbolSize: 90,
            x: -87.93029,
            y: -6.8120565,
            value: 100,
            category: 1,
            symbol: `image://${getUserImage(useraddress)}`,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '3',
            name: 'Fantine',
            symbolSize: 28.266666666666666,
            x: -313.42786,
            y: -289.44803,
            value: 42.4,
            category: 2,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '4',
            name: 'Champmathieu',
            symbolSize: 11.809524666666666,
            x: -338.2307,
            y: 87.48405,
            value: 17.714287,
            category: 3,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '5',
            name: 'Gavroche',
            symbolSize: 41.06667066666667,
            x: 387.89572,
            y: 110.462326,
            value: 61.600006,
            category: 8,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '6',
            name: 'Marius',
            symbolSize: 35.58095333333333,
            x: 206.44687,
            y: -13.805411,
            value: 53.37143,
            category: 6,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '7',
            name: 'Thenardier',
            symbolSize: 30.095235333333335,
            x: 82.80825,
            y: -203.1144,
            value: 45.142853,
            category: 7,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            id: '8',
            name: 'Fauchelevent',
            symbolSize: 8.152382000000001,
            x: -225.73984,
            y: 82.41631,
            value: 12.228573,
            category: 4,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            }
          }
        ],
        links: [
          {
            source: '5',
            target: '1'
          },
          {
            source: '2',
            target: '0'
          },
          {
            source: '3',
            target: '2'
          },
          {
            source: '4',
            target: '2'
          },
          {
            source: '5',
            target: '2'
          },
          {
            source: '5',
            target: '7'
          },
          {
            source: '6',
            target: '2'
          },
          {
            source: '6',
            target: '5'
          },
          {
            source: '6',
            target: '7'
          },
          {
            source: '7',
            target: '2'
          },
          {
            source: '7',
            target: '3'
          },
          {
            source: '8',
            target: '2'
          }
        ],
        categories: [
          {
            name: 'A'
          },
          {
            name: 'B'
          },
          {
            name: 'C'
          },
          {
            name: 'D'
          },
          {
            name: 'E'
          },
          {
            name: 'F'
          },
          {
            name: 'G'
          },
          {
            name: 'H'
          },
          {
            name: 'I'
          }
        ],
        roam: true,
        label: {
          position: 'right',
          formatter: '{b}',
          show: true
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          width: 1,
          opacity: 0.5
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          },
          scale: true,
          label: {
            show: true
          },
          edgeLabel: {}
        },
        z: 2,
        coordinateSystem: 'view',
        legendHoverLink: true,
        circular: {
          rotateLabel: false
        },
        force: {
          initLayout: null,
          repulsion: [0, 50],
          gravity: 0.1,
          friction: 0.6,
          edgeLength: 30,
          layoutAnimation: true
        },
        left: 'center',
        top: 'center',
        symbol: 'circle',
        symbolSize: 10,
        edgeSymbol: ['none', 'none'],
        edgeSymbolSize: 10,
        edgeLabel: {
          position: 'middle',
          distance: 5
        },
        draggable: false,
        center: null,
        zoom: 1,
        nodeScaleRatio: 0.6,
        itemStyle: {},
        select: {
          itemStyle: {
            borderColor: '#212121'
          }
        }
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
    myChart.setOption(option)
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
