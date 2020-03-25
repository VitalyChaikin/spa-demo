import React from 'react'
import { storesContext } from '../contexts/global'

export const useStores = () => React.useContext(storesContext)
