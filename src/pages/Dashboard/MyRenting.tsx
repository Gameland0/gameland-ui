import React, { useMemo, useState } from 'react'
import { GameLandAddress, NFTData, useActiveWeb3React, useGameLandContract, useMyRenting, useStore } from '../../hooks'
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
import { Empty } from '../../components/Empty'
import { lowerCase } from 'lower-case'
import { fetchAbi, getContract } from '.'

export const MyRenting = () => {
  const { library, account } = useActiveWeb3React()
  const myRenting = useMyRenting()
  const [currentItem, setCurrentItem] = useState({} as NFTData)
  const [visible, setVisible] = useState(false)
  const [repaying, setRepaying] = useState(false)
  const [approving, setApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const { mutateDebts } = useStore()

  const gamelandContract = useGameLandContract()
  // const NFTsContract = useNFTContract()

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

    const contractAddress = item.contractAddress ?? ''
    const localAbi = localStorage.getItem(contractAddress)
    const ABI = localAbi ? localAbi : await fetchAbi(contractAddress)
    const nftContract = getContract(library, contractAddress, ABI)

    item.contract = nftContract
    setCurrentItem(item)
    console.log(item)

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
      if (!library || !account) {
        toastify.error('Please connect an account.')
        return
      }
      if (!currentItem.contract || !gamelandContract) {
        toastify.error('Contract not found.')
        return
      }
      setRepaying(true)

      const owner = await currentItem.contract.ownerOf(currentItem.nftId)
      const borrowStatus = await gamelandContract.borrow_status(currentItem.gamelandNftId)

      if (lowerCase(borrowStatus[0]) === lowerCase(account) && lowerCase(owner) !== lowerCase(account)) {
        throw new Error('Your NFT has been transferred!')
      }

      if (lowerCase(owner) !== lowerCase(gamelandContract.address)) {
        const repaid = await gamelandContract.connect(library.getSigner()).returnnft(
          currentItem.nftId,
          currentItem.contractAddress,
          currentItem.gamelandNftId
          // ,currentItem.id
        )
        const { status } = await repaid.wait()
        if (!status) {
          throw Error('Failed to repay, please try again.')
        }
      }
      const params = {
        borrower: null,
        borrowAt: null,
        isBorrowed: null,
        isLending: null,
        withdrawable: true
      }
      const res: any = await http.put(`/api/v0/opensea/${currentItem.gamelandNftId}`, params)
      if (res.data.code === 1) {
        toastify.success('succeed')
        mutateDebts(undefined, true)
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
    if (currentItem.contract) {
      console.log(GameLandAddress, currentItem.nftId)
      try {
        // const approvetx = await nftContract.approve(GameLandAddress, currentItem.nftId)
        let approvetx
        if (currentItem.standard === 'ERC721' && !!currentItem.contract?.approve) {
          approvetx = await currentItem.contract.approve(GameLandAddress, currentItem.nftId)
        } else {
          approvetx = await currentItem.contract.setApprovalForAll(GameLandAddress, true)
        }
        // const approvetx = await nftContract.approve(GameLandAddress, currentItem.nftId)
        console.log(approvetx)

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
      <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <NftCard
              name={currentItem.metadata?.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.metadata?.image}
              nftId={currentItem.nftId}
              unOperate={true}
              contract_type={currentItem.standard}
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
                name={item.metadata.name}
                price={item.price}
                days={item.days}
                img={item.metadata.image}
                nftId={item.nftId}
                borrowAt={item.borrowAt}
                isExpired={item.isExpired}
                contract_type={item.standard}
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
