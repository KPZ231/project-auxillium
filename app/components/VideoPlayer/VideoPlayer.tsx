'use client'

import React from 'react'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
    src: string;
}

export default function VideoPlayer({src} : VideoPlayerProps){
    return(
        <>
            <div className="w-full px-6 lg:px-12 pt-6">
                <div className='max-w-7xl p-2 mx-auto aspect-video mt-10'>
                    <ReactPlayer src={src} playsInline={true} controls={false} width={"100%"} height={"100%"} />
                </div>
            </div>
        </>
    );
}