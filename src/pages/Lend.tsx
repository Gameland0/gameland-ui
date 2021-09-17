// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// import { useGreeterContract } from '../hooks'
import { Row, Col, Button } from 'antd'
import { Card, CardProps } from '../components/Card'
import { Nft } from '../components/Nft'
import { NumInput } from '../components/NumInput'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { GameLandAddress, NFTData, useActiveWeb3React, useGameLandContract, useMyNftContract, useStore } from '../hooks'
import { toastify } from '../components/Toastify'
import { formatAddress, getProgress, ZeroAddress, ZeroNftInfo } from '../utils'
import { formatEther } from '@ethersproject/units'
import { isEmpty, isEqual } from 'lodash'
import { useMyLendingNfts } from '../hooks/useMyLendingNfts'
import { http } from '../components/Store'
import BigNumber from 'bignumber.js'
import { SpanLabel, DaysInfo } from './Rent'
const RentBox = styled.div`
  margin: 2rem;
`

export const Dlist = styled.div`
  flex-direction: column;
  margin-top: 1rem;
  div {
    margin-bottom: 0.5rem;
  }
`

export const Lend = () => {
  const { account } = useActiveWeb3React()
  const [currentItem, setCurrentItem] = useState({} as NFTData)
  const [visible, setVisible] = useState(false)
  const gameland = useGameLandContract()
  const nft = useMyNftContract()
  const [isApproved, setIsApproved] = useState(false)
  const myLendingNfts = useMyLendingNfts()

  const [price, setPrice] = useState('')
  const [days, setdays] = useState('')
  const [collateral, setCollateral] = useState('')
  const [lending, setLending] = useState(false)
  const [borrowed, setBorrowed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const [approving, setApproving] = useState(false)
  const [withdrawable, setWithdrawable] = useState(false)
  const { mutateNfts } = useStore()
  // useEffect(() => {
  //   console.log(greeter?.setGreeting('hll'))
  // }, [greeter])

  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).toString()
  }, [currentItem])

  const handleShowModal = async (item: CardProps) => {
    setCurrentItem(item)
    setVisible(true)

    try {
      let _lending = await gameland?.get_all_nftinfo(item.nftId)
      _lending = _lending && _lending.map((item: any) => formatEther(item).toString())

      const _borrowed = await gameland?.check_the_borrow_status(item.nftId)
      setBorrowed(_borrowed)
      setWithdrawable(!isEqual(_lending, ZeroNftInfo) && !_borrowed)
      if (_borrowed) {
        const _progress = getProgress(item.borrowAt as string, item.days as number)
        setProgress(_progress)
      }
    } catch (err) {
      throw err
    }

    if (nft) {
      console.log(item)

      const approveAddress = await nft.getApproved(item.nftId)
      console.log(approveAddress)

      setIsApproved(approveAddress === ZeroAddress)
    }
  }

  const handleCostChange = useCallback((val) => setPrice(val), [])
  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleCollateralChange = useCallback((val) => setCollateral(val), [])

  const handleLend = async () => {
    try {
      setLending(true)
      const deposited = await gameland?.deposit(price, days, currentItem.nftId, collateral)
      console.log(deposited)
      await deposited.wait()

      const params = {
        isLending: true,
        price: price as unknown as number,
        days: days as unknown as number,
        collateral: collateral as unknown as number
      }
      console.log(params)

      const res: any = await http.put(`/api/nft/${currentItem.nftId}`, params)
      console.log(res)

      setLending(false)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setPrice('')
        setCollateral('')
        setdays('')
        setVisible(false)
        mutateNfts(undefined, true)
      } else {
        throw res.message || res.data.message
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.message)
      setLending(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    if (nft) {
      console.log(GameLandAddress, currentItem.nftId)
      try {
        const approvetx = await nft.approve(GameLandAddress, currentItem.nftId)
        await approvetx.wait()
        setIsApproved(true)
      } catch (err: any) {
        toastify.error(err.message)
      }
    }
    setApproving(false)
  }

  const handleWithdraw = async () => {
    if (gameland) {
      try {
        setWithdrawing(true)
        const withdrawnft = await gameland.withdrawnft(currentItem.nftId)
        await withdrawnft.wait()
        const owner = await nft?.ownerOf(currentItem.nftId)
        if (owner === account) {
          const params = {
            isLending: false,
            price: 0,
            days: 0,
            collateral: 0,
            borrower: null,
            borrowAt: null
          }
          const res: any = await http.put(`/api/nft/${currentItem.nftId}`, params)
          if (res.data.code === 1) {
            toastify.success('succeed')
            setWithdrawable(false)
            setWithdrawing(false)
            setVisible(false)
            mutateNfts(undefined, true)
          } else {
            throw res.message || res.data.message
          }
        }
      } catch (err: any) {
        console.log(err)
        setWithdrawing(false)
        toastify.error(err.message)
      }
    }
  }

  return (
    <RentBox>
      <Modal footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <Card
              nftId={currentItem.nftId}
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.img}
              showInfo={false}
            />
          </Col>
          <Col span="12" xl={12} sm={24}>
            <h3>{currentItem.name}</h3>
            <span className="tips">#{currentItem.nftId}</span>
            {borrowed ? (
              <>
                <Dlist className="flex">
                  <div>
                    <SpanLabel>Owner</SpanLabel>
                    <span title={currentItem.originOwner}>
                      {formatAddress(currentItem.originOwner || ZeroAddress, 6)}
                    </span>
                  </div>
                  <div>
                    <SpanLabel>Collateral</SpanLabel>
                    <span>{currentItem.collateral} ⬨</span>
                  </div>
                  <div>
                    <SpanLabel>price</SpanLabel>
                    <span>{currentItem.price} ⬨ / day</span>
                  </div>
                  <div>
                    <SpanLabel>days</SpanLabel>
                    <span>{currentItem.days}</span>
                  </div>
                  <div>
                    <SpanLabel>Total</SpanLabel>
                    <span>{total} ⬨</span>
                  </div>
                </Dlist>
                <div>
                  <DaysInfo progress={progress}>Rent for {currentItem.days} days</DaysInfo>
                </div>
              </>
            ) : withdrawable ? (
              <div>
                <br />
                <Button block onClick={handleWithdraw} loading={withdrawing}>
                  Withdraw
                </Button>
              </div>
            ) : isApproved ? (
              <>
                <Dlist className="flex">
                  <div>
                    <span>Enter collateral.</span>
                    <NumInput onChange={handleCollateralChange} value={collateral} />
                  </div>
                  <div>
                    <span>Enter price per day.</span>
                    <NumInput onChange={handleCostChange} value={price} />
                  </div>
                  <div>
                    <span>Enter renting days.</span>
                    <NumInput onChange={handleDaysChange} value={days} />
                  </div>
                </Dlist>
                <br />
                <Button
                  className="lend"
                  shape="round"
                  block
                  onClick={handleLend}
                  disabled={!price && !days && !collateral}
                  loading={lending}
                >
                  Lend
                </Button>
              </>
            ) : (
              <>
                <br />
                <Button className="lend" shape="round" block onClick={handleApprove} loading={approving}>
                  Approve
                </Button>
              </>
            )}
          </Col>
        </Row>
      </Modal>
      <Row>
        {myLendingNfts.length
          ? myLendingNfts.map((item, index) => (
              <Col key={index} span="6" xl={6} md={8} sm={12} xs={24}>
                <Nft
                  onClick={() => handleShowModal(item)}
                  name={item.name}
                  days={item.days}
                  price={item.price}
                  nftId={item.nftId}
                  borrowAt={item.borrowAt}
                  img={item.img}
                  isLending={item.isLending}
                  isBorrowed={item.isBorrowed}
                  withdrawable={withdrawable}
                />
              </Col>
            ))
          : 'empty'}
      </Row>
    </RentBox>
  )
}
