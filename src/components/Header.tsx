import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { AccountBar } from './AccountBar'
import { ReactComponent as Logo } from '../assets/logo_BSC.svg'
import PolygonImg from '../assets/polygon.svg'
import BSCImg from '../assets/binance.svg'
import { Grid, Drawer } from 'antd'
import { UnorderedListOutlined } from '@ant-design/icons'
import { useActiveWeb3React } from '../hooks'
import { POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL, BSC_CHAIN_ID_HEX, BSC_RPC_URL } from '../constants'
const { useBreakpoint } = Grid

const HeaderBox = styled.div`
  position: sticky;
  top: 0;
  height: 100px;
  background: #fff;
  box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--primary-color);
  z-index: 99;

  .logo svg {
    max-width: 15rem;
  }
  .chain {
    height: 60px;
    margin-top: 20px;
    .jumpButton {
      position: relative;
      display: flex;
      padding: 8px 16px 0 8px;
      width: 142px;
      height: 40px;
      border: none;
      color: #666;
      border-radius: 25px;
      background: #f4f7f9;
      cursor: pointer;
      img {
        width: 24px;
        height: 24px;
      }
      .chainName {
        color: #2b2f33;
        font-size: 16px;
        font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
        font-weight: 700;
        margin: -2px 0 0 6px;
      }
      .menu {
        width: 180px;
        background-clip: padding-box;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);
        position: absolute;
        top: 50px;
        left: 0px;
        display: none;
        div {
          display: flex;
          height: 40px;
          padding: 8px 16px 0 8px;
          color: #2b2f33;
          font-size: 16px;
          font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
          font-weight: 700;
          img {
            margin-right: 10px;
          }
          &:hover {
            background-color: #f4f7f9;
          }
        }
      }
    }
    &:hover {
      .menu {
        display: block;
      }
    }
  }
`
const HeadSearch = styled.div`
  width: 348px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 24px 24px 24px 24px;
  position: relative;
  span {
    position: absolute;
    top: 50%;
    left: 1rem;
    margin-top: -0.7rem;
  }
  input {
    width: 16rem;
    height: 40px;
    border: 1px solid var(--border-color);
    outline: none;
    font-size: 16px;
    background-color: #f5f5f5;
    margin-left: 2rem;
    ::-webkit-input-placeholder {
      font-size: 14px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      font-weight: 400;
      color: #d0d0d0;
    }
  }
`

const activeClassName = 'ACTIVE'

const Link = styled(NavLink).attrs({
  activeClassName
})`
  display: block;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  line-height: 100px;
  height: 100px;
  margin: 0 1rem;
  padding: 0 1rem;

  &.${activeClassName} {
    position: relative;
    border-radius: 12px;
    font-weight: bold;
    border-radius: 0;
    color: white;
    background: linear-gradient(180deg, var(--fourth-color) 0%, var(--primary-color) 70%);
    span {
      transform: rotate(-15deg);
    }
    &:before {
      content: '';
      width: 17px;
      height: 105px;
      position: absolute;
      left: -10px;
      transform: rotate(8deg);
      background: linear-gradient(180deg, var(--fourth-color) 0%, var(--primary-color) 70%);
    }
    &:after {
      content: '';
      width: 17px;
      height: 105px;
      position: absolute;
      right: -10px;
      top: -2px;
      transform: rotate(8deg);
      background: linear-gradient(180deg, var(--fourth-color) 0%, var(--primary-color) 70%);
    }
    :hover,
    :focus {
      color: white;
    }
  }

  :hover,
  :focus {
    color: var(--primary-color);
  }
`
export const handleClick = async (CHAIN_ID_HEX: any, RPC_URL: any) => {
  const { ethereum } = window as any
  if (ethereum) {
    try {
      // check if the chain to connect to is installed
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_HEX }] // chainId must be in hexadecimal numbers
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Matic network',
                chainId: CHAIN_ID_HEX,
                rpcUrls: [RPC_URL]
              }
            ]
          })
        } catch (addError) {
          console.error(addError)
        }
      }
      console.error(error)
    }
  } else {
    // if no window.ethereum then MetaMask is not installed
    alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html')
  }
}

export const Header = () => {
  const { chainId } = useActiveWeb3React()
  const [visible, setVisible] = useState(false)
  const [chainName, setChainName] = useState('')
  const [chainImg, setChainImg] = useState('')
  const screens = useBreakpoint()
  const isMobile = useMemo(() => {
    return !(screens.lg ?? true)
  }, [screens])

  useEffect(() => {
    if (chainId === 56) {
      setChainName('BNB chain')
      setChainImg(BSCImg)
    } else if (chainId === 137) {
      setChainName('Polygon')
      setChainImg(PolygonImg)
    }
  }, [chainId])
  return (
    <HeaderBox>
      <div className="container flex flex-h-between flex-v-center">
        <div className="logo">{<Logo height="100"></Logo>}</div>
        {/* <HeadSearch>
          <span>
            <img src={search} />
          </span>
          <input placeholder="Search items,collections,and accounts" className="input-placeholder" />
        </HeadSearch> */}
        {!isMobile ? (
          <>
            <div className="flex flex-h-between hidden">
              <Link exact to="/">
                <span>Games</span>
              </Link>
              <Link to="/lend">
                <span>Lend</span>
              </Link>
              <Link to="/dashboard">
                <span>Dashboard</span>
              </Link>
            </div>
            <div className="chain">
              <div className="jumpButton">
                <img src={chainImg} alt="" />
                <div className="chainName">{chainName}</div>
                <div className="menu">
                  <div onClick={() => handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)}>
                    <img src={PolygonImg} />
                    Polygon
                  </div>
                  <div onClick={() => handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)}>
                    <img src={BSCImg} alt="" />
                    BNB chain
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-h-between flex-v-center">
              <AccountBar key="accountbar" />
            </div>
          </>
        ) : (
          <UnorderedListOutlined onClick={() => setVisible(true)} style={{ fontSize: '1.5rem' }} />
        )}
      </div>

      {/* <MobileDrawer placement="right" width="75%" onClose={() => setVisible(false)} visible={visible}>
        <p>
          <MobileNav onClick={() => setVisible(false)} exact to="/">
            <span>Rent</span>
          </MobileNav>
        </p>
        <p>
          <MobileNav onClick={() => setVisible(false)} to="/lend">
            <span>Lend</span>
          </MobileNav>
        </p>
        <p>
          <MobileNav onClick={() => setVisible(false)} to="/dashboard">
            <span>Dashboard</span>
          </MobileNav>
        </p>
        <p>
          <AccountBar key="accountbar" />
        </p>
      </MobileDrawer> */}
    </HeaderBox>
  )
}

const MobileDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding-top: 4rem;
  }
`
const MobileNav = styled(NavLink).attrs({
  activeClassName
})`
  display: block;
  padding: 0.5rem;
  &.${activeClassName} {
    background: var(--primary-color);
  }
`
