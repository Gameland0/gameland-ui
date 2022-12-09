import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { parseEther } from '@ethersproject/units'
import styled from 'styled-components'
import { Tabs } from 'antd'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { useParams } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import { hashMessage } from 'ethers/lib/utils'
import { useActiveWeb3React, useStore, useRewardContract } from '../hooks'
import { MORALIS_KEY, BscContract, PolygonContract, BSCSCAN_KEY, POLYGONSCAN_KEY } from '../constants'
import { bschttp, http, polygonhttp } from './Store'
import { formatting, fixDigitalId, fetchReceipt, ChainHttp } from '../utils'
import { getTime } from './CollectionDetails'
import { SendBox } from '../pages/Dashboard'
import { toastify } from './Toastify'
import { MyRenting } from '../pages/Dashboard/MyRenting'
import { Img } from './Img'
import { Dialog } from './Dialog'
import { CollectionToken } from './CollectionToken'
import { Modal } from './Modal'
import { NFTStatsMadal } from './NFTStatsMadal'
import defaultImg from '../assets/default.png'
import tabsIconNFT from '../assets/icon_NFT.svg'
import tabsIconComment from '../assets/icon_comment.svg'
import tabsIconPosts from '../assets/icon_post.svg'
import integralIcon from '../assets/icon_coin.svg'
import repost from '../assets/icon_repost.svg'
import Reply from '../assets/icon_reply.svg'
import collectfalse from '../assets/icon_collect_default_comments.svg'
import collecttrue from '../assets/icon_collect_click_comments.svg'
import likefalse from '../assets/icon_like_default_comments.svg'
import liketrue from '../assets/icon_like_click_comments.svg'
import reward from '../assets/icon_reward.svg'
import arrow from '../assets/icon_select.svg'
import loadding from '../assets/loading.svg'
import polygonIcon from '../assets/polygon_icon.svg'
import BNBIcon from '../assets/bnb.svg'
import twitter from '../assets/icon_twitter.svg'
import discord from '../assets/icon_discord.svg'
import Telegram from '../assets/Telegram.png'
import deleteIcon from '../assets/delete.png'
import Arweave from 'arweave'
import key from '../constants/arweave-keyfile.json'

interface CardProps {
  onClick?: () => void
  onLend: () => void
  onSend: () => void
  pay_type: string
  name: string
  nftId: string
  isExpired?: boolean
  right?: boolean
  contract_type: string
  img: string
  account: any
  useraddress: any
}
export const Card: React.FC<CardProps> = ({
  img,
  name,
  contract_type,
  onLend,
  onSend,
  nftId,
  account,
  useraddress
}) => {
  const { networkError } = useStore()
  const Lend = () => {
    if (networkError) {
      toastify.error('Please connect to valid network.')
      return
    }
    onLend && onLend()
  }
  const send = () => {
    if (networkError) {
      toastify.error('Please connect to valid network.')
      return
    }
    onSend && onSend()
  }
  const src = img?.slice(-4)
  return (
    <CardBox className="flex flex-column-between flex-column">
      {src === '.mp4' || src === 'webm' ? (
        <video width="328" height="328" muted autoPlay={true} loop role="application" preload="auto" src={img}></video>
      ) : (
        <Img src={img} alt={name} />
      )}
      <CardDetails className="flex flex-h-between">
        <div>
          <Labels name={name} type={contract_type} nftId={nftId} />
        </div>
      </CardDetails>
      {account.toLowerCase() === useraddress.toLowerCase() ? (
        <FakeButtons>
          <button className="button" onClick={Lend}>
            Lend
          </button>
          <button className="button" onClick={send}>
            send
          </button>
        </FakeButtons>
      ) : (
        ''
      )}
    </CardBox>
  )
}
interface LabelProps {
  name: string
  nftId: string
  type: any
}
const Labels: React.FC<LabelProps> = ({ name, type, nftId }) => {
  return (
    <div style={{ overflow: 'hidden', height: 90 }}>
      <NFTname>{name}</NFTname>
      <NftId>{nftId}</NftId>
      <Standard>{type}</Standard>
    </div>
  )
}
interface FolloweProps {
  Followeitem: any
  onFollowe: () => void
  onUnFollowe: () => void
}
const UserBox = styled.div`
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
      width: 95%;
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
      margin: 24px 0 0 72%;
      cursor: pointer;
    }
  }
  .topBackground {
    width: 100%;
    height: 400px;
    background: linear-gradient(90deg, #41acef 0%, #35caa9 100%);
    border-radius: 0px;
  }
  .blueBg {
    background: #d2f2fe;
    border-radius: 8px;
  }
`
const UserInfo = styled.div`
  width: 84.5%;
  min-height: 757px;
  background: #ffffff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 10px;
  margin: auto;
  margin-top: -140px;
  padding: 48px 64px;
  .boxDivider {
    border: 1px solid #e5e5e5;
    margin: 0 64px;
  }
  @media screen and (max-width: 1440px) {
    padding: 32px 36px;
    .boxDivider {
      margin: 0 40px;
    }
  }
`
const InfoLeft = styled.div`
  position: relative;
  .avatar {
    width: 240px;
    height: 240px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
  .userName {
    font-size: 24px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
    margin: 40px 0 20px 0;
  }
  .useraddress {
    font-size: 18px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    color: #35caa9;
    margin-bottom: 20px;
  }
  .socialize {
    margin-bottom: 20px;
    img {
      width: 40px;
      height: 40px;
      margin: 0 6px;
    }
    .transparency {
      opacity: 0.3;
    }
  }
  .settings {
    margin-bottom: 20px;
    span {
      font-size: 18px;
    }
  }
  .followInfo {
    height: 72px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    font-size: 18px;
    color: #666666;
    margin-bottom: 20px;
    .delimiter {
      height: 66px;
      border: 1px solid #e5e5e5;
      margin: 0 32px;
    }
    .quantity {
      font-size: 24px;
      color: #333333;
    }
    .Following {
      width: 90px;
      .Icon {
        width: 30px;
        height: 30px;
      }
    }
  }
  @media screen and (max-width: 1440px) {
    width: 180px;
    .avatar {
      width: 180px;
      height: 180px;
    }
    .socialize {
      img {
        width: 30px;
        height: 30px;
      }
    }
    .followInfo {
      font-size: 14px;
      .quantity {
        font-size: 18px;
      }
      .Following {
        width: 65px;
        .Icon {
          width: 20px;
          height: 20px;
        }
      }
    }
  }
`
const InfoRight = styled.div`
  width: 75%;
  .Tabs {
    height: 50px;
    justify-content: flex-end;
    font-size: 18px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    color: #41acef;
    div {
      margin-left: 64px;
      text-align: right;
      padding: 13px 16px;
      cursor: pointer;
      span {
        background: #a8e5fb;
        border-radius: 12px;
        padding: 2px 12px;
        margin-left: 16px;
      }
    }
  }
  .horizontalDividing {
    border: 1px solid #e5e5e5;
    margin: 32px 0;
  }
`
const CommentsBox = styled.div`
  .CommentItem {
    position: relative;
    border-radius: 8px;
    border: 1px solid #e5e5e5;
    padding: 24px 48px;
    font-size: 24px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    margin-bottom: 40px;
    .userInfo {
      .userImage {
        width: 96px;
        height: 96px;
        border-radius: 10px;
      }
      .name {
        color: #333333;
        line-height: 96px;
        margin-left: 24px;
      }
      .contractName {
        position: absolute;
        top: 24px;
        right: 48px;
      }
      .time {
        position: absolute;
        top: 56px;
        right: 48px;
        color: #d0d0d0;
        line-height: 96px;
      }
    }
    .CommentNFTBox {
      margin: 16px 0;
      img {
        width: 120px;
        height: 120px;
        cursor: pointer;
      }
      .CommentNFTname {
        width: 120px;
        height: 20px;
        font-size: 14px;
        background-color: rgba(0, 0, 0, 0.1);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .CommentContent {
      color: #333333;
      margin: 39px 0 24px 0;
    }
    .otherDetails {
      div {
        margin-right: 70px;
      }
      img {
        width: 40px;
        height: 40px;
      }
      .quantity {
        font-size: 16px;
        font-family: DIN-Medium, DIN;
        font-weight: 500;
        color: #666666;
        margin-left: 8px;
      }
      .rewardTotal {
        margin-left: 16px;
        p {
          margin-bottom: 10px;
          font-size: 16px;
        }
      }
    }
  }
  @media screen and (max-width: 1440px) {
    .CommentItem {
      .userInfo {
        .userImage {
          width: 72px;
          height: 72px;
        }
        .name {
          line-height: 72px;
        }
        .contractName {
          top: 18px;
        }
        .time {
          top: 50px;
          line-height: 72px;
        }
      }
      .otherDetails {
        div {
          margin-right: 50px;
        }
        img {
          width: 30px;
          height: 30px;
        }
      }
    }
  }
`
const PostsBox = styled.div`
  .WriteButton {
    width: 150px;
    height: 30px;
    line-height: 30px;
    margin: auto;
    margin-top: 20px;
    border: 1px solid #35caa9;
    border-radius: 15px;
    color: #35caa9;
    font-size: 18px;
    cursor: pointer;
    &:hover {
      background: #35caa9;
      color: #fff;
    }
  }
`
const NFTsBox = styled.div`
  position: relative;
  div:nth-child(3n) {
    margin: 0 0 40px 0;
  }
`
const CardDetails = styled.div`
  position: relative;
  margin-top: 1rem;
  padding: 0 1rem 8px;
  p {
    margin-bottom: 0.3rem;
  }
`
const CardBox = styled.div`
  position: relative;
  width: 330px;
  min-height: 396px;
  background: #fff;
  margin: 0 51px 50px 0;
  border: 1px solid #ddd;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  @media screen and (max-width: 1440px) {
    width: 255px;
    margin: 0 20px 20px 0;
  }
`
const NFTname = styled.p`
  display: block;
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const NftId = styled.div`
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Standard = styled.div`
  color: #d0d0d0;
  font-size: 14px;
  margin-bottom: 0.5rem;
`
const FakeButtons = styled.div`
  position: absolute;
  top: 346px;
  right: 24px;
  .button {
    display: block;
    height: 2rem;
    padding: 0 1rem;
    line-height: 2rem;
    font-size: 16px;
    color: var(--primary-color);
    text-align: center;
    cursor: pointer;
    border-radius: 1.25rem;
    background: white;
    border: 1px solid var(--primary-color);
    margin-bottom: 8px;
    &:hover {
      background-color: #41acef;
      color: white;
    }
  }
  @media screen and (max-width: 1440px) {
    top: 300px;
  }
`
export const Close = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 160px;
  height: 40px;
  border: 1px solid #35caa9;
  border-radius: 20px;
  color: #35caa9;
  text-align: center;
  line-height: 40px;
  cursor: pointer;
  &:hover {
    background: #35caa9;
    color: #fff;
  }
`
const PostsList = styled.div`
  position: relative;
  .deleteIcon {
    width: 15px;
    height: 15px;
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0.6;
    display: none;
    z-index: 200;
    cursor: pointer;
  }
  .title {
    width: 500px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &:hover {
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
    .deleteIcon {
      display: block;
    }
  }
`
const PostsItem = styled.div`
  padding: 20px 10px;
  position: relative;
  font-size: 28px;
  height: 80px;
  .title {
    width: 460px;
  }
  .gameName {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 14px;
    color: #9a9191;
  }
  .time {
    width: 260px;
  }
`
const PostsContent = styled.div`
  position: relative;
  width: 100%;
  min-height: 772px;
  padding: 24px 48px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  font-size: 24px;
  .user {
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    color: #333333;
    img {
      border-radius: 10px;
      width: 96px;
      height: 96px;
    }
  }
  .gameName {
    position: absolute;
    top: 24px;
    right: 48px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
  }
  .time {
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    color: #d0d0d0;
    position: absolute;
    top: 64px;
    right: 48px;
  }
  .postsTitle {
    margin: 32px 0;
    font-size: 28px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
  }
  .postsContent {
    div {
      font-size: 24px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      color: #333333;
      word-wrap: break-word;
      margin-bottom: 32px;
    }
    img {
      width: 500px;
      height: 500px;
    }
  }
  .otherDetails {
    margin-top: 24px;
    position: relative;
    div {
      margin-right: 64px;
      img {
        width: 40px;
        height: 40px;
        margin-right: 8px;
      }
      .quantity {
        font-size: 16px;
        font-family: DIN-Medium, DIN;
        color: #666666;
      }
    }
    .reward {
      margin-left: 16px;
      position: relative;
      .rewardTotal {
        width: 100px;
        flex-wrap: wrap;
        position: absolute;
        top: -5px;
        left: 50px;
        font-size: 16px;
        margin: 0;
        p {
          width: 200px;
          margin-bottom: 0px;
        }
      }
    }
  }
  @media screen and (max-width: 1440px) {
    min-height: 600px;
  }
`
const SettingsBox = styled.div`
  padding: 0 108px;
  .userAvatar {
    margin-bottom: 32px;
    img {
      width: 160px;
      height: 160px;
      border-radius: 50%;
    }
    #file {
      display: none;
    }
  }
  .optionTitle {
    font-size: 24px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    color: #333333;
    margin-bottom: 32px;
  }
  .optionInput {
    margin-bottom: 48px;
    padding: 32px;
    width: 100%;
    height: 92px;
    border-radius: 20px;
    border: 1px solid #707070;
    font-size: 24px;
  }
  .saveButton {
    width: 240px;
    height: 60px;
    margin: auto;
    border-radius: 20px;
    background: #35caa9;
    color: #fff;
    font-size: 24px;
  }
`
const MyNftBox = styled.div``
const { TabPane } = Tabs
const MyTabs = styled(Tabs)`
  margin-top: 2rem;
`
export const ButtonBox = styled.div`
  margin-top: 20px;
  font-size: 20px;
  .cancel {
    width: 80px;
    height: 40px;
    margin-right: 20px;
    border: 1px solid #e5e5e5;
    line-height: 38px;
    border-radius: 20px;
    color: #5f5f5f;
    &:hover {
      background: #8cd8f8;
    }
  }
  .ok {
    width: 80px;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    color: #fff;
    background-color: #1fbb65;
    &:hover {
      background: #8cd8f8;
    }
  }
`
const TabPaneBox = styled(TabPane)`
  padding-top: 1rem;
  padding-bottom: 2rem;
`
const getHttp = (chain: any) => {
  if (chain === 'bsc') {
    return bschttp
  } else {
    return polygonhttp
  }
}
export const getContract = (library: Web3Provider | undefined, address: string, abi: any[]) => {
  if (!library) return null
  return new Contract(address, abi, library.getSigner())
}
export const fetchAbi = async (address: string, chain: any) => {
  if (!address) return
  try {
    let apiKey
    if (chain === 'bscscan') {
      apiKey = BSCSCAN_KEY
    } else if (chain === 'polygonscan') {
      apiKey = POLYGONSCAN_KEY
    }
    const data = await fetch(
      `https://api.${chain}.com/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`,
      {
        method: 'GET',
        mode: 'cors'
      }
    )
    const dataJson = await data.json()
    const { result } = dataJson

    localStorage.setItem(address.toLowerCase(), result)
    return result
  } catch (e: any) {
    console.log(e.message)
    return []
  }
}
export const MyPage = () => {
  const { account, chainId, library } = useActiveWeb3React()
  // const [UploadImg, setUploadImg] = useState(false)
  const [refreshBy, setrefreshBy] = useState(false)
  // const [recompute, setRecompute] = useState(false)
  const [showreward, setshowreward] = useState(false)
  const [rewardoptions, setrewardoptions] = useState(false)
  const [lending, setLending] = useState(false)
  const [showMyNFTModal, setShowMyNFTModal] = useState(false)
  const [showPostsContent, setShowPostsContent] = useState(false)
  const [showPostsReplayWindow, setShowPostsReplayWindow] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDeletePosts, setShowDeletePosts] = useState(false)
  const { username } = useParams() as any
  const [rewardItem, setrewardItem] = useState({} as any)
  const [postsItem, setPostsItem] = useState({} as any)
  const [NFTStatsMadalData, setNFTStatsMadalData] = useState({} as any)
  const [deletePostsItem, setDeletePostsItem] = useState({} as any)
  const [rewardinfo, setrewardinfo] = useState([] as any)
  const [userinfo, setUserinfo] = useState([] as any)
  const [userLikeInfo, setuserLikeInfo] = useState([] as any)
  const [PostsLike, setPostsLike] = useState([] as any)
  const [postsRewardData, setPostsRewardData] = useState([] as any)
  const [postsReplayData, setPostsReplayData] = useState([] as any)
  const [userinfoAll, setuserinfoAll] = useState([] as any)
  const [userPosts, setuserPosts] = useState([] as any)
  const [followeDataAll, setFolloweDataAll] = useState([] as any)
  const [reviewAllData, setReviewAllData] = useState([] as any)
  const [myReview, setMyRevie] = useState([] as any)
  const [myNFT, setMyNFT] = useState([] as any)
  const [RareAttribute, setRareAttribute] = useState([] as any)
  const [SpecificAttribute, setSpecificAttribute] = useState([] as any)
  const [showReplayWindow, setshowReplayWindow] = useState(-1)
  const [totaPoints, setTotaPoints] = useState(0)
  const [showTabs, setShowTabs] = useState('Posts')
  const [RewarType, setRewarType] = useState('CommentsRewar')
  const [rewardQuantity, setrewardQuantity] = useState('')
  const [replayWho, setreplayWho] = useState('')
  const [replayValue, setreplayValue] = useState('')
  const [description, setDescription] = useState('')
  const [TwitterValue, setTwitterValue] = useState('')
  const [DiscordValue, setDiscordValue] = useState('')
  const [TelegramValue, setTelegramValue] = useState('')
  const [UserNameValue, setUserNameValue] = useState('')
  const [Avatar, setAvatar] = useState('')
  const [rewardSelection, setrewardSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  const RewardContract = useRewardContract()
  const history = useHistory()
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false
  })
  useEffect(() => {
    getUserInfo()
    getNftData()
    getReviewData()
  }, [account, username, refreshBy])
  useEffect(() => {
    const RewardTimeArr = rewardinfo
      .filter((item: any) => {
        return item.fromaddress === account
      })
      .map((ele: any) => {
        return ele.createdAt.slice(0, 10)
      })
    const RewardIntegral = Integral(RewardTimeArr, 5, 5)
    const ReplayTimeData = reviewAllData
      .filter((item: any) => {
        return item.useraddress === account && item.SuperiorIndex
      })
      .map((ele: any) => {
        return ele.createdAt.slice(0, 10)
      })
    const ReplayIntegral = Integral(ReplayTimeData, 1, 5)
    const ReviewTimeData = myReview.map((ele: any) => {
      return ele.createdAt.slice(0, 10)
    })
    const ReviewIntegral = Integral(ReviewTimeData, 2, 5)
    const PostsTimeArr = userPosts.map((ele: any) => {
      return ele.createdAt.slice(0, 10)
    })
    const PostsIntegral = Integral(PostsTimeArr, 5, 2)
    const PostsRewardTimeArr = postsRewardData
      .filter((item: any) => {
        return item.fromaddress === account
      })
      .map((ele: any) => {
        return ele.createdAt.slice(0, 10)
      })
    const P0stsRewardIntegral = Integral(PostsRewardTimeArr, 5, 5)
    setTotaPoints(RewardIntegral + ReplayIntegral + ReviewIntegral + PostsIntegral + P0stsRewardIntegral)
  }, [reviewAllData, rewardinfo, myReview, userPosts])
  const fetchData = (data: any[], contract: any, chain: string) => {
    if (!data || !data.length) return []
    return data.map(async (item: any) => {
      const getdata = axios.create({
        timeout: 100000,
        headers: {
          'X-Api-Key': '60aee01eae2f89f6fb4b81177df15c8c'
        }
      })
      let contractIndex = contract.findIndex((i: any) => {
        return i.toLowerCase() === item.token_address.toLowerCase()
      })
      if (contractIndex >= 0) {
        contractIndex = contractIndex + 1
      } else {
        return
      }
      const gamelandId = fixDigitalId(contractIndex, item.token_id, account)
      item.gamelandNftId = hashMessage(gamelandId)
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
        console.log(error)
        item.metadata = JSON.parse(item.metadata)
      }
      return item
    })
  }
  const getUserInfo = async () => {
    if (!account) return
    const data = await bschttp.get(`v0/userinfo/${account}`)
    if (data.data.data.length) {
      setUserinfo(data.data.data[0])
    } else {
      history.push({
        pathname: `/createUser`
      })
    }
    bschttp.get(`v0/posts`).then((vals) => {
      const data = vals.data.data.filter((item: any) => {
        return item.useraddress === account
      })
      setuserPosts(data)
    })
    bschttp.get(`v0/userinfo`).then((vals) => setuserinfoAll(vals.data.data))
    bschttp.get(`v0/followe`).then((vals) => setFolloweDataAll(vals.data.data))
    bschttp.get(`v0/posts_like`).then((vals) => setPostsLike(vals.data.data))
    bschttp.get(`v0/posts_reward`).then((vals) => setPostsRewardData(vals.data.data))
    bschttp.get(`v0/posts_reply`).then((vals) => setPostsReplayData(vals.data.data))
    const BscLike = bschttp.get(`/v0/review_like/${account}`)
    const polygonLike = polygonhttp.get(`/v0/review_like/${account}`)
    Promise.all([BscLike, polygonLike]).then((vals) => {
      setuserLikeInfo([...vals[0].data.data, ...vals[1].data.data])
    })
  }
  const getNftData = async () => {
    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY
    const BscNft = await http.get(`https://deep-index.moralis.io/api/v2/${account}/nft?chain=bsc&format=decimal`)
    const polygonNft = await http.get(`
      https://deep-index.moralis.io/api/v2/${account}/nft?chain=polygon&format=decimal`)
    const filterDataBsc = BscNft.data.result.filter((item: any) => {
      return BscContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
    })
    const findDataBsc = fetchData(filterDataBsc, BscContract, 'bsc')
    const filterDataPolygon = polygonNft.data.result.filter((item: any) => {
      return PolygonContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
    })
    const findDataPolygon = fetchData(filterDataPolygon, PolygonContract, 'polygon')
    Promise.all([...findDataBsc, ...findDataPolygon]).then((vals) => {
      setMyNFT(vals)
    })
  }
  const getReviewData = async () => {
    const BscReview = bschttp.get('/v0/review')
    const PolygonReview = polygonhttp.get('/v0/review')
    const BscReward = bschttp.get(`/v0/review_reward`)
    const PolygonReward = polygonhttp.get(`/v0/review_reward`)
    Promise.all([BscReview, PolygonReview, BscReward, PolygonReward]).then((vals) => {
      const reviewData = [...vals[0].data.data, ...vals[1].data.data]
      setReviewAllData(reviewData)
      setrewardinfo([...vals[2].data.data, ...vals[3].data.data])
      const myReviewData = reviewData.filter((item) => {
        return item.useraddress === account && !item.SuperiorIndex
      })
      setMyRevie(myReviewData)
    })
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
    const data = reviewAllData.filter((ele: any) => {
      return ele.id === id
    })
    if (type === 'name') return data[0].username
    if (type === 'content') return data[0].context
    if (type === 'image') {
      const findData = userinfoAll.filter((val: any) => {
        return val.useraddress === data[0].useraddress
      })
      return findData[0]?.image ? findData[0].image : defaultImg
    }
  }
  const Integral = (arr: any, Base: number, limit: number) => {
    let total = 0
    Array.from(new Set(arr)).map((item: any) => {
      const filterArr = arr.filter((ele: any) => {
        return ele === item
      })
      if (filterArr.length > limit) {
        total += limit * Base
      } else {
        total += filterArr.length * Base
      }
    })
    return total
  }
  const getFollowe = (type: string) => {
    if (type === 'myFollowe') {
      const data = followeDataAll.filter((item: any) => {
        return item.useraddress === account
      })
      return data.length
    }
    if (type === 'FolloweMy') {
      const data = followeDataAll.filter((item: any) => {
        return item.followeUserAddress === account
      })
      return data.length
    }
  }
  const getUserImage = (useraddress: string) => {
    const findData = userinfoAll.filter((ele: any) => {
      return ele.useraddress === useraddress
    })
    if (findData.length) {
      return findData[0].image ? findData[0].image : defaultImg
    }
    return defaultImg
  }
  const cutoverTabs = (name: any) => {
    setShowTabs(name)
    setShowPostsContent(false)
  }
  const getReplayData = (id: any) => {
    const data = reviewAllData.filter((ele: any) => {
      return ele.SuperiorIndex === id
    })
    return data
  }
  const getPostsReplayData = (id: any) => {
    const data = postsReplayData.filter((ele: any) => {
      return ele.reviewid === id
    })
    return data
  }
  const isLike = (id: any) => {
    const Index = userLikeInfo.findIndex((item: any) => {
      return item.reviewid === id
    })
    if (Index >= 0) return 1
    return 0
  }
  const likeClick = async (item: any) => {
    if (item.useraddress.toLowerCase() === account?.toLowerCase()) return
    const Index = userLikeInfo.findIndex((ele: any) => {
      return ele.reviewid === item.id
    })
    if (Index >= 0) {
      const res: any = await getHttp(item.chain).delete(`/v0/review_like/${item.id}`)
      if (res.data.code === 1) {
        updateLikeTotal(item, 'delete')
      } else {
        throw res.message || res.data.message
      }
    } else {
      const params = {
        reviewid: item.id,
        useraddress: account
      }
      const res: any = await getHttp(item.chain).post(`/v0/review_like`, params)
      if (res.data.code === 1) {
        updateLikeTotal(item, 'add')
      } else {
        throw res.message || res.data.message
      }
    }
  }
  const handlePostsOtherDetails = (type: string) => {
    if (type === 'collectQuantity') {
      const quantity = PostsLike.filter((item: any) => {
        return item.collect === postsItem.id
      })
      return quantity.length
    }
    if (type === 'likeQuantity') {
      const quantity = PostsLike.filter((item: any) => {
        return item.reviewid === postsItem.id
      })
      return quantity.length
    }
    if (type === 'isLike') {
      const quantity = PostsLike.filter((item: any) => {
        return item.useraddress === account && item.reviewid === postsItem.id
      })
      return quantity
    }
    if (type === 'isCollect') {
      const quantity = PostsLike.filter((item: any) => {
        return item.useraddress === account && item.collect === postsItem.id
      })
      return quantity
    }
    if (type === 'BNBTotal') {
      const data = postsRewardData.filter((item: any) => {
        return item.reviewid === postsItem.id && item.paytype === 'BNB'
      })
      let Total = 0
      data.map((item: any) => {
        Total = Total + item.amount
      })
      return Total
    }
    if (type === 'MATICTotal') {
      const data = postsRewardData.filter((item: any) => {
        return item.reviewid === postsItem.id && item.paytype === 'MATIC'
      })
      let Total = 0
      data.map((item: any) => {
        Total = Total + item.amount
      })
      return Total
    }
    if (type === 'replayQuantity') {
      const quantity = postsReplayData.filter((item: any) => {
        return item.reviewid === postsItem.id
      })
      return quantity.length
    }
    return 0
  }
  const postsLike = async () => {
    return
  }
  const ShowDeletePostsDialog = (item: any) => {
    setDeletePostsItem(item)
    setShowDeletePosts(true)
  }
  const deletePosts = async (item: any) => {
    const res: any = await bschttp.delete(`v0/posts/${item.id}`)
    if (res.data.code === 1) {
      setrefreshBy(!refreshBy)
      setShowDeletePosts(false)
      toastify.success('succeed')
      location.reload()
    } else {
      throw res.message || res.data.message
    }
  }
  const postsCollect = async () => {
    return
  }
  const updateLikeTotal = async (item: any, type: any) => {
    let total
    if (type === 'delete') {
      total = item.likes - 1
    } else {
      total = item.likes + 1
    }
    console.log(type, total)
    const params = {
      likes: total
    }
    getHttp(item.chain)
      .put(`/v0/review/${item.id}`, params)
      .then(() => {
        toastify.success('succeed')
        setrefreshBy(!refreshBy)
      })
  }
  const showCommentsRewarDialog = (item: any) => {
    return
  }
  const sendRewar = async () => {
    if (!rewardQuantity || !library) return
    setLending(true)
    try {
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
        toaddress: rewardItem.useraddress,
        fromaddress: account,
        datetime: new Date().toJSON(),
        amount: rewardQuantity,
        paytype: rewardSelection
      }
      const res: any = await getHttp(rewardItem.chain).post(`/v0/review_reward/`, params)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setLending(false)
        setshowreward(false)
        setrefreshBy(!refreshBy)
      } else {
        setLending(false)
        throw res.message || res.data.message
      }
    } catch (error: any) {
      setLending(false)
      throw error.message || error.data.message
    }
  }
  const showPostsRewarDialog = () => {
    return
  }
  const postsRewar = async () => {
    if (!rewardQuantity || !library) return
    setLending(true)
    try {
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
        toaddress: rewardItem.useraddress,
        fromaddress: account,
        datetime: new Date().toJSON(),
        amount: rewardQuantity,
        paytype: rewardSelection
      }
      const res: any = await bschttp.post(`/v0/posts_reward/`, params)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setLending(false)
        setshowreward(false)
        setrefreshBy(!refreshBy)
      } else {
        setLending(false)
        throw res.message || res.data.message
      }
    } catch (error: any) {
      setLending(false)
      throw error.message || error.data.message
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
      userimage: userinfo.image,
      contractaddress: item.contractaddress,
      SuperiorIndex: item.id,
      datetime: new Date().toJSON(),
      username: userinfo.username,
      context: text
    }
    const res: any = await getHttp(item.chain).post(`/v0/review`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setreplayValue('')
      updateReplayTotal(item)
    }
  }
  const sendPostsReplay = async () => {
    if (!replayValue) return
    if (!replayWho) return
    let text
    if (replayWho) {
      text = replayWho + ':' + replayValue
    } else {
      text = replayValue
    }
    const params = {
      useraddress: account,
      reviewid: postsItem.id,
      username: userinfo.username,
      context: text
    }
    const res: any = await bschttp.post(`/v0/posts_reply`, params)
    if (res.data.code === 1) {
      setreplayValue('')
      setrefreshBy(!refreshBy)
      toastify.success('succeed')
    }
  }
  const updateReplayTotal = async (item: any) => {
    const total = item.reviews + 1
    const params = {
      reviews: total
    }
    getHttp(item.chain)
      .put(`/v0/review/${item.id}`, params)
      .then(() => setrefreshBy(!refreshBy))
  }
  const userAvatarClick = () => {
    const fileInput = document.getElementById('file')
    fileInput?.click()
  }
  const showNFTStatsMadal = (item: any) => {
    setNFTStatsMadalData(item)
    if (item.description) {
      setDescription(item.description)
    } else {
      setDescription(item.collection?.description)
    }
    if (item.attributes) {
      setRareAttribute(item.attributes)
    } else {
      setSpecificAttribute(item.properties)
      setRareAttribute(item.stats || item.levels)
    }
    setShowMyNFTModal(true)
  }
  const ReplayClick = (index: any) => {
    setshowReplayWindow(showReplayWindow === index ? -1 : index)
    setreplayWho(showReplayWindow === index ? '' : replayWho)
  }
  const postsReplayClick = () => {
    setShowPostsReplayWindow(!showPostsReplayWindow)
  }
  const SettingsClick = () => {
    setTwitterValue('')
    setDiscordValue('')
    setTelegramValue('')
    setUserNameValue('')
    setShowSettings(true)
  }
  const saveEditProfile = async () => {
    if (!TwitterValue && !DiscordValue && !TelegramValue && !UserNameValue && !Avatar) return
    const params: any = {}
    setLending(true)
    if (TwitterValue) {
      params.Twitter = TwitterValue
    }
    if (DiscordValue) {
      params.Discord = DiscordValue
    }
    if (TelegramValue) {
      params.Telegram = TelegramValue
    }
    if (UserNameValue) {
      params.username = UserNameValue
    }
    if (Avatar) {
      params.image = Avatar
    }
    // console.log(params)
    const res: any = await bschttp.put(`/v0/userinfo/${account}`, params)
    if (res.data.code === 1) {
      setShowSettings(false)
      setLending(false)
      setrefreshBy(!refreshBy)
      toastify.success('succeed')
    } else {
      toastify.error(res.message || res.data.message)
    }
  }
  const toWritePosts = (item: any) => {
    history.push({
      pathname: `/WritePosts`
    })
  }
  const ImgChange = async (e: any) => {
    // const Img = e.target.value
    const Img = e.target.files[0]
    const fileSize = Img.size
    const size = fileSize / 1024
    const type = Img.type
    if (size > 1024) {
      toastify.error('Image size cannot be larger than 1MB')
      return
    }
    const reader = new FileReader()
    reader.readAsArrayBuffer(Img)
    reader.onload = (res) => {
      // console.log(res.target?.result)
      const imgData = res.target?.result
      ImgTransaction(imgData, type)
    }
  }
  const ImgTransaction = async (datas: any, type: string) => {
    try {
      const transaction = await arweave.createTransaction({ data: datas })
      transaction.addTag('Content-Type', type)
      await arweave.transactions.sign(transaction, key)
      await arweave.transactions.post(transaction)
      if (transaction) {
        setAvatar(`https://arweave.net/${transaction.id}`)
      }
    } catch (err: any) {
      toastify.error(err)
    }
  }
  const PostsItemClick = async (item: any) => {
    history.push({
      pathname: `/PostsContent/${item.useraddress}/${item.id}`
    })
    if (item.useraddress.toLowerCase() === account?.toLowerCase()) return
    const params = {
      view: item.view + 1
    }
    const res: any = await bschttp.put(`/v0/posts/${item.id}`, params)
  }
  const handlerewardQuantityChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setrewardQuantity(val)
  }, [])
  const handlereplayChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setreplayValue(val)
  }, [])
  const userNameChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setUserNameValue(val)
  }, [])
  const TwitterChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setTwitterValue(val)
  }, [])
  const DiscordChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setDiscordValue(val)
  }, [])
  const TelegramChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setTelegramValue(val)
  }, [])

  return (
    <UserBox>
      <NFTStatsMadal
        visible={showMyNFTModal}
        data={NFTStatsMadalData}
        description={description}
        SpecificAttribute={SpecificAttribute}
        RareAttribute={RareAttribute}
      >
        <Close onClick={() => setShowMyNFTModal(false)}>close</Close>
      </NFTStatsMadal>
      <Modal
        destroyOnClose
        footer={null}
        onCancel={() => setShowSettings(false)}
        visible={showSettings}
        closable={false}
      >
        <SettingsBox>
          <h1 className="text-center">Edit profile</h1>
          <div className="userAvatar">
            <img src={Avatar || userinfo.image} onClick={userAvatarClick} />
            <input id="file" type="file" accept="image/png, image/jpeg" onChange={ImgChange} />
          </div>
          <div className="optionTitle">userAddress</div>
          <div className="optionInput">{account}</div>
          <div className="optionTitle">userName</div>
          <input
            className="optionInput"
            placeholder={userinfo?.username}
            type="text"
            value={UserNameValue}
            onChange={userNameChange}
          />
          <div className="optionTitle">Twitter</div>
          <input
            type="text"
            className="optionInput"
            placeholder={userinfo?.Twitter}
            value={TwitterValue}
            onChange={TwitterChange}
          />
          <div className="optionTitle">Discord</div>
          <input
            type="text"
            className="optionInput"
            placeholder={userinfo?.Discord}
            value={DiscordValue}
            onChange={DiscordChange}
          />
          <div className="optionTitle">Telegram</div>
          <input
            type="text"
            className="optionInput"
            placeholder={userinfo?.Telegram}
            value={TelegramValue}
            onChange={TelegramChange}
          />
          <div className="saveButton flex flex-center cursor" onClick={saveEditProfile}>
            save
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
        </SettingsBox>
      </Modal>
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
                className="flex flex-v-center"
              >
                <img src={BNBIcon} className="icon" />
                BNB
              </div>
              <div
                onClick={() => {
                  setrewardSelection('MATIC')
                  setrewardoptions(false)
                }}
                className="flex flex-v-center"
              >
                <img src={polygonIcon} className="icon" />
                MATIC
              </div>
            </div>
          ) : (
            ''
          )}
          <div
            className={rewardQuantity ? 'button ture' : 'button false'}
            onClick={RewarType === 'CommentsRewar' ? sendRewar : postsRewar}
          >
            Send
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
        </SendBox>
      </Dialog>
      <Dialog
        footer={null}
        onCancel={() => setShowDeletePosts(false)}
        visible={showDeletePosts}
        destroyOnClose
        closable={false}
      >
        <SendBox>
          <div className="title">Tips</div>
          <p className="text-center">
            Delete this article, your G Point will be recalculated at the same time, Do you want to delete it?
          </p>
          <ButtonBox className="flex flex-justify-content">
            <div className="cancel text-center cursor" onClick={() => setShowDeletePosts(false)}>
              Cancel
            </div>
            <div className="ok text-center cursor" onClick={() => deletePosts(deletePostsItem)}>
              OK
            </div>
          </ButtonBox>
        </SendBox>
      </Dialog>
      <div className="topBackground"></div>
      <UserInfo className="flex">
        <InfoLeft>
          <img src={userinfo.image || defaultImg} className="avatar" />
          <div className="userName text-center">{userinfo.username}</div>
          <div className="useraddress text-center">{formatting(userinfo.useraddress || '0x000', 4)}</div>
          <div className="socialize flex flex-justify-content">
            <a href={userinfo.Twitter} target="_blank" rel="noreferrer">
              <img src={twitter} className={userinfo.Twitter ? '' : 'transparency'} />
            </a>
            <a href={userinfo.Discord} target="_blank" rel="noreferrer">
              <img src={discord} className={userinfo.Discord ? '' : 'transparency'} />
            </a>
            <a href={userinfo.Telegram} target="_blank" rel="noreferrer">
              <img src={Telegram} className={userinfo.Telegram ? '' : 'transparency'} />
            </a>
          </div>
          <div className="settings flex flex-justify-content">
            <span className="cursor" onClick={SettingsClick}>
              Edit profile
            </span>
          </div>
          <div className="followInfo flex">
            <div className="Following">
              <div className="quantity text-center">{getFollowe('myFollowe')}</div>
              <div className="text-center">Following</div>
            </div>
            <div className="delimiter"></div>
            <div className="Following">
              <div className="quantity text-center">{getFollowe('FolloweMy')}</div>
              <div className="text-center">Followers</div>
            </div>
          </div>
          <div className="followInfo flex">
            <div className="Following quantity flex flex-center">
              {totaPoints}&nbsp;
              <img className="Icon" src={integralIcon} />
            </div>
            <div className="delimiter"></div>
          </div>
        </InfoLeft>
        <div className="boxDivider"></div>
        <InfoRight>
          <div className="Tabs flex">
            <div className={showTabs === 'Posts' ? 'blueBg' : ''} onClick={() => cutoverTabs('Posts')}>
              <img src={tabsIconPosts} />
              &nbsp;&nbsp;Posts
            </div>
            <div className={showTabs === 'Comments' ? 'blueBg' : ''} onClick={() => cutoverTabs('Comments')}>
              <img src={tabsIconComment} />
              &nbsp;&nbsp;Comments
              <span>{myReview.length}</span>
            </div>
            <div className={showTabs === 'NFTs' ? 'blueBg' : ''} onClick={() => cutoverTabs('NFTs')}>
              <img src={tabsIconNFT} />
              &nbsp;&nbsp;NFTs
            </div>
          </div>
          <div className="horizontalDividing"></div>
          {showTabs === 'Comments'
            ? myReview.length && myReview
              ? myReview.map((item: any, index: any) => (
                  <CommentsBox key={index}>
                    <div className="CommentItem">
                      <div className="userInfo flex">
                        <img src={userinfo.image || defaultImg} className="userImage" alt="" />
                        <div className="name">{userinfo.username}</div>
                        <div className="contractName">{item.contractName}</div>
                        <div className="time">{getTime(item.datetime)}</div>
                      </div>
                      {item.NFTData ? (
                        <div className="CommentNFTBox" onClick={() => showNFTStatsMadal(JSON.parse(item.NFTData))}>
                          <img src={JSON.parse(item.NFTData)?.image || JSON.parse(item.NFTData)?.imageUrl} />
                          <div className="CommentNFTname">{JSON.parse(item.NFTData)?.name}</div>
                        </div>
                      ) : (
                        ''
                      )}
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
                      <div className="otherDetails flex">
                        <div className="repost flex flex-v-center">
                          <img
                            src={repost}
                            className={item.useraddress.toLowerCase() === account?.toLowerCase() ? '' : 'cursor'}
                          />
                          <div className="quantity">{item.forwards || 0}</div>
                        </div>
                        <div className="Reply flex flex-v-center">
                          <img
                            src={Reply}
                            onClick={() => ReplayClick(index)}
                            className={item.useraddress.toLowerCase() === account?.toLowerCase() ? '' : 'cursor'}
                          />
                          <div className="quantity">{item.reviews || 0}</div>
                        </div>
                        <div className="like flex flex-v-center">
                          <img
                            src={isLike(item.id) ? liketrue : likefalse}
                            onClick={() => likeClick(item)}
                            className={item.useraddress.toLowerCase() === account?.toLowerCase() ? '' : 'cursor'}
                          />
                          <div className="quantity">{item.likes || 0}</div>
                        </div>
                        <div className="reward flex flex-v-center">
                          <img
                            className={item.useraddress.toLowerCase() === account?.toLowerCase() ? '' : 'cursor'}
                            src={reward}
                            onClick={() => showCommentsRewarDialog(item)}
                          />
                          <div className="rewardTotal">
                            <p>{getRewardTotal(item.id)[0]} BNB</p>
                            <p>{getRewardTotal(item.id)[1]} MATIC</p>
                          </div>
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
                                <img src={getUserImage(ele.useraddress)} className="userImage" alt="" /> &nbsp;
                                {ele.username}
                                <div className="replyContent">{ele.context}</div>
                              </div>
                            ))
                          ) : (
                            <div>No reply yet</div>
                          )}
                          <div className="replayInput">
                            <div className="replayWho" onClick={() => setreplayWho('')}>
                              {replayWho}
                            </div>
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
                  </CommentsBox>
                ))
              : ''
            : ''}
          {showTabs === 'NFTs' ? (
            <MyTabs defaultActiveKey="1">
              <TabPaneBox tab={<span className="clearGap">Profiles</span>} key="1">
                <CollectionToken NFT={myNFT} user={userinfo.useraddress}></CollectionToken>
              </TabPaneBox>
              <TabPaneBox tab={<span className="clearGap">My Renting</span>} key="2">
                <MyRenting />
              </TabPaneBox>
            </MyTabs>
          ) : (
            ''
          )}
          {showTabs === 'Posts' ? (
            <PostsBox>
              {showPostsContent ? (
                <PostsContent>
                  <div className="user">
                    <img src={userinfo.image || defaultImg} alt="" />
                    &nbsp;&nbsp;{userinfo.username}
                  </div>
                  <div className="gameName">{postsItem.contractName}</div>
                  <div className="time">
                    {postsItem.view} view · {getTime(postsItem.createdAt)}
                  </div>
                  <div className="postsTitle text-center">{postsItem.title}</div>
                  {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
                  <div id="postsContent" className="postsContent"></div>
                  <div className="otherDetails flex">
                    <div className="like flex flex-v-center">
                      <img
                        src={handlePostsOtherDetails('isLike').length ? liketrue : likefalse}
                        className=""
                        onClick={postsLike}
                      />
                      <div className="quantity">{handlePostsOtherDetails('likeQuantity')}</div>
                    </div>
                    <div className="repost flex flex-v-center">
                      <img
                        src={handlePostsOtherDetails('isCollect').length ? collecttrue : collectfalse}
                        className=""
                        onClick={postsCollect}
                      />
                      <div className="quantity">{handlePostsOtherDetails('collectQuantity')}</div>
                    </div>
                    <div className="Reply cursor flex flex-v-center">
                      <img src={Reply} onClick={postsReplayClick} />
                      <div className="quantity">{handlePostsOtherDetails('replayQuantity')}</div>
                    </div>
                    <div className="reward">
                      <img className="" src={reward} onClick={showPostsRewarDialog} />
                      <div className="rewardTotal">
                        <p>{handlePostsOtherDetails('BNBTotal')} BNB</p>
                        <p>{handlePostsOtherDetails('MATICTotal')} MATIC</p>
                      </div>
                    </div>
                  </div>
                  {showPostsReplayWindow ? (
                    <div className="replyWindow">
                      {getPostsReplayData(postsItem.id).length ? (
                        getPostsReplayData(postsItem.id).map((ele: any, index: any) => (
                          <div
                            className="replyDetails cursor"
                            key={index}
                            onClick={() => setreplayWho('@' + ele.username)}
                          >
                            <img src={getUserImage(ele.useraddress)} className="userImage" alt="" /> &nbsp;
                            {ele.username}
                            <div className="replyContent">{ele.context}</div>
                          </div>
                        ))
                      ) : (
                        <div>No reply yet</div>
                      )}
                      <div className="replayInput">
                        <div className="replayWho" onClick={() => setreplayWho('')}>
                          {replayWho}
                        </div>
                        <textarea
                          rows={5}
                          cols={70}
                          placeholder=""
                          value={replayValue}
                          onChange={handlereplayChange}
                        ></textarea>
                      </div>
                      <div className="sendReplay" onClick={sendPostsReplay}>
                        send
                      </div>
                      <div className="bottomBorder"></div>
                    </div>
                  ) : (
                    ''
                  )}
                </PostsContent>
              ) : (
                <div>
                  {userPosts && userPosts.length ? (
                    userPosts.map((item: any, index: any) => (
                      <PostsList key={index}>
                        <img className="deleteIcon" src={deleteIcon} onClick={() => ShowDeletePostsDialog(item)} />
                        <PostsItem className="flex flex-h-between cursor" onClick={() => PostsItemClick(item)}>
                          <div className="title">{item.title}</div>
                          <div className="gameName">{item.contractName}</div>
                          <div className="view">
                            {item.view} view · {getTime(item.createdAt)}
                          </div>
                        </PostsItem>
                      </PostsList>
                    ))
                  ) : (
                    <div>no content yet</div>
                  )}
                  <div className="WriteButton text-center" onClick={toWritePosts}>
                    Write
                  </div>
                </div>
              )}
            </PostsBox>
          ) : (
            ''
          )}
        </InfoRight>
      </UserInfo>
    </UserBox>
  )
}
