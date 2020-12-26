#! /usr/bin/env node

'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const exec = require('child_process').exec;
const yaml = require('js-yaml');
const commander = require('commander');
const Message = require('./Message');
const TemplateManager = require('./Manager');

let templateConfig = {
    "applicationFolder": path.dirname(process.mainModule.filename).replace("app", ""),
    "templatesFolder": path.dirname(process.mainModule.filename).replace("app", "templates"),
    "projectFolder": path.resolve("./")
};

const msg = new Message();
const manager = new TemplateManager(templateConfig);

/**
 * Initializes Application.
 */
const init = () =>
{
    msg.showHeader(`Creating "${ templateConfig["name"] }" using template "${ templateConfig["template"] }"`);

    createProject();
}

/**
 * Manages the workflow to create a new project.
 */
const createProject = async () =>
{
    await loadConfigFile();
    await createFolders();
    await handleFiles();
    if (templateConfig.install)
    {
        await runInstallation();
    }
}

/**
 * Reads template config file.
 */
const loadConfigFile = async () =>
{
    msg.showMessage("Loading template configuration file");

    try
    {
        const config = await yaml.safeLoad(fs.readFileSync(`${ templateConfig.templatesFolder }/${ templateConfig.template }.yaml`, 'utf8'));
        
        templateConfig = {
            ...templateConfig,
            settings: config
        }
        
        msg.status(true);
        
        return config;
    }
    catch (e)
    {
        msg.status(false, "Configuration file not found!");
    }
}

/**
 * Returns a list of files in template.
 * 
 * @param {string} dir 
 * @param {array} fileList 
 * 
 * @returns {array}
 */
const getTemplateFiles = (dir, fileList = []) =>
{
    try 
    {
        fileList = fileList;

        const files = fs.readdirSync(dir);
    
        for (let i in files)
        {
            if (!files.hasOwnProperty(i) || files[i] === "node_modules")
            {
                continue;
            }

            const filePath = dir + '/' + files[i];
            const fileName = files[i];

            if (fs.statSync(filePath).isDirectory())
            {
                getTemplateFiles(filePath, fileList);
            }
            else
            {
                fileList.push({"name": fileName, "path": filePath, folder: dir, "content": readFile(filePath) });
            }
        }

        if (fileList != [])
        {
            return fileList;
        }
        else
        {
            return "No files in directory";
        }
    }
    catch (e)
    {
        console.log(e.message);
    }
}

/**
 * Creates project folder.
 */
const createFolders = async () =>
{
    const folders = getTemplateFiles(`${ templateConfig.templatesFolder }/${ templateConfig.template }`);

    let createdFolders = [];

    try
    {
        await folders.forEach(folder =>
        {
            const currentFolder = folder.folder.replace(`${ templateConfig.templatesFolder }/${ templateConfig.template }`, templateConfig.name);

            if (createdFolders.indexOf(currentFolder) === -1)
            {
                fs.mkdirSync(currentFolder, { recursive: true });

                msg.showMessage(`Creating directory "${ currentFolder }"`);
                msg.status(true);

                createdFolders.push(currentFolder);
            }
        });
    }
    catch (error)
    {
        msg.showMessage(`Creating directories`);
        msg.status(false, "Directories already exist!");
    }
}

/**
 * Runs npm install in project folder.
 */
const runInstallation = async () =>
{
    msg.showMessage("Running npm install");

    await exec(`cd ${templateConfig.name} && npm install`, function (err, stdout, stderr)
    {
        if (err instanceof Error)
        {
            msg.status(false, "Error running installation!");
        }
        else
        {
            msg.status(true);
            msg.showMessage(`Finished creating project "${templateConfig.name}"`);
            msg.status(true);

            if (templateConfig.run)
            {
                msg.showMessage(`Starting additional command "npm run ${ templateConfig.run }"`);
                runCommand();
            }
        }
    });
}

/**
 * Runs a command set by templateConfig.run
 */
const runCommand = () =>
{
    msg.status(true);
    exec(`cd ${ templateConfig.name } && npm run ${ templateConfig.run }`).stdout.pipe(process.stdout);
}

/**
 * Creates project based on template.
 */
const handleFiles = () =>
{
    const files = getTemplateFiles(`${ templateConfig.templatesFolder }/${ templateConfig.template }`);
    const config = templateConfig.settings;

    files.forEach((file) =>
    {
        if (file.name !== ".DS_Store")
        {
            createFile(file, config);
        }
    });
}

/**
 * Reads file with a given name.
 * 
 * @param {string} filename 
 */
const readFile = (filename) =>
{
    return fs.readFileSync(filename, 'utf8');
}

/**
 * Creates file based on template settings.
 * 
 * @param {string} filename 
 */
const createFile = (file, config) => 
{
    const home = file.path.replace(templateConfig.templatesFolder + "/" + templateConfig.template + "/", "");

    msg.showMessage(`Creating file "${ home }"`);

    try
    {
        const stream = fs.createWriteStream(`${ templateConfig.projectFolder }/${ templateConfig.name }/${ home }`);

        stream.once('open', function (fd)
        {
            const rp = replaceValues(file, config);
            if (rp !== undefined)
            {
                stream.write(rp);
            }
            else
            {
                stream.write(file.content);
            }

            stream.end();
        });

        msg.status(true);
    }
    catch (error)
    {
        msg.status(false, "Could not create file!");
    }
}

/**
 * Replaces template file content according to template settings.
 * 
 * @param {Object} file
 * @param {Object} config
 */
const replaceValues = (file, config) =>
{
    const currentConfig = config[file.name];
    let fileContent = file.content;

    const newFileContent = fileContent.replace(/\{\{[a-z|\-]*\}\}/g, function (content)
    {
        const currentContent = content.replace("{{", "").replace("}}", "");

        if (currentContent === "name")
        {
            return templateConfig.name;
        }
        else if (currentContent === "description")
        {
            return templateConfig.description;
        }
        else if (currentContent === "version")
        {
            return templateConfig.version;
        }
        else if (currentContent === "maintainer")
        {
            return templateConfig.maintainer;
        }
        else if (currentContent === "port")
        {
            return templateConfig.port;
        }
        else
        {
            if (currentConfig)
            {
                if (Array.isArray(currentConfig[currentContent]))
                {
                    if (file["name"].includes("ignore"))
                    {
                        return currentConfig[currentContent].join("\n");
                    }
                    else
                    {
                        return currentConfig[currentContent].map((element, index) =>
                        {
                            if (file["name"] === "Dockerfile")
                            {
                                return `"${element}"`;
                            }
                            else
                            {
                                return `${ index > 0 ? '\n' : ''}"${element}"`;
                            }
                        });
                    }
                }
                else
                {
                    return currentConfig[currentContent];
                }
            }
        }
    });

    return newFileContent;
}

/**
 * Configurations for cli options.
 */
commander
    .version('0.1.0')
    .command('new [projectName]')
    .description('Creates a new project with given name')
    .option('-t, --template <string>', 'Template to be used in new project', 'ts-demo')
    .option('-m, --maintainer <string>', 'Maintainer of new project', os.userInfo().username)
    .option('-p, --port <number>', 'Port of new project', 5000)
    .option('-v, --version <number>', 'Version of new project', '0.1.0')
    .option('-d, --description <string>', 'Description for new Project', 'This is a new Project')
    .option('-i, --install', 'runs npm install after creation')
    .option('-r, --run <string>', 'package.json script to run after installation')
    .action(function (projectName, options)
    {
        templateConfig = {
            ...templateConfig,
            name: projectName,
            template: options.template,
            maintainer: options.maintainer,
            version: options.version,
            description: options.description,
            port: options.port,
            run: options.run,
            install: options.install ? true : false
        };

        init();
    });

/**
 * "New" command, to create new content.
 */
commander
    .command('create [content]')
    .description('Creates a new template')
    .action(function (content)
    {
        manager.createTemplate(content);
    });

commander
    .command('install [templateName]')
    .description('installs specified template')
    .action(function (templateName)
    {
        manager.installTemplate(templateName);
    });

/**
 * "List" command, to list all templates.
 */
commander
.command('list [content]')
.description('Displays a list with availible templates')
.action(function (content)
{
    if(content === "templates")
    {
        manager.listTemplates();
    }
    else if (content === "projects")
    {
        
    }
});

/**
 * "Delete" command, to delete a template.
 */
commander
    .command('delete [content]')
    .description('Deletes template by name')
    .action(function (content)
    {
        manager.deleteTemplate(content);
    });

commander.parse(process.argv);
