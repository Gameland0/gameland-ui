import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Tabs, Button, Popconfirm } from 'antd'
import styled from 'styled-components'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { hashMessage } from 'ethers/lib/utils'
import BigNumber from 'bignumber.js'
import loadding from '../../assets/loading.svg'
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
import { http2, http } from '../../components/Store'
import { MyRenting } from './MyRenting'
import { lowerCase } from 'lower-case'
import { parseEther } from '@ethersproject/units'
import { Loading } from '../../components/Loading'
import { Empty } from '../../components/Empty'
import { useFetchMyNfts } from '../../hooks/useFetchMyNfts'
import { Pagination } from '../../components/Pagination'
import { ConnectWallet } from '../../components/ConnectWallet'
import { fetchReceipt, fixDigitalId, ZeroAddress } from '../../utils'
import { NFTDigits, OPENSEA_URL, BSCSCAN_KEY } from '../../constants'
import { ABIs } from '../../constants/Abis/ABIs'

const { TabPane } = Tabs
const MyTabs = styled(Tabs)`
  margin-top: 2rem;
`
const SendBox = styled.div`
  .title {
    width: 100%;
    font-size: 24px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
    text-align: center;
  }
  .input {
    width: 100%;
    height: 3rem;
    border-radius: 20px 20px 20px 20px;
    border: 1px solid #e5e5e5;
    input {
      width: 100%;
      height: 100%;
      padding-left: 10px;
      font-size: 20px;
      border-radius: 20px 20px 20px 20px;
      outline: none;
      border: none;
    }
  }
  .button {
    width: 16rem;
    height: 4rem;
    font-size: 24px;
    color: #fff;
    text-align: center;
    line-height: 4rem;
    border-radius: 20px 20px 20px 20px;
    margin: 2rem 0 1rem 12rem;
    position: relative;
  }
  .false {
    background: rgba(53, 202, 169, 0.5);
    cursor: not-allowed;
  }
  .ture {
    background: rgba(53, 202, 169, 1);
    cursor: pointer;
  }
  .loadding {
    width: 64px;
    height: 64px;
    position: absolute;
    top: 0px;
    rigth: 0px;
  }
`
const MyNftBox = styled.div``

export const getContract = (library: Web3Provider | undefined, address: string, abi: any[]) => {
  if (!library) return null

  return new Contract(address, abi, library.getSigner())
}
export const fetchAbi = async (address: string) => {
  if (!address) return
  try {
    const apiKey = BSCSCAN_KEY
    const data = await fetch(
      `https://api.bscscan.com/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`,
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
  const [cursor, setCursor] = useState(1)
  const [currentNft, setCurrentNft] = useState([] as any)
  const [limit, setLimit] = useState(48)
  const { data: _myNfts, mutate: mutateMyNfts } = useFetchMyNfts()
  const [myNfts, setMyNfts] = useState<any[]>([])
  const [prevDisabled, setPrevDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(true)
  const [toAddress, setToAddress] = useState('')
  const [visible, setVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState({} as any)
  const [prompt, setPrompt] = useState(false)
  const [showSend, setShowSend] = useState(false)
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
  const [isSendApproved, setIsSendApproved] = useState(false)
  // const [minting, setMinting] = useState(false)
  const [awaiting, setAwaiting] = useState(false)

  const fetchMetadata = (data: any[], contracts: any) => {
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
        const gamelandId = fixDigitalId(contractIndex, item.token_id, account)
        item.gamelandNftId = hashMessage(gamelandId)
        if (!item.metadata) {
          try {
            const { data } = await http.get(item.token_uri)
            item.metadata = data
          } catch (error) {
            item.metadata = []
          }
        } else if (typeof item.metadata === 'string') {
          try {
            item.metadata = JSON.parse(item.metadata)
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

  // useEffect(() => {
  //   ControlContract?.add_nft_programforarray([
  //     '0x41f4845d0ed269f6205d4542a5165255a9d6e8cf',
  //     '0x51ac4a13054d5d7e1fa795439821484177e7e828',
  //     '0x5b30cc4def69ae2dfcddbc7ebafea82cedae0190',
  //     '0x85bc2e8aaad5dbc347db49ea45d95486279ed918',
  //     '0x22d5f9b75c524fec1d6619787e582644cd4d7422'
  //   ])
  // }, [])

  useEffect(() => {
    if (!_myNfts) {
      return
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
      const contracts = [
        // '0x13b5816396c5095a145af6994688e6e53fda6095',
        // '0x7e00338097ad4397a39af5e2b36012348fd87d8b',
        // '0x85f0e02cb992aa1f9f47112f815f519ef1a59e2d',
        // '0xe6965b4f189dbdb2bd65e60abaeb531b6fe9580b',
        // '0x4cd0ce1d5e10afbcaa565a0fe2a810ef0eb9b7e2',
        // '0xeea8bd31da9a2169c38968958b6df216381b0f08',
        '0xe218144c228863b03ccf85d120fd5b71bf97f3f4',
        '0xe6965b4f189dbdb2bd65e60abaeb531b6fe9580b',
        '0x1dDB2C0897daF18632662E71fdD2dbDC0eB3a9Ec',
        '0x1B26e0F75c623fE9357dBC6c1871AB745fACcF04',
        '0x198D33FB8f75aC6a7CB968962c743F09C486cCA6'
      ]
      const haveNfts = lendableNfts.filter((item: any) => {
        return contracts.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
      })
      const _nfts = fetchMetadata(haveNfts, contracts)
      contracts
        ? Promise.all(_nfts).then((vals) => {
            setMyNfts(vals)
          })
        : setMyNfts([])
    }
    syncFn()
  }, [_myNfts])

  useEffect(() => {
    const page = Math.ceil(myNfts.length / limit)
    if (cursor <= page) {
      const nfts = myNfts.slice((cursor - 1) * limit, cursor * limit)
      setCurrentNft(nfts)
    }
    if (cursor < page) {
      setNextDisabled(false)
    } else {
      setNextDisabled(true)
    }
    if (cursor > 1) {
      setPrevDisabled(false)
    } else {
      setPrevDisabled(true)
    }
  }, [cursor, myNfts])

  const handleNext = () => {
    setCursor(cursor + 1)
    mutateMyNfts(undefined)
  }
  const handlePrev = () => {
    setCursor(cursor - 1)
    mutateMyNfts(undefined)
  }

  const handleToAddressChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setToAddress(val)
  }, [])
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
    console.log(item)
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

    if (nftContract !== null) {
      try {
        // check ERC721 approve
        if (item.contract_type === 'ERC721' && !!nftContract?.getApproved) {
          const approveAddress = await nftContract?.getApproved(item.token_id)
          if (lowerCase(approveAddress) === lowerCase(AssetContractAddress as string)) {
            setIsApproved(true)
          } else {
            setIsApproved(false)
          }
        } else if (!!nftContract?.isApprovedForAll) {
          // check ERC1155 approve
          const isApproved = await nftContract?.isApprovedForAll(AssetContractAddress, account)
          console.log(isApproved)

          isApproved ? setIsApproved(true) : setIsApproved(false)
        }
      } catch (err: any) {
        console.log(err.message)
      }
    }
    setAwaiting(false)
  }

  const handleSendNft = async (item: any) => {
    setShowSend(true)
    setToAddress('')
    if (item.sell_orders) return
    const contractAddress = item.token_address ?? ''
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
      const Collateral = new BigNumber(collateral as unknown as string)
      const Day = new BigNumber(days as unknown as string)
      const Price = new BigNumber(price as unknown as string)
      const cost = Day.times(Price)
      const PenaltyProportion = new BigNumber(penalty as unknown as string).times(new BigNumber('0.01'))
      const amount = Collateral.plus(cost)
      const Penalty = amount.times(PenaltyProportion).toString()
      const deposited = await ControlContract?.deposit(
        currentItem.metadata.name,
        currentItem.contract_type,
        currentItem.token_id,
        parseEther(price),
        days,
        parseEther(collateral),
        parseEther(Penalty),
        currentItem.gamelandNftId,
        currentItem.token_address,
        'eth'
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
        contractAddress: currentItem.token_address,
        standard: currentItem.contract_type,
        metadata: JSON.stringify(currentItem.metadata) || '',
        gamelandNftId: currentItem.gamelandNftId,
        createdAt: new Date().toJSON(),
        updatedAt: new Date().toJSON(),
        penalty: Penalty,
        pay_type: 'eth',
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
  const sendNFT = async () => {
    if (currentItem.contract) {
      try {
        setLending(true)
        const approvetx = await currentItem.contract.transferFrom(account, toAddress, currentItem.token_id)
        const receipt = await fetchReceipt(approvetx.hash, library)
        if (!receipt.status) {
          throw new Error('failed')
        }
        setLending(false)
        setShowSend(false)
      } catch (err: any) {
        toastify.error(err.message)
        setLending(false)
      }
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

  const sendApprove = async () => {
    if (!toAddress) return
    if (currentItem.contract) {
      try {
        setLending(true)
        let approvetx
        if (currentItem.contract_type === 'ERC721' && currentItem.contract?.approve) {
          approvetx = await currentItem.contract.approve(toAddress, currentItem.token_id)
        } else {
          approvetx = await currentItem.contract.setApprovalForAll(toAddress, true)
        }
        const receipt = await fetchReceipt(approvetx.hash, library)
        if (!receipt.status) {
          throw new Error('failed')
        }
        setLending(false)
        setIsSendApproved(true)
      } catch (err: any) {
        toastify.error(err.message)
        setLending(false)
      }
    }
  }

  return (
    <div className="container">
      <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible} closable={false}>
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
              penalty={0}
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
      <Dialog footer={null} onCancel={() => setShowSend(false)} visible={showSend} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">Transfer your NFT</div>
          <h2>Address</h2>
          <div className="input">
            <input placeholder="To address" onChange={handleToAddressChange} value={toAddress} />
          </div>
          {isSendApproved ? (
            <div className="button ture" onClick={sendNFT}>
              Send
              {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
            </div>
          ) : (
            <div className={toAddress ? 'button ture' : 'button false'} onClick={sendApprove}>
              Approve
              {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
            </div>
          )}
        </SendBox>
      </Dialog>
      <MyTabs defaultActiveKey="1">
        <TabPaneBox tab={<span className="clearGap">My NFT</span>} key="1">
          <MyNftBox>
            <Row gutter={[16, 16]}>
              {!account ? (
                <div className="container flex flex-center">
                  <ConnectWallet size="large" />
                </div>
              ) : currentNft && currentNft.length ? (
                currentNft.map((item: any, index: any) => (
                  <Col span="6" xl={6} lg={8} md={12} sm={12} xs={24} key={index}>
                    <NftCard
                      name={item.metadata?.name}
                      price={item.price}
                      days={item.days}
                      img={item.metadata?.image}
                      nftId={item.token_id as string}
                      isLending={item.isLending}
                      onLend={() => handleNftClick(item)}
                      onSend={() => handleSendNft(item)}
                      isBorrowed={item.isBorrowed}
                      withdrawable={item.withdrawable}
                      borrowAt={item.borrowAt}
                      sell_orders={item.sell_orders}
                      collateral={item.collateral}
                      contract_type={item.contract_type}
                      borrowDay={item.borrowDay}
                      penalty={0}
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
