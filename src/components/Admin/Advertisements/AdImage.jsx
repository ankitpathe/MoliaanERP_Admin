import React, { useState, useEffect } from 'react';
import { getImage } from '../../../utils/imageStorage';

export default function AdImage({ ad, style, className, alt }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const load = async () => {
      if (ad && ad.imageStorageType === 'indexeddb' && ad.imageId) {
        try {
          const blob = await getImage(ad.imageId);
          if (blob && active) {
            objectUrl = URL.createObjectURL(blob);
            setSrc(objectUrl);
          } else if (active) {
            setSrc('');
          }
        } catch (e) {
          console.error('Failed to load image from IndexedDB:', e);
          if (active) setSrc('');
        }
      } else {
        setSrc((ad && ad.imageUrl) || '');
      }
    };

    load();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [ad]);

  if (!src) {
    return <div style={{ ...style, background: '#f1f5f9' }} className={className} />;
  }

  return <img src={src} style={style} className={className} alt={alt} />;
}
