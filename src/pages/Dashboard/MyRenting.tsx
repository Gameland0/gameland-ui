import React, { useMemo, useState } from 'react'
import { GameLandAddress, NFTData, useGameLandContract, useMyNftContract, useMyRenting, useStore } from '../../hooks'
import { Row, Col, Button } from 'antd'
import { RentingCard } from '../../components/RentingCard'
import { Nft as NftCard } from '../../components/Nft'
import { Modal } from '../../components/Modal'
import { Dlist } from '../Lend'
import { SpanLabel } from '../Rent'
import { formatAddress, ZeroAddress } from '../../utils'
import { isEmpty } from 'lodash'
import BigNumber from 'bignumber.js'
import { toastify } from '../../components/Toastify'
import { http } from '../../components/Store'

export const MyRenting = () => {
  const myRenting = useMyRenting()
  const [currentItem, setCurrentItem] = useState({} as NFTData)
  const [visible, setVisible] = useState(false)
  const [repaying, setRepaying] = useState(false)
  const [approving, setApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const { mutateNfts } = useStore()

  const nft = useMyNftContract()
  const gameland = useGameLandContract()

  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).toString()
  }, [currentItem])

  const handleNftClick = async (item: any) => {
    setVisible(true)
    setCurrentItem(item)

    if (nft) {
      console.log(item)

      try {
        const approveAddress = await nft.getApproved(item.nftId)
        console.log(approveAddress, approveAddress === ZeroAddress)

        if (approveAddress === gameland?.address) {
          setIsApproved(true)
        } else {
          setIsApproved(false)
        }
      } catch (err: any) {
        console.log(err.message)
      }
    }
  }

  const handleRepay = async () => {
    console.log('repay')
    try {
      setRepaying(true)
      const repaid = await gameland?.repay(currentItem.nftId)
      console.log(repaid)
      const tx = await repaid.wait()
      const params = {
        borrower: null,
        borrowAt: null,
        isBorrowed: null,
        isLending: null,
        withdrawable: true
      }
      const res: any = await http.put(`/api/nft/${currentItem.nftId}`, params)
      if (res.data.code === 1) {
        console.log(tx)
        toastify.success('succeed')
        mutateNfts(undefined, true)
        setRepaying(false)
        setVisible(false)
      } else {
        throw res.message || res.data.message
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.message)
      setRepaying(false)
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

  return (
    <div>
      <Modal footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <NftCard
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.img}
              nftId={currentItem.nftId}
              unOperate={true}
            />
          </Col>

          <Col span="12" xl={12} sm={24}>
            <h3>{currentItem.name}</h3>
            <p>
              <span className="tips">#{currentItem.nftId}</span>
            </p>

            {isApproved ? (
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
                <br />
                <Button className="lend" shape="round" block onClick={handleRepay} loading={repaying}>
                  Repay
                </Button>
              </>
            ) : (
              <div>
                <Button className="lend" shape="round" block onClick={handleApprove} loading={approving}>
                  Approve
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Modal>

      <Row>
        {myRenting
          ? myRenting.map((item: any) => (
              <Col span="6" xl={6} md={8} sm={12} xs={24} key={item.id} onClick={() => handleNftClick(item)}>
                <RentingCard
                  name={item.name}
                  price={item.price}
                  days={item.days}
                  img={item.img}
                  nftId={item.nftId}
                  borrowAt={item.borrowAt}
                  isExpired={item.isExpired}
                ></RentingCard>
              </Col>
            ))
          : null}
      </Row>
    </div>
  )
}
