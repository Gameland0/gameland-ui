import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Row, Col, Tabs, Button } from 'antd'
import styled from 'styled-components'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { hashMessage } from 'ethers/lib/utils'
import BigNumber from 'bignumber.js'
import loadding from '../../assets/loading.svg'
import arrow from '../../assets/icon_select.svg'
import { Modal } from '../../components/Modal'
import { Dialog } from '../../components/Dialog'
import { Nft as NftCard } from '../../components/Nft'
import { useActiveWeb3React, useStore, useAssetContract, useControlContract } from '../../hooks'
import { NumInput } from '../../components/NumInput'
import { toastify, ToastContainer } from '../../components/Toastify'
import { Dlist } from '../Lend'
import { ContentBox } from '../Rent'
import { bschttp, polygonhttp, http } from '../../components/Store'
import { MyRenting } from './MyRenting'
import { lowerCase } from 'lower-case'
import { parseEther } from '@ethersproject/units'
import { Loading } from '../../components/Loading'
import { Empty } from '../../components/Empty'
import { useFetchMyNfts } from '../../hooks/useFetchMyNfts'
import { Pagination } from '../../components/Pagination'
import { ConnectWallet } from '../../components/ConnectWallet'
import { fetchReceipt, fixDigitalId } from '../../utils'
import {
  BSCAssetContractAddress,
  OPENSEA_URL,
  BSCSCAN_KEY,
  POLYGONSCAN_KEY,
  ONE_API_KEY,
  BscContract,
  PolygonContract,
  POLYGONAssetContractAddress
} from '../../constants'
import { ABIs } from '../../constants/Abis/ABIs'

const { TabPane } = Tabs
const MyTabs = styled(Tabs)`
  margin-top: 2rem;
`
export const SendBox = styled.div`
  .title {
    width: 100%;
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    text-align: center;
  }
  .input {
    width: 100%;
    height: 3rem;
    border-radius: 20px 20px 20px 20px;
    border: 1px solid #e5e5e5;
    margin-top: 10px;
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
    border-radius: 20px;
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
  .Selection {
    position: relative;
    border: 1px solid #e5e5e5;
    border-radius: 20px;
    font-size: 24px;
    margin-top: 16px;
    padding-left: 10px;
    .arrowIcon {
      position: absolute;
      top: 20px;
      right: 10px;
    }
  }
  .Options {
    width: 100%;
    height: 60px;
    background: #fff;
    border-radius: 16px;
    z-index: 99;
    div {
      cursor: pointer;
      padding: 0 0 0 16px;
      font-size: 18px;
      .icon {
        width: 20px;
        height: 20px;
        margin-right: 6px;
      }
      &:hover {
        background: #8cd8f8;
      }
    }
  }
`
const MyNftBox = styled.div``

export const getContract = (library: Web3Provider | undefined, address: string, abi: any[]) => {
  if (!library) return null
  return new Contract(address, abi, library.getSigner())
}
export const fetchAbi = async (address: string, chain: any) => {
  if (!address) return
  try {
    let apiKey
    if (chain === 'bscscan') {
      apiKey = BSCSCAN_KEY
    } else if (chain === 'polygonscan') {
      apiKey = POLYGONSCAN_KEY
    } else if (chain === 'arbiscan') {
      apiKey = ONE_API_KEY
    }
    const data = await fetch(
      `https://api.${chain}.${chain ==='arbiscan'? 'io':'com'}/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`,
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
  const { account, library, chainId } = useActiveWeb3React()
  const { nfts } = useStore()
  const AssetContract = useAssetContract()
  const ControlContract = useControlContract()
  const [cursor, setCursor] = useState(1)
  const [limit, setLimit] = useState(48)
  const { data: _myNfts, mutate: mutateMyNfts } = useFetchMyNfts()
  const [myNfts, setMyNfts] = useState<any[]>([])
  const [currentNft, setCurrentNft] = useState([] as any)
  const [prevDisabled, setPrevDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(true)
  const [toAddress, setToAddress] = useState('')
  // const [Amount, setAmount] = useState('')
  const [visible, setVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState({} as any)
  const [prompt, setPrompt] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [penalty, setPenalty] = useState('')
  const [price, setPrice] = useState('')
  const [days, setdays] = useState('')
  const [collateral, setCollateral] = useState('')
  const [lending, setLending] = useState(false)
  const [approving, setApproving] = useState(false)
  const [expired, setExpired] = useState(false)
  const [withdrawable, setWithdrawable] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isSendApproved, setIsSendApproved] = useState(false)
  const [options, setOptions] = useState(false)
  const [currentSelection, setCurrentSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  // const [minting, setMinting] = useState(false)
  const [awaiting, setAwaiting] = useState(false)
  let http2: any
  let AssetContractAddress: any
  if (chainId === 56) {
    http2 = bschttp
    AssetContractAddress = BSCAssetContractAddress
  } else if (chainId === 137) {
    http2 = polygonhttp
    AssetContractAddress = POLYGONAssetContractAddress
  }

  const fetchMetadata = (data: any[], contracts: any) => {
    if (!data || !data.length) {
      return []
    }
    return data.map(async (item) => {
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
      try {
        const { data } = await http.get(item.token_uri)
        item.metadata = data
      } catch (err: any) {
        let chain
        if (chainId === 56) {
          chain = 'bsc'
        } else if (chainId === 137) {
          chain = 'polygon'
        }
        const getdata = axios.create({
          timeout: 10000,
          headers: {
            'X-Api-Key': '60aee01eae2f89f6fb4b81177df15c8c'
          }
        })
        try {
          const { data } = await getdata.get(
            `https://api.element.market/openapi/v1/asset?chain=${chain}&token_id=${item.token_id}&contract_address=${item.token_address}`
          )
          // item.metadata = JSON.parse(data.data.metadata_json)
          item.metadata = {
            name: data.data.name,
            image: data.data.imageUrl
          }
        } catch (error) {
          item.metadata = JSON.parse(item.metadata)
        }
      }
      return item
    })
  }

  useEffect(() => {
    if (!_myNfts) {
      setMyNfts([])
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
      let contracts: any
      if (chainId === 56) {
        contracts = BscContract
      } else if (chainId === 137) {
        contracts = PolygonContract
      }
      const haveNfts = lendableNfts.filter((item: any) => {
        return contracts.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
      })
      const _nfts = fetchMetadata(haveNfts, contracts)
      contracts
        ? Promise.all(_nfts).then((vals) => {
            setMyNfts(vals)
            setCurrentNft(vals)
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
  // const handleAmount = useCallback((ele) => {
  //   const val = ele.currentTarget.value
  //   setAmount(val)
  // }, [])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

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
    let chain
    if (chainId === 56) {
      chain = 'bscscan'
    } else if (chainId === 137) {
      chain = 'polygonscan'
    }
    const ABI = storedAbi && storedAbi.length ? storedAbi : localAbi ? localAbi : await fetchAbi(contractAddress, chain)
    const nftContract = getContract(library, contractAddress, ABI)
    item.contract = nftContract
    setCurrentItem(item)

    if (nftContract !== null) {
      try {
        // check ERC721 approve
        if (item.contract_type === 'ERC721' && nftContract?.getApproved) {
          const approveAddress = await nftContract?.getApproved(item.token_id)
          if (lowerCase(approveAddress) === lowerCase(AssetContractAddress as string)) {
            setIsApproved(true)
          } else {
            setIsApproved(false)
          }
        } else if (!!nftContract?.isApprovedForAll) {
          // check ERC1155 approve
          const isApproved = await nftContract?.isApprovedForAll(AssetContractAddress, account)

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
    let chain
    if (chainId === 56) {
      chain = 'bscscan'
    } else if (chainId === 137) {
      chain = 'polygonscan'
    }
    const ABI = storedAbi && storedAbi.length ? storedAbi : localAbi ? localAbi : await fetchAbi(contractAddress, chain)
    const nftContract = getContract(library, contractAddress, ABI)
    item.contract = nftContract
    setCurrentItem(item)
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
      let type
      if (currentSelection === 'BNB' || currentSelection === 'MATIC') {
        type = 'eth'
      } else {
        type = 'usdt'
      }
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
        type
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
        pay_type: type,
        lendIndex: index.toString(),
        expire_blocktime: Math.floor(new Date().valueOf() / 1000),
        name: currentItem.metadata.name,
        img: currentItem.metadata.image,
        contractName: currentItem.name
      }
      const res: any = await http2.post(`/v0/opensea/`, params)
      setLending(false)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setPrice('')
        setCollateral('')
        setdays('')
        setVisible(false)
        mutateMyNfts(undefined, true)
        location.reload()
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
        location.reload()
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
              pay_type={currentItem.pay_type}
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
                  <div>
                    <span>choose type.</span>
                    <div className="currentSelection" onClick={() => setOptions(!options)}>
                      {currentSelection}
                      <img src={arrow} className="arrowIcon" />
                    </div>
                    {options ? (
                      <div className="Options">
                        <div
                          onClick={() => {
                            setCurrentSelection(chainId === 56 ? 'BNB' : 'MATIC')
                            setOptions(false)
                          }}
                        >
                          {chainId === 56 ? 'BNB' : 'MATIC'}
                        </div>
                        <div
                          onClick={() => {
                            setCurrentSelection(chainId === 56 ? 'BUSD' : 'wETH')
                            setOptions(false)
                          }}
                        >
                          {chainId === 56 ? 'BUSD' : 'wETH'}
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
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
          <div className={toAddress ? 'button ture' : 'button false'} onClick={sendNFT}>
            Send
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
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
                      pay_type={item.pay_type}
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
