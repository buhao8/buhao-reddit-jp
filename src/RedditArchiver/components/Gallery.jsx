import { useState } from 'react';

export default function Gallery({ urls }) {
  const [currentNo, setCurrentNo] = useState(0);
  const [vidUrl, setVidUrl] = useState(null);

  // https://stackoverflow.com/a/67465139/2085182
  async function video_stream(url) {
    const vid_parts = url.split('-');
    const vid_id_and_prefix = vid_parts[0];
    const revision_with_ext = vid_parts[2];

    const fetching = Promise.all([
      // the video "only" file
      fetchData(url),
      // the audio "only" file
      fetchData(vid_id_and_prefix + "-audio-" + revision_with_ext)
    ]);

    const video_mime = 'video/mp4; codecs="avc1.42E01E"';
    const audio_mime = 'audio/mp4; codecs="mp4a.40.2"';
    if(
      !MediaSource.isTypeSupported(video_mime) ||
      !MediaSource.isTypeSupported(audio_mime)
    ) {
      throw "unsupported codecs";
    }

    const source = new MediaSource();
    setVidUrl(URL.createObjectURL(source));
    await waitForEvent(source, "sourceopen");

    const [ video_data, audio_data ] = await fetching;

    const video_buffer = source.addSourceBuffer(video_mime);
    const audio_buffer = audio_data.length ? source.addSourceBuffer(audio_mime) : null;

    if (audio_buffer)
      audio_buffer.mode = "sequence";
    video_buffer.mode = "sequence";

    // There is a 'variable' limit as to how much
    // data we can append in on go, 10MB seems quite safe
    const chunk_size = 10 * 1024 * 1024;
    let i = 0;
    while (
      i < video_data.length &&
      (audio_data.length ? i < audio_data.length : true)
    ) {
      const next_i = i + chunk_size;
      const events = Promise.all( [
        waitForEvent(video_buffer, "updateend"),
        (audio_data.length ? waitForEvent(audio_buffer, "updateend") : waitTrue)
      ] );
      video_buffer.appendBuffer(video_data.subarray(i, next_i));
      if (audio_data.length)
        audio_buffer.appendBuffer(audio_data.subarray(i, next_i));
      await events;
      i = next_i;
    }

    source.endOfStream();
  }

  function fetchData( url ) {
    return fetch(url, {'credentials': 'include'})
      .then((resp) => resp.ok && resp.arrayBuffer()).catch(() => null)
      // we return an Uint8 view to be able to do a zero-cost subarray()
      .then((buf) => new Uint8Array(buf));
  }
  function waitForEvent(target, event_name) {
    return new Promise((res) => {
      target.addEventListener(event_name, res, { once: true });
    });
  }
  function waitTrue() {
    return new Promise(() => resolve(true));
  }

  return (
    <div className="gallery-view">
      {urls.map((url) => {
        const parts = url.split(".");
        if (parts[parts.length - 1] !== "mp4") {
          return <img key={url} src={url} height="400px" />
        }

        if (vidUrl === null) {
          video_stream(url).catch(console.error);
        }

        return (
          <video height="600px" controls id="post-video">
            <source src={vidUrl} type="video/mp4" />
          </video>
        )
      })}
    </div>
  )
}