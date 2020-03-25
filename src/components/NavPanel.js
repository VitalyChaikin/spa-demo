import React from 'react'
// import { useStores } from '../hooks/use-stores'
import { Link } from 'react-router-dom'

const NavPanel = () => {
  //const { myStore } = useStores()
  return (
    <div className='NavPanel'>
      <ul className='ulNavPanel'>
        <li>
          <Link to='/search'>Button 1</Link>
        </li>
        <li>
          <Link to='/list'>Button 2</Link>
        </li>
        <li>
          <Link to='/files'>Button 3</Link>
        </li>
      </ul>
    </div>
  )
}

export default NavPanel
