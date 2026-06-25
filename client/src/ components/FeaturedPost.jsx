import Image from './CustomImage'
import axios from 'axios';
import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import { format } from 'timeago.js';
const fetchPost = async ()=>{
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts?featured=true&limit=4&sort=newest`);
  return res.data;

}
const FeaturedPost = () => {

     const {isPending, error, data}= useQuery({
        queryKey: ['featuredPosts'],
        queryFn: () =>fetchPost()
      })
    
      if(isPending) return <div>Loading...</div>
    
      if(error) return <div>Error loading post: {error.message}</div>

      const post = data.posts
    
      if(!post || post.length === 0 ) return 

    return (
        <div className='mt-8 flex flex-col lg:flex-row gap-8'>
            {/* first post */}
            <div className='w-full lg:w-1/2 flex flex-col gap-4'>
                {/* iamge */}
                {post[0].img && <Image className='rounded-3xl object-cover' urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} loading="lazy" alt="Logo" src={post[0].img} transformation={[{width: 895}]} lqip={{active: true, quality: 20}} />}
                {/* details */}
                <div className='flex items-center gap-4'>
                    <h1 className='font-semibold lg:text-lg'>01.</h1>
                    <Link to={`/posts?cat=${post[0].category}`}  className='text-neutral-400 text-sm hover:underline hover:text-neutral-600'>{post[0].category}</Link>
                    <span className='text-neutral-400 text-sm tracking-tight'>{format(post[0].createdAt)}</span>
                </div>
                {/* title */}
                <Link to={`/${post[0].slug}`} className='font-semibold text-lg md:text-2xl capitalize hover:underline '>{post[0].title}</Link>
            </div>
            {/* other posts */}
            <div className='w-full lg:w-1/2 flex flex-col gap-4'>
                {/* second  */}
                {post[1] && <div className='lg:h-1/3 flex justify-between gap-4'>
                    {post[1].img && <Image src={post[1].img} className='rounded-3xl object-cover w-1/2 lg:w-1/3 aspect-video' urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} loading="lazy" alt="Logo" transformation={[{width: 298}]} />}
                    <div className='w-2/3'>
                        <div className='flex items-center text-sm gap-4 lg:text-base mb-2'>
                            <h1 className='font-semibold md:text-lg'>02.</h1>
                            <Link to={`/posts?cat=${post[1].category}`}  className='text-neutral-400 text-sm hover:underline hover:text-neutral-600'>{post[1].category}</Link>
                            <span className='text-neutral-400 text-sm tracking-tight'>{format(post[1].createdAt)}</span>
                        </div>
                        <Link to={`/${post[1].slug}`} className='text-base sm:text-lg font-semibold capitalize hover:underline'>{post[1].title}</Link>
                    </div>
                </div>}
                {/* third */}
                {post[2] && <div className='lg:h-1/3 flex justify-between gap-4'>
                    {post[2].img && <Image src={post[2].img} className='rounded-3xl object-cover w-1/2 lg:w-1/3 aspect-video' urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} loading="lazy" alt="Logo" transformation={[{width: 298}]} />}
                    <div className='w-2/3'>
                        <div className='flex items-center text-sm gap-4 lg:text-base mb-2'>
                            <h1 className='font-semibold md:text-lg'>03.</h1>
                            <Link className='text-neutral-400 text-sm hover:underline hover:text-neutral-600'>{post[2].category}</Link>
                            <span className='text-neutral-400 text-sm tracking-tight'>{format(post[2].createdAt)}</span>
                        </div>
                        <Link to={`/${post[2].slug}`} className='text-base sm:text-lg font-semibold capitalize hover:underline'>{post[2].title}</Link>
                    </div>
                </div>}
                {/* fourth */}
                {post[3] && <div className='lg:h-1/3 flex justify-between gap-4'>
                    {post[3].img && <Image src={post[3].img} className='rounded-3xl object-cover w-1/2 lg:w-1/3 aspect-video' urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} loading="lazy" alt="Logo" transformation={[{width: 298}]} />}
                    <div className='w-2/3'>
                        <div className='flex items-center text-sm gap-4 lg:text-base mb-2'>
                            <h1 className='font-semibold md:text-lg'>04.</h1>
                            <Link className='text-neutral-400 text-sm hover:underline hover:text-neutral-600'>{post[3].category}</Link>
                            <span className='text-neutral-400 text-sm tracking-tight'>{format(post[3].createdAt)}</span>
                        </div>
                        <Link to={`/${post[3].slug}`} className='text-base sm:text-lg font-semibold capitalize hover:underline'>{post[3].title}</Link>
                    </div>
                </div>}
                
            </div>
        </div>
    )
}

export default FeaturedPost