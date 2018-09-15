# `blog-loader`

> Create a simple blog from markdown files with Webpack!

`blog-loader` is a Webpack loader that imports markdown files with yaml-frontmatter, and
returns formatted HTML and meta data from the frontmatter.

### Usage

Add the webpack loader:
```js
    {
        test: /blog\/.*md/,
        loader: "blog-loader",
        query: {
            // Required keys in the frontmatter
            required: [ 'author', 'category', 'date', 'title'],
            // Where to save the markdown files, if at all.
            name: 'blog/[name].[ext]'
        }
    },
```

And start writing markdown files:
```markdown
---
Author: Assertible
Title: "`blog-loader` for Webpack"
Category: Cool stuff
Date: 2018-09-14
---

This is getting recursive.
```

Then import them:
```js
import blogPost from './blogPost.md'

console.log(blogPost)
 => { title: ..., author: ..., category: ..., date: ..., content: "This is getting recursive." }
```

That's it!

## License

The code in this repository is licensed under
MIT. [View the license](https://github.com/assertible/deployments/blob/master/LICENSE)

---

> [assertible.com](http://assertible.com) &nbsp;&middot;&nbsp;
> GitHub [@assertible](https://github.com/assertible) &nbsp;&middot;&nbsp;
> Twitter [@AssertibleApp](https://twitter.com/AssertibleApp)
