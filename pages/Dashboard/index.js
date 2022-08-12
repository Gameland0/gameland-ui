import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Row, Col, Tabs, Button } from 'antd'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Modal } from '../../components/Modal'
import { Dialog } from '../../components/Dialog'
import { Nft as NftCard } from '../../components/Nft'
import { NumInput } from '../../components/NumInput'
import { toastify, ToastContainer } from '../../components/Toastify'
import { Dlist } from '../Lend'
import { ContentBox } from '../Rent'
import { MyRenting } from './MyRenting'
import { lowerCase } from 'lower-case'
import { parseEther } from '@ethersproject/units'
import { Loading } from '../../components/Loading'
import { useMetaplex } from "../../components/useMetaplex";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

const { TabPane } = Tabs
const MyTabs = styled(Tabs)`
  display: flex;
  margin-top: 14rem;
`
export const SendBox = styled.div`
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
const TabPaneBox = styled(TabPane)`
  margin-top: 100px;
  padding-top: 1rem;
  padding-bottom: 2rem;
`
const MyNftBox = styled.div`
  display: flex;
`

export const Dashboard = () => {
  const [cursor, setCursor] = useState(1)
  const [limit, setLimit] = useState(48)
  const [myNfts, setMyNfts] = useState([])
  const [currentNft, setCurrentNft] = useState([])
  const [prevDisabled, setPrevDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(true)
  const [toAddress, setToAddress] = useState('')
  const [Amount, setAmount] = useState('')
  const [visible, setVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState({})
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
  // const [minting, setMinting] = useState(false)
  const [awaiting, setAwaiting] = useState(false)
  const { metaplex } = useMetaplex();
  const getNft = async () => {
    const address = metaplex.identity().publicKey.toBase58()
    console.log('metaplex',metaplex)
    if (address === '11111111111111111111111111111111') return
    let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
    console.log(myNfts)
    if (!myNfts.length) return
    for (let index = 0; index < myNfts.length; index++) {
      await myNfts[index].metadataTask.run()
    }
    const data = []
    myNfts.map((item)=> {
      data.push(item.metadataTask.result) 
    })
    console.log(data)
    setCurrentNft(data)
  }
  useEffect(() => {
    getNft()
  }, [metaplex.identity().publicKey])


  const handleToAddressChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setToAddress(val)
  }, [])
  const handleAmount = useCallback((ele) => {
    const val = ele.currentTarget.value
    setAmount(val)
  }, [])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const handleNftClick = async (item) => {
    setVisible(true)
  }

  const handleSendNft = async (item) => {
    setShowSend(true)
    setToAddress('')
    // setCurrentItem(item)
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
      setLending(true)
    } catch (err) {
      console.log(err.message)
      toastify.error(err.message)
      setLending(false)
    }
  }
  const sendNFT = async () => {
    console.log('sendNFT')
  }
  const handleApprove = async () => {
    setApproving(true)
    setApproving(false)
  }

  return (
    <div className="DashboardBox">
      <Modal visible={visible}>
        <NftCard
          name={currentItem.metadata?.name}
          price={currentItem.price}
          days={currentItem.days}
          collateral={currentItem.collateral}
          img={currentItem.metadata?.image}
          size={500}
          nftId={currentItem.token_id}
          withdrawable={withdrawable}
          unOperate={true}
          contract_type={currentItem.contract_type}
          borrowDay={currentItem.borrowDay}
          penalty={0}
          pay_type={currentItem.pay_type}
        />
        <h3>{currentItem.metadata?.name}</h3>
        <p>
          <span className="tips">#{currentItem.token_id}</span>
        </p>
        {currentItem.sell_orders ? (
          <a
            href={``}
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
                  Sol
                  <img src="assets/icon_select.svg" className="arrowIcon" />
                </div>
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
            {lending ? <img className="loadding" src="assets/loading.svg" alt="" /> : ''}
          </div>
        </SendBox>
      </Dialog>
      <div className="tabsBox flex">
        <div className="tab-active">My NFT</div>
        <div className="myRenting">My Renting</div>
      </div>
      <MyNftBox className="flex">
        {currentNft && currentNft.length ? (
          currentNft.map((item, index) => (
            <NftCard
              key={index}
              name={item?.name}
              img={item?.image}
              nftId={item?.collection.name}
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
          ))
        ) : (
          <div className="EmptyWrap">Ooops, looks like nothing here.</div>
        )}
      </MyNftBox>
      <ToastContainer />
    </div>
  )
}

export default Dashboard