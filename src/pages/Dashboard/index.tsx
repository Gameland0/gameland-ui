import React, { useCallback, useMemo, useState } from 'react'
import { Row, Col, Tabs, Button, Input, Popconfirm } from 'antd'
import styled from 'styled-components'
import { ChainName } from '../../components/ChainName'
import { Modal } from '../../components/Modal'
import { Nft as NftCard, NftProps } from '../../components/Nft'
import {
  GameLandAddress,
  useActiveWeb3React,
  useGameLandContract,
  useMyNftContract,
  useMyNfts,
  useStore
} from '../../hooks'
import { NumInput } from '../../components/NumInput'
import { toastify, ToastContainer } from '../../components/Toastify'
import { Dlist } from '../Lend'
import { http } from '../../components/Store'
import { isEmpty } from 'lodash'
import { formatAddress, getProgress, ZeroAddress } from '../../utils'
import { MyRenting } from './MyRenting'
import { SpanLabel, DaysInfo } from '../Rent'
import BigNumber from 'bignumber.js'
import { lowerCase } from 'lower-case'
import { parseEther } from '@ethersproject/units'
import { Loading } from '../../components/Loading'
import { Empty } from '../../components/Empty'

const { TabPane } = Tabs
const MyTabs = styled(Tabs)`
  margin-top: 2rem;
`
const MyNftBox = styled.div``

export const Dashboard = () => {
  const { account } = useActiveWeb3React()
  const nftContract = useMyNftContract()
  const gamelandContract = useGameLandContract()
  const [nid, setNid] = useState('')
  const myNft = useMyNfts()

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

  const nfts = ['Eagle', 'Wizards', 'Animal', 'Devil', 'Woof', 'Alien', 'Fox']
  const handleAddProgram = async () => {
    try {
      const addedProgram = await gamelandContract?.add_nft_program(nid)
      const { status } = await addedProgram.wait()
      if (!status) {
        throw Error('failed')
      }
      toastify.success('succeed')
    } catch (error: any) {
      toastify.error(error.message || 'Failed to add nft contract')
    }
  }
  const handleMint = async () => {
    setMinting(true)
    try {
      let NftAmount: any = window.localStorage.getItem(`Amount-${account}`) ?? 0
      console.log(NftAmount)

      if (NftAmount.length >= 2) {
        toastify.error('Each user can only mint two NFTs.')
        setMinting(false)
        return
      }
      const id = new Date().valueOf()
      const _mint = await nftContract?.mint(account, id)
      await _mint.wait()
      console.log(id)

      const num = Math.floor(Math.random() * 7)
      const params = {
        nftId: id,
        name: nfts[num],
        img: 'img',
        isLending: false,
        isBorrowed: false,
        owner: account,
        originOwner: account
      }
      const res: any = await http.post('/api/nft', params)
      console.log(res, res.data.code === 1)
      NftAmount += 1
      window.localStorage.setItem(`Amount-${account}`, NftAmount)

      if (res.data.code === 1) {
        console.log(res)
        toastify.success(res.data.message)
        setMinting(false)
        mutateNfts(undefined, true)
      } else {
        throw res
      }
    } catch (err: any) {
      setMinting(false)
      console.log(err)
      toastify.error(err.message)
    }
  }
  const checkNftOwner = async () => {
    try {
      const originOwn = await gamelandContract?.nft_owner(nid)
      console.log(`${nid} origin owner:` + originOwn)
    } catch (err: any) {
      console.log(err)
      toastify.error(err.message)
    }
  }
  const checkApproveOwner = async () => {
    try {
      const approvedAddr = await nftContract?.getApproved(nid)
      console.log(`${nid} Approved address:` + approvedAddr)
    } catch (err: any) {
      console.log(err)
      toastify.error(err.message)
    }
  }
  const checkOwnerOf = async () => {
    try {
      const ownerOf = await nftContract?.ownerOf(nid)
      console.log(`${nid} ownerOf address:` + ownerOf)
    } catch (err: any) {
      console.log(err)
      toastify.error(err.message)
    }
  }
  const checkExists = async () => {
    try {
      const isExists = await nftContract?.exist(nid)
      console.log(`${nid} is exists:` + isExists)
    } catch (err: any) {
      console.log(err)
      toastify.error(err.message)
    }
  }
  const checkNftBalance = async () => {
    try {
      const balanceOf = await nftContract?.balanceOf(account)
      console.log(`account nft:` + balanceOf)
    } catch (err: any) {
      console.log(err)
      toastify.error(err.message)
    }
  }

  const handleGetTestNft = async () => {
    try {
      console.log(gamelandContract?.address)

      const data = await gamelandContract?.get_all_nfts()
      console.log('data:' + data)
    } catch (err: any) {
      console.log(err)
      toastify.error(err.message)
    }
  }

  const handleGetBorrowStatus = async () => {
    try {
      const status = await gamelandContract?.get_borrow_info(nid)
      const dateStr = (status[1].toString() + '000') as unknown as number
      console.log(gamelandContract?.address, status, dateStr, new Date(Number(dateStr)))
    } catch (err: any) {
      console.log(err.message)
    }
  }

  const handleBorrowOrNot = async () => {
    try {
      const status = await gamelandContract?.borrow_or_not(nid)
      console.log(status)
    } catch (err: any) {
      console.log(err.message)
    }
  }

  const CheckNFTLendingInfo = async () => {
    if (gamelandContract) {
      const info = await gamelandContract.get_nft_allinfo(nid)
      console.log(info.map((item: any) => item.toString()))
    }
  }

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
        const nftOwner = await nftContract?.ownerOf(item.token_id)
        setWithdrawable(checkWithdrawAble(nftOwner, account as string))
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.message || 'Error occured with retrieving details.')
    }

    if (nftContract) {
      console.log(item)

      try {
        const approveAddress = await nftContract.getApproved(item.token_id)
        console.log(approveAddress, approveAddress === ZeroAddress)

        if (lowerCase(approveAddress) === lowerCase(gamelandContract?.address as string)) {
          setIsApproved(true)
        } else {
          setIsApproved(false)
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
        if (!gamelandContract || !nftContract) {
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
      if (!gamelandContract || !nftContract) {
        toastify.error('Contract not found.')
        return
      }
      if (!account) {
        toastify.error('Please connect an account.')
        return
      }
      setLending(true)
      const owner = await nftContract.ownerOf(currentItem.nftId)
      if (lowerCase(owner) !== lowerCase(account)) {
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
    if (nftContract) {
      try {
        if (currentItem.originOwner !== account) {
          const params = {
            originOwner: account
          }
          await http.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
        }
        const approvetx = await nftContract.approve(GameLandAddress, currentItem.nftId)
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
    <div>
      <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <Row gutter={[24, 24]}>
          <Col span="12" xl={12} sm={24}>
            <NftCard
              name={currentItem.name}
              price={currentItem.price}
              days={currentItem.days}
              img={currentItem.image_url}
              nftId={currentItem.token_id as string}
              withdrawable={withdrawable}
              unOperate={true}
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
      {process.env.NODE_ENV === 'development' ? (
        <>
          <ChainName />
          <Button onClick={handleGetTestNft}>getNFT</Button>

          <Input value={nid} onChange={(e) => setNid(e.currentTarget.value)} />
          <Button onClick={handleAddProgram}>addContract</Button>
          <Button onClick={handleMint}>mint</Button>
          <Button onClick={checkNftOwner}>checkNftOwner</Button>
          <Button onClick={checkApproveOwner}>checkApproveOwner</Button>
          <Button onClick={checkExists}>checkExists</Button>
          <Button onClick={checkOwnerOf}>checkOwnerOf</Button>
          <Button onClick={checkNftBalance}>nftBalance</Button>
          <Button onClick={handleGetBorrowStatus}>GetBorrowStatus</Button>
          <Button onClick={handleBorrowOrNot}>Borrowed</Button>
          <Button onClick={CheckNFTLendingInfo}>CheckNFTLendingInfo</Button>
        </>
      ) : null}

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
                    ></NftCard>
                  </Col>
                ))
              ) : (
                <Empty text="Ooops, looks like nothing here." />
              )}
            </Row>
          </MyNftBox>
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
