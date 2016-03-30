# angular2-production-seed
Seed project for a production-ready Angular2 application

## Why
Following the [Angular 2 Quick Start Guide](https://angular.io/docs/ts/latest/quickstart.html) will get you started on a well-structured project with the convenience of TypeScript and a local server with live reloading all setup.

What it won't give you is real-world performance.  As your application grows you will likely end up with plenty of typescript components, html templates, style files, and a handful of services and custom directives.  Running locally you likely won't notice much delay, but as soon as you host the site you'll find that the 100+ file dependencies add up to potentially seconds of lag on initial load.

## How
As it turns out we just need to leverage TypeScript's support for compiling to a single file and Angular 2 components' support for inline styles and templates.  While developing the code can be modularized in whatever manner fits your project.  TypeScript components/directives/etc. can be kept separate from the HTML templates and css/sass/less/stylus files, but once built it is all spit out into a single file with sourcemaps support.

This doesn't help us with the filesize of Angular 2 itself, or the boot time required by Angular 2, but this is definitely low-hanging fruit for any Angular 2 project.

### File Structure
```
|-- app
  |-- components
    |-- app
      |-- app.component.html
      |-- app.component.less
      |-- app.component.ts
    |-- main.ts
  |-- lite-server
    |-- bs-config-dev.json
    |-- bs-config-prod.json
|-- index.html
```
The seed project uses a component-based file structure, but for smaller projects you could easily break your files out into purpose-based files (components, views, less, etc.)

```typescript
import {Component} from 'angular2/core';

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent { }
```
Looking at app.component.ts, it uses templateUrl and styleUrls to reference the actual HTML template and style files.  This looks great while developing, but out of the box this would lead to the browser downloading app.component.js, then realizing it needs app.component.html and app.component.css as well.  Do this for all of your components and you see why initial load times are a problem.

### Building
The build process needs to handle a few things for us.  It needs to compile the less (with autoprefixer to handle cross-browser issues), inject HTML and compiled css into each component, then compile the typescript components down to a single javascript file.

Feel free to look through the seed's gulp file to get all the details, but moral of the story is
```
\\ build for dev
gulp build:dev

\\ build for production
gulp build:prod

\\ build dev & prod
gulp build

\\ build & watch for dev
npm run start
```
One gulp task to handle all of it.  Components can use relative path references to templates and styles, and components can be structured however you see fit.

### Debugging
Sourcemaps are maintained through the build process.  When running locally you will get all the benefits of debugging your typescript files while the browser uses the single compiled javascript file.

### Deploying
When deploying, everything you need is under 'build/Production'.  In fact, you can drop the source into a CDN without any need for an Express server and everything just works!

# To Do
Injecting the HTML templates and rebuilding sourcemaps can take time with a large project - the dev build should skip this step to allow quick live reloading.
