# gulp-clobber

gulp-clobber is a [gulp](http://gulpjs.com/) plugin designed to be used with [gulp-watch](https://www.npmjs.com/package/gulp-watch) that detects file changes and promotes these files to an Oracle database using [ScriptRunner](https://github.com/Fivium/ScriptRunner).

Watch a video demo [here](https://youtu.be/m3MZXApefo4).

## Installation

- Add this repository URL as a [dependency in package.json](https://docs.npmjs.com/files/package.json#dependencies) as gulp-clobber is not registered with npm.
- Run `npm install`.

## Usage

In gulpfile.js:

```js
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    clobber = require('gulp-clobber');

gulp.task('clobber', function() {
  gulp.watch('./Fox5Modules/**/*.xml').on('change', clobber);
  gulp.watch('./FoxModules/**/*.xml').on('change', clobber);
  gulp.watch('./ReportDefinitions/**').on('change', clobber);
});
```

In gulp-clobber.json:

```js
{
  "scriptrunner": {
    "jdbc": "jdbc:oracle:thin:@host:1521:sid",
    "user": "",
    "password": ""
  }
}
```

Then run `gulp clobber` from the command line.

## Project Setup

Currently gulp-clobber assumes that you project is set up in the following way. Please note the location of ScriptRunner.jar

```
CodeSource
    ...
    Fox5Modules
    FoxModules
    gulp-clobber.json
    gulpfile.js
    package.json
    ReportDefinitions
    ...
    ScriptRunner
        Loaders
        Utils
        builder.cfg
    ScriptRunner.jar
```
