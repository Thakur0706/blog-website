import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from '@clerk/clerk-react';
import { Edit, MenuIcon, X, MessageCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { unreadCount } = useSocket();

    return (
        <div className='border border-gray-300 w-full mt-5 mb-5 md:h-20 h-16 rounded-2xl flex items-center justify-between px-5'>
            {/* logo */}
            <Link to="/" className='text-2xl font-bold flex items-center gap-4'>
                <span>Draft</span>
            </Link>
            {/* mobile menu */}
            <div className='md:hidden'>
                <div className='cursor-pointer' onClick={() => setOpen(!open)}>
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
                        {/* Messages link */}
                        <Link to="/chat" onClick={() => setOpen(false)} className="relative flex items-center gap-1">
                            <MessageCircle className="w-5 h-5" />
                            <span>Messages</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>
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
                    {/* Messages Icon with badge */}
                    <Link to="/chat" className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors">
                        <MessageCircle className="w-5 h-5 text-gray-700" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none animate-pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
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