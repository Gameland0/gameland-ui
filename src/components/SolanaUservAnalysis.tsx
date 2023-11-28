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
import { divide } from 'lodash'

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

export const SolanaUservAnalysis = (data: any) => {
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
  const [polygonNFTTotal, setPolygonNFTTotal] = useState(-1)
  const [polygonColletionTotal, setPolygonColletionTotal] = useState(-1)

  useEffect(() => {
    getPieChartData()
    detectionAddress()
  }, [data.useraddress])

  useEffect(() => {
    if (PieChartData&&PieChartData.length) {
      componentDidMount()
      getTokensData()
      setCollectionPie()
    }
  }, [PieChartData])

  // useEffect(() => {
  //   if (interactAll&&interactAll.length) {
  //     setRelationChart()
  //   }
  // }, [interactAll])

  const shyftAPi = axios.create({
    timeout: 100000,
    headers: {
      'x-api-key': 'a1-OV8wanr7FRQHM'
    }
  })

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

  const getPieChartData = async () => {
    setLoaddState(true)
    const transaction1 = await shyftAPi.get(`https://api.shyft.to/sol/v1/transaction/history?network=mainnet-beta&tx_num=100&account=${data.useraddress}&enable_raw=true`)
    const length = transaction1.data.result.length - 1
    const transaction2 = await shyftAPi.get(`https://api.shyft.to/sol/v1/transaction/history?network=mainnet-beta&tx_num=100&account=${data.useraddress}&enable_raw=true&before_tx_signature=${transaction1.data.result[length]?.signatures[0]}`)
    setPieChartData([...transaction1.data.result,...transaction2.data.result])
    setLoaddState(false)
  }

  const componentDidMount = () => {
    if (PieChartData && PieChartData.length) {
      const Tabledata = [] as any
      const swapdata = [] as any
      const transactionData = [] as any
      const interactArr = [] as any
      const Activityoptionsseries: any[] = []
      const xAxisdata: any[] = []
      const seriesdata = [] as any
      PieChartData?.map((item: any) => {
        const filterTime = xAxisdata.filter((ele: any) => {
          return item.timestamp.substr(5, 5) === ele
        })
        if (!filterTime.length) {
          xAxisdata.push(item.timestamp.substr(5, 5))
        }
        if (item.type==='NFT_TRANSFER') {
          item.actions.map((ele: any) => {
            if (Object.keys(ele.info).length&&ele.type===item.type) {
              Tabledata.push({
                nftname: ele.info.nft_address ||ele[2].info.token_address,
                price: 0,
                chain: 'Solana',
                type: item.type,
                time: item.timestamp.substr(0, 10)+' '+item.timestamp.substr(11, 8)
              })
            }
          })
        }
        if (item.type==='NFT_SALE') {
          Tabledata.push({
            nftname: item.actions[0].info.nft_address,
            price: item.actions[0].info.price+' '+'Sol',
            chain: 'Solana',
            type: item.type,
            time: item.timestamp.substr(0, 10)+' '+item.timestamp.substr(11, 8)
          })
        }
        if (item.type==='TOKEN_TRANSFER') {
          item.actions.map((ele: any) => {
            if (Object.keys(ele.info).length&&ele.type==='TOKEN_TRANSFER'){
              transactionData.push({
                tokenAddress: ele?.info?.token_address,
                sent: formatting(ele?.info?.sender),
                price: (ele.info.amount).toFixed(3),
                received: formatting(ele?.info?.receiver),
                chain: 'Solana',
                type: item.type,
                time: item.timestamp.substr(0, 10)+' '+item.timestamp.substr(11, 8)
              })
            }
          })
        }
        if (item.type==='SOL_TRANSFER') {
          item.actions.map((ele: any) => {
            if (Object.keys(ele.info).length&&ele.type===item.type) {
              transactionData.push({
                tokenAddress: '',
                sent: formatting(ele.info.sender),
                price: (ele.info.amount).toFixed(3)+' '+'Sol',
                received: formatting(ele.info.receiver),
                chain: 'Solana',
                type: item.type,
                time: item.timestamp.substr(0, 10)+' '+item.timestamp.substr(11, 8)
              })
            }
          })
        }
        if (item.type==='SWAP') {
          if (Object.keys(item.actions[0].info.tokens_swapped).length
             &&item.actions[0].info.tokens_swapped.in&&item.actions[0].info.tokens_swapped.out) {
            swapdata.push({
              sent: (item.actions[0].info.tokens_swapped.in?.amount).toFixed(2) + ' ' + item.actions[0].info.tokens_swapped.in.symbol,
              received: (item.actions[0].info.tokens_swapped.out?.amount).toFixed(2) + ' ' + item.actions[0].info.tokens_swapped.out.symbol,
              type: item.type,
              platform: item.actions[0].source_protocol.name,
              chain: 'Solana',
              time: item.timestamp.substr(0, 10)+' '+item.timestamp.substr(11, 8)
            })
          }
        }
        // if (item.type==='MINT') {
        //   console.log(item)
        // }
      })
      xAxisdata.map((item: any) => {
        const findData = PieChartData.filter((ele: any) => {
          return item === ele.timestamp.substr(5, 5)
        })
        seriesdata.push(findData.length)
      })
      Activityoptionsseries.push({
        name: 'Solana',
        type: 'line',
        data: seriesdata
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
          data: ['Solana']
        },
        xAxis: {
          data: xAxisdata
        },
        yAxis: {
          type: 'value' as any
        },
        series: Activityoptionsseries
      }
      // const collationActivityoption = {
      //   title: {
      //     text: 'Activity',
      //     top : '90%',
      //     left: 'center'
      //   },
      //   tooltip: {
      //     trigger: 'axis' as any
      //   },
      //   legend: {
      //     data: []
      //   },
      //   xAxis: {
      //     data: xAxisdata
      //   },
      //   yAxis: {
      //     type: 'value' as any
      //   },
      //   series: collationActivity
      // }
      const Activitydom = document.getElementById('Activity') as HTMLDivElement
      const ActivityChart = echarts.init(Activitydom)
      ActivityChart.setOption(Activityoptions)
      // const collationActivitydom = document.getElementById('collationActivity') as HTMLDivElement
      // const collationActivityChart = echarts.init(collationActivitydom)
      // collationActivityChart.setOption(collationActivityoption)
    }
  }

  const setCollectionPie = () => {
    shyftAPi.get(`https://api.shyft.to/sol/v1/wallet/collections?network=mainnet-beta&wallet_address=${data.useraddress}`)
    .then((vals) => {
      const optionData = [] as any
      vals.data.result?.collections.map((item: any) => {
        optionData.push({ value: item.nft_count, name: item.name })
      })
      const Collationdom = document.getElementById('polygonCollation') as HTMLDivElement
      const CollationChart = echarts.init(Collationdom)
      CollationChart.setOption(PieOption('Colletion', optionData))
    })
  }

  const setRelationChart = () => {
    const addressArr = [] as any
    interactAll.map((item: any) => {
      if (item.address_from) {
        addressArr.push(item.address_from)
      }
      if (item.address_to) {
        addressArr.push(item.address_to)
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
        source: findAddressIndex(Array.from(new Set(addressArr)), item.address_from),
        target: findAddressIndex(Array.from(new Set(addressArr)), item.address_to),
        value: `${item.type === 'transfer'
          ? (item.type +' '+(item.actions[0].metadata.value_display * 1).toFixed(2)+' '+item.actions[0].metadata.symbol) || formatting(item.actions[0].metadata.id)
          : item.type}`,
        lineStyle: {
          color: colorTable[findAddressIndex(Array.from(new Set(addressArr)), item.address_to)]
        }
      }
      linkData.push(object)
    })
    const relationDom = document.getElementById('relation') as HTMLDivElement
    const relationChart = echarts.init(relationDom)
    relationChart.setOption(RelationChartOption('Player Relationship',optionData,linkData))
  }

  const getTokensData = async () => {
    const getBalance = shyftAPi.get(`https://api.shyft.to/sol/v1/wallet/balance?network=mainnet-beta&wallet=${data.useraddress}`)
    const getTokenBalance = shyftAPi.get(`https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=${data.useraddress}`)
    Promise.all([getBalance, getTokenBalance]).then((vals) => {
      const Tokensoptionsdata = [] as any
      if (vals[0].data.result.balance>0) {
        Tokensoptionsdata.push({ value: vals[0].data.result.balance.toFixed(4), name: 'Sol' })
      }
      vals[1].data.result.map((item: any) => {
        if (item.balance > 0) {
          Tokensoptionsdata.push({ value: item.balance.toFixed(4), name: item.info.name })
        }
      })
      const PolygonTokensdom = document.getElementById('PolygonTokens') as HTMLDivElement
      const PolygonTokensChart = echarts.init(PolygonTokensdom)
      PolygonTokensChart.setOption(PieOption('Tokens', Tokensoptionsdata))
    })
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
              <div id="PolygonTokens" className="lineCharts"></div>
            </div>
            <div className="pies bg">
              <div id="polygonCollation" className="lineCharts"></div>
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
              <div onClick={() => setTransactionTab('Wash')}>
                Wash Trading
                {transactionTab === 'Wash' ? <img src={shortbutton} /> : ''}
              </div>
            </div>
            <CollationTable className={transactionTab === 'NFT' ? '' : 'none'}>
              <div className="title">NFT Transactions</div>
              <div className="tab flex">
                <div>NFT Address</div>
                <div>Pricr</div>
                <div>Chain</div>
                <div>Type</div>
                <div>Time</div>
              </div>
              {tableData && tableData.length ? (
                tableData.map((item: any, index: number) => (
                  <div className={(index + 1) % 2 === 0 ? 'tableContent flex bag' : 'tableContent flex'} key={index}>
                    <div><a href={`https://solscan.io/token/${item?.nftname}`} target="_blank">{item?.nftname?formatting(item?.nftname):item?.nftname}</a></div>
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
                <div>Sold</div>
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
                    {item.tokenAddress? <div><a href={`https://solscan.io/token/${item?.tokenAddress}`} target="_blank">{item?.price}</a></div>: <div>{item?.price}</div>}
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
                <div>Collation</div>
                <div>NFT Name</div>
                <div>Price</div>
                <div>Chain</div>
                <div>Type</div>
                <div>Time</div>
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
          </TableBox>
          <div className="Activity bg">
            <div className="tabs flex">
              <div onClick={() => setActivityTab('Chains')}>
                Chains
                {activityTab === 'Chains' ? <img src={shortbutton} /> : ''}
              </div>
              {/* <div onClick={() => setActivityTab('Collections')}>
                Collections
                {activityTab === 'Collections' ? <img src={longbutton} /> : ''}
              </div> */}
            </div>
            <div id="Activity" className={activityTab === 'Chains' ? 'lineChart' : 'lineChart none'}>
              <div className="Notrecords flex flex-justify-content">No records</div>
            </div>
            {/* <div id="collationActivity" className={activityTab === 'Collections' ? 'lineChart' : 'lineChart none'}>
              <div className="Notrecords flex flex-justify-content">No records</div>
            </div> */}
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