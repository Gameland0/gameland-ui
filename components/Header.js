import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const Header = () => {
  const [checked, setchecked] = useState('Rent')
  return (
    <div className="HeaderBox flex flex-h-between flex-v-center">
      <img className="logo" src="assets/logo.svg" />
      <div className="flex flex-h-between hidden">
        <div className={checked === 'Rent'? 'linkItem checked' : 'linkItem'}>
          <Link href="/"><span onClick={()=> setchecked('Rent')}>Rent</span></Link>
        </div>
        <div className={checked === 'Lend'? 'linkItem checked' : 'linkItem'}>
          <Link href="/Lend"><span onClick={()=> setchecked('Lend')}>Lend</span></Link>
        </div>
        <div className={checked === 'Dashboard'? 'linkItem checked' : 'linkItem'}>
          <Link href="/Dashboard"><span onClick={()=> setchecked('Dashboard')}>Dashboard</span></Link>
        </div>
        {/* <div className="linkItem">
          <Link href="/Games"><span>Games</span></Link>
        </div> */}
      </div>
      <div className="flex flex-h-between flex-v-center">
        <WalletMultiButton />
      </div>
    </div>
  )
}
