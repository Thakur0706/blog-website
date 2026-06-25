import React from 'react'
import Navbar from '../ components/Navbar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-32'>
        <Navbar />
        <Outlet/>
    </div>
  )
}

export default MainLayout