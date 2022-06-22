import React, { useMemo } from 'react'
import styled from 'styled-components'
import { NFTData, useStore } from '../hooks'
import { Img } from './Img'
import rentIcon from '../assets/icon_shopping_cart_default.svg'
import hoverIcon from '../assets/icon_shopping_cart.svg'
import { BaseProps } from './NumInput'
import { toastify } from './Toastify'
import BigNumber from 'bignumber.js'
import { Tag, Spin } from 'antd'
import { Loading3QuartersOutlined } from '@ant-design/icons'
import { Icon } from '../components/Icon'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Tips = styled.span`
  color: #aaa;
  font-size: 0.875rem;
`
export const CardBox = styled.div`
  position: relative;
  width: 11.75rem;
  height: 100%;
  background: #fff;
  border: 1px solid #ddd;
  cursor: pointer;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1%);
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
export const PriceLabel = styled.span`
  margin-right: 0.25rem;
`
export interface RentProps extends NFTData {
  onClick?: () => void
  unOperate?: boolean
  isLending?: boolean
  penalty: number
}
interface LabelProps {
  name: string
  nftId: string
  price?: number
  isExpired?: boolean
  days: number
  penalty: number
  right?: boolean
  collateral?: number
  type: any
}

const Labels: React.FC<LabelProps> = ({ price, name, days, collateral, type, penalty }) => {
  const total = useMemo(() => {
    if (!days || !price || !collateral) {
      return 0
    }
    const _cost = new BigNumber(price as number).times(days as number)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [price, days, collateral, penalty])
  return (
    <div style={{ overflow: 'hidden' }}>
      <p>{name}</p>
      <Standard>{type}</Standard>
      <PriceLabel>
        {total} <Icon />
      </PriceLabel>
      <Tips>{days} days</Tips>
    </div>
  )
}
const FakeButtonBox = styled.button<{ theme?: string; block?: boolean }>`
  display: block;
  height: 2.5rem;
  cursor: pointer;
  border-radius: 0px 0px 10px 10px;
  padding: 0 1rem;
  line-height: 2.5rem;
  font-size: 0.875rem;
  background: rgba(212, 212, 212, 0.1);
  color: #35caa9;
  border: none;
  position: relative;

  &:hover {
    background: #35caa9;
    color: #fff;
    .icon {
      background-image: url(${hoverIcon});
    }
  }
  &[disabled],
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .icon {
    width: 20px;
    height: 20px;
    background-image: url(${rentIcon});
    position: absolute;
    top: 10px;
    left: 63px;
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
  return (
    <>
      {isLending ? (
        <FakeButton theme="ghost">
          <div className="icon"></div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rent
        </FakeButton>
      ) : null}
    </>
  )
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RentCard: React.FC<RentProps> = ({
  unOperate,
  img,
  name,
  collateral,
  price,
  days,
  onClick,
  isLending,
  nftId,
  contract_type,
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
  return (
    <CardBox className="flex flex-column-between flex-column" onClick={handleClick}>
      {/* <Img src={Imgs[name] ? Imgs[name] : Default} alt="" /> */}
      <Img src={img} alt="" />
      <Details className="flex flex-h-between">
        <div>
          <Labels
            collateral={collateral}
            name={name}
            nftId={nftId}
            price={price}
            penalty={penalty}
            days={days as number}
            type={contract_type}
          />
        </div>
      </Details>
      {!unOperate ? <Operate isLending={isLending} onClick={() => onclick} /> : null}
    </CardBox>
  )
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Type = styled.div`
  position: absolute;
  left: 0;
  top: 2rem;
  z-index: 1;
  padding: 0.15rem 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  font-size: 0.825rem;
  border-top-right-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
`
export const Standard = styled.div`
  color: #d0d0d0;
  font-size: 14px;
  margin-bottom: 0.5rem;
`
