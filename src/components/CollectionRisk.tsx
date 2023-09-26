import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import correct from '../assets/icon_correct.svg'
import warn from '../assets/icon_warn.svg'
import { Img } from './Img'

const RiskBox = styled.div`
  .title {
    color: #000;
    font-size: 20px;
    font-weight: 700;
  }
  .minTitle {
    color: #41acef;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
  }
  .Describe {
    color: #000;
    font-size: 12px;
    padding-left: 10px;
  }
  .contractRisk {
    img {
      width: 44px;
      height: 44px;
    }
    .Security {
      width: 49%;
      min-height: 300px;
      border: 1px solid #e5e5e5;
      border-radius: 20px;
      padding: 10px;
    }
    .Honeypot {
      width: 49%;
      min-height: 300px;
      border: 1px solid #e5e5e5;
      border-radius: 20px;
      padding: 10px;
    }
  }
`

export const CollectionRisk = (data: any) => {
  return (
    <RiskBox>
      {/* <div className="contractInfo">
        <div className="title">Basic Info</div>
        <div className="Name">
          <div>Name</div>
          <div></div>
        </div>
      </div> */}
      <div className="contractRisk flex flex-column-between">
        {data.data&&Object.keys(data.data).length? (
          <div className="Security">
            <div className="title">Contract Security</div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.is_open_source === '1'
                  ? <img src={correct} alt="" />
                  : data.data?.is_open_source === '0'
                  ? <img src={warn} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.is_open_source === '1'
                    ? 'Contract source code verified'
                    : data.data?.is_open_source === '0'
                    ? 'No contract source code verified'
                    : ''}
                </div>
              </div>
              {data.data?.is_open_source === '1' || data.data?.is_open_source === '0' ? (
                <div className="Describe">
                  You can check the contract code for details.
                  Unsourced token contracts are likely to have malicious functions to defraud their users of their assets.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.is_proxy === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.is_proxy === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                {data.data?.is_proxy === '1'
                  ? 'Proxy contract'
                  : data.data?.is_proxy === '0'
                  ? 'No proxy'
                  : ''}
                </div>
              </div>
              {data.data?.is_proxy === '1' || data.data?.is_proxy === '0' ? (
                <div className="Describe">
                  The proxy contract means contract owner can modifiy the function of the token and possibly effect the price.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.is_mintable === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.is_mintable === '0'
                  ? <img src={correct} alt="" />
                  : ''}
              <div className="flex flex-v-center">
                {data.data?.is_mintable === '1'
                  ? 'Have mint function'
                  : data.data?.is_mintable === '0'
                  ? 'No mint function'
                  : ''}
                </div>
              </div>
              {data.data?.is_mintable === '1' || data.data?.is_mintable === '0' ? (
                <div className="Describe">
                  Hidden mint functions may increase the amount of tokens in circulation and effect the price of the token.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.can_take_back_ownership === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.can_take_back_ownership === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.can_take_back_ownership === '1'
                    ? 'There are functions to retrieve ownership'
                    : data.data?.can_take_back_ownership === '0'
                    ? 'No function found that retrieves ownership'
                    : ''}
                </div>
              </div>
              {data.data?.can_take_back_ownership === '1' || data.data?.can_take_back_ownership === '0' ? (
                <div className="Describe">
                  If this function exists, it is possible for the project owner to regain ownership even after relinquishing it
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.owner_change_balance === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.owner_change_balance === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.owner_change_balance === '1'
                    ? 'Owner can change balance'
                    : data.data?.owner_change_balance === '0'
                    ? 'Owner can not change balance'
                    : ''}
                </div>
              </div>
              {data.data?.owner_change_balance === '1' || data.data?.owner_change_balance === '0' ? (
                <div className="Describe">
                  The contract owner is not found to have the authority to modify the balance of tokens at other addresses.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.hidden_owner === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.hidden_owner === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.hidden_owner === '1'
                    ? 'Has hidden owner'
                    : data.data?.hidden_owner === '0'
                    ? 'No hidden owner'
                    : ''}
                </div>
              </div>
              {data.data?.hidden_owner === '1' || data.data?.hidden_owner === '0' ? (
                <div className="Describe">
                  For contract with a hidden owner, developer can still manipulate the contract even if the ownership has been abandoned.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.selfdestruct === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.selfdestruct === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.selfdestruct === '1'
                    ? 'This token can self destruct'
                    : data.data?.selfdestruct === '0'
                    ? 'This token can not self destruct'
                    : ''}
                </div>
              </div>
              {data.data?.selfdestruct === '1' || data.data?.selfdestruct === '0' ? (
                <div className="Describe">
                  If this function exists and is triggered, the contract will be destroyed, all functions will be unavailable,
                  and all related assets will be erased.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.external_call === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.external_call === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.external_call === '1'
                    ? 'Exist external call risk'
                    : data.data?.external_call === '0'
                    ? 'No external call risk found'
                    : ''}
                </div>
              </div>
              {data.data?.external_call === '1' || data.data?.external_call === '0' ? (
                <div className="Describe">
                  External calls would cause this token contract to be highly dependent on other contracts, which may be a potential risk.
                </div>
              ) : ''}
            </div>
          </div>
        ) : (
          <div className="Security">
            <div className="title">Contract Security</div>
            <div>No Data</div>
          </div>
        )}
        {data.data&&Object.keys(data.data).length? (
          <div className="Honeypot">
            <div className="title">Honeypot Risk</div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.is_honeypot === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.is_honeypot === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.is_honeypot === '1'
                    ? 'This does appear to be a honeypot'
                    : data.data?.is_honeypot === '0'
                    ? 'This does not appear to be a honeypot'
                    : ''}
                </div>
              </div>
              {data.data?.is_honeypot === '1' || data.data?.is_honeypot === '0' ? (
                <div className="Describe">
                  We are not aware of any malicious code.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.transfer_pausable === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.transfer_pausable === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.transfer_pausable === '1'
                    ? 'codes found to suspend trading'
                    : data.data?.transfer_pausable === '0'
                    ? 'No codes found to suspend trading'
                    : ''}
                </div>
              </div>
              {data.data?.transfer_pausable === '1' || data.data?.transfer_pausable === '0' ? (
                <div className="Describe">
                  If a suspendable code is included, the token maybe neither be bought nor sold (honeypot risk).
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.trading_cooldown === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.trading_cooldown === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.trading_cooldown === '1'
                    ? 'Has trading cooldown function'
                    : data.data?.trading_cooldown === '0'
                    ? 'No trading cooldown function'
                    : ''}
                </div>
              </div>
              {data.data?.trading_cooldown === '1' || data.data?.trading_cooldown === '0' ? (
                <div className="Describe">
                  If there is a trading cooldown function,
                  the user will not be able to sell the token within a certain time or block after buying.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.is_anti_whale === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.is_anti_whale === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.is_anti_whale === '1'
                    ? 'Has anti_whale(limited number of transactions)'
                    : data.data?.is_anti_whale === '0'
                    ? 'No anti_whale(Unlimited number of transactions)'
                    : ''}
                </div>
              </div>
              {data.data?.is_anti_whale === '1' || data.data?.is_anti_whale === '0' ? (
                <div className="Describe">
                  The number of scam token transactions may be limited (honeypot risk).
                </div>
              ) : ''} 
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.anti_whale_modifiable === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.anti_whale_modifiable === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.anti_whale_modifiable === '1'
                    ? 'Anti whale can be modified'
                    : data.data?.anti_whale_modifiable === '0'
                    ? 'Anti whale can not be modified'
                    : ''}
                </div>
              </div>
              {data.data?.anti_whale_modifiable === '1' || data.data?.anti_whale_modifiable === '0' ? (
                <div className="Describe">
                  The maximum trading amount or maximum position can not be modified.
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.slippage_modifiable === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.slippage_modifiable === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.slippage_modifiable === '1'
                    ? 'Tax can be modified'
                    : data.data?.slippage_modifiable === '0'
                    ? 'Tax cannot be modified'
                    : ''}
                </div>
              </div>
              {data.data?.slippage_modifiable === '1' || data.data?.slippage_modifiable === '0' ? (
                <div className="Describe">
                  If the transaction tax is increased to more than 49%, the tokens will not be able to be traded (honeypot risk).
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.is_blacklisted === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.is_blacklisted === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.is_blacklisted === '1'
                    ? 'Has blacklist'
                    : data.data?.is_blacklisted === '0'
                    ? 'No blacklist'
                    : ''}
                </div>
              </div>
              {data.data?.is_blacklisted === '1' || data.data?.is_blacklisted === '0' ? (
                <div className="Describe">
                  If there is a blacklist, some addresses may not be able to trade normally (honeypot risk).
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.is_whitelisted === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.is_whitelisted === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.is_whitelisted === '1'
                    ? 'Has whitelist'
                    : data.data?.is_whitelisted === '0'
                    ? 'No whitelist'
                    : ''}
                </div>
              </div>
              {data.data?.is_whitelisted === '1' || data.data?.is_whitelisted === '0' ? (
                <div className="Describe">
                  If there is a whitelist, some addresses may not be able to trade normally (honeypot risk).
                </div>
              ) : ''}
            </div>
            <div className="minTitle">
              <div className="flex flex-v-center">
                {data.data?.personal_slippage_modifiable === '1'
                  ? <img src={warn} alt="" />
                  : data.data?.personal_slippage_modifiable === '0'
                  ? <img src={correct} alt="" />
                  : ''}
                <div className="flex flex-v-center">
                  {data.data?.personal_slippage_modifiable === '1'
                    ? 'Tax changes found for personal addresses'
                    : data.data?.personal_slippage_modifiable === '0'
                    ? 'No tax changes found for personal addresses'
                    : ''}
                </div>
              </div>
              {data.data?.personal_slippage_modifiable === '1' || data.data?.personal_slippage_modifiable === '0' ? (
                <div className="Describe">
                  If it exists, the contract owner may set a very outrageous tax rate for assigned address to block it from trading.
                </div>
              ) : ''}
            </div>
          </div>
        ) : (
          <div className="Honeypot">
            <div className="title">Honeypot Risk</div>
            <div>No Data</div>
          </div>
        )}
      </div>
    </RiskBox>
  )
}