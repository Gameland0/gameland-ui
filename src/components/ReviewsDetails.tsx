// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { parseEther } from '@ethersproject/units'
import { useHistory } from 'react-router-dom'
import { useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Upload, message } from 'antd'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import type { UploadChangeParam } from 'antd/es/upload'
import { useActiveWeb3React, useRewardContract } from '../hooks'
import { fetchReceipt } from '../utils'
import { POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL, BSC_CHAIN_ID_HEX, BSC_RPC_URL } from '../constants'
import { toastify } from './Toastify'
import { Dialog } from '../components/Dialog'
import { bschttp, polygonhttp } from './Store'
import { compare } from '../pages/Games'
import { getTime } from './CollectionDetails'
import { handleClick } from './Header'
import { SendBox } from '../pages/Dashboard'
import arrow from '../assets/icon_select.svg'
import loadding from '../assets/loading.svg'
import defaultImg from '../assets/default.png'
import defaultStar from '../assets/icon_review_star_default.svg'
import scoreStar from '../assets/icon_score_star.svg'
import returnIcon from '../assets/return.svg'
import repost from '../assets/icon_repost.svg'
import Reply from '../assets/icon_reply.svg'
import likefalse from '../assets/icon_like_default.svg'
import liketrue from '../assets/icon_like_selected.svg'
import reward from '../assets/icon_reward.svg'

const DetailsBox = styled.div`
  display: flex;
  width: 1312px;
  min-height: 550px;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 10px;
  margin: 5px 0 100px 0;
  .review {
    width: 62.375%;
    padding: 32px 30px 32px 28px;
    min-height: 840px;
    border-right: 1px solid #e5e5e5;
    position: relative;
    .previous {
      margin: -32px 0 24px 0;
      font-size: 32px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      color: #208ddf;
    }
    .user {
      display: flex;
      margin: 0 0 24px 0;
      .userImage {
        width: 120px;
        height: 120px;
        border-radius: 30px;
      }
      .userName {
        font-size: 56px;
        line-height: 120px;
        font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
        font-weight: bold;
        color: #333333;
        margin-left: 24px;
      }
    }
    .borders {
      width: 100%;
      height: 0;
      border: 1px solid #e5e5e5;
      margin: 32px 0;
    }
    .ranting {
      .title {
        font-size: 26px;
        font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
        font-weight: bold;
        color: #333333;
      }
      .tips {
        font-size: 20px;
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        color: #333333;
      }
      .star {
        display: flex;
        margin-top: 24px;
        div {
          width: 72px;
          height: 72px;
          background-size: 72px;
          margin-right: 26px;
          cursor: pointer;
        }
        .defaultStar {
          background-image: url(${defaultStar});
        }
        .scoreStar {
          background-image: url(${scoreStar});
        }
      }
      .commentaryInput {
        width: 94%;
        margin-top: 36px;
        box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
        border-radius: 10px;
        padding: 0 0 16px 0;
        textarea {
          width: 100%;
          height: 180px;
          resize: none;
          border: 0;
          outline: 0;
          font-size: 24px;
          padding-left: 10px;
        }
        .forward {
          width: 90%;
          height: 220px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          margin: 0 0 0 5%;
          padding: 16px;
          .userImage {
            width: 96px;
            height: 96px;
            border-radius: 48px;
          }
          .CommentContent {
            font-size: 24px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #333333;
            margin-top: 16px;
          }
        }
      }
      .button {
        margin: 24px 0 0 470px;
        width: 240px;
        height: 60px;
        border-radius: 30px;
        line-height: 60px;
        background: #35caa9;
        text-align: center;
        color: #fff;
        font-size: 24px;
        margin-bottom: 24px;
        cursor: pointer;
      }
    }
    .exhibit {
      .title {
        font-size: 24px;
        font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
        font-weight: bold;
        color: #333333;
      }
      .topBorder {
        width: 100%;
        height: 0px;
        border: 1px solid #e5e5e5;
        margin-top: 48px;
      }
      .CommentItem {
        .userInfo {
          display: flex;
          margin-top: 36px;
          .userImage {
            width: 96px;
            height: 96px;
            border-radius: 48px;
          }
          .starName {
            margin-left: 24px;
            padding-top: 8px;
            .name {
              font-size: 24px;
              font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
              color: #333333;
            }
            .star {
              display: flex;
              margin-top: 8px;
              .defaultStar {
                width: 28px;
                height: 28px;
                background-image: url(${defaultStar});
                background-size: 28px;
                margin-right: 14px;
              }
              .scoreStar {
                width: 28px;
                height: 28px;
                background-image: url(${scoreStar});
                background-size: 28px;
                margin-right: 14px;
              }
            }
          }
          .time {
            margin-left: 300px;
            font-size: 24px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #d0d0d0;
          }
        }
        .CommentContent {
          font-size: 24px;
          font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
          color: #333333;
          margin: 48px 0 28px 0;
        }
        .forward {
          width: 90%;
          height: 220px;
          border: 1px solid #e5e5e5;
          background: #f8f8f8;
          border-radius: 10px;
          padding: 16px;
          font-size: 24px;
          .userImage {
            width: 96px;
            height: 96px;
            border-radius: 48px;
          }
          .CommentContent {
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #333333;
            margin-top: 16px;
          }
        }
        .otherDetails {
          margin-top: 24px;
          display: flex;
          position: relative;
          div {
            display: flex;
            margin-right: 55px;
            img {
              width: 40px;
              height: 40px;
              margin-right: 14px;
            }
            .quantity {
              font-size: 18px;
              font-family: DIN-Medium, DIN;
              color: #666666;
            }
          }
          .reward {
            margin-left: 56px;
            .rewardTotal {
              width: 125px;
              position: absolute;
              top: -8px;
              right: 10px;
              p {
                width: 125px;
                margin-bottom: 6px;
              }
            }
          }
        }
      }
      .bottomBorder {
        width: 100%;
        height: 0px;
        border: 1px solid #e5e5e5;
        margin-top: 32px;
      }
      .replyWindow {
        font-size: 24px;
        margin: 20px 0 0 36px;
        .replyDetails {
          margin: 0 0 24px 0;
          .userImage {
            width: 72px;
            height: 72px;
            border-radius: 36px;
          }
          .replyContent {
            margin-top: 10px;
          }
        }
        .replayInput {
          display: flex;
          width: 760px;
          margin-top: 48px;
          .replayWho {
            min-width: 20px;
          }
          textarea {
            width: 90%;
            height: 80px;
            resize: none;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            outline: 0;
            font-size: 24px;
            padding-left: 10px;
          }
        }
        .sendReplay {
          width: 120px;
          height: 40px;
          background: #35caa9;
          border-radius: 40px;
          text-align: center;
          line-height: 40px;
          color: #fff;
          font-size: 24px;
          margin: 24px 0 0 660px;
          cursor: pointer;
        }
      }
    }
  }
  .comment {
    width: 37.625%;
    min-height: 550px;
    padding: 30px 0 0 24px;
    .title {
      font-size: 32px;
      font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
      font-weight: bold;
      color: #333333;
    }
    .gamesItem {
      display: flex;
      margin-top: 32px;
      img {
        width: 80px;
        height: 80px;
        border-radius: 12px;
      }
      .label {
        margin-left: 24px;
        .gameName {
          width: 230px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 24px;
          font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
          font-weight: bold;
          color: #333333;
        }
        .attributes {
          display: flex;
          margin-top: 10px;
          div {
            padding: 6px;
            background: #d2f2fe;
            border-radius: 8px;
            font-size: 14px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #41acef;
            margin-right: 12px;
          }
        }
      }
      .score {
        display: flex;
        align-items: center;
        margin: 0 0 0 30px;
        font-size: 24px;
        font-family: DIN-Bold, DIN;
        font-weight: bold;
        color: #35caa9;
        img {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
  @media screen and (min-width: 1920px) {
    width: 1600px;
    .review {
      padding: 48px 46px 48px 44px;
      .user {
        .userImage {
          width: 160px;
          height: 160px;
          border-radius: 40px;
        }
        .userName {
          font-size: 72px;
          line-height: 160px;
        }
      }
      .ranting {
        .title {
          font-size: 32px;
        }
        .tips {
          font-size: 24px;
        }
        .star {
          div {
            width: 96px;
            height: 96px;
            background-size: 96px;
            margin-right: 32px;
          }
        }
        .button {
          margin: 24px 0 0 530px;
          width: 320px;
          height: 80px;
          border-radius: 40px;
          line-height: 80px;
        }
      }
      .exhibit {
        .CommentItem {
          .time {
            margin-left: 410px;
          }
          .otherDetails {
            div {
              margin-right: 78px;
            }
          }
        }
      }
    }
    .comment {
      min-height: 840px;
      padding: 50px 0 0 40px;
      .gamesItem {
        img {
          width: 100px;
          height: 100px;
        }
        .attributes {
          margin-top: 20px;
          div {
            font-size: 18px;
            margin-right: 12px;
          }
        }
      }
    }
  }
`
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 1
  if (!isLt2M) {
    message.error('Image must smaller than 1MB!')
  }
  return isJpgOrPng && isLt2M
}
const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}
export const ReviewsDetails = () => {
  const { account, library, chainId } = useActiveWeb3React()
  const RewardContract = useRewardContract()
  const [showreward, setshowreward] = useState(false)
  const [rewardAddress, setrewardAddress] = useState('')
  const [rewardQuantity, setrewardQuantity] = useState('')
  const [rewardoptions, setrewardoptions] = useState(false)
  const [rewardItem, setrewardItem] = useState({} as any)
  const [games, setGames] = useState([] as any)
  const [starScore, setstarScore] = useState(0)
  const [username, setusername] = useState('')
  const [textareaValue, settextareaValue] = useState('')
  const [replayValue, setreplayValue] = useState('')
  const [replayWho, setreplayWho] = useState('')
  const [userinfo, setUserinfo] = useState([] as any)
  const [userScoreinfo, setUserScoreinfo] = useState([] as any)
  const [scoreinfo, setScoreinfo] = useState([] as any)
  const [revieweinfo, setrevieweinfo] = useState([] as any)
  const [rewardinfo, setrewardinfo] = useState([] as any)
  const [revieweData, setrevieweData] = useState([] as any)
  const [userLikeInfo, setuserLikeInfo] = useState([] as any)
  const [collectionDetails, setcollectionDetails] = useState([] as any)
  const [showSetUp, setshowSetUp] = useState(false)
  const [showReplayWindow, setshowReplayWindow] = useState(-1)
  const [scoreDialog, setscoreDialog] = useState(false)
  const [UserSettings, setUserSettings] = useState(false)
  const [UploadImg, setUploadImg] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>()
  const [lending, setLending] = useState(false)
  const [forward, setForward] = useState({} as any)
  const { state } = useLocation()
  const { contractName } = useParams() as any
  const history = useHistory()
  let http2: any
  let address: any
  let chain: any
  let uploadHttpUrl
  if (state) {
    address = state.address
    chain = state.chain
  } else {
    address = localStorage.getItem('address')
    chain = localStorage.getItem('chain')
  }
  const [rewardSelection, setrewardSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  if (chain === 'bsc') {
    http2 = bschttp
    uploadHttpUrl = 'http://localhost:8091/v0/userinfo/upload'
  } else if (chain === 'polygon') {
    http2 = polygonhttp
    uploadHttpUrl = 'http://localhost:8089/v0/userinfo/upload'
  }
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )
  const getCollectionInfo = async () => {
    if (!account) return
    const Details = await http2.get(`v0/games/${address}`)
    setcollectionDetails(Details?.data.data[0])
  }
  const getGames = async () => {
    const bsc = bschttp.get('/v0/games')
    const polygon = polygonhttp.get('/v0/games')
    Promise.all([bsc, polygon]).then((vals) => {
      setGames([...vals[0].data.data, ...vals[1].data.data].sort(compare()))
    })
  }
  useEffect(() => {
    if (state) {
      localStorage.setItem('address', state.address)
      localStorage.setItem('chain', state.chain)
    }
    getGames()
    getCollectionInfo()
  }, [contractName])

  useEffect(() => {
    const getUserinfo = async () => {
      if (!account) return
      const userinfo = await http2.get(`v0/userinfo/${account}`)
      if (!userinfo.data.data.length) {
        setshowSetUp(true)
      } else {
        setUserinfo(userinfo.data.data[0])
        const params = { useraddress: account }
        const userscore = http2.post(`/v0/score/${address}`, params)
        const collectionScore = http2.get(`/v0/score/collection/${address}`)
        const collectionreviewe = http2.get(`/v0/review/collection/${address}`)
        const userlike = http2.get(`/v0/review_like/${account}`)
        const Rewardinfo = http2.get(`/v0/review_reward`)
        Promise.all([userscore, collectionScore, collectionreviewe, userlike, Rewardinfo]).then((vals) => {
          setUserScoreinfo(vals[0].data.data)
          setScoreinfo(vals[1].data.data)
          setuserLikeInfo(vals[3].data.data)
          setrevieweData(vals[2].data.data)
          setrewardinfo(vals[4].data.data)
          const reviewedata = vals[2].data.data.filter((ele: any) => {
            return !ele.SuperiorIndex
          })
          setrevieweinfo(reviewedata)
        })
      }
    }
    getUserinfo()
  }, [account, chainId])
  useEffect(() => {
    if (rewardSelection === 'BNB') {
      handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)
    } else if (rewardSelection === 'MATIC') {
      handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)
    }
  }, [rewardSelection])
  const isLike = (id: any) => {
    const Index = userLikeInfo.findIndex((item: any) => {
      return item.reviewid === id
    })
    if (Index >= 0) return 1
    return 0
  }
  const getRewardTotal = (id: any) => {
    const data = rewardinfo.filter((ele: any) => {
      return ele.reviewid === id
    })
    if (data.length) {
      let BNBtotal = 0
      let polygonTotal = 0
      data.map((item: any) => {
        if (item.paytype === 'BNB') {
          BNBtotal += item.amount
        } else if (item.paytype === 'MATIC') {
          polygonTotal += item.amount
        }
      })
      return [BNBtotal, polygonTotal]
    }
    return [0, 0]
  }
  const getForwardData = (id: any, type: any) => {
    const data = revieweinfo.filter((ele: any) => {
      return ele.id === id
    })
    if (type === 'name') return data[0].username
    if (type === 'content') return data[0].context
    if (type === 'image') return data[0].userimage
  }
  const getReplayData = (id: any) => {
    const data = revieweData.filter((ele: any) => {
      return ele.SuperiorIndex === id
    })
    return data
  }
  const updateScore = async () => {
    const info = await http2.get(`/v0/score/collection/${address}`)
    let total = 0
    info.data.data.map((item: any) => {
      total += item.score
    })
    const totalScore = (total * 2) / info.data.data.length
    const params = {
      starRating: totalScore
    }
    http2.put(`/v0/games/${collectionDetails.id}`, params).then(() => location.reload())
  }
  const updateReplayTotal = async (item: any) => {
    const total = item.reviews + 1
    const params = {
      reviews: total
    }
    http2.put(`/v0/review/${item.id}`, params).then(() => location.reload())
  }
  const updateLikeTotal = async (item: any, type: any) => {
    let total
    if (type === 'delete') {
      total = item.likes - 1
    } else {
      total = item.likes + 1
    }
    const params = {
      likes: total
    }
    http2.put(`/v0/review/${item.id}`, params).then(() => location.reload())
  }
  const updateForwardTotal = async (item: any) => {
    const total = item.forwards + 1
    const params = {
      forwards: total
    }
    http2.put(`/v0/review/${item.id}`, params).then(() => location.reload())
  }
  const setname = async () => {
    if (!username) return
    setLending(true)
    const params = {
      useraddress: account,
      username: username
    }
    const res: any = await bschttp.post(`/v0/userinfo/`, params)
    polygonhttp.post(`/v0/userinfo/`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setLending(false)
      setshowSetUp(false)
      location.reload()
    } else {
      throw res.message || res.data.message
    }
  }
  const sendRewar = async () => {
    if (!rewardQuantity || !library) return
    const rented = await RewardContract?.connect(library.getSigner()).reward(rewardItem.useraddress, {
      value: parseEther(rewardQuantity)
    })
    const receipt = await fetchReceipt(rented.hash, library)
    const { status } = receipt
    if (!status) {
      throw Error('Failed to rent.')
    }
    const params = {
      reviewid: rewardItem.id,
      toaddress: rewardItem.useradderss,
      fromaddress: account,
      datetime: new Date().toJSON(),
      amount: rewardQuantity,
      paytype: rewardSelection
    }
    const res: any = await http2.post(`/v0/review_reward/`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setLending(false)
      setshowSetUp(false)
      location.reload()
    } else {
      throw res.message || res.data.message
    }
  }
  const sendReplay = async (item: any) => {
    if (!replayValue) return
    if (item.useraddress.toLowerCase() === account?.toLowerCase()) {
      if (!replayWho) return
    }
    let text
    if (replayWho) {
      text = replayWho + ':' + replayValue
    } else {
      text = replayValue
    }
    const params = {
      useraddress: account,
      contractaddress: address,
      SuperiorIndex: item.id,
      datetime: new Date().toJSON(),
      username: userinfo.username,
      context: text
    }
    const res: any = await http2.post(`/v0/review`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      updateReplayTotal(item)
    }
  }
  const sendNewUserName = async () => {
    const params = {
      username: newUserName
    }
    const userinfo = http2.put(`/v0/userinfo/${account}`, params)
    const review = http2.put(`/v0/review/updateUserName/${account}`, params)
    Promise.all([userinfo, review]).then(() => location.reload())
  }
  const submit = async () => {
    if (!starScore && !textareaValue && !Object.keys(forward).length) return
    if (starScore) {
      if (!userScoreinfo.length) {
        const params = {
          useraddress: account,
          contractaddress: address,
          score: starScore
        }
        const res: any = await http2.post(`/v0/score/`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          updateScore()
        } else {
          throw res.message || res.data.message
        }
      } else if (!userScoreinfo[0].renew) {
        const params = {
          score: starScore,
          renew: true
        }
        const res: any = await http2.put(`/v0/score/${userScoreinfo[0].id}`, params)
        if (res.data.code === 1) {
          updateScore()
          toastify.success('succeed')
        } else {
          throw res.message || res.data.message
        }
      }
    }
    if (textareaValue && !Object.keys(forward).length) {
      try {
        const sign = await library?.getSigner().signMessage(textareaValue)
        const params = {
          useraddress: account,
          contractaddress: address,
          datetime: new Date().toJSON(),
          username: userinfo.username,
          context: textareaValue
        }
        const res: any = await http2.post(`/v0/review`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          location.reload()
        }
      } catch (error: any) {
        toastify.error(error.message)
      }
    }
    if (Object.keys(forward).length) {
      try {
        const sign = await library?.getSigner().signMessage(textareaValue)
        const params = {
          useraddress: account,
          contractaddress: address,
          datetime: new Date().toJSON(),
          username: userinfo.username,
          context: textareaValue,
          quote: forward.id
        }
        const res: any = await http2.post(`/v0/review`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          updateForwardTotal(forward)
        }
      } catch (error: any) {
        toastify.error(error.message)
      }
    }
  }
  const likeClick = async (item: any) => {
    if (item.useraddress.toLowerCase() === account?.toLowerCase()) return
    const Index = userLikeInfo.findIndex((ele: any) => {
      return ele.reviewid === item.id
    })
    if (Index >= 0) {
      const res: any = await http2.delete(`/v0/review_like/${item.id}`)
      if (res.data.code === 1) {
        toastify.success('succeed')
        updateLikeTotal(item, 'delete')
      } else {
        throw res.message || res.data.message
      }
    } else {
      const params = {
        reviewid: item.id,
        useraddress: account
      }
      const res: any = await http2.post(`/v0/review_like`, params)
      if (res.data.code === 1) {
        toastify.success('succeed')
        updateLikeTotal(item, 'add')
      } else {
        throw res.message || res.data.message
      }
    }
  }
  const commentsForward = async (item: any) => {
    if (item.useraddress.toLowerCase() === account?.toLowerCase()) return
    setForward(item)
  }
  const handletextareaChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    settextareaValue(val)
  }, [])
  const handleusernameChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setusername(val)
  }, [])
  const handlerewardAddressChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setrewardAddress(val)
  }, [])
  const handlerewardQuantityChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setrewardQuantity(val)
  }, [])
  const handlereplayChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setreplayValue(val)
  }, [])
  const handleNewuserNameChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setNewUserName(val)
  }, [])
  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false)
        toastify.success('succeed')
        location.reload()
      })
    }
  }
  const gameLink = (item: any) => {
    history.push({
      pathname: `/games/${item.contractName.replace(/ /g, '')}`,
      state: {
        address: item.contractAddress,
        chain: item.chain
      }
    })
  }
  const link = () => {
    history.push({
      pathname: `/games/${contractName}`,
      state: {
        address: address,
        chain: chain
      }
    })
  }
  return (
    <div className="container">
      <Dialog footer={null} onCancel={() => setshowSetUp(false)} visible={showSetUp} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">Set Up</div>
          <h2>Set userName</h2>
          <div className="input">
            <input placeholder="username" maxLength={30} onChange={handleusernameChange} value={username} />
          </div>
          <div className={username ? 'button ture' : 'button false'} onClick={setname}>
            submit
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
        </SendBox>
      </Dialog>
      <Dialog footer={null} onCancel={() => setshowreward(false)} visible={showreward} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">give a reward</div>
          <h2>Quantity</h2>
          <div className="input">
            <input placeholder="quantity" onChange={handlerewardQuantityChange} value={rewardQuantity} />
          </div>
          <div className="Selection" onClick={() => setrewardoptions(!rewardoptions)}>
            {rewardSelection}
            <img src={arrow} className="arrowIcon" />
          </div>
          {rewardoptions ? (
            <div className="Options">
              <div
                onClick={() => {
                  setrewardSelection('BNB')
                  setrewardoptions(false)
                }}
              >
                BNB
              </div>
              <div
                onClick={() => {
                  setrewardSelection('MATIC')
                  setrewardoptions(false)
                }}
              >
                MATIC
              </div>
            </div>
          ) : (
            ''
          )}
          <div className={rewardQuantity ? 'button ture' : 'button false'} onClick={sendRewar}>
            Send
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
        </SendBox>
      </Dialog>
      <Dialog
        footer={null}
        onCancel={() => setUserSettings(false)}
        visible={UserSettings}
        destroyOnClose
        closable={false}
      >
        <SendBox>
          <div className="title">user settings</div>
          <h2>new user name</h2>
          <div className="input">
            <input placeholder="new user name" onChange={handleNewuserNameChange} value={newUserName} />
          </div>
          <div className={newUserName ? 'button ture' : 'button false'} onClick={sendNewUserName}>
            renew
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
        </SendBox>
      </Dialog>
      <Dialog footer={null} onCancel={() => setUploadImg(false)} visible={UploadImg} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">user settings</div>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action={uploadHttpUrl}
            beforeUpload={beforeUpload}
            data={userinfo}
            onChange={handleChange}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
          </Upload>
        </SendBox>
      </Dialog>
      {/* <img src={returnIcon} className="returnIcon cursor" alt=""  /> */}
      <DetailsBox>
        <div className="review">
          <div className="previous cursor" onClick={link}>
            &lt;&lt; previous
          </div>
          <div className="user">
            <img className="userImage" src={userinfo.image || defaultImg} onClick={() => setUploadImg(true)} />
            <div className="userName" onClick={() => setUserSettings(true)}>
              {userinfo.username}
            </div>
          </div>
          <div className="borders"></div>
          <div className="ranting">
            <div className="title">Rate this game</div>
            <div className="tips">tell other gamers what you think</div>
            <div className="star">
              <div className={starScore >= 1 ? 'scoreStar' : 'defaultStar'} onClick={() => setstarScore(1)}></div>
              <div className={starScore >= 2 ? 'scoreStar' : 'defaultStar'} onClick={() => setstarScore(2)}></div>
              <div className={starScore >= 3 ? 'scoreStar' : 'defaultStar'} onClick={() => setstarScore(3)}></div>
              <div className={starScore >= 4 ? 'scoreStar' : 'defaultStar'} onClick={() => setstarScore(4)}></div>
              <div className={starScore >= 5 ? 'scoreStar' : 'defaultStar'} onClick={() => setstarScore(5)}></div>
            </div>
            <div className="commentaryInput">
              <textarea
                rows={5}
                cols={70}
                placeholder="Your opinion..."
                value={textareaValue}
                onChange={handletextareaChange}
              ></textarea>
              {Object.keys(forward).length ? (
                <div className="forward">
                  <img src={forward.useriamge || defaultImg} className="userImage" alt="" /> &nbsp;{forward.username}
                  <div className="CommentContent">{forward.context}</div>
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="button" onClick={() => (!userScoreinfo[0].renew ? setscoreDialog(true) : submit())}>
              submit
            </div>
          </div>
          <div className="exhibit">
            <div className="title">The review of Game</div>
            <div className="topBorder"></div>
            {revieweinfo.length
              ? revieweinfo.map((item: any, index: any) => (
                  <div className="CommentItem" key={index}>
                    <div className="userInfo">
                      <img src={item.userimage || defaultImg} className="userImage" alt="" />
                      <div className="starName">
                        <div className="name">{item.username}</div>
                        <div className="star">
                          <div className={userScoreinfo[0]?.score >= 1 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={userScoreinfo[0]?.score >= 2 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={userScoreinfo[0]?.score >= 3 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={userScoreinfo[0]?.score >= 4 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={userScoreinfo[0]?.score >= 5 ? 'scoreStar' : 'defaultStar'}></div>
                        </div>
                      </div>
                      <div className="time">{getTime(item.datetime)}</div>
                    </div>
                    <div className="CommentContent">{item.context}</div>
                    {item.quote ? (
                      <div className="forward">
                        <img src={getForwardData(item.quote, 'image') || defaultImg} className="userImage" /> &nbsp;
                        {getForwardData(item.quote, 'name')}
                        <div className="CommentContent">{getForwardData(item.quote, 'content')}</div>
                      </div>
                    ) : (
                      ''
                    )}
                    <div className="otherDetails">
                      <div className="repost">
                        <img
                          src={repost}
                          className={item.useraddress.toLowerCase() === account?.toLowerCase() ? '' : 'cursor'}
                          onClick={() => commentsForward(item)}
                        />
                        <div className="quantity">{item.forwards || 0}</div>
                      </div>
                      <div
                        className="Reply cursor"
                        onClick={() => setshowReplayWindow(showReplayWindow === index ? -1 : index)}
                      >
                        <img src={Reply} alt="" />
                        <div className="quantity">{item.reviews || 0}</div>
                      </div>
                      <div className="like">
                        <img
                          src={isLike(item.id) ? liketrue : likefalse}
                          className={item.useraddress.toLowerCase() === account?.toLowerCase() ? '' : 'cursor'}
                          onClick={() => likeClick(item)}
                        />
                        <div className="quantity">{item.likes || 0}</div>
                      </div>
                      <div
                        className="reward cursor"
                        onClick={() => {
                          setshowreward(true)
                          setrewardItem(item)
                        }}
                      >
                        <img src={reward} />
                        <p className="rewardTotal">
                          <p>{getRewardTotal(item.id)[0]} BNB</p>
                          <p>{getRewardTotal(item.id)[1]} MATIC</p>
                        </p>
                      </div>
                    </div>
                    <div className="bottomBorder"></div>
                    {showReplayWindow === index ? (
                      <div className="replyWindow">
                        {getReplayData(item.id).length ? (
                          getReplayData(item.id).map((ele: any, index: any) => (
                            <div
                              className="replyDetails cursor"
                              key={index}
                              onClick={() => setreplayWho('@' + ele.username)}
                            >
                              <img src={ele.userimage || defaultImg} className="userImage" alt="" /> &nbsp;
                              {ele.username}
                              <div className="replyContent">{ele.context}</div>
                            </div>
                          ))
                        ) : (
                          <div>No reply yet</div>
                        )}
                        <div className="replayInput">
                          <div className="replayWho">{replayWho}</div>
                          <textarea
                            rows={5}
                            cols={70}
                            placeholder=""
                            value={replayValue}
                            onChange={handlereplayChange}
                          ></textarea>
                        </div>
                        <div className="sendReplay" onClick={() => sendReplay(item)}>
                          send
                        </div>
                        <div className="bottomBorder"></div>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                ))
              : ''}
          </div>
        </div>
        <div className="comment">
          <div className="title">Active Game</div>
          {games.length
            ? games.map((item: any, index: any) => (
                <div className="gamesItem" key={index} onClick={() => gameLink(item)}>
                  <img src={item.image} alt="" />
                  <div className="label">
                    <div className="gameName">{item.contractName}</div>
                    <div className="attributes">
                      <div>multiplayer</div>
                      <div>play to earn</div>
                      <div>RPG</div>
                    </div>
                  </div>
                  <div className="score">
                    <img src={scoreStar} alt="" />
                    &nbsp;{item.starRating}
                  </div>
                </div>
              ))
            : ''}
        </div>
      </DetailsBox>
    </div>
  )
}
