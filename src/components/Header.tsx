import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { AccountBar } from './AccountBar'
import { ReactComponent as Logo } from '../assets/logo.svg'
import { Grid, Drawer } from 'antd'
import { UnorderedListOutlined } from '@ant-design/icons'
const { useBreakpoint } = Grid

const HeaderBox = styled.div`
  height: 100px;
  background: linear-gradient(180deg, #292929 0%, #585858 100%);
  overflow: hidden;

  .logo svg {
    max-width: 15rem;
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
    background: linear-gradient(180deg, var(--primary-light-color) 0%, var(--primary-color) 100%);
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
      background: linear-gradient(180deg, var(--primary-light-color) 0%, var(--primary-color) 100%);
    }
    &:after {
      content: '';
      width: 17px;
      height: 105px;
      position: absolute;
      right: -10px;
      top: -2px;
      transform: rotate(8deg);
      background: linear-gradient(180deg, var(--primary-light-color) 0%, var(--primary-color) 100%);
    }
  }

  :hover,
  :focus {
    color: white;
  }
`
export const Header = () => {
  const [visible, setVisible] = useState(false)
  const screens = useBreakpoint()
  const isMobile = useMemo(() => {
    console.log(screens.lg)

    return !(screens.lg ?? true)
  }, [screens])

  return (
    <HeaderBox>
      <div className="container flex flex-h-between flex-v-center">
        <div className="logo">
          <Logo></Logo>
        </div>
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
            </div>
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
    background: var(--normal-black);
    padding-top: 4rem;
  }
  .anticon-close {
    color: white;
    svg {
      color: white;
    }
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
