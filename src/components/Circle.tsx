import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import * as echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/graph'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React, useStore } from '../hooks'
import { http, bschttp, polygonhttp } from './Store'
import { UserInfoDialog } from './SmallDialog'
import { Article, Box, Comments, Line, LoadFailed, UserInfoBox } from './RelationChart'
import { MyTabs, TabPaneBox } from './MyPage'
import { BscContract, MORALIS_KEY, PolygonContract } from '../constants'
import { client, formatting, handleImgError, Recommended, getinfo } from '../utils'
import { IpfsImg } from './IpfsImg'
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
import loadd from '../assets/loading.svg'
import { toastify } from './Toastify'

const CircleBox = styled.div`
  width: 100%;
  padding-top: 48px;
  .replace {
    margin: auto;
    width: 140px;
    height: 50px;
    background: #35caa9;
    border-radius: 10px;
    color: #fff;
    font-size: 24px;
  }
  .Nocontent {
    width: 100%;
    font-size: 24px;
    text-align: center;
  }
  .filterMenu {
    margin-bottom: 32px;
    .item {
      min-width: 90px;
      position: relative;
      height: 35px;
      color: #000;
      font-size: 24px;
      margin-right: 48px;
      div {
        position: absolute;
        bottom: 0;
        width: 90px;
        height: 16px;
        border-radius: 10px;
      }
      span {
        position: absolute;
        top: -6px;
        right: 0px;
        display: block;
        width: 14px;
        height: 14px;
        border-radius: 7px;
        background: #41acef;
      }
      .disabled {
        background: rgba(13, 12, 34, 0.05);
      }
      .select {
        background: rgba(65, 172, 239, 0.2);
      }
    }
  }
`
const InfoCard = styled.div`
  box-shadow: 0px 2px 10px 1px rgb(1 73 57 / 24%);
  border-radius: 10px;
  margin-bottom: 32px;
  padding: 20px;
  font-size: 24px;

  .avatar {
    img {
      width: 100px;
      height: 100px;
      border-radius: 10px;
    }
    .More {
      width: 120px;
      height: 45px;
      background: #35caa9;
      border-radius: 10px;
      color: #fff;
    }
  }
  .name {
    margin-top: 16px;
    font-weight: bold;
  }
  @media screen and (min-width: 1440px) {
    width: 280px;
    height: 180px;
  }
  @media screen and (min-width: 1920px) {
    width: 340px;
    height: 200px;
  }
`

const fetchData = (data: any[]) => {
  if (!data || !data.length) return []
  // console.log(data)
  return data.map((item: any) => {
    item.metadata = JSON.parse(item.metadata)
    return item
  })
}
export const Circle = () => {
  const { account } = useActiveWeb3React()
  const { userinfo } = useStore()
  const history = useHistory()
  const [tab, setTab] = useState('All')
  const [page, setPage] = useState(0)
  const [myFollowe, setmyFollowe] = useState(0)
  const [FolloweMy, setFolloweMy] = useState(0)
  const [userInfo, setUserInfo] = useState([] as any)
  const [circleData, setCircleData] = useState([] as any)
  const [showData, setShowData] = useState([] as any)
  const [MyCollection, setMyCollection] = useState([] as any)
  const [MyGame, setMyGame] = useState([] as any)
  const [NFTData, setNFTData] = useState([] as any)
  const [GameData, setGameData] = useState([] as any)
  const [PostsData, setPostsData] = useState([] as any)
  const [Myposts, setMyposts] = useState([] as any)
  const [ReviewData, setReviewData] = useState([] as any)
  const [Myreview, setMyreview] = useState([] as any)
  const [followeDataAll, setFolloweDataAll] = useState([] as any)
  const [RecommendData, setRecommendData] = useState([] as any)
  const [Recommend, setRecommend] = useState([] as any)
  const [UserInfoItem, setUserInfoItem] = useState({} as any)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [loadding, setLending] = useState(false)
  const [Failed, setFailed] = useState(false)
  const [FollowState, setFollowState] = useState(false)

  const filterUser = (address: string) => {
    return userinfo.filter((item: any) => {
      return item.useraddress?.toLowerCase() === address?.toLowerCase()
    })
  }
  useEffect(() => {
    if (userinfo.length) {
      getFollowes()
      // getRecommendedFriend()
    }
    // getMyCollection()
    getGames()
    getReviewData()
    getFollowData()
  }, [account, userinfo])
  useEffect(() => {
    if (20 * page > circleData.length) return
    setShowData(circleData.slice(20 * page, 20 * page + 20))
  }, [page])
  const getGames = async () => {
    const bsc = await bschttp.get('/v0/games')
    const polygon = await polygonhttp.get('/v0/games')
    setGameData([...bsc.data.data, ...polygon.data.data])
  }
  const getRecommendedFriend = async () => {
    const aa = '0x7a387E6f725a837dF5922e3Fe71827450A76A3E5'
    const response = await client.query({
      query: Recommended,
      variables: { address: account, chainId: 1 }
    })
    const data = [] as any
    response.data.address.wallet.recommendation.userRecommendation.map(async (item: any) => {
      const res = userinfo.filter((ele: any) => {
        return ele.useraddress?.toLowerCase() === item.userToFollow?.toLowerCase()
      })
      if (res && res.length) {
        data.push(res[0])
      }
    })
    setRecommend(data)
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
  const getFollowes = async () => {
    const aa = '0x7a387E6f725a837dF5922e3Fe71827450A76A3E5'
    const data = (await bschttp.get(`v0/userinfo/${account}`)).data.data
    setUserInfo(data)
    const myFollowe = (await bschttp.get(`v0/lens_relationships/address/${account}`)).data.data
    if (myFollowe.length) {
      const data = (await bschttp.get(`v0/lens_relationships/followers/${myFollowe[0].followers_address}`)).data.data
      const data1 = (await bschttp.get(`v0/lens_relationships/followers/${myFollowe[1].followers_address}`)).data.data
      const data2 = (await bschttp.get(`v0/lens_relationships/followers/${myFollowe[2].followers_address}`)).data.data
      const data3 = (await bschttp.get(`v0/lens_relationships/followers/${myFollowe[3].followers_address}`)).data.data
      const data4 = (await bschttp.get(`v0/lens_relationships/followers/${myFollowe[4].followers_address}`)).data.data
      const dataarr = [] as any
      ;[...data4, ...data3, ...data1, ...data].map((item: any) => {
        if (item.address !== account) {
          const Item = userinfo.filter((ele: any) => {
            return ele.useraddress?.toLowerCase() === item.address?.toLowerCase()
          })
          if (Item[0]?.username) {
            dataarr.push(item)
          }
        }
      })
      const obj = {} as any
      const newarr = dataarr.reduce((pre: any, item: any) => {
        obj[item.address] ? '' : (obj[item.address] = true && pre.push(item))
        return pre
      }, [])
      setCircleData(newarr)
      setShowData(newarr.slice(0, 20))
    }
  }
  const getFollowData = () => {
    bschttp.get(`v0/followe`).then((vals) => setFolloweDataAll(vals.data.data))
  }
  const getFolloweData = () => {
    if (!followeDataAll || !followeDataAll.length) return 0
    const data = followeDataAll.filter((item: any) => {
      return (
        item.useraddress.toLowerCase() === account?.toLowerCase() &&
        item.followeUserAddress.toLowerCase() === UserInfoItem?.useraddress.toLowerCase()
      )
    })
    if (!data.length) return 0
    return data
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
  const Replace = () => {
    if (showData.length < 1) return
    setPage(page + 1)
  }
  const echartsDataClick = (address: any) => {
    if (address?.toLowerCase() === account?.toLowerCase()) return
    const Item = userinfo.filter((item: any) => {
      return item.useraddress?.toLowerCase() === address?.toLowerCase()
    })
    if (Item.length && Item) {
      getNftData(Item[0].useraddress)
      getMyReview(Item[0].useraddress)
      getMyArticle(Item[0].useraddress)
      getFollowState(Item[0].useraddress)
      getFollowe('myFollowe', Item[0]?.useraddress)
      getFollowe('FolloweMy', Item[0]?.useraddress)
      setUserInfoItem(Item[0])
      setShowUserInfo(true)
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
        // const filterDataPolygon = vals[1].data.result.filter((item: any) => {
        //   return PolygonContract.findIndex((ele: any) => ele?.toLowerCase() === item.token_address?.toLowerCase()) >= 0
        // })
        // const filterDataBsc = vals[0].data.result.filter((item: any) => {
        //   return BscContract.findIndex((ele: any) => ele?.toLowerCase() === item.token_address?.toLowerCase()) >= 0
        // })
        const findDataBsc = fetchData(vals[0].data.result)
        const findDataPolygon = fetchData(vals[1].data.result)
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
  const getMyReview = (address: string) => {
    const data = ReviewData.filter((item: any) => {
      return item.useraddress?.toLowerCase() === address?.toLowerCase()
    })
    if (data.length && data) {
      setMyreview(data.slice(0, 2))
    } else {
      setMyreview([])
    }
  }
  const getMyArticle = (address: string) => {
    const data = PostsData.filter((item: any) => {
      return item.useraddress?.toLowerCase() === address?.toLowerCase()
    })
    if (data.length && data) {
      setMyposts(data.slice(0, 2))
    } else {
      setMyposts([])
    }
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
  const getFollowe = (type: string, address: string) => {
    if (type === 'myFollowe') {
      const data = followeDataAll.filter((item: any) => {
        return item.useraddress.toLowerCase() === address?.toLowerCase()
      })
      setmyFollowe(data.length)
      return data.length
    }
    if (type === 'FolloweMy') {
      const data = followeDataAll.filter((item: any) => {
        return item.followeUserAddress.toLowerCase() === address?.toLowerCase()
      })
      setFolloweMy(data.length)
      return data.length
    }
  }
  const RecommendButton = () => {
    setTab('Recommend')
    setRecommendData(Recommend)
    setShowData([])
  }
  const buttonAll = () => {
    setTab('All')
    setShowData(circleData.slice(0, 20))
  }
  const buttonGame = () => {
    if (showData.length < 1) return
    const dataarr = [] as any
    showData.slice(10, 20).map(async (item: any) => {
      http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY
      const BscNft = await http.get(`https://deep-index.moralis.io/api/v2/${item.address}/nft?chain=bsc&format=decimal`)
      const filterDataBsc = BscNft.data.result.filter((item: any) => {
        return BscContract.findIndex((ele: any) => ele?.toLowerCase() === item.token_address?.toLowerCase()) >= 0
      })
      const filterGame = MyCollection.filter((item: any) => {
        return (
          filterDataBsc.findIndex(
            (ele: any) => ele.token_address.toLowerCase() === item.contractAddress.toLowerCase()
          ) >= 0
        )
      })
      if (filterGame && filterGame.length) {
        dataarr.push(item)
        setShowData(dataarr)
      }
      // const polygonNft = http.get(`
      //   https://deep-index.moralis.io/api/v2/${item.address}/nft?chain=polygon&format=decimal`)
      // Promise.all([BscNft]).then((vals) => {
      //   const filterDataPolygon = vals[1].data.result.filter((item: any) => {
      //     return PolygonContract.findIndex((ele: any) => ele?.toLowerCase() === item.token_address?.toLowerCase()) >= 0
      //   })
      //   const filterDataBsc = vals[0].data.result.filter((item: any) => {
      //     return BscContract.findIndex((ele: any) => ele?.toLowerCase() === item.token_address?.toLowerCase()) >= 0
      //   })
      //   const findDataBsc = fetchData(filterDataBsc, 'bsc')
      //   const findDataPolygon = fetchData(filterDataPolygon, 'polygon')
      //   Promise.all([...filterDataBsc])
      //     .then((vals) => {
      //       const filterGame = MyCollection.filter((item: any) => {
      //         return (
      //           vals.findIndex((ele: any) => ele.token_address.toLowerCase() === item.contractAddress.toLowerCase()) >=
      //           0
      //         )
      //       })
      //       if (filterGame && filterGame.length) {
      //         dataarr.push(item)
      //         setShowData(dataarr)
      //       }
      //     })
      //     .catch(() => {
      //       console.log('err')
      //     })
      // })
    })
  }

  return (
    <CircleBox>
      <UserInfoDialog footer={null} onCancel={() => setShowUserInfo(false)} open={showUserInfo} closable={false}>
        <UserInfoBox>
          <div className="flex flex-v-center">
            <div onClick={() => link('Review', UserInfoItem)}>
              <img className="userImg" src={UserInfoItem?.image || defaultImg} onError={handleImgError} />
            </div>
            <div>
              <a href={UserInfoItem?.dd} target="_blank" rel="noreferrer">
                <div className="username Abbreviation" onClick={() => link('Review', UserInfoItem)}>
                  {UserInfoItem?.username || '#user#'}
                </div>
              </a>
              <div className="address">{formatting(UserInfoItem?.useraddress || '0x00', 9)}</div>
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
                <a
                  href={UserInfoItem.Twitter ? `https://twitter.com/${UserInfoItem.Twitter}` : UserInfoItem.Twitter}
                  target="_blank"
                  rel="noreferrer"
                >
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
                <a
                  href={
                    UserInfoItem.lens_handle
                      ? `https://lenster.xyz/u/${UserInfoItem.lens_handle}`
                      : UserInfoItem.lens_handle
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={lens} className={UserInfoItem?.lens_handle ? '' : 'transparency'} />
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
                      <IpfsImg
                        src={
                          item.metadata?.image ||
                          item.metadata?.animation_url ||
                          item.metadata?.data?.image ||
                          defaultImg
                        }
                      />
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
            </TabPaneBox>
          </MyTabs>
        </UserInfoBox>
      </UserInfoDialog>
      <div className="container filterMenu flex flex-justify-content">
        <div className="item flex flex-justify-content cursor" onClick={buttonAll}>
          {tab === 'All' ? <span></span> : ''}
          <div className={tab === 'All' ? 'select' : 'disabled'}></div>
          Recommend
        </div>
        <div className="item flex flex-justify-content not-allowed">
          <div className="disabled"></div>
          Game
        </div>
        <div className="item flex flex-justify-content not-allowed">
          <div className="disabled"></div>
          NFT
        </div>
        <div className="item flex flex-justify-content not-allowed">
          <div className="disabled"></div>
          Fans
        </div>
        {/* <div className="item flex flex-justify-content cursor" onClick={RecommendButton}>
          {tab === 'Recommend' ? <span></span> : ''}
          <div className={tab === 'Recommend' ? 'select' : 'disabled'}></div>
          Recommend
        </div> */}
      </div>
      <div className="container flex wrap flex-h-between">
        {showData && showData.length && tab === 'All' ? (
          showData.map((item: any, index: number) => (
            <InfoCard key={index} className="cursor" onClick={() => echartsDataClick(item.address)}>
              <div className="avatar flex flex-h-between flex-v-center">
                <img src={filterUser(item.address)[0]?.image || defaultImg} onError={handleImgError} />
                <div className="More flex flex-center">See More</div>
              </div>
              <div className="name Abbreviation">{filterUser(item.address)[0]?.username || `user#${index}`}</div>
            </InfoCard>
          ))
        ) : tab === 'All' ? (
          <div className="Nocontent">No friends</div>
        ) : (
          ''
        )}
        {RecommendData && RecommendData.length && tab === 'Recommend' ? (
          RecommendData.map((item: any, index: number) => (
            <InfoCard key={index} className="cursor" onClick={() => echartsDataClick(item.useraddress)}>
              <div className="avatar flex flex-h-between flex-v-center">
                <img src={item?.image || defaultImg} onError={handleImgError} />
                <div className="More flex flex-center">See More</div>
              </div>
              <div className="name Abbreviation">{item?.username || `user#${index + 1}`}</div>
            </InfoCard>
          ))
        ) : tab === 'Recommend' ? (
          <div className="Nocontent">No recommend</div>
        ) : (
          ''
        )}
      </div>
      {showData && showData.length ? (
        <div className="replace flex flex-center cursor" onClick={Replace}>
          Circle
        </div>
      ) : (
        ''
      )}
    </CircleBox>
  )
}
