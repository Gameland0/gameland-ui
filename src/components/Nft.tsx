import React, { useMemo } from 'react'
import styled from 'styled-components'
import { NFTData, useStore } from '../hooks'
import { Img } from './Img'
import { BaseProps } from './NumInput'
import { ProgressLabelProps, ProgressLabels } from './RentingCard'
import { toastify } from './Toastify'
import { Icon } from '../components/Icon'
import Default from '../assets/default.png'
import Blade from '../assets/blade.png'
import Chaos from '../assets/chaos.png'
import DiamondRing from '../assets/Diamond-ring.png'
import Greatsword from '../assets/Greatsword.png'
import Horn from '../assets/horn.png'
import Map from '../assets/map.jpeg'
import Minecraft from '../assets/minecraft.jpg'
import Alien from '../assets/Alien.jpeg'
import Eagle from '../assets/Eagle.png'
import Devil from '../assets/Devil.png'
import Fox from '../assets/Fox.jpeg'
import Animal from '../assets/Unknown.jpeg'
import Wizards from '../assets/Wizards.png'
import Woof from '../assets/Woof.jpeg'
import BigNumber from 'bignumber.js'
import { PriceLabel, Standard } from './RentCard'
import { shortNumbers } from '../utils'

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
const Days = styled.span`
  color: #aaa;
  font-size: 0.875rem;
`
export interface NftProps extends NFTData {
  onClick?: () => void
  onLend?: () => void
  onSend?: () => void
  unOperate?: boolean
  withdrawable?: boolean
  size?: number
  borrowDay: number
  penalty: number
}
interface LabelProps {
  name: string
  isLending?: boolean
  nftId: string
  price?: number
  penalty: number
  days?: number
  collateral?: number
  withdrawable?: boolean
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
const Labels: React.FC<LabelProps> = ({ name, isLending, withdrawable, nftId, price, days, collateral, penalty }) => {
  const total = useMemo(() => {
    if (!days || !price || !collateral) {
      return 0
    }
    const _cost = new BigNumber(price as number).times(days as number)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [price, days, collateral])
  return (
    <LabelsWrap>
      <p>{name}</p>
      {isLending || withdrawable ? (
        <div>
          <PriceLabel>
            {total} <Icon />
          </PriceLabel>
          <Days>{days} days</Days>
        </div>
      ) : (
        <span className="tips" title={nftId}>
          #{shortNumbers(nftId, 12)}
        </span>
      )}
    </LabelsWrap>
  )
}
const FakeButtonBox = styled.div<{ type?: string }>`
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

interface FakeButtonProps extends BaseProps {
  type?: 'fill' | 'ghost'
  onLend?: () => void
  onClick?: () => void
  onSend?: () => void
}
export const FakeButton: React.FC<FakeButtonProps> = ({ type, children }) => {
  return <FakeButtonBox type={type}>{children}</FakeButtonBox>
}
interface OperateProps extends ProgressLabelProps {
  isLending?: boolean
  onClick?: () => void
  onLend?: () => void
  onSend?: () => void
  isBorrowed?: boolean
  withdrawable?: boolean
}
const TabWrap = styled.span`
  padding: 0.45rem;
  height: 2rem;
  border-radius: 1rem;
  line-height: 2rem;
  border: 1px solid var(--third-light-color);
  color: var(--third-light-color);
`
export const Tag: React.FC<{ text: string }> = ({ text }) => {
  return <TabWrap>{text}</TabWrap>
}
const OperateWrap = styled.div`
  position: absolute;
  right: 1rem;
  top: 1rem;
`
const Operate: React.FC<OperateProps> = ({
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
  return (
    <OperateWrap>
      {sellOrders ? (
        <Tag text="On sale" />
      ) : isLending ? (
        isBorrowed ? (
          <ProgressLabels
            right
            borrowAt={borrowAt}
            name={name}
            nftId={nftId}
            price={price}
            days={days as number}
            borrowDay={borrowDay}
          />
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
export const Imgs: Record<string, string> = {
  Blade,
  Chaos,
  'Diamond ring': DiamondRing,
  Greatsword,
  Horn,
  'Central city': Map,
  Minecraft,
  Alien,
  Woof,
  Wizards,
  Fox,
  Eagle,
  Devil,
  Animal
}
export { Default }
export const Nft: React.FC<NftProps> = ({
  unOperate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  img,
  size,
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
  penalty
}) => {
  const { networkError } = useStore()
  const handleClick = () => {
    if (networkError) {
      toastify.error('Please connect to valid network.')
      return
    }
    onClick && onClick()
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
    <CardBox className="flex flex-column" onClick={handleClick}>
      {/* <Img src={Imgs[name] ? Imgs[name] : Default} alt={name} /> */}
      <Img src={img} alt={name} />
      <Details>
        <div>
          <Labels
            withdrawable={withdrawable}
            collateral={collateral}
            name={name}
            isLending={isLending}
            nftId={nftId}
            price={price}
            days={days}
            penalty={penalty}
          />
          <Standard color={contract_type === 'ERC721' ? 'processing' : 'orange'}>{contract_type}</Standard>
        </div>
        {!unOperate ? (
          <Operate
            nftId={nftId}
            name={name}
            price={price}
            borrowDay={borrowDay}
            days={days as number}
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
    </CardBox>
  )
}
