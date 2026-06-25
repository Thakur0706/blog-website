import { Image } from '@imagekit/react';
import React from 'react';

const CustomImage = ({ src, className, transformation, lqip, alt, width, w, h }) => {
  if (src && src.startsWith('http') && !src.includes('ik.imagekit.io')) {
    return <img src={src} className={className} alt={alt} width={width} />;
  }
  return (
    <Image 
      src={src} 
      className={className} 
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT} 
      loading="lazy" 
      alt={alt} 
      transformation={transformation} 
      lqip={lqip} 
      width={width}
      w={w}
      h={h}
    />
  );
};

export default CustomImage;
