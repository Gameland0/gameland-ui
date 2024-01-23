import React, { useEffect } from 'react'
import styled from 'styled-components'

const Mask = styled.div`
  width: 100%;
  height: 600px;
  font-size: 17px;
  .title {
    font-size: 36px;
    margin-top: 80px;
  }
  a {
    color: blue;
  }
`

export const WhiteList = () => {
  return (
    <Mask className="container">
      <div className="title text-center">Join Whitelist</div>
      <div className="text-center">
        Be the first to try our products when we go live. Please Click the link to Join whitelist
        &nbsp;<a href="https://forms.gle/SX16ePecNXC3M3kk9" target="_blank">https://forms.gle/SX16ePecNXC3M3kk9</a>
      </div>
    </Mask>
  )
}