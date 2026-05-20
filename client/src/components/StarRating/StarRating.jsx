import { useState } from 'react';
import './StarRating.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import { faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';

function StarRating({ value = 0, onChange }) {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue ?? value;

  const getIcon = (i) => {
    if (displayValue >= i + 1) return solidStar;
    if (displayValue >= i + 0.5) return faStarHalfStroke;
    return regularStar;
  };

  const handleMove = (e, i) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const isLeftSide = x < rect.width / 2;

    const val = isLeftSide ? i + 0.5 : i + 1;
    setHoverValue(val);
  };

  const handleClick = (e, i) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const isLeftSide = x < rect.width / 2;

    const val = isLeftSide ? i + 0.5 : i + 1;

    onChange?.(val);
  };

  return (
    <div className="star-container">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="star-wrapper"
          onMouseLeave={() => setHoverValue(null)}
          onMouseMove={(e) => handleMove(e, i)}
          onClick={(e) => handleClick(e, i)}
        >
          <FontAwesomeIcon icon={getIcon(i)} />
        </div>
      ))}
    </div>
  );
}

export default StarRating;