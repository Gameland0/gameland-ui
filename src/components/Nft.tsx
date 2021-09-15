import React from 'react'
import styled from 'styled-components'
import { NFTData, useStore } from '../hooks'
import { Img } from './Img'
import { BaseProps } from './NumInput'
import { ProgressLabelProps, ProgressLabels } from './RentingCard'
import { toastify } from './Toastify'

const CardBox = styled.div`
  width: 100%;
  height: 100%;
  background: #505050;
  border: 1px solid #707070;
  border-right: none;
  padding: 1rem;
  cursor: pointer;

  &:last-child {
    border-right: 1px solid #707070;
  }
  img {
    width: 100%;
    height: auto;
    border-radius: 1rem;
  }
`
const Details = styled.div`
  margin-top: 1rem;
  padding: 0.5rem;
  p {
    margin-bottom: 0.3rem;
  }
`
const Days = styled.span`
  color: #aaa;
  font-size: 0.875rem;
  margin-left: 0.5rem;
`
export interface NftProps extends NFTData {
  onClick?: () => void
  unOperate?: boolean
  withdrawable?: boolean
}
interface LabelProps {
  name: string
  isLending?: boolean
  nftId: string
  price?: number
  days?: number
  withdrawable?: boolean
}
const Labels: React.FC<LabelProps> = ({ name, isLending, withdrawable, nftId, price, days }) => {
  return (
    <>
      <p>{name}</p>
      {isLending || withdrawable ? (
        <>
          <span>{price} ⬨ / day</span>
          <Days>{days} days</Days>
        </>
      ) : (
        <span className="tips">#{nftId}</span>
      )}
    </>
  )
}
const FakeButtonBox = styled.div<{ type?: string }>`
  display: block;
  height: 2rem;
  padding: 0 1rem;
  line-height: 2rem;
  font-size: 0.875rem;
  color: white;
  background: ${({ type }) => (type === 'ghost' ? 'transparent' : 'var(--primary-color)')};
  border: ${({ type }) => (type === 'ghost' ? `1px solid white` : '1px solid transparent')};

  &:hover {
    background: ${({ type }) => (type === 'ghost' ? 'transparent' : 'var(--primary-light-color)')};
  }
`

interface FakeButtonProps extends BaseProps {
  type?: 'fill' | 'ghost'
  onClick?: () => void
}
export const FakeButton: React.FC<FakeButtonProps> = ({ type, children }) => {
  return <FakeButtonBox type={type}>{children}</FakeButtonBox>
}
interface OperateProps extends ProgressLabelProps {
  isLending?: boolean
  onClick?: () => void
  isBorrowed?: boolean
}
const Operate: React.FC<OperateProps> = ({ isLending, isBorrowed, name, nftId, price, days, borrowAt }) => {
  return (
    <>
      {isLending ? (
        isBorrowed ? (
          <ProgressLabels right borrowAt={borrowAt} name={name} nftId={nftId} price={price} days={days as number} />
        ) : (
          <FakeButton type="ghost">Withdraw</FakeButton>
        )
      ) : (
        <FakeButton>Lend</FakeButton>
      )}
    </>
  )
}
export const Nft: React.FC<NftProps> = ({
  unOperate,
  img,
  name,
  price,
  days,
  onClick,
  isLending,
  withdrawable,
  isBorrowed,
  nftId,
  borrowAt
}) => {
  const { networkError } = useStore()
  const handleClick = () => {
    if (networkError) {
      toastify.error('Please connect to valid network.')
      return
    }
    onClick && onClick()
  }
  return (
    <CardBox className="flex flex-column-between flex-column" onClick={handleClick}>
      <Img src={img} alt={name} />
      <Details className="flex flex-h-between">
        <div>
          <Labels
            withdrawable={withdrawable}
            name={name}
            isLending={isLending}
            nftId={nftId}
            price={price}
            days={days}
          />
        </div>
        {!unOperate ? (
          <Operate
            nftId={nftId}
            name={name}
            price={price}
            days={days as number}
            borrowAt={borrowAt || ''}
            isLending={isLending}
            isBorrowed={isBorrowed}
            onClick={() => onclick}
          />
        ) : null}
      </Details>
    </CardBox>
  )
}
