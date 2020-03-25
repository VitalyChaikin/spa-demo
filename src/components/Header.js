import React from 'react'
// import { useStores } from '../hooks/use-stores'
import logo from './user.svg'

const Header = () => {
  //const { myStore } = useStores()  <img src={logo} height="50px" width="50px" alt="Logo" />
  return (
    <div className='Header'>
      <div className='logo'>
        <img src={logo} height='55px' width='55px' alt='Logo' />
      </div>
      <div className='info'>
        <label className='linfo'>Информация о пользователе</label>
      </div>
    </div>
  )
}

export default Header
