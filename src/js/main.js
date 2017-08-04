"use strict";

/* Get or create the application global variable */
var App = App || {};

/* IIFE to initialize the main entry of the application*/
(function() {

    // setup the pointer to the scope 'this' variable
    var self = this;

    App.start = function()
    {
        console.log(">> Starting...");

        var dataLoader = new DataLoader();
        dataLoader.initialize();
    }

}) ();