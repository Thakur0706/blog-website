import React, { useState } from 'react'
import PostList from '../ components/PostList'
import SideMenu from '../ components/SideMenu'
import { useSearchParams } from 'react-router-dom'

const PostListPage = () => {
  const [open, setOpen] = useState(false)
  const [searchParams] = useSearchParams()
  
  return (
    <div>
      <h1 className='mb-8 text-2xl'>{searchParams.get('cat') ? `${searchParams.get('cat').split('-').join(' ')[0].toUpperCase() + searchParams.get('cat').split('-').join(' ').slice(1)} Blog` : searchParams.get('search') ? `Search results for "${searchParams.get('search')}"` : searchParams.get('author') ? `Posts by ${searchParams.get('author')}` : searchParams.get('saved') ? "My Saved Posts" : "Recent Posts"}</h1>
      <button onClick={()=> setOpen(!open)} className='md:hidden bg-neutral-900 text-white px-4 py-2 rounded-2xl mb-4 text-sm'>{open ? 'Close' : 'Filter or Search'}</button>
      <div className='flex flex-col-reverse md:flex-row gap-8'>
        <div className='flex-1'>
          <PostList/>
        </div>       
        <div className={`md:block ${open ? 'block' : 'hidden'}`}>
          <SideMenu/>
        </div>

      </div>
    </div>
  )
}

export default PostListPage