// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { parseEther } from '@ethersproject/units'
import { useHistory } from 'react-router-dom'
import { Row, Col, Button, message, Upload } from 'antd'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import type { UploadChangeParam } from 'antd/es/upload'
import { divide, isEmpty, keys } from 'lodash'
import BigNumber from 'bignumber.js'
import { lowerCase } from 'lower-case'
import axios from 'axios'
import { useLocation, useParams } from 'react-router-dom'
import { hashMessage } from 'ethers/lib/utils'
import styled from 'styled-components'
import { POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL, BSC_CHAIN_ID_HEX, BSC_RPC_URL } from '../constants'
import {
  useActiveWeb3React,
  useStore,
  useControlContract,
  useAssetContract,
  useERC20Contract,
  useRewardContract
} from '../hooks'
import { useFetchMyNfts } from '../hooks/useFetchMyNfts'
import { handleClick } from './Header'
import { fetchReceipt, fixDigitalId, formatAddress, ZeroAddress, ChainCurrencyName, formatting } from '../utils'
import { ABIs } from '../constants/Abis/ABIs'
import {
  MORALIS_KEY,
  BscContract,
  PolygonContract,
  BSCAssetContractAddress,
  POLYGONAssetContractAddress,
  BSCControlContractAddress,
  POLYGONControlContractAddress,
  OPENSEA_URL
} from '../constants'
import { toastify } from './Toastify'
import { Operate } from './RentCard'
import { Img } from './Img'
import { Dialog } from '../components/Dialog'
import { Modal } from '../components/Modal'
import { Dlist } from '../pages/Lend'
import { ContentBox } from '../pages/Rent'
import { Nft as NftCard } from '../components/Nft'
import { Loading } from '../components/Loading'
import { NumInput } from '../components/NumInput'
import { NFTStatsMadal } from './NFTStatsMadal'
import { ScoreStatistics } from './ScoreStatistics'
import { Icon } from '../components/Icon'
import { bschttp, polygonhttp, http } from './Store'
import { Close } from './UserPage'
import { ImgBox, Title, SpanLabel, Tips, Properties, StatsBox, Description, FakeButton, Details } from '../pages/Rent'
import { getContract, fetchAbi, SendBox } from '../pages/Dashboard'
import twitter from '../assets/icon_twitter.svg'
import discord from '../assets/icon_discord.svg'
import loadding from '../assets/loading.svg'
import gameland from '../assets/network.svg'
import add from '../assets/icon_add.png'
import defaultImg from '../assets/default.png'
import defaultStar from '../assets/icon_review_star_default.svg'
import scoreStar from '../assets/icon_score_star.svg'
import arrow from '../assets/icon_select.svg'
import repost from '../assets/icon_repost.svg'
import Reply from '../assets/icon_reply.svg'
import likefalse from '../assets/icon_like_default_comments.svg'
import liketrue from '../assets/icon_like_click_comments.svg'
import reward from '../assets/icon_reward.svg'
import polygonIcon from '../assets/polygon_icon.svg'
import BNBIcon from '../assets/bnb.svg'
// import { Return } from './RentingCard'
// import deepHash from 'arweave/node/lib/deepHash'
// import ArweaveBundles from 'arweave-bundles'
import { ArweaveWebWallet } from 'arweave-wallet-connector'
import Arweave from 'arweave'
import key from '../constants/arweave-keyfile.json'

const DetailsBox = styled.div`
  display: flex;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 10px;
  margin-top: 5px;
  .collection {
    width: 65.5%;
    overflow: auto;
    border-right: 1px solid #e5e5e5;
    .info {
      .top {
        display: flex;
        .logo {
          border-radius: 10px;
        }
        .name {
          font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
          font-weight: bold;
          color: #333333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .attributesLabel {
          display: flex;
          div {
            padding: 6px;
            background: #d2f2fe;
            border-radius: 8px 8px 8px 8px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #41acef;
            margin-right: 12px;
          }
        }
        .ranting {
          margin-left: 40px;
          .title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #333333;
            .fraction {
              font-size: 16px;
              font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
              color: #999999;
              b {
                font-size: 28px;
                font-family: DIN-Bold, DIN;
                color: #35caa9;
              }
            }
          }
        }
      }
      .describe {
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        color: #333333;
      }
      .nftBox {
        display: flex;
        flex-wrap: wrap;
        .paginationBox {
          width: 100%;
          margin-top: 30px;
          font-size: 18px;
          .More {
            width: 120px;
            height: 40px;
            border: 1px solid #35caa9;
            border-radius: 10px;
            color: #35caa9;
            .loadding {
              width: 30px;
              height: 30px;
            }
          }
        }
      }
    }
  }
  .comment {
    width: 34.5%;
    overflow: auto;
    .user {
      display: flex;
      .userName {
        font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
        font-weight: bold;
        color: #333333;
        margin-left: 10px;
      }
    }
    .borders {
      height: 0;
      border: 1px solid #e5e5e5;
      margin: 0 0 12px;
    }
    .ranting {
      .tips {
        font-size: 18px;
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        color: #333333;
      }
      .star {
        display: flex;
        .defaultStar {
          background-image: url(${defaultStar});
        }
        .scoreStar {
          background-image: url(${scoreStar});
        }
      }
      .commentaryInput {
        width: 94%;
        margin-top: 24px;
        font-size: 18px;
        box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
        border-radius: 10px;
        textarea {
          width: 100%;
          height: 100px;
          resize: none;
          border: 0;
          outline: 0;
          border-radius: 10px;
          padding-left: 10px;
        }
        .forward {
          width: 90%;
          height: 120px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          margin: 0 0 0 5%;
          padding: 16px;
          .userImage {
            width: 48px;
            height: 48px;
            border-radius: 24px;
          }
          .CommentContent {
            font-size: 16px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #333333;
            margin-top: 16px;
          }
        }
        .addCommentNFT {
          width: 70px;
          height: 70px;
          opacity: 0.6;
        }
        .CommentNFTBox {
          img {
            width: 106px;
            height: 106px;
          }
          .CommentNFTname {
            font-size: 14px;
          }
        }
      }
      .button {
        margin: 24px 0 0 300px;
        width: 160px;
        height: 40px;
        background: #35caa9;
        border-radius: 20px;
        text-align: center;
        line-height: 40px;
        color: #fff;
        margin-bottom: 12px;
        cursor: pointer;
      }
    }
    .title {
      font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
      font-weight: bold;
      color: #333333;
    }
    .exhibit {
      .CommentItem {
        .userInfo {
          display: flex;
          margin-top: 36px;
          .userImage {
            width: 48px;
            height: 48px;
            border-radius: 24px;
          }
          .starName {
            margin-left: 16px;
            .name {
              width: 120px;
              font-size: 18px;
              font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
              color: #333333;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .star {
              display: flex;
              .defaultStar {
                width: 16px;
                height: 16px;
                background-image: url(${defaultStar});
                background-size: 16px;
                margin-right: 8px;
              }
              .scoreStar {
                width: 16px;
                height: 16px;
                background-image: url(${scoreStar});
                background-size: 16px;
                margin-right: 8px;
              }
            }
          }
          .time {
            margin-left: 200px;
            font-size: 16px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #d0d0d0;
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
          font-size: 16px;
          font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
          color: #333333;
          margin: 16px 0;
          padding-right: 50px;
        }
        .forward {
          width: 90%;
          height: 120px;
          border: 1px solid #e5e5e5;
          background: #f8f8f8;
          border-radius: 10px;
          padding: 16px;
          .userImage {
            width: 48px;
            height: 48px;
            border-radius: 24px;
          }
          .CommentContent {
            font-size: 16px;
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
            margin-right: 34px;
            img {
              width: 24px;
              height: 24px;
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
            .rewardTotal {
              width: 100px;
              flex-wrap: wrap;
              position: absolute;
              top: -12px;
              margin: 0;
              p {
                width: 100px;
                margin-bottom: 0px;
              }
            }
          }
        }
        .bottomBorder {
          height: 0px;
          border: 1px solid #e5e5e5;
          margin-top: 24px;
        }
      }
      .seeMore {
        margin: 16px 0;
        font-size: 18px;
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        color: #208ddf;
      }
    }
  }
  @media screen and (min-width: 1440px) {
    width: 1312px;
    height: 630px;
    .collection {
      .top {
        padding: 28px;
        .logo {
          width: 134px;
          height: 134px;
          margin-right: 20px;
        }
        .name {
          width: 255px;
          font-size: 24px;
        }
        .attributesLabel {
          margin-top: 10px;
          div {
            font-size: 14px;
          }
        }
        .support {
          margin-top: 18px;
          img {
            width: 24px;
            height: 24px;
            margin-right: 16px;
          }
        }
      }
      .describe {
        font-size: 18px;
        padding: 30px;
      }
      .nftBox {
        padding: 28px;
      }
    }
    .comment {
      padding: 20px 0 0 20px;
      .user {
        margin: 0 0 0px 0;
        .userImage {
          width: 65px;
          height: 65px;
          border-radius: 20px;
        }
        .userName {
          font-size: 28px;
          line-height: 90px;
        }
      }
      .borders {
        width: 390px;
      }
      .ranting {
        .tips {
          font-size: 16px;
        }
        .star {
          margin-top: 16px;
          div {
            width: 36px;
            height: 36px;
            margin-right: 24px;
            cursor: pointer;
          }
          .defaultStar {
            background-size: 36px;
          }
          .scoreStar {
            background-size: 36px;
          }
        }
        .button {
          margin: 16px 0 0 230px;
        }
      }
      .title {
        font-size: 18px;
      }
      .exhibit {
        .CommentItem {
          .userInfo {
            .time {
              margin-left: 100px;
            }
          }
          .otherDetails {
            div {
              margin-right: 24px;
            }
            .reward {
              .rewardTotal {
                right: 0px;
              }
            }
          }
          .bottomBorder {
            width: 390px;
          }
        }
      }
    }
  }
  @media screen and (min-width: 1920px) {
    width: 1600px;
    height: 890px;
    .collection {
      .top {
        padding: 40px;
        .logo {
          width: 164px;
          height: 164px;
          margin-right: 40px;
        }
        .name {
          width: 310px;
          font-size: 28px;
        }
        .attributesLabel {
          margin-top: 20px;
          div {
            font-size: 18px;
          }
        }
        .support {
          margin-top: 26px;
          img {
            width: 32px;
            height: 32px;
            margin-right: 24px;
          }
        }
      }
      .describe {
        padding: 50px;
        font-size: 24px;
      }
      .nftBox {
        padding: 30px;
      }
    }
    .comment {
      padding: 50px 0 0 40px;
      .user {
        margin: 0 0 24px 0;
        .userImage {
          width: 80px;
          height: 80px;
          border-radius: 20px;
        }
        .userName {
          font-size: 36px;
          line-height: 80px;
        }
      }
      .borders {
        width: 460px;
      }
      .ranting {
        .tips {
          font-size: 18px;
        }
        .star {
          margin-top: 24px;
          div {
            width: 48px;
            height: 48px;
            margin-right: 32px;
            cursor: pointer;
          }
          .defaultStar {
            background-size: 48px;
          }
          .scoreStar {
            background-size: 48px;
          }
        }
        .button {
          margin: 24px 0 0 300px;
        }
      }
      .title {
        font-size: 24px;
      }
      .exhibit {
        .CommentItem {
          .userInfo {
            .time {
              margin-left: 200px;
            }
          }
          .otherDetails {
            div {
              margin-right: 34px;
            }
            .reward {
              .rewardTotal {
                right: 15px;
              }
            }
          }
          .bottomBorder {
            width: 460px;
          }
        }
      }
    }
  }
`
const RentDlist = styled.div`
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 24px;
  border-radius: 20px 20px 20px 20px;
  border: 1px solid #e5e5e5;
  padding: 1rem 2rem;
  @media screen and (min-width: 1440px) {
    height: 44%;
  }
  @media screen and (min-width: 1920px) {
    margin-top: 32px;
    height: 280px;
  }
  div {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
  }
`
const Standard = styled.div`
  color: #d0d0d0;
  font-size: 14px;
  margin-bottom: 0.5rem;
`
const CardBox = styled.div<{ isLending?: boolean; have: number }>`
  position: relative;
  background: #fff;
  margin: 12px 10px;
  border: 1px solid #ddd;
  cursor: ${({ isLending, have }) => (isLending || have ? ' pointer' : 'not-allowed')};
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;

  @media screen and (min-width: 1152px) {
    width: 180px;
  }
  @media screen and (min-width: 1440px) {
    width: 240px;
    min-height: 360px;
  }
  @media screen and (min-width: 1920px) {
    width: 300px;
    min-height: 400px;
  }
  &:hover {
    transform: translateY(-1%);
  }
`
const MyNFTCardBox = styled.div`
  position: relative;
  background: #fff;
  margin: 12px 10px;
  border: 1px solid #ddd;
  cursor: pointer;
  border-radius: 1rem;
  @media screen and (min-width: 1440px) {
    width: 180px;
    min-height: 300px;
  }
  @media screen and (min-width: 1920px) {
    width: 211px;
    min-height: 320px;
  }
  &:hover {
    transform: translateY(-1%);
    .attributesBox {
      opacity: 1;
    }
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
const FakeButtons = styled.div`
  position: absolute;
  bottom: 8px;
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
`
const NFTname = styled.p`
  display: block;
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
export const MyNFTBox = styled.div`
  width: 420px;
  min-height: 200px;
  @media screen and (min-width: 1440px) {
    width: 400px;
  }
  @media screen and (min-width: 1920px) {
    width: 462px;
  }
`
export const CommentNFTButton = styled.div`
  margin-top: 20px;
  div {
    width: 160px;
    height: 40px;
    border: 1px solid #35caa9;
    border-radius: 20px;
    color: #35caa9;
    text-align: center;
    line-height: 40px;
    margin-right: 20px;
    cursor: pointer;
    &:hover {
      background: #35caa9;
      color: #fff;
    }
  }
`
export interface CardProps {
  onClick?: () => void
  onLend: () => void
  onSend: () => void
  isLending?: boolean
  pay_type: string
  name: string
  nftId: string
  isExpired?: boolean
  right?: boolean
  contract_type: string
  img: string
  have: number
}
interface MyNFTCardProps {
  onClick?: () => void
  pay_type: string
  name: string
  nftId: string
  contract_type: string
  img: string
  item: any
}
interface LabelProps {
  name: string
  type: any
}
const Labels: React.FC<LabelProps> = ({ name, type }) => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <NFTname>{name}</NFTname>
      <Standard>{type}</Standard>
    </div>
  )
}
const Card: React.FC<CardProps> = ({ img, have, name, onClick, isLending, contract_type, onLend, onSend }) => {
  const { networkError } = useStore()
  const handleClick = () => {
    if (networkError) {
      toastify.error('Please connect to valid network.')
      return
    }
    onClick && onClick()
  }
  const Click = () => {
    console.log('')
  }
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
    <CardBox
      className="flex flex-column-between flex-column"
      have={have}
      isLending={isLending}
      onClick={isLending ? handleClick : Click}
    >
      {src === '.mp4' || src === 'webm' ? (
        <video
          width="238"
          height="238"
          muted
          autoPlay={true}
          loop
          role="application"
          preload="auto"
          webkit-playsinline="true"
          src={img}
        ></video>
      ) : (
        <Img src={img} alt={name} />
      )}
      <CardDetails className="flex flex-h-between">
        <div>
          <Labels name={name} type={contract_type} />
        </div>
      </CardDetails>
      <Operate isLending={isLending} />
      {have ? (
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
export const MyNFTCard: React.FC<MyNFTCardProps> = ({ img, name, onClick, contract_type, item }) => {
  const { networkError } = useStore()
  const handleClick = () => {
    if (networkError) {
      toastify.error('Please connect to valid network.')
      return
    }
    onClick && onClick()
  }
  const src = img?.slice(-4)
  return (
    <MyNFTCardBox className="flex flex-column-between flex-column" onClick={handleClick}>
      {src === '.mp4' || src === 'webm' ? (
        <video
          width="238"
          height="238"
          muted
          autoPlay={true}
          loop
          role="application"
          preload="auto"
          webkit-playsinline="true"
          src={img}
        ></video>
      ) : (
        <Img src={img} alt={name} />
      )}
      <CardDetails className="flex flex-h-between">
        <div>
          <Labels name={name} type={contract_type} />
        </div>
      </CardDetails>
    </MyNFTCardBox>
  )
}

export const getTime = (time: any) => {
  const year = new Date(time).getFullYear()
  const month = new Date(time).getMonth()
  const date = new Date(time).getDate()
  const jetLag = new Date().getTime() - new Date(time).getTime()
  if (jetLag <= 60000) {
    return Math.floor(jetLag / 1000) + ' s ago'
  } else if (jetLag <= 3600000) {
    return Math.floor(jetLag / 60000) + ' min ago'
  } else if (jetLag <= 86400000) {
    return Math.floor(jetLag / 3600000) + ' hour ago'
  } else if (jetLag > 259200000) {
    return `${month + 1}/${date}/${year}`
  } else {
    return Math.floor(jetLag / 86400000) + ' day ago'
  }
}
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
export const compareTime = () => {
  return function (obj1: any, obj2: any) {
    const val1 = new Date(obj1.datetime).getTime()
    const val2 = new Date(obj2.datetime).getTime()
    if (Number(val1) < Number(val2)) {
      return 1
    } else if (Number(val1) > Number(val2)) {
      return -1
    } else {
      return 0
    }
  }
}
export const getLabelArr = (item: any) => {
  const arr = item?.split(',')
  if (!arr) return []
  return arr
}
export const CollectionDetails = () => {
  const { account, library, chainId } = useActiveWeb3React()
  const { data: _myNfts, mutate: mutateMyNfts } = useFetchMyNfts()
  const ERC20Contract = useERC20Contract()
  const ControlContract = useControlContract()
  const AssetContract = useAssetContract()
  const RewardContract = useRewardContract()
  const [starScore, setstarScore] = useState(0)
  const [nextCursor, setnextCursor] = useState('')
  const [username, setusername] = useState('')
  const [textareaValue, settextareaValue] = useState('')
  const [userinfo, setUserinfo] = useState([] as any)
  const [userScoreinfo, setUserScoreinfo] = useState([] as any)
  const [Collectionscoreinfo, setCollectionScoreinfo] = useState([] as any)
  const [revieweinfo, setrevieweinfo] = useState([] as any)
  const [userLikeInfo, setuserLikeInfo] = useState([] as any)
  const [collectionDetails, setcollectionDetails] = useState([] as any)
  const [rewardinfo, setrewardinfo] = useState([] as any)
  const [userinfoAll, setuserinfoAll] = useState([] as any)
  const [myNFTdata, setMyNFTdata] = useState([] as any)
  const [clickStatus, setclickStatus] = useState(false)
  const [visible, setVisible] = useState(false)
  const [lendvisible, setlendVisible] = useState(false)
  const [expired, setExpired] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [awaiting, setAwaiting] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [showSetUp, setshowSetUp] = useState(false)
  const [UserSettings, setUserSettings] = useState(false)
  const [showreward, setshowreward] = useState(false)
  const [rewardItem, setrewardItem] = useState({} as any)
  const [toAddress, setToAddress] = useState('')
  const [rewardQuantity, setrewardQuantity] = useState('')
  const [withdrawable, setWithdrawable] = useState(false)
  const [penalty, setPenalty] = useState('')
  const [price, setPrice] = useState('')
  const [days, setdays] = useState('')
  const [collateral, setCollateral] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(false)
  const [rewardoptions, setrewardoptions] = useState(false)
  const [UploadImg, setUploadImg] = useState(false)
  const [approving, setApproving] = useState(false)
  const [scoreDialog, setscoreDialog] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const [rentprompt, setrentPrompt] = useState(false)
  const [lending, setLending] = useState(false)
  const [showMyNFTBox, setShowMyNFTBox] = useState(false)
  const [showMyNFTModal, setShowMyNFTModal] = useState(false)
  const [LeaseDays, setLeaseDays] = useState('')
  const [forward, setForward] = useState({} as any)
  const [renting, setRenting] = useState(false)
  const [refreshBy, setrefreshBy] = useState(false)
  const [currentSelection, setCurrentSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  const [rewardSelection, setrewardSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  const [currentItem, setCurrentItem] = useState({} as any)
  const [RareAttribute, setRareAttribute] = useState([] as any)
  const [SpecificAttribute, setSpecificAttribute] = useState([] as any)
  const [description, setDescription] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [NFTStatsMadalType, setNFTStatsMadalType] = useState('')
  const [nftData, setnftData] = useState([] as any)
  const [DataAll, setDataAll] = useState([] as any)
  const [commentNFTItem, setCommentNFTItem] = useState({} as any)
  const [NFTStatsMadalData, setNFTStatsMadalData] = useState({} as any)
  const { state } = useLocation() as any
  const { contractName } = useParams() as any
  const history = useHistory()
  // const bundlr = new Bundlr('http://node1.bundlr.network', 'arweave', key)
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false
  })
  let http2: any
  let AssetContractAddress: any
  let ControlContractAddress: any
  let address: any
  let chain: any
  let contracts: any
  if (state) {
    address = state.address
    chain = state.chain
  } else {
    address = localStorage.getItem('address')
    chain = localStorage.getItem('chain')
  }
  if (chain === 'bsc') {
    http2 = bschttp
    AssetContractAddress = BSCAssetContractAddress
    ControlContractAddress = BSCControlContractAddress
    contracts = BscContract
  } else if (chain === 'polygon') {
    http2 = polygonhttp
    AssetContractAddress = POLYGONAssetContractAddress
    ControlContractAddress = POLYGONControlContractAddress
    contracts = PolygonContract
  }
  const fetchMetadata = (data: any[]) => {
    if (!data || !data.length) {
      return []
    }
    const getdata = axios.create({
      timeout: 10000,
      headers: {
        'X-Api-Key': '60aee01eae2f89f6fb4b81177df15c8c'
      }
    })
    return data.map(async (item) => {
      if (item.token_uri) {
        try {
          const data = await fetch(item.token_uri, {
            method: 'GET',
            mode: 'no-cors'
          })
          const dataJson = await data.json()
          // console.log(dataJson)
          item.metadata = dataJson
        } catch (error) {
          try {
            const { data } = await http.get(item.token_uri)
            item.metadata = data
          } catch (error) {
            item.metadata = JSON.parse(item.metadata)
          }
          // console.log(JSON.parse(data.data.metadata_json))
        }
      } else {
        item.metadata = JSON.parse(item.metadata)
      }
      return item
    })
  }
  const getCollectionInfo = async () => {
    if (!account) return
    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY
    const myNft = http.get(`
      https://deep-index.moralis.io/api/v2/${account}/nft?chain=${chain}&format=decimal&token_addresses=${address}
    `)
    const nftCollection = http.get(`
      https://deep-index.moralis.io/api/v2/nft/${address}?chain=${chain}&format=decimal&limit=30
    `)
    const rantData = http2.get(`v0/opensea/${address}`)
    const Details = await http2.get(`v0/games/${address}`)
    Promise.all([myNft, nftCollection, rantData]).then((vals) => {
      setnextCursor(vals[1].data.cursor)
      setMyNFTdata(vals[0].data.result)
      const data = [...vals[0].data.result, ...vals[2].data.data, ...vals[1]?.data.result]
      data.map(async (item) => {
        if (!item.gamelandNftId) {
          let contractIndex = contracts.findIndex((i: any) => {
            return i.toLowerCase() === item.token_address.toLowerCase()
          })
          if (contractIndex >= 0) {
            contractIndex = contractIndex + 1
          } else {
            return
          }
          const gamelandId = fixDigitalId(contractIndex, item.token_id, account)
          item.gamelandNftId = hashMessage(gamelandId)
        }
        if (item.owner_of) {
          if (item.owner_of.toLowerCase() === account.toLowerCase()) {
            item.have = 1
          } else {
            item.have = 0
          }
        } else {
          item.have = 0
        }
        return item
      })
      setnftData(data)
    })
    setcollectionDetails(Details?.data.data[0])
  }
  useEffect(() => {
    if (state) {
      localStorage.setItem('address', state.address)
      localStorage.setItem('chain', state.chain)
    }
    getCollectionInfo()
  }, [contractName])
  useEffect(() => {
    const data = fetchMetadata(nftData)
    Promise.all(data).then((vals) => {
      setDataAll(vals)
    })
  }, [nftData])

  useEffect(() => {
    const getUserinfo = async () => {
      if (!account) return
      const userinfo = await bschttp.get(`v0/userinfo/${account}`)
      if (!userinfo.data.data.length) {
        history.push({
          pathname: `/createUser`
        })
      } else if (userinfo.data.data && !userinfo.data.data[0].image) {
        setUploadImg(true)
        return
      } else {
        setUserinfo(userinfo.data.data[0])
        const params = { useraddress: account }
        const userscore = http2.post(`/v0/score/${address}`, params)
        const collectionScore = http2.get(`/v0/score/collection/${address}`)
        const collectionreviewe = http2.get(`/v0/review/collection/${address}`)
        const userlike = http2.get(`/v0/review_like/${account}`)
        const Rewardinfo = http2.get(`/v0/review_reward`)
        const userAll = bschttp.get(`v0/userinfo`)
        Promise.all([userscore, collectionScore, collectionreviewe, userlike, Rewardinfo, userAll]).then((vals) => {
          setUserScoreinfo(vals[0].data.data)
          setCollectionScoreinfo(vals[1].data.data)
          const revieweFilter = vals[2].data.data.filter((ele: any) => {
            return !ele.SuperiorIndex
          })
          const reviewData = [] as any
          revieweFilter.map((item: any, index: any) => {
            if (index < 20) {
              reviewData.push(item)
            }
          })
          setrevieweinfo(reviewData.sort(compareTime()))
          setuserLikeInfo(vals[3].data.data)
          setrewardinfo(vals[4].data.data)
          setuserinfoAll(vals[5].data.data)
        })
      }
    }
    getUserinfo()
  }, [account, chainId, refreshBy])
  useEffect(() => {
    if (rewardSelection === 'BNB') {
      handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)
    } else if (rewardSelection === 'MATIC') {
      handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)
    }
  }, [rewardSelection])
  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const Penalty = new BigNumber(currentItem.penalty as unknown as string)
    const _cost = new BigNumber(currentItem.price as number).times(Number(LeaseDays))
    if (!LeaseDays) {
      return 0
    }
    return _cost.plus(collateral).plus(Penalty).toString()
  }, [LeaseDays])

  const isLike = (id: any) => {
    const Index = userLikeInfo.findIndex((item: any) => {
      return item.reviewid === id
    })
    if (Index >= 0) return 1
    return 0
  }
  const getScoreStatistics = () => {
    const fiveStar = Collectionscoreinfo.filter((item: any) => {
      return item.score === 5
    })
    const fourStar = Collectionscoreinfo.filter((item: any) => {
      return item.score === 4
    })
    const threeStar = Collectionscoreinfo.filter((item: any) => {
      return item.score === 3
    })
    const twoStar = Collectionscoreinfo.filter((item: any) => {
      return item.score === 2
    })
    const oneStar = Collectionscoreinfo.filter((item: any) => {
      return item.score === 1
    })
    return {
      total: Collectionscoreinfo.length,
      fiveStar: fiveStar.length,
      fourStar: fourStar.length,
      threeStar: threeStar.length,
      twoStar: twoStar.length,
      oneStar: oneStar.length
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
  const getForwardData = (id: any, type: any) => {
    const data = revieweinfo.filter((ele: any) => {
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
  const getReviewScore = (useraddress: any) => {
    const data = Collectionscoreinfo.filter((item: any) => {
      return item.useraddress === useraddress
    })
    if (data.length) {
      return data[0].score
    }
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
  const lendNftClick = async (item: any) => {
    if (chain === 'bsc') {
      if (chainId === 56) {
        setlendVisible(true)
      } else {
        handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)
      }
    } else if (chain === 'polygon') {
      if (chainId === 137) {
        setlendVisible(true)
      } else {
        handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)
      }
    }
    setExpired(false)
    setAwaiting(true)
    if (item.sell_orders) return
    const contractAddress = item.token_address ?? ''

    const localAbi = localStorage.getItem(contractAddress.toLowerCase())
    let storedAbi: any
    for (const [key, value] of Object.entries(ABIs)) {
      if (key.toLowerCase() === contractAddress.toLowerCase()) {
        storedAbi = value
      }
    }
    const ABI =
      storedAbi && storedAbi.length ? storedAbi : localAbi ? localAbi : await fetchAbi(contractAddress, chain + 'scan')
    const nftContract = getContract(library, contractAddress, ABI)
    item.contract = nftContract
    setCurrentItem(item)
    if (nftContract !== null) {
      try {
        // check ERC721 approve
        if (item.contract_type === 'ERC721' && nftContract?.getApproved) {
          const approveAddress = await nftContract?.getApproved(item.token_id)
          if (lowerCase(approveAddress) === lowerCase(AssetContractAddress as string)) {
            setIsApproved(true)
          } else {
            setIsApproved(false)
          }
        } else if (!!nftContract?.isApprovedForAll) {
          // check ERC1155 approve
          console.log(AssetContractAddress)
          const isApproved = await nftContract?.isApprovedForAll(AssetContractAddress, account)
          console.log(isApproved)

          isApproved ? setIsApproved(true) : setIsApproved(false)
        }
      } catch (err: any) {
        console.log(err.message)
      }
    }
    setAwaiting(false)
  }
  const handleSendNft = async (item: any) => {
    if (chain === 'bsc') {
      if (chainId === 56) {
        setShowSend(true)
      } else {
        handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)
      }
    } else if (chain === 'polygon') {
      if (chainId === 137) {
        setShowSend(true)
      } else {
        handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)
      }
    }
    setToAddress('')
    if (item.sell_orders) return
    const contractAddress = item.token_address ?? ''
    const localAbi = localStorage.getItem(contractAddress.toLowerCase())
    let storedAbi
    for (const [key, value] of Object.entries(ABIs)) {
      if (key.toLowerCase() === contractAddress.toLowerCase()) {
        storedAbi = value
      }
    }
    let chainscan
    if (chain === 'bsc') {
      chainscan = 'bscscan'
    } else if (chain === 'polygon') {
      chainscan = 'polygonscan'
    }
    const ABI =
      storedAbi && storedAbi.length ? storedAbi : localAbi ? localAbi : await fetchAbi(contractAddress, chainscan)
    const nftContract = getContract(library, contractAddress, ABI)
    item.contract = nftContract
    setCurrentItem(item)
  }
  const handleApprove = async () => {
    setApproving(true)
    if (currentItem.contract) {
      try {
        let approvetx
        if (currentItem.contract_type === 'ERC721' && currentItem.contract?.approve) {
          approvetx = await currentItem.contract.approve(AssetContractAddress, currentItem.token_id)
        } else {
          approvetx = await currentItem.contract.setApprovalForAll(AssetContractAddress, true)
        }
        // console.log(approvetx)
        const receipt = await fetchReceipt(approvetx.hash, library)
        if (!receipt.status) {
          throw new Error('failed')
        }

        setIsApproved(true)
        setPrompt(true)
      } catch (err: any) {
        toastify.error(err.message)
      }
    }
    setApproving(false)
  }
  const handleLend = async () => {
    try {
      if (Number(penalty) < 1) {
        toastify.error('Minimum scale is 1.')
        return
      }
      if (Number(penalty) > 20) {
        toastify.error('maximum scale is 20.')
        return
      }
      if (!penalty) {
        toastify.error('Please enter rental penalty.')
        return
      }
      if (!account) {
        toastify.error('Please connect an account.')
        return
      }
      setLending(true)
      // const owner = await nftContract.ownerOf(currentItem.nftId)
      const Collateral = new BigNumber(collateral as unknown as string)
      const Day = new BigNumber(days as unknown as string)
      const Price = new BigNumber(price as unknown as string)
      const cost = Day.times(Price)
      const PenaltyProportion = new BigNumber(penalty as unknown as string).times(new BigNumber('0.01'))
      const amount = Collateral.plus(cost)
      let type
      if (currentSelection === 'BNB' || currentSelection === 'MATIC') {
        type = 'eth'
      } else {
        type = 'usdt'
      }
      const Penalty = amount.times(PenaltyProportion).toString()
      const deposited = await ControlContract?.deposit(
        currentItem.metadata.name,
        currentItem.contract_type,
        currentItem.token_id,
        parseEther(price),
        days,
        parseEther(collateral),
        parseEther(Penalty),
        currentItem.gamelandNftId,
        currentItem.token_address,
        type
      )

      const receipt = await fetchReceipt(deposited.hash, library)
      if (!receipt.status) {
        throw Error('Failed to deposit.')
      }
      const index = await AssetContract?.get_nftsindex(currentItem.gamelandNftId)
      const params = {
        nftId: currentItem.token_id,
        isLending: true,
        price: Number(price),
        days: Number(days),
        collateral: Number(collateral),
        originOwner: account,
        contractAddress: currentItem.token_address,
        standard: currentItem.contract_type,
        metadata: JSON.stringify(currentItem.metadata) || '',
        gamelandNftId: currentItem.gamelandNftId,
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON(),
        penalty: Penalty,
        pay_type: type,
        lendIndex: index.toString(),
        expire_blocktime: Math.floor(new Date().valueOf() / 1000),
        name: currentItem.metadata.name,
        img: currentItem.metadata.image,
        contractName: currentItem.name
      }
      const res: any = await http2.post(`/v0/opensea/`, params)
      setLending(false)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setPrice('')
        setCollateral('')
        setdays('')
        setVisible(false)
        mutateMyNfts(undefined, true)
        location.reload()
      } else {
        throw res.message || res.data.message
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.message)
      setLending(false)
    }
  }
  const sendNFT = async () => {
    if (currentItem.contract) {
      try {
        setLending(true)
        const approvetx = await currentItem.contract.transferFrom(account, toAddress, currentItem.token_id)
        const receipt = await fetchReceipt(approvetx.hash, library)
        if (!receipt.status) {
          throw new Error('failed')
        }
        setLending(false)
        setShowSend(false)
        location.reload()
      } catch (err: any) {
        toastify.error(err.message)
        setLending(false)
      }
    }
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
      const res: any = await http2.post(`/v0/review_reward/`, params)
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
  const setname = async () => {
    if (!username) return
    setLending(true)
    const params = {
      useraddress: account,
      username: username
    }
    const res: any = await bschttp.post(`/v0/userinfo/`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setLending(false)
      setshowSetUp(false)
      setrefreshBy(!refreshBy)
    } else {
      throw res.message || res.data.message
    }
  }
  const sendNewUserName = async () => {
    const params = {
      username: newUserName
    }
    const userinfo = bschttp.put(`/v0/userinfo/${account}`, params)
    const review = http2.put(`/v0/review/updateUserName/${account}`, params)
    Promise.all([userinfo, review]).then(() => {
      setrefreshBy(!refreshBy)
      setUserSettings(false)
    })
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
    http2.put(`/v0/games/${collectionDetails.id}`, params).then(() => setrefreshBy(!refreshBy))
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
    http2.put(`/v0/review/${item.id}`, params).then(() => setrefreshBy(!refreshBy))
  }
  const updateForwardTotal = async (item: any) => {
    const total = item.forwards + 1
    const params = {
      forwards: total
    }
    http2.put(`/v0/review/${item.id}`, params).then(() => setrefreshBy(!refreshBy))
  }
  const submit = async () => {
    if (!starScore && !textareaValue && !Object.keys(forward).length) return
    if (starScore) {
      if (!userScoreinfo.length) {
        const params = {
          userimage: userinfo.image,
          useraddress: account,
          contractaddress: address,
          score: starScore
        }
        const res: any = await http2.post(`/v0/score/`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          setscoreDialog(false)
          setstarScore(0)
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
          setstarScore(0)
          setscoreDialog(false)
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
          userimage: userinfo.image,
          context: textareaValue,
          contractName: collectionDetails.contractName,
          NFTData: JSON.stringify(commentNFTItem) || ''
        }
        const res: any = await http2.post(`/v0/review`, params)
        if (res.data.code === 1) {
          settextareaValue('')
          setCommentNFTItem([])
          setrefreshBy(!refreshBy)
          toastify.success('succeed')
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
          userimage: userinfo.image,
          datetime: new Date().toJSON(),
          username: userinfo.username,
          context: textareaValue,
          contractName: collectionDetails.contractName,
          quote: forward.id,
          NFTData: JSON.stringify(commentNFTItem) || ''
        }
        const res: any = await http2.post(`/v0/review`, params)
        if (res.data.code === 1) {
          setCommentNFTItem([])
          toastify.success('succeed')
          settextareaValue('')
          setForward({})
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
  const handleShowModal = async (item: any) => {
    if (chain === 'bsc') {
      if (chainId === 56) {
        setVisible(true)
      } else {
        handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)
      }
    } else if (chain === 'polygon') {
      if (chainId === 137) {
        setVisible(true)
      } else {
        handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)
      }
    }
    if (!AssetContract) {
      toastify.error('Contract not found, please connect wallet.')
      return
    }
    setdays('')
    const index = await AssetContract.get_nftsindex(item.gamelandNftId)
    if (Number(item.lendIndex) != Number(index.toString())) {
      const params = {
        lendIndex: index.toString()
      }
      await http2?.put(`/v0/opensea/${item.gamelandNftId}`, params)
    }
    setDescription(item.metadata.description)
    setCurrentItem(item)
    if (item.metadata.attributes) {
      if (item.metadata.attributes.constructor === Object) {
        const arr: any[] = []
        for (const key in item.metadata.attributes) {
          arr.push({ trait_type: key, value: item.metadata.attributes[key] })
        }
        setSpecificAttribute(arr)
        setRareAttribute([])
      } else {
        setSpecificAttribute(item.metadata.attributes)
        setRareAttribute([])
      }
    } else {
      const getdata = axios.create({
        timeout: 10000,
        headers: {
          Authorization: '40966ceb-b776-42fa-8236-620bf99bd1ef'
        }
      })
      try {
        const nftAttributeData = await getdata.get(
          `https://api.nftport.xyz/v0/nfts/${item.contractAddress}/${item.nftId}?chain=polygon`
        )
        setDescription(nftAttributeData.data.nft.metadata.description)
        const RareAttribute: any[] = []
        const SpecificAttribute: any[] = []
        nftAttributeData.data.nft.metadata.attributes.map((item: any) => {
          if (item.display_type) {
            RareAttribute.push(item)
          } else {
            SpecificAttribute.push(item)
          }
        })
        setRareAttribute(RareAttribute)
        setSpecificAttribute(SpecificAttribute)
      } catch (error) {
        // handleShowModal(item)
      }
    }
  }
  const handleShowPrompt = () => {
    if (!LeaseDays) return
    if (lowerCase(String(account)) === lowerCase(String(currentItem.originOwner))) return
    if (Number(LeaseDays) < 1) {
      toastify.error('Minimum rental days is 1 day.')
      return
    }
    if (currentItem.days) {
      if (Number(LeaseDays) > currentItem.days) {
        toastify.error(`Maximum rental days are ${currentItem.days} days.`)
        return
      }
    }
    setrentPrompt(true)
  }
  const handleRent = async () => {
    try {
      if (!library) {
        toastify.error('Please connect a account.')
        return
      }
      if (!ControlContract) {
        toastify.error('Contract not found.')
        return
      }
      setPrompt(false)
      setRenting(true)

      const collateral = new BigNumber(currentItem.collateral as unknown as string)
      const days = new BigNumber(LeaseDays as unknown as string)
      const price = new BigNumber(currentItem.price as unknown as string)
      const cost = days.times(price)
      const Penalty = new BigNumber(currentItem.penalty as unknown as string)
      const amount = collateral.plus(cost).plus(Penalty).toString()
      let rented
      if (currentItem.pay_type === 'eth') {
        rented = await ControlContract?.connect(library.getSigner()).rent(currentItem.lendIndex, LeaseDays, {
          value: parseEther(amount)
        })
      } else {
        const allowance = await ERC20Contract?.allowance(account, ControlContractAddress)
        const blance = allowance.toString()
        if (Number(blance) <= 0) {
          const approvetx = await ERC20Contract?.approve(ControlContractAddress, parseEther(amount))
          const approvereceipt = await fetchReceipt(approvetx.hash, library)
          if (!approvereceipt.status) {
            throw new Error('failed')
          }
        } else if (Number(blance) < Number(amount)) {
          await ERC20Contract?.approve(ControlContractAddress, 0)
          await ERC20Contract?.approve(ControlContractAddress, parseEther(amount))
        }
        rented = await ControlContract?.connect(library.getSigner()).rent_usdt(currentItem.lendIndex, LeaseDays)
      }
      const receipt = await fetchReceipt(rented.hash, library)
      const { status } = receipt
      if (!status) {
        throw Error('Failed to rent.')
      }
      const index = await AssetContract?.get_borrowindex(currentItem.gamelandNftId)
      const params = {
        isBorrowed: true,
        borrower: account,
        borrowAt: new Date().toJSON(),
        borrowDay: LeaseDays,
        rentIndex: index.toString()
      }
      const res: any = await http2?.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)

      if (res.data.code === 1) {
        setRenting(false)
        toastify.success('succeed')
        setVisible(false)
      } else {
        throw res.message || res.data.message
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.data ? err.data.message : err.message)
      setRenting(false)
    }
  }
  const handleMyNFTdata = async (item: any) => {
    const getdata = axios.create({
      timeout: 10000,
      headers: {
        'X-Api-Key': '60aee01eae2f89f6fb4b81177df15c8c'
      }
    })
    try {
      const { data } = await getdata.get(
        `https://api.element.market/openapi/v1/asset?chain=${chain}&token_id=${item.token_id}&contract_address=${item.token_address}`
      )
      // item.metadata = JSON.parse(data.data.metadata_json)
      setNFTStatsMadalData(data.data)
      setNFTStatsMadalType('create')
      if (data.data.description) {
        setDescription(data.data.description)
      } else {
        setDescription(data.data.collection?.description)
      }
      if (data.data.attributes) {
        setRareAttribute(data.data.attributes)
      } else {
        setSpecificAttribute(data.data.properties)
        setRareAttribute(data.data.stats || data.data.levels)
      }
      setShowMyNFTModal(true)
    } catch (error) {
      console.log(error)
    }
  }
  const showNFTStatsMadal = (item: any) => {
    setNFTStatsMadalData(item)
    setNFTStatsMadalType('check')
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
  const handlePriceChange = useCallback((val) => setPrice(val), [])
  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleLeaseDaysChange = useCallback((val) => setLeaseDays(val), [])
  const handleCollateralChange = useCallback((val) => setCollateral(val), [])
  const handlePenaltyChange = useCallback((val) => setPenalty(val), [])
  const handleToAddressChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setToAddress(val)
  }, [])
  const handlerewardQuantityChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setrewardQuantity(val)
  }, [])
  const handleusernameChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setusername(val)
  }, [])
  const handletextareaChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    settextareaValue(val)
  }, [])
  const handleNewuserNameChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setNewUserName(val)
  }, [])
  const UploadImgChange = async (e: any) => {
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
      createTransaction(imgData, type)
    }
    // https://arweave.net/nO9zPgPFc60DGqJNg3Rr4Xfsvl6J1DW_mxmdR269Es4
    // fetch(Img)
    //   .then((res) => res.arrayBuffer())
    //   .then((res) => {
    //     // console.log(res)
    //     createTransaction(res, type)
    //   })
  }
  const createTransaction = async (datas: any, type: string) => {
    try {
      // const wallet = new ArweaveWebWallet({
      //   name: 'Gameland AR',
      //   logo: 'https://dapp.gameland.network/logo192.png'
      // })
      // wallet.setUrl('arweave.app')
      // await wallet.connect()
      // await wallet.signTransaction(transaction)
      // const dispatchResult = await wallet.dispatch(transaction)
      const transaction = await arweave.createTransaction({ data: datas })
      transaction.addTag('Content-Type', type)
      await arweave.transactions.sign(transaction, key)
      await arweave.transactions.post(transaction)
      if (transaction) {
        const params = {
          image: `https://arweave.net/${transaction.id}`
        }
        const res: any = await bschttp.put(`/v0/userinfo/${account}`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          setUploadImg(false)
          setrefreshBy(!refreshBy)
        } else {
          toastify.error(res.message || res.data.message)
        }
      }
    } catch (err: any) {
      toastify.error(err)
    }
  }
  const changeOne = async () => {
    setCommentNFTItem([])
    setShowMyNFTModal(false)
  }
  const commentNFTOKButton = async () => {
    setShowMyNFTBox(false)
    setShowMyNFTModal(false)
    console.log(NFTStatsMadalData)
    setCommentNFTItem(NFTStatsMadalData)
  }
  const link = () => {
    history.push({
      pathname: `/games/${contractName}/review`,
      state: {
        address: address,
        chain: chain
      }
    })
  }
  const UserPage = (item: any) => {
    // console.log(item)
    let username
    if (item.username) {
      username = item.username
    } else {
      username = `user #${item.useraddress}`
    }
    history.push({
      pathname: `/user/${username.replace(/ /g, '')}`,
      state: {
        useraddress: item.useraddress
      }
    })
  }
  const SeeMore = async () => {
    setLoading(true)
    setclickStatus(true)
    const nftCollection = await http.get(`
      https://deep-index.moralis.io/api/v2/nft/${address}?chain=${chain}&format=decimal&limit=30&cursor=${nextCursor}
    `)
    // console.log(nftCollection.data)
    const data = fetchMetadata(nftCollection.data.result)
    Promise.all(data).then((vals) => {
      setDataAll([...DataAll, ...vals])
      setLoading(false)
      setclickStatus(false)
    })
  }
  const closeShowSetUp = () => {
    setshowSetUp(false)
    setrefreshBy(!refreshBy)
  }
  const closeUploadImg = () => {
    setUploadImg(false)
    setrefreshBy(!refreshBy)
  }
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )
  return (
    <div className="container">
      <Modal destroyOnClose footer={null} onCancel={() => setlendVisible(false)} visible={lendvisible} closable={false}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <NftCard
              name={currentItem.metadata?.name}
              price={currentItem.price}
              days={currentItem.days}
              collateral={currentItem.collateral}
              img={currentItem.metadata?.image}
              size={500}
              nftId={currentItem.token_id as string}
              withdrawable={withdrawable}
              unOperate={true}
              contract_type={currentItem.contract_type}
              borrowDay={currentItem.borrowDay}
              penalty={0}
              pay_type={currentItem.pay_type}
            />
          </Col>

          <Col span="12" xl={12} sm={24}>
            <h3>{currentItem.metadata?.name}</h3>
            <p>
              <span className="tips">#{currentItem.token_id}</span>
            </p>
            {currentItem.sell_orders ? (
              <a
                href={`${OPENSEA_URL}/assets/${currentItem.contractAddress}/${currentItem.token_id}`}
                target="_blank"
                rel="noreferrer"
              >
                The NFT is on sale.
              </a>
            ) : awaiting ? (
              <Loading />
            ) : isApproved ? (
              <>
                <Dlist className="flex">
                  <div>
                    <span>Enter collateral.</span>
                    <NumInput onChange={handleCollateralChange} value={collateral} />
                  </div>
                  <div>
                    <span>Enter Penalty.</span>
                    <NumInput onChange={handlePenaltyChange} value={penalty} />
                  </div>
                  <div>
                    <span>Enter price per day.</span>
                    <NumInput onChange={handlePriceChange} value={price} />
                  </div>
                  <div>
                    <span>Enter renting days.</span>
                    <NumInput validInt onChange={handleDaysChange} value={days} />
                  </div>
                  <div>
                    <span>choose type.</span>
                    <div className="currentSelection" onClick={() => setOptions(!options)}>
                      {currentSelection}
                      <img src={arrow} className="arrowIcon" />
                    </div>
                    {options ? (
                      <div className="Options">
                        <div
                          onClick={() => {
                            setCurrentSelection(chainId === 56 ? 'BNB' : 'MATIC')
                            setOptions(false)
                          }}
                        >
                          {chainId === 56 ? 'BNB' : 'MATIC'}
                        </div>
                        <div
                          onClick={() => {
                            setCurrentSelection(chainId === 56 ? 'BUSD' : 'wETH')
                            setOptions(false)
                          }}
                        >
                          {chainId === 56 ? 'BUSD' : 'wETH'}
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </Dlist>
                <br />
                <Button
                  className="lend"
                  shape="round"
                  block
                  onClick={handleLend}
                  disabled={!(price && days && collateral)}
                  loading={lending}
                  type="primary"
                  size="large"
                >
                  Lend
                </Button>
              </>
            ) : (
              <div>
                <Button className="lend" shape="round" block onClick={handleApprove} loading={approving} size="large">
                  Approve
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Modal>
      <Modal footer={null} onCancel={() => setVisible(false)} visible={visible} destroyOnClose closable={false}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <ImgBox>
              <Img src={currentItem.metadata?.image} alt="" />
            </ImgBox>
          </Col>
          <Col span="12" xl={12} sm={24}>
            <Title>{currentItem.metadata?.name}</Title>
            <RentDlist className="flex">
              <div>
                <SpanLabel>Owner</SpanLabel>
                <span title={currentItem.originOwner}>{formatAddress(currentItem.originOwner || ZeroAddress, 4)}</span>
              </div>
              <div>
                <SpanLabel>Collateral</SpanLabel>
                <span>
                  {currentItem.collateral}&nbsp;
                  {ChainCurrencyName(chainId, currentItem.pay_type)}&nbsp;
                  <Icon type={currentItem.pay_type} />
                </span>
              </div>
              <div>
                <SpanLabel>penalty</SpanLabel>
                <span>
                  {currentItem.penalty}&nbsp;
                  {ChainCurrencyName(chainId, currentItem.pay_type)}&nbsp;
                  <Icon type={currentItem.pay_type} />
                </span>
              </div>
              <div>
                <SpanLabel>Max days</SpanLabel>
                <span>{currentItem.days}</span>
              </div>
              <div>
                <SpanLabel>price</SpanLabel>
                <span className="blue">
                  <span className="bigSize">
                    {currentItem.price}&nbsp;
                    {ChainCurrencyName(chainId, currentItem.pay_type)}&nbsp;
                  </span>
                  <Icon type={currentItem.pay_type} /> / day
                </span>
              </div>
              <div>
                <SpanLabel>Total</SpanLabel>
                <span className="blue bigSize">
                  {total}&nbsp;
                  {ChainCurrencyName(chainId, currentItem.pay_type)}&nbsp;
                  <Icon type={currentItem.pay_type} />
                </span>
              </div>
            </RentDlist>
            <div className="daysInput">
              <NumInput validInt onChange={handleLeaseDaysChange} value={LeaseDays} />
              <div className="divider"></div>
              <Tips>Available time 1-{currentItem.days} days.</Tips>
            </div>
            <br />
            <FakeButton
              onClick={handleShowPrompt}
              loading={renting}
              value={LeaseDays}
              block
              disabled={lowerCase(String(account)) === lowerCase(String(currentItem.originOwner)) || renting}
            >
              Rent
            </FakeButton>
            <br />
            <p className=" text-center">
              <span className="tips">
                {lowerCase(String(account)) === lowerCase(String(currentItem.originOwner))
                  ? 'Unable to rent your own NFT'
                  : undefined}
              </span>
            </p>
          </Col>
        </Row>
        <Row>
          <Description>
            <h2 className="h2">Description</h2>
            <div className="border"></div>
            <div className="describe">{description}</div>
          </Description>
        </Row>
        <Row>
          {SpecificAttribute.length ? (
            <Properties>
              <h2 className="h2">Properties</h2>
              <hr className="border" />
              <div className="rare">
                {SpecificAttribute.map((item: any, index: any) => (
                  <div key={index} className={(index + 1) % 2 == 0 ? '' : 'bg'}>
                    <span>{item.trait_type}</span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
            </Properties>
          ) : (
            ''
          )}
        </Row>
        <Row>
          {RareAttribute.length ? (
            <StatsBox>
              <h2 className="h2">Stats</h2>
              <hr className="border" />
              <div className="attribute">
                {RareAttribute.map((item: any, index: any) => (
                  <div key={index} className={(index + 1) % 2 == 0 ? '' : 'bg'}>
                    <b>
                      <span>{item.trait_type}</span>
                    </b>
                    <p>
                      <span>{item.value}</span>
                      {item.max_value ? <span> of {item.max_value}</span> : ''}
                    </p>
                  </div>
                ))}
              </div>
            </StatsBox>
          ) : (
            ''
          )}
        </Row>
        <Row>
          <Details>
            <h2 className="h2">Details</h2>
            <hr className="border" />
            <div className="attribute">
              <div className="bg">
                <span className="b">Contract Address</span>
                <span> {formatAddress(currentItem.contractAddress || ZeroAddress, 4)}</span>
              </div>
              <div>
                <span className="b">Token ID</span>
                <span> {currentItem.nftId?.length > 10 ? formatting(currentItem.nftId) : currentItem.nftId}</span>
              </div>
              <div className="bg">
                <span className="b">Token Standard</span>
                <span> {currentItem.standard}</span>
              </div>
              <div>
                <span className="b">Blockchain</span>
                <span>{chainId === 56 ? 'BSC' : 'Polygon'}</span>
              </div>
            </div>
          </Details>
        </Row>
      </Modal>
      <NFTStatsMadal
        visible={showMyNFTModal}
        data={NFTStatsMadalData}
        description={description}
        SpecificAttribute={SpecificAttribute}
        RareAttribute={RareAttribute}
      >
        {NFTStatsMadalType === 'create' ? (
          <CommentNFTButton className="flex flex-justify-content">
            <div onClick={changeOne}>change one</div>
            <div onClick={commentNFTOKButton}>OK</div>
          </CommentNFTButton>
        ) : (
          <Close onClick={() => setShowMyNFTModal(false)}>close</Close>
        )}
      </NFTStatsMadal>
      <Dialog footer={null} onCancel={() => setPrompt(false)} visible={prompt} destroyOnClose closable={false}>
        <ContentBox>
          <div className="title">Prompt</div>
          <p>
            You can only liquidate and deduct the penalty fee if the lease is not returned for more than 8 hours after
            the lease time expires, and the daily price will be deducted from the mortgage for every subsequent day The
            penalty formula is ((price per day*days)+mortgage amount)*the ratio you set, and the range of penalty
            settings is 0~20%
          </p>
        </ContentBox>
      </Dialog>
      <Dialog footer={null} onCancel={closeShowSetUp} visible={showSetUp} destroyOnClose closable={false}>
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
      <Dialog footer={null} onCancel={closeUploadImg} visible={UploadImg} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">Set Avatar</div>
          <input type="file" accept="image/png, image/jpeg" onChange={UploadImgChange} />
        </SendBox>
      </Dialog>
      <Dialog footer={null} onCancel={() => setrentPrompt(false)} visible={rentprompt} destroyOnClose closable={false}>
        <ContentBox>
          <div className="title">Prompt</div>
          <p>
            If the lease is not returned for more than 8 hours after the expiry of the lease time, the liquidated damage
            will be deducted, and the security deposit of {currentItem.price} will be deducted for each overtime day
            after that.
          </p>
          <div className="button">
            <div className="cancel" onClick={() => setPrompt(false)}>
              cancel
            </div>
            <div className="ok" onClick={handleRent}>
              OK
            </div>
          </div>
        </ContentBox>
      </Dialog>
      <Dialog footer={null} onCancel={() => setShowSend(false)} visible={showSend} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">Transfer your NFT</div>
          <h2>Address</h2>
          <div className="input">
            <input placeholder="To address" onChange={handleToAddressChange} value={toAddress} />
          </div>
          <div className={toAddress ? 'button ture' : 'button false'} onClick={sendNFT}>
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
          <div className="title">user setting</div>
          <div className="input">
            <input placeholder="new user name" onChange={handleNewuserNameChange} value={newUserName} />
          </div>
          <div className={newUserName ? 'button ture' : 'button false'} onClick={sendNewUserName}>
            renew
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
          <div className={rewardQuantity ? 'button ture' : 'button false'} onClick={sendRewar}>
            Send
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
        </SendBox>
      </Dialog>
      <Dialog
        footer={null}
        onCancel={() => setscoreDialog(false)}
        visible={scoreDialog}
        destroyOnClose
        closable={false}
      >
        <ContentBox>
          <div className="title">Prompt</div>
          <p>
            Each person can only submit ratings up to two times, and you can currently submit &nbsp;
            {userScoreinfo[0]?.renew >= 0 ? 1 - userScoreinfo[0]?.renew : 2} more times
          </p>
          <div className="button">
            <div className="cancel" onClick={() => setscoreDialog(false)}>
              cancel
            </div>
            <div className="ok" onClick={submit}>
              OK
            </div>
          </div>
        </ContentBox>
      </Dialog>
      <DetailsBox>
        <div className="collection">
          <div className="info">
            <div className="top">
              <img className="logo" src={collectionDetails.image} alt="" />
              <div>
                <div className="name">{collectionDetails.contractName}</div>
                <div className="attributesLabel">
                  {getLabelArr(collectionDetails.label).length
                    ? getLabelArr(collectionDetails.label).map((item: any, index: any) => <div key={index}>{item}</div>)
                    : ''}
                </div>
                <div className="support">
                  <a href={collectionDetails.twitter} target="_blank" rel="noreferrer">
                    <img src={twitter} alt="" />
                  </a>
                  <img src={discord} alt="" />
                  <a href={collectionDetails.officialWebsite} target="_blank" rel="noreferrer">
                    <img src={gameland} alt="" />
                  </a>
                </div>
              </div>
              <div className="ranting">
                <div className="title">
                  <b>Rating & Reviews</b>
                  <div className="fraction">
                    <b>{collectionDetails.starRating}</b>&nbsp;&nbsp;(out of 10)
                  </div>
                </div>
                <ScoreStatistics data={getScoreStatistics()}></ScoreStatistics>
              </div>
            </div>
            <div className="describe">{collectionDetails.describe}</div>
            <div className="nftBox">
              {DataAll.length
                ? DataAll.map((item: any, index: any) => (
                    <Card
                      key={index}
                      nftId={item.token_id}
                      onLend={() => lendNftClick(item)}
                      onSend={() => handleSendNft(item)}
                      onClick={() => handleShowModal(item)}
                      name={item.metadata?.name}
                      img={item.metadata?.image || item.metadata?.imageUrl}
                      isLending={item.isLending ? item.isLending : 0}
                      contract_type={item.contract_type ? item.contract_type : item.standard}
                      pay_type={item.pay_type}
                      have={item.have}
                    />
                  ))
                : ''}
              {DataAll.length ? (
                <div className="paginationBox flex flex-justify-content">
                  <div className="More cursor flex flex-center" onClick={() => (clickStatus ? '' : SeeMore())}>
                    See More
                    {loading ? <img className="loadding" src={loadding} alt="" /> : ''}
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
        <div className="comment">
          <div className="user" onClick={() => UserPage(userinfo)}>
            <img className="userImage cursor" src={userinfo.image || defaultImg} />
            <div className="userName cursor" onClick={() => setUserSettings(true)}>
              {userinfo.username || `user #${userinfo.useraddress}`}
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
                  <img src={forward.userimage || defaultImg} className="userImage" alt="" /> &nbsp;{forward.username}
                  <div className="CommentContent">{forward.context}</div>
                </div>
              ) : (
                ''
              )}
              {Object.keys(commentNFTItem).length ? (
                <div className="CommentNFTBox">
                  <img src={commentNFTItem.imageUrl} />
                  <div className="CommentNFTname">{commentNFTItem.name}</div>
                </div>
              ) : (
                <img className="addCommentNFT cursor" src={add} onClick={() => setShowMyNFTBox(!showMyNFTBox)} />
              )}
            </div>
            {showMyNFTBox ? (
              <MyNFTBox className="flex wrap">
                {myNFTdata.length
                  ? myNFTdata.map((item: any, index: any) => (
                      <MyNFTCard
                        key={index}
                        nftId={item.token_id}
                        onClick={() => handleMyNFTdata(item)}
                        name={item.metadata?.name}
                        img={item.metadata?.image || item.metadata?.imageUrl}
                        contract_type={item.contract_type}
                        pay_type={item.pay_type}
                        item={item}
                      />
                    ))
                  : ''}
              </MyNFTBox>
            ) : (
              ''
            )}
            <div
              className="button"
              onClick={() => (!userScoreinfo[0]?.renew && starScore ? setscoreDialog(true) : submit())}
            >
              submit
            </div>
          </div>
          <div className="exhibit">
            <div className="title">What is happening</div>
            {revieweinfo.length
              ? revieweinfo.map((item: any, index: any) => (
                  <div className="CommentItem" key={index}>
                    <div className="userInfo" onClick={() => UserPage(item)}>
                      <img src={getUserImage(item.useraddress)} className="userImage" alt="" />
                      <div className="starName">
                        <div className="name">{item.username || `user #${userinfo.useraddress}`}</div>
                        <div className="star">
                          <div className={getReviewScore(item.useraddress) >= 1 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={getReviewScore(item.useraddress) >= 2 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={getReviewScore(item.useraddress) >= 3 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={getReviewScore(item.useraddress) >= 4 ? 'scoreStar' : 'defaultStar'}></div>
                          <div className={getReviewScore(item.useraddress) >= 5 ? 'scoreStar' : 'defaultStar'}></div>
                        </div>
                      </div>
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
                    <div className="otherDetails">
                      <div className="repost">
                        <img
                          src={repost}
                          className={item.useraddress.toLowerCase() === account?.toLowerCase() ? '' : 'cursor'}
                          onClick={() => commentsForward(item)}
                        />
                        <div className="quantity">{item.forwards || 0}</div>
                      </div>
                      <div className="Reply cursor">
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
                      <div className="reward">
                        <img
                          className="cursor"
                          src={reward}
                          onClick={() => {
                            setshowreward(true)
                            setrewardItem(item)
                          }}
                        />
                        <div className="rewardTotal">
                          <p>{getRewardTotal(item.id)[0]} BNB</p>
                          <p>{getRewardTotal(item.id)[1]} MATIC</p>
                        </div>
                      </div>
                    </div>
                    <div className="bottomBorder"></div>
                  </div>
                ))
              : ''}
            <div className="seeMore cursor" onClick={link}>
              View more replies &gt;&gt;
            </div>
          </div>
        </div>
      </DetailsBox>
    </div>
  )
}
