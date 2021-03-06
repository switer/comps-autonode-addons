'use strict'

var assert = require('assert')
var comps = require('comps')
var vm = require("vm");
require('../index')(comps)

comps.componentLoader(function (name) {
	return '<' + name + '></' + name + '>'
})
describe('Parse', function () {
    it('# if', function() {
        var result = comps({
            template: '{% if $is="true" %}abc{%/if%}'
        })
        assert.equal(result, '${(function(){if(true){return `abc`}})()||""}')
        assert.equal(vm.runInNewContext('`' + result + '`', {}), 'abc')
    })
    it('# else', function () {
        var result = comps({
            template: '{% else /%}'
        })
        assert.equal(result, '`}else{return `')

        result = comps({
            template: '{% else $if="true"/%}'
        })
        assert.equal(result, '`}else if(true){return `')

        result = comps({
            template: '{%if $is="false"%}abc{% else $if="true"/%}def{%/if%}'
        })
        assert.equal(result, '${(function(){if(false){return `abc`}else if(true){return `def`}})()||""}')
        assert.equal(vm.runInNewContext('`' + result + '`', {}), 'def')
    })
    it('# foreach', function() {
        var result = comps({
            template: '{% foreach $arr="items" $as="v" %}<li></li>{%/foreach%}'
        })
        assert.equal(result, "${(items.length ? items : []).map(function (v,$index) {return `<li></li>`}).join('')}")
    })
    it('# foreach obj', function() {
        var result = comps({
            template: '{% foreach $obj="items" $as="v" %}<li></li>{%/foreach%}'
        })
        assert.equal(result, "${Object.keys(items).map(function($key,$index) {var v=items[$key];return `<li></li>`}).join('')}")
    })
    it('# component using with', function() {
        var result = comps({
            template: '{% component $id="header" with="value"/%}'
        })
        assert.equal(result, '${function($value){with($value){return `<header></header>`}}(value)}')
    })
    it('# scope', function() {
        var result = comps({
            template: '{%scope name="comps" plugin="autonode" %}<li>${abc}</li>{%/scope%}'
        })
        assert.equal(result, '${(function (name,plugin) {return `<li>${abc}</li>`})(comps,autonode)||""}')
    })
    it('# /(comment)', function () {
        var result = comps({
            template: '<div>{%/ 这是注释 /%}</div>'
        })
        assert.equal(result, '<div></div>')
    })
    it('# function', function () {
        var result = comps({
            template: '{%function param=123 %}return param{%/function%}'
        })
        assert.equal(result, '${(function (param) {return param})(123)||""}')
    })
})