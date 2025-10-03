import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './LazyImage.css';

const LazyImage = ({
  src,
  alt,
  className = '',
  style = {},
  placeholder = null,
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  return (
    <div
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={style}
      {...props}
    >
      {!isInView && placeholder && (
        <div className="lazy-image-placeholder">{placeholder}</div>
      )}

      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            ...style,
          }}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
        />
      )}

      {hasError && (
        <div className="lazy-image-error">
          <span>圖片載入失敗</span>
        </div>
      )}
    </div>
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  placeholder: PropTypes.node,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default React.memo(LazyImage);
