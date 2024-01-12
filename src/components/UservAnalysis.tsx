import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import * as echarts from 'echarts'
import { bschttp, http, newhttp, polygonhttp } from './Store'
import shortbutton from '../assets/short_button.jpg'
import longbutton from '../assets/long_button.jpg'
import loadd from '../assets/loading.svg'
import pieBg from '../assets/pie_bg.png'
import { AnalysisBox, CollationTable, PieOption, RelationChartOption, TableBox } from './MyPage'
import { formatting } from '../utils'
import { MORALIS_KEY } from '../constants'
import axios from 'axios'
import html2canvas from 'html2canvas'
import { toastify } from './Toastify'
import { colorTable } from '../constants/colorTable'
import { findAddressIndex } from './RelationChart'
import BigNumber from 'bignumber.js'

const Analysis = styled.div`
  margin-top: 20px;
  .lineCharts {
    width: 95%;
    height: 400px;
    position: absolute;
  }
  .pies {
    position: relative;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 10px;
    box-sizing: border-box;
  }
  .bg {
    background: url(${pieBg});
    background-size: 100% 100%;
  }
  .Download {
    width: 160px;
    height: 40px;
    background: #2FAFFF;
    box-shadow: 0px 0px 8px 0px rgba(0,19,47,0.1);
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 40px;
    text-align: center;
    margin: auto;
    margin-top: 20px;
  }

  @media screen and (min-width: 1440px) {
    .pies {
      width: 48%;
      height: 350px;
    }
    .lineCharts {
      height: 300px;
    }
  }
  @media screen and (min-width: 1920px) {
    .pies {
      width: 500px;
      height: 400px;
    }
  }
`

export const UservAnalysis = (data: any) => {
  const [PieChartData, setPieChartData] = useState([] as any)
  const [PopUpsData, setPopUpsData] = useState([] as any)
  const [tableDataAll, setTableDataAll] = useState([] as any)
  const [swapDataAll, setSwapDataAll] = useState([] as any)
  const [transactionAll, setTransactionAll] = useState([] as any)
  const [tableData, setTableData] = useState([] as any)
  const [swapData, setSwapData] = useState([] as any)
  const [transaction, setTransaction] = useState([] as any)
  const [interactAll, setInteractAll] = useState([] as any)
  const [interact, setInteract] = useState([] as any)
  const [washData, setWashData] = useState([] as any)
  const [washDataAll, setWashDataAll] = useState([] as any)
  const [poapData, setPoapData] = useState([] as any)
  const [showActivity, setShowActivity] = useState(false)
  const [loaddState, setLoaddState] = useState(false)
  const [collectionTab, setCollectionTab] = useState('Polygon')
  const [tokenTab, setTokenTab] = useState('Polygon')
  const [transactionTab, setTransactionTab] = useState('NFT')
  const [activityTab, setActivityTab] = useState('Chains')
  const [activityTab2, setActivityTab2] = useState('Lens')
  const [totalPage, setTotalPage] = useState(0)
  const [swapTotalPage, setSwapTotalPage] = useState(0)
  const [transactionTotalPage, setTransactionTotalPage] = useState(0)
  const [tablePage, setTablePage] = useState(0)
  const [swapPage, setSwapPage] = useState(0)
  const [interactPage, setInteractPage] = useState(0)
  const [transactionPage, setTransactionPage] = useState(0)
  const [bscTokenTotal, setBscTokenTotal] = useState(-1)
  const [ethTokenTotal, setEthTokenTotal] = useState(-1)
  const [polygonTokenTotal, setPolygonTokenTotal] = useState(-1)
  const [bscNFTTotal, setBscNFTTotal] = useState(-1)
  const [ethNFTTotal, setEthNFTTotal] = useState(-1)
  const [polygonNFTTotal, setPolygonNFTTotal] = useState(-1)
  const [bscColletionTotal, setBscColletionTotal] = useState(-1)
  const [ethColletionTotal, setEthColletionTotal] = useState(-1)
  const [polygonColletionTotal, setPolygonColletionTotal] = useState(-1)

  const tokenTotal = useMemo(() => {
    if (bscTokenTotal>=0 && ethTokenTotal>=0 && polygonTokenTotal>=0) {
      const total = bscTokenTotal + ethTokenTotal + polygonTokenTotal
      return total.toFixed(2)
    }
    return -1
  }, [bscTokenTotal, ethTokenTotal, polygonTokenTotal])
  const NFTTotal = useMemo(() => {
    if (bscNFTTotal>=0 && ethNFTTotal>=0 && polygonNFTTotal>=0) {
      const total = bscNFTTotal + ethNFTTotal + polygonNFTTotal
    return total
    }
    return -1
  }, [bscNFTTotal, ethNFTTotal, polygonNFTTotal])
  const colletionTotal = useMemo(() => {
    if (bscColletionTotal>=0 && ethColletionTotal>=0 && polygonColletionTotal>=0) {
      const total = bscColletionTotal + ethColletionTotal + polygonColletionTotal
      return total
    }
    return -1
  }, [bscColletionTotal, ethColletionTotal, polygonColletionTotal])
  useEffect(() => {
    getPieChartData()
    detectionAddress()
  }, [data.useraddress])
  useEffect(() => {
    if (PieChartData&&PieChartData.length) {
      componentDidMount()
      getTokensData()
      setCollectionPie()
      getLensData()
    }
  }, [PieChartData])
  useEffect(() => {
    if (interactAll&&interactAll.length) {
      setRelationChart()
    }
  }, [interactAll])
  const detectionAddress = async () => {
    const lens_profiles = await newhttp.get(`v0/lens_profiles/${data.useraddress}`)
    const lens_cache = await newhttp.get(`v0/lens_cache/${data.useraddress}`)
    if (!lens_profiles.data.data.length&&!lens_cache.data.data.length) {
      const params = {
        address: data.useraddress,
      }
      newhttp.post(`v0/lens_cache`, params)
    }
  }
  const getLensData = async () => {
    const timearr = [] as any
    const post = [] as any
    const mint = [] as any
    const share = [] as any
    const follow = [] as any
    const comment = [] as any
    const seriespost = [] as any
    const seriesmint = [] as any
    const seriesshare = [] as any
    const seriesfollow = [] as any
    const seriescomment = [] as any
    const poap = [] as any
    const Snapshot = [] as any
    const SnapshotTime = [] as any
    const seriesvote = [] as any
    PieChartData?.map((item: any) => {
      console.log(item.platform)
      if (item.platform === 'Lens') {
        const filterdata = timearr.filter((ele: any) => {
          return ele === new Date(item.timestamp*1000).toJSON().substr(5, 5)
        })
        if (!filterdata.length) {
          timearr.push(new Date(item.timestamp*1000).toJSON().substr(5, 5))
        }
        if (item.type === 'post') {
          post.push(item)
        }
        if (item.type === 'mint') {
          mint.push(item)
        }
        if (item.type === 'share') {
          share.push(item)
        }
        if (item.type === 'follow') {
          follow.push(item)
        }
        if (item.type === 'comment') {
          comment.push(item)
        }
      }
      if (item.tag === 'collectible') {
        item.actions.map((ele: any) => {
          const index = ele.metadata.name?.indexOf('POAP')
          if (index>=0) {
            const chains = item.network === 'binance_smart_chain' ? 'BNB' : item.network
            let prices
            if (ele.metadata.cost) {
              prices = new BigNumber(ele.metadata.cost.value).div(`1e${ele.metadata.cost.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.cost?.symbol
            } else {
              prices = 0
            }
            poap.push({
              collation: ele.metadata.name,
              nftname: ele.metadata.title,
              price: prices,
              chain: chains,
              platform: item.platform,
              type: ele.type,
              time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
            })
          }
        })
      }
      if (item.platform === 'Snapshot') {
        const filterdata = SnapshotTime.filter((ele: any) => {
          return ele === new Date(item.timestamp*1000).toJSON().substr(5, 5)
        })
        if (!filterdata.length) {
          SnapshotTime.push(new Date(item.timestamp*1000).toJSON().substr(5, 5))
        }
        Snapshot.push(item)
      }
    })
    setPoapData(poap)
    timearr.map((item: any) => {
      const filterpost = post.filter((ele: any) => {
        return item === new Date(ele.timestamp*1000).toJSON().substr(5, 5)
      })
      const filtermint = mint.filter((ele: any) => {
        return item === new Date(ele.timestamp*1000).toJSON().substr(5, 5)
      })
      const filtershare = share.filter((ele: any) => {
        return item === new Date(ele.timestamp*1000).toJSON().substr(5, 5)
      })
      const filterfollow = follow.filter((ele: any) => {
        return item === new Date(ele.timestamp*1000).toJSON().substr(5, 5)
      })
      const filtercomment = comment.filter((ele: any) => {
        return item === new Date(ele.timestamp*1000).toJSON().substr(5, 5)
      })
      seriespost.push(filterpost.length)
      seriesmint.push(filtermint.length)
      seriesshare.push(filtershare.length)
      seriesfollow.push(filterfollow.length)
      seriescomment.push(filtercomment.length)
    })
    SnapshotTime.map((item: any) => {
      const filtervote = Snapshot.filter((ele: any) => {
        return item === new Date(ele.timestamp*1000).toJSON().substr(5, 5)
      })
      seriesvote.push(filtervote.length)
    })
    const options = {
      title: {
        text: 'Lens Activity',
        top : '90%',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis' as any
      },
      legend: {
        data: ['post','comment','mint','follow','share']
      },
      xAxis: {
        data: timearr
      },
      yAxis: {
        type: 'value' as any
      },
      series: [{
        name: 'post',
        type: 'line',
        data: seriespost
      },{
        name: 'mint',
        type: 'line',
        data: seriesmint
      },{
        name: 'follow',
        type: 'line',
        data: seriesfollow
      },{
        name: 'share',
        type: 'line',
        data: seriesshare
      },{
        name: 'comment',
        type: 'line',
        data: seriescomment
      }]
    }
    const Lensdom = document.getElementById('ActivityLens') as HTMLDivElement
    const LensChart = echarts.init(Lensdom)
    LensChart.setOption(options)
    // LensChart.on('click', LensChartClick)
    if (Snapshot.length) {
      const Snapshotoptions = {
        title: {
          text: 'Snapshot Activity',
          top : '90%',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis' as any
        },
        legend: {
          data: ['vote']
        },
        xAxis: {
          data: SnapshotTime
        },
        yAxis: {
          type: 'value' as any
        },
        series: [{
          name: 'vote',
          type: 'line',
          data: seriesvote
        }]
      }
      const Snapshotdom = document.getElementById('ActivitySnapshot') as HTMLDivElement
      const SnapshotChart = echarts.init(Snapshotdom)
      SnapshotChart.setOption(Snapshotoptions)
    }
    // SnapshotChart.on('click', SnapshotChartClick)
  }
  const getPieChartData = () => {
    setLoaddState(true)
    const parm = {
      action_limit: 10,
      limit: 500,
      account: [
        data.useraddress
      ]
    }
    http
      .post(`https://api.rss3.io/data/accounts/activities`, parm)
      .then((vals) => {
        if (vals.data.error_code) {
          toastify.error('Only support for wallet addresses.')
        } else {
          setPieChartData(vals.data.data)
        }
        setLoaddState(false)
      })
      .catch((e)=> {
        setLoaddState(false)
        toastify.error('Failed to get data.')
      })
  }
  const componentDidMount = () => {
    if (PieChartData && PieChartData.length) {
      const chainarr: any[] = []
      const collationarr: any[] = []
      const timearr: any[] = []
      const tagarr: any[] = []
      const Tokensarr: any[] = []
      const Tabledata = [] as any
      const swapdata = [] as any
      const transactionData = [] as any
      const interactArr = [] as any
      const currentTime = new Date().getTime()
      const OATData = [] as any
      const OATtime = [] as any
      PieChartData?.map((item: any) => {
        chainarr.push(item.network)
        tagarr.push(item.tag)
        if (new Date(item.timestamp).getTime() > currentTime - (604800000 * 4)) {
          interactArr.push(item)
        }
        if (item.tag === 'collectible' && item.actions[0].metadata.name) {
          collationarr.push(item.actions[0].metadata.name)
        }
        if (item.tag === 'exchange' && item.type === 'swap') {
          item.actions.map((ele: any) => {
            if (ele.type === 'swap') {
              const chains = item.network === 'binance_smart_chain' ? 'BNB' : item.network
              swapdata.push({
                sent: new BigNumber(ele.metadata.from.value).div(`1e${ele.metadata.from.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.from.symbol,
                received: new BigNumber(ele.metadata.to.value).div(`1e${ele.metadata.to.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.to.symbol,
                type: 'Swap',
                platform: item.platform,
                chain: chains,
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
          })
        }
        if (item.tag === 'transaction') {
          item.actions.map((ele: any) => {
            const chains = item.network === 'binance_smart_chain' ? 'BNB' : item.network
            if (ele.type === 'mint' && ele.to?.toLowerCase() === data.useraddress?.toLowerCase()) {
              transactionData.push({
                sent: formatting(ele.from),
                received: formatting(ele.to),
                price: new BigNumber(ele.metadata.value).div(`1e${ele.metadata.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.symbol,
                type: 'Mint',
                chain: chains,
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
            if (ele.type === 'approval') {
              transactionData.push({
                sent: formatting(ele.from),
                received: formatting(ele.to),
                price: 0,
                type: 'Approval',
                chain: chains,
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
            if (ele.type === 'transfer' && ele.to?.toLowerCase() === data.useraddress?.toLowerCase()) {
              transactionData.push({
                sent: formatting(ele.from),
                received: formatting(ele.to),
                price: new BigNumber(ele.metadata.value).div(`1e${ele.metadata.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.symbol,
                type: 'Claim',
                chain: chains,
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
            if (ele.type === 'transfer' && ele.from?.toLowerCase() === data.useraddress?.toLowerCase()) {
              transactionData.push({
                sent: formatting(ele.from),
                received: formatting(ele.to),
                price: new BigNumber(ele.metadata.value).div(`1e${ele.metadata.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.symbol,
                type: 'Sent',
                chain: chains,
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
          })
        }
        if (item.tag === 'collectible' && item.type === 'mint') {
          item.actions.map((ele: any) => {
            if (ele.type === 'mint'&&!ele.from) {
              const chains = item.network === 'binance_smart_chain' ? 'BNB' : item.network
              let prices
              if (ele.metadata.cost) {
                prices = new BigNumber(ele.metadata.cost.value).div(`1e${ele.metadata.cost.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.cost?.symbol
              } else {
                prices = 0
              }
              Tabledata.push({
                collation: ele.metadata.name,
                nftname: ele.metadata.title,
                price: prices,
                chain: chains,
                type: 'Mint',
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
          })
        }
        if (item.tag === 'collectible' && item.type === 'trade') {
          item.actions.map((ele: any) => {
            if (ele.type === 'trade') {
              const chains = item.network === 'binance_smart_chain' ? 'BNB' : item.network
              let prices
              if (ele.metadata.cost) {
                prices = new BigNumber(ele.metadata.cost.value).div(`1e${ele.metadata.cost.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.cost?.symbol
              } else {
                prices = 0
              }
              Tabledata.push({
                collation: ele.metadata.name,
                nftname: ele.metadata.title,
                price: prices,
                chain: chains,
                platform: item.platform,
                type: ele.from?.toLowerCase() === data.useraddress?.toLowerCase() ? 'Sold' : 'Bought',
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
          })
        }
        if (item.tag === 'collectible') {
          item.actions.map((ele: any) => {
            if (ele.metadata.collection=== 'Galaxy OAT') {
              const filterTime = OATtime.filter((val: any) => {
                return val === new Date(item.timestamp*1000).toJSON().substr(5, 5)
              })
              if (filterTime.length===0) {
                OATtime.push(new Date(item.timestamp*1000).toJSON().substr(5, 5))
              }
              const chains = item.network === 'binance_smart_chain' ? 'BNB' : item.network
              let prices
              if (ele.metadata.cost) {
                prices = new BigNumber(ele.metadata.cost.value).div(`1e${ele.metadata.cost.decimals}`).toNumber().toFixed(2) + ' ' + ele.metadata.cost?.symbol
              } else {
                prices = 0
              }
              OATData.push({
                collation: ele.metadata.collection,
                nftname: ele.metadata.name,
                price: prices,
                chain: chains,
                platform: item.platform,
                type: ele.from?.toLowerCase() === data.useraddress?.toLowerCase() ? 'Sold' : 'Bought',
                time: new Date(item.timestamp*1000).toJSON().substr(0, 10)
              })
            }
          })
        }
        if (item.tag === 'exchange') {
          item.actions.map((ele: any) => {
            if (ele.from?.toLowerCase() === data.useraddress?.toLowerCase()) {
              if (ele.type === 'swap') {
                Tokensarr.push(ele.metadata.from.symbol)
                Tokensarr.push(ele.metadata.to.symbol)
              } else {
                Tokensarr.push(ele.metadata.symbol)
              }
            }
          })
        }
        timearr.push(new Date(item.timestamp*1000).toJSON().substr(0, 10))
      })
      setTableDataAll(Tabledata)
      setSwapDataAll(swapdata)
      setTransactionAll(transactionData)
      setTableData(Tabledata.slice(0, 10))
      setSwapData(swapdata.slice(0, 10))
      setTransaction(transactionData.slice(0, 10))
      setTotalPage(Math.ceil(Tabledata.length / 10))
      setSwapTotalPage(Math.ceil(swapdata.length / 10))
      setTransactionTotalPage(Math.ceil(transactionData.length / 10))
      setInteractAll(interactArr)
      const chainarrDeduplication = [...new Set(chainarr)]
      const Chainsoptionsdata: any[] = []
      chainarrDeduplication.map((item) => {
        const quantity = chainarr.filter((ele) => {
          return ele === item
        })
        Chainsoptionsdata.push({ value: quantity.length, name: item })
      })
      const collationarrDeduplication = [...new Set(collationarr)].slice(0, 10)
      const tagarrDeduplication = [...new Set(tagarr)]
      const timearrDeduplication = [...new Set(timearr)].slice(0, 15)
      const Activityoptionsseries: any[] = []
      const xAxisdata: any[] = []
      timearrDeduplication.map((item) => {
        xAxisdata.push(item.substr(5, 5))
      })
      const Preferredoptionsdata: any[] = []
      tagarrDeduplication.map((item) => {
        const quantity = PieChartData.filter((ele: any) => {
          return ele.tag === item
        })
        Preferredoptionsdata.push({ value: quantity.length, name: item })
      })
      chainarrDeduplication.map((item) => {
        const seriesdata: any[] = []
        timearrDeduplication.map((ele) => {
          const filtertime = PieChartData.filter((data: any) => {
            return new Date(data.timestamp*1000).toJSON().indexOf(ele) !== -1
          })
          const filtertag = filtertime.filter((data: any) => {
            return data.network === item
          })
          seriesdata.push(filtertag.length)
        })
        Activityoptionsseries.push({
          name: item,
          type: 'line',
          data: seriesdata
        })
      })
      const collationActivity = [] as any
      collationarrDeduplication.map((item: any) => {
        const seriesdata = [] as any
        timearrDeduplication.map((ele) => {
          const filtertime = PieChartData.filter((data: any) => {
            return new Date(data.timestamp*1000).toJSON().indexOf(ele) !== -1
          })
          const filtercollation = filtertime.filter((data: any) => {
            if (data.actions[0]?.metadata) {
              return data.actions[0].metadata?.name === item
            }
          })
          seriesdata.push(filtercollation.length)
        })
        collationActivity.push({
          name: item,
          type: 'line',
          data: seriesdata
        })
      })
      const Activityoptions = {
        title: {
          text: 'Activity',
          top : '90%',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis' as any
        },
        legend: {
          data: chainarrDeduplication
        },
        xAxis: {
          data: xAxisdata
        },
        yAxis: {
          type: 'value' as any
        },
        series: Activityoptionsseries
      }
      const collationActivityoption = {
        title: {
          text: 'Activity',
          top : '90%',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis' as any
        },
        legend: {
          data: collationarrDeduplication
        },
        xAxis: {
          data: xAxisdata
        },
        yAxis: {
          type: 'value' as any
        },
        series: collationActivity
      }
      const OATseriesdata = [] as any
      OATtime.map((item: any) => {
        const data = OATData.filter((ele: any) => {
          return item === ele.time.substr(5, 5)
        })
        OATseriesdata.push(data.length)
      })
      const OAToptions = {
        title: {
          text: 'Galxe OAT Activity',
          top : '90%',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis' as any
        },
        legend: {
          data: []
        },
        xAxis: {
          data: OATtime
        },
        yAxis: {
          type: 'value' as any
        },
        series: [{
          name: 'OAT',
          type: 'line',
          data: OATseriesdata
        }]
      }
      const Chainsdom = document.getElementById('Chains') as HTMLDivElement
      const ChainsChart = echarts.init(Chainsdom)
      ChainsChart.setOption(PieOption('Chains', Chainsoptionsdata))
      const Preferreddom = document.getElementById('Preferred') as HTMLDivElement
      const PreferredChart = echarts.init(Preferreddom)
      PreferredChart.setOption(PieOption('Preferred Domains', Preferredoptionsdata))
      const Activitydom = document.getElementById('Activity') as HTMLDivElement
      const ActivityChart = echarts.init(Activitydom)
      ActivityChart.setOption(Activityoptions)
      ActivityChart.on('click', chainActivityClick)
      const collationActivitydom = document.getElementById('collationActivity') as HTMLDivElement
      const collationActivityChart = echarts.init(collationActivitydom)
      collationActivityChart.setOption(collationActivityoption)
      collationActivityChart.on('click', collationActivityClick)
      if (OATData.length) {
        const OATdom = document.getElementById('ActivityOAT') as HTMLDivElement
        const OATChart = echarts.init(OATdom)
        OATChart.setOption(OAToptions)
      }
    }
  }
  const setCollectionPie = () => {
    const getdata = axios.create({
      timeout: 100000,
      headers: {
        'X-API-Key': MORALIS_KEY
      }
    })
    getdata.get(`https://deep-index.moralis.io/api/v2/${data.useraddress}/nft?chain=bsc&format=decimal`).then((vals) => {
      const addressArr = [] as any
      vals.data.result.map((item: any) => {
        addressArr.push(item.name)
      })
      const addressArrDeduplication = [...new Set(addressArr)]
      setBscColletionTotal(addressArrDeduplication.length)
      const optionData = [] as any
      addressArrDeduplication.slice(0, 15).map((item: any) => {
        const data = vals.data.result.filter((ele: any) => {
          return ele.name === item
        })
        optionData.push({ value: data.length, name: item })
      })
      let NFTTotal = 0
      addressArrDeduplication.map((item: any) => {
        const data = vals.data.result.filter((ele: any) => {
          return ele.name === item
        })
        NFTTotal = NFTTotal +data.length
      })
      setBscNFTTotal(NFTTotal)
      const Collationdom = document.getElementById('bscCollation') as HTMLDivElement
      const CollationChart = echarts.init(Collationdom)
      CollationChart.setOption(PieOption('Colletion', optionData))
    })
    getdata.get(`https://deep-index.moralis.io/api/v2/${data.useraddress}/nft?chain=polygon&format=decimal`).then((vals) => {
      const addressArr = [] as any
      vals.data.result.map((item: any) => {
        addressArr.push(item.name)
      })
      const addressArrDeduplication = [...new Set(addressArr)]
      setPolygonColletionTotal(addressArrDeduplication.length)
      const optionData = [] as any
      addressArrDeduplication.slice(0, 15).map((item: any) => {
        const data = vals.data.result.filter((ele: any) => {
          return ele.name === item
        })
        optionData.push({ value: data.length, name: item })
      })
      let NFTTotal = 0
      addressArrDeduplication.map((item: any) => {
        const data = vals.data.result.filter((ele: any) => {
          return ele.name === item
        })
        NFTTotal = NFTTotal +data.length
      })
      setPolygonNFTTotal(NFTTotal)
      const Collationdom = document.getElementById('polygonCollation') as HTMLDivElement
      const CollationChart = echarts.init(Collationdom)
      CollationChart.setOption(PieOption('Colletion', optionData))
    })
    getdata.get(`https://deep-index.moralis.io/api/v2/${data.useraddress}/nft?chain=eth&format=decimal`).then((vals) => {
      const addressArr = [] as any
      vals.data.result.map((item: any) => {
        addressArr.push(item.name)
      })
      const addressArrDeduplication = [...new Set(addressArr)]
      setEthColletionTotal(addressArrDeduplication.length)
      const optionData = [] as any
      addressArrDeduplication.slice(0, 15).map((item: any) => {
        const data = vals.data.result.filter((ele: any) => {
          return ele.name === item
        })
        optionData.push({ value: data.length, name: item })
      })
      let NFTTotal = 0
      addressArrDeduplication.map((item: any) => {
        const data = vals.data.result.filter((ele: any) => {
          return ele.name === item
        })
        NFTTotal = NFTTotal +data.length
      })
      setEthNFTTotal(NFTTotal)
      const Collationdom = document.getElementById('ethCollation') as HTMLDivElement
      const CollationChart = echarts.init(Collationdom)
      CollationChart.setOption(PieOption('Colletion', optionData))
    })
  }
  const setRelationChart = () => {
    const addressArr = [] as any
    interactAll.map((item: any) => {
      if (item.from) {
        addressArr.push(item.from)
      }
      if (item.to) {
        addressArr.push(item.to)
      }
    })
    const addressArrDeduplication = [...new Set(addressArr)]
    const optionData = [] as any
    const linkData = [] as any
    addressArrDeduplication.map((item: any, index: number) => {
      const object = {
        symbolSize: item?.toLowerCase() === data.useraddress?.toLowerCase() ? 60 : 40,
        name: formatting(item as string),
        itemStyle: {
          color: colorTable[index]
        }
      }
      optionData.push(object)
    })
    interactAll.map((item: any) => {
      const object = {
        source: findAddressIndex(Array.from(new Set(addressArr)), item.from),
        target: findAddressIndex(Array.from(new Set(addressArr)), item.to),
        value: `${item.type === 'transfer'
          ? (item.type +' '+(item.actions[0].metadata.value_display * 1).toFixed(2)+' '+item.actions[0].metadata.symbol) || formatting(item.actions[0].metadata.id)
          : item.type}`,
        lineStyle: {
          color: colorTable[findAddressIndex(Array.from(new Set(addressArr)), item.to)]
        }
      }
      linkData.push(object)
    })
    const relationDom = document.getElementById('relation') as HTMLDivElement
    const relationChart = echarts.init(relationDom)
    relationChart.setOption(RelationChartOption('Player Relationship',optionData,linkData))
  }
  const getTokensData = async () => {
    polygonhttp.get(`v0/oklink/addressBalance?chainShortName=bsc&address=${data.useraddress}&protocolType=token_20`).then((vals) => {
      const Tokensoptionsdata = [] as any
      let tokenTotal = 0
      vals.data.data[0].tokenList.map((item: any) => {
        if (item.priceUsd * 1 > 0) {
          Tokensoptionsdata.push({ value: (item.valueUsd*1).toFixed(2), name: item.token+'($)' })
        }
        tokenTotal = tokenTotal + (item.valueUsd*1)
      })
      setBscTokenTotal(tokenTotal)
      const BSCTokensdom = document.getElementById('BSCTokens') as HTMLDivElement
      const BSCTokensChart = echarts.init(BSCTokensdom)
      BSCTokensChart.setOption(PieOption('Tokens', Tokensoptionsdata))
    })
    polygonhttp.get(`v0/oklink/addressBalance?chainShortName=polygon&address=${data.useraddress}&protocolType=token_20`).then((vals) => {
      const Tokensoptionsdata = [] as any
      let tokenTotal = 0
      vals.data.data[0].tokenList.map((item: any) => {
        if (item.priceUsd * 1 > 0) {
          Tokensoptionsdata.push({ value: (item.valueUsd*1).toFixed(2), name: item.token+'($)' })
        }
        tokenTotal = tokenTotal + (item.valueUsd*1)
      })
      setPolygonTokenTotal(tokenTotal)
      const PolygonTokensdom = document.getElementById('PolygonTokens') as HTMLDivElement
      const PolygonTokensChart = echarts.init(PolygonTokensdom)
      PolygonTokensChart.setOption(PieOption('Tokens', Tokensoptionsdata))
    })
    polygonhttp.get(`v0/oklink/addressBalance?chainShortName=ETH&address=${data.useraddress}&protocolType=token_20`).then((vals) => {
      const Tokensoptionsdata = [] as any
      let tokenTotal = 0
      vals.data.data[0].tokenList.map((item: any) => {
        if (item.priceUsd * 1 > 0) {
          Tokensoptionsdata.push({ value: (item.valueUsd*1).toFixed(2), name: item.token+'($)' })
        }
        tokenTotal = tokenTotal + (item.valueUsd*1)
      })
      setEthTokenTotal(tokenTotal)
      const ETHTokensdom = document.getElementById('ETHTokens') as HTMLDivElement
      const ETHTokensChart = echarts.init(ETHTokensdom)
      ETHTokensChart.setOption(PieOption('Tokens', Tokensoptionsdata))
    })
  }
  const chainActivityClick = (params: any) => {
    const data = PieChartData.filter((item: any) => {
      return item.network === params.seriesName && new Date(item.timestamp*1000).toJSON().substr(5, 5) === params.name
    })
    setPopUpsData(data)
    setShowActivity(true)
  }
  const collationActivityClick = (params: any) => {
    const data = PieChartData.filter((item: any) => {
      return new Date(item.timestamp*1000).toJSON().substr(5, 5) === params.name && item.tag === 'collectible' && item.actions[0].metadata.collection === params.seriesName
    })
    setPopUpsData(data)
    setShowActivity(true)
  }
  const nextPage = (index: number, type: string) => {
    if (type === 'NFT') {
      setTablePage(index)
      setTableData(tableDataAll.slice(10 * index, 10 * index + 10))
    }
    if (type === 'Defi') {
      setSwapPage(index)
      setSwapData(swapDataAll.slice(10 * index, 10 * index + 10))
    }
    if (type === 'Transaction') {
      setTransactionPage(index)
      setTransaction(transactionAll.slice(10 * index, 10 * index + 10))
    }
    if (type === 'interact') {
      setInteractPage(index)
      setInteract(interactAll.slice(10 * index, 10 * index + 10))
    }
  }
  const download = () => {
    const dom = document.getElementById('download') as HTMLElement
    html2canvas(dom).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      saveFile(imgData, 'download')
    })
  }
  const saveFile = (data: any, name: string) => {
    const a = document.createElement('a')
    a.style.display = 'none'
    const event = new MouseEvent('click')
    a.download = name
    a.href = data
    a.dispatchEvent(event)
  }

  return (
    <Analysis>
      {loaddState ? (
        <div>
          <div className="flex flex-justify-content">
            <img src={loadd} alt="" />
          </div>
        </div>
      ) : ''}
      {PieChartData.length ? (
        <AnalysisBox id="download">
          <div className="pieitem flex flex-column-between">
            <div className="pies bg">
              <div id="Chains" className="lineCharts"></div>
            </div>
            <div className="pies bg">
              <div className="tabs flex">
                <div onClick={() => setCollectionTab('Polygon')}>
                  Polygon
                  {collectionTab === 'Polygon' ? <img src={shortbutton} /> : ''}
                </div>
                <div onClick={() => setCollectionTab('BNB')}>
                  BNB
                  {collectionTab === 'BNB' ? <img src={longbutton} /> : ''}
                </div>
                <div onClick={() => setCollectionTab('Ethereum')}>
                  Ethereum
                  {collectionTab === 'Ethereum' ? <img src={longbutton} /> : ''}
                </div>
              </div>
              <div id="polygonCollation" className={collectionTab === 'Polygon' ? 'lineCharts' : 'lineChart none'}></div>
              <div id="bscCollation" className={collectionTab === 'BNB' ? 'lineCharts' : 'lineChart none'}></div>
              <div id="ethCollation" className={collectionTab === 'Ethereum' ? 'lineCharts' : 'lineChart none'}></div>
            </div>
          </div>
          <div className="pieitem flex flex-column-between">
            <div className="pies bg">
              <div className="tabs flex">
                <div onClick={() => setTokenTab('Polygon')}>
                  Polygon
                  {tokenTab === 'Polygon' ? <img src={shortbutton} /> : ''}
                </div>
                <div onClick={() => setTokenTab('BNB')}>
                  BNB
                  {tokenTab === 'BNB' ? <img src={longbutton} /> : ''}
                </div>
                <div onClick={() => setTokenTab('Ethereum')}>
                  Ethereum
                  {tokenTab === 'Ethereum' ? <img src={longbutton} /> : ''}
                </div>
              </div>
              <div id="PolygonTokens" className={tokenTab === 'Polygon' ? 'lineCharts' : 'lineChart none'}></div>
              <div id="BSCTokens" className={tokenTab === 'BNB' ? 'lineCharts' : 'lineChart none'}></div>
              <div id="ETHTokens" className={tokenTab === 'Ethereum' ? 'lineCharts' : 'lineChart none'}></div>
            </div>
            <div className="pies bg">
              <div id="Preferred" className="lineCharts"></div>
            </div>
          </div>
          <TableBox className="bg">
            <div className="tabs flex">
              <div onClick={() => setTransactionTab('NFT')}>
                NFT
                {transactionTab === 'NFT' ? <img src={shortbutton} /> : ''}
              </div>
              <div onClick={() => setTransactionTab('DeFi')}>
                DeFi
                {transactionTab === 'DeFi' ? <img src={shortbutton} /> : ''}
              </div>
              <div onClick={() => setTransactionTab('Token')}>
                Token
                {transactionTab === 'Token' ? <img src={shortbutton} /> : ''}
              </div>
              <div onClick={() => setTransactionTab('Poap')}>
                POAP
                {transactionTab === 'Poap' ? <img src={shortbutton} /> : ''}
              </div>
              <div onClick={() => setTransactionTab('Wash')}>
                Wash Trading
                {transactionTab === 'Wash' ? <img src={shortbutton} /> : ''}
              </div>
            </div>
            <CollationTable className={transactionTab === 'NFT' ? '' : 'none'}>
              <div className="title">NFT Transactions</div>
              <div className="tab flex">
                  <div>Time</div>
                  <div>Colletion</div>
                  <div>NFT Name</div>
                  <div>Price</div>
                  <div>Chain</div>
                  <div>Type</div>
              </div>
              {tableData && tableData.length ? (
                tableData.map((item: any, index: number) => (
                  <div className={(index + 1) % 2 === 0 ? 'tableContent flex bag' : 'tableContent flex'} key={index}>
                    <div>{item?.time}</div>
                    <div>{item?.collation}</div>
                    <div>{item?.nftname}</div>
                    <div>{item?.price}</div>
                    <div>{item?.chain}</div>
                    <div>{item?.type}</div>
                  </div>
                ))
              ) : (
                <div className="Notrecords flex flex-justify-content">No records</div>
              )}
              <div className="tablePage flex">
                {tableDataAll && tableDataAll.length
                  ? tableDataAll.slice(0, 35).map((item: any, index: number) => (
                    <div
                      className={index + 1 > totalPage ? 'notShow' : tablePage === index ? 'flex selected' : 'flex'}
                      key={index}
                      onClick={() => nextPage(index, 'NFT')}
                    >
                      {index + 1}
                      </div>
                  )): ''}
              </div>
            </CollationTable>
            <CollationTable className={transactionTab === 'DeFi' ? '' : 'none'}>
              <div className="title">Defi Transactions</div>
              <div className="tab flex">
                <div>sold</div>
                <div>Received</div>
                <div>Chain</div>
                <div>Type</div>
                <div>Time</div>
                <div>Platform</div>
              </div>
              {swapData && swapData.length ? (
                swapData.map((item: any, index: number) => (
                  <div className={(index + 1) % 2 === 0 ? 'tableContent flex bag' : 'tableContent flex'} key={index}>
                    <div>{item?.sent}</div>
                    <div>{item?.received}</div>
                    <div>{item?.chain}</div>
                    <div>{item?.type}</div>
                    <div>{item?.time}</div>
                    <div>{item.platform || '--'}</div>
                  </div>
                ))
              ) : (
                <div className="Notrecords flex flex-justify-content">No records</div>
              )}
              <div className="tablePage flex">
                {swapDataAll && swapDataAll.length
                    ? swapDataAll.slice(0, 35).map((item: any, index: number) => (
                        <div
                          className={
                            index + 1 > swapTotalPage ? 'notShow' : swapPage === index ? 'flex selected' : 'flex'
                          }
                          key={index}
                          onClick={() => nextPage(index, 'Defi')}
                        >
                          {index + 1}
                        </div>
                      ))
                    : ''}
              </div>
            </CollationTable>
            <CollationTable className={transactionTab === 'Token' ? '' : 'none'}>
              <div className="title">Token Transactions</div>
              <div className="tab flex">
                <div>Sent</div>
                <div>Token</div>
                <div>Received</div>
                <div>Chain</div>
                <div>Type</div>
                <div>Time</div>
              </div>
              {transaction && transaction.length ? (
                transaction.map((item: any, index: number) => (
                  <div className={(index + 1) % 2 === 0 ? 'tableContent flex bag' : 'tableContent flex'} key={index}>
                    <div>{item?.sent}</div>
                    <div>{item?.price}</div>
                    <div>{item?.received}</div>
                    <div>{item?.chain}</div>
                    <div>{item?.type}</div>
                    <div>{item?.time}</div>
                  </div>
                ))
              ) : (
                <div className="Notrecords flex flex-justify-content">No records</div>
              )}
              <div className="tablePage flex">
                {transactionAll && transactionAll.length
                  ? transactionAll.slice(0, 35).map((item: any, index: number) => (
                      <div
                        className={
                          index + 1 > transactionTotalPage
                            ? 'notShow'
                            : transactionPage === index
                            ? 'flex selected'
                            : 'flex'
                        }
                        key={index}
                        onClick={() => nextPage(index, 'Transaction')}
                      >
                        {index + 1}
                      </div>
                    ))
                  : ''}
              </div>
            </CollationTable>
            <CollationTable className={transactionTab === 'Wash' ? '' : 'none'}>
              <div className="title">NFT Transactions</div>
              <div className="tab flex">
                <div>COLLATION</div>
                <div>NFTNAME</div>
                <div>PRICE</div>
                <div>CHAIN</div>
                <div>TYPE</div>
                <div>TIME</div>
              </div>
              {washData && washData.length ? (
                washData.map((item: any, index: number) => (
                  <div className={(index + 1) % 2 === 0 ? 'tableContent flex bag' : 'tableContent flex'} key={index}>
                    <div>{item?.collation}</div>
                    <div>{item?.nftname}</div>
                    <div>{item?.price}</div>
                    <div>{item?.chain}</div>
                    <div>{item?.type}</div>
                    <div>{item?.time}</div>
                  </div>
                ))
              ) : (
                <div className="Notrecords flex flex-justify-content">No records</div>
              )}
              <div className="tablePage flex">
                {washDataAll && washDataAll.length
                  ? washDataAll.slice(0, 35).map((item: any, index: number) => (
                    <div
                      className={index + 1 > totalPage ? 'notShow' : tablePage === index ? 'flex selected' : 'flex'}
                      key={index}
                      onClick={() => nextPage(index, 'NFT')}
                    >
                      {index + 1}
                      </div>
                  )): ''}
              </div>
            </CollationTable>
            <CollationTable className={transactionTab === 'Poap' ? '' : 'none'}>
                  <div className="title">NFT Transactions</div>
                  <div className="tab flex">
                    <div>Time</div>
                    <div>Colletion</div>
                    <div>NFT Name</div>
                    <div>Price</div>
                    <div>Chain</div>
                    <div>Type</div>
                  </div>
                  {poapData && poapData.length ? (
                    poapData.map((item: any, index: number) => (
                      <div className={(index + 1) % 2 === 0 ? 'tableContent flex bag' : 'tableContent flex'} key={index}>
                        <div>{item?.time}</div>
                        <div>{item?.collation}</div>
                        <div>{item?.nftname}</div>
                        <div>{item?.price}</div>
                        <div>{item?.chain}</div>
                        <div>{item?.type}</div>
                      </div>
                    ))
                  ) : (
                    <div className="Notrecords flex flex-justify-content">No records</div>
                  )}
            </CollationTable>
          </TableBox>
          <div className="Activity bg">
            <div className="tabs flex">
              <div onClick={() => setActivityTab('Chains')}>
                Chains
                {activityTab === 'Chains' ? <img src={shortbutton} /> : ''}
              </div>
              <div onClick={() => setActivityTab('Collections')}>
                Collections
                {activityTab === 'Collections' ? <img src={longbutton} /> : ''}
              </div>
            </div>
            <div id="Activity" className={activityTab === 'Chains' ? 'lineChart' : 'lineChart none'}>
              <div className="Notrecords flex flex-justify-content">No records</div>
            </div>
            <div id="collationActivity" className={activityTab === 'Collections' ? 'lineChart' : 'lineChart none'}>
              <div className="Notrecords flex flex-justify-content">No records</div>
            </div>
          </div>
          <div className="Activity bg">
            <div className="tabs flex">
              <div onClick={() => setActivityTab2('Lens')}>
                Lens
                {activityTab2 === 'Lens' ? <img src={shortbutton} /> : ''}
              </div>
              <div onClick={() => setActivityTab2('OAT')}>
                Galxe OAT
                {activityTab2 === 'OAT' ? <img src={longbutton} /> : ''}
              </div>
              <div onClick={() => setActivityTab2('Snapshot')}>
                Snapshot
                {activityTab2 === 'Snapshot' ? <img src={longbutton} /> : ''}
              </div>
            </div>
            <div id="ActivityLens" className={activityTab2 === 'Lens' ? 'lineChart' : 'lineChart none'}>
              <div className="Notrecords flex flex-justify-content">No records</div>
            </div>
            <div id="ActivityOAT" className={activityTab2 === 'OAT' ? 'lineChart' : 'lineChart none'}>
              <div className="Notrecords flex flex-justify-content">No records</div>
            </div>
            <div id="ActivitySnapshot" className={activityTab2 === 'Snapshot' ? 'lineChart' : 'lineChart none'}>
                  <div className="Notrecords flex flex-justify-content">No records</div>
                </div>
          </div>
          <TableBox className="bg">
            <CollationTable id="relation">
              <div className="title">Player Relationship</div>
              <div className="text-center">No records</div>
            </CollationTable>
          </TableBox>
        </AnalysisBox>
      ): (
        <div className="text-center">No data</div>
      )}
      {/* {PieChartData.length ? (
        <div className="Download cursor" onClick={download}>Download $</div>
      ): (
        ''
      )} */}
    </Analysis>
  )
}