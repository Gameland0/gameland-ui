import React, { useEffect, useCallback, useMemo, useState } from 'react'
// import axios from 'axios'
import { Row, Col, Tag, Spin } from 'antd'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { Dialog } from '../components/Dialog'
import BigNumber from 'bignumber.js'
import { Img } from '../components/Img'
import { toastify } from '../components/Toastify'
import { NumInput } from '../components/DaysInput'
import { Loading3QuartersOutlined } from '@ant-design/icons'
import { RentCard } from '../components/RentCard'
import { isEmpty } from 'lodash'
import { Icon } from '../components/Icon'
import { http, formatAddress } from '../utils'
// import { BaseProps } from '../components/NumInput'
import { lowerCase } from 'lower-case'

export const RentBox = styled.div`
  margin: 5rem 0 6rem 1rem;
`
export const DayInfoBox = styled.div`
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
const FakeButtonBox = styled.button`
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
const antIcon = <Loading3QuartersOutlined style={{ fontSize: 16, color: 'white' }} spin />

export const FakeButton = ({ theme, children, loading, block, ...props }) => {
  return (
    <FakeButtonBox block={block} theme={theme} {...props}>
      {loading ? <Spin indicator={antIcon} /> : children}
    </FakeButtonBox>
  )
}
const Operate = ({ isLending }) => {
  return <>{isLending ? <FakeButton theme="ghost">Rent</FakeButton> : null}</>
}
export const DaysInfo = ({ progress, children }) => {
  return (
    <DayInfoBox progress={progress}>
      <span>{children}</span>
    </DayInfoBox>
  )
}
const Dlist = styled.div`
  width: 598px;
  height: 44%;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 16px;
  border-radius: 20px 20px 20px 20px;
  border: 1px solid #e5e5e5;
  padding: 1rem 2rem;
  div {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
  }
`
export const Tips = styled.div`
  width: 40%;
  height: 48px;
  font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
  line-height: 48px;
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
  font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
  font-weight: bold;
  color: #333333;
`
export const Description = styled.div`
  width: 100%;
  height: 16.43rem;
  position: relative;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px;
  padding: 24px 96px;
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
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
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
  margin-top: 36px;
  padding: 24px 60px;
  .attribute {
    width: 100%;
    margin-top: 4rem;
    div {
      width: 100%;
      height: 4rem;
      padding: 0 0rem;
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
  const [currentItem, setCurrentItem] = useState({})
  const [visible, setVisible] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const [LeaseDays, setdays] = useState('')
  const [collection, setCollection] = useState('')
  const [filterMenu, setFilterMenu] = useState(false)
  const [showNotFound, setShowNotFound] = useState(false)
  const [collectionFilterResult, setCollectionFilterResult] = useState([])
  const [description, setDescription] = useState('')
  const [RareAttribute, setRareAttribute] = useState([])
  const [SpecificAttribute, setSpecificAttribute] = useState([])
  const [lendNfts, setlendNfts] = useState([])
  const [renting, setRenting] = useState(false)
  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral
    const Penalty = new BigNumber(currentItem.penalty)
    const _cost = new BigNumber(currentItem.price).times(Number(LeaseDays))
    if (!LeaseDays) {
      return 0
    }
    return _cost.plus(collateral).plus(Penalty).toString()
  }, [LeaseDays])

  const compare = (sortby) => {
    return function (obj1, obj2) {
      const val1 = new BigNumber(obj1.price)
        .times(obj1.days)
        .plus(obj1.collateral)
        .toString()
      const val2 = new BigNumber(obj2.price)
        .times(obj2.days)
        .plus(obj2.collateral)
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
  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleCollectionChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setCollection(val)
  }, [])
  useEffect(() => {
    const getNftData = async () => {
      const { data } = await http.get(`/v0/opensea`)
      if (data.code) {
        const RendData = data.data.filter((item)=>{
          return !item.isBorrowed
        })
        setlendNfts(RendData)
      }
    }
    getNftData()
  }, [])
  const handleShowModal = async (item) => {
    setCurrentItem(item)
    setVisible(true)
  }
  const handleShowPrompt = () => {
    if (!LeaseDays) return
    if (lowerCase(String('account')) === lowerCase(String(currentItem.originOwner))) return
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
    console.log('handleRent')
  }
  const closes = (cb) => {
    console.log(cb())
    setVisible(cb())
  }

  return (
    <div className="RentBox">
      <Modal visible={visible} callback={closes}>
        <div className="detail flex">
          <div className="ImgBox">
            <Img src={currentItem.img} alt="" />
          </div>
          <div className="RentDetail">
            <div className="NftName">{currentItem.name}</div>
            <Dlist className="flex box-sizing">
              <div>
                <SpanLabel>Owner</SpanLabel>
                <span title={currentItem.originOwner}>
                  {formatAddress(currentItem.originOwner)}
                </span>
              </div>
              <div>
                <SpanLabel>Collateral</SpanLabel>
                <span>
                  {currentItem.collateral}&nbsp;
                  Sol&nbsp;
                  <Icon type={currentItem.pay_type} />
                </span>
              </div>
              <div>
                <SpanLabel>penalty</SpanLabel>
                <span>
                  {currentItem.penalty}&nbsp;
                  Sol&nbsp;
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
                    Sol&nbsp;
                  </span>
                  <Icon type={currentItem.pay_type} /> / day
                </span>
              </div>
              <div>
                <SpanLabel>Total</SpanLabel>
                <span className="blue bigSize">
                  {total}&nbsp;
                  Sol&nbsp;
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
              disabled={lowerCase(String('account')) === lowerCase(String(currentItem.originOwner)) || renting}
            >
              Rent
            </FakeButton>
          </div>
        </div>
        <br />
        <p className=" text-center">
          <span className="tips">
            {lowerCase(String('account')) === lowerCase(String(currentItem.originOwner))
              ? 'Unable to rent your own NFT'
              : undefined}
          </span>
        </p>
        <Description className="box-sizing">
          <h2 className="h2">Description</h2>
          <hr className="border" />
          <div className="describe">{description}</div>
        </Description>
        {SpecificAttribute.length ? (
          <Properties>
            <h2 className="h2">Properties</h2>
            <hr className="border" />
            <div className="rare">
              {SpecificAttribute.map((item, index) => (
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
        {RareAttribute.length ? (
          <StatsBox>
            <h2 className="h2">Stats</h2>
            <hr className="border" />
            <div className="attribute">
              {RareAttribute.map((item, index) => (
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
        <Details className="box-sizing">
          <h2 className="h2">Details</h2>
          <hr className="border" />
          <div className="attribute box-sizing">
            <div className="bg">
              <span className="b">Contract Address</span>
              <span> {currentItem.contractAddress}</span>
            </div>
            <div>
              <span className="b">Token ID</span>
              <span> {currentItem.nftId}</span>
            </div>
            <div className="bg">
              <span className="b">Token Standard</span>
              <span> {currentItem.standard}</span>
            </div>
            <div>
              <span className="b">Blockchain</span>
              <span>{'Polygon'}</span>
            </div>
          </div>
        </Details>
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
      <div className="Filling"></div>
      <div className="content flex">
        <div className="MenuBar">
          <div className="collection">
            <h2>Collection</h2>
            <div className="search">
              <span>
                <img src="assets/search_bar_icon_search.svg" />
              </span>
              <input onChange={handleCollectionChange} value={collection} placeholder="search" />
            </div>
            {collectionFilterResult && collectionFilterResult.length ? (
              <div className="result">
                {collectionFilterResult.map((item, index) => (
                  <div key={index}>
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
        <div>
          <div className="Sort">
            <div className="total">{0} results</div>
            <div className="filter" onClick={() => setFilterMenu(!filterMenu)}>
              Rencently Listed
              <img src="assets/icon_select.svg" className="arrowIcon" />
            </div>
            {filterMenu ? (
              <div className="sortSelect">
                <div className="border-bottom" onClick={() => setFilterMenu(false)}>
                  Price: Low to High
                </div>
                <div onClick={() => setFilterMenu(false)}>
                  Price: High to Low
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="RentNftBox flex flex-h-between">
            {lendNfts.length ? (
              lendNfts.map((item, index) => (
                <RentCard
                  key={index}
                  nftId={item.nftId}
                  onClick={() => handleShowModal(item)}
                  name={item.name}
                  days={item.days}
                  collateral={item.collateral}
                  price={item.price}
                  img={item.img}
                  isLending={item.isLending}
                  contract_type={item.standard}
                  penalty={item.penalty}
                  pay_type={item.pay_type}
                />
              ))
            ) : (
              <div className="EmptyWrap">Ooops, looks like nothing here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
