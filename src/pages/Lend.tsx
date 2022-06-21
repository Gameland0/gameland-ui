// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// import { useGreeterContract } from '../hooks'
import { Row, Col, Button, Popconfirm } from 'antd'
import { Nft } from '../components/Nft'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { NFTData, useActiveWeb3React, useGameLandContract, useStore, useControlContract } from '../hooks'
import { toastify } from '../components/Toastify'
import { fetchReceipt, formatAddress, getProgress, ZeroAddress } from '../utils'
import { isEmpty } from 'lodash'
import { useMyLendingNfts } from '../hooks/useMyLendingNfts'
import { http2 } from '../components/Store'
import BigNumber from 'bignumber.js'
import { SpanLabel, DaysInfo, RentBox } from './Rent'
import { Loading } from '../components/Loading'
import { Empty } from '../components/Empty'
import { fetchAbi, getContract } from './Dashboard'
import { Icon } from '../components/Icon'

export const Dlist = styled.div`
  flex-direction: column;
  margin-top: 1rem;
  div {
    margin-bottom: 0.5rem;
  }
`

export const Lend = () => {
  const { account, library } = useActiveWeb3React()
  const [currentItem, setCurrentItem] = useState({} as any)
  const [visible, setVisible] = useState(false)
  const gamelandContract = useGameLandContract()
  const ControlContract = useControlContract()
  const myLendingNfts = useMyLendingNfts()
  const [expired, setExpired] = useState(false)
  const [liquidating, setLiquidating] = useState(false)

  const [borrowed, setBorrowed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const { mutateDebts } = useStore()

  const [awaiting, setAwaiting] = useState(false)

  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).toString()
  }, [currentItem])

  const handleShowModal = async (item: any) => {
    setVisible(true)
    setExpired(false)
    setAwaiting(true)

    setCurrentItem(item)
    if (item.isBorrowed) {
      setBorrowed(true)
    }
    const _progress = getProgress(item.borrowAt as string, item.borrowDay as number)
    setProgress(_progress)
    setAwaiting(false)
  }

  const handleWithdraw = async () => {
    try {
      if (!account) {
        toastify.error('Please connect a account.')
        return
      }

      if (!ControlContract) {
        toastify.error('Contract not found.')
        return
      }
      setWithdrawing(true)
      const withdrawnft = await ControlContract.withdrawnft(currentItem.lendIndex)
      const receipt = await fetchReceipt(withdrawnft.hash, library)
      const { status } = receipt
      if (!status) {
        throw Error('Failed to withdraw.')
      }

      const res: any = await http2.delete(`/v0/opensea/${currentItem.id}`)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setWithdrawing(false)
        setVisible(false)
        mutateDebts(undefined, true)
      } else {
        throw res.message || res.data.message || 'Service error.'
      }
    } catch (err: any) {
      console.log(err)
      setWithdrawing(false)
      toastify.error(err.message)
    }
  }

  const handleLiquidation = async () => {
    if (gamelandContract) {
      setLiquidating(true)

      try {
        const liquidated = await ControlContract?.confiscation(currentItem.lendIndex, currentItem.rentIndex)
        const receipt = await fetchReceipt(liquidated.hash, library)
        const { status } = receipt
        if (!status) {
          throw Error('Failed to confiscated.')
        }
        console.log(liquidated)
        const params = {
          isLending: false,
          isBorrowed: false,
          borrower: '',
          originOwner: currentItem.borrower,
          price: 0,
          days: 0,
          collateral: 0,
          borrowAt: null
        }
        const res: any = await http2.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          setLiquidating(false)
          setVisible(false)
          mutateDebts(undefined, true)
        } else {
          throw Error(res)
        }
      } catch (err: any) {
        console.log(err.message)
        toastify.error(err.message || err.data.message)
        setLiquidating(false)
      }
    }
  }

  return (
    <div className="container">
      <RentBox>
        <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible}>
          <Row gutter={[24, 24]}>
            <Col span="12" xl={12} sm={24}>
              <Nft
                penalty={currentItem.penalty}
                nftId={currentItem.nftId}
                name={currentItem.metadata?.name}
                price={currentItem.price}
                days={currentItem.days}
                img={currentItem.metadata?.image}
                contract_type={currentItem.standard}
                unOperate={true}
                borrowDay={currentItem.borrowDay}
              />
            </Col>
            <Col span="12" xl={12} sm={24}>
              <h3>{currentItem.name}</h3>
              <span className="tips">#{currentItem.nftId}</span>
              {awaiting ? (
                <Loading />
              ) : borrowed ? (
                <>
                  <Dlist className="flex">
                    <div>
                      <SpanLabel>Borrower</SpanLabel>
                      <span title={currentItem.borrower}>{formatAddress(currentItem.borrower || ZeroAddress, 4)}</span>
                    </div>
                    <div>
                      <SpanLabel>Owner</SpanLabel>
                      <span title={currentItem.originOwner}>
                        {formatAddress(currentItem.originOwner || ZeroAddress, 4)}
                      </span>
                    </div>
                    <div>
                      <SpanLabel>Collateral</SpanLabel>
                      <span>
                        {currentItem.collateral} <Icon />
                      </span>
                    </div>
                    <div>
                      <SpanLabel>price</SpanLabel>
                      <span>
                        {currentItem.price} <Icon /> / day
                      </span>
                    </div>
                    <div>
                      <SpanLabel>days</SpanLabel>
                      <span>{currentItem.days}</span>
                    </div>
                    <div>
                      <SpanLabel>Total</SpanLabel>
                      <span>
                        {total} <Icon />
                      </span>
                    </div>
                  </Dlist>
                  <div>
                    <DaysInfo progress={progress}>Rent for {currentItem.days} days</DaysInfo>
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
            </Col>
          </Row>
        </Modal>
        <Row gutter={[20, 20]}>
          {myLendingNfts.length ? (
            myLendingNfts.map((item, index) => (
              <Col key={index} span="6" xl={6} md={8} sm={12} xs={24}>
                <Nft
                  onClick={() => handleShowModal(item)}
                  name={item.metadata?.name}
                  days={item.days}
                  borrowDay={item.borrowDay}
                  collateral={item.collateral}
                  price={item.price}
                  nftId={item.nftId}
                  borrowAt={item.borrowAt}
                  img={item.metadata?.image}
                  isLending={item.isLending}
                  isBorrowed={item.isBorrowed}
                  withdrawable={item.withdrawable}
                  contract_type={item.standard}
                  penalty={item.penalty}
                />
              </Col>
            ))
          ) : (
            <Empty text="Ooops, looks like nothing here." />
          )}
        </Row>
      </RentBox>
    </div>
  )
}
