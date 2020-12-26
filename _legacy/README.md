# coyote
##### **Version 0.1.0**

A simple, extendable template based project generator cli.

## Quickstart

**minimal example command:**

```coyote new test``` Creates a project called test using the TypeScript Demo template.

**advanced example commmands:**

```coyote new test -t ts-demo``` Creates a project called test using the TypeScript Demo template.

```coyote new test -t ts-demo -i -r build:ts``` Creates a project called test using the TypeScript Demo template, runs ```npm install``` and starts the build command from the projects package.json file.

```coyote new test -t demo -m Me``` Creates a project called test using the demo template and sets the maintainer to "Me"

## Project creation

#### Create a project

Create a new project with the ```new``` command followed by these options:

| Short   | Long            | type   | Description                                                    | Default                   |
| ------- | --------------- | ------ | -------------------------------------------------------------- | ------------------------- |
| `-t`    | `--template`    | string | Template to be used in new project.                            | ts-demo                   |
| `-m`    | `--maintainer`  | string | Maintainer of new project.                                     | operating system username |
| `-p`    | `--port`        | number | Port of new project.                                           | 5000                      |
| `-v`    | `--version`     | string | Version of new project.                                        | 0.1.0                     |
| `-d`    | `--description` | string | Description for new Project.                                   | This is a new Project     |
| `-i`    | `--install`     | bool   | Runs npm install after project creation, required for `-r`     |                           |
| `-r`    | `--run`         | string | Script from package.json to be run after project creation.     |                           |

## Template creation

to create a new template, simply type ```coyote create test``` in a diretory of your choice.

### List all templates

List all availible templates by typeing ```coyote list templates```.

#### Pre-installed templates
| Name             | Command               | Description                                                     |
| ---------------- | --------------------- | --------------------------------------------------------------- |
| TypeScript Demo  | `-t ts-demo`          | A demo template using typescript, comes with builder.           |
| Service Template | `-t service-template` | OpusCapita Service Template, for fast creation of new Services. |
| Test             | `-t test`             | A simple template NodeJS app.                                   |

### Create a new template

Automatic template creation:
Run ```coyote create <template-name>```, in a directory to automatically create a skeleton-template. You can change it to your likings and then then plug it into oc-creator by running ```coyote install <template-name>``` in its root folder.

afterwards it should be part of the list described above.

**Folder structure**
````
coyote-cli/
...
    templates/
        ...
        your-template-name.yaml
        your-template-name/
            app.js
            package.json
````

**app.js**
````
const testString = "{{your-tag}}";
console.log(testString);
````

**test.yaml**
````
app.js
  "your-tag": "This is my new project!"
````

After this, you should see your template in the template list by writing ```coyote list templates```. And you can create a project using your template simply by typing ```coyote create MyProject -t your-template-name``` in a folder of your choice.

### Delete a template

run ```coyote delete <template-name>```, it should then also not be listed anymore when using ```coyote list templates```.

## License

This project is released under the [Apache version 2](LICENSE) license.
