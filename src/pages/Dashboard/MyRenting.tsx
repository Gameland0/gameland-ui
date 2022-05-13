import React, { useMemo, useState } from 'react'
import {
  GameLandAddress,
  NFTData,
  useActiveWeb3React,
  useGameLandContract,
  useMyNftContract,
  useMyRenting,
  useNFTContract,
  useStore
} from '../../hooks'
import { Row, Col, Button } from 'antd'
import { RentingCard } from '../../components/RentingCard'
import { Nft as NftCard } from '../../components/Nft'
import { Modal } from '../../components/Modal'
import { Dlist } from '../Lend'
import { SpanLabel } from '../Rent'
import { formatAddress, ZeroAddress, fetchReceipt } from '../../utils'
import { isEmpty } from 'lodash'
import BigNumber from 'bignumber.js'
import { toastify } from '../../components/Toastify'
import { http } from '../../components/Store'
import { Empty } from '../../components/Empty'
import { lowerCase } from 'lower-case'

export const MyRenting = () => {
  const { library } = useActiveWeb3React()
  const myRenting = useMyRenting()
  const [currentItem, setCurrentItem] = useState({} as NFTData)
  const [visible, setVisible] = useState(false)
  const [repaying, setRepaying] = useState(false)
  const [approving, setApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const { mutateNfts } = useStore()

  const nftContract = useMyNftContract()
  const gamelandContract = useGameLandContract()
  const NFTsContract = useNFTContract()

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

    if (nftContract) {
      console.log(item)

      try {
        const approveAddress = await nftContract.getApproved(item.nftId)
        console.log(approveAddress, approveAddress === ZeroAddress)

        if (approveAddress === gamelandContract?.address) {
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
      if (!library) {
        toastify.error('Please connect an account.')
        return
      }
      if (!currentItem.contract || !gamelandContract) {
        toastify.error('Contract not found.')
        return
      }
      setRepaying(true)
      // const owner = await nftContract.ownerOf(currentItem.nftId)
      // if (lowerCase(owner) !== lowerCase(gamelandContract.address)) {
      //   const repaid = await gamelandContract
      //     .connect(library.getSigner())
      //     .returnnft(currentItem.nftId, currentItem.contractAddress, currentItem.gamelandNftId)
      //   const { status } = await repaid.wait()
      //   if (!status) {
      //     throw Error('Failed to repay, please try again.')
      //   }
      // }
      const borrowStatus = await gamelandContract.borrow_status(currentItem.gamelandNftId)
      console.log(
        borrowStatus,
        gamelandContract,
        currentItem.nftId,
        currentItem.contractAddress,
        currentItem.gamelandNftId,
        currentItem.id
      )
      const repaid = await gamelandContract.returnnft(
        currentItem.nftId,
        currentItem.contractAddress,
        currentItem.gamelandNftId,
        currentItem.id
      )
      const receipt = await fetchReceipt(repaid.hash, library)
      const { status } = receipt
      if (!status) {
        throw Error('Failed to repay, please try again.')
      }
      const params = {
        borrower: null,
        borrowAt: null,
        isBorrowed: null,
        isLending: null,
        withdrawable: true
      }
      const res: any = await http.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
      if (res.data.code === 1) {
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
    const nftAddress = currentItem.asset_contract?.address
    if (NFTsContract) {
      console.log(GameLandAddress, currentItem.nftId)
      try {
        // const approvetx = await nftContract.approve(GameLandAddress, currentItem.nftId)

        let approvetx
        if (currentItem.asset_contract?.schema_name === 'ERC721') {
          approvetx = await NFTsContract[nftAddress].approve(GameLandAddress, currentItem.nftId)
        } else {
          approvetx = await NFTsContract[nftAddress].setApprovalForAll(GameLandAddress, true)
        }
        await approvetx.wait()
        setIsApproved(true)
        toastify.success("Now you're able to return NFT")
      } catch (err: any) {
        toastify.error(err.message)
      }
    }
    setApproving(false)
  }

  return (
    <div>
      <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <NftCard
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.image_url}
              nftId={currentItem.nftId}
              unOperate={true}
              asset_contract={currentItem.asset_contract}
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
          myRenting.map((item: any) => (
            <Col span="6" xl={6} md={8} sm={12} xs={24} key={item.id} onClick={() => handleNftClick(item)}>
              <RentingCard
                name={item.name}
                price={item.price}
                days={item.days}
                img={item.image_preview_url}
                nftId={item.nftId}
                borrowAt={item.borrowAt}
                isExpired={item.isExpired}
                asset_contract={item.asset_contract}
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
