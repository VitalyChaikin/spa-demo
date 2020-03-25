import React from 'react'
import { MyStore } from '../stores/my-store'

export const storesContext = React.createContext({
  myStore: new MyStore()
})
