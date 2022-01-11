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
  // background: linear-gradient(180deg, #292929 0%, #585858 100%);
  box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-bottom: 1px solid var(--primary-color);

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
export const Header = () => {
  const [visible, setVisible] = useState(false)
  const screens = useBreakpoint()
  const isMobile = useMemo(() => {
    return !(screens.lg ?? true)
  }, [screens])

  return (
    <HeaderBox>
      <div className="container flex flex-h-between flex-v-center">
        <div className="logo">
          <Logo height="100"></Logo>
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
              <Link to="/guilds">
                <span>Guilds</span>
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
