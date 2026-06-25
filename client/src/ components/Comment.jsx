import React from 'react'
import { Image } from '@imagekit/react';
import { format } from 'timeago.js';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios';
import { toast } from 'react-toastify';

const Comment = ({ comment, postId }) => {

  const { user } = useUser()
  const { getToken } = useAuth()
  const role = user?.publicMetadata?.role || user?.publicMetadata?.metadata?.role || user?.publicMetadata?.metadata?.metadata?.role || 'user'

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return axios.delete(`${import.meta.env.VITE_API_URL}/comments/${comment._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      toast.success("Comment deleted successfully")
    },

    onError: (error) => {
      toast.error("Error adding comment: " + error.message)
    }
  })

  return (
    <div className="p-4 bg-white border border-gray-300 shadow-sm rounded-xl mb-8">
      <div className="flex items-center gap-4">
        {comment.user?.img && <img
          src={comment.user.img}
          className="w-10 h-10 rounded-full object-cover"
        />}
        <span className="font-medium">{comment.user?.username}</span>
        <span className="text-xs text-gray-500">
          {format(comment.createdAt)}
        </span>
        {user && (comment.user?.clerkId === user.id || comment.user?.username === user.username || role === 'admin') && (
          <span onClick={() => mutation.mutate()} className="ml-auto text-xs text-red-500 hover:underline hover:text-red-600 cursor-pointer">Delete
            {mutation.isPending && (<span className="text-xs">(Deleting...)</span>
            )}
          </span>

        )}
      </div>
      <div className="mt-4">
        <p>{comment.desc}</p>
      </div>
    </div>
  );
}

export default Comment