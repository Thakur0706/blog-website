import React, { useState, useEffect } from 'react'
import { Image } from '@imagekit/react';
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from '@clerk/clerk-react';
import { Edit, MenuIcon, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom';
const Navbar = () => {
    const [open, setOpen] = useState(false)
    const { getToken } = useAuth();
    const navigate = useNavigate();

    return (
        <div className='border border-gray-300 w-full mt-5 mb-5 md:h-20 h-16 rounded-2xl flex items-center justify-between px-5'>
            {/* logo */}
            <Link to="/" className='text-2xl font-bold flex items-center gap-4'>
                {/* <Image urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} className='w-8 h-8 rounded-full' loading="lazy" alt="Logo" src="/ISAGI YOICHI.jpeg" /> */}
                <span>Draft</span>
            </Link>
            {/* mobile menu */}
            <div className='md:hidden'>
                <div className='cursor-pointer' onClick={() => setOpen(!open)}>
                    {/* Only show hamburger here, close button will be inside the menu */}
                    <MenuIcon />
                </div>
                {/* mobile list items */}
                <div className={`w-full h-screen fixed top-0 flex flex-col items-center justify-center gap-8 bg-background transition-all duration-300 ease-in-out z-50 ${open ? 'right-0' : '-right-full'}`}>
                    <div className='absolute top-5 right-5 cursor-pointer' onClick={() => setOpen(false)}>
                        <X />
                    </div>
                    <Link to="/" onClick={() => setOpen(false)}>Home</Link>
                    <Link to="/posts?sort=trending" onClick={() => setOpen(false)}>Trending</Link>
                    <Link to="/posts?sort=popular" onClick={() => setOpen(false)}>Most Popular</Link>
                    <Link to="/" onClick={() => setOpen(false)}>About</Link>
                    <SignedOut>
                    <Link to="/login">
                        <button className='bg-primary text-primary-foreground px-5 py-2 rounded-2xl'>Login 👋</button>
                    </Link>
                </SignedOut>
                <SignedIn>
                    <Link to="/posts?saved=true" onClick={() => setOpen(false)}>Saved</Link>
                    {/* <UserButton /> */}
                    <UserButton showName={true}>
                        <UserButton.MenuItems>
                            <UserButton.Action
                                label="Write"
                                labelIcon={<Edit size={20} />}
                                onClick={() => navigate('/write')}
                            />
                        </UserButton.MenuItems>
                    </UserButton>
                </SignedIn>
                </div>
            </div>
            {/* desktop menu */}
            <div className='hidden md:flex items-center gap-5'>
                <Link to="/">Home</Link>
                <Link to="/posts?sort=trending">Trending</Link>
                <Link to="/posts?sort=popular">Most Popular</Link>
                <Link to="/">About</Link>
                <SignedOut>
                    <Link to="/login">
                        <button className='bg-primary text-primary-foreground px-5 py-2 rounded-2xl'>Login 👋</button>
                    </Link>
                </SignedOut>
                <SignedIn>
                    <Link to="/posts?saved=true">Saved</Link>
                    {/* <UserButton /> */}
                    <UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action
                                label="Write"
                                labelIcon={<Edit size={20} />}
                                onClick={() => navigate('/write')}
                            />
                        </UserButton.MenuItems>
                    </UserButton>
                </SignedIn>
            </div>
        </div>
    )
}

export default Navbar