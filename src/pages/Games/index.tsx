import React, { useEffect, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Row, Col } from 'antd'
import { bschttp, polygonhttp } from '../../components/Store'
// import { useActiveWeb3React } from '../../hooks'
import { useHistory } from 'react-router-dom'
import search from '../../assets/search_bar_icon_search.svg'
import arrow from '../../assets/icon_select.svg'
import star from '../../assets/icon_star.svg'
import polygonIcon from '../../assets/polygon_icon.svg'
import BNBIcon from '../../assets/bnb.svg'

const Sort = styled.div`
  height: 3.75rem;
  display: flex;
  background: #fff;
  justify-content: space-between;
  position: fixed;
  z-index: 20;
  margin-left: 1rem;

  @media screen and (min-width: 1152px) {
    width: 785px;
  }
  @media screen and (min-width: 1440px) {
    width: 968px;
  }
  @media screen and (min-width: 1920px) {
    width: 1188px;
  }
  .filter {
    width: 30.8%;
    height: 3.75rem;
    border-radius: 10px 10px 10px 10px;
    border: 2px solid #e5e5e5;
    position: absolute;
    right: 0;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
    line-height: 3.75rem;
    padding-left: 2rem;
    cursor: pointer;
  }
  .sortSelect {
    width: 30.8%;
    height: 182px;
    background: #fff;
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
    border-radius: 10px 10px 10px 10px;
    padding: 0 2rem;
    position: absolute;
    top: 4.5rem;
    right: 0;
    z-index: 99;
    div {
      height: 61px;
      font-size: 18px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      font-weight: 400;
      color: #333333;
      line-height: 61px;
      cursor: pointer;
    }
  }
`
const CollectionBox = styled.div`
  min-height: 428px;
  border: 2px solid #e5e5e5;
  border-radius: 10px;
  margin: 92px 0 0 16px;
  .collectionItem {
    display: flex;
    position: relative;
    .border {
      position: absolute;
      top: 0;
      height: 0px;
      border: 1px solid #e5e5e5;
    }
    .serialNumber {
      width: 93px;
      line-height: 142px;
      text-align: center;
      font-size: 24px;
      font-family: DIN-Bold, DIN;
      font-weight: bold;
      color: #333333;
    }
    .logo {
      width: 130px;
      height: 130px;
      border-radius: 10px;
    }
    .information {
      width: 230px;
      margin: 0 32px 0 32px;
      .name {
        height: 38px;
        margin-top: 16px;
        font-size: 24px;
        font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
        font-weight: bold;
        color: #333333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .starRating {
        display: flex;
        align-items: center;
        font-size: 20px;
        color: #35caa9;
        margin-top: 20px;
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
    .describe {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      font-size: 20px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      color: #666666;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
    }
  }

  @media screen and (min-width: 1152px) {
    width: 785px;
  }
  @media screen and (min-width: 1440px) {
    width: 968px;
    .pad {
      padding: 28px 0 36px 0;
    }
    .padd {
      padding: 36px 0;
    }
    .collectionItem {
      height: 184px;
      .border {
        width: 800px;
        left: 142px;
      }
      .describe {
        width: 440px;
        height: 124px;
      }
    }
  }

  @media screen and (min-width: 1920px) {
    width: 1188px;
    .pad {
      padding: 36px 0 48px 0;
    }
    .padd {
      padding: 48px 0;
    }
    .collectionItem {
      height: 214px;
      .border {
        width: 1010px;
        left: 142px;
      }
      .describe {
        width: 610px;
        height: 124px;
      }
    }
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
  // const { account, library, chainId } = useActiveWeb3React()
  const [collection, setCollection] = useState('')
  const [data, setData] = useState([] as any)
  const [games, setGames] = useState([] as any)
  const [collectionFilterResult, setCollectionFilterResult] = useState([] as any)
  const [gamesFilter, setGamesFilter] = useState('ALL')
  const [filterMenu, setFilterMenu] = useState(false)
  const [showNotFound, setShowNotFound] = useState(false)
  const history = useHistory()
  useEffect(() => {
    const getGames = async () => {
      const bsc = await bschttp.get('/v0/games')
      const polygon = await polygonhttp.get('/v0/games')
      let data
      if (gamesFilter === 'ALL') {
        data = [...bsc.data.data, ...polygon.data.data].sort(compare())
      } else if (gamesFilter === 'Polygon') {
        data = polygon.data.data.sort(compare())
      } else {
        data = bsc.data.data.sort(compare())
      }
      setGames(data)
      setData(data)
    }
    getGames()
  }, [gamesFilter])

  useEffect(() => {
    const filterCollection = () => {
      const arr: any[] = []
      games.map((item: any) => {
        if (item.contractName) {
          if (item.contractName.indexOf(collection) !== -1 && collection !== '') {
            arr.push(item)
          } else {
            setCollectionFilterResult([])
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
  const handleCollectionChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setCollection(val)
  }, [])
  const collectionFilter = (collection: any) => {
    const Nfts = data.filter((item: any) => {
      return item.contractName === collection
    })
    setGames(Nfts)
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
  return (
    <div className="container">
      <Row gutter={0}>
        <Col span="6">
          <div className="MenuBar">
            <div className="collection">
              <h2>Collection</h2>
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
        </Col>
        <Col span="18">
          <Sort>
            <div className="filter" onClick={() => setFilterMenu(!filterMenu)}>
              {gamesFilter}
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
                  Polygon
                </div>
                <div
                  className="border-bottom"
                  onClick={() => {
                    setGamesFilter('BNB chain')
                    setFilterMenu(false)
                  }}
                >
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
          {games && games.length ? (
            <CollectionBox>
              {games.map((item: any, index: any) => (
                <div
                  className={index === 0 ? 'collectionItem pad' : 'collectionItem padd'}
                  key={index}
                  onClick={() => link(item)}
                >
                  {index === 0 ? '' : <div className="border"></div>}
                  <div className="serialNumber">{Number(index) + 1}</div>
                  <img className="logo" src={item.image} alt="" />
                  <div className="information">
                    <div className="name">{item.contractName}</div>
                    <div className="starRating">
                      <img src={star} alt="" /> &nbsp;{item.starRating}
                      <span>Rank {Number(index) + 1}</span>
                      <img src={item.chain === 'bsc' ? BNBIcon : polygonIcon} alt="" />
                    </div>
                  </div>
                  <div className="describe">{item.describe ? item.describe : 'No description yet'}</div>
                </div>
              ))}
            </CollectionBox>
          ) : (
            ''
          )}
        </Col>
      </Row>
    </div>
  )
}
