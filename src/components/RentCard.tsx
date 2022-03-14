import React, { useMemo } from 'react'
import styled from 'styled-components'
import { NFTData, useStore } from '../hooks'
import { Img } from './Img'
import { BaseProps } from './NumInput'
import { toastify } from './Toastify'
import { CardBox, Details } from './Nft'
import BigNumber from 'bignumber.js'
import { Tag, Spin } from 'antd'
import { Loading3QuartersOutlined } from '@ant-design/icons'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Tips = styled.span`
  color: #aaa;
  font-size: 0.875rem;
`
export const PriceLabel = styled.span`
  margin-right: 0.25rem;
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
  collateral?: number
}

const Labels: React.FC<LabelProps> = ({ price, name, days, collateral }) => {
  const total = useMemo(() => {
    if (!days || !price || !collateral) {
      return 0
    }
    const _cost = new BigNumber(price as number).times(days as number)
    return _cost.plus(collateral).toString()
  }, [price, days, collateral])
  return (
    <div style={{ overflow: 'hidden' }}>
      <p>{name}</p>
      <PriceLabel>{total} Ξ </PriceLabel>
      <Tips>{days} days</Tips>
    </div>
  )
}
const FakeButtonBox = styled.button<{ theme?: string; block?: boolean }>`
  display: block;
  height: 2.5rem;
  cursor: pointer;
  border-radius: 1.25rem;
  padding: 0 1rem;
  line-height: 2.5rem;
  font-size: 0.875rem;
  width: ${({ block }) => (block ? '100%' : 'auto')};
  color: ${({ theme }) => (theme === 'ghost' ? 'var(--second-color)' : 'white')};
  background: ${({ theme }) => (theme === 'ghost' ? 'transparent' : 'var(--second-color)')};
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
  contract_type
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
          <Labels collateral={collateral} name={name} nftId={nftId} price={price} days={days as number} />
          <Standard color={contract_type === 'ERC721' ? 'processing' : 'orange'}>{contract_type}</Standard>
        </div>
        {!unOperate ? <Operate isLending={isLending} onClick={() => onclick} /> : null}
      </Details>
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
export const Standard = styled(Tag)`
  margin-top: 0.5rem;
`
