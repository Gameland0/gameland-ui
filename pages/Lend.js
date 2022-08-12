// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useMemo, useState } from 'react'
import { Row, Col, Button, Popconfirm } from 'antd'
import { Nft } from '../components/Nft'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { toastify } from '../components/Toastify'
import { filter, isEmpty } from 'lodash'
import BigNumber from 'bignumber.js'
import { SpanLabel, DaysInfo, RentBox } from './Rent'
import { Loading } from '../components/Loading'
import { Icon } from '../components/Icon'
import { http, getProgress } from '../utils'

export const Dlist = styled.div`
  flex-direction: column;
  position: relative;
  margin-top: 1rem;
  div {
    margin-bottom: 0.5rem;
  }
  .currentSelection {
    height: 36px;
    margin: 8px 0 0 0;
    padding: 0 0 0 16px;
    line-height: 36px;
    border-radius: 20px;
    background: #fff;
    position: relative;
    cursor: pointer;
  }
  .Options {
    width: 100%;
    height: 60px;
    background: #fff;
    border-radius: 16px;
    position: absolute;
    bottom: -68px;
    z-index: 99;
    div {
      cursor: pointer;
      padding: 0 0 0 16px;
      &:hover {
        background: #8cd8f8;
      }
    }
  }
`

const Lend = () => {
  const [currentItem, setCurrentItem] = useState({})
  const [visible, setVisible] = useState(false)
  const [expired, setExpired] = useState(false)
  const [liquidating, setLiquidating] = useState(false)
  const [borrowed, setBorrowed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const [awaiting, setAwaiting] = useState(false)
  const [myLendingNfts, setmyLendingNfts] = useState([])
  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const penalty = currentItem.penalty
    const collateral = currentItem.collateral
    const _cost = new BigNumber(currentItem.price).times(currentItem.borrowDay)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [currentItem])
  useEffect(() => {
    const getNftData = async () => {
      const { data } = await http.get(`/v0/opensea`)
      console.log(data)
      if (data.code) {
        const LendData = data.data.filter((item)=>{
          return item.isBorrowed
        })
        setmyLendingNfts(LendData)
      }
    }
    getNftData()
  }, [])
  const handleShowModal = async (item) => {
    setVisible(true)
    // setAwaiting(true)
    setCurrentItem(item)
    // setBorrowed(item.isBorrowed)
    // const _progress = getProgress(item.borrowAt, item.borrowDay)
    // setProgress(_progress)
    // if (item.isBorrowed) {
    //   setExpired(_progress >= 100)
    // } else {
    //   setExpired(false)
    // }
    // setAwaiting(false)
    console.log('handleShowModal')
  }

  const handleWithdraw = async () => {
    console.log('handleWithdraw')
  }

  const handleLiquidation = async () => {
    console.log('handleLiquidation')
  }

  return (
    <div className="container">
      <Modal visible={visible}>
        <div className="lendModalBox flex">
          <div>
            <Nft
              penalty={currentItem.penalty}
              nftId={currentItem.nftId}
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.img}
              contract_type={currentItem.standard}
              unOperate={true}
              borrowDay={currentItem.borrowDay}
              pay_type={currentItem.pay_type}
            />
          </div>
          <div className="lendDetail">
            <h3>{currentItem.name}</h3>
            <span className="tips">#{currentItem.nftId}</span>
            {awaiting ? (
              <Loading />
            ) : borrowed ? (
              <>
                <Dlist className="flex">
                  <div>
                    <SpanLabel>Borrower</SpanLabel>
                    <span title={currentItem.borrower}>{currentItem.borrower}</span>
                  </div>
                  <div>
                    <SpanLabel>Owner</SpanLabel>
                    <span title={currentItem.originOwner}>
                      {currentItem.originOwner}
                    </span>
                  </div>
                  <div>
                    <SpanLabel>Collateral</SpanLabel>
                    <span>
                      {currentItem.collateral}&nbsp;
                      {0}&nbsp;
                      <Icon type={currentItem.pay_type} />
                    </span>
                  </div>
                  <div>
                    <SpanLabel>penalty</SpanLabel>
                    <span>
                      {currentItem.penalty}&nbsp;
                      {0}&nbsp;
                      <Icon type={currentItem.pay_type} />
                    </span>
                  </div>
                  <div>
                    <SpanLabel>price</SpanLabel>
                    <span>
                      {currentItem.price}&nbsp;
                      {0}&nbsp;
                      <Icon type={currentItem.pay_type} /> / day
                    </span>
                  </div>
                  <div>
                    <SpanLabel>days</SpanLabel>
                    <span>{currentItem.borrowDay}</span>
                  </div>
                  <div>
                    <SpanLabel>Total</SpanLabel>
                    <span>
                      {total}&nbsp;
                      {0}&nbsp;
                      <Icon type={currentItem.pay_type} />
                    </span>
                  </div>
                </Dlist>
                <div>
                  <DaysInfo progress={progress}>Rent for {currentItem.borrowDay} days</DaysInfo>
                </div>
              </>
            ) : (
              <div>
                <br />
                <Button block shape="round" onClick={handleWithdraw} loading={withdrawing} size="large">
                  Withdraw
                </Button>
              </div>
            )}
            {expired && (
              <div>
                <br />
                <Popconfirm title="Are you sure to liquidation your NFT?" onConfirm={handleLiquidation}>
                  <Button shape="round" danger block loading={liquidating} size="large">
                    Liquidation
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>
        </div>
      </Modal>
      <div className="LentBox flex wrap">
        {myLendingNfts.length ? (
          myLendingNfts.map((item, index) => (
            <Nft
              key={index}
              onClick={() => handleShowModal(item)}
              name={item.name}
              days={item.days}
              borrowDay={item.borrowDay}
              collateral={item.collateral}
              price={item.price}
              nftId={item.nftId}
              borrowAt={item.borrowAt}
              img={item.img}
              isLending={item.isLending}
              isBorrowed={item.isBorrowed}
              withdrawable={item.withdrawable}
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
  )
}
export default Lend
