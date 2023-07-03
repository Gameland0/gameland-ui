import styled from 'styled-components'
import React from 'react'
import { Modal } from '../components/Modal'
import { Row, Col } from 'antd'
import { Img } from './Img'
import { formatAddress, formatting, ZeroAddress } from '../utils'

interface MadalProps {
  children?: React.ReactNode
  onClick?: () => void
  visible: boolean
  data: any
  description: any
  SpecificAttribute: any
  RareAttribute: any
}
const ImgBox = styled.div`
  img {
    width: 91%;
    height: 91%;
    border-radius: 20px 20px 20px 20px;
  }
`
const Title = styled.h1`
  line-height: 1.5rem;
`
const RentDlist = styled.div`
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 24px;
  border-radius: 20px 20px 20px 20px;
  border: 1px solid #e5e5e5;
  padding: 1rem 2rem;
  @media screen and (min-width: 1440px) {
    height: 44%;
  }
  @media screen and (min-width: 1920px) {
    margin-top: 32px;
    height: 280px;
  }
  div {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
  }
`
const SpanLabel = styled.span`
  display: inline-block;
  width: 5rem;
  font-weight: bold;
  color: #333333;
`
const Description = styled.div`
  width: 100%;
  height: 16.43rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  padding: 0 96px;
  margin-top: 2rem;
  .describe {
    max-height: 113px;
    font-size: 18px;
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
  width: 100%;
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
    justify-content: center;
    div {
      width: 11rem;
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
  width: 100%;
  min-height: 14rem;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 20px 20px 20px 20px;
  position: relative;
  margin-top: 4rem;
  padding-bottom: 24px;

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
        color: #333333;
      }
    }
  }
`
export const NFTStatsMadal: React.FC<MadalProps> = ({
  visible,
  data,
  description,
  SpecificAttribute,
  RareAttribute,
  children
}) => {
  return (
    <Modal footer={null} onCancel={() => ''} open={visible} destroyOnClose closable={false}>
      <Row gutter={[24, 24]}>
        <Col span="12" xl={12} sm={24}>
          <ImgBox>
            <Img src={data.imageUrl} alt="" />
          </ImgBox>
        </Col>
        <Col span="12" xl={12} sm={24}>
          <Title>{data.name}</Title>
          <RentDlist className="flex">
            <div>
              <SpanLabel>Contract Address</SpanLabel>
              <span>{formatAddress(data.contractAddress || ZeroAddress, 4)}</span>
            </div>
            <div>
              <SpanLabel>Token ID</SpanLabel>
              <span>{data.tokenId?.length > 10 ? formatting(data.tokenId) : data.tokenId}</span>
            </div>
            <div>
              <SpanLabel>Standard</SpanLabel>
              <span>{data.tokenType}</span>
            </div>
            <div>
              <SpanLabel>chain</SpanLabel>
              <span className="blue">
                <span className="bigSize">{data.chain}</span>
              </span>
            </div>
          </RentDlist>
          <br />
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
                  <b>
                    <span>{item.trait_type || item.key}</span>
                  </b>
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
      {children}
    </Modal>
  )
}
