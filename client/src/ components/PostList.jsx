import React from 'react'
import PostListItem from './PostListItem'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSearchParams } from 'react-router-dom'


import { useAuth } from '@clerk/clerk-react'

const fetchPosts = async (pageParam, searchParams, getToken) => {
  const searchParamsObj = Object.fromEntries([...searchParams])
  const token = await getToken();
  
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
    params: { page: pageParam, limit: 10, ...searchParamsObj },
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return res.data;
};

const PostList = (pageParam) => {

  const [searchParams, setSearchParams] = useSearchParams()
  const { getToken } = useAuth();

  // infinite scroll implementation

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts', searchParams.toString()],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams, getToken),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => lastPage.hasMore ? pages.length + 1 : undefined,
  })

  if (status === 'loading') return 'Loading...'

  if (status === 'error') return 'something went wrong: ' + error.message

  const allPosts = data?.pages?.flatMap(page => page.posts) || [];

  if (allPosts.length === 0) return "No posts found"

  return (
    // <div className='flex flex-col gap-4 mb-8'>
    //   {allPosts.map((post) => (
    //     <PostListItem key={post._id} post={post} />
    //   ))}

    // </div>
    <InfiniteScroll
      dataLength={allPosts.length} //This is important field to render the next data
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading More Posts...</h4>}
      endMessage={
        <p style={{ textAlign: 'center' }}>
          <b>Yay! You have seen it all</b>
        </p>
      }
    >
      {allPosts.map((post) => (
        <PostListItem key={post._id} post={post} />
      ))}

    </InfiniteScroll>
  )
}

export default PostList