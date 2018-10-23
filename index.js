// blog-loader
//
// Load markdown blogs with metadata as JSON in webpack
//
// Copyright (c) 2014 Assertible, Inc | MIT License
//
// Usage:
//
// blog-loader will load markdown files, with optional frontmatter as
// a JSON object in any JavaScript file using Webpack. The `require`
// will return an object with the HTML string of the markdown file at
// `.content`. Any meta-data attributes provided in the frontmatter
// will have their own key/value pair in the returned JSON
//
// Example:
//  { test: /\.md/, loader: "blog?name=/blog/[name].[ext]" }
// => { content: "...", author: "Cody Reichert", date: "...", etc)

var path = require("path")
var marked = require("marked")
var loaderUtils = require("loader-utils")
var jsYaml = require("yaml-front-matter")
var mdRenderer = require("marked-bootstrap-4-renderer")
var htmlparser = require("htmlparser")

// default `marked` options
var options = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
}

module.exports = function(content) {
    this.cacheable && this.cacheable()

    /*
     * This is how our return will look
     */
    var finalValue = {
        path: null,
        meta: null,
        content: null,
    }

    /*
     * If we can't move files, error
     */
    if (!this.emitFile) throw new Error("emitFile is required from module system")

    /*
     * Move the file, and get the new URL
     * Also set `finalValue.url` to the new URL
     */
    var query = loaderUtils.getOptions(this)
    var loc = loaderUtils.interpolateName(this, query.name || "[hash].[ext]", {
        content: content,
        regExp: query.regExp,
    })

    this.emitFile(loc, content)
    finalValue.path = loc

    /*
     * Parse frontmatter and content from markdown file
     */
    var parsed = jsYaml.loadFront(content, "content")
    var headings = markdownHeadingsRenderer(parsed.content)

    options.renderer = mdRenderer()
    marked.setOptions(options)
    var md = marked(parsed.content)
    delete parsed.content

    finalValue.headings = headings
    finalValue.content = md
    finalValue.meta = parsed
    finalValue.id = path.basename(loc, ".md")

    /*
     * Ensure any required metada was supplied. Throws
     * a compile error if any required keys are missing.
     */
    var required = query.required
    for (var key in required) {
        if (!finalValue.meta[required[key]])
            throw new Error("Must provide `" + required[key] + "` in blog frontmatter")
    }

    return "module.exports = " + JSON.stringify(finalValue, undefined, "\t") + ";"
}

module.exports.raw = true

function markdownHeadingsRenderer(content) {
    var headings = []
    var parserHandler = new htmlparser.DefaultHandler(function(error) {
        if (error) throw new Error('Cannot parse "' + text + '" in markdown file.')
    })
    var parseMarkdownHeadings = new marked.Renderer()

    parseMarkdownHeadings.heading = function(text) {
        var parser = new htmlparser.Parser(parserHandler)
        parser.parseComplete(text)
        var escaped = (parserHandler.dom[0].children && parserHandler.dom[0].children[0]
            ? parserHandler.dom[0].children[0].raw
            : parserHandler.dom[0].raw
        ).trim()

        headings.push(escaped)
    }

    var opts = Object.assign(options, {
        renderer: parseMarkdownHeadings,
    })

    marked(content, opts)

    return headings
}
