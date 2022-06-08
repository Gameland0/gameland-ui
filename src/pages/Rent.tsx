// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useCallback, useMemo, useState } from 'react'

// import { useGreeterContract } from '../hooks'
import { Row, Col } from 'antd'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { Dialog } from '../components/Dialog'
import BigNumber from 'bignumber.js'
import { useActiveWeb3React, useGameLandContract, useStore } from '../hooks'
import { toastify } from '../components/Toastify'
// import { parseEther } from '@ethersproject/units'
import { useLendingNfts } from '../hooks/useLendingNfts'
import { Nft as NftCard, NftProps } from '../components/Nft'
import { NumInput } from '../components/DaysInput'
// import { NftView } from '../components/NftView'
import { Tag, Spin } from 'antd'
import { Loading3QuartersOutlined } from '@ant-design/icons'
import { RentCard } from '../components/RentCard'
import { isEmpty } from 'lodash'
import { fetchReceipt, formatAddress, ZeroAddress } from '../utils'
import { http2, http } from '../components/Store'
import { Icon } from '../components/Icon'
import { BaseProps } from '../components/NumInput'
import { parseEther } from '@ethersproject/units'
import { lowerCase } from 'lower-case'
import { Empty } from '../components/Empty'

export const RentBox = styled.div`
  margin: 3rem 0;
`
export const DayInfoBox = styled.div<{ progress?: number }>`
  width: 35.1rem;
  margin-top: 1rem;
  height: 5rem;
  line-height: 5rem;
  border-radius: 1rem;
  border-radius: 20px 20px 20px 20px;
  border: 2px solid #35caa9;
  margin: 70px 0 0 20px;
  background: white;
  font-size: 0.875rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:before {
    position: absolute;
    display: block;
    content: '';
    width: ${({ progress }) => (progress ? progress + 'rem' : 'auto')};
    height: 100%;
    background: var(--in-progress);
    z-index: 1;
  }
  span {
    z-index: 2;
    position: relative;
    font-size: 24px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #35caa9;
  }
`
const FakeButtonBox = styled.button<{ theme?: string; block?: boolean }>`
  display: block;
  height: 5rem;
  cursor: pointer;
  border-radius: 1.25rem;
  padding: 0 1rem;
  line-height: 2.5rem;
  font-size: 0.875rem;
  width: 35.1rem;
  color: #fff;
  background: #35caa9;
  margin-left: 20px;
  border: ${({ theme }) => (theme === 'ghost' ? `1px solid var(--second-color)` : '1px solid transparent')};

  &:hover {
    background: ${({ theme }) => (theme === 'ghost' ? 'transparent' : 'var(--second-light-color)')};
    color: ${({ theme }) => (theme === 'ghost' ? 'var(--second-light-color)' : 'white')};
    border: ${({ theme }) => (theme === 'ghost' ? `1px solid var(--second-light-color)` : '1px solid transparent')};
  }
  &[disabled],
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

interface FakeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {
  theme?: 'fill' | 'ghost'
  loading?: boolean
  block?: boolean
  disabled?: boolean
}
const antIcon = <Loading3QuartersOutlined style={{ fontSize: 16, color: 'white' }} spin />

export const FakeButton: React.FC<FakeButtonProps> = ({ theme, children, loading, block, ...props }) => {
  return (
    <FakeButtonBox block={block} theme={theme} {...props}>
      {loading ? <Spin indicator={antIcon} /> : children}
    </FakeButtonBox>
  )
}
interface OperateProps {
  isLending?: boolean
  onClick?: () => void
}
const Operate: React.FC<OperateProps> = ({ isLending }) => {
  return <>{isLending ? <FakeButton theme="ghost">Rent</FakeButton> : null}</>
}
interface DaysInfoProps extends BaseProps {
  progress?: number
}
export const DaysInfo: React.FC<DaysInfoProps> = ({ progress, children }) => {
  return (
    <DayInfoBox progress={progress}>
      <span>{children}</span>
    </DayInfoBox>
  )
}
const Dlist = styled.div`
  width: 562px;
  height: 290px;
  flex-direction: column;
  justify-content: space-around;
  margin-top: 32px;
  margin-left: 20px;
  border-radius: 20px 20px 20px 20px;
  border: 1px solid #e5e5e5;
  padding: 24px 40px;
  div {
    display: flex;
    margin-bottom: 0.5rem;
    justify-content: space-between;
    font-size: 16px;
  }
`
const ImgBox = styled.div`
  img {
    width: 600px;
    height: 600px;
    border-radius: 20px 20px 20px 20px;
  }
`
const Title = styled.h1`
  margin-left: 20px;
  line-height: 1.5rem;
`
const Tips = styled.div`
  height: 2rem;
  text-align: right;
  font-size: 16px;
  font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
  font-weight: 400;
  color: #d0d0d0;
  position: absolute;
  top: 23rem;
  right: 20px;
`

export const SpanLabel = styled.span`
  display: inline-block;
  width: 5rem;
  font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
  font-weight: bold;
  color: #333333;
`
const Description = styled.div`
  width: 75rem;
  height: 16.43rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  padding: 0 96px;
  margin-top: 2rem;
  .describe {
    max-height: 113px;
    font-size: 24px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    font-weight: 400;
    color: #333333;
    margin-top: 128px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`
const Properties = styled.div`
  width: 75rem;
  min-height: 28rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  margin-top: 4rem;
  position: relative;
  .rare {
    display: flex;
    flex-wrap: wrap;
    padding: 0 66px;
    margin-top: 9rem;
    div {
      width: 210px;
      height: 110px;
      margin: 28px;
      background: linear-gradient(180deg, #f4f9fb 0%, #f4f9fb 100%);
      border-radius: 10px 10px 10px 10px;
      display: flex;
      flex-direction: column;
      text-align: center;
      span {
        margin-top: 1.5rem;
      }
      b {
        margin-top: 1rem;
      }
    }
  }
`

const StatsBox = styled.div`
  width: 75rem;
  min-height: 14rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  margin-top: 4rem;

  .attribute {
    width: 100%;
    margin-top: 8rem;
    div {
      width: 100%;
      height: 4rem;
      padding: 0 6rem;
      display: flex;
      justify-content: space-between;
      line-height: 4rem;
      span {
        font-size: 18px;
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        font-weight: 400;
        color: #333333;
      }
    }
  }
`
const Details = styled.div`
  width: 75rem;
  min-height: 12rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  margin-top: 4rem;

  .attribute {
    width: 100%;
    margin-top: 8rem;
    div {
      width: 100%;
      height: 4rem;
      padding: 0 6rem;
      display: flex;
      justify-content: space-between;
      line-height: 4rem;
      span {
        font-size: 18px;
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        font-weight: 400;
        color: #333333;
      }
    }
  }
`

export const Rent = () => {
  const { library, account } = useActiveWeb3React()
  const [currentItem, setCurrentItem] = useState({} as NftProps)
  const [visible, setVisible] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const [days, setdays] = useState('')
  const [description, setDescription] = useState('')
  const [RareAttribute, setRareAttribute] = useState([] as any)
  const [SpecificAttribute, setSpecificAttribute] = useState([] as any)
  const lendingNfts = useLendingNfts()
  const { mutateDebts } = useStore()
  const gamelandContract = useGameLandContract()
  const [renting, setRenting] = useState(false)
  useEffect(() => console.log(lendingNfts), [lendingNfts])
  const total = useMemo(() => {
    if (isEmpty(currentItem)) {
      return 0
    }
    const collateral = currentItem.collateral as number
    const _cost = new BigNumber(currentItem.price as number).times(currentItem.days as number)
    return _cost.plus(collateral).toString()
  }, [currentItem])
  // const greeter = useGreeterContract()

  // useEffect(() => {
  //   console.log(greeter?.setGreeting('hll'))
  // }, [greeter])
  const handleDaysChange = useCallback((val) => setdays(val), [])
  const handleShowModal = async (item: NftProps) => {
    if (!gamelandContract) {
      toastify.error('Contract not found, please connect wallet.')
      return
    }
    setCurrentItem(item)
    setVisible(true)
    http.defaults.headers.common['Authorization'] = '40966ceb-b776-42fa-8236-620bf99bd1ef'
    const nftAttributeData = await http.get(
      `https://api.nftport.xyz/v0/nfts/${item.contractAddress}/${item.nftId}?chain=polygon`
    )
    // console.log(nftAttributeData.data.nft.metadata)
    setDescription(nftAttributeData.data.nft.metadata.description)
    const RareAttribute: any[] = []
    const SpecificAttribute: any[] = []
    nftAttributeData.data.nft.metadata.attributes.map((item: any) => {
      if (item.display_type) {
        RareAttribute.push(item)
      } else {
        SpecificAttribute.push(item)
      }
    })
    setRareAttribute(RareAttribute)
    setSpecificAttribute(SpecificAttribute)
    if (await gamelandContract.borrow_or_not(item.gamelandNftId)) {
      const borrowInfo = await gamelandContract.borrow_status(item.gamelandNftId)

      const params = {
        isBorrowed: true,
        borrower: borrowInfo[0],
        borrowAt: borrowInfo[1]
      }
      await http2.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)
    }
  }
  const handleShowPrompt = () => {
    setPrompt(true)
  }
  const handleRent = async () => {
    try {
      if (!library) {
        toastify.error('Please connect a account.')
        return
      }
      if (!gamelandContract) {
        toastify.error('Contract not found.')
        return
      }
      const borrowed = await gamelandContract?.borrow_or_not(currentItem.gamelandNftId)
      let borrower: undefined | string = undefined
      if (!borrowed) {
        setRenting(true)

        const collateral = new BigNumber(currentItem.collateral as unknown as string)
        const days = new BigNumber(currentItem.days as unknown as string)
        const price = new BigNumber(currentItem.price as unknown as string)
        const cost = days.times(price)
        const amount = collateral.plus(cost).toString()
        console.log(parseEther(amount))

        const rented = await gamelandContract
          ?.connect(library.getSigner())
          .rent(currentItem.nftId, currentItem.contractAddress, currentItem.gamelandNftId, currentItem.id, {
            value: parseEther(amount)
          })
        console.log(rented)
        const receipt = await fetchReceipt(rented.hash, library)
        const { status } = receipt
        if (!status) {
          throw Error('Failed to rent.')
        }
      } else {
        const borrowInfo = await gamelandContract.borrow_status(currentItem.gamelandNftId)
        borrower = borrowInfo[0]
        toastify.warning('This NFT has been borrowed by someone else!')
      }
      const params = {
        isBorrowed: true,
        borrower: borrower || account,
        borrowAt: new Date().toJSON()
      }
      const res: any = await http2.put(`/v0/opensea/${currentItem.gamelandNftId}`, params)

      if (res.data.code === 1) {
        setRenting(false)
        toastify.success('succeed')
        mutateDebts(undefined, true)
        setVisible(false)
      } else {
        throw res.message || res.data.message
      }
    } catch (err: any) {
      console.log(err.message)
      toastify.error(err.data ? err.data.message : err.message)
      setRenting(false)
    }
  }

  return (
    <div className="container">
      <RentBox>
        <Modal footer={null} onCancel={() => setVisible(false)} visible={visible} destroyOnClose closable={false}>
          <Row gutter={[24, 24]}>
            <Col span="12" xl={12} sm={24}>
              <ImgBox>
                <img src={currentItem.metadata?.image} alt="" />
              </ImgBox>
            </Col>
            <Col span="12" xl={12} sm={24}>
              <Title>{currentItem.metadata?.name}</Title>
              <Dlist className="flex">
                <div>
                  <SpanLabel>Owner</SpanLabel>
                  <span title={currentItem.originOwner}>
                    {formatAddress(currentItem.originOwner || ZeroAddress, 4)}
                  </span>
                </div>
                <div>
                  <SpanLabel>Collateral</SpanLabel>
                  <span>
                    {currentItem.collateral} <Icon />
                  </span>
                </div>
                <div>
                  <SpanLabel>price</SpanLabel>
                  <span className="blue">
                    <span className="bigSize">{currentItem.price}</span>
                    <Icon /> / day
                  </span>
                </div>
                <div>
                  <SpanLabel>days</SpanLabel>
                  <span>{currentItem.days}</span>
                </div>
                <div>
                  <SpanLabel>Total</SpanLabel>
                  <span className="blue bigSize">
                    {total} <Icon />
                  </span>
                </div>
              </Dlist>
              <Tips>Available time for renting is for 1-{currentItem.days} days.</Tips>
              <div className="daysInput">
                {/* <DaysInfo>Rent for {currentItem.days} days</DaysInfo> */}
                <NumInput validInt onChange={handleDaysChange} value={days} />
              </div>
              <br />
              <FakeButton
                onClick={handleShowPrompt}
                loading={renting}
                block
                disabled={lowerCase(String(account)) === lowerCase(String(currentItem.originOwner)) || renting}
              >
                Rent
              </FakeButton>
              <br />
              <p className=" text-center">
                <span className="tips">
                  {lowerCase(String(account)) === lowerCase(String(currentItem.originOwner))
                    ? 'Unable to rent your own NFT'
                    : undefined}
                </span>
              </p>
            </Col>
          </Row>
          <Row>
            <Description>
              <h2 className="h2">Description</h2>
              <div className="border"></div>
              <div className="describe">{description}</div>
            </Description>
          </Row>
          <Row>
            {SpecificAttribute.length ? (
              <Properties>
                <h2 className="h2">Properties</h2>
                <hr className="border" />
                <div className="rare">
                  {SpecificAttribute.map((item: any, index: any) => (
                    <div key={index} className={(index + 1) % 2 == 0 ? '' : 'bg'}>
                      <span>{item.trait_type}</span>
                      <b>{item.value}</b>
                    </div>
                  ))}
                </div>
              </Properties>
            ) : (
              ''
            )}
          </Row>
          <Row>
            {RareAttribute.length ? (
              <StatsBox>
                <h2 className="h2">Stats</h2>
                <hr className="border" />
                <div className="attribute">
                  {RareAttribute.map((item: any, index: any) => (
                    <div key={index} className={(index + 1) % 2 == 0 ? '' : 'bg'}>
                      <span>{item.trait_type}</span>
                      <p>
                        <span>{item.value}</span>
                        {item.max_value ? <span> of {item.max_value}</span> : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </StatsBox>
            ) : (
              ''
            )}
          </Row>
          <Row>
            <Details>
              <h2 className="h2">Details</h2>
              <hr className="border" />
              <div className="attribute">
                <div className="bg">
                  <span>Contract Address</span>
                  <span> {formatAddress(currentItem.contractAddress || ZeroAddress, 4)}</span>
                </div>
                <div>
                  <span>Token ID</span>
                  <span> {currentItem.nftId}</span>
                </div>
                <div className="bg">
                  <span>Token Standard</span>
                  <span> {currentItem.standard}</span>
                </div>
                <div>
                  <span>Blockchain</span>
                  <span>Polygon</span>
                </div>
              </div>
            </Details>
          </Row>
        </Modal>
        <Dialog onCancel={() => setPrompt(false)} visible={prompt} destroyOnClose onOk={handleRent} closable={false}>
          <p>
            If the lease is not returned for more than 8 hours after the expiry of the lease time, the liquidated damage
            will be deducted, and the security deposit of {currentItem.price} will be deducted for each overtime day
            after that.
          </p>
        </Dialog>
        <Row gutter={[20, 20]}>
          {lendingNfts.length ? (
            lendingNfts.map((item, index) => (
              <Col key={index} span="6" xl={6} md={8} sm={12} xs={24}>
                <RentCard
                  nftId={item.nftId}
                  onClick={() => handleShowModal(item)}
                  name={item.metadata?.name}
                  days={item.days}
                  collateral={item.collateral}
                  price={item.price}
                  img={item.metadata?.image}
                  isLending={item.isLending}
                  contract_type={item.standard}
                />
              </Col>
            ))
          ) : (
            <Empty text="Ooops, looks like nothing here." />
          )}
        </Row>
      </RentBox>
    </div>
  )
}
