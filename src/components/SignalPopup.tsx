import React, { useEffect } from 'react'
import { useActiveWeb3React, useStore } from '../hooks'
import { toastify } from './Toastify'

export const SignalPopup = () => {
  // const { lastBlockNumber, transaction } = useStore()
  // const { library } = useActiveWeb3React()

  // useEffect(() => {
  //   if (!lastBlockNumber) return
  //   if (!library) {
  //     toastify.error('Please connect an account')
  //     return
  //   }
  //   library.getTransactionReceipt()
  // }, [lastBlockNumber, transaction])

  return <div></div>
}
