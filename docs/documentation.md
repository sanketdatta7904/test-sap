# ui5-cap-event-app Documentation

A look at the most important implementation aspects of this sample app.

## Content

* [What's in for you?](#Whats-in-for-you)
* [Project Overview](#Project-Overview)
* [The Server (the CAP Service)](#The-Server-the-CAP-Service)
  * [Schema](#Schema)
  * [Registration Service](#Registration-Service)
  * [Sample Data](#Sample-Data)
  * [Login/Logout](#LoginLogout)
* [The Form UI (Freestyle App for End-User Registration)](#The-Form-UI-Freestyle-App-for-End-User-Registration)
  * [App Structure / Flow / Routing (and Other Manifest Settings)](#App-Structure--Flow--Routing-and-Other-Manifest-Settings)
  * [The Heart of the App: the Registration Controller](#The-Heart-of-the-App-the-Registration-Controller)
    * [Loading Data (Draft Handling)](#Loading-Data-Draft-Handling)
    * [Family Members](#Family-Members)
    * [Data Validation](#Data-Validation)
    * [Saving Data (Persisting the Draft)](#Saving-Data-Persisting-the-Draft)
* [The Admin UI (Fiori Elements Registration List)](#The-Admin-UI-Fiori-Elements-Registration-List)
* [Project Structure and Lifecycle](#Project-Structure-and-Lifecycle)
  * [Workspace Root](#Workspace-Root)
  * [CAP Server](#CAP-Server)
  * [Form UI](#Form-UI)
  * [Admin UI](#Admin-UI)
  * [Deployment](#Deployment)

## What's in for you?

This sample app helps you understanding how SAPUI5 and Node.js-based CAP can be used in a full-stack app, in particular with respect to the usage of OData V4 and its draft mode in a freestyle SAPUI5 user interface.

The scenario is an event registration app where people can register themselves and their family members for an imaginary event. Administrators can see and edit the registration list in a metadata-driven Fiori elements user interface.

## Project Overview

The project contains three packages: one for each of the two UIs, and one for the CAP server. Each package is self-contained and has its own `package.json`. The root `package.json` is managing the workspace and adds combined build and run scripts.

```text
package.json
packages
├── server                // the Node.js-based CAP server
│   └── package.json
└── ui-form               // the form UI based on freestyle SAPUI5
    └── package.json
```

Further details can be found in the [Project Structure](#Project-Structure) chapter.

## The Server (the CAP Service)

### Schema

The file [schema.cds](../packages/server/db/schema.cds) defines two simple managed entities: `Products`.

It is important to model the `FamilyMember`s as a composition, not an association, to make sure that in draft mode they are all created and saved together. Compositions are self-contained and cannot exist without their parent.

```js
entity Products : managed {
  key ID         : UUID;
  Name      : String(100);
  Description       : String(1000);
  Owner          : String(120);
}
```

### Registration Service

[`marketplace-service.cds`](../packages/server/srv/marketplace-service.cds) exposes both entities from the schema.

```js
srv.on('NEW', 'Products', (req, next) => {
  req.data.owner = req.user.id; // add user e-mail to the dataset (not entered in the UI, but derived from logged-in user)
});
```

### Sample Data

In [sap.ui5.marketplace-Products.csv](../packages/server/db/data/sap.ui5.marketplace-Products.csv) some mock data is defined and automatically loaded on startup by CAP.

Providing a custom `server.js` file normally requires the custom code to take over the entire startup of CDS. This can be avoided by returning the original `cds.server` as module exports:

```js
// Delegate bootstrapping to built-in server.js of CDS
module.exports = cds.server
```

## The Form UI (Freestyle App for End-User Registration)

The freestyle SAPUI5 app in the [`packages/ui-form`](../packages/ui-form) directory is meant for end-users to register themselves and their families for the event.

The [manifest.json](../packages/ui-form/manifest.json) file contains the routing configuration with the mentioned targets: `Registration`, `Confirmation`, and `NotAuthorized`. There is only one route pattern registered, though: the one with empty URL hash pattern, pointing to the `Registration` view. This is because the navigation to those pages is done via API, with no hash change, because the user should not be able to enter the application at these pages.

The other interesting configuration in `manifest.json` is the `models` section, which after the resource model for translation texts configures the main model of the app, the OData V4 Model pointing to the CAP server.

```json
"models": {

	...

	"": {
		"dataSource": "marketplace",
		"preload": true,
		"settings": {
			"groupId": "$auto",
			"synchronizationMode": "None",
			"operationMode": "Server",
			"autoExpandSelect": true
		}
	}
},
```

It points to the `marketplace` datasource also defined in the manifest file, where the model type and version is defined and the URL `/odata/v4/event-registration/` is given, at which the server can be reached:

```json
"marketplace": {
	"uri": "/marketplace/",
	"type": "OData",
	"settings": {
		"odataVersion": "4.0"
	}
}
```

But... why can the server be reached at this server-absolute URL? After all, the CAP server is running on a different port (`4004`)!  
The reason is this setting in [ui5.yaml](../packages/ui-form/ui5.yaml), where a forwarding proxy is registered for this url as custom middleware:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-simpleproxy
    mountPath: /marketplace/
    afterMiddleware: compression
    configuration:
      baseUri: http://localhost:4004/marketplace/ 
```

All requests going to `/marketplace/...` will be forwarded to `http://localhost:4004/marketplace/`.

## Project Structure and Lifecycle

The project is organized as mono repository using [Yarn 1.x](https://classic.yarnpkg.com/) workspaces. This allows to have multiple packages in a single GitHub repository, manage, and link them via Yarn. The project structure looks like this:

```text
package.json
packages
├── server                // the Node.js-based CAP server
│   ├── app               //   - UI resources
│   ├── db                //   - schema and mock data
│   ├── srv               //   - service definitions
│   ├── .cdsrc.json
│   ├── package.json
│   └── server.js
└── ui-form               // the form UI based on freestyle SAPUI5
│   ├── webapp            //   - UI5 application resources
│   ├── package.json
│   └── ui5.yaml
```

There is a `package.json` in the workspace root and each package is located in the `packages` folder, is self-contained, and has its own `package.json`.

### Workspace Root

In the workspace root a `package.json` is located which contains the metadata for the Yarn workspace. Looking into the `package.json` besides the regular metadata (`name`, `version`, ...) and the `dependencies` section, the `workspaces` section defines the packages which belong to the workspace. This project follows the best-practices of Yarn workspaces and maintains the packages inside the `packages`folder.

```json
{
  "name": "ui5-cap-event-app",
  "version": "0.0.0",
  "description": "UI5 CAP Event Application",
  "private": true,
  "scripts": {
    [...]
  },
  "workspaces": [
    "packages/*"
  ],
  "dependencies": {
    [...]
  }
}
```

Additionally, the workspace root is a *private* package which must not be published on the npm registry. Therefore, the package is marked as `private`.

To simplify the handling of the mono repository, the `package.json` in the workspace root provides npm scripts to build, to debug, or to start the project.

```json
{
  [...]
  "scripts": {
    "build": [...],
    "start": [...],
    "debug": [...]
  },
  [...]
}
```

The npm scripts can be called with Yarn via: `yarn build`, `yarn start`, or `yarn debug`. All those npm scripts are using [npm-run-all](https://www.npmjs.com/package/npm-run-all) to run *sub-scripts* sequential or in parallel.

Most of the *subscripts* are using the `yarn workspace` command to run the npm scripts of the concrete package, e.g. `yarn workspace ui5-cap-event-app-ui-form start` runs the `yarn start` script in the `ui5-cap-event-app-ui-form` which is the package name of the `packages/ui-form` package.

The following snippet visualizes the **`build`** script execution:

```text
                                                      build:server:copy-app
                                build:server          build:server:copy-cdsrc
build   >>   build:clean   >>   build:ui-form    >>   build:server:copy-gen
                                build:ui-admin        build:ui-form:copy
                                                      build:ui-admin:copy
```

First, the `build` script cleans the `dist` folder, then it builds the CAP server, the form UI, and the admin UI in parallel and finally it copies the build results from the individual packages into the `dist` folder.

The build result in the `dist` folder looks like this:

```text
dist
├── app                // application resources
│   ├── form           //   - form UI
│   │   └── ...        //     -> UI5 resources
│   └── index.html     // sandbox Fiori launchpad
├── srv                // service resources
│   └── ...            //   - schema, annotations, i18n texts
├── .cdsrc.json        // runtime configuration for CDS
├── package.json
└── server.js          // extensions to the CDS server
```

The following snippet visualizes the **`start`** script execution:

```text
             start:server
start   >>   start:ui-form
             start:ui-admin
```

First, the `start` script just starts the CAP server, the form UI, and the admin UI in parallel. The form UI is then running on http://localhost:8080/index.html, the admin UI on http://localhost:8081/index.html, and the CDS server on http://localhost:4004/.

The following snippet visualizes the **`debug`** script execution:

```text
             debug:server
debug   >>   start:ui-form
             start:ui-admin
```

First, the `debug` script just starts the CAP server in debug mode, the form UI, and the admin UI in parallel. The form UI is then running on http://localhost:8080/index.html, the admin UI on http://localhost:8081/index.html, and the CDS server on http://localhost:4004/.

### CAP Server

The CAP server package follows the basic structures of CAP projects. More details about CAP development can be found [here](https://cap.cloud.sap/docs/).

The following snippet shows the structure of the CAP server package:

```text
packages/server
├── _i18n              // i18n resources for the service annotations
├── app                // application resources
│   └── sandbox.html   // sandbox Fiori launchpad
├── srv                // service resources
│   └── ...            //   - schema, service annotations, service extensions
├── .cdsrc.json        // runtime configuration for CDS
├── package.json
└── server.js          // extensions to the CDS server
```

As the project is setup as a mono repository the overall project will be run with the `package.json` scripts from the workspace root. But the workspace root scripts are calling the scripts from the local `package.json` with the `yarn workspace` command. The CAP server package contains the following scripts:

```json
{
  "name": "ui5-cap-event-app-server",
  [...]
  "scripts": {
    "cds:build": "cds build",
    "cds:start": "cds run",
    "cds:watch": "cds watch",
    "cds:debug": "node --inspect bin/cds run",
    "cds:debug-brk": "node --inspect-brk bin/cds run",
    "start": "npm run cds:start"
  },
  [...]
}
```

The `package.json` contains scripts to build, start, watch or debug the CAP server. In the workspace root, only the build and start script it beeing used.

To run just a single script (e.g. `cds watch` for development) of the CAP server project from within the workspace root, just run `yarn workspace ui5-cap-event-app-server cds:watch`.

### Form UI

The Form UI package follows the best practices for UI5 freestyle development and has been created with the [Yeoman SAPUI5 templates](https://www.npmjs.com/package/@sapui5/generator-sapui5-templates) as explained in the blog post [UI5 Tooling: a modern development experience for UI5](https://blogs.sap.com/2020/04/07/ui5-tooling-a-modern-development-experience-for-ui5/). The UI projects require the [UI5 Tooling](https://sap.github.io/ui5-tooling/) to start the development server to run the UI5 applications during development time and to finally build the projects to prepare them for deployment.

The following snippet shows the structure of the Form UI package:

```text
packages/ui-form
├── webapp              // UI5 application resources:
│   ├── controller      //   -> controller code
│   ├── i18n            //   -> i18n resources
│   ├── model           //   -> model-related code
│   ├── view            //   -> views
│   ├── Component.js    //   -> Component controller
│   ├── index.html      //   -> entry point
│   └── manifest.json   //   -> Component manifest
├── package.json
└── ui5.yaml            // UI5 Tooling metadata
```

More details about the project structure can be found in the UI5 demokit section: [Folder Structure: Where to Put Your Files](https://ui5.sap.com/#/topic/003f755d46d34dd1bbce9ffe08c8d46a).

The Form UI package also contains a `package.json` defining the basic scripts needed to build and run the UI5 application:

```json
{
  "name": "ui5-cap-event-app-ui-form",
  [...]
  "scripts": {
    "build": "ui5 build --clean-dest",
    "start": "ui5 serve --port 8080"
  },
  [...]
}
```

The build script is running the `ui5 build` command with the option `--clean-dest` to ensure having a clean `dist` folder into which the UI5 Tooling by default builds the project. The `ui5 build` command is creating a preload bundle for the component which is essential for productive usage to improve the loading performance. To just run the build step individually you can use the `yarn workspace` command `yarn workspace ui5-cap-event-app-ui-form build` from the workspace root. This produces the following output:

```text
packages/ui-form
└── dist                        // UI5 application resources:
    ├── controller
    ├── i18n
    ├── model
    ├── resources
    │   └── sap-ui-version.json //   -> Version metadata
    ├── view
    ├── Component-dbg.js        //   -> Component controller (sources)
    ├── Component-preload.js    //   -> Component preload bundle
    ├── Component.js            //   -> Component controller (minifed)
    ├── index.html
    └── manifest.json
```

*Remark:* for the sake of simplicity, UI5 is loaded from CDN rather than using the local UI5 resources which are available as npm dependencies via the development server of the UI5 Tooling. To use the local UI5 resources you can change the `src` attribute of the UI5 bootstrap tag to `resources/sap-ui-core.js`.

```html
<!DOCTYPE html>
<html>
<head>

  [...]

  <script id="sap-ui-bootstrap"
          src="https://ui5.sap.com/1.116.0/resources/sap-ui-core.js"
```

Another important aspect is the development server of the UI5 Tooling used to serve the UI5 applications at development time. The UI5 Tooling can be extended with custom middlewares to improve the development experience or to proxy OData services. For the Form UI project we are using the [ui5-middleware-livereload](https://www.npmjs.com/package/ui5-middleware-livereload) to improve the development experience by getting a save and update behavior (once a resource has been changed and saved in your editor, the UI5 application is reloaded) and [ui5-middleware-simpleproxy](https://www.npmjs.com/package/ui5-middleware-simpleproxy) to proxy the CAP server running on port `4004` to avoid [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) issues.

To use those custom middlewares, they need to be imported in the `package.json` and declared as UI5 dependencies:

```json
{
  "name": "ui5-cap-event-app-ui-form",
  [...]
  "devDependencies": {
    "ui5-middleware-livereload": "^0.4.3",
    "ui5-middleware-simpleproxy": "^0.5.1"
  },
  "ui5": {
    "dependencies": [
      "ui5-middleware-simpleproxy",
      "ui5-middleware-livereload"
    ]
  }
}
```
### Deployment

The deployment, e.g. to CloudFoundry, is not in scope of this sample app - we had to stop somewhere and the focus is on the interaction between UI5 and CAP and on using OData V4 with draft mode.
Helpful information around the deployment can be found in many blog posts like this one: [Developing a Fiori elements app with CAP and Fiori Tools](https://blogs.sap.com/2020/09/06/developing-a-fiori-elements-app-with-cap-and-fiori-tools/).
If you want to extend the sample, making it ready for deployment, you are welcome to contribute!
There are several aspects to consider, e.g. the database and the authentication (incl. logout). 
