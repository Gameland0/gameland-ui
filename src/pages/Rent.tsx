import React, { useEffect, useCallback, useMemo, useState } from 'react'
import axios from 'axios'
import { Row, Col } from 'antd'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { Dialog } from '../components/Dialog'
import BigNumber from 'bignumber.js'
import { Img } from '../components/Img'
import { useActiveWeb3React, useStore, useControlContract, useERC20Contract, useAssetContract } from '../hooks'
import { toastify } from '../components/Toastify'
import { useLendingNfts } from '../hooks/useLendingNfts'
import search from '../assets/search_bar_icon_search.svg'
import arrow from '../assets/icon_select.svg'
import { NumInput } from '../components/DaysInput'
import { Tag, Spin } from 'antd'
import { Loading3QuartersOutlined } from '@ant-design/icons'
import { RentCard } from '../components/RentCard'
import { isEmpty } from 'lodash'
import { fetchReceipt, formatAddress, ZeroAddress, formatting, ChainHttp, ChainCurrencyName } from '../utils'
// import { bschttp, polygonhttp } from '../components/Store'
import { Icon } from '../components/Icon'
import { BaseProps } from '../components/NumInput'
import { parseEther } from '@ethersproject/units'
import { lowerCase } from 'lower-case'
import { Empty } from '../components/Empty'
import { Filling } from './App'

import { BSCControlContractAddress, POLYGONControlContractAddress } from '../constants'

export const RentBox = styled.div`
  margin: 5rem 0 6rem 1rem;
`
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
  .total {
    font-size: 16px;
    font-weight: 400;
    color: #999999;
    line-height: 3.75rem;
  }
  .filter {
    width: 30.8%;
    height: 3.75rem;
    border-radius: 10px 10px 10px 10px;
    border: 2px solid #e5e5e5;
    position: relative;
    font-weight: bold;
    color: #333333;
    line-height: 3.75rem;
    padding-left: 2rem;
    cursor: pointer;
  }
  .sortSelect {
    width: 30.8%;
    height: 122px;
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
      font-weight: 400;
      color: #333333;
      line-height: 61px;
      cursor: pointer;
    }
  }
`
export const DayInfoBox = styled.div<{ progress?: number }>`
  margin-top: 1rem;
  height: 5rem;
  line-height: 5rem;
  border-radius: 1rem;
  border-radius: 20px 20px 20px 20px;
  border: 2px solid #35caa9;
  margin: 70px 0 0 20px;
  background: white;
  font-size: 0.875rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:before {
    position: absolute;
    display: block;
    content: '';
    width: ${({ progress }) => (progress ? progress + '%' : 'auto')};
    height: 100%;
    background: var(--in-progress);
    z-index: 1;
  }
  span {
    z-index: 2;
    position: relative;
    font-size: 24px;
    font-weight: bold;
    color: #35caa9;
  }
`
const FakeButtonBox = styled.button<{ theme?: string; block?: boolean }>`
  display: block;
  height: 12%;
  border-radius: 1.25rem;
  padding: 0 1rem;
  line-height: 2.5rem;
  font-size: 0.875rem;
  width: 100%;
  color: #fff;
  cursor: ${({ value, disabled }) => (value && !disabled ? 'pointer' : 'not-allowed')};
  background: ${({ value, disabled }) => (value && !disabled ? 'rgba(53, 202, 169, 1)' : 'rgba(53, 202, 169, 0.5)')};
  border: ${({ theme }) => (theme === 'ghost' ? `1px solid var(--second-color)` : '1px solid transparent')};

  @media screen and (min-width: 1920px) {
    height: 78px;
    line-height: 78px;
    font-size: 18px;
    margin-top: 8px;
  }
`
interface FakeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {
  theme?: 'fill' | 'ghost'
  loading?: boolean
  block?: boolean
  disabled?: boolean
}
const antIcon = <Loading3QuartersOutlined style={{ fontSize: 16, color: 'white' }} spin />

export const FakeButton: React.FC<FakeButtonProps> = ({ theme, children, loading, block, ...props }) => {
  return (
    <FakeButtonBox block={block} theme={theme} {...props}>
      {loading ? <Spin indicator={antIcon} /> : children}
    </FakeButtonBox>
  )
}
interface OperateProps {
  isLending?: boolean
  onClick?: () => void
}
const Operate: React.FC<OperateProps> = ({ isLending }) => {
  return <>{isLending ? <FakeButton theme="ghost">Rent</FakeButton> : null}</>
}
interface DaysInfoProps extends BaseProps {
  progress?: number
}
export const DaysInfo: React.FC<DaysInfoProps> = ({ progress, children }) => {
  return (
    <DayInfoBox progress={progress}>
      <span>{children}</span>
    </DayInfoBox>
  )
}
const Dlist = styled.div`
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
export const ImgBox = styled.div`
  img {
    width: 91%;
    height: 91%;
    border-radius: 20px 20px 20px 20px;
  }
`
export const Title = styled.h1`
  line-height: 1.5rem;
`
export const Tips = styled.div`
  width: 40%;
  height: 3.5rem;
  line-height: 3.5rem;
  text-align: right;
  font-size: 16px;
  font-weight: 400;
  color: #35caa9;
  position: absolute;
  top: 0%;
  right: 5%;
`

export const SpanLabel = styled.span`
  display: inline-block;
  width: 5rem;
  font-weight: bold;
  color: #333333;
`
export const Description = styled.div`
  width: 100%;
  height: 16.43rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  padding: 0 96px;
  margin-top: 2rem;
  .describe {
    max-height: 113px;
    font-size: 18px;
    font-weight: 400;
    color: #333333;
    margin-top: 128px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`
export const Properties = styled.div`
  width: 100%;
  min-height: 28rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  margin-top: 4rem;
  position: relative;
  .rare {
    display: flex;
    flex-wrap: wrap;
    padding: 0 66px;
    margin-top: 9rem;
    justify-content: center;
    div {
      width: 11rem;
      height: 110px;
      margin: 28px;
      background: linear-gradient(180deg, #f4f9fb 0%, #f4f9fb 100%);
      border-radius: 10px 10px 10px 10px;
      display: flex;
      flex-direction: column;
      text-align: center;
      span {
        margin-top: 1.5rem;
      }
      b {
        margin-top: 1rem;
      }
    }
  }
`

export const StatsBox = styled.div`
  width: 100%;
  min-height: 14rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  margin-top: 4rem;
  padding-bottom: 24px;

  .attribute {
    width: 100%;
    margin-top: 8rem;
    div {
      width: 100%;
      height: 4rem;
      padding: 0 6rem;
      display: flex;
      justify-content: space-between;
      line-height: 4rem;
      span {
        font-size: 18px;
        color: #333333;
      }
    }
  }
`
export const Details = styled.div`
  width: 100%;
  min-height: 12rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  margin-top: 4rem;
  padding-bottom: 24px;

  .attribute {
    width: 100%;
    margin-top: 8rem;
    div {
      width: 100%;
      height: 4rem;
      padding: 0 6rem;
      display: flex;
      justify-content: space-between;
      line-height: 4rem;
      span {
        font-size: 18px;
        color: #333333;
      }
    }
  }
`
export const ContentBox = styled.div`
  .title {
    width: 100%;
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    text-align: center;
  }
  p {
    margin-top: 2rem;
    font-size: 1.1rem;
    font-weight: 400;
    color: #666666;
  }
  .button {
    width: 100%;
    margin-top: 3rem;
    display: flex;
    justify-content: center;
    .cancel {
      width: 150px;
      height: 56px;
      background: #eaeaea;
      border-radius: 10px 10px 10px 10px;
      font-size: 18px;
      font-weight: 400;
      color: #999999;
      text-align: center;
      line-height: 56px;
      cursor: pointer;
      &:hover {
        background: #f5f2f2;
      }
    }
    .ok {
      width: 150px;
      height: 56px;
      background: #35caa9;
      border-radius: 10px 10px 10px 10px;
      font-size: 18px;
      font-weight: 400;
      color: #fff;
      text-align: center;
      line-height: 56px;
      cursor: pointer;
      margin-left: 3rem;

      &:hover {
        background: var(--second-light-color);
      }
    }
  }
`

export const Rent = () => {
  const { library, account, chainId } = useActiveWeb3React()
  const [currentItem, setCurrentItem] = useState({} as any)
  const [visible, setVisible] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const [Min, setMin] = useState('')
  const [Max, setMax] = useState('')
  const [LeaseDays, setdays] = useState('')
  const [collection, setCollection] = useState('')
  const [filterMenu, setFilterMenu] = useState(false)
  const [showNotFound, setShowNotFound] = useState(false)
  const [collectionFilterResult, setCollectionFilterResult] = useState([] as any)
  // const [currencyMenu, setCurrencyMenu] = useState(false)
  const [description, setDescription] = useState('')
  const [RareAttribute, setRareAttribute] = useState([] as any)
  const [SpecificAttribute, setSpecificAttribute] = useState([] as any)
  const lendingNfts = useLendingNfts()
  const [lendNfts, setLendNfts] = useState(lendingNfts)
  const ERC20Contract = useERC20Contract()
  const AssetContract = useAssetContract()
  const ControlContract = useControlContract()
  const [renting, setRenting] = useState(false)
  const { nfts } = useStore()
  const http2 = ChainHttp(chainId)
  let ControlContractAddress: any
  if (chainId === 56) {
    ControlContractAddress = BSCControlContractAddress
  } else if (chainId === 137) {
    ControlContractAddress = POLYGONControlContractAddress
  }
  useEffect(() => {
    const filterCollection = () => {
      const arr: any[] = []
      lendingNfts.map((item: any) => {
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
      if (lendingNfts.length == 0) {
        if (collection) {
          setShowNotFound(true)
        }
      }
    }
    filterCollection()
  }, [collection])

  // useEffect(() => {
  //   ControlContract?.add_nft_programforarray([
  //     '0x50bf69324a9be94673a2207427c5bebd8f63d76a',
  //     '0x6f9982f5213c6e3d8b130fe031d396963a1af5b5',
  //     '0x9a65e3193d9a27c834e31bfdbae3e7b0759a4d67',
  //     '0xe263fd424347464a41fd761ac88e23edc9b0156a',
  //     '0xfd2f272c658608a501da7487b3b8a37ecf4babdd'
  //   ])
  // }, [])

  useEffect(() => {
    setLendNfts(lendingNfts)
  }, [lendingNfts])

  const removeByValue = (arr: any, val: any) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        arr.splice(i, 1)
        break
      }
    }
  }
  useEffect(() => {
    const getRentList = async () => {
      if (AssetContract) {
        const gamelandNftIdList = await AssetContract.get_nfts_list()
        const gamelandNftIdArr = gamelandNftIdList.map((item: any) => {
          return item._hex
        })
        if (nfts.length) {
          const newArr = gamelandNftIdArr.filter((item: any) => {
            return item !== '0x00'
          })
          nfts.map((item: any) => {
            removeByValue(newArr, item.gamelandNftId)
          })
          for (let i = 0; i < newArr.length; i++) {
            const list = await AssetContract.get_nfts(newArr[i])
            const index = await AssetContract.get_nftsindex(newArr[i])
            const price = new BigNumber(Number(list.daily_price.toString())).dividedBy(
              new BigNumber(1000000000000000000)
            )
            const collateral = new BigNumber(Number(list.collatoral.toString())).dividedBy(
              new BigNumber(1000000000000000000)
            )
            const penalty = new BigNumber(Number(list.penalty.toString())).dividedBy(new BigNumber(1000000000000000000))
            const params = {
              nftId: list.nft_id.toString(),
              isLending: true,
              price: Number(price.toString()),
              days: Number(list.duration.toString()),
              collateral: Number(collateral.toString()),
              originOwner: list.nft_owner,
              contractAddress: list.form_contract,
              standard: list.nft_type,
              metadata: '',
              gamelandNftId: list.gameland_nft_id._hex,
              createdAt: new Date().toJSON(),
              updatedAt: new Date().toJSON(),
              penalty: Number(penalty.toString()),
              pay_type: list.pay_type,
              lendIndex: index.toString(),
              expire_blocktime: Math.floor(new Date().valueOf() / 1000),
              // img: data.image,
              name: list.nft_name
            }
            await http2?.post(`/v0/opensea/`, params)
          }
        }
      }
    }
    getRentList()
  }, [])
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

  const compare = (sortby: any) => {
    return function (obj1: any, obj2: any) {
      const val1 = new BigNumber(obj1.price as number)
        .times(obj1.days as number)
        .plus(obj1.collateral as number)
        .toString()
      const val2 = new BigNumber(obj2.price as number)
        .times(obj2.days as number)
        .plus(obj2.collateral as number)
        .toString()
      if (Number(val1) < Number(val2)) {
        if (sortby == 'lift') return -1
        return 1
      } else if (Number(val1) > Number(val2)) {
        if (sortby == 'lift') return 1
        return -1
      } else {
        return 0
      }
    }
  }

  const ascending = () => {
    const Nfts = lendingNfts.sort(compare('lift'))
    setLendNfts(Nfts)
  }

  const descending = () => {
    const Nfts = lendingNfts.sort(compare(''))
    setLendNfts(Nfts)
  }

  const collectionFilter = (collection: any) => {
    const Nfts = lendingNfts.filter((item) => {
      return item.contractName === collection
    })
    setLendNfts(Nfts)
  }

  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleMinChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    if (Number(val) <= 0 || isNaN(Number(val))) {
      setMin('')
      return
    }
    setMin(val)
  }, [])

  const handleMaxChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    if (Number(val) <= 0 || isNaN(Number(val))) {
      setMax('')
      return
    }
    setMax(val)
  }, [])

  const handleCollectionChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setCollection(val)
  }, [])

  const handleShowModal = async (item: any) => {
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
    setVisible(true)
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
    setPrompt(true)
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

  return (
    <div className="container">
      <Filling></Filling>
      <Row gutter={0}>
        <Col span="6">
          <div className="MenuBar">
            {/* <div className="price">
              <h2>Price</h2>
              <div className="currencyType" onClick={() => setCurrencyMenu(!currencyMenu)}>
                <img src={polygonIcon} className="polygonIcon" />
                MATIC
                <img src={arrow} className="arrowIcon" />
              </div>
              {currencyMenu ? (
                <div className="select">
                  <div onClick={() => setCurrencyMenu(false)}>
                    <img src={polygonIcon} className="polygonIcon" />
                    MATIC
                  </div>
                </div>
              ) : (
                ''
              )}
              <input onChange={handleMinChange} value={Min} placeholder="Min" />
              <div className="to">to</div>
              <input onChange={handleMaxChange} value={Max} placeholder="Max" />
              <div className={Min && Max ? 'apply true' : 'apply flase'}>Apply</div>
            </div> */}
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
            <div className="total">{lendingNfts.length} results</div>
            <div className="filter" onClick={() => setFilterMenu(!filterMenu)}>
              Rencently Listed
              <img src={arrow} className="arrowIcon" />
            </div>
            {filterMenu ? (
              <div className="sortSelect">
                <div
                  className="border-bottom"
                  onClick={() => {
                    ascending()
                    setFilterMenu(false)
                  }}
                >
                  Price: Low to High
                </div>
                <div
                  onClick={() => {
                    descending()
                    setFilterMenu(false)
                  }}
                >
                  Price: High to Low
                </div>
              </div>
            ) : (
              ''
            )}
          </Sort>
          <RentBox>
            <Modal footer={null} onCancel={() => setVisible(false)} visible={visible} destroyOnClose closable={false}>
              <Row gutter={[24, 24]}>
                <Col span="12" xl={12} sm={24}>
                  <ImgBox>
                    <Img src={currentItem.metadata?.image} alt="" />
                  </ImgBox>
                </Col>
                <Col span="12" xl={12} sm={24}>
                  <Title>{currentItem.metadata?.name}</Title>
                  <Dlist className="flex">
                    <div>
                      <SpanLabel>Owner</SpanLabel>
                      <span title={currentItem.originOwner}>
                        {formatAddress(currentItem.originOwner || ZeroAddress, 4)}
                      </span>
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
                  </Dlist>
                  <div className="daysInput">
                    <NumInput validInt onChange={handleDaysChange} value={LeaseDays} />
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
                          <b>{typeof item.value === 'object' && item.value !== null ? item.value.hex : item.value}</b>
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
            <Dialog
              footer={null}
              onCancel={() => setPrompt(false)}
              visible={prompt}
              destroyOnClose
              onOk={handleRent}
              closable={false}
            >
              <ContentBox>
                <div className="title">Prompt</div>
                <p>
                  If the lease is not returned for more than 8 hours after the expiry of the lease time, the liquidated
                  damage will be deducted, and the security deposit of {currentItem.price} will be deducted for each
                  overtime day after that.
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
            <Row gutter={[14, 14]}>
              {lendNfts.length ? (
                lendNfts.map((item, index) => (
                  <Col key={index}>
                    <RentCard
                      nftId={item.nftId}
                      onClick={() => handleShowModal(item)}
                      name={item.metadata?.name}
                      days={item.days}
                      collateral={item.collateral}
                      price={item.price}
                      img={item.metadata?.image}
                      isLending={item.isLending}
                      contract_type={item.standard}
                      penalty={item.penalty}
                      pay_type={item.pay_type}
                    />
                  </Col>
                ))
              ) : (
                <Empty text="Ooops, looks like nothing here." />
              )}
            </Row>
          </RentBox>
        </Col>
      </Row>
    </div>
  )
}
