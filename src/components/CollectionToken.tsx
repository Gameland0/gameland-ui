import React, { useEffect, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { lowerCase } from 'lower-case'
import { useHistory } from 'react-router-dom'
import { Row, Col, Button, Tabs } from 'antd'
import BigNumber from 'bignumber.js'
import { parseEther } from '@ethersproject/units'
import {
  BSCSCAN_KEY,
  POLYGONSCAN_KEY,
  POLYGON_CHAIN_ID_HEX,
  POLYGON_RPC_URL,
  BSC_CHAIN_ID_HEX,
  BSC_RPC_URL,
  OPENSEA_URL,
  GameTokenDetails,
  BSCAssetContractAddress,
  POLYGONAssetContractAddress
} from '../constants'
import { fetchReceipt, ChainHttp } from '../utils'
import { ABIs } from '../constants/Abis/ABIs'
import { Dialog } from './Dialog'
import { Modal } from './Modal'
import { toastify } from './Toastify'
import { SendBox } from '../pages/Dashboard'
import { Dlist } from '../pages/Lend'
import { Loading } from '../components/Loading'
import { NumInput } from '../components/NumInput'
import { Nft as NftCard } from '../components/Nft'
import { useActiveWeb3React, useControlContract, useAssetContract } from '../hooks'
import { bschttp, polygonhttp } from './Store'
import { Card, fetchAbi, getContract } from './MyPage'
import { handleClick } from './Header'
import loadding from '../assets/loading.svg'
import arrow from '../assets/icon_select.svg'
import defaultImg from '../assets/default.png'
import avatar1 from '../assets/icon_avatar_1.svg'
import avatar2 from '../assets/icon_avatar_2.png'

const TokenBox = styled.div`
  width: 100%;
  height: 440px;
  overflow-y: auto;
`
const BoxTap = styled.div`
  div {
    flex: 2;
    text-align: center;
    font-size: 20px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #35caa9;
  }
`
const TokenDetails = styled.div`
  margin-top: 16px;
  font-size: 16px;
  font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
  color: #41acef;
  .NAME {
    flex: 1;
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .gameName {
      width: 90px;
      margin-left: 10px;
      font-size: 16px;
      font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
      font-weight: bold;
      color: #333333;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .RATING {
    flex: 1;
  }
  .CHAIN {
    flex: 1;
  }
  .EARN {
    flex: 1;
    .token {
      img {
        width: 25px;
        height: 25px;
        border-radius: 50%;
      }
    }
  }
  .NFT {
    flex: 1;
  }
  .PLAYER {
    flex: 1;
    img {
      width: 40px;
      height: 40px;
    }
    .avatar2 {
      margin-left: -20px;
    }
  }
`
const NFTBox = styled.div`
  width: 100%;
  margin-top: 16px;
  padding: 16px 0;
  border-top: 1px solid #e5e5e5;
`
export const CollectionToken = (NFT: any) => {
  const { account, chainId, library } = useActiveWeb3React()
  const ControlContract = useControlContract()
  const AssetContract = useAssetContract()
  const history = useHistory()
  const [showNFTBox, setShowNFTBox] = useState(-1)
  const [currentItem, setCurrentItem] = useState({} as any)
  const [gameData, setGameData] = useState([] as any)
  const [TokenData, setTokenData] = useState([] as any)
  const [lendvisible, setlendVisible] = useState(false)
  const [awaiting, setAwaiting] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [lending, setLending] = useState(false)
  const [refreshBy, setrefreshBy] = useState(false)
  const [options, setOptions] = useState(false)
  const [approving, setApproving] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const [toAddress, setToAddress] = useState('')
  const [penalty, setPenalty] = useState('')
  const [price, setPrice] = useState('')
  const [days, setdays] = useState('')
  const [collateral, setCollateral] = useState('')
  const [currentSelection, setCurrentSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  const getGames = async () => {
    const bsc = await bschttp.get('/v0/games')
    const polygon = await polygonhttp.get('/v0/games')
    const data = [...bsc.data.data, ...polygon.data.data]
    setGameData(data)
  }
  const getGameDetails = (address: string) => {
    return gameData.filter((item: any) => {
      return item.contractAddress === address
    })
  }
  const NewNftsdata = async () => {
    try {
      const bsc = await bschttp.get(`v0/new_nfts`)
      const bscNewnfts = bsc.data.data
      const MyBscNft = NFT.NFT.filter((item: any) => {
        return item.chain === 'bsc'
      })
      const polygon = await polygonhttp.get(`v0/new_nfts`)
      const polygonNewnfts = polygon.data.data
      const MyPolygonNft = NFT.NFT.filter((item: any) => {
        return item.chain === 'polygon'
      })
      if (bscNewnfts && bscNewnfts.length) {
        const filterBscData = MyBscNft.filter((item: any) => {
          return (
            bscNewnfts.findIndex(
              (ele: any) =>
                ele.nftid === item.token_id &&
                ele.nftcollectionaddress.toLowerCase() === item.token_address.toLowerCase()
            ) < 0
          )
        })
        if (filterBscData.length) {
          filterBscData.map((item: any) => {
            const list = {
              nftcollectionaddress: item.token_address,
              nftcollectionname: item.name,
              nftid: item.token_id,
              startblock: item.block_number_minted,
              owner: item.owner_of,
              uri: item.token_uri
            }
            bschttp.post(`/v0/new_nfts`, list)
          })
        }
      } else {
        if (MyBscNft.length) {
          MyBscNft.map((item: any) => {
            const list = {
              nftcollectionaddress: item.token_address,
              nftcollectionname: item.name,
              nftid: item.token_id,
              startblock: item.block_number_minted,
              owner: item.owner_of,
              uri: item.token_uri
            }
            bschttp.post(`/v0/new_nfts`, list)
          })
        }
      }

      if (polygonNewnfts && polygonNewnfts.length) {
        const filterPolygonData = MyPolygonNft.filter((item: any) => {
          return (
            polygonNewnfts.findIndex(
              (ele: any) =>
                ele.nftid === item.token_id &&
                ele.nftcollectionaddress.toLowerCase() === item.token_address.toLowerCase()
            ) < 0
          )
        })
        if (filterPolygonData.length) {
          console.log(filterPolygonData)
          filterPolygonData.map((item: any) => {
            const list = {
              nftcollectionaddress: item.token_address,
              nftcollectionname: item.name,
              nftid: item.token_id,
              startblock: item.block_number_minted,
              owner: item.owner_of,
              uri: item.token_uri
            }
            polygonhttp.post(`/v0/new_nfts`, list)
          })
        }
      } else {
        if (MyPolygonNft.length) {
          MyPolygonNft.map((item: any) => {
            const list = {
              nftcollectionaddress: item.token_address,
              nftcollectionname: item.name,
              nftid: item.token_id,
              startblock: item.block_number_minted,
              owner: item.owner_of,
              uri: item.token_uri
            }
            polygonhttp.post(`/v0/new_nfts`, list)
          })
        }
      }
    } catch (error) {
      return
    }
  }
  const getBSCToken = async (contractaddress: any) => {
    const BSCdata = await fetch(
      `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractaddress}&address=${account}&apikey=${BSCSCAN_KEY}`,
      {
        method: 'GET',
        mode: 'cors'
      }
    )
    const BSCdataJson = await BSCdata.json()
    return BSCdataJson.result
  }
  const getPolygonToken = async (contractaddress: any) => {
    const PolygonData = await fetch(
      `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${contractaddress}&address=${account}&apikey=${POLYGONSCAN_KEY}`,
      {
        method: 'GET',
        mode: 'cors'
      }
    )
    const PolygonJosn = await PolygonData.json()
    return PolygonJosn.result * 1
  }
  const getTokenData = async () => {
    const data = GameTokenDetails.filter((item: any) => {
      return NFT.NFT.findIndex((ele: any) => ele.token_address.toLowerCase() === item.NFTaddress.toLowerCase()) >= 0
    })
    data.map((item: any) => {
      const token: any = []
      if (item.chain === 'bsc') {
        item.tokenAddress.map(async (ele: any) => {
          const data = await getBSCToken(ele)
          token.push(data)
        })
      } else {
        if (item.tokenAddress.length === 0) {
          token.push(0)
        } else {
          item.tokenAddress.map(async (ele: any) => {
            const data = await getPolygonToken(ele)
            token.push(data)
          })
        }
      }
      item.token = token
    })
    setTokenData(data)
  }
  const filterNft = (address: string) => {
    return NFT.NFT.filter((item: any) => {
      return item.token_address === address
    })
  }
  const showBSCNFTBox = (index: number, address: string) => {
    if (filterNft(address).length > 0) {
      if (showNFTBox === index) {
        setShowNFTBox(-1)
      } else {
        setShowNFTBox(index)
      }
    }
  }
  const lendNftClick = async (item: any) => {
    let AssetContractAddress
    if (item.chain === 'bsc') {
      AssetContractAddress = BSCAssetContractAddress
      if (chainId === 56) {
        setlendVisible(true)
      } else {
        handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)
      }
    } else if (item.chain === 'polygon') {
      AssetContractAddress = POLYGONAssetContractAddress
      if (chainId === 137) {
        setlendVisible(true)
      } else {
        handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)
      }
    }
    setAwaiting(true)
    if (item.sell_orders) return
    const contractAddress = item.token_address ?? ''

    const localAbi = localStorage.getItem(contractAddress.toLowerCase())
    let storedAbi: any
    for (const [key, value] of Object.entries(ABIs)) {
      if (key.toLowerCase() === contractAddress.toLowerCase()) {
        storedAbi = value
      }
    }
    const chain = item.chain
    const ABI =
      storedAbi && storedAbi.length ? storedAbi : localAbi ? localAbi : await fetchAbi(contractAddress, chain + 'scan')
    const nftContract = getContract(library, contractAddress, ABI)
    item.contract = nftContract
    setCurrentItem(item)
    if (nftContract !== null) {
      try {
        // check ERC721 approve
        if (item.contract_type === 'ERC721' && nftContract?.getApproved) {
          const approveAddress = await nftContract?.getApproved(item.token_id)
          if (lowerCase(approveAddress) === lowerCase(AssetContractAddress as string)) {
            // console.log(true)
            setIsApproved(true)
          } else {
            setIsApproved(false)
            // console.log(false)
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
  const handleApprove = async () => {
    setApproving(true)
    if (currentItem.contract) {
      try {
        let approvetx
        let AssetContractAddress
        if (currentItem.chain === 'bsc') {
          AssetContractAddress = BSCAssetContractAddress
        } else if (currentItem.chain === 'polygon') {
          AssetContractAddress = POLYGONAssetContractAddress
        }
        if (currentItem.contract_type === 'ERC721' && currentItem.contract?.approve) {
          approvetx = await currentItem.contract.approve(AssetContractAddress, currentItem.token_id)
        } else {
          approvetx = await currentItem.contract.setApprovalForAll(AssetContractAddress, true)
        }
        // console.log(approvetx)
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
      const res: any = await ChainHttp(chainId)?.post(`/v0/opensea/`, params)
      setLending(false)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setPrice('')
        setCollateral('')
        setdays('')
        setlendVisible(false)
        setrefreshBy(!refreshBy)
        toastify.success('succeed')
      } else {
        throw res.message || res.data.message
      }
    } catch (err: any) {
      toastify.error(err.message)
      setLending(false)
    }
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
        setrefreshBy(!refreshBy)
        toastify.success('succeed')
      } catch (err: any) {
        toastify.error(err.message)
        setLending(false)
      }
    }
  }
  const toRelationChart = (item: any) => {
    // if (chain !== 'bsc') return
    const contractName = getGameDetails(item.NFTaddress)[0]?.contractName
    history.push({
      pathname: `/RelationChart/${contractName.replace(/ /g, '')}`,
      state: {
        contractAddress: item.NFTaddress,
        useraddress: NFT.user,
        chain: item.chain
      }
    })
  }
  const handleToAddressChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setToAddress(val)
  }, [])
  const handlePriceChange = useCallback((val) => setPrice(val), [])
  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleCollateralChange = useCallback((val) => setCollateral(val), [])
  const handlePenaltyChange = useCallback((val) => setPenalty(val), [])
  useEffect(() => {
    getGames()
    getTokenData()
    NewNftsdata()
  }, [account])
  return (
    <TokenBox>
      <Dialog footer={null} onCancel={() => setShowSend(false)} open={showSend} destroyOnClose closable={false}>
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
      <Modal destroyOnClose footer={null} onCancel={() => setlendVisible(false)} open={lendvisible} closable={false}>
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
              withdrawable={false}
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
      <BoxTap className="flex">
        <div>NAME</div>
        <div>RATING</div>
        <div>CHAIN</div>
        <div>EARN</div>
        <div>NFT</div>
        <div>PLAYER</div>
      </BoxTap>
      {TokenData.length && TokenData
        ? TokenData.map((item: any, index: any) => (
            <div key={index}>
              <TokenDetails className="flex flex-v-center cursor">
                <div className="NAME flex flex-v-center">
                  <img src={getGameDetails(item.NFTaddress)[0]?.image} />
                  <div className="gameName">{getGameDetails(item.NFTaddress)[0]?.contractName}</div>
                </div>
                <div className="RATING text-center">{getGameDetails(item.NFTaddress)[0]?.starRating}</div>
                <div className="CHAIN text-center">{getGameDetails(item.NFTaddress)[0]?.chain}</div>
                <div className="EARN text-center">
                  {item.symbol.length && item.symbol ? (
                    item.symbol.map((ele: any, i: any) => (
                      <div className="token" key={i}>
                        {0 || item.token[i]} <img src={ele} />
                      </div>
                    ))
                  ) : (
                    <div className="token">
                      {item.token[0]} <img src={defaultImg} />
                    </div>
                  )}
                </div>
                <div className="NFT text-center" onClick={() => showBSCNFTBox(index, item.NFTaddress)}>
                  {filterNft(item.NFTaddress).length}
                </div>
                <div className="PLAYER flex flex-justify-content" onClick={() => toRelationChart(item)}>
                  <img src={avatar1} />
                  <img className="avatar2" src={avatar2} />
                  ...
                </div>
              </TokenDetails>
              {showNFTBox === index ? (
                <NFTBox className="flex wrap">
                  {filterNft(item.NFTaddress).length && filterNft(item.NFTaddress)
                    ? filterNft(item.NFTaddress).map((item: any, index: any) => (
                        <Card
                          key={index}
                          nftId={item.token_id}
                          onLend={() => lendNftClick(item)}
                          onSend={() => handleSendNft(item)}
                          name={item.metadata?.name}
                          img={item.metadata?.image}
                          contract_type={item.contract_type ? item.contract_type : item.standard}
                          pay_type={item.pay_type}
                          account={account}
                          useraddress={NFT.user}
                        />
                      ))
                    : ''}
                </NFTBox>
              ) : (
                ''
              )}
            </div>
          ))
        : ''}
    </TokenBox>
  )
}
