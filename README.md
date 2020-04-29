
<h1 align="center">
  Pizza Maker created using Gatsby
</h1>

Simple React / Gatsby app to demonstrate a pizza order customization. 

This app uses local filesystem sources (in JSON formatted files) to simulate a remote backend requested data. These files are inside src/data and is 
being served from GraphQL service endpoint.

The index page contains some of the GraphQL calls using useQuery hooks provided by apollo hooks package. All GraphQL endpoint calls is provided 
using ApolloProvider that wraps the application components. It can also be done using manual HTTP GET or POST calls to local backend using axios.

## 🚀 Quick start

1.  **Install Gatsby if you haven't done so**

    This app needs Gatsby to run.

    ```shell
    # install gatsby CLI
    npm install -g gatsby-cli
    ```

2.  **Install modules and run project in development mode**

    Navigate into your new site’s directory, install modules and start it up.

    ```shell
    cd gatsby-pizza-maker/
    npm i
    gatsby develop
    ```

3.  **Open browser**

    App is now running at `http://localhost:8000`!

## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in a Gatsby project.

    .
    ├── node_modules
    ├── src
    ├──└── components
    ├──└──└── header.tsx
    ├──└──└── layout.tsx
    ├──└──└── topping.tsx
    ├──└── data
    ├──└──└── sizes.json
    ├──└──└── thickness.json
    ├──└──└── toppings.json
    ├──└── pages
    ├──└──└── index.tsx
    ├── .gitignore
    ├── .prettierrc
    ├── gatsby-browser.js
    ├── gatsby-config.js
    ├── gatsby-node.js
    ├── gatsby-ssr.js
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── tsconfig.json

1.  **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

2.  **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser) such as your site header or a page template. `src` is a convention for “source code”.

3.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

4.  **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

5.  **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://www.gatsbyjs.org/docs/browser-apis/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.

6.  **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://www.gatsbyjs.org/docs/gatsby-config/) for more detail).

7.  **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby Node APIs](https://www.gatsbyjs.org/docs/node-apis/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.

8.  **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://www.gatsbyjs.org/docs/ssr-apis/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

9.  **`LICENSE`**: Gatsby is licensed under the MIT license.

10. **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won’t change this file directly).**

11. **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

12. **`README.md`**: A text file containing useful reference information about your project.

