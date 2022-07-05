import React, { useEffect, useMemo, useState } from 'react'
import {
  useControlContract,
  AssetContractAddress,
  useActiveWeb3React,
  useAssetContract,
  useGameLandContract,
  useMyRenting,
  useStore
} from '../../hooks'
import { Row, Col, Button } from 'antd'
import { RentingCard } from '../../components/RentingCard'
import { Nft as NftCard } from '../../components/Nft'
import { Modal } from '../../components/Modal'
import { Dlist } from '../Lend'
import { SpanLabel } from '../Rent'
import { fetchReceipt, formatAddress, ZeroAddress } from '../../utils'
import { isEmpty } from 'lodash'
import BigNumber from 'bignumber.js'
import { toastify } from '../../components/Toastify'
import { http2 } from '../../components/Store'
import { Empty } from '../../components/Empty'
// import { lowerCase } from 'lower-case'
import { fetchAbi, getContract } from '.'
import { ABIs } from '../../constants/Abis/ABIs'
import { BNBIcon } from '../../components/BNBIcon'
import { BUSDIcon } from '../../components/BUSDIcon'
// import { hashMessage } from 'ethers/lib/utils'

export const MyRenting = () => {
  const { library, account } = useActiveWeb3React()
  const myRenting = useMyRenting()
  const [currentItem, setCurrentItem] = useState({} as any)
  const [visible, setVisible] = useState(false)
  const [repaying, setRepaying] = useState(false)
  const [approving, setApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const { mutateDebts } = useStore()
  const AssetContract = useAssetContract()
  const ControlContract = useControlContract()
  console.log(myRenting)
  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const penalty = currentItem.penalty as number
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.borrowDay as number)
    return _cost.plus(collateral).plus(penalty).toString()
  }, [currentItem])

  const handleNftClick = async (item: any) => {
    setVisible(true)
    const contractAddress = item.contractAddress ?? ''
    const localAbi = localStorage.getItem(contractAddress.toLowerCase())
    let storedAbi
    for (const [key, value] of Object.entries(ABIs)) {
      if (key.toLowerCase() === contractAddress.toLowerCase()) {
        storedAbi = value
      }
    }
    const ABI = storedAbi && storedAbi.length ? storedAbi : localAbi ? localAbi : await fetchAbi(contractAddress)
    const nftContract = getContract(library, contractAddress, ABI)
    item.contract = nftContract
    setCurrentItem(item)
    const index = await AssetContract?.get_borrowindex(item.gamelandNftId)
    // const info = await AssetContract?.get_borrowInfo_forindex(3)
    if (Number(item.rentIndex) != Number(index.toString())) {
      const params = {
        rentIndex: index.toString()
      }
      await http2.put(`/v0/opensea/${item.gamelandNftId}`, params)
    }

    if (nftContract) {
      try {
        const approveAddress = await nftContract.getApproved(item.nftId)
        console.log(approveAddress, AssetContractAddress)
        if (approveAddress === AssetContractAddress) {
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
      if (!ControlContract) {
        toastify.error('Contract not found.')
        return
      }
      setRepaying(true)
      let repaid
      if (currentItem.pay_type === 'eth') {
        repaid = await ControlContract.returnnft(currentItem.lendIndex, currentItem.gamelandNftId)
      } else {
        repaid = await ControlContract.returnnft_usdt(currentItem.lendIndex, currentItem.gamelandNftId)
      }
      const receipt = await fetchReceipt(repaid.hash, library)
      const { status } = receipt
      if (!status) {
        throw Error('Failed to repay, please try again.')
      }
      const params = {
        borrower: null,
        borrowAt: null,
        isBorrowed: false,
        isLending: true,
        borrowDay: 0,
        rentIndex: ''
      }
      const res: any = await http2.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
      if (res.data.code === 1) {
        toastify.success('succeed')
        mutateDebts(undefined, true)
        setRepaying(false)
        setVisible(false)
      } else {
        throw res.message || res.data.message
      }
    } catch (err: any) {
      if (err.data) {
        toastify.error(err.data.message)
      } else {
        toastify.error(err.message)
      }
      setRepaying(false)
    }
  }
  const handleApprove = async () => {
    setApproving(true)
    if (currentItem.contract) {
      try {
        let approvetx
        if (currentItem.standard === 'ERC721' && !!currentItem.contract.approve) {
          approvetx = await currentItem.contract.approve(AssetContractAddress, currentItem.nftId)
        } else {
          approvetx = await currentItem.contract.setApprovalForAll(AssetContractAddress, true)
        }
        const receipt = await fetchReceipt(approvetx.hash, library)
        const { status } = receipt
        if (!status) {
          throw Error('Failed to Approved.')
        }

        setIsApproved(true)
      } catch (err: any) {
        toastify.error(err.message)
      }
    }
    setApproving(false)
  }

  return (
    <div>
      <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible} closable={false}>
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
                  {currentItem.price}&nbsp;
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
