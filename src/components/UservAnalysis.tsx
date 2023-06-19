import React, { useEffect, useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { hashMessage } from 'ethers/lib/utils'
import * as echarts from 'echarts'
import { bschttp, http, polygonhttp } from './Store'

const AnalysisBox = styled.div``
const Analysis = styled.div``

export const UservAnalysis = (data: any) => {
  const [PieChartData, setPieChartData] = useState([] as any)

  const getPieChartData = () => {
    http
      .get(
        `https://api.rss3.io/v1/notes/${data}?limit=500&include_poap=false&count_only=false&query_status=false`
      )
      .then((vals) => {
        setPieChartData(vals.data.result)
      })
  }

  return (
    <AnalysisBox>
      {PieChartData.length ? (
        <Analysis>
          <div></div> 
        </Analysis>
      ):''}
    </AnalysisBox>
  )
}