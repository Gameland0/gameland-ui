// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { parseEther } from '@ethersproject/units'
import { Row, Col, Button, Popconfirm } from 'antd'
import { isEmpty } from 'lodash'
import BigNumber from 'bignumber.js'
import { lowerCase } from 'lower-case'
import axios from 'axios'
import { useLocation, useParams } from 'react-router-dom'
import { hashMessage } from 'ethers/lib/utils'
import styled from 'styled-components'
import { POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL, BSC_CHAIN_ID_HEX, BSC_RPC_URL } from '../constants'
import { useActiveWeb3React, useStore, useControlContract, useAssetContract, useERC20Contract } from '../hooks'
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
import { Icon } from '../components/Icon'
import { bschttp, polygonhttp, http } from './Store'
import { ImgBox, Title, SpanLabel, Tips, Properties, StatsBox, Description, FakeButton, Details } from '../pages/Rent'
import { getContract, fetchAbi, SendBox } from '../pages/Dashboard'
import twitter from '../assets/icon_twitter.svg'
import discord from '../assets/icon_discord.svg'
import loadding from '../assets/loading.svg'
import gameland from '../assets/icon_gameland.svg'
import defaultImg from '../assets/default.png'
import defaultStar from '../assets/icon_review_star_default.svg'
import scoreStar from '../assets/icon_score_star.svg'
import arrow from '../assets/icon_select.svg'
import repost from '../assets/icon_repost.svg'
import Reply from '../assets/icon_reply.svg'
import like from '../assets/icon_like_default.svg'
import reward from '../assets/icon_reward.svg'

const DetailsBox = styled.div`
  display: flex;
  min-height: 550px;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 10px 10px 10px 10px;
  margin-top: 5px;
  .collection {
    min-height: 550px;
    border-right: 1px solid #e5e5e5;
    .info {
      .top {
        display: flex;
        .logo {
          width: 164px;
          height: 164px;
          margin-right: 40px;
        }
        .name {
          width: 410px;
          font-size: 36px;
          font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
          font-weight: bold;
          color: #333333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .support {
          margin-top: 50px;
          img {
            width: 48px;
            height: 48px;
            margin-right: 24px;
          }
        }
        .ranting {
          margin-left: 175px;
          margin-top: 20px;
          .title {
            font-size: 18px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #333333;
          }
          .fraction {
            margin-top: 40px;
            font-size: 16px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #999999;
            b {
              font-size: 36px;
              font-family: DIN-Bold, DIN;
              color: #35caa9;
            }
          }
        }
      }
      .describe {
        margin-top: 40px;
        font-size: 24px;
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        color: #333333;
      }
      .nftBox {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
  .comment {
    min-height: 550px;
    .user {
      display: flex;
      margin: 0 0 24px 0;
      .userImage {
        width: 80px;
        height: 80px;
        border-radius: 20px;
      }
      .userName {
        font-size: 36px;
        font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
        font-weight: bold;
        color: #333333;
        line-height: 80px;
        margin-left: 10px;
      }
    }
    .borders {
      width: 460px;
      height: 0;
      border: 1px solid #E5E5E5;
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
        margin-top: 24px;
        .defaultStar {
          width: 48px;
          height: 48px;
          background-image: url(${defaultStar});
          background-size: 48px;
          margin-right: 32px;
          cursor: pointer;
        }
        .scoreStar {
          width: 48px;
          height: 48px;
          background-image: url(${scoreStar});
          background-size: 48px;
          margin-right: 32px;
          cursor: pointer;
        }
      }
      .commentaryInput {
        margin-top: 24px;
        textarea  {
          width: 460px;
          height: 200px;
          resize: none;
          font-size: 18px;
          border:0;
          outline:0;
          box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
          border-radius: 10px;
          padding-left: 10px;
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
      }
    }
    .title {
      font-size: 24px;
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
              font-size: 18px;
              font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
              color: #333333;
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
              ..scoreStar {
                width: 16px;
                height: 16px;
                background-image: url(${scoreStar});
                background-size:b16px;
                margin-right: 8px;
              }
            }
          }
          .time {
            margin-left: 200px;
            font-size: 16px;
            font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
            color: #D0D0D0;
          }
        }
        .CommentContent {
          font-size: 16px;
          font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
          color: #333333;
          margin-top: 16px;
          padding-right: 50px;
        }
        .otherDetails {
          margin-top: 24px;
          display: flex;
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
            margin-left: 56px;
          }
        }
      }
    }
  }
  @media screen and (min-width: 1440px) {
    width: 1312px;
  }
  @media screen and (min-width: 1920px) {
    width: 1600px;
    .collection {
      width: 1048px;
      .top {
        padding: 50px;
      }
      .describe {
        padding: 50px;
      }
      .nftBox {
        padding: 40px;
      }
    }
    .comment {
      width: 552px;
      padding: 60px 0 0 40px;   
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
    width: 7.44rem;
  }
  @media screen and (min-width: 1440px) {
    width: 9.35rem;
  }
  @media screen and (min-width: 1920px) {
    width: 300px;
    min-height: 400px;
  }
  &:hover {
    transform: translateY(-1%);
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
interface LabelProps {
  name: string
  type: any
}
const Labels: React.FC<LabelProps> = ({ name, type }) => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <p>{name}</p>
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
  return (
    <CardBox
      className="flex flex-column-between flex-column"
      have={have}
      isLending={isLending}
      onClick={isLending ? handleClick : Click}
    >
      {/* <Img src={Imgs[name] ? Imgs[name] : Default} alt="" />  */}
      <Img src={img} alt="" />
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

export const CollectionDetails = () => {
  const { account, library, chainId } = useActiveWeb3React()
  const { data: _myNfts, mutate: mutateMyNfts } = useFetchMyNfts()
  const ERC20Contract = useERC20Contract()
  const ControlContract = useControlContract()
  const AssetContract = useAssetContract()
  const [starScore, setstarScore] = useState(0)
  const [textareaValue, settextareaValue] = useState('')
  const [collectionDetails, setcollectionDetails] = useState([] as any)
  const [visible, setVisible] = useState(false)
  const [lendvisible, setlendVisible] = useState(false)
  const [expired, setExpired] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isSendApproved, setIsSendApproved] = useState(false)
  const [awaiting, setAwaiting] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [toAddress, setToAddress] = useState('')
  const [withdrawable, setWithdrawable] = useState(false)
  const [penalty, setPenalty] = useState('')
  const [price, setPrice] = useState('')
  const [days, setdays] = useState('')
  const [collateral, setCollateral] = useState('')
  const [options, setOptions] = useState(false)
  const [approving, setApproving] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const [rentprompt, setrentPrompt] = useState(false)
  const [lending, setLending] = useState(false)
  const [LeaseDays, setLeaseDays] = useState('')
  const [renting, setRenting] = useState(false)
  const [currentSelection, setCurrentSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  const [currentItem, setCurrentItem] = useState({} as any)
  const [RareAttribute, setRareAttribute] = useState([] as any)
  const [SpecificAttribute, setSpecificAttribute] = useState([] as any)
  const [description, setDescription] = useState('')
  const [nftData, setnftData] = useState([] as any)
  const { state } = useLocation()
  const { contractName } = useParams() as any
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

  const getCollectionInfo = async () => {
    if (!account) return
    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY
    const myNft = await http.get(`
      https://deep-index.moralis.io/api/v2/${account}/nft?chain=${chain}&format=decimal&token_addresses=${address}
    `)
    const nftCollection = await http.get(`
      https://deep-index.moralis.io/api/v2/nft/${address}?chain=${chain}&format=decimal
    `)
    const Details = await http2.get(`v0/games/${address}`)
    const rantData = await http2.get(`v0/opensea/${address}`)
    setcollectionDetails(Details?.data.data[0])
    const data = [...myNft.data.result, ...rantData?.data.data, ...nftCollection.data.result]
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
      if (!item.metadata) {
        item.metadata = {
          name: '',
          image: defaultImg
        }
      } else if (typeof item.metadata === 'string') {
        item.metadata = JSON.parse(item.metadata)
      } else {
        item.metadata = item.metadata
      }
      return item
    })
    setnftData(data)
  }

  useEffect(() => {
    if (state) {
      localStorage.setItem('address', state.address)
      localStorage.setItem('chain', state.chain)
    }
    getCollectionInfo()
  }, [contractName])

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
      // const allowance = await ERC20Contract?.allowance(account, ControlContractAddress)
      // console.log(allowance.toString(), amount)
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
  const handlePriceChange = useCallback((val) => setPrice(val), [])
  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleLeaseDaysChange = useCallback((val) => setLeaseDays(val), [])
  const handleCollateralChange = useCallback((val) => setCollateral(val), [])
  const handlePenaltyChange = useCallback((val) => setPenalty(val), [])
  const handleToAddressChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setToAddress(val)
  }, [])
  const handletextareaChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    settextareaValue(val)
  }, [])
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
      <DetailsBox>
        <div className="collection">
          <div className="info">
            <div className="top">
              <img className="logo" src={collectionDetails.image} alt="" />
              <div>
                <div className="name">{collectionDetails.contractName}</div>
                <div className="support">
                  <img src={twitter} alt="" />
                  <img src={discord} alt="" />
                  <img src={gameland} alt="" />
                </div>
              </div>
              <div className="ranting">
                <div className="title">Rating & Reviews</div>
                <div className="fraction">
                  <b>{collectionDetails.starRating}</b>&nbsp;&nbsp;(out of 10)
                </div>
              </div>
            </div>
            <div className="describe">{collectionDetails.describe}</div>
            <div className="nftBox">
              {nftData.length
                ? nftData.map((item: any, index: any) => (
                    <Card
                      key={index}
                      nftId={'1'}
                      onLend={() => lendNftClick(item)}
                      onSend={() => handleSendNft(item)}
                      onClick={() => handleShowModal(item)}
                      name={item.metadata.name ? item.metadata.name : '#' + item.token_id}
                      img={item.metadata?.image}
                      isLending={item.isLending ? item.isLending : 0}
                      contract_type={item.contract_type ? item.contract_type : item.standard}
                      pay_type={item.pay_type}
                      have={item.have}
                    />
                  ))
                : ''}
            </div>
          </div>
        </div>
        <div className="comment">
          <div className="user">
            <img className="userImage" src={defaultImg} alt="" />
            <div className="userName">Vivi</div>
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
              <div className="forward"></div>
            </div>
            <div className="button">submit</div>
          </div>
          <div className="exhibit">
            <div className="title">What is happening</div>
            <div className="CommentItem">
              <div className="userInfo">
                <img src={defaultImg} className="userImage" alt="" />
                <div className="starName">
                  <div className="name">Vivi</div>
                  <div className="star">
                    <div className="defaultStar"></div>
                    <div className="defaultStar"></div>
                    <div className="defaultStar"></div>
                    <div className="defaultStar"></div>
                    <div className="defaultStar"></div>
                  </div>
                </div>
                <div className="time">2 days ago</div>
              </div>
              <div className="CommentContent">eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee</div>
              <div className="otherDetails">
                <div className="repost">
                  <img src={repost} alt="" />
                  <div className="quantity">111</div>
                </div>
                <div className="Reply">
                  <img src={Reply} alt="" />
                  <div className="quantity">111</div>
                </div>
                <div className="like">
                  <img src={like} alt="" />
                  <div className="quantity">111</div>
                </div>
                <div className="reward">
                  <img src={reward} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DetailsBox>
    </div>
  )
}
