import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import * as echarts from 'echarts'
import axios from 'axios'
import { bschttp, polygonhttp, newhttp, http, ethhttp } from './Store'
import { AnalysisBox, PieOption } from './MyPage'
import { ApproveTable, calculateAverage, firstWeek } from './CollectionDetails'
import { MORALIS_KEY, BSCSCAN_KEY, POLYGONSCAN_KEY } from '../constants'
import pieBg from '../assets/pie_bg.png'
import defaultImg from '../assets/default.png'
import PolygonImg from '../assets/polygon.svg'
import BSCImg from '../assets/binance.svg'
import ETHImg from '../assets/eth.svg'
import shortbutton from '../assets/short_button.jpg'
import { fetchReceipt, filterAddress, formatting } from '../utils'
import BigNumber from 'bignumber.js'
import html2canvas from 'html2canvas'
import { toastify } from './Toastify'
import { Dialog } from './Dialog'
import { SendBox } from '../pages/Dashboard'
import { Loading } from './Loading'
import { useTestUSDTContract, usePaidDownloadContract, useActiveWeb3React } from '../hooks'

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
  .ApproveTable {
    width: 96%;
    height: 430px;
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
      width: 75px;
      margin-left: 10px;
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
      width: 55px;
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
      flex: 4;
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
        flex: 4;
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
const Activity = styled.div`
  width: 96%;
  height: 350px;
  position: relative;
  padding: 10px;
  margin: auto;
  margin-bottom: 20px;
`
const Tap = styled.div`
  padding-left: 10px;
  margin-top: 20px;
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
const calcuRatio  = (data: any, all: any, type: string) => {
  if (all.length === 0) {
    return 0
  }
  if (type === 'ratio') {
    const ratio = new BigNumber((data.length / all.length).toFixed(2)).multipliedBy(100).toNumber()
    return ratio
  }
  if (type==='tranction') {
    const ratio = new BigNumber((data / all.length).toFixed(2)).multipliedBy(100).toNumber()
    return ratio
  }
}
const calcuBotratio = (data: any) => {
  const thisWeekTime = new Date(`2023-${firstWeek()} 23:59:59`).getTime()+604800000
  const thisWeek = [] as any
  const Week2 = [] as any
  const Week3 = [] as any
  const Week4 = [] as any
  const thisWeekUser = [] as any
  const Week2User = [] as any
  const Week3User = [] as any
  const Week4User = [] as any
  const thisWeekBot = [] as any
  const Week2Bot = [] as any
  const Week3Bot = [] as any
  const Week4Bot = [] as any
  const thisWeekPlayer = [] as any
  const Week2Player = [] as any
  const Week3Player = [] as any
  const Week4Player = [] as any
  data.map((item: any) => {
    const time = item.timeStamp * 1000
    if (time < thisWeekTime && time > thisWeekTime - 604800000) {
      thisWeek.push(item)
      const data = thisWeekUser.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length &&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        thisWeekUser.push(filterAddress(item.t1))
      }
    }
    if (time < thisWeekTime - 604800000 && time > thisWeekTime - 604800000 * 2) {
      Week2.push(item)
      const data = Week2User.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length&&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week2User.push(filterAddress(item.t1))
      }
    }
    if (time < thisWeekTime - 604800000*2 && time > thisWeekTime - 604800000 * 3) {
      Week3.push(item)
      const data = Week3User.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length&&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week3User.push(filterAddress(item.t1))
      }
    }
    if (time < thisWeekTime - 604800000*3 && time > thisWeekTime - 604800000 * 4) {
      Week4.push(item)
      const data = Week4User.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length&&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week4User.push(filterAddress(item.t1))
      }
    }
  })
  thisWeekUser.map((item: any) => {
    const data = thisWeek.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      thisWeekBot.push(item)
    } else {
      thisWeekPlayer.push(item)
    }
  })
  Week2User.map((item: any) => {
    const data = Week2.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      Week2Bot.push(item)
    } else {
      Week2Player.push(item)
    }
  })
  Week3User.map((item: any) => {
    const data = Week3.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      Week3Bot.push(item)
    } else {
      Week3Player.push(item)
    }
  })
  Week4User.map((item: any) => {
    const data = Week4.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      Week4Bot.push(item)
    } else {
      Week4Player.push(item)
    }
  })
  return {
    bot: [calcuRatio(thisWeekBot,thisWeekUser,'ratio'),calcuRatio(Week2Bot,Week2User,'ratio'),calcuRatio(Week3Bot,Week3User,'ratio'),calcuRatio(Week4Bot,Week4User,'ratio')],
    user: [calcuRatio(thisWeekPlayer,thisWeekUser,'ratio'),calcuRatio(Week2Player,Week2User,'ratio'),calcuRatio(Week3Player,Week3User,'ratio'),calcuRatio(Week4Player,Week4User,'ratio')]
  }
}
const calcuBotTranction = (data: any) => {
  const thisWeekTime = new Date(`2023-${firstWeek()} 23:59:59`).getTime()+604800000
  const thisWeek = [] as any
  const Week2 = [] as any
  const Week3 = [] as any
  const Week4 = [] as any
  const thisWeekUser = [] as any
  const Week2User = [] as any
  const Week3User = [] as any
  const Week4User = [] as any
  let thisWeekBot = 0
  let Week2Bot = 0
  let Week3Bot = 0
  let Week4Bot = 0
  let thisWeekPlayer = 0
  let Week2Player = 0
  let Week3Player = 0
  let Week4Player = 0
  data.map((item: any) => {
    const time = item.timeStamp * 1000
    if (time < thisWeekTime && time > thisWeekTime - 604800000) {
      if (filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        thisWeek.push(item)
      }
      const data = thisWeekUser.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length&&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        thisWeekUser.push(filterAddress(item.t1))
      }
    }
    if (time < thisWeekTime - 604800000 && time > thisWeekTime - 604800000 * 2) {
      if (filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week2.push(item)
      }
      const data = Week2User.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length&&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week2User.push(filterAddress(item.t1))
      }
    }
    if (time < thisWeekTime - 604800000*2 && time > thisWeekTime - 604800000 * 3) {
      if (filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week3.push(item)
      }
      const data = Week3User.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length&&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week3User.push(filterAddress(item.t1))
      }
    }
    if (time < thisWeekTime - 604800000*3 && time > thisWeekTime - 604800000 * 4) {
      if (filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week4.push(item)
      }
      const data = Week4User.filter((ele: any) => {
        return ele === filterAddress(item.t1)
      })
      if (!data.length&&filterAddress(item.t1)!=='0x0000000000000000000000000000000000000000') {
        Week4User.push(filterAddress(item.t1))
      }
    }
  })
  thisWeekUser.map((item: any) => {
    const data = thisWeek.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      thisWeekBot=thisWeekBot+data.length
    } else {
      thisWeekPlayer=thisWeekPlayer+data.length
    }
  })
  Week2User.map((item: any) => {
    const data = Week2.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      Week2Bot=Week2Bot+data.length
    } else {
      Week2Player=Week2Player+data.length
    }
  })
  Week3User.map((item: any) => {
    const data = Week3.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      Week3Bot=Week3Bot+data.length
    } else {
      Week3Player=Week3Player+data.length
    }
  })
  Week4User.map((item: any) => {
    const data = Week4.filter((ele: any) => {
      return item === filterAddress(ele.t1)
    })
    if (data.length>70) {
      Week4Bot=Week4Bot+data.length
    } else {
      Week4Player=Week4Player+data.length
    }
  })

  return {
    bot: [calcuRatio(thisWeekBot,thisWeek,'tranction'),calcuRatio(Week2Bot,Week2,'tranction'),calcuRatio(Week3Bot,Week3,'tranction'),calcuRatio(Week4Bot,Week4,'tranction')],
    user: [calcuRatio(thisWeekPlayer,thisWeek,'tranction'),calcuRatio(Week2Player,Week2,'tranction'),calcuRatio(Week3Player,Week3,'tranction'),calcuRatio(Week4Player,Week4,'tranction')]
  }
}
const calcuNFTTranction = (data: any) => {
  const thisWeekTime = new Date(`2023-${firstWeek()} 23:59:59`).getTime()+604800000
  const thisWeek = [] as any
  const Week2 = [] as any
  const Week3 = [] as any
  const Week4 = [] as any
  const thisWeeSold = [] as any
  const Week2Sold = [] as any
  const Week3Sold = [] as any
  const Week4Sold = [] as any
  const thisWeekBought = [] as any
  const Week2Bought = [] as any
  const Week3Bought = [] as any
  const Week4Bought = [] as any
  const thisWeekMint = [] as any
  const Week2Mint = [] as any
  const Week3Mint = [] as any
  const Week4Mint = [] as any
  data.map((item: any) => {
    const time = item.timeStamp * 1000
    if (time < thisWeekTime && time > thisWeekTime - 604800000) {
      thisWeek.push(item)
      if (item.action==='Transfer'||item.xw==='tranfer') {
        thisWeeSold.push(item.t1)
      }
      if (item.action==='sale'||item.xw==='sale') {
        thisWeekBought.push(item)
      }
      if (item.action==='mint'||item.xw==='mint') {
        thisWeekMint.push(item)
      }
    }
    if (time < thisWeekTime - 604800000 && time > thisWeekTime - 604800000 * 2) {
      Week2.push(item)
      if (item.action==='Transfer'||item.xw==='tranfer') {
        Week2Sold.push(item.t1)
      }
      if (item.action==='sale'||item.xw==='sale') {
        Week2Bought.push(item)
      }
      if (item.action==='mint'||item.xw==='mint') {
        Week2Mint.push(item)
      }
    }
    if (time < thisWeekTime - 604800000*2 && time > thisWeekTime - 604800000 * 3) {
      Week3.push(item)
      if (item.action==='Transfer'||item.xw==='tranfer') {
        Week3Sold.push(item.t1)
      }
      if (item.action==='sale'||item.xw==='sale') {
        Week3Bought.push(item)
      }
      if (item.action==='mint'||item.xw==='mint') {
        Week3Mint.push(item)
      }
    }
    if (time < thisWeekTime - 604800000*3 && time > thisWeekTime - 604800000 * 4) {
      Week4.push(item)
      if (item.action==='Transfer'||item.xw==='tranfer') {
        Week4Sold.push(item.t1)
      }
      if (item.action==='sale'||item.xw==='sale') {
        Week4Bought.push(item)
      }
      if (item.action==='mint'||item.xw==='mint') {
        Week4Mint.push(item)
      }
    }
  })
  const thisWeekOther = thisWeek.length-thisWeeSold.length-thisWeekBought.length-thisWeekMint.length
  const week2Other = Week2.length-Week2Sold.length-Week2Bought.length-Week2Mint.length
  const week3Other = Week3.length-Week3Sold.length-Week3Bought.length-Week3Mint.length
  const week4Other = Week4.length-Week4Sold.length-Week4Bought.length-Week4Mint.length

  return {
    Transfer: [
      calcuRatio(thisWeeSold,thisWeek,'ratio'),
      calcuRatio(Week2Sold,Week2,'ratio'),
      calcuRatio(Week3Sold,Week3,'ratio'),
      calcuRatio(Week4Sold,Week4,'ratio')
    ],
    bought: [
      calcuRatio(thisWeekBought,thisWeek,'ratio'),
      calcuRatio(Week2Bought,Week2,'ratio'),
      calcuRatio(Week3Bought,Week3,'ratio'),
      calcuRatio(Week4Bought,Week4,'ratio')
    ],
    mint: [
      calcuRatio(thisWeekMint,thisWeek,'ratio'),
      calcuRatio(Week2Mint,Week2,'ratio'),
      calcuRatio(Week3Mint,Week3,'ratio'),
      calcuRatio(Week4Mint,Week4,'ratio')
    ],
    other: [
      calcuRatio(thisWeekOther,thisWeek,'tranction'),
      calcuRatio(week2Other,Week2,'tranction'),
      calcuRatio(week3Other,Week3,'tranction'),
      calcuRatio(week4Other,Week4,'tranction')
    ]
  }
}
const calcucost = (val: any, places: number) => {
  if (places===18) {
    const vules = new BigNumber(val).div(1000000000000000000).toFixed(3)
    return vules
  }
  if (places===6) {
    const vules = new BigNumber(val).div(1000000).toFixed(3)
    return vules
  }
  return 0
}

export const GameAnalysis = (data: any) => {
  const { account, chainId, library } = useActiveWeb3React()
  const [saleRankTab, setSaleRankTab] = useState('')
  const [activityTab,setActivityTab] = useState('Bought')
  const [userComparisonTap, setUserComparisonTap] = useState('AverageActive')
  const [PSstate, setPSstate] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [moreDetails, setMoreDetails] = useState(false)
  const [Chart, setChart] = useState(false)
  const [UAWLoad, setUAWLoad] = useState(false)
  const [ComparisonChartLoad, setComparisonChartLoad] = useState(false)
  const [PurchasingLoad, setPurchasingLoad] = useState(false)
  const [ActionChartLoad, setActionChartLoad] = useState(false)
  const [RankingTableLoad, setRankingTableLoad] = useState(false)
  const [CollectionData, setCollectionData] = useState([] as any)
  const [RankData, setRankData] = useState([] as any)
  const [showSaleData, setShowSaleData] = useState([] as any)
  const [showPlayer, setShowPlayer] = useState([] as any)
  const [seachGameData,setSeachGameData] = useState([] as any)
  const [PopUpsData, setPopUpsData] = useState([] as any)
  const TestUSDTContract = useTestUSDTContract()
  const PaidDownloadContract = usePaidDownloadContract()

  useEffect(() => {
    if (data.seachContract.length) {
      detectionAddress()
    } else {
      if (data.data.length || data.seachCache.length) {
        getCollectionTransaction()
        setAverageActionChart()
      }
    }
  }, [data.data,data.seachCache,data.seachContract])

  useEffect(() => {
    if (saleRankTab!=='') {
      const filterdata = RankData.filter((item: any) => {
        return saleRankTab === item.tab
      })
      setShowSaleData(filterdata[0].saleData)
      setShowPlayer(filterdata[0].Player)
      setRankingTableLoad(false)
    }
  }, [saleRankTab])

  useEffect(() => {
    if (saleRankTab!==''&&moreDetails) {
      setUsercache(RankData)
    }
  }, [moreDetails])

  useEffect(() => {
    if (Chart) {
      setComparisonChartLoad(true)
      setPurchasingLoad(true)
      setuserComparisonChart()
      setAveragePurchasing()
    }
  }, [Chart])

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
      const time = Math.ceil(new Date().getTime()/1000)
      const bscinfo = await getdata.get(`https://deep-index.moralis.io/api/v2/nft/${data.seachContract}?chain=bsc&format=decimal&media_items=false`)
      if (bscinfo.data.result[0]?.contract_type) {
        const block = await http.get(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${time}&closest=before&apikey=${BSCSCAN_KEY}`)
        const params = {
          address: data.seachContract,
          chain: 'bsc',
          type: bscinfo.data.result[0].contract_type,
          name: bscinfo.data.result[0].name,
          blocknumber: block.data.result*1,
          uri: bscinfo.data.result[0].token_uri
        }
        newhttp.post(`v0/games_cache`, params)
      }
      const polygoninfo = await getdata.get(`https://deep-index.moralis.io/api/v2/nft/${data.seachContract}?chain=polygon&format=decimal&media_items=false`)
      if (polygoninfo.data.result[0]?.contract_type) {
        const block = await http.get(`https://api.polygonscan.com/api?module=block&action=getblocknobytime&timestamp=${time}&closest=before&apikey=${POLYGONSCAN_KEY}`)
        const params = {
          address: data.seachContract,
          chain: 'polygon',
          type: polygoninfo.data.result[0].contract_type,
          name: polygoninfo.data.result[0].name,
          blocknumber: block.data.result*1,
          uri: polygoninfo.data.result[0].token_uri
        }
        newhttp.post(`v0/games_cache`, params)
      }
      const ethinfo = await getdata.get(`https://deep-index.moralis.io/api/v2/nft/${data.seachContract}?chain=eth&format=decimal&media_items=false`)
      if (ethinfo.data.result[0]?.contract_type) {
        const apiKey = '5BCXEYI6ATAC8W93PHXY8UR598YSGNBWCT'
        const block = await http.get(`https://api.etherscan.com/api?module=block&action=getblocknobytime&timestamp=${time}&closest=before&apikey=${apiKey}`)
        const params = {
          address: data.seachContract,
          chain: 'eth',
          type: ethinfo.data.result[0].contract_type,
          name: ethinfo.data.result[0].name,
          blocknumber: block.data.result*1,
          uri: ethinfo.data.result[0].token_uri
        }
        newhttp.post(`v0/games_cache`, params)
      }
    }
    if (filterData.length) {
      if (Data.length || filterCache.length) {
        toastify.error('The game has been searched')
        return
      }
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
      if (Data.length || filterCache.length) {
        toastify.error('The game has been searched')
        return
      }
      if (data.seachCache.length>=3) {
        toastify.error('Choose up to 3')
        return
      }
      data.seachCache.push(data.seachContract)
      getCollectionTransaction()
      setAverageActionChart()
    }
    
  }

  const getCollectionTransaction = async () => {
    setUAWLoad(true)
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
    setUAWLoad(false)
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
    setActionChartLoad(true)
    setRankingTableLoad(true)
    const PlatformSeriesData = [] as any
    const Platformlegend = [] as any
    const BoughtDetailslegend = [] as any
    const PlatformxAxis = [] as any
    const legend = [] as any
    const NFTxAxis = [] as any
    const seriesData = [] as any
    const BotratioSeries = [] as any
    const BotTranctionSeries = [] as any
    const NFTTransactionSeries = [] as any
    const BoughtDetailsSeries = [] as any
    const arr = []
    const BoughttimeArr = [] as any
    const SoldtimeArr = [] as any
    RankData.length=0

    for (let index = 0; index < data.data.length; index++) {
      const element = data.data[index]
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
      if (filterData[0].chain === 'eth') {
        actions = await ethhttp.get(`v0/active_actions/${element}`)
        users = await ethhttp.get(`v0/active_users/${element}`)
      }
      const ItemGameData = seachGameData
      ItemGameData.push({
        name: filterData[0].contractName,
        chain: filterData[0].chain,
        data: actions.data.data
      })
      setSeachGameData(ItemGameData)
      const approveData = [] as any
      const adrr = '0x0000000000000000000000000000000000000000'
      const PlatformTime = [] as any
      const PlatformAll = [] as any
      const activeUser = [] as any
      let TokenTotal = 0
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
        if (item.xw !== '') {
          PlatformAll.push(item)
          const data = PlatformTime.filter((ele: any) => {
            return ele === item.timeStamp
          })
          if (data.length === 0) {
            PlatformTime.push(item.timeStamp)
          }
        }
        const filteraddress = activeUser.filter((ele: any) => {
          return ele === item.address
        })
        if (!filteraddress.length) {
          activeUser.push(item.address)
        }
        if (item.xw === 'sale') {
          const value = new BigNumber(item.transactionvalue).div(1000000000000000000).toNumber()
          TokenTotal = TokenTotal + value
        }
        item.t1 = filterAddress(item.t1)
        item.t2 = filterAddress(item.t2)
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
      const OpenSea = [] as any
      const Element = [] as any
      const Blur = [] as any
      const X2Y2 = [] as any
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
      PlatformSeriesData.push({
        name: `${filterData[0].contractName} OpenSea`,
        data: OpenSea,
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].contractName} Element`,
        data: Element,
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].contractName} Blur`,
        data: Blur,
        type: 'line',
        smooth: true
      },{
        name: `${filterData[0].contractName} X2Y2`,
        data: X2Y2,
        type: 'line',
        smooth: true
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
      const actionRankData = [] as any
      activeUser.map((item: any) => {
        let level
        const data = actions.data.data.filter((ele: any) => {
          return item.toLowerCase() === ele.t2.toLowerCase() || item.toLowerCase() === ele.t1
        })
        if (data.length >= 330) {
          bot = bot + 1
          bottransaction = bottransaction + data.length
          level = 'Bot'
        } else if (data.length < 330 && data.length > 250) {
          level = 'High'
        } else if(data.length < 250&& data.length > 150){
          level = 'Middle'
        } else {
          level = 'Low'
        }
        actionRankData.push({
          address: item,
          action: data.length,
          level: level
        })
      })
      const sortactionRankData = actionRankData.sort((a: any,b: any)=> {return b.action-a.action})
      const saleRankData = [] as any
      const Sales = actions.data.data.filter((item: any)=> {
        return item.xw === 'sale'
      })
      const Sold = actions.data.data.filter((item: any)=> {
        return item.xw === 'sold'
      })
      const SalesAddress = [] as any
      const Boughttime = [] as any
      Sales.map((item: any) => {
        const time = new Date(item.timeStamp * 1000).toJSON().substring(5, 10)
        const datas = Boughttime.filter((ele: any) => {
          const times = new Date(ele * 1000).toJSON().substring(5, 10)
          return times === time
        })
        if (datas.length === 0) {
          Boughttime.push(item.timeStamp)
        }
        const data = SalesAddress.filter((ele: any) => {
            return ele === item.address
        })
        if (data.length === 0) {
          SalesAddress.push(item.address)
        }
      })
      const BoughtDetailsData= [] as any
      const BoughtSpentData = [] as any
      const sortBoughttime = Boughttime.sort((a: any,b: any)=> {return b-a})
      let tokenPrice: any
      if (filterData[0].chain === 'eth') {
        tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=1`)).data.data[0]?.lastPrice
      }
      if (filterData[0].chain === 'bsc') {
        tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=56`)).data.data[0]?.lastPrice
      }
      if (filterData[0].chain === 'polygon') {
        tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=137`)).data.data[0]?.lastPrice
      }
      sortBoughttime.map((item: any) => {
        let spent = 0
        let ERC20Value = 0
        const times = new Date(item * 1000).toJSON().substring(5, 10)
        const data = Sales.filter((ele: any)=> {
          const time = new Date(ele.timeStamp * 1000).toJSON().substring(5, 10)
          return times === time
        })
        data.map(async (ele: any)=> {
          if (ele.token) {
            if (ele.token==='WETH') {
              const Price = (await polygonhttp.get(`v0/oklink/marketprice?chainId=1`)).data.data[0]?.lastPrice
              const value = new BigNumber(ele.price).div(1000000000000000000).toNumber()*Price
              ERC20Value = ERC20Value + value
            }
            if (ele.token==='Binance USD') {
              ERC20Value = ERC20Value + new BigNumber(ele.price).div(1000000000000000000).toNumber()
            }
          } else {
            spent = spent+ele.transactionvalue*1
          }
        })
        const vules = new BigNumber(spent).div(1000000000000000000).toNumber()
        const tokenValue = vules * tokenPrice + ERC20Value
        BoughttimeArr.push(times)
        BoughtDetailsData.push(data.length)
        BoughtSpentData.push(tokenValue.toFixed(3))
      })
      const Soldtime = [] as any
      Sold.map((item: any) => {
        const time = new Date(item.timeStamp * 1000).toJSON().substring(5, 10)
        const data = Soldtime.filter((ele: any) => {
          const times = new Date(ele * 1000).toJSON().substring(5, 10)
          return times === time
        })
        if (data.length === 0) {
          Soldtime.push(time)
        }
      })
      const SoldDetailsData = [] as any
      const SoldSpentData = [] as any
      const sortSoldtime = Soldtime.sort((a: any,b: any)=> {return b-a})
      sortSoldtime.map((item: any) => {
        let spent = 0
        const times = new Date(item * 1000).toJSON().substring(5, 10)
        const data = Sold.filter((ele: any)=> {
          const time = new Date(ele.timeStamp * 1000).toJSON().substring(5, 10)
          return times === time
        })
        data.map((ele: any)=> {
          spent = spent+ele.transactionvalue*1
        })
        const vules = new BigNumber(spent).div(1000000000000000000).toFixed(3)
        SoldtimeArr.push(times)
        SoldDetailsData.push(data.length)
        SoldSpentData.push(vules)
      })
      SalesAddress.map((item: any) => {
        const data = Sales.filter((ele: any) => {
          return item === ele.address
        })
        let value = 0
        data.map((val: any) => {
          value = value + new BigNumber(val.transactionvalue).div(1000000000000000000).toNumber()
        })
        saleRankData.push({
          address: item,
          Sales: data.length,
          Volume: value.toFixed(3),
          chain: filterData[0].chain
        })
      })
      const sortsaleRankData = saleRankData.sort((a: any,b: any)=> {return b.Volume-a.Volume})
      const Rankarr = RankData
      Rankarr.push({
        tab: filterData[0].contractName,
        contractAddress: filterData[0].contractAddress,
        saleData: sortsaleRankData.slice(0,10),
        Player: sortactionRankData.slice(0,10)
      })
      setRankData(Rankarr)
      arr.push({
        image: filterData[0].image,
        name: filterData[0].contractName,
        Sales: Sales.length,
        Avg: Sales.length===0? Sales.length: new BigNumber(TokenTotal.toFixed(3)).div(Sales.length).toFixed(3),
        chain: filterData[0].chain,
        Volume: TokenTotal.toFixed(3)
      })
      NFTxAxis.push(filterData[0].contractName)
      legend.push(`${filterData[0].contractName} Average Approve`)
      legend.push(`${filterData[0].contractName} Average Transction`)
      Platformlegend.push(...[`${filterData[0].contractName} OpenSea`,`${filterData[0].contractName} Element`,`${filterData[0].contractName} Blur`,`${filterData[0].contractName} X2Y2`,])
      BoughtDetailsSeries.push({
        name: `${filterData[0].contractName} Sale`,
        type: 'line',
        data: BoughtDetailsData
      },{
        name: `${filterData[0].contractName} Price & Volume($)`,
        type: 'line',
        data: BoughtSpentData
      })
      BoughtDetailslegend.push(`${filterData[0].contractName} Sale`)
      BoughtDetailslegend.push(`${filterData[0].contractName} Price & Volume($)`)
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
      BotratioSeries.push({
        name: `${filterData[0].contractName} Bot`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuBotratio(actions.data.data).bot
      },
      {
        name: `${filterData[0].contractName} Real`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuBotratio(actions.data.data).user
      })
      BotTranctionSeries.push({
        name: `${filterData[0].contractName} Bot`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuBotTranction(actions.data.data).bot
      },
      {
        name: `${filterData[0].contractName} Real`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuBotTranction(actions.data.data).user
      })
      NFTTransactionSeries.push({
        name: `${filterData[0].contractName} Other`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuNFTTranction(actions.data.data).other
      },
      {
        name: `${filterData[0].contractName} Transfer`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuNFTTranction(actions.data.data).Transfer
      },
      {
        name: `${filterData[0].contractName} Sale`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuNFTTranction(actions.data.data).bought
      },
      {
        name: `${filterData[0].contractName} Mint`,
        type: 'bar',
        stack: filterData[0].contractName,
        data: calcuNFTTranction(actions.data.data).mint
      })
    }

    for (let index = 0; index < data.seachCache.length; index++) {
      const element = data.seachCache[index]
      const filterData = data.gameData.filter((ele: any) => {
        return element.toLowerCase() === ele.address.toLowerCase()
      })
      const actionData = await newhttp.get(`v0/games_${filterData[0].chain}/${element}`)
      const ItemGameData = seachGameData
      ItemGameData.push({
        name: filterData[0].name,
        chain: filterData[0].chain,
        data: actionData.data.data
      })
      setSeachGameData(ItemGameData)
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
      const Boughttime = [] as any
      Sales.map((item: any) => {
        const address = filterAddress(item.t1)
        const time = new Date(item.timeStamp * 1000).toJSON().substring(5, 10)
        const data = Boughttime.filter((ele: any) => {
          const times = new Date(ele * 1000).toJSON().substring(5, 10)
          return times === time
        })
        if (data.length === 0) {
          Boughttime.push(item.timeStamp)
        }
        if (address !=='0x0000000000000000000000000000000000000000') {
          const data = SalesAddress.filter((ele: any) => {
            return ele === address
          })
          if (data.length === 0) {
            SalesAddress.push(address)
          }
        }
      })
      const BoughtDetailsData= [] as any
      const BoughtSpentData = [] as any
      const sortBoughttime = Boughttime.sort((a: any,b: any)=> {return b-a})
      let tokenPrice: any
      if (filterData[0].chain === 'eth') {
        tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=1`)).data.data[0]?.lastPrice
      }
      if (filterData[0].chain === 'bsc') {
        tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=56`)).data.data[0]?.lastPrice
      }
      if (filterData[0].chain === 'polygon') {
        tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=137`)).data.data[0]?.lastPrice
      }
      sortBoughttime.map(async (item: any) => {
        let spent = 0
        let ERC20Value = 0
        const times = new Date(item * 1000).toJSON().substring(5, 10)
        const data = Sales.filter((ele: any)=> {
          const time = new Date(ele.timeStamp * 1000).toJSON().substring(5, 10)
          return times === time
        })
        data.map(async (ele: any)=> {
          if (ele.token) {
            if (ele.token==='WETH') {
              const Price = (await polygonhttp.get(`v0/oklink/marketprice?chainId=1`)).data.data[0]?.lastPrice
              const value = new BigNumber(ele.price).div(1000000000000000000).toNumber()*Price
              ERC20Value = ERC20Value + value
            }
            if (ele.token==='Binance USD') {
              ERC20Value = ERC20Value + new BigNumber(ele.price).div(1000000000000000000).toNumber()
            }
          } else {
            spent = spent+ele.transactionvalue*1
          }
        })
        const vules = new BigNumber(spent).div(1000000000000000000).toNumber()
        const tokenValue = vules * tokenPrice + ERC20Value
        BoughttimeArr.push(times)
        BoughtDetailsData.push(data.length)
        BoughtSpentData.push(tokenValue.toFixed(3))
      })
      BoughtDetailsSeries.push({
        name: `${filterData[0].name} Sale`,
        type: 'line',
        data: BoughtDetailsData
      },{
        name: `${filterData[0].name} Price & Volume($)`,
        type: 'line',
        data: BoughtSpentData
      })
      BoughtDetailslegend.push(`${filterData[0].name} Sale`)
      BoughtDetailslegend.push(`${filterData[0].name} Price & Volume($)`)
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
          Volume: value.toFixed(3),
          chain: filterData[0].chain
        })
      })
      const sortsaleRankData = saleRankData.sort((a: any,b: any)=> {return b.Volume-a.Volume})
      arr.push({
        image: filterData[0].image,
        name: filterData[0].name,
        Sales: Sales.length,
        Avg: Sales.length===0? Sales.length: new BigNumber(TokenTotal.toFixed(3)).div(Sales.length).toFixed(3),
        chain: filterData[0].chain,
        Volume: TokenTotal.toFixed(3)
      })
      let bot = 0
      let bottransaction = 0
      activeUser.map((item: any) => {
        let level
        const data = actionData.data.data.filter((ele: any) => {
          return item === filterAddress(ele.t1)
        })
        if (data.length >= 250) {
          bot = bot + 1
          bottransaction = bottransaction + data.length
          level = 'Bot'
        } else if (data.length < 250 && data.length > 200) {
          level = 'High'
        } else if(data.length < 200&& data.length > 100){
          level = 'Middle'
        } else {
          level = 'Low'
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
        contractAddress: filterData[0].address,
        saleData: sortsaleRankData.slice(0,10),
        Player: sortactionRankData.slice(0,10)
      })
      setRankData(Rankarr)
      NFTxAxis.push(filterData[0].name)
      Platformlegend.push(...[`${filterData[0].name} OpenSea`,`${filterData[0].name} Element`,`${filterData[0].name} Blur`,`${filterData[0].name} X2Y2`,])
      legend.push(`${filterData[0].name} Average Approve`)
      legend.push(`${filterData[0].name} Average Transction`)
      BotratioSeries.push({
        name: `${filterData[0].name} Bot`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuBotratio(actionData.data.data).bot
      },
      {
        name: `${filterData[0].name} Real`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuBotratio(actionData.data.data).user
      })
      BotTranctionSeries.push({
        name: `${filterData[0].name} Bot`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuBotTranction(actionData.data.data).bot
      },
      {
        name: `${filterData[0].name} Real`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuBotTranction(actionData.data.data).user
      })
      NFTTransactionSeries.push({
        name: `${filterData[0].name} Other`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuNFTTranction(actionData.data.data).other
      },
      {
        name: `${filterData[0].name} Transfer`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuNFTTranction(actionData.data.data).Transfer
      },
      {
        name: `${filterData[0].name} Sale`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuNFTTranction(actionData.data.data).bought
      },
      {
        name: `${filterData[0].name} Mint`,
        type: 'bar',
        stack: filterData[0].name,
        data: calcuNFTTranction(actionData.data.data).mint
      })
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

    setActionChartLoad(false)
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
        data: ['thisWeek','week2','week3','week4']
      },
      yAxis: {
        type: 'value' as any
      },
      series: NFTTransactionSeries
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
        data: ['thisWeek','week2','week3','week4']
      },
      yAxis: {
        type: 'value' as any
      },
      series: BotratioSeries
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
        data: ['thisWeek','week2','week3','week4']
      },
      yAxis: {
        type: 'value' as any
      },
      series: BotTranctionSeries
    }
    const BotTransactionratiodom = document.getElementById('BotTransactionRatio') as HTMLDivElement
    const BotTransactionratioChart = echarts.init(BotTransactionratiodom)
    BotTransactionratioChart.setOption(BotTransactionOption)
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
    const Boughtoptions = {
      tooltip: {
        trigger: 'axis' as any
      },
      legend: {
        data: BoughtDetailslegend
      },
      xAxis: {
        data: BoughttimeArr
      },
      yAxis: {
        type: 'value' as any
      },
      series: BoughtDetailsSeries
    }
    const Boughtmdom = document.getElementById('SaleDetails') as HTMLDivElement
    const BoughtChart = echarts.init(Boughtmdom)
    BoughtChart.setOption(Boughtoptions)
    BoughtChart.on('click', BoughtChartClick)
  }
  const setUsercache = async (addressData: any) => {
    const Time = new Date(`${new Date().getFullYear()}-${firstWeek()} 23:59:59`).getTime()
    for (let index = 0; index < addressData.length; index++) {
      const element = addressData[index];
      const userdata = await newhttp.get(`v0/user/${element.contractAddress}`)
      const usercacheData = await newhttp.get(`v0/user_cache/${element.contractAddress}`)

      const filteruserdata = userdata.data.data.filter((item: any) => {
        const itemTime = new Date(item.dates).getTime()
        return itemTime>Time && itemTime<Time+604800000
      })
      const filterusercacheData = usercacheData.data.data.filter((item: any) => {
        const itemTime = new Date(item.dates).getTime()
        return itemTime>Time && itemTime<Time+604800000
      })

      if (!filteruserdata.length&&!filterusercacheData.length) {
          let PlayerAddress = ''
          if (element.Player.length) {
            element.Player.map((item: any) => {
              PlayerAddress=PlayerAddress + item.address +','
            })
            const parm = {
              address: PlayerAddress,
              action: 'topPlayers',
              contractaddress: element.contractAddress
            }
            newhttp.post(`v0/user_cache`,parm)
          }

          let saleAddress = ''
          if (element.saleData.length) {
            element.saleData.map((item: any) => {
              saleAddress=saleAddress + item.address +','
            })
            const saleparm = {
              address: saleAddress,
              action: 'topSalers',
              contractaddress: element.contractAddress
            }
            newhttp.post(`v0/user_cache`,saleparm)
          }
      } else {
        setChart(true)
      }
    }
  }
  const setuserComparisonChart = async () => {
    const arr = [...data.data,...data.seachCache]
    const GameData = [...data.GameData,...data.gameData]
    const Time = new Date(`${new Date().getFullYear()}-${firstWeek()} 23:59:59`).getTime()
    const AverageActiveLegend = [] as any
    const AverageActiveTime = [] as any
    const AverageActiveSeries = [] as any
    const ChainActivityData = [] as any
    const PlayersCollactionData = [] as any
    const SalersCollactionData = [] as any
    const TimeArr = [] as any
    
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index]
      const filterData = GameData.filter((ele: any) => {
        return element?.toLowerCase() === ele.contractAddress?.toLowerCase() || element?.toLowerCase() === ele.address?.toLowerCase()
      })
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Players Approve`)
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Salers Approve`)
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Players Transfer`)
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Salers Transfer`)
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Players Mint`)
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Salers Mint`)
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Players Transactions`)
      AverageActiveLegend.push(`${filterData[0]?.name||filterData[0]?.contractName} Top Salers Transactions`)
      const statistic = await newhttp.get(`v0/data_statistic/${element}`)
      const statisticDay = await newhttp.get(`v0/data_statistic_day/${element}`)
      const filterstatisticDay = statisticDay.data.data.filter((item: any) => {
        const itemTime = new Date(item.dates).getTime()
        return itemTime>Time && itemTime<Time+604800000
      })
      const PlayersApprove = [] as any
      const SalersApprove = [] as any
      const PlayersTransfer = [] as any
      const SalersTransfer = [] as any
      const PlayersMint = [] as any
      const SalersMint = [] as any
      const PlayersTransactions = [] as any
      const SalersTransactions = [] as any
      filterstatisticDay.map((item: any) => {
        const findTime = TimeArr.filter((ele: any) => {
          return ele === new Date(item.days).getTime()
        })
        if (!findTime.length) {
          TimeArr.push(new Date(item.days).getTime())
        }
        if (item.actions==='topPlayers') {
          PlayersApprove.push(item.approvels)
          PlayersTransfer.push(item.transfers)
          PlayersMint.push(item.mints)
          PlayersTransactions.push(item.Transactions)
        }
        if (item.actions==='topSalers') {
          SalersApprove.push(item.approvels)
          SalersTransfer.push(item.transfers)
          SalersMint.push(item.mints)
          SalersTransactions.push(item.Transactions)
        }
      })
      TimeArr.sort((a: any,b: any)=> {return b-a}).map((item: any) => {
        AverageActiveTime.push(new Date(item).toJSON().slice(5,10))
      })
      
      AverageActiveSeries.push({
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Players Approve`,
          type: 'line',
          data: PlayersApprove
        },{
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Salers Approve`,
          type: 'line',
          data: SalersApprove
        },{
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Players Transfer`,
          type: 'line',
          data: PlayersTransfer
        },{
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Salers Transfer`,
          type: 'line',
          data: SalersTransfer
        },{
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Players Mint`,
          type: 'line',
          data: PlayersMint
        },{
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Salers Mint`,
          type: 'line',
          data: SalersMint
        },{
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Players Transactions`,
          type: 'line',
          data: PlayersTransactions
        },{
          name: `${filterData[0]?.name||filterData[0]?.contractName} Top Salers Transactions`,
          type: 'line',
          data: SalersTransactions
      })
      
      const filterstatistic = statistic.data.data.filter((item: any) => {
        const itemTime = new Date(item.dates).getTime()
        return itemTime>Time && itemTime<Time+604800000
      })
      const PlayersId = filterstatistic.filter((item: any) => {
        return item.actions==='topPlayers'
      })
      const SalersId = filterstatistic.filter((item: any) => {
        return item.actions==='topSalers'
      })
      const Playercollaction = await newhttp.get(`v0/data_statistics_rank5s/${PlayersId[0]?.id}`)
      Playercollaction.data.data.map((ele: any) => {
        if (ele.contractname.length>0) {
          PlayersCollactionData.push({
            value: ele.amount,
            name: ele.contractname
          })
        }
      })
      const Salerscollaction = await newhttp.get(`v0/data_statistics_rank5s/${SalersId[0]?.id}`)
      Salerscollaction.data.data.map((ele: any) => {
        if (ele.contractname.length>0) {
          SalersCollactionData.push({
            value: ele.amount,
            name: ele.contractname
          })
        }
      })

      filterstatistic.map(async (item: any) => {
        if (item.actions==='topPlayers') {
          if (item.ethereums||item.polygons||item.binance_smart_chains) {
            ChainActivityData.push({
              value: item.ethereums,
              name: `${filterData[0]?.name||filterData[0]?.contractName} Top Players Ethereum`
            },{
              value: item.polygons,
              name: `${filterData[0]?.name||filterData[0]?.contractName} Top Players Polygon`
            },{
              value: item.binance_smart_chains,
              name: `${filterData[0]?.name||filterData[0]?.contractName} Top Players Binance_chains`
            })
          }
        }
        if (item.actions==='topSalers') {
          if (item.ethereums||item.polygons||item.binance_smart_chains) {
            ChainActivityData.push({
              value: item.ethereums,
              name: `${filterData[0]?.name||filterData[0]?.contractName} Top Salers Ethereum`
            },{
              value: item.polygons,
              name: `${filterData[0]?.name||filterData[0]?.contractName} Top Salers Polygon`
            },{
              value: item.binance_smart_chains,
              name: `${filterData[0]?.name||filterData[0]?.contractName} Top Salers Binance_chains`
            })
          }
        }
      })
    }
    setComparisonChartLoad(false)
    const AverageActiveOption = {
      tooltip: {
        trigger: 'axis' as any
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        containLabel: true
      },
      legend: {
        data: AverageActiveLegend
      },
      xAxis: {
        data: AverageActiveTime
      },
      yAxis: {
        type: 'value' as any
      },
      series: AverageActiveSeries
    }
    if (AverageActiveSeries.length) {
      echarts.dispose(document.getElementById('AverageActive') as HTMLDivElement)
      const AverageActivedom = document.getElementById('AverageActive') as HTMLDivElement
      const AverageActiveChart = echarts.init(AverageActivedom)
      AverageActiveChart.setOption(AverageActiveOption)
    }

    echarts.dispose(document.getElementById('ChainActivity') as HTMLDivElement)
    const ChainActivitydom = document.getElementById('ChainActivity') as HTMLDivElement
    const ChainActivityChart = echarts.init(ChainActivitydom)
    ChainActivityChart.setOption(PieOption('', ChainActivityData))

    echarts.dispose(document.getElementById('PlayersCollections') as HTMLDivElement)
    const PlayersCollactiondom = document.getElementById('PlayersCollections') as HTMLDivElement
    const PlayersCollactionChart = echarts.init(PlayersCollactiondom)
    PlayersCollactionChart.setOption(PieOption('', PlayersCollactionData))
    

    echarts.dispose(document.getElementById('SalersCollections') as HTMLDivElement)
    const SalersCollactiondom = document.getElementById('SalersCollections') as HTMLDivElement
    const SalersCollactionChart = echarts.init(SalersCollactiondom)
    SalersCollactionChart.setOption(PieOption('', SalersCollactionData))
  }
  const setAveragePurchasing = async () => {
    const averagePurchasingSeries = [] as any
    const averagePurchasingTime = [] as any
    const averagePurchasingLegend = [] as any
    const GameData = [...data.GameData,...data.gameData]
    let arr: any
    if (data.seachContract) {
      arr = [...data.data,...data.seachCache,data.seachContract]
    } else {
      arr = [...data.data,...data.seachCache]
    }
    if (seachGameData.length) {
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index]
        const filterData = GameData.filter((ele: any) => {
          return element?.toLowerCase() === ele.contractAddress?.toLowerCase() || element?.toLowerCase() === ele.address?.toLowerCase()
        })
        let tokenPrice: any
        if (filterData[0].chain === 'eth') {
          tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=1`)).data.data[0]?.lastPrice
        }
        if (filterData[0].chain === 'bsc') {
          tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=56`)).data.data[0]?.lastPrice
        }
        if (filterData[0].chain === 'polygon') {
          tokenPrice = (await polygonhttp.get(`v0/oklink/marketprice?chainId=137`)).data.data[0]?.lastPrice
        }
        const findGame = seachGameData.filter((item: any) => {
          return item.name === filterData[0].name || item.name === filterData[0].contractName
        })
        const Sales = findGame[0].data.filter((item: any)=> {
          return item.action === 'sale' || item.xw === 'sale'
        })
        const Boughttime = [] as any
        Sales.map((item: any) => {
          const time = new Date(item.timeStamp * 1000).toJSON().substring(5, 10)
          const data = Boughttime.filter((ele: any) => {
            const times = new Date(ele * 1000).toJSON().substring(5, 10)
            return times === time
          })
          if (data.length === 0) {
            Boughttime.push(item.timeStamp)
          }
        })
        
        const sortBoughttime = Boughttime.sort((a: any,b: any)=> {return b-a})
        const findRankData = RankData.filter((item:any) => {
          return item.contractAddress === element
        })
        const PlayerData = [] as any
        const SaleData = [] as any
        sortBoughttime.map(async (item: any) => {
          let spent = 0
          let ERC20Value = 0
          let saleSpent = 0
          let saleERC20Value = 0
          const times = new Date(item * 1000).toJSON().substring(5, 10)
          const data = Sales.filter((ele: any)=> {
            const time = new Date(ele.timeStamp * 1000).toJSON().substring(5, 10)
            return times === time
          })
          data.map(async (ele: any)=> {
            const PlayerIndex = findRankData[0].Player.findIndex((i: any) => {
              return i.address === ele.address || i.address === filterAddress(ele.t1)
            })
            const saleIndex = findRankData[0].saleData.findIndex((i: any) => {
              return i.address === ele.address || i.address === filterAddress(ele.t1)
            })
            if (PlayerIndex>=0) {
              if (ele.token) {
                if (ele.token==='WETH') {
                  const Price = (await polygonhttp.get(`v0/oklink/marketprice?chainId=1`)).data.data[0]?.lastPrice
                  const value = new BigNumber(ele.price).div(1000000000000000000).toNumber()*Price
                  ERC20Value = ERC20Value + value
                }
                if (ele.token==='Binance USD') {
                  ERC20Value = ERC20Value + new BigNumber(ele.price).div(1000000000000000000).toNumber()
                }
              } else {
                spent = spent+ele.transactionvalue*1
              }
            }
            if (saleIndex>=0) {
              if (ele.token) {
                if (ele.token==='WETH') {
                  const Price = (await polygonhttp.get(`v0/oklink/marketprice?chainId=1`)).data.data[0]?.lastPrice
                  const value = new BigNumber(ele.price).div(1000000000000000000).toNumber()*Price
                  saleERC20Value = saleERC20Value + value
                }
                if (ele.token==='Binance USD') {
                  saleERC20Value = saleERC20Value + new BigNumber(ele.price).div(1000000000000000000).toNumber()
                }
              } else {
                saleSpent = saleSpent+ele.transactionvalue*1
              }
            }
            
          })
          const vules = new BigNumber(spent).div(1000000000000000000).toNumber()
          const saleVules = new BigNumber(saleSpent).div(1000000000000000000).toNumber()
          const tokenValue = (vules * tokenPrice + ERC20Value) /findRankData[0].Player.length
          const saleTokenValue = (saleVules * tokenPrice + saleERC20Value) /findRankData[0].saleData.length
          averagePurchasingTime.push(times)
          PlayerData.push(tokenValue.toFixed(3))
          SaleData.push(saleTokenValue.toFixed(3))
        })
        averagePurchasingLegend.push(`${filterData[0].name||filterData[0]?.contractName} Top Players($)`)
        averagePurchasingLegend.push(`${filterData[0].name||filterData[0]?.contractName} Top Salers($)`)
        averagePurchasingSeries.push({
          name: `${filterData[0].name||filterData[0]?.contractName} Top Players($)`,
          type: 'line',
          data: PlayerData
        },{
          name: `${filterData[0].name||filterData[0]?.contractName} Top Salers($)`,
          type: 'line',
          data: SaleData
        })
      }
    }
    setPurchasingLoad(false)
    const averagePurchasingoption = {
      tooltip: {
        trigger: 'axis' as any
      },
      legend: {
        data: averagePurchasingLegend
      },
      xAxis: {
        data: averagePurchasingTime
      },
      yAxis: {
        type: 'value' as any
      },
      series: averagePurchasingSeries
    }
    const averagePurchasingdom = document.getElementById('averagePurchasing') as HTMLDivElement
    const averagePurchasingChart = echarts.init(averagePurchasingdom)
    averagePurchasingChart.setOption(averagePurchasingoption)
    
  }
  const BoughtChartClick = (params: any) => {
    const data = seachGameData.filter((item: any) => {
      return `${item.name} Bought` === params.seriesName
    })
    if (data.length) {
      const Bought = data[0].data.filter((item: any)=> {
        return item.action === 'sale'|| item.xw=== 'sale'
      })
      const filterData = Bought.filter((item: any)=> {
        const time = new Date(item.timeStamp * 1000).toJSON().substring(5, 10)
        return time === params.name
      })
      const parm = [{
        chain: data[0].chain,
        data: filterData
      }]
      setPopUpsData(parm)
      setShowActivity(true)
    }
  }
  const download = async () => {
    if (!library) return
    const approvetx = await TestUSDTContract?.approve('0xBb183C2BF6f9867250C9507254534A74cc34686F', 5000000)
    const approvereceipt = await fetchReceipt(approvetx.hash, library)
    if (!approvereceipt.status) {
        throw new Error('failed')
    }
    const addressArr = ['0x2953399124f0cbb46d2cbacd8a89cf0599974963','0x9928a8ea82d86290dfd1920e126b3872890525b3','0x7ad922413739ebd7f1cb8fdcf74e6936dcec9e51']
    const rented = await PaidDownloadContract?.connect(library.getSigner()).buyreport(addressArr,addressArr.length,0)
    const receipt = await fetchReceipt(rented.hash, library)
    const { status } = receipt
    if (!status) {
      throw Error('Failed to rent.')
    } else {
      const dom = document.getElementById('download') as HTMLElement
      html2canvas(dom).then((canvas) => {
        const imgData = canvas.toDataURL('image', 1.0)
        saveFile(imgData, 'download')
      })
    }
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
      <Dialog footer={null} onCancel={() => setShowActivity(false)} open={showActivity} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">details</div>
          {PopUpsData && PopUpsData.length ? (
            PopUpsData[0].data.map((item: any, index: number) => (
              <div key={index} className={(index + 1) % 2 === 0 ? 'spacing-5 bag' : 'spacing-5'}>
                <span>{index + 1}.</span>&nbsp;&nbsp;
                {new Date(item.timeStamp * 1000).toJSON().substr(0, 10)}&nbsp;&nbsp;
                <span className="blue">{formatting(filterAddress(item.t1))}</span>&nbsp;&nbsp;
                Spent&nbsp;
                {calcucost(item.transactionvalue,18)}&nbsp;
                {PopUpsData[0].chain==='bsc'?'BNB':PopUpsData[0].chain==='eth'?'ETH':'MATIC'}&nbsp;
                <b>{item.action === 'sale'||item.xw==='sale'? 'Sale':'Sale'}</b>&nbsp;
                NFT&nbsp;{item.t3||item.tokenid}&nbsp;
                {item.action === 'sale'||item.xw==='sale'? 'From':' To '}&nbsp;
                <span className="blue">{formatting(filterAddress(item.t2))}</span>
              </div>
            ))
          ) : (
            <div className="text-center">No records</div>
          )}
        </SendBox>
      </Dialog>
      {PSstate? (
        <div className="text-center">The data might take a while to load. Please come back later.</div>
      ) :''}
      {!PSstate ? (
        <AnalysisBox id="download">
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
          <ApproveTable className="bg borderNone relative">
            <div className="pieTitle text-center">UAW</div>
              <div id="interactionsPerDay">
                {UAWLoad? (
                  <Loading></Loading>
                ): (
                  <div className="text-center margin">No Data</div>
                )}
              </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone relative">
            <div className="pieTitle text-center">Transactions Platform</div>
            <div id="Platform" className="item">
              {ActionChartLoad? (
                <Loading></Loading>
              ):(
                <div className="text-center margin">No Data</div>
              )}
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <Activity className="bg borderNone relative">
            <div className="tabs flex">
              <div onClick={() => setActivityTab('Bought')}>
                Sale
                {activityTab === 'Bought' ? <img src={shortbutton} /> : ''}
              </div>
            </div>
            <div id="SaleDetails" className={activityTab === 'Bought' ? 'item' : 'item none'}>
              {ActionChartLoad? (
                <Loading></Loading>
              ):(
                <div className="text-center margin">No Data</div>
              )}
            </div>
          </Activity>
          <ApproveTable className="bg borderNone relative">
            <div className="pieTitle text-center">Player Proportion(%)</div>
            <div id="Botratio" className="item">
              {ActionChartLoad? (
                <Loading></Loading>
              ):(
                <div className="text-center margin">No Data</div>
              )}
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone relative">
            <div className="pieTitle text-center">Player Transaction Proportion(%)</div>
            <div id="BotTransactionRatio" className="item">
              {ActionChartLoad? (
                <Loading></Loading>
              ):(
                <div className="text-center margin">No Data</div>
              )}
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone relative">
            <div className="pieTitle text-center">NFT Transaction(%)</div>
            <div id="NFTTransaction">
              {ActionChartLoad? (
                <Loading></Loading>
              ):(
                <div className="text-center margin">No Data</div>
              )}
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <ApproveTable className="bg borderNone relative">
            <div id="AverageActions">
              {ActionChartLoad? (
                <Loading></Loading>
              ):(
                <div>
                  <div className="text-center pieTitle">Average Action</div>
                  <div className="text-center margin">No Data</div>
                </div>
              )}
            </div>
            <div className="text-center">{new Date().toISOString().substr(0, 10)}</div>
          </ApproveTable>
          <RankingTable className="flex flex-h-between">
            <div className="actionRank itemDiv bg relative">
              {RankingTableLoad? (
                <Loading></Loading>
              ):(
                <div>
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
                          <div className={item?.level==='Bot' ? 'red':item?.level === 'High' ? 'green':item?.level === 'Middle' ? 'blue' : 'cyan'}>{item.level}</div>
                        </div>
                      ))
                    ):(
                      <div className="NoData text-center">No data</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="saleRank itemDiv bg relative">
              {RankingTableLoad? (
                <Loading></Loading>
              ):(
                <div>
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
              )}
            </div>
          </RankingTable>
          {moreDetails?(
            <ApproveTable className="ApproveTable bg borderNone relative">
              <Tap className="flex">
                <div onClick={()=> setUserComparisonTap('AverageActive')}>
                  Average active rate
                  {userComparisonTap === 'AverageActive' ? <img src={shortbutton} /> : ''}
                </div>
                <div onClick={()=> setUserComparisonTap('averagePurchasing')}>
                  average purchasing rate
                  {userComparisonTap === 'averagePurchasing' ? <img src={shortbutton} /> : ''}
                </div>
                <div onClick={()=> setUserComparisonTap('ChainActivity')}>
                  Chain activity rate
                  {userComparisonTap === 'ChainActivity' ? <img src={shortbutton} /> : ''}
                </div>
                <div onClick={()=> setUserComparisonTap('PlayersCollections')}>
                  Top Players Collections
                  {userComparisonTap === 'PlayersCollections' ? <img src={shortbutton} /> : ''}
                </div>
                <div onClick={()=> setUserComparisonTap('SalersCollections')}>
                  Top Salers Collections
                  {userComparisonTap === 'SalersCollections' ? <img src={shortbutton} /> : ''}
                </div>
              </Tap>
              <div id="AverageActive" className={userComparisonTap==='AverageActive'?'item absolute':'item absolute none'}>
                {ComparisonChartLoad? (
                  <Loading></Loading>
                ):(
                  <div className="text-center margin">No Data</div>
                )}
              </div>
              <div id="averagePurchasing" className={userComparisonTap==='averagePurchasing'?'item absolute':'item absolute none'}>
                {PurchasingLoad? (
                  <Loading></Loading>
                ):(
                  <div className="text-center margin">No Data</div>
                )}
              </div>
              <div id="ChainActivity" className={userComparisonTap==='ChainActivity'?'item':'item absolute none'}>
                {ComparisonChartLoad? (
                  <Loading></Loading>
                ):(
                  <div className="text-center margin">No Data</div>
                )}
              </div>
              <div id="PlayersCollections" className={userComparisonTap==='PlayersCollections'?'item':'item absolute none'}>
                {ComparisonChartLoad? (
                  <Loading></Loading>
                ):(
                  <div className="text-center margin">No Data</div>
                )}
              </div>
              <div id="SalersCollections" className={userComparisonTap==='SalersCollections'?'item':'item absolute none'}>
                {ComparisonChartLoad? (
                  <Loading></Loading>
                ):(
                  <div className="text-center margin">No Data</div>
                )}
              </div>
            </ApproveTable>
          ) : (
            <div className="Download cursor" onClick={() => setMoreDetails(true)}>See More Detail</div>
          )}
        </AnalysisBox>
      ) : ''}
      {/* <div className="Download cursor" onClick={download}>Download $</div> */}
    </Analysis>
  )
}
