import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Img } from './Img'
// import { BaseProps } from './NumInput'
import BigNumber from 'bignumber.js'
import { Tag, Spin } from 'antd'
import { Loading3QuartersOutlined } from '@ant-design/icons'
const Tips = styled.span`
  color: #aaa;
  font-size: 0.875rem;
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

const Labels = ({ price, name, days, collateral, type, penalty, pay_type }) => {
  const total = useMemo(() => {
    if (!days || !price || !collateral) {
      return 0
    }
    const _cost = new BigNumber(price).times(days)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [price, days, collateral, penalty])
  return (
    <div style={{ overflow: 'hidden' }}>
      <p style={{ overflow:'hidden',whiteSpace:'nowrap', textOverflow:'ellipsis', width:'100px' }}>{name}</p>
      <Standard>{type}</Standard>
    </div>
  )
}
const FakeButtonBox = styled.button`
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
      background-image: url(assets/icon_shopping_cart.svg);
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
    background-image: url(assets/icon_shopping_cart_default.svg);
    position: absolute;
    top: 10px;
  }
  @media screen and (min-width: 1440px) {
    .icon {
      left: 43px;
    }
  }
  @media screen and (min-width: 1920px) {
    .icon {
      left: 63px;
    }
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
export const Operate = ({ isLending }) => {
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
export const RentCard = ({
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
  pay_type,
  penalty
}) => {
  const handleClick = () => {
    onClick && onClick()
  }
  const src = img?.slice(-4)
  return (
    <div className="CardBox flex flex-column-between flex-column" onClick={handleClick}>
      {src === '.mp4' || src === 'webm' ? (
        <video
          width="185"
          height="185"
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
      <Details className="flex flex-h-between">
        <div>
          <Labels
            collateral={collateral}
            name={name}
            nftId={nftId}
            price={price}
            penalty={penalty}
            days={days}
            type={contract_type}
            pay_type={pay_type}
          />
        </div>
      </Details>
      {!unOperate ? <Operate isLending={isLending} onClick={() => onclick} /> : null}
    </div>
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
