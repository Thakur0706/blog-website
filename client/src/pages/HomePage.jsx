import React from 'react'
import {Link} from 'react-router-dom'
import MainCategories from '../ components/MainCategories'
import FeaturedPost from '../ components/FeaturedPost'
import PostList from '../ components/PostList'
const HomePage = () => {
  return (
    <div className='mt-4 flex flex-col gap-4'>
      {/* breadcrum */}
      <div className='flex gap-4'>
        <Link to="/">Home</Link>
        <span>•</span>
        <span className='font-medium text-neutral-500'>Blogs And Articles</span>
      </div>

      {/* introduction */}
      <div className='flex items-center justify-between'>
        {/* title */}
        <div className='w-full md:w-2/3'>
          <h1 className='text-2xl md:text-5xl lg:text-6xl font-bold'>Where stories, ideas, and projects <span className='text-neutral-600 opacity-70'>come together</span></h1>
          <p className='text-neutral-500 mt-5 text-sm md:text-lg'>A community-driven space to write, explore, and share knowledge across tech, design, and beyond.</p>
        </div>
        {/* write page */}
        <Link to="/write" className='hidden md:block text-center font-semibold px-4 py-2 rounded-full bg-neutral-900 text-neutral-100'>+ Write your story</Link>

      </div>

      {/* categories */}
      <MainCategories/>
      {/*featured posts */}
      <FeaturedPost/>
      {/* post list */}
      <div className='mt-8'>
        <h1 className='text-2xl text-neutral-600 font-medium mb-4'>Recent Posts</h1>
        <PostList/>
      </div>
    </div>
  )
}

export default HomePage