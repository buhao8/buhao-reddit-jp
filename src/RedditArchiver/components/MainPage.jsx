import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { make_request } from 'RedditArchiver/util/request';
import { htmlDecode } from 'RedditArchiver/util/convert.jsx';
/*
{
"title": j_data["title"],
"subreddit": j_data["subreddit"],
"author": j_data["author"],
"revisions": revision,
"saved_time": datetime.now(timezone.utc).timestamp() * 1000
}
*/

function SubredditRow({ subreddit }) {
  return (
    <tr key={subreddit}>
      <th colSpan="3">
        {"r/" + subreddit}
      </th>
    </tr>
  );
}

function PostRow({ id, title, subreddit, author, revisions, saved_time }) {
  return (
    <tr key={id}>
      <td>{id}</td>
      <td>{author}</td>
      <td><Link 
            to={"/post/" + subreddit + "/" + id + "/" + revisions}
            dangerouslySetInnerHTML={{__html: htmlDecode(title)}}>
          </Link>
      </td>
    </tr>
  );
}

function ArchiveTable({data, filterText}) {

  const rows = [];

  const query = filterText.toUpperCase();

  let subredditsCount = 0;
  let postsCount = 0;

  for (var key of Object.keys(data).sort(function (a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
})) {
    const subreddit = data[key];

    filterText = filterText.trim();

    if (filterText.startsWith("r/")) {
      if (!key.toUpperCase().startsWith(filterText.substring(2).toUpperCase())) {
        continue;
      }
    }

    const posts = [];
    for (var post_key of Object.keys(subreddit)) {
      const post = subreddit[post_key];

      // Cancel r/ searches outside for efficiency
      if (!filterText.startsWith("r/")) {
        if (!post.title.toUpperCase().includes(filterText.toUpperCase())) {
          continue;
        }
      }
      
      posts.push(
        <PostRow 
          id={post.id}
          title={post.title}
          subreddit={post.subreddit}
          author={post.author}
          revisions={post.revisions}
          saved_time={post.saved_time} />
      );
    }

    postsCount += posts.length;
    subredditsCount += 1;

    if (posts.length > 0) {
      rows.push(<SubredditRow subreddit={key} />);
      rows.push(...posts);
    }
  }

  return (
    <div>
      <h1>Archived Reddit Pages ({postsCount} posts, {subredditsCount} subreddits)</h1>
      <table class="archive-table">
        <thead>
          <tr>
            <th>Author</th>
            <th>id</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
    
  );
}

function SearchBar({ filterText, onFilterTextChange }) {
  return (
    <form>
      <input
        class="search-bar"
        type="text"
        placeholder="Search..."
        value={filterText}
        onChange={(e) => onFilterTextChange(e.target.value)} />
    </form>
  );
}


export default function MainPage() {
  const [filterText, setFilterText] = useState('');
  const [responseText, setResponseText] = useState('');

  const serverURL = 'https://buhao.jp/dropbox/reddit/database.json';

  useEffect(() => {
    console.log("KEK");

    make_request("GET", serverURL)
      .then((data) => setResponseText(data.response));

    return () => {
      console.log("Returned prematurely");
      setResponseText('');
    }

  }, []);

  let json = {};

  if (responseText !== "") {
    json = JSON.parse(responseText);
  }

  return (
    <div>
      <SearchBar
        filterText={filterText}
        onFilterTextChange={setFilterText} />
      <ArchiveTable
        data={json}
        filterText={filterText} />
    </div>
  )
}