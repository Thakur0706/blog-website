import React, { useEffect, useRef, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import 'react-quill-new/dist/quill.snow.css'
import ReactQuill from 'react-quill-new';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { IKContext, IKUpload } from 'imagekitio-react';
import Upload from '../ components/Upload';
import { parse } from 'marked'


const Write = () => {
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [value, setValue] = useState("")
  const [cover, setCover] = useState("")
  const [img, setImg] = useState("")
  const [video, setVideo] = useState("")
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    img && setValue(prev => prev + `<p><img src="${img.url}" alt="image" /></p>`)
  }, [img])

  useEffect(() => {
    video && setValue(prev => prev + `<p><iframe class="ql-video" src="${video.url}" alt="video" /></p>`)
  }, [video])


  // for adding the new post we need to be authenticated first
  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const token = await getToken()
      return axios.post(`${import.meta.env.VITE_API_URL}/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    },
    onSuccess: (res) => {
      toast.success("Post created successfully")
      navigate(`/${res.data.slug}`)
    }
  })

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (isLoaded && !isSignedIn) {
    return <div>Unauthorized! Please sign in to write a blog.</div>
  }

  async function generateContent() {
    try {
      if (!title.trim()) {
        toast.error("Please enter a title first")
        return
      }
      setLoading(true)
      const token = await getToken()
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/posts/generate`, { prompt: title }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (data.success) {
        setValue(parse(data.response))
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message || "Failed to generate content")

    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault() // prevent page reload

    if (!cover.filePath) {
      toast.error("Please upload a cover image")
      return
    }

    // now using the form data to get all the values through the name attribute
    const formData = new FormData(e.target)
    const data = {
      img: cover.filePath || "",
      title: formData.get('title'),
      category: formData.get('category'),
      desc: formData.get('desc'),
      content: value
    }

    // now we can call the mutation to create a new post
    // this will help in adding the new post to the database
    mutation.mutate(data)
  }




  return (
    <div className='h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-4'>
      <h1 className='text-xl font-bold'>Create Post</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 flex-1 mb-6 '>
        <Upload type="image" setProgress={setProgress} setData={setCover} >
          <button type='button' className='w-max p-2 rounded-2xl border-dashed border bg-neutral-100 text-sm shadow-md overflow-hidden cursor-pointer'>{cover.name ? cover.name : 'Add Cover Image'}</button>
        </Upload>
        {/* {cover && <img src={cover.url} alt="cover" className='size-1/3' />} */}
        <input type="text" placeholder='Title' name="title" value={title} onChange={(e) => setTitle(e.target.value)} className='text-4xl font-semibold outline-none bg-transparent' required />
        <div className='flex items-center gap-2 text-sm'>
          <label htmlFor="">Choose a category: </label>
          <select name="category" id="" className='bg-neutral-100 p-2 rounded-xl shadow-md border border-dashed outline-none'>
            <option value="general">General</option>
            <option value="web-design">Web Design</option>
            <option value="development">Development</option>
            <option value="databases">Databases</option>
            <option value="seo">Search Engine Optimization</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
        <textarea name="desc" placeholder='Write your story' className='bg-gray-100 outline-none p-4 rounded-xl shadow-md' required />
        <div className='flex flex-1 relative'>
          <div className='flex flex-col gap-2 mr-2'>
            {/* <div className='cursor-pointer'>🌇</div>
            <div className='cursor-pointer'>▶️</div> */}
            <Upload type="image" setProgress={setProgress} setData={setImg} className="cursor-pointer" >
              🌇
            </Upload>
            <Upload type="video" setProgress={setProgress} setData={setVideo} className="cursor-pointer" >
              ▶️
            </Upload>
          </div>
          <ReactQuill placeholder='Write your story or generate with AI' theme="snow" value={value} onChange={setValue} className='flex-1 relative rounded-xl bg-white shadow-lg' readOnly={progress > 0 && progress < 100} />
          <button disabled={loading} onClick={generateContent} type='button' className='absolute bottom-2 right-2 bg-neutral-200 text-neutral-900 px-4 py-2 rounded-md font-medium mt-2 w-40 active:scale-99 text-xs disabled:opacity-50 disabled:cursor-not-allowed'>{loading ? "Generating..." : "Generate with AI"}</button>
        </div>

        <button disabled={mutation.isPending || (progress > 0 && progress < 100)} className='bg-foreground text-background px-4 py-2 rounded-xl font-medium mt-2 w-36 disabled:opacity-50 disabled:cursor-not-allowed'>
          {mutation.isPending ? "Loading..." : "Post"}
        </button>
        {"Progress:" + progress + "%"}
        {/* {mutation.isError && <span>{mutation.error.message}</span>} */}
      </form>
    </div>
  )
}

export default Write