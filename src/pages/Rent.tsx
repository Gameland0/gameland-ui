// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useCallback, useMemo, useState } from 'react'

// import { useGreeterContract } from '../hooks'
import { Row, Col } from 'antd'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { Dialog } from '../components/Dialog'
import BigNumber from 'bignumber.js'
import { useActiveWeb3React, useGameLandContract, useStore, useControlContract, useAssetContract } from '../hooks'
import { toastify } from '../components/Toastify'
import { useLendingNfts } from '../hooks/useLendingNfts'
import { Nft as NftCard, NftProps } from '../components/Nft'
import { Contract } from '@ethersproject/contracts'
// import polygonIcon from '../assets/polygon_icon.svg'
import search from '../assets/search_bar_icon_search.svg'
import arrow from '../assets/icon_select.svg'
import { NumInput } from '../components/DaysInput'
// import { NftView } from '../components/NftView'
import { Tag, Spin } from 'antd'
import { Loading3QuartersOutlined } from '@ant-design/icons'
import { RentCard } from '../components/RentCard'
import { isEmpty } from 'lodash'
import { fetchReceipt, formatAddress, ZeroAddress, formatting } from '../utils'
import { http2, http } from '../components/Store'
import { Icon } from '../components/Icon'
import { BaseProps } from '../components/NumInput'
import { parseEther } from '@ethersproject/units'
import { lowerCase } from 'lower-case'
import { Empty } from '../components/Empty'
import { fetchAbi } from './Dashboard/index'

export const RentBox = styled.div`
  margin: 4rem 0 6rem 3rem;
`
const Sort = styled.div`
  width: 67.6%;
  height: 3.75rem;
  display: flex;
  background: #fff;
  justify-content: space-between;
  position: fixed;
  z-index: 99;
  margin-left: 3rem;
  .total {
    font-size: 16px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
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
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
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
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
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
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #35caa9;
  }
`
const FakeButtonBox = styled.button<{ theme?: string; block?: boolean }>`
  display: block;
  height: 12%;
  cursor: pointer;
  border-radius: 1.25rem;
  padding: 0 1rem;
  line-height: 2.5rem;
  font-size: 0.875rem;
  width: 93%;
  color: #fff;
  background: #35caa9;
  margin-left: 2.5rem;
  border: ${({ theme }) => (theme === 'ghost' ? `1px solid var(--second-color)` : '1px solid transparent')};

  &:hover {
    background: ${({ theme }) => (theme === 'ghost' ? 'transparent' : 'var(--second-light-color)')};
    color: ${({ theme }) => (theme === 'ghost' ? 'var(--second-light-color)' : 'white')};
    border: ${({ theme }) => (theme === 'ghost' ? `1px solid var(--second-light-color)` : '1px solid transparent')};
  }
  &[disabled],
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
  width: 92%;
  height: 40%;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 2rem;
  margin-left: 2.5rem;
  border-radius: 20px 20px 20px 20px;
  border: 1px solid #e5e5e5;
  padding: 1rem 2rem;
  div {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
  }
`
const ImgBox = styled.div`
  img {
    width: 95%;
    height: 95%;
    border-radius: 20px 20px 20px 20px;
  }
`
const Title = styled.h1`
  margin-left: 2.5rem;
  line-height: 1.5rem;
`
const Tips = styled.div`
  width: 40%;
  height: 3rem;
  line-height: 1.4rem;
  text-align: right;
  font-size: 16px;
  font-weight: 400;
  color: #35caa9;
  position: absolute;
  top: 7%;
  right: 5%;
`

export const SpanLabel = styled.span`
  display: inline-block;
  width: 5rem;
  font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
  font-weight: bold;
  color: #333333;
`
const Description = styled.div`
  width: 75rem;
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
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
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
const Properties = styled.div`
  width: 75rem;
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
    div {
      width: 210px;
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

const StatsBox = styled.div`
  width: 75rem;
  min-height: 14rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  margin-top: 4rem;

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
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        color: #333333;
      }
    }
  }
`
const Details = styled.div`
  width: 75rem;
  min-height: 12rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  margin-top: 4rem;

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
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        color: #333333;
      }
    }
  }
`
export const ContentBox = styled.div`
  .title {
    width: 100%;
    font-size: 24px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
    text-align: center;
  }
  p {
    margin-top: 2rem;
    font-size: 1.1rem;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
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
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
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
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
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
  const { library, account } = useActiveWeb3React()
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
  const { mutateDebts } = useStore()
  const gamelandContract = useGameLandContract()
  const AssetContract = useAssetContract()
  const ControlContract = useControlContract()
  const [renting, setRenting] = useState(false)
  const { nfts } = useStore()
  useEffect(() => {
    const filterCollection = () => {
      const arr: any[] = []
      lendingNfts.map((item: any) => {
        if (item.contractName.indexOf(collection) !== -1 && collection !== '') {
          arr.push(item)
          setCollectionFilterResult(arr)
          setShowNotFound(false)
        } else {
          setCollectionFilterResult([])
          setShowNotFound(true)
        }
      })
      if (collection === '') {
        setShowNotFound(false)
      }
      if (lendingNfts.length == 0) {
        if (collection) {
          setShowNotFound(true)
        }
      }
    }
    filterCollection()
  }, [collection])

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
        if (nfts) {
          const newArr = gamelandNftIdArr.filter((item: any) => {
            return item !== '0x00'
          })
          nfts.map((item: any) => {
            removeByValue(newArr, item.gamelandNftId)
          })
          for (let i = 0; i < newArr.length; i++) {
            const list = await AssetContract.get_nfts(newArr[i])
            const index = await AssetContract.get_nftsindex(newArr[i])
            const ABI = await fetchAbi(list.form_contract)
            const contract = new Contract(list.form_contract, ABI, library?.getSigner())
            const tokenURI = await contract.tokenURI(list.nft_id)
            const { data } = await http.get(tokenURI)
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
              name: list.nft_name,
              img: data.image
            }
            console.log(params)
            await http2.post(`/v0/opensea/`, params)
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
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).plus(Penalty).toString()
  }, [currentItem])

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
      if (val1 < val2) {
        if (sortby == 'lift') return -1
        return 1
      } else if (val1 > val2) {
        if (sortby == 'lift') return 1
        return -1
      } else {
        return 0
      }
    }
  }

  const ascending = () => {
    lendingNfts.sort(compare('lift'))
  }

  const descending = () => {
    lendingNfts.sort(compare(''))
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
    if (!gamelandContract) {
      toastify.error('Contract not found, please connect wallet.')
      return
    }
    const index = await AssetContract?.get_nftsindex(item.gamelandNftId)
    if (Number(item.lendIndex) != Number(index.toString())) {
      const params = {
        lendIndex: index.toString()
      }
      await http2.put(`/v0/opensea/${item.gamelandNftId}`, params)
    }
    setCurrentItem(item)
    setVisible(true)
    http.defaults.headers.common['Authorization'] = '40966ceb-b776-42fa-8236-620bf99bd1ef'
    const nftAttributeData = await http.get(
      `https://api.nftport.xyz/v0/nfts/${item.contractAddress}/${item.nftId}?chain=polygon`
    )
    // console.log(nftAttributeData.data.nft.metadata)
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
  }
  const handleShowPrompt = () => {
    if (!LeaseDays) {
      toastify.error('Please enter rental days.')
      return
    }
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
      setRenting(true)

      const collateral = new BigNumber(currentItem.collateral as unknown as string)
      const days = new BigNumber(LeaseDays as unknown as string)
      const price = new BigNumber(currentItem.price as unknown as string)
      const cost = days.times(price)
      const Penalty = new BigNumber(currentItem.penalty as unknown as string)
      const amount = collateral.plus(cost).plus(Penalty).toString()
      console.log(parseEther(amount))

      const rented = await ControlContract?.connect(library.getSigner()).rent(currentItem.lendIndex, LeaseDays, {
        value: parseEther(amount)
      })
      console.log(rented)
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
      const res: any = await http2.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)

      if (res.data.code === 1) {
        setRenting(false)
        toastify.success('succeed')
        mutateDebts(undefined, true)
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
                    <div key={index}>{item.contractName}</div>
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
                    <img src={currentItem.metadata?.image} alt="" />
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
                        {currentItem.collateral} <Icon />
                      </span>
                    </div>
                    <div>
                      <SpanLabel>penalty</SpanLabel>
                      <span>
                        {currentItem.penalty} <Icon />
                      </span>
                    </div>
                    <div>
                      <SpanLabel>days</SpanLabel>
                      <span>{currentItem.days}</span>
                    </div>
                    <div>
                      <SpanLabel>price</SpanLabel>
                      <span className="blue">
                        <span className="bigSize">{currentItem.price}</span>
                        <Icon /> / day
                      </span>
                    </div>
                    <div>
                      <SpanLabel>Total</SpanLabel>
                      <span className="blue bigSize">
                        {total} <Icon />
                      </span>
                    </div>
                  </Dlist>
                  <div className="daysInput">
                    <NumInput validInt onChange={handleDaysChange} value={LeaseDays} />
                    <div className="divider"></div>
                    <Tips>Available time for renting is for 1-{currentItem.days} days.</Tips>
                  </div>
                  <br />
                  <FakeButton
                    onClick={handleShowPrompt}
                    loading={renting}
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
                      <span>Polygon</span>
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
              {lendingNfts.length ? (
                lendingNfts.map((item, index) => (
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
