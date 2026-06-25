// import { Search } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'
import Search from './Search'

const MainCategories = () => {
    return (
        <div className='hidden md:flex border-b border-t border-neutral-200 px-4 py-2 items-center justify-center  gap-2'>
            {/* ------------links ------------ */}
            <div className='flex-1 flex items-center gap-4 text-foreground text-xs overflow-x-auto scrollbar-hide min-w-0 md:text-sm' >
                <NavLink className='rounded-full px-4 py-2 bg-foreground text-background text-center' to={"/posts"}>All Posts</NavLink>

                <NavLink to={"/posts?cat=web-design"} className='bg-neutral-200/50 hover:bg-neutral-200 rounded-full px-4 py-2 text-center' >Web Design</NavLink>

                <NavLink to={"/posts?cat=development"} className='bg-neutral-200/50 hover:bg-neutral-200 rounded-full px-4 py-2 text-center' >Development</NavLink>

                <NavLink to={"/posts?cat=databases"} className='bg-neutral-200/50 hover:bg-neutral-200 rounded-full px-4 py-2 text-center' >Databases</NavLink>

                <NavLink to={"/posts?cat=seo"} className='bg-neutral-200/50 hover:bg-neutral-200 rounded-full px-4 py-2 text-center' >Search Engine</NavLink>

                <NavLink to={"/posts?cat=marketing"} className='bg-neutral-200/50 hover:bg-neutral-200 rounded-full px-4 py-2 text-center' >Marketing</NavLink>



            </div>
            <span className='text-neutral-500'>|</span>
            {/* ------------search ------------ */}


            <Search/>


            {/* <div className='flex items-center border border-neutral-300 rounded-full px-4 py-2 text-xs md:text-sm gap-1'>
                <span className=''>
                    <Search className='w-5 h-5 text-neutral-500' />
                </span>
                <input className='outline-none text-xs md:text-sm' type="text" placeholder='Search' />
            </div> */}
        </div>
    )
}

export default MainCategories