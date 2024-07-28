# ui5-sample-marketplace

A test exercise for marketplace team job candidates.

**Table of Contents**
1. [Project Setup](#project-setup)
1. [Exercise](#exercise)

## Project Setup

### Requirements

- [Node.js](https://nodejs.org) (latest LTS version which supports npm workspaces)
- [SAP CAP CLI](https://www.npmjs.com/package/@sap/cds-dk) (do `npm install -g @sap/cds-dk`)
- [sqlite3](https://www.sqlite.org) (only needed separately on Windows, [commandline tools](https://www.sqlite.org/download.html) zip need to be downloaded, extracted, and directory added to the PATH)

### Installation

1. Use npm to install the dependencies.

    ```sh
    npm i
    ```

### Running the Project

Execute the following command to run the project locally for development (start the CDS server running the admin UI and form UI embedded):

```sh
npm start
```

As also shown in the terminal after executing this command, the CDS server is running on http://localhost:4004/.

### Debugging with VSCode

#### Server

Run the following command in VSCode JavaScript Debug Terminal and attach breakpoints.

```sh
npm start
```

#### UI5 Frontend

You can debug via Developer Tools of the browser.

### References

Other projects demonstrating similar use-cases:

* https://github.com/vobu/ui5-cap - a repository showcasing the use of UI5 Tooling, CAP + UIveri5-based testing in an app for media upload and preview (as presented at UI5conBE in Feb 2020) by Volker Buzek.
* https://blogs.sap.com/2020/07/08/ui5-freestyle-app-in-cap - a UI5 freestyle app in CAP, with approuter, by Wouter Lemaire.
* https://sapui5.hana.ondemand.com/#/topic/bcdbde6911bd4fc68fd435cf8e306ed0 - SAPUI5 Odata v4 model
* https://sapui5.hana.ondemand.com/#/api - SAPUI5 API references
* https://pages.github.tools.sap/cap/docs/node.js/ - CDS Node.js Service

## Exercise
 
### Task 1: Introduce save functionality

- Add save button to form     >> Done
- show saved data from the form in the table    >> Done
- enhance the table by column showing owner information   >> Done
 
### Task 2: Introduce modify functionality

- introduce edit button next to delete button in table, that populates form with data from table row  >> Done
- upon clicking save button, update the row in the table  >> Not done(One extra record getting added)
 
### Task 3: Introduce frontend-backend validation

- enhance the form with validation:    >> Done
- a product name should be unique      >> Done
- show error message when a validation fails    >> Not done
- hint: add the validation in the backend - marketplace-service.js    >> Done
 
### Task 4: Add unit tests

- write a unit test using the tool of your choice to test the validation implementation   >>  Done