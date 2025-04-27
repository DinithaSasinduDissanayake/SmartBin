import React, { useEffect, useState } from 'react';
import './AnimatedComponents.css';

// Animated card component with hover effects and staggered animation
export const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`animated-card ${isVisible ? 'visible' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};

// Animated button with ripple effect
export const RippleButton = ({ children, className = '', ...props }) => {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 500);
    } else {
      setIsRippling(false);
    }
  }, [coords]);

  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    props.onClick && props.onClick(e);
  };

  return (
    <button
      className={`ripple-button ${className}`}
      onClick={handleClick}
      {...props}
    >
      {isRippling && (
        <span
          className="ripple"
          style={{
            left: coords.x,
            top: coords.y
          }}
        />
      )}
      <span className="content">{children}</span>
    </button>
  );
};

// Animated icon with hover effects
export const AnimatedIcon = ({ icon, className = '', ...props }) => {
  return (
    <div className={`animated-icon ${className}`} {...props}>
      {icon}
    </div>
  );
};

// Animated count that increments from 0
export const CountUp = ({ end, duration = 2000, className = '', ...props }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return (
    <span className={`count-up ${className}`} {...props}>
      {count}
    </span>
  );
};

// Animated progress bar
export const ProgressBar = ({ progress, className = '', ...props }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setWidth(0);
    setTimeout(() => setWidth(progress), 50);
  }, [progress]);
  
  return (
    <div className={`progress-container ${className}`} {...props}>
      <div 
        className="progress-bar"
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

// Fade in element on mount
export const FadeIn = ({ children, delay = 0, duration = 500, className = '', ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`fade-in ${isVisible ? 'visible' : ''} ${className}`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Animated notification badge
export const NotificationBadge = ({ count = 0, className = '', ...props }) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    if (count > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);
  
  if (count === 0) return null;
  
  return (
    <span className={`notification-badge ${animate ? 'pulse' : ''} ${className}`} {...props}>
      {count}
    </span>
  );
};