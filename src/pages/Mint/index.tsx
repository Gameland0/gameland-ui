import React from 'react'
import { Button } from 'antd'
import { toastify } from '../../components/Toastify'
import { useActiveWeb3React, useMyNftContract } from '../../hooks'
import { http } from '../../components/Store'
import { Redirect } from 'react-router'

export const Mint = () => {
  const nftContract = useMyNftContract()

  const { account } = useActiveWeb3React()

  const nfts = ['Eagle', 'Wizards', 'Animal', 'Devil', 'Woof', 'Alien', 'Fox']

  const handleMint = async () => {
    try {
      const id = new Date().valueOf()
      const _mint = await nftContract?.mint(account, id)
      await _mint.wait()
      console.log(id)

      const num = Math.floor(Math.random() * 7)
      const params = {
        nftId: id,
        name: nfts[num],
        img: 'img',
        isLending: false,
        isBorrowed: false,
        owner: account,
        originOwner: account
      }
      const res: any = await http.post('/api/nft', params)
      console.log(res)

      if (res.data.code === 1) {
        console.log(res)
        toastify.success(res.data.message)
        return <Redirect to="/dashboard" />
      }
    } catch (err: any) {
      console.log(err)
      toastify.error(err.message)
    }
  }
  return (
    <div className="text-center m-10">
      <Button onClick={handleMint}>Mint Test NFT</Button>
    </div>
  )
}
