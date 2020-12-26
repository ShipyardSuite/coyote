'use strict';

const fs = require('fs-extra')
const os = require("os");
const path = require("path");
const TableTops = require('tabletops');

const { promisify } = require('util');
const { join } = require('path');
const mv = promisify(fs.rename);

const currentPath = path.resolve("./");

const Message = require('./Message');

const msg = new Message();

/**
 * Manages creation, listing and deletion of projects and templates.
 */
class TemplateManager
{
    constructor(config)
    {
        this.config = config;
    }
    /**
     * Lists all templates.
     */
    async listTemplates()
    { 
        const templates = [];
        const files = fs.readdirSync(this.config.templatesFolder);

        let templateName;
        let templateAuthor;
        let templateVersion;
        let templateIndex = 0;

        const table = new TableTops();
        table.SetTableTitle("Template list");
        table.SetTableColumns([
            {
                key: 'id',
                title: '#',
                width: 5
            },
            {
                key: 'name',
                title: 'Name',
                width: 35
            },
            {
                key: 'version',
                title: 'Version',
                width: 12
            },
            {
                key: 'author',
                title: 'Author',
                width: 20
            }
        ]);

        table.ShowTable();

        for (let i in files)
        {
            if (!files.hasOwnProperty(i)) continue;

            templateName = files[i];

            if (fs.statSync(this.config.templatesFolder + '/' + templateName).isDirectory())
            {

                templateIndex++;

                fs.readFile(this.config.templatesFolder + '/' + templateName + ".yaml", 'utf-8', (err, file) => {
                    const lines = file.split('\n');

                    templateAuthor = lines[0].replace("# author: ", "");
                    templateVersion = lines[1].replace("# version: ", "");
                });

                //templates.push();

                table.AddTableRow({id: templateIndex , name: templateName, version: templateVersion || "0.1.0", author: templateAuthor || "undefined"});
            }
        }

        console.log();
    }

    /**
     * Creates a new template in current folder.
     */
    async createTemplate(templateName)
    {
        // initiate a new template at current folder
        
        msg.showHeader(`Creating template "${ templateName }"`);

        await this.createFile(
            "/" + templateName + ".yaml",
            `# author: "${os.userInfo().username}"\n\n# app.js\napp.js:\n  "your-tag": "Hello World!"\n\n# package.json\npackage.json:\n  "version": "0.1.0"\n`,
            true);
        await this.createFolder(templateName, true);
        await this.createFile(
            templateName + "/app.js",
            `const testString = "{{your-tag}}";\nconsole.log(testString);\n`
        );
        await this.createFile(
            templateName + "/package.json",
            `{\n\t"${templateName}": "test",\n\t"version": "{{version}}",\n\t"description": "",\n\t"main": "app.js",\n\t"scripts": {\n\t\t"start": "node app.js"\n\t},\n\t"keywords": [],\n\t"author": "${os.userInfo().username}",\n\t"license": "ISC"\n}`
        );

        await msg.showMessage(`Finished creating template "${ templateName }"\n`);
    }

    /**
     * Installs template.
     */
    async installTemplate(templateName)
    {
        msg.showHeader(`Installing template "${ templateName }"`);

        await fs.copy(`./${ templateName }.yaml`, `${ this.config.templatesFolder }/${ templateName }.yaml`, err =>
        {
            msg.showMessage('Installing template config file');
            
            if (!err)
            {
                msg.status(true);
            }
            else
            {
                msg.status(false);
            }
        });

        await fs.copy(`./${ templateName }`, `${ this.config.templatesFolder }/${ templateName }`, err =>
        {
            msg.showMessage('Copying template folder');
            
            if (!err)
            {
                msg.status(true);
                msg.showMessage(`Finished installing template "${ templateName }"\n`);
            }
            else
            {
                msg.status(false);
            }
        });
    }

    /**
     * Creates a file based on template.
     * 
     * @param {string} filename
     * @param {string} content
     * @param {bool} isTemplate
     */
    createFile(filename, content, isTemplate = false)
    {
        if (isTemplate)
        {
            msg.showMessage(`Creating template configuration file`);
        }
        else
        {
            msg.showMessage(`Creating file "${ filename }"`);
        }

        //const file = fs.createWriteStream(this.config.templatesFolder + "/" + filename);
        const file = fs.createWriteStream(currentPath + "/" + filename);
        
        try
        {
            file.once('open', function (fd)
            {
                file.write(content);
                file.end();
            });

            msg.status(true);
        }
        catch (error)
        {
            msg.status(false);
        }
    }

    /**
     * Creates a folder.
     * 
     * @param {string} directoryName
     * @param {bool} isTemplate
     */
    createFolder(directoryName, isTemplate = false)
    {
        if (isTemplate)
        {
            msg.showMessage(`Creating template directory`);
        }
        else
        {
            msg.showMessage(`Creating directory "${ directoryName }"`);
        }

        try
        {
            //fs.mkdirSync(this.config.templatesFolder + "/" + directoryName, { recursive: true });
            fs.mkdirSync(currentPath + "/" + directoryName, { recursive: true });
            msg.status(true);
        }
        catch (error)
        {
            msg.status(false, "Directories already exist!");
        }
    }

    /**
     * Deletes a template.
     */
    async deleteTemplate(templateName)
    {
        let directory = this.config.templatesFolder + "/" + templateName;

        if (fs.existsSync(directory))
        {
            msg.showHeader(`Deleting template "${ templateName }"`);

            fs.readdirSync(directory).forEach(function (file)
            {
                var curPath = directory + "/" + file; 

                if (!fs.statSync(curPath).isDirectory())
                {
                    fs.unlink(curPath, function (err)
                    {
                        msg.showMessage(`Deleting file "${ curPath.replace(directory, templateName) }"`);
                        if (!err)
                        {
                            msg.status(true);
                        }
                        else
                        {
                            msg.status(false);
                        }
                    });
                }
            });

            fs.rmdir(directory, function (err)
            {
                msg.showMessage(`Deleting folder "${ directory.replace(directory, templateName) }"`);
                if (!err)
                {
                    msg.status(true);
                }
                else
                {
                    msg.status(false);
                }
            });
        }

        await fs.unlink(path.join(this.config.templatesFolder, templateName + ".yaml"), function (err)
        {
            msg.showMessage(`Deleting configuration file`);
            if (!err)
            {
                msg.status(true);
                msg.showMessage(`Finished deleting template "${ templateName }"\n`);
            }
            else
            {
                msg.status(false);
            }
        });
    }
}

module.exports = TemplateManager;
