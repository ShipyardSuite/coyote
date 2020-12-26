const should = require('chai').should();
const ModuleName = require('../index');

const module = new ModuleName();

describe('- Module', function ()
{
    it('should return something.', function ()
    {
        module.Test().should.equal('     ');
    });
});