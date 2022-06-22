import React, { useMemo } from 'react'
import styled from 'styled-components'
import { NFTData } from '../hooks'
import { getProgress, getTimeLeftText } from '../utils'
import { Img } from './Img'
import { BaseProps } from './NumInput'
import { CardBox, Details } from './Nft'
import { Standard } from './RentCard'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Days = styled.span`
  color: #aaa;
  font-size: 0.875rem;
  margin-left: 0.5rem;
`
export interface RentingProps extends NFTData {
  onClick?: () => void
  unOperate?: boolean
  isExpired?: boolean
  borrowAt: string
  borrowDay: number
}
const ProgressBar = styled.div<{ right?: boolean }>`
  position: relative;
  width: ${({ right }) => (right ? '4rem' : '6rem')};
  margin: 0.5rem 0 0.35rem;
  background: white;
  border-radius: 2px;
  background: #e3e5e7;
  height: 4px;
  overflow: hidden;
`
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProgressText = styled.div`
  position: absolute;
  left: 50%;
  top: 0.5rem;
  transform: translateX(-50%);
  font-size: 0.875rem;
  color: #3b3b3b;
`
const InProgressBox = styled.div<InProgressProps>`
  background: ${({ isExpired }) => (isExpired ? 'var(--warning)' : 'var(--in-progress)')};
  width: ${({ progress }) => (progress ? progress + '%' : 0)};
  height: 4px;
`
interface InProgressProps {
  progress: number
  isExpired?: boolean
}
const InProgress: React.FC<InProgressProps> = ({ progress }) => {
  return <InProgressBox progress={progress}></InProgressBox>
}
export interface ProgressLabelProps {
  name: string
  nftId: string
  price?: number
  isExpired?: boolean
  borrowDay: number
  days: number
  borrowAt: string
  right?: boolean
  sellOrders?: Record<string, any>[]
}

export const ProgressLabels: React.FC<ProgressLabelProps> = ({ right, name, isExpired, days, borrowAt, borrowDay }) => {
  const progress = useMemo(() => getProgress(borrowAt, borrowDay), [borrowAt, borrowDay])
  const dayLeft = useMemo(() => getTimeLeftText(borrowAt, borrowDay), [borrowDay, borrowAt])

  return (
    <div style={{ overflow: 'hidden' }}>
      {right || <p>{name}</p>}
      <ProgressBar right={right}>
        <InProgress progress={progress} isExpired={isExpired} />
      </ProgressBar>
      <p style={{ textAlign: right ? 'right' : undefined, fontSize: '.75rem' }}>{isExpired ? 'Expired' : dayLeft}</p>
    </div>
  )
}
const FakeButtonBox = styled.div<{ type?: string }>`
  display: block;
  height: 2rem;
  border-radius: 1rem;
  padding: 0 1rem;
  line-height: 2rem;
  font-size: 0.875rem;
  color: ${({ type }) => (type === 'ghost' ? 'var(--second-color)' : 'white')};
  background: ${({ type }) => (type === 'ghost' ? 'transparent' : 'var(--second-color)')};
  border: ${({ type }) => (type === 'ghost' ? `1px solid var(--second-color)` : '1px solid transparent')};

  &:hover {
    background: ${({ type }) => (type === 'ghost' ? 'transparent' : 'var(--second-light-color)')};
    color: ${({ type }) => (type === 'ghost' ? 'var(--second-light-color)' : 'white')};
    border: ${({ type }) => (type === 'ghost' ? `1px solid var(--second-light-color)` : '1px solid transparent')};
  }
`

interface FakeButtonProps extends BaseProps {
  type?: 'fill' | 'ghost'
  onClick?: () => void
}
export const FakeButton: React.FC<FakeButtonProps> = ({ type, children }) => {
  return <FakeButtonBox type={type}>{children}</FakeButtonBox>
}
interface OperateProps {
  onClick?: () => void
  isExpired?: boolean
}
const Operate: React.FC<OperateProps> = ({ isExpired }) => {
  return <>{isExpired ? null : <FakeButton type="ghost">Return</FakeButton>}</>
}
export const RentingCard: React.FC<RentingProps> = ({
  unOperate,
  name,
  price,
  days,
  onClick,
  isExpired,
  borrowAt,
  nftId,
  img,
  contract_type,
  borrowDay
}) => {
  return (
    <CardBox className="flex flex-column-between flex-column" onClick={onClick}>
      {/* <Img src={Imgs[name] ? Imgs[name] : Default} alt="" /> */}
      <Img src={img} alt="" />
      <Details className="flex flex-h-between">
        <div>
          <ProgressLabels
            borrowAt={borrowAt}
            name={name}
            nftId={nftId}
            price={price}
            days={days as number}
            borrowDay={borrowDay as number}
          />
          <Standard color="processing">{contract_type}</Standard>
        </div>
        {!unOperate ? <Operate isExpired={isExpired} onClick={() => onclick} /> : null}
      </Details>
    </CardBox>
  )
}
