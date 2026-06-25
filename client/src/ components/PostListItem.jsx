import React from 'react'
import Image from './CustomImage'
import { Link } from 'react-router-dom'
import {format} from 'timeago.js'
import { ArrowRight } from 'lucide-react'

const PostListItem = ({ post }) => {
  return (
    <div className='flex flex-col md:flex-row gap-4 mb-4 '>
        <div className='md:hidden lg:block xl:w-1/3'>
            {post.img && <Image className='rounded-2xl border border-gray-200 object-cover w-full aspect-video' urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} src={post.img} loading="lazy" alt="Logo" transformation={[{width: 735}]} lqip={{active: true, quality: 20}}/>}
        </div>
        <div className={`flex flex-col gap-4 xl:w-2/3 ${post.img ? '' : 'w-full'}`}>
            <Link to={`/${post.slug}`} className='font-medium hover:underline text-lg font-semibold md:text-2xl capitalize'>{post.title}</Link>
            <div className='flex items-center gap-2 text-xs text-neutral-500'>
                <span>by</span>
                <Link className='hover:underline' to={`/posts?author=${post.user?.username}`} >{post.user?.username || "Unknown"}</Link>
                <span>on</span>
                <Link to={`/posts?cat=${post.category}`}  className='hover:underline'>{post.category}</Link>
                <span>{format(post.createdAt)}</span>
            </div>
            <p className='text-xs md:text-sm'>{post.desc}</p>
            <Link to={`/${post.slug}`} className='text-xs md:text-sm text-neutral-500 hover:underline flex items-center gap-2'>Read More <span><ArrowRight size={16}/></span></Link>
        </div>
    </div>
  )
}

export default PostListItem 