import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import scoreStar from '../assets/icon_score_star.svg'

export interface BaseProps {
  data: any
}

const ScoreStatisticsBox = styled.div`
  div {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 3px 0;
    img {
      margin-right: 10px;
    }
    .progressBar {
      background: #e5e5e5;
      border-radius: 9px;
    }
  }
  @media screen and (min-width: 1440px) {
    width: 320px;
    height: 140px;
    div {
      img {
        width: 14px;
        height: 14px;
      }
      .progressBar {
        width: 200px;
        height: 14px;
      }
    }
  }
  @media screen and (min-width: 1920px) {
    width: 380px;
    height: 160px;
    div {
      img {
        width: 18px;
        height: 18px;
      }
      .progressBar {
        width: 240px;
        height: 18px;
      }
    }
  }
`
const Schedule = styled.div<{ total: any; quantity: any }>`
  width: ${({ total, quantity }) => (quantity * 100) / total}%;
  height: 18px;
  background: #41acef;
  border-radius: 9px;
  @media screen and (min-width: 1440px) {
    height: 14px;
  }
`
export const ScoreStatistics: React.FC<BaseProps> = ({ data }) => {
  return (
    <ScoreStatisticsBox>
      <div className="five">
        <img src={scoreStar} />
        <img src={scoreStar} />
        <img src={scoreStar} />
        <img src={scoreStar} />
        <img src={scoreStar} />
        <div className="progressBar">
          <Schedule total={data.total} quantity={data.fiveStar}></Schedule>
        </div>
      </div>
      <div className="four">
        <img src={scoreStar} />
        <img src={scoreStar} />
        <img src={scoreStar} />
        <img src={scoreStar} />
        <div className="progressBar">
          <Schedule total={data.total} quantity={data.fourStar}></Schedule>
        </div>
      </div>
      <div className="three">
        <img src={scoreStar} />
        <img src={scoreStar} />
        <img src={scoreStar} />
        <div className="progressBar">
          <Schedule total={data.total} quantity={data.threeStar}></Schedule>
        </div>
      </div>
      <div className="two">
        <img src={scoreStar} />
        <img src={scoreStar} />
        <div className="progressBar">
          <Schedule total={data.total} quantity={data.twoStar}></Schedule>
        </div>
      </div>
      <div className="one">
        <img src={scoreStar} />
        <div className="progressBar">
          <Schedule total={data.total} quantity={data.oneStar}></Schedule>
        </div>
      </div>
    </ScoreStatisticsBox>
  )
}
