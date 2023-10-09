import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const MarketBox = styled.div`
  width: 100%;
  padding-top: 48px;
  .filterMenu {
    margin-bottom: 32px;
    .item {
      min-width: 90px;
      position: relative;
      height: 35px;
      color: #000;
      font-size: 24px;
      margin-right: 48px;
      div {
        position: absolute;
        bottom: 0;
        width: 90px;
        height: 16px;
        border-radius: 10px;
      }
      span {
        position: absolute;
        top: -6px;
        right: 0px;
        display: block;
        width: 14px;
        height: 14px;
        border-radius: 7px;
        background: #41acef;
      }
      .disabled {
        background: rgba(13, 12, 34, 0.05);
      }
      .select {
        background: rgba(65, 172, 239, 0.2);
      }
    }
  }
`
export const Market = () => {

  return (
    <MarketBox>
      <div className="container filterMenu flex flex-justify-content">
        <div className="item flex flex-justify-content not-allowed">
          <div className="disabled"></div>
          Dataset
        </div>
        <div className="item flex flex-justify-content not-allowed">
          <div className="disabled"></div>
          Models
        </div>
      </div>
    </MarketBox>
  )
}
