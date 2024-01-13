"use strict";

import { get } from "../extention.js";

export const state = { blogs: [] };

export const getBlogs = async function (search = "null", category = "Recent") {
  try {
    state.blogs = await get(
      `get_blogs/${search}/${category}`,
      "blogs",
      "problem with getting blogs."
    );
  } catch (error) {
    state.blogs = [];
  }
};
