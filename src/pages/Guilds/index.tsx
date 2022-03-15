// import React, { useEffect, useMemo, useState } from 'react'
// import styled from 'styled-components'
// import { Row, Col, Button, Form, Input, Select, Space, Avatar, Popconfirm } from 'antd'
// import { useActiveWeb3React, useStore } from '../../hooks'
// import { Modal } from '../../components/Modal'
// import { http } from '../../components/Store'
// import { toastify } from '../../components/Toastify'
// import { Empty } from '../../components/Empty'
// import { LeftOutlined } from '@ant-design/icons'
// import Jdenticon from 'react-jdenticon'

// import Contribute from '../../assets/contribute.png'
// import { formatEther } from 'ethers/lib/utils'
// import { formatContribute } from '../../utils'
// import { lowerCase } from 'lodash'

// import { KeyedMutator } from 'swr/dist/types'
// import { Web3Provider } from '@ethersproject/providers'
// import { Loading } from '../../components/Loading'

// const { Option } = Select
// const { TextArea } = Input

// const RANK = ['Leader', 'Co-Leader', 'Officer', 'Sr.Member', 'Member']
// const MEMBERSHIP = ['By request', 'Invite only']

// const GuildHeader = styled.div`
//   color: white;
//   width: 100%;
//   background: linear-gradient(-45deg, var(--primary-color) 30%, var(--second-color));
//   padding: 2rem 0;
//   margin-bottom: 2rem;
//   b {
//     font-size: 2rem;
//   }
// `
// const GuildContent = styled.div`
//   margin: 1rem 0;
//   min-height: 10rem;
// `
// const GuildsBox = styled.div`
//   width: 100%;
//   box-shadow: 0 5px 10px 5px rgba(0, 0, 0, 0.1);
//   border-radius: 1rem;
//   margin-top: 2rem 0;
//   min-height: 10rem;
//   padding: 2rem;
// `

// const HeaderRow = styled(Row)`
//   color: var(--second-color);
//   font-weight: bold;
// `

// const ItemRow = styled(Row)`
//   padding: 1rem 0;
//   transition: all 0.4s ease;
//   &:nth-child(even) {
//     background: #f3f5f7;
//   }
//   &:hover {
//     background: #dae9f3;
//   }
// `

// const ColBox = styled(Col)`
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `

// export const errorHandler = (err: Error) => {
//   toastify.error(err.message)
// }

// interface GuildData {
//   name: string
//   id: number
//   founderAddress: string
//   founderEmail: string
//   subtitle: string
//   description: string
//   level: string
//   members: number
//   membership: string
//   rating: string
// }

// interface MemberData {
//   id: number
//   name: string
//   guildId: number
//   address: string
//   rank: string
//   rating: string
//   contribute: string
//   joinDate: string
//   balance?: string
// }
// export const Guilds = () => {
//   const { guilds, mutateGuilds } = useStore()
//   const { account, library } = useActiveWeb3React()

//   const [visible, setVisible] = useState(false)
//   const [joinVisible, setJoinVisible] = useState(false)
//   const [inviteVisible, setInviteVisible] = useState(false)
//   const [applying, setApplying] = useState(false)
//   const [currentGuild, setCurrentGuild] = useState<GuildData>({} as GuildData)
//   const [members, setMembers] = useState([] as MemberData[])
//   const [mode, setMode] = useState('about')
//   const [fetchingMembers, setFetchingMembers] = useState(false)

//   const [form] = Form.useForm()
//   const [joinForm] = Form.useForm()

//   const onFinish = async (values: any) => {
//     if (!library) {
//       toastify.error('Wait for connected or just refresh website.')
//       return
//     }
//     values.membership = Number(values.membership)
//     console.log('Success:', values)
//     const params = {
//       name: values.name,
//       founderAddress: account,
//       description: values.description,
//       subtitle: values.subtitle,
//       founderEmail: values.founderEmail,
//       membership: values.membership,
//       nickname: values.nickname
//     }
//     setApplying(true)
//     try {
//       const signTx = await library?.getSigner().signMessage('Create guild')
//       console.log(signTx)
//       if (!signTx) {
//         setApplying(false)
//         throw new Error('Failed to create.')
//       }
//       const result = await http.post('/v0/guilds', params)
//       if (result.data.code !== 1) {
//         throw new Error(result.data.message)
//       }
//       toastify.success('Guild create successful.')
//       setVisible(false)
//       mutateGuilds(undefined)
//       setApplying(false)
//       form.resetFields()
//     } catch (err: any) {
//       console.log(err.message)
//       setApplying(false)
//       errorHandler(err)
//     }
//   }

//   const onJoinFinish = async (values: any) => {
//     console.log('Success:', values)
//     const params = {
//       name: values.name,
//       address: account,
//       guildId: currentGuild.id,
//       rank: 4,
//       joinDate: new Date(),
//       contribute: 0,
//       rating: 0
//     }
//     // invite
//     if (currentGuild.membership === '1') {
//       params.address = values.address
//       params.rank = values.rank
//     }
//     setApplying(true)
//     try {
//       const signTx = await library?.getSigner().signMessage(currentGuild.membership === '1' ? 'Invite' : 'Join guild')
//       console.log(signTx)
//       if (!signTx) {
//         throw new Error('Failed.')
//       }
//       const result = await http.post('/v0/members', params)
//       if (result.data.code !== 1) {
//         throw new Error(result.data.message)
//       }
//       await http.put(`/v0/guilds/count/${currentGuild.id}?amount=1`)
//       fetchMembers()
//       setJoinVisible(false)
//       mutateGuilds(undefined)
//       setApplying(false)
//       toastify.success('successful.')
//       joinForm.resetFields()
//     } catch (err: any) {
//       console.log(err.message)
//       setApplying(false)
//       errorHandler(err)
//     }
//   }
//   const onFinishFailed = (errorInfo: any) => {
//     console.log('Failed:', errorInfo)
//   }

//   const onJoinFinishFailed = (errorInfo: any) => {
//     console.log('Failed:', errorInfo)
//   }

//   const handleMembershipChange = (value: string) => {
//     switch (value) {
//       case '0':
//         form.setFieldsValue({ note: 0 })
//         return
//       case '1':
//         form.setFieldsValue({ note: 1 })
//         return
//     }
//   }
//   const Guilds = useMemo(() => {
//     if (!guilds) {
//       return []
//     }
//     const _guilds = guilds.data.sort((a: any, b: any) => a.rank > b.rank)
//     console.log(_guilds)
//     return _guilds
//   }, [guilds])

//   const fetchBalances = (data: MemberData[]) => {
//     if (!library) {
//       return [] as MemberData[]
//     }
//     return Promise.all(
//       data.map(async (item) => {
//         const balance = await library.getBalance(item.address)
//         item.balance = formatContribute(formatEther(balance), 3)
//         return item
//       })
//     )
//   }
//   const fetchMembers = () => {
//     if (JSON.stringify(currentGuild) === '{}') {
//       return
//     }
//     setFetchingMembers(true)
//     http
//       .get(`/v0/members?guildId=${currentGuild.id}`)
//       .then(async (res) => {
//         const { data } = res.data

//         if (data.length) {
//           const _data = await fetchBalances(data)
//           setMembers(_data)
//         }
//       })
//       .catch((err) => console.log(err))
//       .finally(() => setFetchingMembers(false))
//   }

//   useEffect(() => {
//     fetchMembers()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentGuild, library])

//   const handleGoback = () => {
//     setCurrentGuild({} as GuildData)
//     setMode('about')
//   }
//   const [leaving, setLeaving] = useState(false)
//   const handleLeave = async () => {
//     const currentMember = members.find((item: MemberData) => item.address === account)
//     if (!currentMember) {
//       toastify.error('Member not exists')
//       return
//     }
//     setLeaving(true)
//     try {
//       const signTx = await library?.getSigner().signMessage('Leave guild')
//       console.log(signTx)
//       if (!signTx) {
//         throw new Error('Failed to leave.')
//       }
//       http
//         .delete(`/v0/members/${currentMember.id}`)
//         .then(async (res) => {
//           if (res.data.code === 0) {
//             throw new Error(res.data.message)
//           }
//           await http.put(`/v0/guilds/count/${currentMember.guildId}?amount=-1`)
//           toastify.success('successful')
//           mutateGuilds(undefined)
//           handleGoback()
//         })
//         .catch((err: any) => {
//           console.log(err)

//           toastify.error(err.message)
//         })
//     } catch (error: any) {
//       setLeaving(false)
//       errorHandler(error)
//     }
//   }

//   function cancel(e: any) {
//     console.log(e)
//   }
//   return (
//     <div>
//       {JSON.stringify(currentGuild) !== '{}' ? (
//         <>
//           <GuildHeader style={{ paddingBottom: '1rem' }} className="">
//             <div className="container flex flex-h-between flex-v-center">
//               <Button
//                 size="small"
//                 type="link"
//                 style={{ color: 'white' }}
//                 icon={<LeftOutlined />}
//                 onClick={handleGoback}
//               >
//                 Go back
//               </Button>
//               <div className="flex flex-column flex-center">
//                 <b>{currentGuild.name}</b>
//                 <p>{currentGuild.subtitle}</p>
//                 <Space>
//                   <TabBtn onClick={() => setMode('about')} className={mode === 'about' ? 'link' : ''}>
//                     About
//                   </TabBtn>
//                   <TabBtn onClick={() => setMode('members')} className={mode === 'members' ? 'link' : ''}>
//                     Members
//                   </TabBtn>
//                 </Space>
//               </div>
//               <Space style={{ minWidth: '72px' }}>
//                 {mode === 'members' ? (
//                   <>
//                     {currentGuild.membership === '0' ? (
//                       !members.filter((item) => lowerCase(item.address) === lowerCase(account || '')).length ? (
//                         <Button onClick={() => setJoinVisible(true)} shape="round" ghost>
//                           Join
//                         </Button>
//                       ) : null
//                     ) : (
//                       <InviteBox
//                         className={
//                           !account || lowerCase(currentGuild.founderAddress) !== lowerCase(account) ? 'disabled' : ''
//                         }
//                       >
//                         <Button
//                           disabled={!account || lowerCase(currentGuild.founderAddress) !== lowerCase(account)}
//                           onClick={() => setInviteVisible(true)}
//                           shape="round"
//                           ghost
//                         >
//                           Invite
//                         </Button>
//                       </InviteBox>
//                     )}
//                     {members.filter((item) => lowerCase(item.address) === lowerCase(account || '')).length ? (
//                       <Popconfirm
//                         title="Are you sure to leave this guild?"
//                         onConfirm={handleLeave}
//                         onCancel={cancel}
//                         okText="Yes"
//                         cancelText="No"
//                       >
//                         <Button
//                           shape="round"
//                           loading={leaving}
//                           style={{ borderColor: 'orange', color: 'orange' }}
//                           ghost
//                         >
//                           Leave
//                         </Button>
//                       </Popconfirm>
//                     ) : null}
//                     {/* {currentGuild.founderAddress === account ? (
//                       <Popconfirm
//                         title="Are you sure to dismiss this guild?"
//                         onConfirm={handleLeave}
//                         onCancel={cancel}
//                         okText="Yes"
//                         cancelText="No"
//                       >
//                         <Button
//                           shape="round"
//                           loading={leaving}
//                           style={{ borderColor: 'orange', color: 'orange' }}
//                           ghost
//                         >
//                           Dismiss
//                         </Button>
//                       </Popconfirm>
//                     ) : (
//                       ''
//                     )} */}
//                   </>
//                 ) : (
//                   ''
//                 )}
//               </Space>
//             </div>
//           </GuildHeader>
//           {mode === 'about' ? (
//             <div className="container flex flex-column flex-v-center">
//               <h1>{currentGuild.name}</h1>
//               <p>
//                 <b>{currentGuild.subtitle}</b>
//               </p>
//               <p style={{ marginLeft: '5rem', marginRight: '5rem' }}>{currentGuild.description}</p>
//             </div>
//           ) : (
//             <Members
//               mutateGuilds={mutateGuilds}
//               fetchMembers={fetchMembers}
//               library={library}
//               account={account}
//               currentGuild={currentGuild}
//               members={members}
//               fetchingMembers={fetchingMembers}
//             />
//           )}

//           <Modal destroyOnClose footer={null} onCancel={() => setJoinVisible(false)} visible={joinVisible}>
//             <Form
//               form={joinForm}
//               name="basic"
//               layout="vertical"
//               initialValues={{ remember: true }}
//               onFinish={onJoinFinish}
//               onFinishFailed={onJoinFinishFailed}
//               autoComplete="off"
//             >
//               <Form.Item
//                 label="Nickname"
//                 name="name"
//                 rules={[{ required: true, message: 'Please input your nickname!' }]}
//               >
//                 <Input />
//               </Form.Item>

//               <Form.Item>
//                 <Button block loading={applying} type="primary" htmlType="submit">
//                   Submit
//                 </Button>
//               </Form.Item>
//             </Form>
//           </Modal>
//           <Modal destroyOnClose footer={null} onCancel={() => setInviteVisible(false)} visible={inviteVisible}>
//             <Form
//               form={joinForm}
//               name="basic"
//               layout="vertical"
//               initialValues={{ remember: true }}
//               onFinish={onJoinFinish}
//               onFinishFailed={onJoinFinishFailed}
//               autoComplete="off"
//             >
//               <Form.Item label="Nickname" name="name" rules={[{ required: true, message: 'Please input nickname!' }]}>
//                 <Input />
//               </Form.Item>
//               <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please input address!' }]}>
//                 <Input />
//               </Form.Item>
//               {account && lowerCase(currentGuild.founderAddress) === lowerCase(account) ? (
//                 <Form.Item name="rank" label="Rank" rules={[{ required: true }]}>
//                   <Select placeholder="Please select rank" onChange={handleMembershipChange} allowClear>
//                     <Option value={'1'}>Co-Leader</Option>
//                     <Option value={'2'}>Officer</Option>
//                     <Option value={'3'}>Sr.Member</Option>
//                     <Option value={'4'}>Member</Option>
//                   </Select>
//                 </Form.Item>
//               ) : (
//                 ''
//               )}

//               <Form.Item>
//                 <Button block loading={applying} type="primary" htmlType="submit">
//                   Submit
//                 </Button>
//               </Form.Item>
//             </Form>
//           </Modal>
//         </>
//       ) : (
//         <>
//           <GuildHeader className="">
//             <div className="container flex flex-h-between flex-v-center">
//               <b>Guilds</b>
//               <Button shape="round" onClick={() => setVisible(true)}>
//                 Create Guild
//               </Button>
//             </div>
//           </GuildHeader>
//           <div className="container">
//             <GuildsBox>
//               <HeaderRow justify="center">
//                 <ColBox span={4}>RANK</ColBox>
//                 <Col span={5}>NAME</Col>
//                 <ColBox span={3}>LEVEL</ColBox>
//                 <ColBox span={4}>RATING</ColBox>
//                 <ColBox span={4}>MEMBERS</ColBox>
//                 <ColBox span={4}>MEMBERSHIP</ColBox>
//               </HeaderRow>
//               <GuildContent>
//                 {Guilds.length ? (
//                   Guilds.map((item: GuildData, index: number) => (
//                     <ItemRow
//                       style={{ cursor: 'pointer' }}
//                       onClick={() => setCurrentGuild(item)}
//                       key={index}
//                       justify="center"
//                     >
//                       <ColBox span={4}>{index + 1}</ColBox>
//                       <Col span={5} className="flex flex-start flex-v-center">
//                         <Avatar
//                           style={{
//                             backgroundColor: 'var(--primary-color)',
//                             verticalAlign: 'middle',
//                             marginRight: '.5rem'
//                           }}
//                           size="large"
//                           gap={4}
//                         >
//                           {item.name.substring(0, 1)}
//                         </Avatar>
//                         <h3>{item.name}</h3>
//                       </Col>
//                       <ColBox span={3}>{item.level}</ColBox>
//                       <ColBox span={4}>{item.rating}</ColBox>
//                       <ColBox span={4}>{item.members}</ColBox>
//                       <ColBox span={4}>{MEMBERSHIP[Number(item.membership)]}</ColBox>
//                     </ItemRow>
//                   ))
//                 ) : (
//                   <Empty text="No guild found" />
//                 )}
//               </GuildContent>
//             </GuildsBox>
//           </div>
//           <Modal destroyOnClose footer={null} onCancel={() => setVisible(false)} visible={visible}>
//             <Form
//               form={form}
//               name="basic"
//               layout="vertical"
//               initialValues={{ remember: true }}
//               onFinish={onFinish}
//               onFinishFailed={onFinishFailed}
//               autoComplete="off"
//             >
//               <Form.Item
//                 label="Guild name"
//                 name="name"
//                 rules={[{ required: true, message: 'Please input your guild name!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="Nickname"
//                 name="nickname"
//                 rules={[{ required: true, message: 'Please input your nickname!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="Subtitle"
//                 name="subtitle"
//                 rules={[{ required: true, message: 'Please input your subtitle!' }]}
//               >
//                 <TextArea rows={2} showCount maxLength={20} />
//               </Form.Item>
//               <Form.Item
//                 label="Description"
//                 name="description"
//                 rules={[{ required: true, message: 'Please input your Description!' }]}
//               >
//                 <TextArea rows={4} showCount maxLength={300} />
//               </Form.Item>

//               <Form.Item
//                 label="Email"
//                 name="founderEmail"
//                 rules={[{ required: true, message: 'Please input your email!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item name="membership" label="Membership" rules={[{ required: true }]}>
//                 <Select placeholder="Please select membership" onChange={handleMembershipChange} allowClear>
//                   <Option value={'0'}>By request</Option>
//                   <Option value={'1'}>Invite only</Option>
//                 </Select>
//               </Form.Item>

//               <Form.Item>
//                 <Button size="large" block loading={applying} type="primary" htmlType="submit">
//                   Submit
//                 </Button>
//               </Form.Item>
//             </Form>
//           </Modal>
//         </>
//       )}
//     </div>
//   )
// }
// interface MembersProps {
//   members: Record<string, any>[]
//   fetchingMembers: boolean
//   currentGuild: any
//   account?: string | null
//   library: Web3Provider | undefined
//   fetchMembers: () => void
//   mutateGuilds: KeyedMutator<any>
// }

// const Members: React.FC<MembersProps> = ({
//   fetchMembers,
//   library,
//   currentGuild,
//   account,
//   members,
//   fetchingMembers,
//   mutateGuilds
// }) => {
//   console.log(members)
//   const [expeling, setExpeling] = useState(false)
//   const handleExpel = async (id: number) => {
//     console.log('exprel')
//     setExpeling(true)
//     try {
//       const signTx = await library?.getSigner().signMessage('Expel member')
//       console.log(signTx)
//       if (!signTx) {
//         setExpeling(false)
//         throw new Error('Failed to create.')
//       }

//       const _delete = await http.delete(`/v0/members/${id}`)
//       if (_delete.data.code === 1) {
//         toastify.success('Expel successful')
//         const minusAmount = await http.put(`/v0/guilds/count/${currentGuild.id}?amount=-1`)
//         if (minusAmount.data.code !== 1) {
//           throw new Error(minusAmount.data.message)
//         }
//         fetchMembers()
//         mutateGuilds(undefined)
//       } else {
//         throw new Error(_delete.data.message)
//       }
//     } catch (error: any) {
//       setExpeling(false)
//       errorHandler(error)
//     }
//   }

//   return (
//     <div className="container">
//       <GuildsBox>
//         <HeaderRow justify="center">
//           <ColBox span={4}>RANK</ColBox>
//           <Col span={6}>NAME</Col>
//           <ColBox span={4}>RATING</ColBox>
//           <ColBox span={6}>JOINED</ColBox>
//           <ColBox span={4}>CONTRIBUTION</ColBox>
//         </HeaderRow>
//         <GuildContent>
//           {fetchingMembers ? (
//             <Loading />
//           ) : members.length ? (
//             members.map((item) => (
//               <ItemRow key={item.id} justify="center">
//                 <ColBox span={4}>{RANK[item.rank]}</ColBox>
//                 <Col span={6} className="flex flex-start flex-v-center">
//                   <Jdenticon size="32" value={item.address} />
//                   <h3>{item.name}</h3>
//                 </Col>
//                 <ColBox span={4}>{item.rating}</ColBox>
//                 <ColBox span={6}>{new Date(item.joinDate).toLocaleDateString()}</ColBox>
//                 <ColBox span={4}>
//                   {item.balance}
//                   <Avatar size={24} src={Contribute} alt="" />
//                   {currentGuild.founderAddress === account && item.address !== account ? (
//                     <Popconfirm
//                       title="Are you sure to expel this member?"
//                       onConfirm={() => handleExpel(item.id)}
//                       okText="Yes"
//                       cancelText="No"
//                     >
//                       <Button type="link" disabled={expeling} style={{ color: 'orange' }} ghost>
//                         Expell
//                       </Button>
//                     </Popconfirm>
//                   ) : null}
//                 </ColBox>
//               </ItemRow>
//             ))
//           ) : (
//             <Empty text="No members yet." />
//           )}
//         </GuildContent>
//       </GuildsBox>
//     </div>
//   )
// }

// const InviteBox = styled.div`
//   position: relative;
//   &:before {
//     position: absolute;
//     top: -2rem;
//     left: 0;
//     content: 'Invite only';
//   }
//   &.disabled {
//     opacity: 0.7;
//   }
// `
// const TabBtn = styled.div`
//   color: white;
//   padding: 0.5rem 1rem;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   &.link {
//     border-radius: 0.5rem;
//     background: white;
//     color: #333;
//     font-weight: bold;
//   }
// `
import React from 'react'

export const Guilds = () => {
  return (
    <div className="container flex flex-center" style={{ height: '30rem' }}>
      <h1>Coming soon.</h1>
    </div>
  )
}
