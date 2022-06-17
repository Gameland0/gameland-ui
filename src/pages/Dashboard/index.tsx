import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Tabs, Button, Popconfirm } from 'antd'
import styled from 'styled-components'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { hashMessage } from 'ethers/lib/utils'
import BigNumber from 'bignumber.js'
import { Modal } from '../../components/Modal'
import { Dialog } from '../../components/Dialog'
import { Nft as NftCard, NftProps } from '../../components/Nft'
import {
  AssetContractAddress,
  useActiveWeb3React,
  useGameLandContract,
  useStore,
  useAssetContract,
  useControlContract
} from '../../hooks'
import { NumInput } from '../../components/NumInput'
import { toastify, ToastContainer } from '../../components/Toastify'
import { Dlist } from '../Lend'
import { ContentBox } from '../Rent'
import { http2 } from '../../components/Store'
import { MyRenting } from './MyRenting'
import { lowerCase } from 'lower-case'
import { parseEther } from '@ethersproject/units'
import { Loading } from '../../components/Loading'
import { Empty } from '../../components/Empty'
import { useFetchMyNfts } from '../../hooks/useFetchMyNfts'
import { Pagination } from '../../components/Pagination'
import { ConnectWallet } from '../../components/ConnectWallet'
import { fetchReceipt, fixDigitalId, ZeroAddress } from '../../utils'
import { NFTDigits, OPENSEA_URL, POLYGONSCAN_KEY } from '../../constants'
import { ABIs } from '../../constants/Abis/ABIs'

const { TabPane } = Tabs
const MyTabs = styled(Tabs)`
  margin-top: 2rem;
`
const MyNftBox = styled.div``

export const getContract = (library: Web3Provider | undefined, address: string, abi: any[]) => {
  if (!library) return null

  return new Contract(address, abi, library.getSigner())
}
export const fetchAbi = async (address: string) => {
  if (!address) return
  try {
    const apiKey = POLYGONSCAN_KEY
    const data = await fetch(
      `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`,
      {
        method: 'GET',
        mode: 'cors'
      }
    )
    const dataJson = await data.json()
    const { result } = dataJson

    localStorage.setItem(address.toLowerCase(), result)

    return result
  } catch (e: any) {
    console.log(e.message)
    return []
  }
}
export const Dashboard = () => {
  const { account, library } = useActiveWeb3React()
  const { mutateDebts, nfts } = useStore()
  const AssetContract = useAssetContract()
  const ControlContract = useControlContract()
  const gamelandContract = useGameLandContract()
  // const myNft = useMyNfts()
  // const [totalPage, setTotalPage] = useState(0)
  const [offset, setOffset] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [limit, setLimit] = useState(12)
  const { data: _myNfts, mutate: mutateMyNfts } = useFetchMyNfts(offset, limit)
  const [myNfts, setMyNfts] = useState<any[]>([])
  const [prevDisabled, setPrevDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(true)

  const [visible, setVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState({} as any)
  const [prompt, setPrompt] = useState(false)
  const [penalty, setPenalty] = useState('')
  const [price, setPrice] = useState('')
  const [days, setdays] = useState('')
  const [collateral, setCollateral] = useState('')
  const [lending, setLending] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [liquidating, setLiquidating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [expired, setExpired] = useState(false)
  const [withdrawable, setWithdrawable] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [minting, setMinting] = useState(false)
  const [awaiting, setAwaiting] = useState(false)

  const fetchMetadata = (data: any[], contracts: Contract) => {
    if (!data || !data.length) {
      return []
    }

    return data.map(async (item) => {
      try {
        let contractIndex = contracts.findIndex((i: any) => {
          return i.toLowerCase() === item.token_address.toLowerCase()
        })

        if (contractIndex >= 0) {
          contractIndex = contractIndex + 1
        } else {
          return
        }
        const gamelandId = fixDigitalId(contractIndex, item.token_id, NFTDigits)
        item.gamelandNftId = hashMessage(gamelandId)
        if (!item.metadata) {
          const params = {
            nftId: item.token_id,
            contractAddress: item.token_address,
            gamelandNftId: hashMessage(gamelandId)
          }
          const res: any = await http2.get(`/v0/nft/${hashMessage(gamelandId)}`)
          if (res.data.code === 1) {
            if (res.data.data === null || res.data.data.length < 1) {
              http2.post('/v0/nft', params)
            } else if (res.data.data.length > 0) {
              const metadata: any = {
                name: res.data.data[0]?.name,
                image: res.data.data[0]?.img
              }
              item.metadata = metadata
            }
          }
        } else if (typeof item.metadata === 'string') {
          try {
            const { name, image } = JSON.parse(item.metadata)
            item.metadata = {
              name,
              image
            }
          } catch (err: any) {
            console.log(err)
            item.metadata = {}
          }
        }
        return item
      } catch (err: any) {
        console.log(err)
      }
    })
  }

  useEffect(() => {
    if (!offset) {
      setPrevDisabled(true)
    } else {
      setPrevDisabled(false)
    }
  }, [offset])

  useEffect(() => {
    if (!_myNfts) {
      return
    }

    if (_myNfts.result.length < limit) {
      setNextDisabled(true)
    } else {
      setNextDisabled(false)
    }
    const lendableNfts = _myNfts.result.filter((item: any) => {
      return (
        nfts.findIndex(
          (debt: any) =>
            debt.contractAddress.toLowerCase() === item.token_address.toLowerCase() && debt.nftId === item.token_id
        ) < 0
      )
    })
    const syncFn = async () => {
      const contracts = await gamelandContract?.get_nft_programes()
      const _nfts = fetchMetadata(lendableNfts, contracts)
      contracts
        ? Promise.all(_nfts).then((vals) => {
            setMyNfts(vals)
          })
        : setMyNfts([])
    }
    syncFn()
    // if (_myNfts.result.length === limit) {
    // const _offset = _myNfts.cursor
    // setOffset(_offset)
    // mutateMyNfts(undefined)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_myNfts, offset])

  const handleNext = () => {
    const _offset = _myNfts.cursor
    setOffset(_offset)
    mutateMyNfts(undefined)
  }
  const handlePrev = () => {
    const _offset = ''
    setOffset(_offset)
    mutateMyNfts(undefined)
  }

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
    setExpired(false)
    setAwaiting(true)

    if (item.sell_orders) return

    const contractAddress = item.token_address ?? ''

    const localAbi = localStorage.getItem(contractAddress.toLowerCase())
    let storedAbi
    for (const [key, value] of Object.entries(ABIs)) {
      if (key.toLowerCase() === contractAddress.toLowerCase()) {
        storedAbi = value
      }
    }

    // const constantAbi: any[] = ABIs[contractAddress]
    const ABI = storedAbi && storedAbi.length ? storedAbi : localAbi ? localAbi : await fetchAbi(contractAddress)
    const nftContract = getContract(library, contractAddress, ABI)
    item.contract = nftContract
    setCurrentItem(item)
    console.log(item)

    if (nftContract !== null) {
      console.log(!!nftContract?.getApproved, !!nftContract?.isApprovedForAll)

      try {
        // check ERC721 approve
        if (item.contract_type === 'ERC721' && !!nftContract?.getApproved) {
          const approveAddress = await nftContract?.getApproved(item.token_id)
          console.log(approveAddress, approveAddress === ZeroAddress)

          if (lowerCase(approveAddress) === lowerCase(gamelandContract?.address as string)) {
            setIsApproved(true)
          } else {
            setIsApproved(false)
          }
        } else if (!!nftContract?.isApprovedForAll) {
          // check ERC1155 approve
          const isApproved = await nftContract?.isApprovedForAll(gamelandContract?.address, account)
          console.log(isApproved)

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
        const liquidated = await gamelandContract.confiscation(currentItem.gamelandNftId, currentItem.id)
        const receipt = await fetchReceipt(liquidated.hash, library)
        const { status } = receipt
        if (!status) {
          throw Error('Failed to confiscated.')
        }
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
        const res: any = await http2.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
        if (res.data.code === 1) {
          toastify.success('succeed')
          setLiquidating(false)
          setVisible(false)
          mutateDebts(undefined, true)
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const contractAddress = currentItem.token_address ?? ''
        if (!gamelandContract || !currentItem.contract) {
          toastify.error('Contract not found.')
          return
        }
        setWithdrawing(true)
        const owner = await currentItem.contract.ownerOf(currentItem.nftId)
        // const owner = await NFTsContract[contractAddress].ownerOf(currentItem.nftId)

        if (lowerCase(owner) !== lowerCase(account)) {
          const withdrawnft = await gamelandContract.withdrawnft(
            currentItem.nftId,
            currentItem.contractAddress,
            currentItem.gamelandNftId,
            currentItem.id
          )
          const receipt = await fetchReceipt(withdrawnft.hash, library)
          const { status } = receipt
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
        const res: any = await http2.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
        console.log(owner, res)

        if (res.data.code === 1) {
          console.log(res.data.message)

          toastify.success('succeed')
          mutateDebts(undefined, true)
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
  const handlePenaltyChange = useCallback((val) => setPenalty(val), [])

  const handleLend = async () => {
    try {
      if (Number(penalty) < 1) {
        toastify.error('Minimum scale is 1.')
        return
      }
      if (Number(penalty) > 20) {
        toastify.error('maximum scale is 20.')
        return
      }
      if (!penalty) {
        toastify.error('Please enter rental penalty.')
        return
      }
      if (!account) {
        toastify.error('Please connect an account.')
        return
      }
      setLending(true)
      // const owner = await nftContract.ownerOf(currentItem.nftId)
      console.log(price, days, currentItem.token_id, collateral, currentItem.token_address, currentItem.gamelandNftId)
      const Collateral = new BigNumber(collateral as unknown as string)
      const Day = new BigNumber(days as unknown as string)
      const Price = new BigNumber(price as unknown as string)
      const cost = Day.times(Price)
      const PenaltyProportion = new BigNumber(penalty as unknown as string).times(new BigNumber('0.01'))
      const amount = Collateral.plus(cost)
      const Penalty = amount.times(PenaltyProportion).toString()
      const deposited = await ControlContract?.deposit(
        currentItem.name,
        currentItem.contract_type,
        currentItem.token_id,
        parseEther(price),
        days,
        parseEther(collateral),
        parseEther(Penalty),
        currentItem.gamelandNftId,
        currentItem.contractAddress,
        'ETH'
      )

      const receipt = await fetchReceipt(deposited.hash, library)
      if (!receipt.status) {
        throw Error('Failed to deposit.')
      }
      const index = await AssetContract?.get_nftsindex(currentItem.gamelandNftId)
      const params = {
        nftId: currentItem.token_id,
        isLending: true,
        price: Number(price),
        days: Number(days),
        collateral: Number(collateral),
        originOwner: account,
        contractAddress: currentItem.contractAddress,
        standard: currentItem.contract_type,
        metadata: JSON.stringify(currentItem.metadata) || '',
        gamelandNftId: currentItem.gamelandNftId,
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON(),
        penalty: Penalty,
        pay_type: 'ETH',
        lendIndex: index.toString(),
        expire_blocktime: Math.floor(new Date().valueOf() / 1000),
        name: currentItem.metadata.name,
        img: currentItem.metadata.image,
        contractName: currentItem.name
      }
      console.log(params)
      const res: any = await http2.post(`/v0/opensea/`, params)
      console.log(res)
      setLending(false)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setPrice('')
        setCollateral('')
        setdays('')
        setVisible(false)
        mutateDebts(undefined, true)
        mutateMyNfts(undefined, true)
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
    if (currentItem.contract) {
      try {
        let approvetx
        if (currentItem.contract_type === 'ERC721' && currentItem.contract?.approve) {
          approvetx = await currentItem.contract.approve(AssetContractAddress, currentItem.token_id)
        } else {
          approvetx = await currentItem.contract.setApprovalForAll(AssetContractAddress, true)
        }
        // const approvetx = await nftContract.approve(GameLandAddress, currentItem.nftId)
        console.log(approvetx)
        const receipt = await fetchReceipt(approvetx.hash, library)
        if (!receipt.status) {
          throw new Error('failed')
        }

        setIsApproved(true)
        setPrompt(true)
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
              name={currentItem.metadata?.name}
              price={currentItem.price}
              days={currentItem.days}
              collateral={currentItem.collateral}
              img={currentItem.metadata?.image}
              size={500}
              nftId={currentItem.token_id as string}
              withdrawable={withdrawable}
              unOperate={true}
              contract_type={currentItem.contract_type}
              borrowDay={currentItem.borrowDay}
            />
          </Col>

          <Col span="12" xl={12} sm={24}>
            <h3>{currentItem.metadata?.name}</h3>
            <p>
              <span className="tips">#{currentItem.token_id}</span>
            </p>
            {currentItem.sell_orders ? (
              <a
                href={`${OPENSEA_URL}/assets/${currentItem.contractAddress}/${currentItem.token_id}`}
                target="_blank"
                rel="noreferrer"
              >
                The NFT is on sale.
              </a>
            ) : awaiting ? (
              <Loading />
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
                    <span>Enter Penalty.</span>
                    <NumInput onChange={handlePenaltyChange} value={penalty} />
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
                  disabled={!(price && days && collateral)}
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
      <Dialog footer={null} onCancel={() => setPrompt(false)} visible={prompt} destroyOnClose closable={false}>
        <ContentBox>
          <div className="title">Prompt</div>
          <p>
            You can only liquidate and deduct the penalty fee if the lease is not returned for more than 8 hours after
            the lease time expires, and the daily price will be deducted from the mortgage for every subsequent day The
            penalty formula is ((price per day*days)+mortgage amount)*the ratio you set, and the range of penalty
            settings is 0~20%
          </p>
        </ContentBox>
      </Dialog>
      <MyTabs defaultActiveKey="1">
        <TabPaneBox tab={<span className="clearGap">My NFT</span>} key="1">
          <MyNftBox>
            <Row gutter={[16, 16]}>
              {!account ? (
                <div className="container flex flex-center">
                  <ConnectWallet size="large" />
                </div>
              ) : myNfts && myNfts.length ? (
                myNfts.map((item: any, index) => (
                  <Col span="6" xl={6} lg={8} md={12} sm={12} xs={24} key={index} onClick={() => handleNftClick(item)}>
                    <NftCard
                      name={item.metadata?.name}
                      price={item.price}
                      days={item.days}
                      img={item.metadata?.image}
                      nftId={item.token_id as string}
                      isLending={item.isLending}
                      isBorrowed={item.isBorrowed}
                      withdrawable={item.withdrawable}
                      borrowAt={item.borrowAt}
                      sell_orders={item.sell_orders}
                      collateral={item.collateral}
                      contract_type={item.contract_type}
                      borrowDay={item.borrowDay}
                    ></NftCard>
                  </Col>
                ))
              ) : (
                <Empty text="Ooops, looks like nothing here." />
              )}
            </Row>
          </MyNftBox>
          {account ? (
            <Pagination
              align="center"
              nextDisabled={nextDisabled}
              prevDisabled={prevDisabled}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          ) : null}
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
