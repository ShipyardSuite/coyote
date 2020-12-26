#! /usr/bin/env node

const path = require('path');
const os = require('os');
const fs = require('fs');
const exec = require('child_process').exec;
const yaml = require('js-yaml');

class Coyote
{
    constructor()
    {

    }

    init = () =>
    {
        console.log("test");
    }
}

const coyote = new Coyote();
coyote.init();