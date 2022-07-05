// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// import { useGreeterContract } from '../hooks'
import { Row, Col, Button, Popconfirm } from 'antd'
import { Nft } from '../components/Nft'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { useActiveWeb3React, useStore, useControlContract, useAssetContract } from '../hooks'
import { toastify } from '../components/Toastify'
import { fetchReceipt, formatAddress, getProgress, ZeroAddress } from '../utils'
import { filter, isEmpty } from 'lodash'
import { useMyLendingNfts } from '../hooks/useMyLendingNfts'
import { http2, Store } from '../components/Store'
import BigNumber from 'bignumber.js'
import { SpanLabel, DaysInfo, RentBox } from './Rent'
import { Loading } from '../components/Loading'
import { Empty } from '../components/Empty'
import { fetchAbi, getContract } from './Dashboard'
import { BNBIcon } from '../components/BNBIcon'
import { BUSDIcon } from '../components/BUSDIcon'

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

export const Lend = () => {
  const { account, library } = useActiveWeb3React()
  const [currentItem, setCurrentItem] = useState({} as any)
  const [visible, setVisible] = useState(false)
  const ControlContract = useControlContract()
  const AssetContract = useAssetContract()
  const myLendingNfts = useMyLendingNfts()
  const [expired, setExpired] = useState(false)
  const [liquidating, setLiquidating] = useState(false)
  const [borrowed, setBorrowed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)
  const { mutateDebts } = useStore()
  const [awaiting, setAwaiting] = useState(false)
  const { nfts } = useStore()

  useEffect(() => {
    const getLendList = async () => {
      const gamelandNftIdList = await AssetContract?.get_nfts_list()
      const gamelandNftIdArr = gamelandNftIdList.map((item: any) => {
        return item._hex
      })
      const newArr = gamelandNftIdArr.filter((item: any) => {
        return item !== '0x00'
      })
      if (newArr.length < nfts.length) {
        nfts.map(async (item: any) => {
          const index = newArr.indexOf(item.gamelandNftId)
          if (index < 0) {
            await http2.delete(`/v0/opensea/${item.id}`)
          }
        })
      }
      for (let i = 0; i < newArr.length; i++) {
        const list = await AssetContract?.get_nfts(newArr[i])
        for (let j = 0; j < nfts.length; j++) {
          if (!nfts[j].isBorrowed && list.borrow_status && nfts[j].gamelandNftId === newArr[i]) {
            const borrow = await AssetContract?.get_borrowInfo(newArr[i])
            const index = await AssetContract?.get_borrowindex(newArr[i])
            const borrowAt = Number(borrow.time_now.toString() + '000') + 28800000
            const params = {
              isBorrowed: true,
              borrower: borrow.borrower,
              borrowAt: new Date(borrowAt).toJSON(),
              borrowDay: borrow.due_date.toString(),
              rentIndex: index.toString()
            }
            await http2.put(`/v0/opensea/${newArr[i]}`, params)
          } else if (nfts[j].isBorrowed && !list.borrow_status && nfts[j].gamelandNftId === newArr[i]) {
            const params = {
              borrower: null,
              borrowAt: null,
              isBorrowed: false,
              borrowDay: 0,
              rentIndex: '',
              isLending: true
            }
            await http2.put(`/v0/opensea/${newArr[i]}`, params)
          }
        }
      }
    }
    // getLendList()
  }, [])

  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const penalty = currentItem.penalty as number
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.borrowDay as number)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [currentItem])

  const handleShowModal = async (item: any) => {
    setVisible(true)
    setAwaiting(true)
    setCurrentItem(item)
    setBorrowed(item.isBorrowed)
    const _progress = getProgress(item.borrowAt as string, item.borrowDay as number)
    setProgress(_progress)
    console.log(_progress)
    if (item.isBorrowed) {
      setExpired(_progress >= 100)
    } else {
      setExpired(false)
    }
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
    if (ControlContract) {
      setLiquidating(true)
      try {
        let liquidated
        if (currentItem.pay_type === 'eth') {
          liquidated = await ControlContract.confiscation(currentItem.lendIndex, currentItem.gamelandNftId)
        } else {
          liquidated = await ControlContract.confiscation_usdt(currentItem.lendIndex, currentItem.gamelandNftId)
        }
        const receipt = await fetchReceipt(liquidated.hash, library)
        const { status } = receipt
        if (!status) {
          throw Error('Failed to confiscated.')
        }
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
                pay_type={currentItem.pay_type}
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
                        {currentItem.collateral}&nbsp;&nbsp;
                        {currentItem.pay_type === 'eth' ? <BNBIcon /> : <BUSDIcon />}
                      </span>
                    </div>
                    <div>
                      <SpanLabel>penalty</SpanLabel>
                      <span>
                        {currentItem.penalty}&nbsp;&nbsp;
                        {currentItem.pay_type === 'eth' ? <BNBIcon /> : <BUSDIcon />}
                      </span>
                    </div>
                    <div>
                      <SpanLabel>price</SpanLabel>
                      <span>
                        {currentItem.price}
                        &nbsp;&nbsp;
                        {currentItem.pay_type === 'eth' ? <BNBIcon /> : <BUSDIcon />} / day
                      </span>
                    </div>
                    <div>
                      <SpanLabel>days</SpanLabel>
                      <span>{currentItem.borrowDay}</span>
                    </div>
                    <div>
                      <SpanLabel>Total</SpanLabel>
                      <span>
                        {total}&nbsp;&nbsp;
                        {currentItem.pay_type === 'eth' ? <BNBIcon /> : <BUSDIcon />}
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
                  pay_type={item.pay_type}
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
