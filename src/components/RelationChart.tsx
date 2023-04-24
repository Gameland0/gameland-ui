import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import axios from 'axios'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import * as echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/graph'
import { UserInfoDialog } from './SmallDialog'
import { useActiveWeb3React, useStore } from '../hooks'
import { toastify } from './Toastify'
// import { LoadFailed, Loadding } from '../pages/Games'
import { filterAddress, formatting, filterNftid, handleImgError } from '../utils'
import { http, bschttp, polygonhttp } from './Store'
import { OPENSEA_API_KEY, MORALIS_KEY, PolygonContract, BscContract } from '../constants'
import { colorTable } from '../constants/colorTable'
import { MyTabs, TabPaneBox } from './MyPage'
import loadd from '../assets/loading.svg'
import defaultImg from '../assets/default.png'
import twitter from '../assets/icon_twitter.svg'
import discord from '../assets/icon_discord.svg'
import Telegram from '../assets/Telegram.png'
import Mirror from '../assets/mirror.jpeg'
import cyber from '../assets/cyber.jpeg'
import lens from '../assets/lens.jpeg'
import github from '../assets/github.jpeg'
import rss3 from '../assets/rss3.png'
import galxe from '../assets/galxe.png'
import news from '../assets/news.svg'

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
export const UserInfoBox = styled.div`
  min-height: 400px;
  font-size: 16px;
  .userImg {
    width: 180px;
    height: 180px;
    border-radius: 20px;
    margin-right: 48px;
  }
  .username {
    max-width: 160px;
    font-size: 40px;
    font-weight: bold;
    position: relative;
    top: -22px;
  }
  .follow {
    position: relative;
    top: 18px;
  }
  .following {
    font-size: 20px;
    margin-right: 18px;
    color: #8994a2;
    align-items: center;
    b {
      color: #000;
      margin-right: 6px;
      font-size: 24px;
    }
  }
  .iconBar {
    margin: 24px 0;
    img {
      width: 40px;
      height: 40px;
      margin: 6px 12px 6px 0;
      border-radius: 20px;
    }
  }
  .button {
    width: 150px;
    margin-left: 20px;
    .Follow {
      height: 48px;
      background: #35caa9;
      border-radius: 24px;
      color: #fff;
      &:hover {
        opacity: 0.8;
      }
    }
    .unFollow {
      height: 48px;
      border-radius: 24px;
      border: 1px solid #f95b46;
      color: #f95b46;
      margin-bottom: 20px;
    }
    .Chat {
      opacity: 0.3;
      border-radius: 24px;
      background: #000;
      color: #fff;
      img {
        width: 35px;
        height: 35px;
      }
    }
  }
  .boder {
    height: 1px;
    background: linear-gradient(to right, #e5e5e5, #e5e5e5, #e5e5e5);
    margin: 20px 0;
  }
  .verticalboder {
    width: 1px;
    background: linear-gradient(to right, #e5e5e5, #e5e5e5, #e5e5e5);
    margin: 0 60px;
  }
  .transparency {
    opacity: 0.3;
  }
  .seeMore {
    margin: 16px 0;
    font-size: 12px;
    color: #208ddf;
  }
`
export const Comments = styled.div`
  position: relative;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  font-size: 18px;
  padding: 12px;
  margin-bottom: 16px;
  .userInfo {
    .userImage {
      width: 48px;
      height: 48px;
      border-radius: 10px;
    }
    .name {
      color: #333333;
      margin-left: 24px;
    }
  }
  .CommentContent {
    color: #333333;
    margin: 19px 0 10px 0;
  }
  .CommentNFTBox {
    margin: 16px 0;
    img {
      width: 60px;
      height: 60px;
    }
    .CommentNFTname {
      width: 60px;
      height: 20px;
      font-size: 12px;
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
`
export const Article = styled.div`
  padding: 20px 10px;
  position: relative;
  font-size: 20px;
  height: 80px;
  .gameName {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 12px;
    color: #9a9191;
  }
  &:hover {
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  }
`
export const Box = styled.div`
  height: 50px;
  div {
    margin: 0 6px;
  }
  img {
    width: 50px;
    height: 50px;
    border-radius: 10px;
  }
`
export const Line = styled.div`
  div {
    flex: 1;
  }
`
export const LoadFailed = styled.div``

export const findAddressIndex = (arr: any, address: string) => {
  return arr.findIndex((item: any) => {
    return item?.toLowerCase() === address?.toLowerCase()
  })
}
export const fetchData = (data: any[], chain: string) => {
  if (!data || !data.length) return []
  return data.map(async (item: any) => {
    const getdata = axios.create({
      timeout: 100000,
      headers: {
        'X-Api-Key': '60aee01eae2f89f6fb4b81177df15c8c'
      }
    })
    item.chain = chain
    try {
      const { data } = await getdata.get(
        `https://api.element.market/openapi/v1/asset?chain=${chain}&token_id=${item.token_id}&contract_address=${item.token_address}`
      )
      item.metadata = {
        name: data.data?.name,
        image: data.data?.imageUrl
      }
    } catch (error) {
      item.metadata = JSON.parse(item.metadata)
    }
    return item
  })
}
export const RelationChart = () => {
  const { account } = useActiveWeb3React()
  const { state } = useLocation() as any
  const { userinfo } = useStore()
  const [loadding, setLending] = useState(false)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [FollowState, setFollowState] = useState(false)
  const [Failed, setFailed] = useState(false)
  // const [orderData, setOrderData] = useState([] as any)
  const [optionData, setOptionData] = useState([] as any)
  const [optionLink, setOptionLink] = useState([] as any)
  const [oldOwners, setOldOwners] = useState([] as any)
  const [NFTData, setNFTData] = useState([] as any)
  const [followeDataAll, setFolloweDataAll] = useState([] as any)
  const [ReviewData, setReviewData] = useState([] as any)
  const [Myreview, setMyreview] = useState([] as any)
  const [PostsData, setPostsData] = useState([] as any)
  const [Myposts, setMyposts] = useState([] as any)
  const [GameData, setGameData] = useState([] as any)
  const [MyGame, setMyGame] = useState([] as any)
  const [UserInfoItem, setUserInfoItem] = useState({} as any)
  const [postsPage, setPostsPage] = useState(1)
  const [reviewPage, setReviewPage] = useState(1)
  const [myFollowe, setmyFollowe] = useState(0)
  const [FolloweMy, setFolloweMy] = useState(0)
  const { contractName } = useParams() as any
  const history = useHistory()
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
    let oldOwnersData
    if (chain === 'bsc') {
      oldOwnersData = await bschttp.get(`v0/old_owners/${contractAddress}`)
    } else {
      oldOwnersData = await polygonhttp.get(`v0/old_owners/${contractAddress}`)
    }
    setOldOwners(oldOwnersData)
    const addressArr: any[] = []
    oldOwnersData.data.data.map((item: any) => {
      if (item.owner_now?.toLowerCase() === useraddress?.toLowerCase()) {
        addressArr.push(filterAddress(item.fromadd))
        addressArr.push(filterAddress(item.toadd))
      }
    })
    const data: any[] = []
    Array.from(new Set(addressArr)).map((item: any, index: number) => {
      const object = {
        symbolSize: item?.toLowerCase() === account?.toLowerCase() ? 90 : 65,
        name: formatting(item as string),
        itemStyle: {
          color: colorTable[index]
        }
      }
      data.push(object)
    })
    const linkData: any[] = []
    oldOwnersData.data.data.map((item: any) => {
      if (item.owner_now?.toLowerCase() === useraddress?.toLowerCase()) {
        const object = {
          source: findAddressIndex(Array.from(new Set(addressArr)), filterAddress(item.fromadd)),
          target: findAddressIndex(Array.from(new Set(addressArr)), filterAddress(item.toadd)),
          value: `send #${filterNftid(item.nftid)}`,
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
  const getReviewData = async () => {
    const BscReview = bschttp.get('/v0/review')
    const PolygonReview = polygonhttp.get('/v0/review')
    const posts = bschttp.get(`v0/posts`)
    Promise.all([BscReview, PolygonReview, posts]).then((vals) => {
      setReviewData([...vals[0].data.data, ...vals[1].data.data])
      setPostsData(vals[2].data.data)
    })
  }
  const getFollowData = () => {
    bschttp.get(`v0/followe`).then((vals) => setFolloweDataAll(vals.data.data))
  }
  const getGames = async () => {
    const bsc = await bschttp.get('/v0/games')
    const polygon = await polygonhttp.get('/v0/games')
    setGameData([...bsc.data.data, ...polygon.data.data])
  }
  useEffect(() => {
    if (state) {
      localStorage.setItem('contractAddress', state.contractAddress)
      localStorage.setItem('useraddress', state.useraddress)
      localStorage.setItem('contractChain', state.chain)
    }
    getGames()
    getUserInfoAll()
    getReviewData()
    getFollowData()
  }, [contractName])
  useEffect(() => {
    if (optionLink.length && ReviewData.length && PostsData.length && GameData.length) {
      componentDidMount()
    }
  }, [optionLink, userinfo, ReviewData, PostsData, GameData])
  useEffect(() => {
    if (postsPage > 1) {
      getMyArticle(UserInfoItem?.useraddress)
    }
  }, [postsPage])
  useEffect(() => {
    if (reviewPage > 1) {
      getMyReview(UserInfoItem?.useraddress)
    }
  }, [reviewPage])
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
          repulsion: 5000
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
  const getNftData = async (address: string) => {
    setMyGame([])
    setNFTData([])
    setLending(true)
    setFailed(false)
    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY
    const BscNft = http.get(`https://deep-index.moralis.io/api/v2/${address}/nft?chain=bsc&format=decimal`)
    const polygonNft = http.get(`
      https://deep-index.moralis.io/api/v2/${address}/nft?chain=polygon&format=decimal`)
    Promise.all([BscNft, polygonNft])
      .then((vals) => {
        const filterDataPolygon = vals[1].data.result.filter((item: any) => {
          return PolygonContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
        })
        const filterDataBsc = vals[0].data.result.filter((item: any) => {
          return BscContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
        })
        const findDataBsc = fetchData(filterDataBsc, 'bsc')
        const findDataPolygon = fetchData(filterDataPolygon, 'polygon')
        Promise.all([...findDataBsc, ...findDataPolygon])
          .then((vals) => {
            const nftarr = vals
              .sort(() => {
                return Math.random() - 0.5
              })
              .slice(0, 3)
            const filterGame = GameData.filter((item: any) => {
              return (
                vals.findIndex((ele: any) => ele.token_address.toLowerCase() === item.contractAddress.toLowerCase()) >=
                0
              )
            })
            const gamearr = filterGame
              .sort(() => {
                return Math.random() - 0.5
              })
              .slice(0, 3)
            setMyGame(gamearr)
            setNFTData(nftarr)
            setLending(false)
          })
          .catch(() => {
            setLending(false)
            setFailed(true)
          })
      })
      .catch(() => {
        setLending(false)
        setFailed(true)
      })
  }
  const getFollowState = (address: string) => {
    const data = followeDataAll.filter((item: any) => {
      return (
        item.useraddress?.toLowerCase() === account?.toLowerCase() &&
        item.followeUserAddress?.toLowerCase() === address?.toLowerCase()
      )
    })
    if (data.length && data) {
      setFollowState(true)
    } else {
      setFollowState(false)
    }
  }
  const getFolloweData = () => {
    if (!followeDataAll || !followeDataAll.length) return 0
    const data = followeDataAll.filter((item: any) => {
      return (
        item.useraddress?.toLowerCase() === account?.toLowerCase() &&
        item.followeUserAddress?.toLowerCase() === UserInfoItem?.useraddress.toLowerCase()
      )
    })
    if (!data.length) return 0
    return data
  }
  const getFollowe = (type: string, address: string) => {
    if (type === 'myFollowe') {
      const data = followeDataAll.filter((item: any) => {
        return item.useraddress?.toLowerCase() === address?.toLowerCase()
      })
      setmyFollowe(data.length)
      return data.length
    }
    if (type === 'FolloweMy') {
      const data = followeDataAll.filter((item: any) => {
        return item.followeUserAddress?.toLowerCase() === address?.toLowerCase()
      })
      setFolloweMy(data.length)
      return data.length
    }
  }
  const getMyArticle = (address: string) => {
    const data = PostsData.filter((item: any) => {
      return item.useraddress?.toLowerCase() === address?.toLowerCase()
    })
    if (data.length && data) {
      setMyposts(data.slice(0, postsPage * 2))
    } else {
      setMyposts([])
    }
  }
  const getMyReview = (address: string) => {
    const data = ReviewData.filter((item: any) => {
      return item.useraddress?.toLowerCase() === address?.toLowerCase()
    })
    if (data.length && data) {
      setMyreview(data.slice(0, reviewPage * 2))
    } else {
      setMyreview([])
    }
  }
  const Follow = async () => {
    const params = {
      useraddress: account,
      followeUserAddress: UserInfoItem?.useraddress
    }
    const res: any = await bschttp.post(`v0/followe`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      getFollowData()
      setFollowState(true)
      setFolloweMy(FolloweMy + 1)
    } else {
      throw res.message || res.data.message
    }
  }
  const UnFollow = async () => {
    const data = getFolloweData()
    const res: any = await bschttp.delete(`v0/followe/${data[0].id}`)
    if (res.data.code === 1) {
      toastify.success('succeed')
      getFollowData()
      setFollowState(false)
      setFolloweMy(FolloweMy - 1)
    } else {
      throw res.message || res.data.message
    }
  }
  const seeMore = (type: string) => {
    if (type === 'Posts') {
      setPostsPage(postsPage + 1)
    } else {
      setReviewPage(reviewPage + 1)
    }
  }
  const link = (type: string, item: any) => {
    if (type === 'Posts') {
      history.push({
        pathname: `/Article/Gameland/${item.useraddress}/${item.id}`
      })
    } else {
      history.push({
        pathname: `/user/${UserInfoItem?.username.replace(/ /g, '')}`,
        state: {
          useraddress: UserInfoItem?.useraddress
        }
      })
    }
  }
  const echartsDataClick = (params: any) => {
    if (userinfo) {
      const Item = userinfo.filter((item: any) => {
        return formatting(item.useraddress)?.toLowerCase() === params.name?.toLowerCase()
      })
      if (Item.length && Item) {
        getNftData(Item[0].useraddress)
        getMyReview(Item[0].useraddress)
        getMyArticle(Item[0].useraddress)
        getFollowState(Item[0].useraddress)
        getFollowe('myFollowe', Item[0]?.useraddress)
        getFollowe('FolloweMy', Item[0]?.useraddress)
        setUserInfoItem(Item[0])
        if (Item[0].useraddress?.toLowerCase() === account?.toLowerCase()) return
        setShowUserInfo(true)
      }
    }
  }
  const componentDidMount = () => {
    const dom = document.getElementById('main') as HTMLDivElement
    const myChart = echarts.init(dom)
    myChart.setOption(options)
    myChart.on('click', echartsDataClick)
  }

  return (
    <RelationChartBox>
      <UserInfoDialog footer={null} onCancel={() => setShowUserInfo(false)} open={showUserInfo} closable={false}>
        <UserInfoBox>
          <div className="flex flex-v-center">
            <div onClick={() => link('Review', UserInfoItem)}>
              <img className="userImg" src={UserInfoItem?.image || defaultImg} onError={handleImgError} />
            </div>
            <div>
              <a href={UserInfoItem?.dd} target="_blank" rel="noreferrer">
                <div className="username Abbreviation" onClick={() => link('Review', UserInfoItem)}>
                  {UserInfoItem?.username || ''}
                </div>
              </a>
              <div className="address">{formatting(UserInfoItem?.useraddress || '0x00', 9)}</div>
              <div className="GameId">Game ID: &nbsp;{contractName}</div>
              <div className="follow flex flex-v-cente">
                <div className="following flex">
                  <b>{myFollowe}</b> Following
                </div>
                <div className="following flex">
                  <b>{FolloweMy}</b> Followers
                </div>
              </div>
            </div>
            <div className="button">
              {FollowState ? (
                <div className="">
                  <div className="unFollow flex flex-center cursor" onClick={UnFollow}>
                    - Unfollow
                  </div>
                  <div className="Chat flex flex-center">
                    <img src={news} />
                    Chat
                  </div>
                </div>
              ) : (
                <div className="Follow flex flex-center cursor" onClick={Follow}>
                  + Follow
                </div>
              )}
            </div>
          </div>
          <div className="boder"></div>
          <div className="flex flex-h-between">
            <div className="iconBar flex-1">
              <div>
                <a href={UserInfoItem?.Twitter} target="_blank" rel="noreferrer">
                  <img src={twitter} className={UserInfoItem?.Twitter ? '' : 'transparency'} />
                </a>
                <a href={UserInfoItem?.Discord} target="_blank" rel="noreferrer">
                  <img src={discord} className={UserInfoItem?.Discord ? '' : 'transparency'} />
                </a>
                <a href={UserInfoItem?.Telegram} target="_blank" rel="noreferrer">
                  <img src={Telegram} className={UserInfoItem?.Telegram ? '' : 'transparency'} />
                </a>
                <a href={UserInfoItem?.Mirror} target="_blank" rel="noreferrer">
                  <img src={Mirror} className={UserInfoItem?.mirror === 1 ? '' : 'transparency'} />
                </a>
                <a href={UserInfoItem?.cyber} target="_blank" rel="noreferrer">
                  <img src={cyber} className="transparency" />
                </a>
              </div>
              <div>
                <a href={UserInfoItem?.github} target="_blank" rel="noreferrer">
                  <img src={github} className="transparency" />
                </a>
                <a href={UserInfoItem?.rss3} target="_blank" rel="noreferrer">
                  <img src={rss3} className="transparency" />
                </a>
                <a href={UserInfoItem?.galxe} target="_blank" rel="noreferrer">
                  <img src={galxe} className="transparency" />
                </a>
                <a href={UserInfoItem?.lens} target="_blank" rel="noreferrer">
                  <img src={lens} className="transparency" />
                </a>
              </div>
            </div>
            <div className="verticalboder"></div>
            <div className="flex-1">
              <Box className="flex flex-center">
                {MyGame && MyGame.length ? (
                  MyGame.map((item: any, index: any) => (
                    <div key={index}>
                      <img src={item.image} />
                    </div>
                  ))
                ) : (
                  <LoadFailed>
                    <div className="">{loadding ? <img src={loadd} /> : ''}</div>
                    {loadding ? '' : Failed ? 'Failed to load, please reopen' : 'No content yet'}
                  </LoadFailed>
                )}
              </Box>
              <Line className="flex flex-v-center">
                <div className="boder"></div>
                <div className="text-center">Game</div>
                <div className="boder"></div>
              </Line>
              <Box className="flex flex-center">
                {NFTData && NFTData.length ? (
                  NFTData.map((item: any, index: any) => (
                    <div key={index}>
                      <img src={item.metadata.image} />
                    </div>
                  ))
                ) : (
                  <LoadFailed>
                    <div className="">{loadding ? <img src={loadd} /> : ''}</div>
                    {loadding ? '' : Failed ? 'Failed to load, please reopen' : 'No content yet'}
                  </LoadFailed>
                )}
              </Box>
            </div>
          </div>
          <MyTabs defaultActiveKey="1">
            <TabPaneBox tab={<span className="clearGap">Comments</span>} key="1">
              {Myreview && Myreview.length ? (
                Myreview.map((item: any, index: any) => (
                  <Comments key={index} onClick={() => link('Review', item)}>
                    <div className="userInfo flex flex-v-center flex-h-between">
                      <div className="flex flex-v-center">
                        <img src={UserInfoItem?.image || defaultImg} className="userImage" onError={handleImgError} />
                        <div className="name">{UserInfoItem?.username}</div>
                      </div>
                      <div className="contractName">{item.contractName}</div>
                    </div>
                    {item.NFTData ? (
                      <div className="CommentNFTBox">
                        <img src={JSON.parse(item.NFTData)?.image || JSON.parse(item.NFTData)?.imageUrl} />
                        <div className="CommentNFTname Abbreviation">{JSON.parse(item.NFTData)?.name}</div>
                      </div>
                    ) : (
                      ''
                    )}
                    <div className="CommentContent">{item.context}</div>
                  </Comments>
                ))
              ) : (
                <div>No content yet</div>
              )}
              <div className="seeMore cursor" onClick={() => seeMore('Review')}>
                View more &gt;&gt;
              </div>
            </TabPaneBox>
            <TabPaneBox tab={<span className="clearGap">Article</span>} key="2">
              {Myposts && Myposts.length ? (
                Myposts.map((item: any, index: any) => (
                  <Article key={index} onClick={() => link('Posts', item)}>
                    <div className="title Abbreviation">{item.title}</div>
                    <div className="gameName">{item.contractName}</div>
                  </Article>
                ))
              ) : (
                <div>No content yet</div>
              )}
              <div className="seeMore cursor" onClick={() => seeMore('Posts')}>
                View more &gt;&gt;
              </div>
            </TabPaneBox>
          </MyTabs>
        </UserInfoBox>
      </UserInfoDialog>
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
      {/* <Loadding className="flex flex-center">{loadding ? <img src={loadd} /> : ''}</Loadding> */}
      <div id="main"></div>
      {/* <LoadFailed className="text-center">{loadding ? '' : 'Failed to load, please refresh the page'}</LoadFailed> */}
    </RelationChartBox>
  )
}
