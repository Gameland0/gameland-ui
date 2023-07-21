import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { bschttp, newhttp, polygonhttp } from './Store'
import searchBg from '../assets/searchBg.png'
import searchBar from '../assets/searchBar.png'
import magnifier from '../assets/magnifier.png'
import tick from '../assets/tick.png'
import moreIcon from '../assets/more_circle.png'
import arrow from '../assets/ICON.png'
import defaultImg from '../assets/default.png'
import close from '../assets/close.png'
import { toastify } from './Toastify'
import { UservAnalysis } from './UservAnalysis'
import { GameAnalysis } from './GameAnalysis'
import { useActiveWeb3React } from '../hooks'
import { formatting, handleImgError } from '../utils'

const SearchBox = styled.div`
  width: 100%;
  position: relative;
  .filling-top {
    height: 30px
  }
  .searchBar {
    width: 750px;
    height: 72px;
    position: relative;
    z-index: 9;
    margin: auto;
    margin-top: -5px;
    background: url(${searchBar});
    input {
      width: 500px;
      height: 55px;
      font-size: 16px;
      padding-left: 10px;
      border: 0;
      outline: none;
      border-radius: 35px;
      margin-top: -5px;
    }
    .magnifier {
      width: 30px;
      height: 30px;
      position: absolute;
      right: 40px;
      margin-top: -10px;
    }
    .seachType {
      position: relative;
      width: 89px;
      height: 30px;
      background: #009DFF;
      box-shadow: 0px 0px 8px 0px rgba(0,19,47,0.1);
      border-radius: 15px;
      color: #FFFFFF;
      font-size: 12px;
      margin-left: 15px;
      z-index: 20;
      img {
        width: 20px;
        height: 20px;
        margin-left: 8px;
      }
      .Switch {
        width: 100%;
        height: 60px;
        background: #009DFF;
        box-shadow: 0px 0px 8px 0px rgba(0,19,47,0.1);
        color: #FFFFFF;
        position: absolute;
        top: 0px;
        left: 0;
        padding: 5px;
        border-radius: 15px;
        font-size: 12px;
        z-index: 8;
        div {
          cursor: pointer;
          &:hover {
            padding-left: 5px;
            background: #2FAFFF;
            border-radius: 15px;
            box-shadow: 0px 0px 8px 0px rgba(0,19,47,0.1);
          }
        }
      }
      .chainSwitch {
        width: 100%;
        height: 80px;
        background: #009DFF;
        box-shadow: 0px 0px 8px 0px rgba(0,19,47,0.1);
        color: #FFFFFF;
        position: absolute;
        top: 0px;
        left: 0;
        padding: 5px;
        border-radius: 15px;
        font-size: 12px;
        z-index: 8;
        div {
          cursor: pointer;
          &:hover {
            padding-left: 5px;
            background: #2FAFFF;
            border-radius: 15px;
            box-shadow: 0px 0px 8px 0px rgba(0,19,47,0.1);
          }
        }
      }
    }
  }
  .switch {
    margin: auto;
    margin-top: 20px;
    width: 180px;
    height: 30px;
    padding-left: 2px;
    background: #009DFF;
    border-radius: 15px;
    div {
      width: 88px;
      height: 26px;
      line-height: 26px;
      font-size: 12px;
      color: #FFFFFF;
      border-radius: 13px;
      cursor: pointer;
    }
    .chooes {
      background: #FFFFFF;
      color: #009DFF;
    }
  }
  .game {
    margin: auto;
    width: 1000px;
    .item {
      position: relative;
      width: 300px;
      height: 56px;
      margin-top: 30px;
      background: #FFFFFF;
      border: 1px solid #43B7FF;
      border-radius: 28px;
      font-size: 18px;
      padding: 10px 30px;
      img {
        width: 35px;
        height: 35px;
        margin-right: 10px;
      }
      .gameName {
        width: 160px;
      }
      .add {
        height: 28px;
        line-height: 22px;
        color: #41B6FF;
        font-size: 24px;
        position: absolute;
        right: 30px;
        img {
          width: 20px;
          height: 20px;
          margin: 0;
        }
      }
    }
  }
  .seeMore {
    margin-top: 40px;
    img {
      width: 14px;
      height: 14px;
      margin-right: 10px;
    }
  }
`
const SearchGame = styled.div`
 margin: auto;
  width: 750px;
  .item {
    width: 120px;
    height: 30px;
    background: #E7F4FF;
    border-radius: 15px;
    margin-right: 10px;
    font-size: 12px;
    color: #60AEFF;
    padding: 0 9px;
    .text {
      width: 80px;
      height: 30px;
      line-height: 30px;
    }
    .close {
      width: 14px;
      height: 14px;
      margin-left: 8px;
    }
  }
`

export const Explore = () => {
  const { account } = useActiveWeb3React()
  const [switchTab, setSwitchTab] = useState('Recommend')
  const [seachType, setSeachType] = useState('Wallet')
  const [seachChain, setSeachChain] = useState('polygon')
  const [seachAddress, setSeachAddress] = useState('')
  const [seachContract, setSeachContract] = useState('')
  const [SeachInputValue, setSeachInputValue] = useState('')
  const [RecommendPage, setRecommendPage] = useState(0)
  const [RecentPage, setRecentPage] = useState(0)
  const [GameData, setGameData] = useState([] as any)
  const [gameList, setGameList] = useState([] as any)
  const [cacheData, setCacheData] = useState([] as any)
  const [cacheList, setCacheList] = useState([] as any)
  const [seachGameList, setSeachGameList] = useState([] as any)
  const [seachCacheList, setSeachCacheList] = useState([] as any)
  const [seachGames, setSeachGames] = useState([] as any)
  const [seachCache, setSeachCache] = useState([] as any)
  const [seachTypeSwitch, setSeachTypeSwitch] = useState(false)

  useEffect(() => {
    getGames()
  }, [account])
  useEffect(()=> {
    if (switchTab === 'Recommend') {
      setGameList(GameData.slice(0,(RecommendPage+1)*9))
    }
    if (switchTab === 'Recent') {
      setCacheList(cacheData.slice(0,(RecentPage+1)*9))
    }
  }, [RecommendPage, RecentPage])

  const findName = (address: string) => {
    const findRecommend = GameData.filter((item: any) => {
      return address === item.contractAddress
    })
    if (findRecommend.length) {
      return findRecommend[0].contractName
    }
    const findRecent = cacheData.filter((item: any) => {
      return address === item.address
    })
    if (findRecent.length) {
      return findRecent[0].name
    }
  }

  const getGames = async () => {
    const bsc = await bschttp.get('/v0/games')
    const polygon = await polygonhttp.get('/v0/games')
    const gamesdata = await newhttp.get(`v0/games`)
    setGameData([...bsc.data.data, ...polygon.data.data])
    setGameList([...bsc.data.data, ...polygon.data.data].slice(0,9))
    setCacheData(gamesdata.data.data)
    setCacheList(gamesdata.data.data.slice(0,9))
  }
  const getTickState = (contractAddress: any) => {
    const data = seachGameList.filter((item: any) => {
      return item == contractAddress
    })
    return data.length
  }
  const getCacheTickState = (contractAddress: any) => {
    const data = seachCacheList.filter((item: any) => {
      return item == contractAddress
    })
    return data.length
  }
  const addSeachGame = (item: any) => {
    setSeachGames([])
    setSeachCache([])
    if (switchTab === 'Recommend') {
      if (seachGameList.length+seachCacheList.length>=3) {
        toastify.error('Choose up to 3')
        return
      }
      const arr = seachGameList
      arr.push(item.contractAddress)
      setSeachGameList(arr)
      setGameList(GameData.slice(0,(RecommendPage+1)*9))
    }
    if (switchTab === 'Recent') {
      if (seachGameList.length+seachCacheList.length>=3) {
        toastify.error('Choose up to 3')
        return
      }
      const arr = seachCacheList
      arr.push(item.address)
      setSeachCacheList(arr)
      setCacheList(cacheData.slice(0,(RecentPage+1)*9))
    }
  }
  const deleteSeachGame = (item: any) => {
    if (switchTab === 'Recommend') {
      const arr = seachGameList.filter((ele: any) => {
        return ele !== item.contractAddress
      })
      setSeachGameList(arr)
      setGameList(GameData.slice(0,(RecommendPage+1)*9))
    }
    if (switchTab === 'Recent') {
      const arr = seachCacheList.filter((ele: any) => {
        return ele !== item.address
      })
      setSeachCacheList(arr)
      setCacheList(cacheData.slice(0,(RecentPage+1)*9))
    }
  }
  const Enter = async (e: any) => {
    if (e.keyCode === 13) {
      if (SeachInputValue.length === 42) {
        setSeachContract('')
        setSeachAddress('')
        if (seachType === 'Wallet') {
          if (seachGameList.length) {
            toastify.error('SmartContract addresses cannot be mixed with wallet addresses for querying.')
            return
          }
          setSeachAddress(SeachInputValue)
        }
        if (seachType === 'Contract') {
          if (seachGameList.length>2) {
            toastify.error('Query up to 3 contract')
            return
          }
          setSeachContract(SeachInputValue)
          if (seachGameList&&seachGameList.length) {
            setSeachGames(seachGameList)
          }
          if (seachCacheList&&seachCacheList.length) {
            setSeachCache(seachCacheList)
          }
        }
      } else {
        if (seachGameList&&seachGameList.length) {
          setSeachGames(seachGameList)
        }
        if (seachCacheList&&seachCacheList.length) {
          setSeachCache(seachCacheList)
        }
      }
    }
  }
  const SeachAddress = () => {
    if (SeachInputValue.length === 42) {
      setSeachContract('')
      setSeachAddress('')
      if (seachType === 'Wallet') {
        if (seachGameList.length ||seachCacheList.length) {
          toastify.error('SmartContract addresses cannot be mixed with wallet addresses for querying.')
          return
        }
        setSeachAddress(SeachInputValue)
      }
      if (seachType === 'Contract') {
        if (seachGameList.length>2) {
          toastify.error('Query up to 3 contract')
          return
        }
        setSeachContract(SeachInputValue)
        if (seachGameList&&seachGameList.length) {
          setSeachGames(seachGameList)
        }
        if (seachCacheList&&seachCacheList.length) {
          setSeachCache(seachCacheList)
        }
      }
    } else {
      if (seachGameList&&seachGameList.length) {
        setSeachGames(seachGameList)
      }
      if (seachCacheList&&seachCacheList.length) {
        setSeachCache(seachCacheList)
      }
    }
  }
  const seeMore = () => {
    if (switchTab === 'Recommend') {
      setRecommendPage(RecommendPage + 1)
    }
    if (switchTab === 'Recent') {
      setRecentPage(RecentPage + 1)
    }
  }
  const closeButton = (address: string) => {
    if (address === seachContract) {
      setSeachContract('')
    }
    const arr = seachGames.filter((ele: any) => {
      return ele !== address
    })
    setSeachGames(arr)
    setSeachGameList(arr)
    const arr2 = seachCache.filter((ele: any) => {
      return ele !== address
    })
    setSeachCache(arr2)
    setSeachCacheList(arr2)
  }
  const SeachChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    if (val==='') {
      setSeachContract('')
      setSeachAddress('')
    }
    setSeachInputValue(val)
  }, [])

  return (
    <div className="container">
      <SearchBox>
        <div className="flex flex-justify-content">
          {!seachAddress.length&&!seachGames.length&&!seachContract.length&&!seachCache.length ? (
            <img src={searchBg} alt="" />
            ) : (
              <div className="filling-top"></div>
            )}
        </div>
        <div className="searchBar flex flex-v-center">
          <div className="seachType flex flex-center cursor" onClick={() => setSeachTypeSwitch(!seachTypeSwitch)}>
            {seachType}
            <img src={arrow} />
            {seachTypeSwitch ? (
              <div className="Switch">
                <div onClick={() => {
                  setSeachType('Wallet')
                  setSeachTypeSwitch(false)
                }}>Wallet</div>
                <div onClick={() => {
                  setSeachType('Contract')
                  setSeachTypeSwitch(false)
                }}>Contract</div>
              </div>
            ):''}
          </div>
          <input
            type="text"
            placeholder="Please enter address"
            value={SeachInputValue}
            onChange={SeachChange}
            onKeyDown={(e) => Enter(e)}
          />
          <img className="magnifier cursor" src={magnifier} onClick={SeachAddress} alt="" />
        </div>
        {[...seachCache,...seachGames].length? (
          <SearchGame className="searchGame flex">
            {[...seachCache,...seachGames].map((item: any, index: number) => (
              <div className="item flex flex-v-center" key={index}>
                <div className="text Abbreviation">{findName(item)}</div>
                <img className="close cursor" src={close} alt="" onClick={() => closeButton(item)} />
              </div>
            ))}
          </SearchGame>
        ):''}
        {!seachAddress.length&&!seachGames.length&&!seachContract.length&&!seachCache.length ? (
          <div className="switch flex flex-v-center">
            <div className={switchTab === 'Recommend' ? 'text-center chooes':'text-center'} onClick={() => setSwitchTab('Recommend')}>Recommend</div>
            <div className={switchTab === 'Recent' ? 'text-center chooes':'text-center'} onClick={() => setSwitchTab('Recent')}>Recent</div>
          </div>
        ) : ''}
        {switchTab === 'Recommend'&&!seachAddress.length&&!seachGames.length&&!seachContract.length&&!seachCache.length ? (
          <div className="game flex flex-h-between wrap">
            {gameList&&gameList.length? (
              gameList.map((item: any, index: number) => (
                <div className="item flex flex-v-center" key={index}>
                  <img src={item.image} alt="" />
                  <div className="gameName Abbreviation">{item.contractName}</div>
                  {getTickState(item.contractAddress)? (
                    <div className="add cursor">
                      <img src={tick} alt="" onClick={() => deleteSeachGame(item)} />
                    </div>
                  ) : (
                    <div className="add cursor" onClick={() => addSeachGame(item)}>+</div>
                  )}
                </div>
              ))
            ) : ('')}
          </div>
        ) : (
          ''
        )}
        {switchTab === 'Recent'&&!seachAddress.length&&!seachGames.length&&!seachContract.length&&!seachCache.length ? (
          <div className="game flex flex-h-between wrap">
            {cacheList&&cacheList.length? (
              cacheList.map((item: any, index: number) => (
                <div className="item flex flex-v-center" key={index}>
                  <img src={item.image || defaultImg} alt="" onError={handleImgError}/>
                  <div className="gameName Abbreviation">{item.name || formatting(item.address)}</div>
                  {getCacheTickState(item.address)? (
                    <div className="add cursor">
                      <img src={tick} alt="" onClick={() => deleteSeachGame(item)} />
                    </div>
                  ) : (
                    <div className="add cursor" onClick={() => addSeachGame(item)}>+</div>
                  )}
                </div>
              ))
            ) : ('')}
          </div>
        ) : (
          ''
        )}
        {!seachAddress.length&&!seachGames.length&&gameList.length&&cacheList.length&&!seachContract.length&&!seachCache.length ? (
          <div className="seeMore flex flex-center cursor" onClick={seeMore}>
            <img src={moreIcon} alt="" />
            <div>See More</div>
          </div>
        ): ''}
        {seachAddress.length ? (
          <UservAnalysis useraddress={seachAddress}></UservAnalysis>
        ):''}
        {seachGames.length || seachContract.length || seachCache.length ? (
          <GameAnalysis
            data={seachGames}
            chain={seachChain}
            GameData={GameData}
            seachContract={seachContract}
            seachCache={seachCache}
            gameData={cacheData}
          ></GameAnalysis>
        ) : ''}
      </SearchBox>
    </div>
    
  )
}