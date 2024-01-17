import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import EditorJS from '@editorjs/editorjs'
import { Contract } from '@ethersproject/contracts'
import { bschttp, uploadhttp } from './Store'
import { toastify } from './Toastify'
import { useActiveWeb3React } from '../hooks'
import whiteStrIcon from '../assets/Market/icon_white_str.png'
import redStrIcon from '../assets/Market/icon_red_str.png'
import DetailsIcon from '../assets/Market/icon_Details.png'
import rowIcon from '../assets/Market/Row_item_icon.png'
import like from '../assets/Market/like.png'
import likes from '../assets/Market/likes.png'
import likeIcon from '../assets/Market/icon_like.png'
import download from '../assets/Market/download.png'
import pay from '../assets/Market/pay.png'
import downloadIcon from '../assets/Market/icon_download.png'
import share from '../assets/Market/share.png'
import viewer from '../assets/Market/icon_Viewer.png'
import defaults from '../assets/default.png'
import NFTAbi from '../constants/Abis/NFT.json'
import { fetchReceipt } from '../utils'
import BigNumber from 'bignumber.js'


const DataInfoBox = styled.div`
  padding-top: 40px;
  .whiteStrIcon {
    width: 17px;
    height: 16px;
    background-image: url(${whiteStrIcon});
  }
  .redStrIcon {
    width: 17px;
    height: 16px;
    background-image: url(${redStrIcon});
  }
`

const LeftInfo = styled.div`
  width: 65%;
  .title {
    font-size: 28px;
    font-weight: bold;
    color: #222222;
    margin-right: 30px;
  }
  .borders {
    width: 2px;
    height: 12px;
    background: #0090FF;
    border-radius: 1px;
    margin-right: 10px;
  }
  .Tags {
    div {
      padding: 0 10px;
      border: 1px solid #DDDDDD;
      border-radius: 10px;
      font-size: 12px;
      color: #888888;
      margin-right: 10px;
      margin-bottom: 30px;
    }
  }
  .effectPreview {
    height: 640px;
    width: 90%;
    margin: auto;
  }
`

const RightInfo = styled.div`
  width: 35%;
  .Details {
    font-size: 16px;
    color: #222222;
    img {
      margin-right: 5px;
    }
    margin-bottom: 12px;
  }
  .hr {
    width: 100%;
    height: 2px;
    background: #EEEEEE;
  }
  .fileInfo {
    padding-top: 18px;
    margin-bottom: 50px;
    .infoItem {
      margin-bottom: 30px;
      .title {
        width: 120px;
        font-size: 16px;
        color: #222222;
      }
      .content {
        font-size: 14px;
        color: #555555;
      }
      .Row {
        position: relative;
        height: 30px;
        border: 1px solid #DDDDDD;
        border-radius: 15px;
        padding: 5px 20px;
        margin-right: 10px;
        img {
          position: absolute;
          right: -3px;
          bottom: -3px;
        }
      }
    }
    .func {
      padding-top: 6px;
      width: 60px;
      height: 168px;
      background: #F8F8F8;
      border: 2px solid #FFFFFF;
      box-shadow: 0px 0px 12px 0px rgba(34,94,131,0.2);
      border-radius: 30px;
      position: absolute;
      top: 50px;
      right: 6px;
      img {
        width: 48px;
        height: 48px;
      }
    }
  }
  .infoBorder {
    width: 100%;
    border: 1px solid;
    border-image: linear-gradient(190deg, #BBE5FF, #FFFFFF) 10 10;
    box-shadow: 0px 0px 8px 0px rgba(0,114,255,0.14);
    border-radius: 10px;
    padding: 0 20px;
    margin-bottom: 20px;
  }
  .fileNumber {
    height: 50px;
    line-height: 50px;
  }
  .Reviews {
    height: 80px;
    color: #222222;
    .title {
      font-size: 16px;
    }
    .scoreInfo {
      margin-top: 12px;
      img {
        width: 17px;
        height: 17px;
        margin-right: 5px;
      }
    }
    .addReview {
      width: 110px;
      height: 20px;
      background: #FFFFFF;
      border: 1px solid #0090FF;
      border-radius: 10px;
      font-size: 14px;
      color: #0090FF;
      line-height: 20px;
      margin-left: 40px;
    }
    .defaultReview {
      width: 110px;
      height: 20px;
      background: #ccc;
      border: 1px solid #cccccc;
      border-radius: 10px;
      font-size: 14px;
      color: #807979;
      margin-left: 40px;
    }
  }
  .userInfo {
    height: 100px;
    padding: 15px 20px;
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      margin-right: 9px;
    }
    .followButton {
      width: 80px;
      height: 24px;
      background: #0090FF;
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 14px;
      line-height: 24px;
    }
    .unfollowButton {
      width: 80px;
      height: 24px;
      background: red;
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 14px;
      line-height: 24px;
    }
    .statistical {
      margin-top: 16px;
      div {
        margin-right: 30px;
        img {
          margin-right: 5px;
        }
      }
      
    }
  }
`

export const MarketDataInfo = () => {
  const { account, library } = useActiveWeb3React()
  const { id } = useParams() as any
  const [Reload, setReload] = useState(false)
  const [likeState, setLikeState] =useState(false)
  const [dataInfo, setDataInfo] = useState({} as any)
  const [userInfo, setUserInfo] = useState({} as any)
  const [statistics, setStatistics] = useState({} as any)
  const [dataInfoAll, setDataInfoAll] = useState([] as any)
  const [Tags, setTags] = useState([] as any)
  const [followeDataAll, setFolloweDataAll] = useState([] as any)
  const [PayState, setPayState] = useState(0)
  const [score, setScore] = useState(0)
  const [myScore, setMyScore] = useState(0)
  const [fileScore, setFileScore] = useState(0)
  const [saleNFTAmount, setSaleNFTAmount] = useState(0)

  useEffect(() => {
    getData()
  }, [id, Reload, account])

  useEffect(() => {
    if (dataInfo.nftAddress) {
      getPayState()
    }
    if (dataInfo.userAddress) {
      getUserInfo()
    }
  }, [dataInfo, Reload, account])

  useEffect(() => {
    if (dataInfo.permissions === 'open') {
      openDownlaod()
    }
    if (PayState) {
      Downlaod()
    }
  }, [dataInfo, PayState])

  const getData = async () => {
    const data = await uploadhttp.get(`v0/fileInfo`)
    setDataInfoAll(data.data.data)
    const findData = data.data.data.filter((item: any) => {
      return item.id === id
    })
    setDataInfo(findData[0])
    if (findData[0].nftAddress) {
      const NFTContract = new Contract(findData[0].nftAddress, NFTAbi, library?.getSigner())
      const saleNFT = await NFTContract.get_sale_count()
      setSaleNFTAmount(saleNFT.toNumber())
    }
    const tagsArr = findData[0].tags.split(",")
    setTags(tagsArr)
    const findUserFileData = data.data.data.filter((item: any) => {
      return item.userAddress === findData[0].userAddress
    })
    let browse = 0
    let like = 0
    let download = 0
    findUserFileData.map((item: any) => {
      browse = browse + item.Browse
      like = like + item.like
      download = download + item.download
    })
    setStatistics({
      browseTotal: browse,
      likeTotal: like,
      downloadTotal: download
    })
    if (!document.getElementById('effectPreview')?.innerText) {
      const Dom = document.createElement('div')
      Dom.innerHTML = findData[0].description
      document.getElementById('effectPreview')?.appendChild(Dom)
    }
    const likeData = await uploadhttp.get(`v0/likeFile?userAddress=${account}&likeID=${id}`)
    if (likeData.data.data.length) {
      setLikeState(true)
    }
    const scoreData = await uploadhttp.get(`v0/fileScore`)
    if (scoreData.data.data.length) {
      const myscore = scoreData.data.data.filter((item: any) => {
        return item.fileID === id && item.scoreAddress === account
      })
      setMyScore(myscore[0]?.score)
      let filescore = 0
      scoreData.data.data.map((item: any) => {
        filescore = filescore + item.score
      })
      setFileScore(filescore/scoreData.data.data.length)
    }
    bschttp.get(`v0/followe`).then((vals) => setFolloweDataAll(vals.data.data))
  }

  const getPayState = async () => {
    const NFTContract = new Contract(dataInfo.nftAddress, NFTAbi, library?.getSigner())
    const balance = await NFTContract.balanceOf(account)
    setPayState(balance.toNumber())
  }

  const getFolloweState = () => {
    const data = followeDataAll.filter((item: any) => {
      return item.useraddress === account && item.followeUserAddress === dataInfo.userAddress
    })
    return data.length
  }

  const getUserInfo = async () => {
    const userdata = await bschttp.get(`v0/userinfo/${dataInfo.userAddress}`)
    setUserInfo(userdata.data.data[0])
  }

  const Pay = async () => {
    if (!dataInfo.nftAddress) {
      return
    }
    const NFTContract = new Contract(dataInfo.nftAddress, NFTAbi, library?.getSigner())
    const price = await NFTContract.get_price()
    const payNFT = await NFTContract.Mint({
      value: price.toString()
    })
    const receipt = await fetchReceipt(payNFT.hash, library)
    if (!receipt.status) {
      throw Error('Failed to deposit.')
    } else {
      const tokenid = new BigNumber(receipt.logs[0].topics[3]).toString()
      const daat = {
        name: dataInfo.fileName + ' ' + `#${tokenid}`,
        description: 'No description yet',
        image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2F1683c771-e13a-a1d3-4aa7-715b124fc38c%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1708069173&t=d103d370a800e8b8a5347ecb0e9a6736'
      }
      const jsonString = JSON.stringify(daat)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const formData = new FormData()
      formData.append('files', blob, `${tokenid}.json`)
      uploadhttp.post(`v0/upload/matedata?address=${dataInfo.nftAddress}`,formData)
      const parm = {
        user: account,
        buyID: dataInfo.id
      }
      uploadhttp.post('v0/purchaseRecord', parm)
      setReload(!Reload)
      toastify.success('Pay successful')
    }
  }

  const Downlaod = async () => {
    const NFTContract = new Contract(dataInfo.nftAddress, NFTAbi, library?.getSigner())
    const fileURL = await NFTContract.getdownloadlink()
    const href = fileURL.toString()
    const Adom = document.getElementById('ALabel')
    Adom?.setAttribute('href', href)
  }

  const openDownlaod = async () => {
    const file = await uploadhttp.get(`v0/fileURL/${id}?user=${account}&permissions=${dataInfo.permissions}`)
    const fileURL = file.data.data[0]?.file
    const href = `https://upload-api.gameland.network/v0/upload?filename=${fileURL}`
    const Adom = document.getElementById('ALabel')
    Adom?.setAttribute('href', href)
  }

  const countDownload = () => {
    const parm = {
      download: dataInfo.download + 1
    }
    uploadhttp.put(`v0/fileInfo/${id}`, parm)
  }

  const countLike = () => {
    const parm = {
      user: account,
      likeID: id
    }
    uploadhttp.post(`v0/likeFile`, parm).then((res)=> {
      if (res.data.code) {
        const parms = {
          like: dataInfo.like + 1
        }
        uploadhttp.put(`v0/fileInfo/${id}`, parms)
        setReload(!Reload)
      }
    })
  }

  const addFileScore = () => {
    if (score<1) {
      toastify.error('score cannot be empty')
      return
    }
    const parm = {
      user: account,
      fileID: id,
      score: score
    }
    uploadhttp.post('v0/fileScore', parm).then((res)=> {
      if (res.data.code) {
        toastify.success('Score successful')
      }
    })
  }
  const Followe = async () => {
    const params = {
      useraddress: account,
      followeUserAddress: dataInfo.userAddress
    }
    const res: any = await bschttp.post(`v0/followe`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setReload(!Reload)
    } else {
      throw res.message || res.data.message
    }
  }
  const UnFollowe = async () => {
    const data = followeDataAll.filter((item: any) => {
      return item.useraddress === account && item.followeUserAddress === dataInfo.userAddress
    })
    const res: any = await bschttp.delete(`v0/followe/${data[0].id}`)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setReload(!Reload)
    } else {
      throw res.message || res.data.message
    }
  }

  return (
    <DataInfoBox className="container flex">
      <LeftInfo>
        <div className="first flex flex-v-center">
          <div className="title">{dataInfo.fileName}</div>
          <div className="score flex flex-v-center">
            <div className="borders"></div>
            <div className={fileScore>=1 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=2 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=3 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=4 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=5 ? 'redStrIcon':'whiteStrIcon'}></div>
          </div>
        </div>
        <div className="Tags flex">
          {Tags&&Tags.length?(
            Tags.map((item: any, index: number) => (
              <div key={index}>{item}</div>
            ))
          ):''}
        </div>
        <div id="effectPreview" className="effectPreview"></div>
      </LeftInfo>
      <RightInfo>
        <div className="Details flex flex-v-center">
          <img src={DetailsIcon} alt="" />
          Details
        </div>
        <div className="hr"></div>
        <div className="fileInfo relative">
          <div className="infoItem flex">
            <div className="title">Type:</div>
            <div className="content Row">
              {dataInfo.type}
              <img src={rowIcon} alt="" />
            </div>
          </div>
          <div className="infoItem flex">
            <div className="title">Downloads:</div>
            <div className="content">{dataInfo.download}</div>
          </div>
          <div className="infoItem flex">
            <div className="title">File Size:</div>
            <div className="content">{dataInfo.fileSize}</div>
          </div>
          <div className="infoItem flex">
            <div className="title">Uploaded:</div>
            <div className="content">{dataInfo.uploadTime?.slice(0,10)}</div>
          </div>
          {dataInfo.nftAddress ? (
            <div className="infoItem flex">
              <div className="title">NFT Mint:</div>
              <div className="content">
                {saleNFTAmount}/{dataInfo.nftAmount}
              </div>
            </div>
          ) : ''}
          <div className="func flex wrap flex-justify-content">
            {likeState? (
              <img src={likes} alt="" />
            ):(
              <img className="cursor" onClick={countLike} src={like} alt="" />
            )}
            {dataInfo.permissions === 'open' || PayState ? (
              <a id="ALabel">
                <img className="cursor" onClick={countDownload} src={download} alt="" />
              </a>
            ) : (
              <img className="cursor" onClick={Pay} src={pay} alt="" />
            )}
            <img className="cursor" src={share} alt="" />
          </div>
        </div>
        <div className="fileNumber infoBorder relative cursor">
          {dataInfo.fileAmount} Files
        </div>
        <div className="Reviews infoBorder relative flex flex-v-center flex-column-between">
          <div>
            <div className="title">
              Score
            </div>
            {myScore? (
              <div className="scoreInfo flex">
                <div className={myScore>=1 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=2 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=3 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=4 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=5 ? 'redStrIcon':'whiteStrIcon'}></div>
                &nbsp;{myScore} out of 5
              </div>
            ) : (
              <div className="scoreInfo flex">
                <div className={score>=1 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(1)}></div>
                <div className={score>=2 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(2)}></div>
                <div className={score>=3 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(3)}></div>
                <div className={score>=4 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(4)}></div>
                <div className={score>=5 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(5)}></div>
                &nbsp;{score} out of 5
              </div>
            )}
          </div>
          {myScore? (
            <div className="defaultReview text-center not-allowed">Add Score</div>
          ):(
            <div className="addReview text-center cursor" onClick={addFileScore}>Add Score</div>
          )}
        </div>
        <div className="userInfo infoBorder relative">
          <div className="flex flex-column-between flex-v-center">
            <div className="flex flex-v-center">
              <img className="avatar" src={userInfo.image} alt="" />
              <div className="userName">{userInfo.username}</div>
            </div>
            {dataInfo.userAddress!==account ? (
              getFolloweState() ? (
                <div className="unfollowButton text-center cursor" onClick={UnFollowe}>-Follow</div>
              ) : (
                <div className="followButton text-center cursor" onClick={Followe}>+Follow</div>
              )
            ) : ''}
          </div>
          <div className="statistical flex">
            <div className="flex flex-v-center">
              <img src={viewer} alt="" />
              {statistics.browseTotal}
            </div>
            <div className="flex flex-v-center">
              <img src={likeIcon} alt="" />
              {statistics.likeTotal}
            </div>
            <div className="flex flex-v-center">
              <img src={downloadIcon} alt="" />
              {statistics.downloadTotal}
            </div>
          </div>
        </div>
      </RightInfo>
    </DataInfoBox>
  )
}