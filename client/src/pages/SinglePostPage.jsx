import Image from '../ components/CustomImage'
import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PostMenuActions from '../ components/PostMenuActions'
import Search from '../ components/Search'
import Comments from '../ components/Comments'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'timeago.js'
import SharePostModal from '../ components/SharePostModal'
import { SignedIn } from '@clerk/clerk-react'
import { Send } from 'lucide-react'

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;

}

const SinglePostPage = () => {
  const [showShareModal, setShowShareModal] = useState(false);

  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPost(slug)
  })

  if (isPending) return <div>Loading...</div>

  if (error) return <div>Error loading post: {error.message}</div>

  if (!data) return <div>No post found</div>

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex gap-8'>
        <div className='lg:w-3/5 flex flex-col gap-8'>
          <h1 className='text-xl md:text-3xl lg:text-4xl font-semibold'>{data.title}</h1>
          <div className='flex items-center gap-2 text-xs text-neutral-400 font-medium'>
            <span>Written by</span>
            <Link className='hover:underline hover:text-neutral-600'>{data.user?.username || "Unknown"}</Link>
            <span>on</span>
            <Link to={`/posts?cat=${data.category}`} className='hover:underline hover:text-neutral-600'>{data.category}</Link>
            <span>{format(data.createdAt)}</span>
          </div>
          <div className='border-l-4 border-gray-200 pl-4 my-4'>
          <p className='text-neutral-600 text-md'>{data.desc}</p>

          </div>
        </div>
        {data.img && <div className='hidden lg:block w-2/5 border border-gray-200 rounded-2xl overflow-hidden'>
          <Image urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} loading="lazy" alt="Logo" src={data.img} width={600} className='rounded-2xl object-cover' />
        </div>}
      </div>
      {/* content */}
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* text */}
        <div className=' lg:w-3/5 lg:text-lg text-neutral-700 space-y-4 text-justify prose max-w-none wrap-break-word'>
          <div className='w-full overflow-hidden' dangerouslySetInnerHTML={{ __html: data.content }}></div>
        </div>
        {/* menu */}
        <div className="lg:w-2/5 px-4 h-max sticky top-8 self-start">
          <h1 className="mb-4 text-sm font-medium">Author</h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {data.user.img && <Image
                urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
                src={data.user.img}
                className='w-12 h-12 rounded-full object-cover'
                w="48"
                h="48"
                transformation={[{ width: 48, height: 48 }]}
              />}
              <Link className="text-neutral-600 font-medium">{data.user.username}</Link>
            </div>
            <p className="text-xs text-neutral-500">
              Lorem ipsum dolor sit amet consectetur
            </p>
            <div className="flex gap-2 items-center">
              <Link>
                <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs'>FB</div>
              </Link>
              <Link>
                <div className='w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-xs'>X</div>
              </Link>
              <SignedIn>
                <button
                  onClick={() => setShowShareModal(true)}
                  className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity'
                  title="Send post in chat"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </SignedIn>
            </div>
          </div>
          <PostMenuActions post={data} />
          <h1 className='mt-4 mb-2 text-sm font-medium'>Categories</h1>
          <div className="flex flex-col gap-2 mt-2 text-xs">
            <Link to={"/posts"} className='hover:underline hover:text-neutral-600'>All</Link>
            <Link to={"/posts?cat=web-design"} className='hover:underline hover:text-neutral-600'>Web Design</Link>
            <Link to={"/posts?cat=development"} className='hover:underline hover:text-neutral-600'>Web Development</Link>
            <Link to={"/posts?cat=seo"} className='hover:underline hover:text-neutral-600'>Search Engine</Link>
            <Link to={"/posts?cat=marketing"} className='hover:underline hover:text-neutral-600'>Marketing</Link>
          </div>
          <h1 className='mt-4 mb-2 text-sm font-medium'>Search</h1>
          <Search />
        </div>
      </div>
      <Comments postId={data._id} />
      {showShareModal && (
        <SharePostModal post={data} onClose={() => setShowShareModal(false)} />
      )}
    </div>


  )
}

export default SinglePostPage