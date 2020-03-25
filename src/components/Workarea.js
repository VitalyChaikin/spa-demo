import React from 'react'
// import { useStores } from '../hooks/use-stores'
import { Route, Switch } from 'react-router-dom'
import MySearch from './MySearch'
import MyList from './MyList'
import MyFiles from './MyFiles'

const Workarea = () => {
  //const { myStore } = useStores()
  return (
    <div className='Workarea'>
      <Switch>
        <Route path='/search'>
          <MySearch />
        </Route>
        <Route path='/list'>
          <MyList />
        </Route>
        <Route path='/files'>
          <MyFiles />
        </Route>
      </Switch>
    </div>
  )
}

export default Workarea
