import React, { useCallback, useMemo, useState } from 'react'
import { Row, Col, Tabs, Button, Popconfirm, Pagination } from 'antd'
import styled from 'styled-components'
import { Modal } from '../../components/Modal'
import { Nft as NftCard, NftProps } from '../../components/Nft'
import {
  GameLandAddress,
  useActiveWeb3React,
  useGameLandContract,
  // useMyNftContract,
  useMyNfts,
  useNFTContract,
  useStore
} from '../../hooks'
import { NumInput } from '../../components/NumInput'
import { toastify, ToastContainer } from '../../components/Toastify'
import { Dlist } from '../Lend'
import { http } from '../../components/Store'
import { isEmpty, isEqual } from 'lodash'
import { formatAddress, getProgress, ZeroAddress, ZeroNftInfo } from '../../utils'
import { MyRenting } from './MyRenting'
import { SpanLabel, DaysInfo } from '../Rent'
import BigNumber from 'bignumber.js'
import { lowerCase } from 'lower-case'
import { parseEther } from '@ethersproject/units'
import { Loading } from '../../components/Loading'
import { Empty } from '../../components/Empty'
import { formatEther } from '@ethersproject/units'
import { useFetchMyNfts } from '../../hooks/useFetchMyNfts'

const { TabPane } = Tabs
const MyTabs = styled(Tabs)`
  margin-top: 2rem;
`
const MyNftBox = styled.div``

export const Dashboard = () => {
  const { account } = useActiveWeb3React()
  // const nftContract = useMyNftContract()
  const NFTsContract = useNFTContract()
  const gamelandContract = useGameLandContract()
  const myNft = useMyNfts()
  // const [offset, setOffset] = useState(0)
  // const [limit, setLimit] = useState(20)
  // const { data: myNfts, mutate: mutateMyNfts } = useFetchMyNfts(offset, limit)

  const [visible, setVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState({} as NftProps)

  const [price, setPrice] = useState('')
  const [days, setdays] = useState('')
  const [collateral, setCollateral] = useState('')
  const [lending, setLending] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [liquidating, setLiquidating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [progress, setProgress] = useState(0)
  const [borrowed, setBorrowed] = useState(false)
  const [expired, setExpired] = useState(false)
  const [withdrawable, setWithdrawable] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const { mutateNfts } = useStore()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [minting, setMinting] = useState(false)
  const [awaiting, setAwaiting] = useState(false)

  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).toString()
  }, [currentItem])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkWithdrawAble = (nftOwner: string, account: string) => {
    console.log(nftOwner, account)

    if (!nftOwner || !account) {
      return false
    }
    return lowerCase(nftOwner) !== lowerCase(account)
  }
  const handleNftClick = async (item: any) => {
    setVisible(true)
    setCurrentItem(item)
    setExpired(false)
    setAwaiting(true)

    if (item.sell_orders) return

    try {
      const _borrowed = await gamelandContract?.borrow_or_not(item.gamelandNftId)
      setBorrowed(_borrowed)

      if (_borrowed) {
        const _progress = getProgress(item.borrowAt as string, item.days as number)

        setProgress(_progress)
        setExpired(_progress >= 100)
      } else {
        // const nftOwner = await nftContract?.ownerOf(item.token_id)
        // setWithdrawable(checkWithdrawAble(nftOwner, account as string))
        let _lending = await gamelandContract?.get_nft_allinfo(item.gamelandNftId)

        _lending = _lending && _lending.map((item: any) => formatEther(item).toString())

        console.log(isEqual(_lending, ZeroNftInfo))
        setWithdrawable(!isEqual(_lending, ZeroNftInfo))
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.message || 'Error occured with retrieving details.')
    }
    const contractAddress = currentItem.asset_contract?.address
    if (NFTsContract !== null) {
      console.log(item)

      try {
        if (currentItem.asset_contract?.schema_name === 'ERC721') {
          const approveAddress = await NFTsContract[contractAddress].getApproved(item.token_id)
          console.log(approveAddress, approveAddress === ZeroAddress)

          if (lowerCase(approveAddress) === lowerCase(gamelandContract?.address as string)) {
            setIsApproved(true)
          } else {
            setIsApproved(false)
          }
        } else {
          const isApproved = await NFTsContract[lowerCase(contractAddress)].isApprovedForAll(
            gamelandContract?.address,
            account
          )
          isApproved ? setIsApproved(true) : setIsApproved(false)
        }
      } catch (err: any) {
        console.log(err.message)
      }
    }
    setAwaiting(false)
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
        }
      } catch (err: any) {
        console.log(err.message)
        toastify.error(err.message || err.data.message)
        setLiquidating(false)
      }
    }
  }

  const handleWithdraw = async () => {
    if (gamelandContract) {
      try {
        if (!account) {
          toastify.error('Please connect a account.')
          return
        }
        const contractAddress = currentItem.asset_contract?.address
        if (!gamelandContract || !NFTsContract) {
          toastify.error('Contract not found.')
          return
        }
        setWithdrawing(true)
        const owner = await NFTsContract[contractAddress].ownerOf(currentItem.nftId)

        if (lowerCase(owner) !== lowerCase(account)) {
          const withdrawnft = await gamelandContract.withdrawnft(
            currentItem.nftId,
            currentItem.contractAddress,
            currentItem.gamelandNftId
          )
          gamelandContract.on('Withdrew', (from, to, amount, event) => {
            console.log(lowerCase(from) === lowerCase(gamelandContract.address), lowerCase(to) === lowerCase(account))

            console.log(`${from} sent ${amount} to ${to},event: ${event}`)
          })
          const { status } = await withdrawnft.wait()
          if (!status) {
            throw Error('Failed to withdraw.')
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
        console.log(owner, res)

        if (res.data.code === 1) {
          console.log(res.data.message)

          toastify.success('succeed')
          mutateNfts(undefined, true)
          setWithdrawable(false)
          setVisible(false)
          setWithdrawing(false)
        } else {
          throw res.message || res.data.message || 'Server down.'
        }
      } catch (err: any) {
        console.log(err)
        toastify.error(err.message)
        setWithdrawing(false)
      }
    }
  }
  const handlePriceChange = useCallback((val) => setPrice(val), [])
  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleCollateralChange = useCallback((val) => setCollateral(val), [])

  const handleLend = async () => {
    try {
      if (!gamelandContract) {
        toastify.error('Contract not found.')
        return
      }
      if (!account) {
        toastify.error('Please connect an account.')
        return
      }
      setLending(true)
      // const owner = await nftContract.ownerOf(currentItem.nftId)

      const deposited = await gamelandContract.deposit(
        parseEther(price),
        days,
        currentItem.nftId,
        parseEther(collateral),
        currentItem.contractAddress,
        currentItem.gamelandNftId
      )

      gamelandContract.on('Received', (from, to, amount, event) => {
        console.log(`${from} sent ${amount} to ${to},event: ${event}`)
      })
      const tx = await deposited.wait()
      console.log(deposited.hash, tx)
      if (!tx.status) {
        throw Error('Failed to deposit.')
      }

      const params = {
        isLending: true,
        price: Number(price),
        days: Number(days),
        collateral: Number(collateral)
      }
      console.log(params)

      const res: any = await http.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
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
    const nftAddress = currentItem.asset_contract?.address
    if (NFTsContract) {
      try {
        if (currentItem.originOwner !== account) {
          const params = {
            originOwner: account
          }
          await http.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
        }
        let approvetx
        if (currentItem.asset_contract?.schema_name === 'ERC721') {
          approvetx = await NFTsContract[nftAddress].approve(GameLandAddress, currentItem.nftId)
        } else {
          approvetx = await NFTsContract[nftAddress].setApprovalForAll(GameLandAddress, true)
        }
        // const approvetx = await nftContract.approve(GameLandAddress, currentItem.nftId)
        console.log(approvetx)

        console.log(await approvetx.wait())

        setIsApproved(true)
      } catch (err: any) {
        toastify.error(err.message)
      }
    }
    setApproving(false)
  }

  return (
    <div className="container">
      <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <NftCard
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              collateral={currentItem.collateral}
              img={currentItem.image_url}
              nftId={currentItem.token_id as string}
              withdrawable={withdrawable}
              unOperate={true}
              asset_contract={currentItem.asset_contract}
            />
          </Col>

          <Col span="12" xl={12} sm={24}>
            <h3>{currentItem.name}</h3>
            <p>
              <span className="tips">#{currentItem.token_id}</span>
            </p>
            {currentItem.sell_orders ? (
              <a
                href={`${process.env.REACT_APP_OPENSEA}/assets/${currentItem.contractAddress}/${currentItem.token_id}`}
                target="_blank"
                rel="noreferrer"
              >
                The NFT is on sale.
              </a>
            ) : awaiting ? (
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
            ) : withdrawable ? (
              <Button block shape="round" loading={withdrawing} onClick={handleWithdraw} size="large">
                Withdraw
              </Button>
            ) : isApproved ? (
              <>
                <Dlist className="flex">
                  <div>
                    <span>Enter collateral.</span>
                    <NumInput onChange={handleCollateralChange} value={collateral} />
                  </div>
                  <div>
                    <span>Enter price per day.</span>
                    <NumInput onChange={handlePriceChange} value={price} />
                  </div>
                  <div>
                    <span>Enter renting days.</span>
                    <NumInput validInt onChange={handleDaysChange} value={days} />
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
                  type="primary"
                  size="large"
                >
                  Lend
                </Button>
              </>
            ) : (
              <div>
                <Button className="lend" shape="round" block onClick={handleApprove} loading={approving} size="large">
                  Approve
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

      <MyTabs
        defaultActiveKey="1"
        // tabBarExtraContent={
        //   // <Button onClick={handleMint} loading={minting}>
        //   //   Mint NFT
        //   // </Button>
        //   <a href="https://testnets.opensea.io/collection/pumpkinman" target="_blank" rel="noreferrer">
        //     Get NFT
        //   </a>
        // }
      >
        <TabPaneBox tab={<span className="clearGap">My NFT</span>} key="1">
          <MyNftBox>
            <Row gutter={[16, 16]}>
              {myNft.length ? (
                myNft.map((item: any) => (
                  <Col
                    span="6"
                    xl={6}
                    lg={8}
                    md={12}
                    sm={12}
                    xs={24}
                    key={item.id}
                    onClick={() => handleNftClick(item)}
                  >
                    <NftCard
                      name={item.name}
                      price={item.price}
                      days={item.days}
                      img={item.image_preview_url}
                      nftId={item.token_id as string}
                      isLending={item.isLending}
                      isBorrowed={item.isBorrowed}
                      withdrawable={item.withdrawable}
                      borrowAt={item.borrowAt}
                      sell_orders={item.sell_orders}
                      collateral={item.collateral}
                      asset_contract={item.asset_contract}
                    ></NftCard>
                  </Col>
                ))
              ) : (
                <Empty text="Ooops, looks like nothing here." />
              )}
            </Row>
          </MyNftBox>
          {/* <Pagination defaultCurrent={1} /> */}
        </TabPaneBox>
        <TabPaneBox tab={<span className="clearGap">My Renting</span>} key="2">
          <MyRenting />
        </TabPaneBox>
      </MyTabs>
      <ToastContainer />
    </div>
  )
}

const TabPaneBox = styled(TabPane)`
  padding-top: 1rem;
  padding-bottom: 2rem;
`
