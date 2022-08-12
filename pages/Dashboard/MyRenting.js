import React, { useEffect, useMemo, useState } from 'react'
import { Row, Col, Button } from 'antd'
import { RentingCard } from '../../components/RentingCard'
import { Nft as NftCard } from '../../components/Nft'
import { Modal } from '../../components/Modal'
import { Dlist } from '../Lend'
import { SpanLabel } from '../Rent'
import { isEmpty } from 'lodash'
import BigNumber from 'bignumber.js'
import { toastify } from '../../components/Toastify'
import { Empty } from '../../components/Empty'
import { Icon } from '../../components/Icon'
export const MyRenting = () => {
  const [currentItem, setCurrentItem] = useState({})
  const [visible, setVisible] = useState(false)
  const [repaying, setRepaying] = useState(false)
  const [approving, setApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const penalty = currentItem.penalty
    const collateral = currentItem.collateral
    const _cost = new BigNumber(currentItem.price).times(currentItem.borrowDay)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [currentItem])

  const handleNftClick = async (item) => {
    setVisible(true)
    setCurrentItem(item)
    
  }

  const handleRepay = async () => {
  }
  const handleApprove = async () => {
    setApproving(true)
    setApproving(false)
  }

  return (
    <div>
      <Modal visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <NftCard
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.img}
              nftId={currentItem.nftId}
              unOperate={true}
              contract_type={currentItem.standard}
              borrowDay={currentItem.borrowDay}
              penalty={currentItem.penalty}
              pay_type={currentItem.pay_type}
            />
          </Col>

          <Col span="12" xl={12} sm={24}>
            <h3>{currentItem.name}</h3>
            <p>
              <span className="tips">#{currentItem.nftId}</span>
            </p>
            <Dlist className="flex">
              <div>
                <SpanLabel>Owner</SpanLabel>
                <span title={currentItem.originOwner}>{formatAddress(currentItem.originOwner || ZeroAddress, 4)}</span>
              </div>
              <div>
                <SpanLabel>Collateral</SpanLabel>
                <span>
                  {currentItem.collateral}&nbsp;
                  Sol&nbsp;
                  <Icon type={currentItem.pay_type} />
                </span>
              </div>
              <div>
                <SpanLabel>penalty</SpanLabel>
                <span>
                  {currentItem.penalty}&nbsp;
                  Sol&nbsp;
                  <Icon type={currentItem.pay_type} />
                </span>
              </div>
              <div>
                <SpanLabel>price</SpanLabel>
                <span>
                  {currentItem.price}&nbsp;
                  Sol&nbsp;
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
                  Sol&nbsp;
                  <Icon type={currentItem.pay_type} />
                </span>
              </div>
            </Dlist>
            <br />
            {isApproved ? (
              <>
                <Button className="lend" size="large" shape="round" block onClick={handleRepay} loading={repaying}>
                  Return
                </Button>
              </>
            ) : (
              <div>
                <Button className="lend" size="large" shape="round" block onClick={handleApprove} loading={approving}>
                  Approve
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Modal>
      <Row gutter={[20, 20]}>
        {myRenting.length ? (
          myRenting.map((item) => (
            <Col span="6" xl={6} md={8} sm={12} xs={24} key={item.id} onClick={() => handleNftClick(item)}>
              <RentingCard
                name={item.metadata.name}
                price={item.price}
                days={item.days}
                img={item.metadata.image}
                nftId={item.nftId}
                borrowAt={item.borrowAt}
                isExpired={item.isExpired}
                contract_type={item.standard}
                borrowDay={item.borrowDay}
              ></RentingCard>
            </Col>
          ))
        ) : (
          <Empty text="Ooops, looks like nothing here." />
        )}
      </Row>
    </div>
  )
}
