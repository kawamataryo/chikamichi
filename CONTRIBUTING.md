# Contribution Guide

This is a guide on how to contribute to Chikamichi.  
Contributions are welcome 🎉

## Issues

The following Issue is accepted.

- Questions about features
- Report errors or problems
- Propose additions or improvements to feature

Please click [here](https://github.com/kawamataryo/chikamichi/issues/new) to issue.

## Pull Request

Pull requests are always welcome.

The following types of Pull Requests are accepted.  For basic Pull Requests (especially minor ones), you may send a Pull Request without creating an Issue.


- Bug Fixes
- Add functionality
- Performance Fixes
- Typo Fixes

"How about this kind of fix/improvement?" If you have a question, please raise an Issue and discuss it with me.

## How to send Pull Request

Please follow these steps to create a pull request.

1. Fork the repository
2. Create a branch
3. Add or modify feature
4. Run e2e and unit test
5. Check the feature in your browser
5. Commit Changes
6. Push branch
7. Create Pull Request

Also, when creating a pull request, please keep the following in mind

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.
- **Add tests!** - If you add a feature, it would be great if you could write a test for it.
- **Keep the same style** - eslint will automatically be ran before committing
- **Document any change in behavior** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.
- **Send coherent history** - Make sure your commits message means something


## How to set up a Local Development Environment

First, clone the forked repository locally.

```bash
$ git clone git@github.com:foo/chikamichi.git
```

Install dependent modules with [pnpm](https://pnpm.io/ja/).
If you do not have pnpm, please install it beforehand.

```bash
$ pnpm i
```

The dev command starts the development server.

```bash
$ pnpm run dev
```

When the development server starts, the Extension build results are output to the `extension`.

You can use extensions in your browser by loading the contents of the extensions folder in Chrome Exteinsions.

<img width="560" alt="image" src="https://user-images.githubusercontent.com/11070996/158058979-6d7f58a9-3d9b-46d3-ad14-f5e7a8c787e7.png">

<img width="560" alt="image" src="https://user-images.githubusercontent.com/11070996/158059064-c1773e32-ecd7-4a52-b01e-ba0ad2426502.png">

When you modify the code, the change is automatically reflected.

## How to run test

Chikamichi have e2e test and unit test.

Run unit test.

```
$ pnpm run test
```

Run e2e test.

```
$ pnpm run cypress:open
```

That's it. Happy coding 👍
