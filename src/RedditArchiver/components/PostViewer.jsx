import { useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { make_request } from 'RedditArchiver/util/request.jsx';
import { unix2str, htmlDecode } from 'RedditArchiver/util/convert.jsx';
import Gallery from 'RedditArchiver/components/Gallery.jsx';


// Grabs post and comment JSON
export async function loader({ params }) {
  const base = "https://buhao.jp/dropbox/reddit/archive/"
    + params.subreddit + "/"
    + params.postid + "/";

  const post_url = base + "post-" + String(params.revisions).padStart(4, "0") + ".json";

  const comment_url = base + "comments-" + String(params.revisions).padStart(4, "0") + ".json";

  const postReq = await make_request("GET", post_url);
  const postJson = JSON.parse(postReq.response);


  let commentsJson = await make_request("GET", comment_url)
                      .then(req => JSON.parse(req.response))
                      .catch(rej => undefined);

  const revisions = params.revisions;
  return { postJson, commentsJson, base, revisions};
}

function getImageURL(url, base_url, revisions) {
  const url_parts = url.split('/');
  const filename = url_parts[url_parts.length - 1];
  const filebase = filename.substring(0, filename.lastIndexOf('.'));
  const extension = filename.split('.')[1];
  const img_url = base_url + filebase + "-0000." + extension;
  return img_url;
}

function PostHeader({ data, base_url, revisions }) {

  let media = [];
  if (data.url.includes("https://i.redd.it")) {
    media.push(getImageURL(data.url, base_url, revisions));
  }

  if (data.url.includes("https://v.redd.it")) {
    const url = data.media.reddit_video.fallback_url;
    const path = url.split("https://v.redd.it/")[1];
    const filebase = path.split(".")[0].replace("/", "-");
    const ext = path.split(".")[1].split("?")[0];
    media.push(base_url
      + filebase + "-"
      + String(revisions).padStart(4, "0") + "." + ext
    );
  }

  if (data.url.includes("https://www.reddit.com/gallery/")) {
    const gallery_items = data.gallery_data.items;
    const gallery_meta = data.media_metadata;

    for (var i = 0; i < gallery_items.length; ++i) {
      const item = gallery_items[i];
      media.push(base_url
        + String(i).padStart(4, "0") + "-"
        + item.media_id + "-"
        + String(revisions).padStart(4, "0") + "."
        + gallery_meta[item.media_id].m.split('/')[1]
      )
    }
  }

  return (
    <div>
      <article className="post-head">
        <h2 className="post-title">
          <a href={"https://www.reddit.com/r/" + data.subreddit + "/comments/" + data.id + "/"}
             dangerouslySetInnerHTML={{__html: htmlDecode(data.title)}}>
          </a>
        </h2>
        <p className="post-content"
           dangerouslySetInnerHTML={{__html: htmlDecode(data.selftext_html)}}></p>
        {media.length > 0 && <Gallery urls={media} />}
        <p className="post-stats">
          Score: {data.score}&nbsp;&nbsp;
          Submitter: u/{data.author}&nbsp;&nbsp;
          Subreddit: r/{data.subreddit}&nbsp;&nbsp;
          Post ID: {data.id}&nbsp;&nbsp;
          Date: {unix2str(data.created)}
        </p>
      </article>
    </div>
  )
}

/*
function PostComment({ root, data }) {

  function iterate_linear(root) {
    let more_comments = [];
    root.data.children.map((more_child_id_str) => {

      const comment_json = data[more_child_id_str];

      if (comment_json === undefined)
        return;

      more_comments.push(
        <div className="comment-box" key={comment_json.id}>
          <p><i>u/{comment_json.author}</i>&nbsp;&nbsp;Score: {comment_json.score}</p>
          <p
            dangerouslySetInnerHTML={{__html: comment_json.body}}>
          </p>
        </div>
      );
    });

    return more_comments;
  }


  if (Object.keys(data).length == 0) {
    return (
      <div className="comment-box" key={root.data.id}>
        <p><i>u/{root.data.author}</i>&nbsp;&nbsp;Score: {root.data.score}</p>
        <p
          dangerouslySetInnerHTML={{__html: htmlDecode(root.data.body)}}>
        </p>
  
        {root.data.replies &&
          root.data.replies.data.children.map((child) =>
            <PostComment root={child} data={data} />
          )
        }
      </div>
    )
  }


  if (root.data.id === "ls357jn") {
    console.log(root.data);
  }


  if (root.kind === "more") {
    return iterate_linear(root);
  }


  return (
    <div className="comment-box" key={root.data.id}>
      <p><i>u/{root.data.author}</i>&nbsp;&nbsp;Score: {root.data.score}&nbsp;&nbsp;ID: {root.data.id}</p>
      <p
        dangerouslySetInnerHTML={{__html: data[root.data.id].body}}>
      </p>

      {root.data.replies &&
        root.data.replies.data.children.map((child) => {
          if (child.kind === "more") {
            return iterate_linear(child);
          } else {
            return <PostComment root={child} data={data} />
          }
        })
      }
    </div>
  )
}
*/

/*
function PostComment({ root, data }) {
  if (Object.keys(data).length == 0) {
    return (
      <div className="comment-box" key={root.data.id}>
        <p><i>u/{root.data.author}</i>&nbsp;&nbsp;Score: {root.data.score}</p>
        <p
          dangerouslySetInnerHTML={{__html: htmlDecode(root.data.body)}}>
        </p>
  
        {root.data.replies &&
          root.data.replies.data.children.map((child) =>
            <PostComment root={child} data={data} />
          )
        }
      </div>
    )
  }

  return (
    <div className="comment-box" key={root.data.id}>
      <p><i>u/{root.data.author}</i>&nbsp;&nbsp;Score: {root.data.score}</p>
      <p
        dangerouslySetInnerHTML={{__html: htmlDecode(root.data.body)}}>
      </p>

      {root.data.replies &&
        root.data.replies.data.children.map((child) =>
          <PostComment root={child} data={data} />
        )
      }
    </div>
  )
}
*/

function PostCommentOld({ root }) {
  return (
    <div className="comment-box" key={root.data.id}>
      <p><i>u/{root.data.author}</i>&nbsp;&nbsp;Score: {root.data.score}</p>
      <p
        dangerouslySetInnerHTML={{__html: htmlDecode(root.data.body_html)}}>
      </p>

      {root.data.replies &&
        root.data.replies.data.children.map((child) =>
          <PostCommentOld root={child} />
        )
      }
    </div>
  )
}
function PostCommentNew({ root }) {
  return (
    <div className="comment-box" key={root.id}>
      <p><i>u/{root.author}</i>&nbsp;&nbsp;Score: {root.score}</p>
      <p
        dangerouslySetInnerHTML={{__html: root.body}}>
      </p>

      {root.children.map((child) =>
          <PostCommentNew root={child} />
        )
      }
    </div>
  )
}

function PostComments({ postcomments_json, comment_json }) {
  return (
    <div className="comments-root">
      <h2>Comments</h2>
        {comment_json === undefined ? (
          postcomments_json.map((child) => <PostCommentOld root={child} />)
        ) : (
          comment_json.map((child) => <PostCommentNew root={child} />)
        )
        }
    </div>
  )
}

export default function PostViewer() {
  const { postJson, commentsJson, base, revisions } = useLoaderData();

  const j_header = postJson[0].data.children[0].data;
  const j_comments_meta = postJson[1].data.children;
  

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  // <PostComments meta={j_comments_meta} data={commentsJson} />
  return (
    <div>
      <PostHeader data={j_header} base_url={base} revisions={revisions} />
      <PostComments postcomments_json={j_comments_meta} comment_json={commentsJson} />
    </div>
  );
}