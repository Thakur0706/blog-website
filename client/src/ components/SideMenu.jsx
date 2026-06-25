import React from 'react'
import Search from './Search'
import { Link, useSearchParams } from 'react-router-dom'


const SideMenu = () => {

    const [searchParams,setSearchParams] = useSearchParams()
    const handleFilterChange = (e)=>{
        // if the value is different, update the search params
        const value = e.target.value 
        if(searchParams.get("sort") !== value) {
            setSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                sort:value 
            })
        }
    }


    const handleCategoryChange = (category)=>{
        // if the value is different, update the search params
        if(searchParams.get("cat") !== category) {
            setSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                cat:category 
            })
        }
    }
  return (
    <div className='px-4 sticky h-max top-8'>
        <h1 className='mb-2 text-sm text-neutral-500 font-medium'>Search</h1>
        <Search/>
        <h1 className='mb-4 mt-6 text-sm text-neutral-500 font-medium'>Filter</h1>
        <div className='flex flex-col text-sm gap-2'>
            <label htmlFor="" className='flex items-center gap-2 cursor-pointer'>
                <input onChange={handleFilterChange} type="radio" name="sort" value="newest" className='appearance-none w-4 h-4 border-[1.5px] cursor-pointer rounded-sm checked:bg-foreground'/>
                <span>Newest</span>
            </label>
            <label htmlFor="" className='flex items-center gap-2 cursor-pointer'>
                <input onChange={handleFilterChange} type="radio" name="sort" value="popular" className='appearance-none w-4 h-4 border-[1.5px] cursor-pointer rounded-sm checked:bg-foreground'/>
                <span>Most Popular</span>
            </label>
            <label htmlFor="" className='flex items-center gap-2 cursor-pointer'>
                <input onChange={handleFilterChange} type="radio" name="sort" value="trending" className='appearance-none w-4 h-4 border-[1.5px] cursor-pointer rounded-sm checked:bg-foreground'/>
                <span>Trending</span>
            </label>
            <label htmlFor="" className='flex items-center gap-2 cursor-pointer'>
                <input onChange={handleFilterChange} type="radio" name="sort" value="oldest" className='appearance-none w-4 h-4 border-[1.5px] cursor-pointer rounded-sm checked:bg-foreground'/>
                <span>Oldest</span>
            </label>
        </div>
        <h1 className='mb-4 text-sm text-neutral-500 font-medium'>Categories</h1>
        <div className='flex flex-col gap-2 text-sm'>
            <span className='underline cursor-pointer' onClick={()=>handleCategoryChange("general")} >All</span>
            <span className='underline cursor-pointer' onClick={()=>handleCategoryChange("web-design")} >Web Design</span>
            <span className='underline cursor-pointer' onClick={()=>handleCategoryChange("development")} >Development</span>
            <span className='underline cursor-pointer' onClick={()=>handleCategoryChange("databases")} >Databases</span>
            <span className='underline cursor-pointer' onClick={()=>handleCategoryChange("seo")} >Search Engines</span>
            <span className='underline cursor-pointer' onClick={()=>handleCategoryChange("marketing")} >Marketing</span>
        </div>
    </div>
  )
}

export default SideMenu 