import React, { useState } from 'react'
import { assets, dummyUserData } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut, Settings } from 'lucide-react'
import useLogout from "../hooks/useLogout"
import useAccount from "../hooks/useAccountSettings"
import LogoutConfirmationModal from './accounts/LogoutConfirmationModal'

const Sidebar = ({sidebarOpen, setSidebarOpen}) => {
  const navigate = useNavigate()
  const { logout, showConfirmModal, handleConfirmLogout, handleCancelLogout } = useLogout()
  const { user } = useAccount()
  
  // Use real user data if available, fallback to dummy data
  const currentUser = user || dummyUserData
  
  // Handle logout with confirmation
  const handleLogout = () => {
    logout({ 
      showConfirmation: true,
      redirectTo: '/login' 
    })
  }

  // Close sidebar on mobile when navigating
  const handleNavigation = (path) => {
    navigate(path)
    if (window.innerWidth < 640) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center mx-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ?'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
        <div className='w-full'>
          <img 
            onClick={() => navigate('/')} 
            src={assets.logo} 
            className='w-26 ml-7 my-2 cursor-pointer' 
            alt="Logo" 
          />
          <hr className='border-gray-300 mb-8'/>
          
          {/* Main Navigation Items */}
          <MenuItems setSidebarOpen={setSidebarOpen} />
          
          {/* Create Post Button */}
          <Link 
            to='/create-post' 
            className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer'
            onClick={() => {
              if (window.innerWidth < 640) {
                setSidebarOpen(false)
              }
            }}
          >
            <CirclePlus className='w-5 h-5'/>
            Create Post
          </Link>
        </div>
        
        {/* Bottom Section - Settings and Sign Out Only */}
        <div className='w-full border-t border-gray-200 p-4 px-7'>
          {/* Settings Link */}
          <Link 
            to='/settings' 
            className='flex items-center gap-3 py-2.5 px-2 mb-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200'
            onClick={() => {
              if (window.innerWidth < 640) {
                setSidebarOpen(false)
              }
            }}
          >
            <Settings className='w-5 h-5'/>
            <span className='font-medium'>Settings</span>
          </Link>
          
          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 py-2.5 px-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200'
          >
            <LogOut className='w-5 h-5' />
            <span className='font-medium'>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal 
        isOpen={showConfirmModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  )
}

export default Sidebar