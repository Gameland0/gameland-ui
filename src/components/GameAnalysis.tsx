import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import * as echarts from 'echarts'
import axios from 'axios'
import { bschttp, polygonhttp, newhttp } from './Store'
import { AnalysisBox } from './MyPage'
import { ApproveTable, calculateAverage, firstWeek } from './CollectionDetails'
import { MORALIS_KEY } from '../constants'
import pieBg from '../assets/pie_bg.png'
import defaultImg from '../assets/default.png'
import PolygonImg from '../assets/polygon.svg'
import BSCImg from '../assets/binance.svg'
import ETHImg from '../assets/eth.svg'
import shortbutton from '../assets/short_button.jpg'
import { filterAddress } from '../utils'
import BigNumber from 'bignumber.js'
import { toastify } from './Toastify'

const Analysis = styled.div`
  .borderNone {
    border: none;
  }
  .bg {
    background: url(${pieBg});
    background-size: 100% 100%;
  }
  .margin {
    margin-left: 30px;
  }
  #AverageActions {
    width: 88%;
    height: 350px;
  }
  #NFTTransaction {
    width: 96%;
    height: 350px;
  }
  .item {
    width: 96%;
    height: 350px;
  }
`
const TokenTransactions = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 1230px;
  .CollectionItem {
    width: 400px;
    height: 105px;
    border: 1px solid #43B7FF;
    padding: 10px 20px;
    border-radius: 28px;
    .Collection {
      width: 155px;
    }
    .Volume {
      width: 65px;
      margin-left: 8px;
      text-align: right;
      img {
        width: 15px;
        height: 15px;
        margin-right: 5px;
        margin-top: -3px;
      }
    }
    .Avg {
      width: 55px;
      text-align: right;
    }
    .Sales {
      width: 65px;
      text-align: right;
    }
    .info {
      margin-top: 10px;
      .gameImg {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
      }
      .name {
        width: 105px;
      }
    }
  }
`
const RankingTable= styled.div`
  width: 96%;
  margin: auto;
  .bag {
    background: #f4f9fb;
  }
  .itemDiv {
    padding: 10px;
    width: 49%;
    min-height: 110px;
    border: 1px solid #43B7FF;
    border-radius: 28px;
  }
  .Tab {
    padding-left: 10px;
    div {
      position: relative;
      cursor: pointer;
      margin-right: 16px;
      img {
        width: 100%;
        height: 8px;
        position: absolute;
        bottom: 1px;
        left: 0px;
      }
    }
  }
  .titleBar {
    div {
      flex: 1;
      text-align: center;
    }
    .Address {
      flex: 3;
    }
  }
  .title {
    margin: 5px 0;
    font-size: 16px;
    font-weight: bold;
  }
  .dataArea {
    .dataItem {
      margin: 5px 0;
      div {
        flex: 1;
        text-align: center;
      }
      .Address {
        flex: 3;
      }
      .Volume {
        img {
          width: 15px;
          height: 15px;
          margin-right: 3px;
          margin-top: -3px;
        }
      }
    }
    .NoData {
      margin-top: 15px;
    }
  }
`

const calculate = (data: any, activeUser: any) => {
  const thisWeekTime = new Date(`2023-${firstWeek()} 23:59:59`).getTime()+604800000
  const thisWeekActiveUser = [] as any
  const week2ActiveUser = [] as any
  const week3ActiveUser = [] as any
  const week4ActiveUser = [] as any
  activeUser.map((item: any) => {
    const time = item.timeStamp * 1000
    if (time < thisWeekTime && time > thisWeekTime - 604800000) {
      const data = thisWeekActiveUser.filter((ele: any) => {
        return ele === item.t1
      })
      if (!data.length) {
        thisWeekActiveUser.push(item.t1)
      }
    }
    if (time < thisWeekTime - 604800000 && time > thisWeekTime - 604800000 * 2) {
      const data = week2ActiveUser.filter((ele: any) => {
        return ele === item.t1
      })
      if (!data.length) {
        week2ActiveUser.push(item.t1)
      }
    }
    if (time < thisWeekTime - 604800000*2 && time > thisWeekTime - 604800000 * 3) {
      const data = week3ActiveUser.filter((ele: any) => {
        return ele === item.t1
      })
      if (!data.length) {
        week3ActiveUser.push(item.t1)
      }
    }
    if (time < thisWeekTime - 604800000*3 && time > thisWeekTime - 604800000 * 4) {
      const data = week4ActiveUser.filter((ele: any) => {
        return ele === item.t1
      })
      if (!data.length) {
        week4ActiveUser.push(item.t1)
      }
    }
  })
  const thisWeekData = [] as any
  const week2Data = [] as any
  const week3Data = [] as any
  const week4Data = [] as any
  data.map((item: any) => {
    const time = item.timeStamp * 1000
    if (time < thisWeekTime && time > thisWeekTime - 604800000) {
      thisWeekData.push(item)
    }
    if (time < thisWeekTime - 604800000 && time > thisWeekTime - 604800000 * 2) {
      week2Data.push(item)
    }
    if (time < thisWeekTime - 604800000*2 && time > thisWeekTime - 604800000 * 3) {
      week3Data.push(item)
    }
    if (time < thisWeekTime - 604800000*3 && time > thisWeekTime - 604800000 * 4) {
      week4Data.push(item)
    }
  })
  return [
    Math.ceil(thisWeekActiveUser.length===0? 0:thisWeekData.length/thisWeekActiveUser.length),
    Math.ceil(week2ActiveUser.length===0? 0:week2Data.length/week2ActiveUser.length),
    Math.ceil(week3ActiveUser.length===0? 0:week3Data.length/week3ActiveUser.length),
    Math.ceil(week4ActiveUser.length===0? 0:week4Data.length/week4ActiveUser.length)
  ]
}

export const GameAnalysis = (data: any) => {
  const [saleRankTab, setSaleRankTab] = useState('')
  const [PSstate, setPSstate] = useState(false)
  const [showTokenTotal, setShowTokenTotal] = useState(false)
  const [showPlatform, setShowPlatform] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [CollectionData, setCollectionData] = useState([] as any)
  const [RankData, setRankData] = useState([] as any)
  const [showSaleData, setShowSaleData] = useState([] as any)
  const [showPlayer, setShowPlayer] = useState([] as any)

  useEffect(() => {
    if (data.seachContract.length) {
      detectionAddress()
    }
    if (data.data.length || data.seachCache.length) {
      getCollectionTransaction()
      setAverageActionChart()
    }
  }, [])

  useEffect(() => {
    if (saleRankTab!=='') {
      const data = RankData.filter((item: any) => {
        return saleRankTab === item.tab
      })
      setShowSaleData(data[0].saleData)
      setShowPlayer(data[0].Player)
    }
  }, [saleRankTab])

  const detectionAddress = async () => {
    const filterData = data.GameData.filter((item: any) => {
      return data.seachContract.toLowerCase() === item.contractAddress.toLowerCase()
    })
    const Data = data.data.filter((item: any) => {
      return data.seachContract.toLowerCase() === item.toLowerCase()
    })
    const filterCache = data.seachCache.filter((item: any) => {
      return data.seachContract.toLowerCase() === item.toLowerCase()
    })
    const gamesdata = await newhttp.get(`v0/games/${data.seachContract}`)
    const gamescache = await newhttp.get(`v0/games_cache/${data.seachContract}`)
    if (!filterData.length&&!gamesdata.data.data.length&&!gamescache.data.data.length) {
      setPSstate(true)
      const getdata = axios.create({
        timeout: 100000,
        headers: {
          'X-API-Key': MORALIS_KEY
        }
      })
      const bscinfo = await getdata.get(`https://deep-index.moralis.io/api/v2/nft/${data.seachContract}?chain=bsc&format=decimal&media_items=false`)
      if (bscinfo.data.result[0]?.contract_type) {
        const params = {
          address: data.seachContract,
          chain: 'bsc',
          type: bscinfo.data.result[0].contract_type,
          name: bscinfo.data.result[0].name,
          uri: bscinfo.data.result[0].token_uri
        }
        newhttp.post(`v0/games_cache`, params)
      }
      const polygoninfo = await getdata.get(`https://deep-index.moralis.io/api/v2/nft/${data.seachContract}?chain=polygon&format=decimal&media_items=false`)
      if (polygoninfo.data.result[0]?.contract_type) {
        const params = {
          address: data.seachContract,
          chain: 'polygon',
          type: polygoninfo.data.result[0].contract_type,
          name: polygoninfo.data.result[0].name,
          uri: polygoninfo.data.result[0].token_uri
        }
        newhttp.post(`v0/games_cache`, params)
      }
      const ethinfo = await getdata.get(`https://deep-index.moralis.io/api/v2/nft/${data.seachContract}?chain=eth&format=decimal&media_items=false`)
      if (ethinfo.data.result[0]?.contract_type) {
        const params = {
          address: data.seachContract,
          chain: 'eth',
          type: ethinfo.data.result[0].contract_type,
          name: ethinfo.data.result[0].name,
          uri: ethinfo.data.result[0].token_uri
        }
        newhttp.post(`v0/games_cache`, params)
      }
    }
    if (filterData.length) {
      if (data.data.length>=3) {
        toastify.error('Choose up to 3')
        return
      }
      data.data.push(data.seachContract)
      getCollectionTransaction()
      setAverageActionChart()
    }
    if (gamescache.data.data.length) {
      setPSstate(true)
    }
    if (gamesdata.data.data.length) {
      if (data.seachCache.length>=3) {
        toastify.error('Choose up to 3')
        return
      }
      data.seachCache.push(data.seachContract)
      setShowTokenTotal(true)
      setShowPlatform(true)
      getCollectionTransaction()
      setAverageActionChart()
    }
    if (Data.length || filterCache.length) {
      return
    }
  }

  const getCollectionTransaction = async () => {
    const legend = [] as any
    const seriesData = [] as any
    const timearr = [] as any
    for (let index = 0; index < data.data.length; index++) {
      const filterData = data.GameData.filter((ele: any) => {
        return data.data[index].toLowerCase() === ele.contractAddress.toLowerCase()
      })
      const res = await polygonhttp.get(`v0/oklink/transactionList?chainShortName=${filterData[0].chain}&tokenContractAddress=${data.data[index]}`)
      const res2 = await polygonhttp.get(`v0/oklink/transactionList?chainShortName=${filterData[0].chain}&tokenContractAddress=${data.data[index]}&page=${2}`)
      const dataAll = [...res.data.data[0].transactionLists, ...res2.data.data[0].transactionLists]
      
      dataAll.map((item: any) => {
        const time = new Date(item.transactionTime *1).toJSON().substring(5, 10)
        const data = timearr.filter((ele: any) => {
          return ele === time
        })
        if (data.length === 0) {
          timearr.push(time)
        }
      })
      const seriesItem = [] as any
      timearr.map((item: any) => {
        const addressArr = [] as any
        const filterdata = dataAll.filter((ele: any) => {
          return new Date(ele.transactionTime *1).toJSON().substring(5, 10) === item
        })
        filterdata.map((val: any) => {
          addressArr.push(val.from)
        })
        const addressDeduplicationData = [...new Set(addressArr)]
        seriesItem.push(addressDeduplicationData.length)
      })
      legend.push(filterData[0].contractName)
      seriesData.push({
        name: filterData[0].contractName,
        data: seriesItem,
        type: 'line',
        smooth: true
      })
    }

    for (let index = 0; index < data.seachCache.length; index++) {
      const element = data.seachCache[index]
      const filterData = data.gameData.filter((ele: any) => {
        return element.toLowerCase() === ele.address.toLowerCase()
      })
      const res = await polygonhttp.get(`v0/oklink/transactionList?chainShortName=${filterData[0].chain}&tokenContractAddress=${element}`)
      const res2 = await polygonhttp.get(`v0/oklink/transactionList?chainShortName=${filterData[0].chain}&tokenContractAddress=${element}&page=${2}`)
      const dataAll = [...res.data.data[0].transactionLists, ...res2.data.data[0].transactionLists]
      
      dataAll.map((item: any) => {
        const time = new Date(item.transactionTime *1).toJSON().substring(5, 10)
        const data = timearr.filter((ele: any) => {
          return ele === time
        })
        if (data.length === 0) {
          timearr.push(time)
        }
      })
      const seriesItem = [] as any
      timearr.map((item: any) => {
        const addressArr = [] as any
        const filterdata = dataAll.filter((ele: any) => {
          return new Date(ele.transactionTime *1).toJSON().substring(5, 10) === item
        })
        filterdata.map((val: any) => {
          addressArr.push(val.from)
        })
        const addressDeduplicationData = [...new Set(addressArr)]
        seriesItem.push(addressDeduplicationData.length)
      })
      legend.push(filterData[0].name)
      seriesData.push({
        name: filterData[0].name,
        data: seriesItem,
        type: 'line',
        smooth: true
      })
    }
    const options = {
      tooltip: {
        trigger: 'axis' as any
      },
      legend: {
        data: legend
      },
      xAxis: {
        data: timearr
      },
      yAxis: {
        type: 'value' as any
      },
      series: seriesData
    }
    if (document.getElementById('interactionsPerDay') == null) {
      return
    }
    echarts.dispose(document.getElementById('interactionsPerDay') as HTMLDivElement)
    const Activitydom = document.getElementById('interactionsPerDay') as HTMLDivElement
    const ActivityChart = echarts.init(Activitydom)
    ActivityChart.setOption(options)
  }

  const setAverageActionChart = async () => {
    setCollectionData([])
    const PlatformSeriesData = [] as any
    const Platformlegend = [] as any
    const PlatformxAxis = [] as any
    const legend = [] as any
    const NFTxAxis = [] as any
    const seriesData = [] as any
    const Sold = [] as any
    const Bought = [] as any
    const Mint = [] as any
    const Bot = [] as any
    const Real = [] as any
    const BotTransaction = [] as any
    const RealTransaction = [] as any

    if (data.seachCache.length) {
      setShowPlatform(true)
    }
    for (let index = 0; index < data.data.length; index++) {
      const element = data.data[index];
      const filterData = data.GameData.filter((ele: any) => {
        return element.toLowerCase() === ele.contractAddress.toLowerCase()
      })
      let actions: any
      let users: any
      if (filterData[0].chain === 'bsc') {
        actions = await bschttp.get(`v0/active_actions/${element}`)
        users = await bschttp.get(`v0/active_users/${element}`)
      }
      if (filterData[0].chain === 'polygon') {
        actions = await polygonhttp.get(`v0/active_actions/${element}`)
        users = await polygonhttp.get(`v0/active_users/${element}`)
      }
      const approveData = [] as any
      const adrr = '0x0000000000000000000000000000000000000000'
      actions.data.data.map((item: any) => {
        if (item.tokenid * 1 === 0) {
          approveData.push(item)
        }
        if (filterAddress(item.t1)?.toLowerCase() === item.address?.toLowerCase()) {
          item.type = 'Sold'
        }
        if (filterAddress(item.t1)?.toLowerCase() === adrr?.toLowerCase()) {
          item.type = 'Mint'
        }
        item.t1 = filterAddress(item.t1)
        item.t2 = filterAddress(item.t2)
      })
      const userNftArr = [] as any
      users.data.data.map((item: any) => {
        if ((item.nftcount * 1) >= 0) {
          const data = userNftArr.filter((ele: any) => {
            return ele.address === item.address
          })
          if (data.length === 0) {
            userNftArr.push(item)
          }
        }
      })
      let bot = 0
      let bottransaction = 0
      const actionDataAll = [] as any
      userNftArr.map((item: any) => {
        const data = approveData.filter((ele: any) => {
          return ele.address?.toLowerCase() === item.address?.toLowerCase()
        })
        if (data.length > 0) {
          if (data.length > 25) {
            bot = bot + 1
            const data = actions.data.data.filter((ele: any) => {
              return item.address?.toLowerCase() === ele.address?.toLowerCase()
            })
            bottransaction = bottransaction + data.length
          }
          actionDataAll.push(item.address)
        }
      })
      const botratio = new BigNumber((bot / actionDataAll.length).toFixed(2)).multipliedBy(100).toNumber()
      const userratio = 100 - botratio
      const bottransactionratio = new BigNumber((bottransaction / actions.data.data.length).toFixed(2)).multipliedBy(100).toNumber()
      const usertransactionratio = 100 - bottransactionratio
      const SoldData = actions.data.data.filter((item: any) => {
        return item.type === 'Sold'
      })
      const MintData = actions.data.data.filter((item: any) => {
        return item.type === 'Mint'
      })
      const SoldValue = new BigNumber((SoldData.length / actions.data.data.length).toFixed(2)).multipliedBy(100).toNumber()
      const MintValue = new BigNumber((MintData.length / actions.data.data.length).toFixed(2)).multipliedBy(100).toNumber()
      const BoughtValue = 100 - MintValue - SoldValue
      Sold.push(SoldValue)
      Bought.push(BoughtValue)
      Mint.push(MintValue)
      Bot.push(botratio)
      Real.push(userratio)
      BotTransaction.push(bottransactionratio)
      RealTransaction.push(usertransactionratio)
      NFTxAxis.push(filterData[0].contractName)
      legend.push(`${filterData[0].contractName} Average Approve`)
      legend.push(`${filterData[0].contractName} Average Transction`)
      seriesData.push({
        name: `${filterData[0].contractName} Average Approve`,
        data: calculateAverage(approveData, users.data.data),
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].contractName} Average Transction`,
        data: calculateAverage(actions.data.data, users.data.data),
        type: 'line',
        smooth: true
      })
    }
    const arr = []
    for (let index = 0; index < data.seachCache.length; index++) {
      const element = data.seachCache[index]
      const filterData = data.gameData.filter((ele: any) => {
        return element.toLowerCase() === ele.address.toLowerCase()
      })
      const actionData = await newhttp.get(`v0/games_${filterData[0].chain}/${element}`)
      const approveData = [] as any
      const mintData = [] as any
      const activeUser = [] as any
      const PlatformAll = [] as any
      const PlatformTime = [] as any
      let TokenTotal = 0
      const OpenSea = [] as any
      const Element = [] as any
      const Blur = [] as any
      const X2Y2 = [] as any
      const actionRankData = [] as any
      const saleRankData = [] as any
      actionData.data.data.map((item: any) => {
        if (item.market !== '') {
          PlatformAll.push(item)
          const data = PlatformTime.filter((ele: any) => {
            return ele === item.timeStamp
          })
          if (data.length === 0) {
            PlatformTime.push(item.timeStamp)
          }
        }
        if (item.action === 'Approval' || item.action === 'ApprovalForAll') {
          approveData.push(item)
        }
        if (item.action === 'mint') {
          mintData.push(item)
        }
        const filteraddress = activeUser.filter((ele: any) => {
          return ele === filterAddress(item.t1)
        })
        if (!filteraddress.length) {
          if (filterAddress(item.t1) !=='0x0000000000000000000000000000000000000000') {
            activeUser.push(filterAddress(item.t1))
          }
        }
        if (item.action === 'sale') {
          const value = new BigNumber(item.transactionvalue).div(1000000000000000000).toNumber()
          TokenTotal = TokenTotal + value
        }
      })
      const sortarr = PlatformTime.sort((a: any,b: any)=> {return b-a})
      sortarr.map((item: any) => {
        const time = new Date(item *1000).toJSON().substring(5, 10)
        const data = PlatformxAxis.filter((ele: any) => {
          return ele === time
        })
        if (data.length === 0) {
          PlatformxAxis.push(time)
        }
      })
      PlatformxAxis.map((item: any) => {
        const OpenSeadata = PlatformAll.filter((ele: any) => {
          const time = new Date(ele.timeStamp *1000).toJSON().substring(5, 10)
          return time === item&&ele.market==='OpenSea'
        })
        OpenSea.push(OpenSeadata.length)
        const Elementdata = PlatformAll.filter((ele: any) => {
          const time = new Date(ele.timeStamp *1000).toJSON().substring(5, 10)
          return time === item&&ele.market==='Element'
        })
        Element.push(Elementdata.length)
        const Blurdata = PlatformAll.filter((ele: any) => {
          const time = new Date(ele.timeStamp *1000).toJSON().substring(5, 10)
          return time === item&&ele.market==='Blur'
        })
        Blur.push(Blurdata.length)
        const X2Y2data = PlatformAll.filter((ele: any) => {
          const time = new Date(ele.timeStamp *1000).toJSON().substring(5, 10)
          return time === item&&ele.market==='X2Y2'
        })
        X2Y2.push(X2Y2data.length)
      })
      const Sales = actionData.data.data.filter((item: any)=> {
        return item.action === 'sale'
      })
      const SalesAddress = [] as any
      Sales.map((item: any) => {
        const address = filterAddress(item.t1)
        if (address !=='0x0000000000000000000000000000000000000000') {
          const data = SalesAddress.filter((ele: any) => {
            return ele === address
          })
          if (data.length === 0) {
            SalesAddress.push(address)
          }
        }
      })
      SalesAddress.map((item: any) => {
        const data = Sales.filter((ele: any) => {
          return item === filterAddress(ele.t1)
        })
        let value = 0
        data.map((val: any) => {
          value = value + new BigNumber(val.transactionvalue).div(1000000000000000000).toNumber()
        })
        saleRankData.push({
          address: item,
          Sales: data.length,
          Volume: value.toFixed(2),
          chain: filterData[0].chain
        })
      })
      const sortsaleRankData = saleRankData.sort((a: any,b: any)=> {return b.Volume-a.Volume})
      arr.push({
        image: filterData[0].image,
        name: filterData[0].name,
        Sales: Sales.length,
        Avg: Sales.length===0? Sales.length: new BigNumber(TokenTotal.toFixed(2)).div(Sales.length).toFixed(2),
        chain: filterData[0].chain,
        Volume: TokenTotal.toFixed(2)
      })
      let bot = 0
      let bottransaction = 0
      activeUser.map((item: any) => {
        let level
        const data = actionData.data.data.filter((ele: any) => {
          return item === filterAddress(ele.t1)
        })
        if (data.length > 25) {
          bot = bot + 1
          bottransaction = bottransaction + data.length
          level = 'Bot'
        } else if (data.length <= 25 && data.length > 18) {
          level = 'High'
        } else if(data.length < 18){
          level = 'Middle'
        }
        actionRankData.push({
          address: item,
          action: data.length,
          level: level
        })
      })
      const sortactionRankData = actionRankData.sort((a: any,b: any)=> {return b.action-a.action})
      const Rankarr = RankData
      Rankarr.push({
        tab: filterData[0].name,
        saleData: sortsaleRankData.slice(0,10),
        Player: sortactionRankData.slice(0,10)
      })
      setRankData(Rankarr)
      const botratio = new BigNumber((bot / activeUser.length).toFixed(2)).multipliedBy(100).toNumber()
      const userratio = 100 - botratio
      const bottransactionratio = new BigNumber((bottransaction / actionData.data.data.length).toFixed(2)).multipliedBy(100).toNumber()
      const usertransactionratio = 100 - bottransactionratio
      const MintValue = new BigNumber((mintData.length / actionData.data.data.length).toFixed(2)).multipliedBy(100).toNumber()
      const othen = 100 - MintValue
      Mint.push(MintValue)
      Sold.push(new BigNumber(othen).multipliedBy(0.4).toNumber())
      Bought.push(new BigNumber(othen).multipliedBy(0.6).toNumber())
      NFTxAxis.push(filterData[0].name)
      Platformlegend.push(...[`${filterData[0].name} OpenSea`,`${filterData[0].name} Element`,`${filterData[0].name} Blur`,`${filterData[0].name} X2Y2`,])
      legend.push(`${filterData[0].name} Average Approve`)
      legend.push(`${filterData[0].name} Average Transction`)
      Bot.push(botratio)
      Real.push(userratio)
      BotTransaction.push(bottransactionratio)
      RealTransaction.push(usertransactionratio)
      seriesData.push({
        name: `${filterData[0].name} Average Approve`,
        data: calculate(approveData, actionData.data.data),
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].name} Average Transction`,
        data: calculate(actionData.data.data, actionData.data.data),
        type: 'line',
        smooth: true
      })
      PlatformSeriesData.push({
        name: `${filterData[0].name} OpenSea`,
        data: OpenSea,
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].name} Element`,
        data: Element,
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].name} Blur`,
        data: Blur,
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].name} X2Y2`,
        data: X2Y2,
        type: 'line',
        smooth: true
      })
    }

    setCollectionData(arr)
    const option = {
      tooltip: {
        trigger: 'axis' as any,
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      legend: {
        data: legend
      },
      xAxis:{
        data: [firstWeek(), 'Week2', 'Week3', 'Week4']
      },
      yAxis: {
        type: 'value' as any
      },
      series: seriesData
    }
    if (document.getElementById('AverageActions') == null) {
      return
    }
    echarts.dispose(document.getElementById('AverageActions') as HTMLDivElement)
    const AverageActionDom = document.getElementById('AverageActions') as HTMLDivElement
    const AverageActionChart = echarts.init(AverageActionDom)
    AverageActionChart.setOption(option)
    const NFToption = {
      tooltip: {
        trigger: 'axis' as any,
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      legend: {},
      xAxis:{
        data: NFTxAxis
      },
      yAxis: {
        type: 'value' as any
      },
      series: [
        {
          name: 'Sold',
          type: 'bar',
          data: Sold
        },
        {
          name: 'Bought',
          type: 'bar',
          data: Bought
        },
        {
          name: 'Mint',
          type: 'bar',
          data: Mint
        }
      ]
    }
    const NFTDom = document.getElementById('NFTTransaction') as HTMLDivElement
    const NFTChart = echarts.init(NFTDom)
    NFTChart.setOption(NFToption)
    const BotratioOption = {
      tooltip: {
        trigger: 'axis' as any,
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      legend: {},
      xAxis:{
        data: NFTxAxis
      },
      yAxis: {
        type: 'value' as any
      },
      series: [
        {
          name: 'Bot',
          type: 'bar',
          data: Bot
        },
        {
          name: 'Real',
          type: 'bar',
          data: Real
        }
      ]
    }
    const Botratiodom = document.getElementById('Botratio') as HTMLDivElement
    const BotratioChart = echarts.init(Botratiodom)
    BotratioChart.setOption(BotratioOption)

    const BotTransactionOption = {
      tooltip: {
        trigger: 'axis' as any,
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        containLabel: true
      },
      legend: {},
      xAxis:{
        data: NFTxAxis
      },
      yAxis: {
        type: 'value' as any
      },
      series: [
        {
          name: 'Bot',
          type: 'bar',
          data: BotTransaction
        },
        {
          name: 'Real',
          type: 'bar',
          data: RealTransaction
        }
      ]
    }
    const BotTransactionratiodom = document.getElementById('BotTransactionRatio') as HTMLDivElement
    const BotTransactionratioChart = echarts.init(BotTransactionratiodom)
    BotTransactionratioChart.setOption(BotTransactionOption)
    if (data.seachCache.length) {
      setSaleRankTab(RankData[0].tab)
      const PlatformOption = {
        tooltip: {
          trigger: 'axis' as any,
        },
        grid: {
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        legend: {
          data: Platformlegend
        },
        xAxis:{
          data: PlatformxAxis
        },
        yAxis: {
          type: 'value' as any
        },
        series: PlatformSeriesData
      }
      const Platformdom = document.getElementById('Platform') as HTMLDivElement
      const PlatformChart = echarts.init(Platformdom)
      PlatformChart.setOption(PlatformOption)
    }
  }

  return (
    <Analysis>
      {PSstate? (
        <div className="text-center">The data might take a while to load. Please come back later.</div>
      ) :''}
      {!PSstate ? (
        <AnalysisBox>
          <TokenTransactions className="flex flex-h-between wrap">
            {CollectionData.map((item: any, index: number) => (
              <div className="CollectionItem" key={index}>
                <div className="flex title flex-v-center">
                  <div className="Collection">Collection</div>
                  <div className="Avg">Avg price</div>
                  <div className="Sales">Sales</div>
                  <div className="Volume">Volume</div>
                </div>
                <div className="flex info flex-v-center">
                  <img className="gameImg" src={item.image || defaultImg} alt="" />
                  <div className="name Abbreviation">{item.name}</div>
                  <div className="Avg">{item.Avg}</div>
                  <div className="Sales">{item.Sales}</div>
                  <div className="Volume">
                    {item.chain==='polygon'
                      ? (<img src={PolygonImg} alt="" />)
                      : item.chain==='bsc'
                      ? (<img src={BSCImg} alt="" />)
                      : (<img src={ETHImg} alt="" />)
                    }
                    {item.Volume}
                  </div>
                </div>
              </div>
            ))}
          </TokenTransactions>
          <ApproveTable className="bg borderNone">
            <div className="pieTitle text-center">UAW</div>
            <div id="interactionsPerDay">
              <div className="text-center margin">No Data</div>
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone">
            <div className="pieTitle text-center">Transactions Platform</div>
            <div id="Platform" className="item">
              <div className="text-center margin">No Data</div>
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone">
            <div className="pieTitle text-center">Player Proportion(%)</div>
            <div id="Botratio" className="item">
              <div className="text-center margin">No Data</div>
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone">
            <div className="pieTitle text-center">Player Transaction Proportion(%)</div>
            <div id="BotTransactionRatio" className="item">
              <div className="text-center margin">No Data</div>
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone">
            <div className="pieTitle text-center">NFT Transaction(%)</div>
            <div id="NFTTransaction">
              <div className="text-center margin">No Data</div>
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone">
            <div id="AverageActions">
              <div className="text-center pieTitle">Average Action</div>
              <div className="text-center margin">No Data</div>
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <RankingTable className="flex flex-h-between">
            <div className="actionRank itemDiv bg">
              <div className='Tab flex'>
                {RankData&&RankData.length? (
                  RankData.map((item: any, index: number) =>(
                    <div onClick={() => setSaleRankTab(item.tab)} key={index}>
                      {item.tab}
                      {saleRankTab === item.tab ? <img src={shortbutton} /> : ''}
                    </div>
                  ))
                ): ('')}
              </div>
              <div className="title text-center">Top 10 Players</div>
              <div className="titleBar flex">
                <div>Ranking</div>
                <div className="Address">Address</div>
                <div>Action</div>
                <div>Level</div>
              </div>
              <div className="dataArea">
                {showPlayer&&showPlayer.length? (
                  showPlayer.map((item: any, index: number) =>(
                    <div
                      className={(index + 1) % 2 === 0 ? 'dataItem flex bag' : 'dataItem flex'}
                      key={index}
                    >
                      <div>{index+1}</div>
                      <div className="Address">{item.address}</div>
                      <div>{item.action}</div>
                      <div className={item?.level==='Bot' ? 'red':item?.level === 'High' ? 'green':'blue'}>{item.level}</div>
                    </div>
                  ))
                ):(
                  <div className="NoData text-center">No data</div>
                )}
              </div>
            </div>
            <div className="saleRank itemDiv bg">
              <div className='Tab flex'>
                {RankData&&RankData.length? (
                  RankData.map((item: any, index: number) =>(
                    <div onClick={() => setSaleRankTab(item.tab)} key={index}>
                      {item.tab}
                      {saleRankTab === item.tab ? <img src={shortbutton} /> : ''}
                    </div>
                  ))
                ): ('')}
              </div>
              <div className="title text-center">Top 10 salers</div>
              <div className="titleBar flex">
                <div>Ranking</div>
                <div className="Address">Address</div>
                <div>Sales</div>
                <div>Volume</div>
              </div>
              <div className="dataArea">
                {showSaleData&&showSaleData.length? (
                  showSaleData.map((item: any, index: number) =>(
                    <div
                      className={(index + 1) % 2 === 0 ? 'dataItem flex bag' : 'dataItem flex'}
                      key={index}
                    >
                      <div>{index+1}</div>
                      <div className="Address">{item.address}</div>
                      <div>{item.Sales}</div>
                      <div  className="Volume">
                        {item.chain==='polygon'
                          ? (<img src={PolygonImg} alt="" />)
                          : item.chain==='bsc'
                          ? (<img src={BSCImg} alt="" />)
                          : (<img src={ETHImg} alt="" />)
                        }
                        {item.Volume}
                      </div>
                    </div>
                  ))
                ):(
                  <div className="NoData text-center">No data</div>
                )}
              </div>
            </div>
          </RankingTable>
        </AnalysisBox>
      ) : ''}
    </Analysis>
  )
}