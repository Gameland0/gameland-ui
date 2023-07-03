import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import * as echarts from 'echarts'
import axios from 'axios'
import { bschttp, polygonhttp, newhttp } from './Store'
import { AnalysisBox } from './MyPage'
import { ApproveTable, calculateAverage, firstWeek } from './CollectionDetails'
import { MORALIS_KEY } from '../constants'
import pieBg from '../assets/pie_bg.png'
import { filterAddress } from '../utils'
import BigNumber from 'bignumber.js'
import { toastify } from './Toastify'

const Analysis = styled.div`
  .bg {
    background: url(${pieBg});
    background-size: 100% 100%;
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
    Math.ceil(thisWeekData.length/thisWeekActiveUser.length),
    Math.ceil(week2Data.length/week2ActiveUser.length),
    Math.ceil(week3Data.length/week3ActiveUser.length),
    Math.ceil(week4Data.length/week4ActiveUser.length)
  ]
}

export const GameAnalysis = (data: any) => {
  const [PSstate, setPSstate] = useState(false)

  useEffect(() => {
    console.log(data)
    if (data.seachContract.length) {
      detectionAddress()
    }
    if (data.data.length || data.seachCache.length) {
      getCollectionTransaction()
      setAverageRewardChart()
      setAverageActionChart()
    }
  }, [data.seachContract])

  const detectionAddress = async () => {
    const filterData = data.GameData.filter((item: any) => {
      return data.seachContract.toLowerCase() === item.contractAddress.toLowerCase()
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
      const gameinfo = await getdata.get(`https://deep-index.moralis.io/api/v2/nft/${data.seachContract}?chain=${data.chain}&format=decimal&media_items=false`)
      if (gameinfo.data.result[0].contract_type.length) {
        const params = {
          address: data.seachContract,
          chain: data.chain,
          type: gameinfo.data.result[0].contract_type,
          name: gameinfo.data.result[0].name,
          uri: gameinfo.data.result[0].token_uri
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
      setAverageRewardChart()
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
      getCollectionTransaction()
      setAverageRewardChart()
      setAverageActionChart()
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
    const Activitydom = document.getElementById('interactionsPerDay') as HTMLDivElement
    const ActivityChart = echarts.init(Activitydom)
    ActivityChart.setOption(options)
  }

  const setAverageRewardChart = () => {
    const week = new Date().getUTCDay()
      const day = new Date().getDate()
      let month = new Date().getMonth()+1
      let time
      if (week > 0) {
        if ((day - week) === 0) {
          month = month - 1
          time = 30
        } else {
          time = day - week
        }
      } else if (week === 0) {
        time = day
      }
      const firstWeek = `${month>10?month:'0'+month}-${time}`
      const option = {
        title: {
          text: 'Average Reward',
          left: 20
        },
        tooltip: {
          trigger: 'axis' as any,
          axisPointer: {
            type: 'shadow' as any
          }
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category' as any,
            data: [firstWeek, 'Week2', 'Week3', 'Week4'],
            axisTick: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value' as any
          }
        ],
        series: [
          {
            name: 'Bot',
            type: 'bar',
            barGap: 0,
            emphasis: {
              focus: 'series'
            },
            data: [0,0,0,0]
          },
          {
            name: 'Real',
            type: 'bar',
            emphasis: {
              focus: 'series'
            },
            data: [0,0,0,0]
          }
        ]
      }
      const AverageRewardDom = document.getElementById('AverageReward') as HTMLDivElement
      const AverageRewardChart = echarts.init(AverageRewardDom)
      AverageRewardChart.setOption(option)
  }

  const setAverageActionChart = async () => {
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

    for (let index = 0; index < data.seachCache.length; index++) {
      const element = data.seachCache[index]
      const filterData = data.gameData.filter((ele: any) => {
        return element.toLowerCase() === ele.address.toLowerCase()
      })
      const actionData = await newhttp.get(`v0/games_${filterData[0].chain}/${element}`)
      const approveData = [] as any
      const mintData = [] as any
      const activeUser = [] as any
      const activeUserData = [] as any
      actionData.data.data.map((item: any) => {
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
          activeUser.push(filterAddress(item.t1))
        }
      })
      let bot = 0
      let bottransaction = 0
      activeUser.map((item: any) => {
        const data = actionData.data.data.filter((ele: any) => {
          return item === filterAddress(ele.t1)
        })
        if (data.length > 25) {
          bot = bot + 1
          bottransaction = bottransaction + data.length
        }
      })
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
    }

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
  }

  return (
    <Analysis>
      {PSstate? (
        <div className="text-center">{data.seachContract} The data might take a while to load. Please come back later.</div>
      ) :''}
      {!PSstate ? (
        <AnalysisBox>
          <ApproveTable className="bg">
            <div className="pieTitle text-center">Player Proportion(%)</div>
            <div id="Botratio" className="item">
              <div className="text-center">No Data</div>
            </div>
          </ApproveTable>
          <ApproveTable className="bg">
            <div className="pieTitle text-center">Player Transaction Proportion(%)</div>
            <div id="BotTransactionRatio" className="item">
              <div className="text-center">No Data</div>
            </div>
          </ApproveTable>
          <ApproveTable className="bg">
            <div className="pieTitle text-center">NFT Transaction(%)</div>
            <div id="NFTTransaction">
              <div className="text-center">No Data</div>
            </div>
          </ApproveTable>
          <ApproveTable className="bg">
            <div className="pieTitle text-center">DAU</div>
            <div id="interactionsPerDay">
              <div className="text-center">No Data</div>
            </div>
          </ApproveTable>
          <ApproveTable className="bg">
            <div id="AverageReward">
              <div className="text-center">No Data</div>
            </div>
          </ApproveTable>
          <ApproveTable className="bg">
            <div id="AverageActions">
              <div className="text-center pieTitle">Average Action</div>
              <div className="text-center">No Data</div>
            </div>
          </ApproveTable>
        </AnalysisBox>
      ) : ''}
    </Analysis>
  )
}