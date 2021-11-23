// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// import { useGreeterContract } from '../hooks'
import { Row, Col, Button, Popconfirm } from 'antd'
import { Nft, NftProps } from '../components/Nft'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { NFTData, useActiveWeb3React, useGameLandContract, useMyNftContract, useStore } from '../hooks'
import { toastify } from '../components/Toastify'
import { formatAddress, getProgress, ZeroAddress, ZeroNftInfo } from '../utils'
import { formatEther } from '@ethersproject/units'
import { isEmpty, isEqual } from 'lodash'
import { useMyLendingNfts } from '../hooks/useMyLendingNfts'
import { http } from '../components/Store'
import BigNumber from 'bignumber.js'
import { SpanLabel, DaysInfo, RentBox } from './Rent'
import { Loading } from '../components/Loading'
import { lowerCase } from 'lower-case'
import { Empty } from '../components/Empty'

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
  const gamelandContract = useGameLandContract()
  const nftContract = useMyNftContract()
  const myLendingNfts = useMyLendingNfts()
  const [expired, setExpired] = useState(false)
  const [liquidating, setLiquidating] = useState(false)

  const [borrowed, setBorrowed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawable, setWithdrawable] = useState(false)
  const { mutateNfts } = useStore()

  const [awaiting, setAwaiting] = useState(false)

  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).toString()
  }, [currentItem])

  const handleShowModal = async (item: NftProps) => {
    setCurrentItem(item)
    setVisible(true)
    setExpired(false)
    setAwaiting(true)
    try {
      const _borrowed = await gamelandContract?.check_the_borrow_status(item.gamelandNftId)
      setBorrowed(_borrowed)
      if (_borrowed) {
        const _progress = getProgress(item.borrowAt as string, item.days as number)
        setProgress(_progress)
        setExpired(_progress >= 100)
      } else {
        let _lending = await gamelandContract?.get_nft_allinfo(item.gamelandNftId)
        _lending = _lending && _lending.map((item: any) => formatEther(item).toString())

        setWithdrawable(!isEqual(_lending, ZeroNftInfo))
      }
    } catch (err: any) {
      toastify.error(err.message)
    }
    setAwaiting(false)
  }

  const handleWithdraw = async () => {
    try {
      if (!account) {
        toastify.error('Please connect a account.')
        return
      }
      if (!nftContract || !gamelandContract) {
        toastify.error('Contract not found.')
        return
      }
      setWithdrawing(true)
      const owner = await nftContract.ownerOf(currentItem.nftId)
      if (lowerCase(owner) !== lowerCase(account)) {
        const withdrawnft = await gamelandContract.withdrawnft(
          currentItem.nftId,
          currentItem.contractAddress,
          currentItem.gamelandNftId
        )
        const { status } = await withdrawnft.wait()
        if (!status) {
          throw Error('Failed to lend.')
        }
      }
      const params = {
        isLending: false,
        price: 0,
        days: 0,
        collateral: 0,
        withdrawable: false,
        borrower: null,
        borrowAt: null
      }
      const res: any = await http.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setWithdrawable(false)
        setWithdrawing(false)
        setVisible(false)
        mutateNfts(undefined, true)
      } else {
        throw res.message || res.data.message || 'Server down.'
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
        const liquidated = await gamelandContract.confiscation(currentItem.gamelandNftId)
        liquidated.wait()
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
        const res: any = await http.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          setLiquidating(false)
          setVisible(false)
          mutateNfts(undefined, true)
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
    <RentBox>
      <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <Nft
              nftId={currentItem.nftId}
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.image_url}
              unOperate={true}
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
                    <span>{currentItem.collateral} Ξ</span>
                  </div>
                  <div>
                    <SpanLabel>price</SpanLabel>
                    <span>{currentItem.price} Ξ / day</span>
                  </div>
                  <div>
                    <SpanLabel>days</SpanLabel>
                    <span>{currentItem.days}</span>
                  </div>
                  <div>
                    <SpanLabel>Total</SpanLabel>
                    <span>{total} Ξ</span>
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
                name={item.name}
                days={item.days}
                price={item.price}
                nftId={item.nftId}
                borrowAt={item.borrowAt}
                img={item.image_preview_url}
                isLending={item.isLending}
                isBorrowed={item.isBorrowed}
                withdrawable={withdrawable}
              />
            </Col>
          ))
        ) : (
          <Empty text="Ooops, looks like nothing here." />
        )}
      </Row>
    </RentBox>
  )
}
