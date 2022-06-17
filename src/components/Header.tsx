import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { AccountBar } from './AccountBar'
import { ReactComponent as Logo } from '../assets/logo.svg'
import { ReactComponent as LogoNormal } from '../assets/logo-normal.svg'
import search from '../assets/search_bar_icon_search.svg'
import { Grid, Drawer } from 'antd'
import { UnorderedListOutlined } from '@ant-design/icons'
import { useActiveWeb3React } from '../hooks'
const { useBreakpoint } = Grid

const HeaderBox = styled.div`
  position: sticky;
  top: 0;
  height: 100px;
  background: #fff;
  box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-bottom: 1px solid var(--primary-color);
  z-index: 99;

  .logo svg {
    max-width: 15rem;
  }
  .jumpButton {
    display: flex;
    height: 39px;
    border: 1px solid #ccc;
    color: #666;
    border-radius: 1.25rem;
    background: #ededed;
    .polygon {
      width: 4rem;
      height: 37px;
      margin: 0 8px 0 0;
      text-align: center;
      line-height: 37px;
      cursor: pointer;
      background: #fff;
      color: #333333;
      box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.16);
      border-radius: 24px 24px 24px 24px;
      border-radius: 1.25rem;
      border: 1px solid #ccc;
    }
    .eth {
      width: 5rem;
      height: 38px;
      color: #666;
      text-align: center;
      color: #cccccc;
      line-height: 37px;
      cursor: pointer;
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
const skipLinks = (type: string) => {
  if (type === 'polygon') {
    window.location.href = 'https://polygon.gameland.network'
  }
  if (type === 'eth') {
    window.location.href = 'https://eth.gameland.network'
  }
}

export const Header = () => {
  const { chainId } = useActiveWeb3React()
  const [visible, setVisible] = useState(false)
  const screens = useBreakpoint()
  const isMobile = useMemo(() => {
    return !(screens.lg ?? true)
  }, [screens])

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
            <div className="flex flex-h-between">
              <Link exact to="/">
                <span>Rent</span>
              </Link>
              <Link to="/lend">
                <span>Lend</span>
              </Link>
              <Link to="/dashboard">
                <span>Dashboard</span>
              </Link>
              <Link to="/guilds">
                <span>Guilds</span>
              </Link>
            </div>
            {/* <div className="jumpButton">
              <div className="polygon" onClick={() => skipLinks('polygon')}>
                Polygon
              </div>
              <div className="eth" onClick={() => skipLinks('eth')}>
                Ethereum
              </div>
            </div> */}
            <div className="flex flex-h-between flex-v-center">
              <AccountBar key="accountbar" />
            </div>
          </>
        ) : (
          <UnorderedListOutlined onClick={() => setVisible(true)} style={{ fontSize: '1.5rem' }} />
        )}
      </div>

      <MobileDrawer placement="right" width="75%" onClose={() => setVisible(false)} visible={visible}>
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
      </MobileDrawer>
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
