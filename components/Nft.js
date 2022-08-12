import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Img } from './Img'
import { BaseProps } from './NumInput'
import { ProgressLabelProps, ProgressLabels, InProgressProps } from './RentingCard'
import { toastify } from './Toastify'
import { Icon } from '../components/Icon'
// import Chaos from '../assets/chaos.png'
// import DiamondRing from '../assets/Diamond-ring.png'
// import Greatsword from '../assets/Greatsword.png'
// import Horn from '../assets/horn.png'
// import Map from '../assets/map.jpeg'
// import Minecraft from '../assets/minecraft.jpg'
// import Alien from '../assets/Alien.jpeg'
// import Eagle from '../assets/Eagle.png'
// import Devil from '../assets/Devil.png'
// import Fox from '../assets/Fox.jpeg'
// import Animal from '../assets/Unknown.jpeg'
// import Wizards from '../assets/Wizards.png'
// import Woof from '../assets/Woof.jpeg'
import BigNumber from 'bignumber.js'
import { PriceLabel, Standard } from './RentCard'
import { shortNumbers, getTimeLeftText, getTimeOutProgress, getTimeOutLeftText } from '../utils'

export const CardBox = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1%);
  }
  .overTime {
    width: 75px;
    position: absolute;
    top: 10px;
    right: 16px;
    color: #000;
    background: red;
    text-align: center;
    border-radius: 25px;
    z-index: 10;
  }
`
export const Details = styled.div`
  position: relative;
  margin-top: 1rem;
  padding: 0.5rem 1rem 1rem;
  p {
    margin-bottom: 0.3rem;
  }
`
const ProgressBar = styled.div`
  position: relative;
  width: 6rem;
  position: absolute;
  right: 0rem;
  top: 8px;
  background: white;
  border-radius: 2px;
  background: #e3e5e7;
  height: 4px;
  overflow: hidden;
`
const InProgressBox = styled.div`
  background: ${({ isExpired }) => (isExpired ? 'var(--warning)' : 'var(--in-progress)')};
  width: ${({ progress }) => (progress ? progress + '%' : 0)};
  height: 4px;
`
const Days = styled.span`
  color: #aaa;
  font-size: 0.875rem;
`
const InProgress= ({ progress }) => {
  return <InProgressBox progress={progress}></InProgressBox>
}
const LabelsWrap = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  p {
    display: block;
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
const Return = ({ right, name, isExpired, borrowAt }) => {
  const progress = useMemo(() => getTimeOutProgress(borrowAt), [borrowAt])
  const dayLeft = useMemo(() => getTimeOutLeftText(borrowAt), [borrowAt])
  // console.log(progress, dayLeft)
  return (
    <div style={{ overflow: 'hidden' }}>
      {right || <p>{name}</p>}
      <ProgressBar right={right}>
        <InProgress progress={progress} isExpired={isExpired} />
      </ProgressBar>
      <p style={{ textAlign: right ? 'right' : undefined, fontSize: '.75rem', marginTop: '22px' }}>
        {isExpired ? 'Expired' : dayLeft}
      </p>
    </div>
  )
}
const Labels = ({
  name,
  isLending,
  withdrawable,
  pay_type,
  nftId,
  price,
  days,
  collateral,
  penalty
}) => {
  const total = useMemo(() => {
    if (!days || !price || !collateral) {
      return 0
    }
    const _cost = new BigNumber(price).times(days)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [price, days, collateral])
  return (
    <LabelsWrap>
      <p>{name}</p>
      {isLending || withdrawable ? (
        <div>
          <PriceLabel>
            {total}&nbsp;
            <Icon />
          </PriceLabel>
          <Days>{days} days</Days>
        </div>
      ) : (
        <span className="tips" title={nftId}>
          {nftId}
        </span>
      )}
    </LabelsWrap>
  )
}
const FakeButtonBox = styled.div`
  display: block;
  margin-top: -8px;
  .button {
    display: block;
    height: 2rem;
    padding: ${({ type }) => (type === 'ghost' ? '0 .5rem' : '0 1rem')};
    line-height: 2rem;
    font-size: ${({ type }) => (type === 'ghost' ? '0.75rem' : '0.875rem')};
    color: ${({ type }) => (type === 'ghost' ? '#404040' : 'var(--primary-color)')};
    text-align: center;
    cursor: pointer;
    border-radius: 1.25rem;
    background: ${({ type }) => (type === 'ghost' ? 'transparent' : 'white')};
    border: ${({ type }) => (type === 'ghost' ? `1px solid #ccc` : '1px solid var(--primary-color)')};
    margin-bottom: 8px;

    &:hover {
      background-color: #41acef;
      color: white;
    }
  }
`
export const FakeButton = ({ type, children }) => {
  return <FakeButtonBox type={type}>{children}</FakeButtonBox>
}
const TabWrap = styled.span`
  padding: 0.45rem;
  height: 2rem;
  border-radius: 1rem;
  line-height: 2rem;
  border: 1px solid var(--third-light-color);
  color: var(--third-light-color);
`
export const Tag = ({ text }) => {
  return <TabWrap>{text}</TabWrap>
}
const OperateWrap = styled.div`
  position: absolute;
  right: 1rem;
  top: 1rem;
`
const Operate = ({
  withdrawable,
  isLending,
  isBorrowed,
  name,
  nftId,
  price,
  days,
  onLend,
  onSend,
  borrowAt,
  sellOrders,
  borrowDay
}) => {
  const dayLeft = useMemo(() => getTimeLeftText(borrowAt, borrowDay), [borrowDay, borrowAt])
  const [overTime, setOverTime] = useState(false)
  useEffect(() => {
    if (!dayLeft) return
    if (!nftId) return
    // console.log(dayLeft)
    if (dayLeft === 'Expired') {
      setOverTime(true)
      const currentTime = Math.floor(new Date().valueOf() / 1000) + 28800
      localStorage.setItem(nftId, currentTime.toString())
    }
  }, [dayLeft])
  return (
    <OperateWrap>
      {sellOrders ? (
        <Tag text="On sale" />
      ) : isLending ? (
        isBorrowed ? (
          overTime ? (
            <Return
              right
              borrowAt={borrowAt}
              name={name}
              nftId={nftId}
              price={price}
              days={days}
              borrowDay={borrowDay}
            />
          ) : (
            <ProgressLabels
              right
              borrowAt={borrowAt}
              name={name}
              nftId={nftId}
              price={price}
              days={days}
              borrowDay={borrowDay}
            />
          )
        ) : (
          <FakeButton type="ghost">Withdraw</FakeButton>
        )
      ) : withdrawable ? (
        <FakeButton type="ghost">Withdraw</FakeButton>
      ) : (
        <FakeButton type="fill">
          <button className="button" onClick={onLend}>
            Lend
          </button>
          <button className="button" onClick={onSend}>
            send
          </button>
        </FakeButton>
      )}
    </OperateWrap>
  )
}
export const Imgs = {
  // 'assets/blade.png': Blade,
  // Chaos,
  // 'Diamond ring': DiamondRing,
  // Greatsword,
  // Horn,
  // 'Central city': Map,
  // Minecraft,
  // Alien,
  // Woof,
  // Wizards,
  // Fox,
  // Eagle,
  // Devil,
  // Animal
}
const Default = 'assets/default.png'
export { Default }
export const Nft = ({
  unOperate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  img,
  name,
  price,
  days,
  onClick,
  onLend,
  onSend,
  isLending,
  withdrawable,
  isBorrowed,
  collateral,
  nftId,
  borrowAt,
  sell_orders,
  contract_type,
  borrowDay,
  pay_type,
  penalty
}) => {
  const handleClick = () => {
    onClick && onClick()
  }
  const Lend = () => {
    onLend && onLend()
  }
  const send = () => {
    onSend && onSend()
  }
  const src = img?.slice(-4)
  return (
    <div className="LendCardBox flex flex-column" onClick={handleClick}>
      {src === '.mp4' || src === 'webm' ? (
        <video
          width="314"
          height="314"
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
      <Details>
        <div>
          <Labels
            withdrawable={withdrawable}
            collateral={collateral}
            name={name}
            isLending={isLending}
            nftId={nftId}
            price={price}
            days={borrowDay}
            penalty={penalty}
            pay_type={pay_type}
          />
          <Standard color={contract_type === 'ERC721' ? 'processing' : 'orange'}>{contract_type}</Standard>
        </div>
        {!unOperate ? (
          <Operate
            nftId={nftId}
            name={name}
            price={price}
            borrowDay={borrowDay}
            days={days}
            borrowAt={borrowAt || ''}
            isLending={isLending}
            isBorrowed={isBorrowed}
            onClick={() => onclick}
            onLend={Lend}
            onSend={send}
            withdrawable={withdrawable}
            sellOrders={sell_orders}
          />
        ) : null}
      </Details>
    </div>
  )
}
