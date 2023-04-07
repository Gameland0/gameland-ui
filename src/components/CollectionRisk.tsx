import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import correct from '../assets/icon_correct.svg'
import warn from '../assets/icon_warn.svg'
import { Img } from './Img'

const RiskBox = styled.div`
  .title {
    color: #000;
    font-size: 21px;
    font-weight: 700;
  }
  .contractRisk {
    img {
      width: 44px;
      height: 44px;
    }
    .Security {
      width: 46%;
    }
    .Honeypot {
      width: 46%;
    }
  }
`

export const CollectionRisk = (data: any) => {
  console.log(data)
  return (
    <RiskBox>
      {/* <div className="contractInfo">
        <div className="title">Basic Info</div>
        <div className="Name">
          <div>Name</div>
          <div></div>
        </div>
      </div> */}
      <div className="contractRisk flex">
        <div className="Security">
          <div className="title">Contract Security</div>
          <div>
            {data.data.is_open_source === '1'
              ? <img src={correct} alt="" />
              : data.data.is_open_source === '0'
              ? <img src={warn} alt="" />
              : ''}
            {data.data.is_open_source === '1'
              ? 'Contract source code verified'
              : data.data.is_open_source === '0'
              ? 'No contract source code verified'
              : ''}
          </div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="Honeypot">
          <div className="title">Honeypot Risk</div>
        </div>
      </div>
    </RiskBox>
  )
}