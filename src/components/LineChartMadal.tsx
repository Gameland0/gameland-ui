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
}
const SendBox = styled.div`
  .title {
    width: 100%;
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    text-align: center;
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
export const LineChartMadal: React.FC<MadalProps> = ({
  visible,
  data,
  onClick,
  children
}) => {
  return (
    <Modal footer={null} onCancel={onClick} open={visible} destroyOnClose closable={false} >
      <SendBox>
        <div className="title">Activity details</div>
          {data && data.length ? (
            data.map((item: any, index: number) => (
              <div className="spacing-5 text-center" key={index}>
                {item.timestamp.substr(0, 10)}&nbsp;&nbsp;
                <b>{item.type==='share'?'Shared posts':item.type==='post'?'Published  posts':item.type}</b>&nbsp;&nbsp;
                <a target='_blank' href={item.type==='vote'?item.actions[0].related_urls[0]:item.actions[0].related_urls[1]}>
                  {item.type==='vote'?item.actions[0].related_urls[0]:item.actions[0].related_urls[1]}
                </a>&nbsp;&nbsp;
                on&nbsp;&nbsp;
                {item.network}
              </div>
          ))
        ) : (
          <div className="text-center">No records</div>
        )}
      </SendBox>
      {children}
    </Modal>
  )
}
