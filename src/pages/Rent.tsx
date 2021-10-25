// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useMemo, useState } from 'react'

// import { useGreeterContract } from '../hooks'
import { Row, Col, Button } from 'antd'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import BigNumber from 'bignumber.js'
import { useActiveWeb3React, useGameLandContract, useStore } from '../hooks'
import { toastify } from '../components/Toastify'
// import { parseEther } from '@ethersproject/units'
import { useLendingNfts } from '../hooks/useLendingNfts'
import { Nft as NftCard, NftProps } from '../components/Nft'
import { NftView } from '../components/NftView'
import { RentCard } from '../components/RentCard'
import { isEmpty } from 'lodash'
import { contractionId, formatAddress, ZeroAddress } from '../utils'
import { http } from '../components/Store'
import { BaseProps } from '../components/NumInput'
import { parseEther } from '@ethersproject/units'
import { lowerCase } from 'lower-case'

const RentBox = styled.div`
  margin: 2rem 0;
`
export const DayInfoBox = styled.div<{ progress?: number }>`
  margin-top: 1rem;
  height: 2rem;
  line-height: 2rem;
  border-radius: 1rem;
  border: 1px solid white;
  font-size: 0.875rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:before {
    position: absolute;
    display: block;
    content: '';
    width: ${({ progress }) => (progress ? progress + '%' : 'auto')};
    height: 100%;
    background: var(--in-progress);
    z-index: 1;
  }
  span {
    z-index: 2;
    position: relative;
  }
`
interface DaysInfoProps extends BaseProps {
  progress?: number
}
export const DaysInfo: React.FC<DaysInfoProps> = ({ progress, children }) => {
  return (
    <DayInfoBox progress={progress}>
      <span>{children}</span>
    </DayInfoBox>
  )
}
const Dlist = styled.div`
  flex-direction: column;
  margin-top: 1rem;
  div {
    margin-bottom: 0.5rem;
  }
`

export const SpanLabel = styled.span`
  display: inline-block;
  width: 5rem;
`
export const Rent = () => {
  const { library, account } = useActiveWeb3React()
  const [currentItem, setCurrentItem] = useState({} as NftProps)
  const [visible, setVisible] = useState(false)
  const lendingNfts = useLendingNfts()
  const { mutateNfts } = useStore()

  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).toString()
  }, [currentItem])
  // const greeter = useGreeterContract()

  // useEffect(() => {
  //   console.log(greeter?.setGreeting('hll'))
  // }, [greeter])

  const handleShowModal = (item: NftProps) => {
    console.log('rent')

    setCurrentItem(item)
    setVisible(true)
  }
  const gamelandContract = useGameLandContract()
  const [renting, setRenting] = useState(false)

  const handleRent = async () => {
    try {
      setRenting(true)
      if (!library) {
        setRenting(false)
        toastify.error('Please connect a account.')
        return
      }
      const collateral = new BigNumber(currentItem.collateral as unknown as string)
      const days = new BigNumber(currentItem.days as unknown as string)
      const price = new BigNumber(currentItem.price as unknown as string)
      const cost = days.times(price)
      const amount = collateral.plus(cost).toString()
      console.log(parseEther(amount).toString())

      const rented = await gamelandContract
        ?.connect(library.getSigner())
        .rent(currentItem.nftId, { value: parseEther(amount) })
      const borrowed = await gamelandContract?.borrow_status(currentItem.nftId)
      await rented.wait()
      if (borrowed) {
        const params = {
          isBorrowed: true,
          borrower: account,
          borrowAt: new Date().toJSON()
        }
        const res: any = await http.put(`/api/nft/${currentItem.nftId}`, params)

        if (res.data.code === 1) {
          setRenting(false)
          toastify.success('succeed')
          mutateNfts(undefined, true)
          setVisible(false)
        } else {
          throw res.message || res.data.message
        }
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.message)
      setRenting(false)
    }
  }

  return (
    <RentBox>
      <Modal footer={null} onCancel={() => setVisible(false)} visible={visible} destroyOnClose>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            {/* <NftCard
              nftId={currentItem.nftId}
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.image_preview_url}
              unOperate={true}
            /> */}
            <NftView img={currentItem.image_url} name={currentItem.name}></NftView>
            {/* <Card name={currentItem.name} price={currentItem.price} days={currentItem.days} img={currentItem.img} /> */}
          </Col>
          <Col span="12" xl={12} sm={24}>
            <h3>{currentItem.name}</h3>
            <span>#{contractionId(String(currentItem.token_id))}</span>
            <Dlist className="flex">
              <div>
                <SpanLabel>Owner</SpanLabel>
                <span title={currentItem.owner?.address}>
                  {formatAddress(currentItem.owner?.address || ZeroAddress, 6)}
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
              <DaysInfo>Rent for {currentItem.days} days</DaysInfo>
            </div>
            <br />
            <Button
              shape="round"
              type="primary"
              block
              onClick={handleRent}
              loading={renting}
              // disabled={lowerCase(String(account)) === lowerCase(String(currentItem.originOwner))}
              disabled={true}
            >
              Rent
            </Button>
            <br />
            <p className=" text-center">
              <span className="tips">
                {lowerCase(String(account)) === lowerCase(String(currentItem.originOwner))
                  ? 'Unable to rent your own NFT'
                  : undefined}
              </span>
            </p>
          </Col>
        </Row>
      </Modal>
      <Row>
        {lendingNfts.length
          ? lendingNfts.map((item, index) => (
              <Col key={index} span="6" xl={6} md={8} sm={12} xs={24}>
                {/* <Card
                  type="rent"
                  onClick={() => handleShowModal(item)}
                  name={item.name}
                  days={item.days}
                  price={item.price}
                  img={item.img}
                /> */}
                <RentCard
                  nftId={item.nftId}
                  onClick={() => handleShowModal(item)}
                  name={item.name}
                  days={item.days}
                  price={item.price}
                  img={item.image_preview_url}
                  isLending={item.isLending}
                />
              </Col>
            ))
          : 'Empty'}
      </Row>
    </RentBox>
  )
}
