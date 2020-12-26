'use strict';

const color = require("cli-color");

/**
 * Creates success/failure message for cli application.
 */
class Message
{
    constructor()
    {
        this.msg = "";
    }

    /**
     * Shows a header for the utilized command.
     * 
     * @param {string} input 
     */
    showHeader(input)
    {
        const lengthsOfInput = input.length
        const lengthString = `                                                                   `.slice(0, -lengthsOfInput);
        console.log(`\n${ color.bgWhite.black(`  ${ input }${ lengthString }  `) }`);
    }

    /**
     * Shows message according to input.
     * 
     * @param {string} input - Text input for message to show.
     */
    showMessage(input)
    {
        this.msg = input;
    }

    /**
     * Shows status, and exits the application on failure.
     * 
     * @param {bool} status
     */
    status(status, message)
    {
        if(status === true)
        {
            process.stdout.write(`  ${ color.green("✔") } ${ this.msg }\n`);
        }
        else if(status === false)
        {
            process.stdout.write(`  ${ color.red("✗") } ${ this.msg }\n`);

            process.stdout.write(`    [ ${message} ]\n\n`);
            process.exit(1);
        }
    }
}

module.exports = Message;
