import React from 'react'
import styled from 'styled-components'
import { NFTData, useStore } from '../hooks'
import { Img } from './Img'
import { Default, Imgs } from './Nft'
import { BaseProps } from './NumInput'
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
export interface RentProps extends NFTData {
  onClick?: () => void
  unOperate?: boolean
  isLending?: boolean
}
interface LabelProps {
  name: string
  nftId: string
  price?: number
  isExpired?: boolean
  days: number
  right?: boolean
}

const Labels: React.FC<LabelProps> = ({ price, name, days }) => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <p>{name}</p>
      <span>{price} Ξ / day</span>
      <Days>{days} days</Days>
    </div>
  )
}
const FakeButtonBox = styled.div<{ type?: string }>`
  display: block;
  height: 2.5rem;
  padding: 0 1rem;
  line-height: 2.5rem;
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
  isLending?: boolean
  onClick?: () => void
}
const Operate: React.FC<OperateProps> = ({ isLending }) => {
  return <>{isLending ? <FakeButton type="ghost">Rent</FakeButton> : null}</>
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RentCard: React.FC<RentProps> = ({ unOperate, img, name, price, days, onClick, isLending, nftId }) => {
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
      <Img src={Imgs[name] ? Imgs[name] : Default} alt="" />
      <Details className="flex flex-h-between flex-v-end">
        <div>
          <Labels name={name} nftId={nftId} price={price} days={days as number} />
        </div>
        {!unOperate ? <Operate isLending={isLending} onClick={() => onclick} /> : null}
      </Details>
    </CardBox>
  )
}
