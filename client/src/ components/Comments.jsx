import React from 'react'
import Comment from './Comment'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/clerk-react'
import { toast } from 'react-toastify';
import { useState } from 'react';

const fetchComments = async (postId) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/comments/${postId}`);
  return res.data;

}

const Comments = ({ postId }) => {
  const {user} = useUser()
  const { getToken } = useAuth()
  const [desc, setDesc] = useState("")

  const { isPending, error, data } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId)
  })


  // it allows us to invalidate and refetch queries
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newComment) => {
      const token = await getToken()
      return axios.post(`${import.meta.env.VITE_API_URL}/comments/${postId}`, newComment, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      setDesc("")
    },

    onError: (error) => {
      toast.error("Error adding comment: " + error.message)
    }
  })

  // if (isPending) return <div>Loading...</div>

  // if (error) return <div>Error loading post: {error.message}</div>

  // if(!data) return <div>Comments not found</div>

  const handleSubmit = (e)=>{
    e.preventDefault()
    // const formData = new FormData(e.target)

    // const data = {
    //   desc:formData.get("desc")
    // }

    // // call the mutation to add the comment
    // mutation.mutate(data)
    mutation.mutate({desc})
  }

  return (
    <div className='flex flex-col gap-8 lg:w-3/5'>
      <h1 className='text-xl font-semibold text-neutral-600 underline'>Comments</h1>
      <form onSubmit={handleSubmit} className='flex items-center justify-between gap-2 w-full'>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} name="desc" placeholder='Write a comment...' className='w-full px-4 py-2 rounded-xl bg-white border border-gray-300' />
        <button type='submit' className='bg-foreground text-background px-2 py-1 rounded-md font-medium'>Send</button>
      </form>
      <div className='flex flex-col gap-2 mt-4'>
        {isPending ? <div>Loading...</div> : error ? "Error loading comments" : 
        <>
        {
          mutation.isPending && (
            <Comment comment={{
              desc:`${mutation.variables.desc} (Sending...)`,
              createdAt:new Date(),
              user:{
                img:user.imageUrl,
                username:user.username
              }
            }}/>
          )
        }

        {data.map((comment) => (
          <Comment key={comment._id} comment={comment} postId={postId} />
        ))}
        </>
}
      </div>
    </div>
  )
}

export default Comments