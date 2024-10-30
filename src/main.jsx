import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import PostViewer from 'RedditArchiver/components/PostViewer.jsx';
import { loader } from 'RedditArchiver/components/PostViewer.jsx';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "post/:subreddit/:postid/:revisions",
    element: <PostViewer />,
    loader: loader,
  }
], {basename: "/dropbox/reddit"});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
