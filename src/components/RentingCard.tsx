import React, { useMemo } from 'react'
import styled from 'styled-components'
import { NFTData } from '../hooks'
import { getProgress, getTimeLeftText } from '../utils'
import { Img } from './Img'
import { Default, Imgs } from './Nft'
import { BaseProps } from './NumInput'

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
`
const Details = styled.div`
  margin-top: 1rem;
  padding: 0.5rem;
  p {
    margin-bottom: 0.3rem;
  }
`
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
}
const ProgressBar = styled.div<{ right?: boolean }>`
  position: relative;
  width: ${({ right }) => (right ? '4rem' : '6rem')};
  margin: 0.5rem 0 0.35rem;
  background: white;
  border-radius: 2px;
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
  days: number
  borrowAt: string
  right?: boolean
}

export const ProgressLabels: React.FC<ProgressLabelProps> = ({ right, name, isExpired, days, borrowAt }) => {
  const progress = useMemo(() => getProgress(borrowAt, days), [borrowAt, days])
  const dayLeft = useMemo(() => getTimeLeftText(borrowAt, days), [days, borrowAt])

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
  height: 2.5rem;
  padding: 0 1rem;
  line-height: 2.5rem;
  font-size: 0.875rem;
  color: ${({ type }) => (type === 'ghost' ? 'var(--success)' : 'white')};
  background: ${({ type }) => (type === 'ghost' ? 'transparent' : 'var(--success)')};
  border: ${({ type }) => (type === 'ghost' ? `1px solid var(--success)` : '1px solid transparent')};

  &:hover {
    background: ${({ type }) => (type === 'ghost' ? 'transparent' : 'var(--success-light)')};
    color: ${({ type }) => (type === 'ghost' ? 'var(--success-light)' : 'white')};
    border: ${({ type }) => (type === 'ghost' ? `1px solid var(--success-light)` : '1px solid transparent')};
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
  return <>{isExpired ? null : <FakeButton type="ghost">Repay</FakeButton>}</>
}
export const RentingCard: React.FC<RentingProps> = ({
  unOperate,
  name,
  price,
  days,
  onClick,
  isExpired,
  borrowAt,
  nftId
}) => {
  return (
    <CardBox className="flex flex-column-between flex-column" onClick={onClick}>
      <Img src={Imgs[name] ? Imgs[name] : Default} alt="" />
      {/* <Img src={img} alt="" /> */}
      <Details className="flex flex-h-between flex-v-end">
        <div>
          <ProgressLabels borrowAt={borrowAt} name={name} nftId={nftId} price={price} days={days as number} />
        </div>
        {!unOperate ? <Operate isExpired={isExpired} onClick={() => onclick} /> : null}
      </Details>
    </CardBox>
  )
}
