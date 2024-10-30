import { useState } from 'react';

export default function Gallery({ urls }) {
  const [currentNo, setCurrentNo] = useState(0);

  return (
    <div className="gallery-view">
      {urls.map((url) => {
        const parts = url.split(".");
        if (parts[parts.length - 1] !== "mp4") {
          return <img key={url} src={url} height="400px" />
        }
        return (
          <video height="600px" controls>
            <source src={url} type="video/mp4" />
          </video>
        );
      })}
    </div>
  )
}