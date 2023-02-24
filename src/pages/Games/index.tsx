import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { bschttp, polygonhttp } from '../../components/Store'
import { useActiveWeb3React, useStore } from '../../hooks'
import { useHistory } from 'react-router-dom'
import { toastify } from '../../components/Toastify'
import loadd from '../../assets/loading.svg'
import search from '../../assets/search_bar_icon_search.svg'
import arrow from '../../assets/icon_select.svg'
import star from '../../assets/icon_star.svg'
import defaultImg from '../../assets/default.png'
import imgBg from '../../assets/img_bg.svg'
import followed from '../../assets/icon_followed.svg'
import avatar1 from '../../assets/icon_avatar_1.svg'
import avatar2 from '../../assets/icon_avatar_2.png'
import PolygonImg from '../../assets/polygon.svg'
import BSCImg from '../../assets/binance.svg'

const BgImg = styled.div`
  position: absolute;
  top: 0;
  left: auto;
  z-index: 10;
  img {
    width: 100%;
  }
`
const Sort = styled.div`
  position: relative;
  width: 100%;
  height: 3.75rem;
  z-index: 40;
  margin-bottom: 32px;
  .filter {
    width: 18.75%;
    height: 3.75rem;
    border-radius: 10px;
    border: 2px solid rgba(1, 73, 57, 0.24);
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
    line-height: 3.75rem;
    padding-left: 2rem;
    position: relative;
  }
  .sortSelect {
    width: 18.75%;
    height: 182px;
    background: #fff;
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
    border-radius: 10px;
    padding: 0 2rem;
    position: absolute;
    top: 4.5rem;
    right: 0;
    z-index: auto;
    div {
      position: relative;
      height: 61px;
      font-size: 18px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      font-weight: 400;
      color: #333333;
      line-height: 61px;
      cursor: pointer;
      z-index: 60;
      img {
        margin-right: 10px;
      }
    }
  }
`
const CollectionBox = styled.div`
  position: relative;
  min-height: 428px;
  border-radius: 10px;
  z-index: 20;
  .collectionItem {
    position: relative;
    box-shadow: 0px 2px 10px 1px rgba(1, 73, 57, 0.24);
    border-radius: 10px;
    margin-bottom: 32px;
    padding: 32px;
    .logo {
      width: 120px;
      height: 120px;
      border-radius: 10px;
    }
    .follow {
      width: 147px;
      height: 60px;
      background: #35caa9;
      border-radius: 10px;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
      &:hover {
        background: #41acef;
      }
    }
    .followedBox {
      position: relative;
      width: 147px;
      height: 60px;
      font-size: 20px;
      color: #fff;
      font-weight: bold;
      font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
      div {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 10px;
      }
      .followed {
        background: #35caa9;
        opacity: 0.5;
      }
      .unfollow {
        background: red;
        opacity: 0;
      }
      &:hover {
        .followed {
          opacity: 0;
        }
        .unfollow {
          opacity: 1;
        }
      }
    }
    .name {
      height: 38px;
      font-size: 24px;
      font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
      font-weight: bold;
      color: #333333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .information {
      .commentUser {
        margin-left: 20px;
        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-left: -20px;
        }
      }
      .starRating {
        display: flex;
        align-items: center;
        font-size: 20px;
        color: #35caa9;
        img {
          width: 20px;
          height: 20px;
        }
        span {
          margin: 0 20px;
          font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
          color: #999999;
        }
      }
    }
  }

  @media screen and (min-width: 1440px) {
    width: 100%;
    .collectionItem {
      padding: 22px;
      width: 409px;
      height: 272px;
      .name {
        margin-top: 16px;
      }
      .information {
        margin-top: 16px;
      }
    }
  }

  @media screen and (min-width: 1920px) {
    width: 100%;
    .collectionItem {
      width: 512px;
      height: 320px;
      .name {
        margin-top: 32px;
      }
      .information {
        margin-top: 32px;
      }
    }
  }
`
const SeeMore = styled.div`
  margin-top: 36px;
  margin: auto;
  width: 12px;
  cursor: pointer;
  div {
    width: 12px;
    height: 12px;
    background: #41acef;
    border-radius: 50%;
    margin-bottom: 12px;
  }
`
export const LoadFailed = styled.div`
  font-size: 40px;
  font-weight: bold;
  font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
`
export const Loadding = styled.div`
  img {
    width: 100px;
    height: 100px;
  }
`

export const compare = () => {
  return function (obj1: any, obj2: any) {
    const val1 = obj1.starRating
    const val2 = obj2.starRating
    if (Number(val1) < Number(val2)) {
      return 1
    } else if (Number(val1) > Number(val2)) {
      return -1
    } else {
      return 0
    }
  }
}
export const Games = () => {
  const { account } = useActiveWeb3React()
  const { userinfo } = useStore()
  const [gamesFilter, setGamesFilter] = useState('ALL')
  const [collection, setCollection] = useState('')
  const [data, setData] = useState([] as any)
  const [games, setGames] = useState([] as any)
  const [gameList, setGameList] = useState([] as any)
  const [review, setReviewData] = useState([] as any)
  // const [userinfo, setUserinfo] = useState([] as any)
  const [gameFollow, setGameFollow] = useState([] as any)
  const [collectionFilterResult, setCollectionFilterResult] = useState([] as any)
  const [filterMenu, setFilterMenu] = useState(false)
  const [showNotFound, setShowNotFound] = useState(false)
  const [loadding, setLending] = useState(true)
  const [refreshBy, setrefreshBy] = useState(false)
  const [gamePage, setGamePage] = useState(1)
  const history = useHistory()

  useEffect(() => {
    const getGames = async () => {
      const bsc = bschttp.get('/v0/games')
      const polygon = polygonhttp.get('/v0/games')
      const bscReview = bschttp.get('/v0/review')
      const polygonReview = polygonhttp.get('/v0/review')
      // const userinfo = bschttp.get(`v0/userinfo`)
      const bscFollow = bschttp.get('/v0/followGames')
      const polygonFollow = polygonhttp.get('/v0/followGames')
      Promise.all([bsc, polygon, bscReview, polygonReview, bscFollow, polygonFollow])
        .then((vals) => {
          if (gamesFilter === 'ALL') {
            setGames([...vals[0].data.data, ...vals[1].data.data].sort(compare()))
            setData([...vals[0].data.data, ...vals[1].data.data].sort(compare()))
            setReviewData([...vals[2].data.data, ...vals[3].data.data])
            setGameFollow([...vals[4].data.data, ...vals[5].data.data])
          } else if (gamesFilter === 'Polygon') {
            setGames(vals[1].data.data.sort(compare()))
            setData(vals[1].data.data.sort(compare()))
            setReviewData(vals[3].data.data)
            setGameFollow(vals[5].data.data)
          } else {
            setGames(vals[0].data.data.sort(compare()))
            setData(vals[0].data.data.sort(compare()))
            setReviewData(vals[2].data.data)
            setGameFollow(vals[4].data.data)
          }
          // setUserinfo(vals[4].data.data)
          setLending(false)
        })
        .catch(() => {
          setLending(false)
        })
    }
    getGames()
  }, [gamesFilter, refreshBy])

  useEffect(() => {
    setGameList(games.slice(0, gamePage * 6))
  }, [games, gamesFilter, gamePage])
  useEffect(() => {
    const filterCollection = () => {
      const arr: any[] = []
      games.map((item: any) => {
        if (item.contractName) {
          if (item.contractName.indexOf(collection) !== -1 && collection !== '') {
            arr.push(item)
          } else {
            setCollectionFilterResult([])
            setrefreshBy(!refreshBy)
          }
        }
      })
      if (arr.length) {
        const res = new Map()
        const newArr = arr.filter((item: any) => {
          return !res.has(item.contractName) && res.set(item.contractName, 1)
        })
        setCollectionFilterResult(newArr)
        setShowNotFound(false)
      } else {
        setShowNotFound(true)
      }
      if (collection === '') {
        setShowNotFound(false)
        setCollectionFilterResult([])
      }
      if (games.length == 0) {
        if (collection) {
          setShowNotFound(true)
        }
      }
    }
    filterCollection()
  }, [collection])
  const filterReviewUser = (contractAddress: any, index: number) => {
    const reviewData = review.filter((item: any) => {
      return item.contractaddress === contractAddress
    })
    const userimg =
      userinfo.filter((item: any) => {
        return item.useraddress === reviewData[reviewData.length - index]?.useraddress
      })[0]?.image || avatar1
    return userimg
  }
  const followState = (item: any) => {
    if (!gameFollow.length) return 0
    return gameFollow.filter((ele: any) => {
      return ele.useraddress?.toLowerCase() === account?.toLowerCase() && ele.contractAddress === item.contractAddress
    }).length
  }
  const followGame = async (item: any, e: any) => {
    e.stopPropagation()
    const params = {
      useraddress: account,
      contractAddress: item.contractAddress
    }
    let res: any
    if (item.chain === 'bsc') {
      res = await bschttp.post(`/v0/followGames`, params)
    } else {
      res = await polygonhttp.post(`/v0/followGames`, params)
    }
    if (res.data.code === 1) {
      toastify.success('succeed')
      setrefreshBy(!refreshBy)
    } else {
      throw res.message || res.data.message
    }
  }
  const unFollow = async (item: any, e: any) => {
    e.stopPropagation()
    const data = gameFollow.filter((ele: any) => {
      return ele.useraddress?.toLowerCase() === account?.toLowerCase() && ele.contractAddress === item.contractAddress
    })
    let res: any
    if (item.chain === 'bsc') {
      res = await bschttp.delete(`/v0/followGames/${data[0].id}`)
    } else {
      res = await polygonhttp.delete(`/v0/followGames/${data[0].id}`)
    }
    if (res.data.code === 1) {
      toastify.success('succeed')
      setrefreshBy(!refreshBy)
    } else {
      throw res.message || res.data.message
    }
  }
  const handleCollectionChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setCollection(val)
  }, [])
  const collectionFilter = (collection: any) => {
    const Nfts = data.filter((item: any) => {
      return item.contractName === collection
    })
    setGames(Nfts)
    setCollectionFilterResult([])
  }
  const link = (item: any) => {
    history.push({
      pathname: `/games/${item.contractName.replace(/ /g, '')}`,
      state: {
        address: item.contractAddress,
        chain: item.chain
      }
    })
  }
  const seeMore = () => {
    setGamePage(gamePage + 1)
  }
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }
  return (
    <div className="container">
      {/* <Filling></Filling> */}
      <div className="MenuBar">
        <div className="collection">
          <div className="search">
            <span>
              <img src={search} />
            </span>
            <input onChange={handleCollectionChange} value={collection} placeholder="search" />
          </div>
          {collectionFilterResult && collectionFilterResult.length ? (
            <div className="result">
              {collectionFilterResult.map((item: any, index: any) => (
                <div key={index} onClick={() => collectionFilter(item.contractName)}>
                  {item.contractName}
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
          {showNotFound ? <div className="notFound">No items found</div> : ''}
        </div>
      </div>
      <Sort className="flex flex-j-end">
        <div className="filter cursor" onClick={() => setFilterMenu(!filterMenu)}>
          <img src={gamesFilter === 'Polygon' ? PolygonImg : gamesFilter === 'ALL' ? '' : BSCImg} />
          &nbsp;{gamesFilter}
          <img src={arrow} className="arrowIcon" />
        </div>
        {filterMenu ? (
          <div className="sortSelect">
            <div
              className="border-bottom"
              onClick={() => {
                setGamesFilter('Polygon')
                setFilterMenu(false)
              }}
            >
              <img src={PolygonImg} />
              Polygon
            </div>
            <div
              className="border-bottom"
              onClick={() => {
                setGamesFilter('BNB chain')
                setFilterMenu(false)
              }}
            >
              <img src={BSCImg} alt="" />
              BNB chain
            </div>
            <div
              onClick={() => {
                setGamesFilter('ALL')
                setFilterMenu(false)
              }}
            >
              ALL
            </div>
          </div>
        ) : (
          ''
        )}
      </Sort>
      <Loadding className="flex flex-center">{loadding ? <img src={loadd} /> : ''}</Loadding>
      {gameList && gameList.length ? (
        <CollectionBox className="flex wrap flex-h-between cursor">
          {gameList.map((item: any, index: any) => (
            <div className="collectionItem" key={index} onClick={() => link(item)}>
              <div className="flex flex-h-between flex-v-center">
                <img className="logo" src={item.image} alt="" />
                {followState(item) ? (
                  <div className="followedBox cursor" onClick={(e) => unFollow(item, e)}>
                    <div className="followed flex flex-center">
                      <img src={followed} />
                    </div>
                    <div className="unfollow flex flex-center">- Unfollow</div>
                  </div>
                ) : (
                  <div className="follow flex flex-center" onClick={(e) => followGame(item, e)}>
                    + Follow
                  </div>
                )}
              </div>
              <div className="name">{item.contractName}</div>
              <div className="information flex flex-h-between">
                <div className="commentUser">
                  <img src={filterReviewUser(item.contractAddress, 1)} onError={handleImgError} />
                  <img src={filterReviewUser(item.contractAddress, 2)} onError={handleImgError} />
                  <img src={filterReviewUser(item.contractAddress, 3)} onError={handleImgError} />
                  &nbsp;...
                </div>
                <div className="starRating">
                  <img src={star} alt="" /> &nbsp;{item.starRating}
                </div>
              </div>
            </div>
          ))}
        </CollectionBox>
      ) : (
        <LoadFailed className="text-center">{loadding ? '' : 'Failed to load, please refresh the page'}</LoadFailed>
      )}
      <BgImg>
        <img src={imgBg} />
      </BgImg>
      {gameList && gameList.length ? (
        <SeeMore onClick={seeMore}>
          <div></div>
          <div></div>
          <div></div>
        </SeeMore>
      ) : (
        ''
      )}
    </div>
  )
}
