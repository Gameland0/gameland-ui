import React, { useMemo } from 'react'
import ChainId from '../utils/chainIdInfo'
import { toast, ToastContainer } from 'react-toastify'
import { Button } from 'antd'
import styled from 'styled-components'
import { useActiveWeb3React } from '../hooks'

const ChainNameBox = styled.div`
  margin-right: 1rem;
`

export const ChainName = () => {
  const { chainId } = useActiveWeb3React()
  const chainName = useMemo(() => Object.keys(ChainId).find((k) => (chainId as number) === ChainId[k]), [chainId])

  if (!chainName) {
    const notify = () => toast('please switch to supported network!')
    return (
      <ChainNameBox>
        <Button size="large" type="primary" danger ghost onClick={notify}>
          Wrong Network
        </Button>
        <ToastContainer theme="dark" />
      </ChainNameBox>
    )
  }
  return <ChainNameBox>{chainName}</ChainNameBox>
}
