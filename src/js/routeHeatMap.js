"use strict";

var App = App || {};

var RouteHeatMap = function()
{
    var self = this;
    
    //
    /* Global Scope Variables: */
    //
    var svgContainer;
    var gContainer;

    var routeHeatMap;
    var rowLabels;
    var colLabels;

    const textPadding = 4;
    const cellSize = 12;
    const numRows = 40;
    const numCols = 40;

    var margin = {top: 150, bottom: 10, left: 150, right: 10}
    var width  = (numCols * cellSize) + margin.left + margin.right;
    var height = (numRows * cellSize) + margin.top + margin.bottom;

    // Data Containers:
    var defaultGateNames = ["entrance0", "entrance1", "entrance2", "entrance3", "entrance4", "general-gate0", "general-gate1", "general-gate2", "general-gate3", "general-gate4", "general-gate5", "general-gate6", "general-gate7", "ranger-stop0", "ranger-stop1", "ranger-stop2", "ranger-stop3", "ranger-stop4", "ranger-stop5", "ranger-stop6", "ranger-stop7", "camping0", "camping1", "camping2", "camping3", "camping4", "camping5", "camping6", "camping7", "camping8", "gate0", "gate1", "gate2", "gate3", "gate4", "gate5", "gate6", "gate7", "gate8", "ranger-base"];
    var mostEntriesGateNames = ["general-gate7", "ranger-stop0", "ranger-stop2", "general-gate2", "general-gate1", "general-gate4", "general-gate5", "entrance2", "entrance3", "entrance0", "entrance4", "entrance1", "camping8", "camping5", "camping4", "camping3", "camping6", "camping2", "general-gate6", "camping7", "gate8", "ranger-stop6", "gate5", "camping0", "ranger-stop3", "gate3", "gate6", "ranger-base", "ranger-stop5", "gate4", "general-gate3", "ranger-stop7", "gate7", "ranger-stop4", "ranger-stop1", "gate2", "camping1", "general-gate0", "gate1", "gate0"]
    var rowGateNames;
    var colGateNames;
    var routeMatrix;

    self.createSVGs = function()
    {
        svgContainer = d3.select(".routeHeatMapDiv").append("svg")
                                .attr("width", width)
                                .attr("height", height)
                                .attr("viewBox", "0 0 " + width + " " + height);

        gContainer = svgContainer.append("g")
                                .attr("class", "routeHeatMap")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    }

    self.createRouteMatrix = function()
    {
        console.log("Creating Route Matrix...");

        var minEntries = 500;
        var maxEntries = 8000;

        var colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries / 2, maxEntries])
                .range(["#f7885b", "#cb181d", "#67000d"]);

        var keys = d3.keys(routeMatrix);
        routeHeatMap = gContainer.selectAll("locationGroup")
                                .data(keys)
                                .enter()
                                .append("g")
                                .attr("class", "locationGroup")
                                .attr("transform", function(d) { return "transform", "translate(" + 0 + "," + rowGateNames.indexOf(d) * cellSize + ")"})
                                .each(function(fromLocation)
                                {
                                    d3.select(this).selectAll("cell")
                                    .data(keys)
                                    .enter()
                                    .append("rect")
                                    .attr("class", function(toLocation) { return ("cell " + "from" + fromLocation + " " + "to" + toLocation )})
                                    .attr("transform", function(d) { return "transform", "translate(" + colGateNames.indexOf(d) * cellSize + "," + 0 + ")"})
                                    .attr("width", cellSize)
                                    .attr("height", cellSize)
                                    .attr("fill", function(d) 
                                    { 
                                        var numEntries = routeMatrix[fromLocation][d].NumEntries;
                                        
                                        if (numEntries == 0)
                                            return "white";
                                        else if (numEntries < 5)
                                            return "#1f78b4"
                                        else if (numEntries < 50)
                                            return "#33a02c"
                                        else if (numEntries < 100)
                                            return "#f8ff3d"
                                        else if (numEntries < 500)
                                            return "#ff7f00"
                                        else
                                            return colorScale(numEntries);
                                    })
                                    .on("mouseenter", function(toLocation)
                                    {
                                        d3.selectAll(".from" + fromLocation).attr("stroke", "seagreen").attr("stroke-width", "1px")
                                        d3.selectAll(".to" + toLocation).attr("stroke", "seagreen").attr("stroke-width", "1px")

                                        d3.selectAll(".fromlabel" + fromLocation).attr("fill", "yellow")
                                        d3.selectAll(".tolabel" + toLocation).attr("fill", "yellow")
                                    })
                                    .on("mouseleave", function(toLocation)
                                    {
                                        d3.selectAll(".from" + fromLocation).attr("stroke-width", "0px")
                                        d3.selectAll(".to" + toLocation).attr("stroke-width", "0px")

                                        d3.selectAll(".fromlabel" + fromLocation).attr("fill", "lightgrey")
                                        d3.selectAll(".tolabel" + toLocation).attr("fill", "lightgrey")
                                    })
                                    .append("title")
                                    .text(function(d) { return routeMatrix[fromLocation][d].NumEntries;})
                                })

        rowLabels = svgContainer.append("g")
                                    .attr("class", "rowLabels")
                                    .attr("width", margin.left)
                                    .attr("height", height - margin.top)
                                    .attr("transform", "translate(" + 0 + ",0) rotate(0)")
                                    .selectAll("rowLabel")
                                    .data(rowGateNames)
                                    .enter()
                                    .append("text")
                                    .attr("class", function(fromLocation) { return "rowLabel" + " " + "fromlabel" + fromLocation})
                                    .text(function(d) { return d; })
                                    .attr("transform", function(d, i) { return "transform", "translate(" + (margin.left - textPadding) + "," + (margin.top + ((i+1) * cellSize)) + ")"})
                                    .attr("fill", "lightgrey")
                                    .attr("text-anchor", "end")

        colLabels = svgContainer.append("g")
                                    .attr("class", "colLabels")
                                    .attr("width", margin.left)
                                    .attr("height", height - margin.top)
                                    .attr("transform", "translate(0," + (margin.top - textPadding) + ") rotate(-90)")
                                    .selectAll("colLabel")
                                    .data(colGateNames)
                                    .enter()
                                    .append("text")
                                    .attr("class", function(toLocation) { return "colLabel" + " " + "tolabel" + toLocation})
                                    .text(function(d) { return d; })
                                    .attr("transform", function(d, i) { return "transform", "translate(" + 0 + "," + (margin.top + ((i+1) * cellSize)) + ")"})
                                    .attr("fill", "lightgrey")               
    }

    self.createTitles = function()
    {
        var rowTitle = svgContainer.append("text")
                                    .attr("class", "rowTitle")
                                    .text("From Location")
                                    .attr("transform", "translate(" + margin.left / 4 + "," + height / 2 + ") rotate(-90)")
                                    .attr("text-anchor", "middle")
                                    .attr("font-size", "32px")
                                    .attr("fill", "white");

        var colTitle = svgContainer.append("text")
                                    .attr("class", "rowTitle")
                                    .text("To Location")
                                    .attr("transform", "translate(" + width / 2 + "," + margin.top / 4 + ") rotate(0)")
                                    .attr("text-anchor", "middle")
                                    .attr("font-size", "32px")
                                    .attr("fill", "white");


    }

    document.getElementById("routeMatrixOrderMenu").addEventListener("change", sortRoutes, false)
    function sortRoutes()
    {
        var sortType = document.getElementById("routeMatrixOrderMenu").value;

        routeHeatMap.remove();
        rowLabels.remove();
        colLabels.remove();

        if (sortType == "default")
        {
            rowGateNames = defaultGateNames;
            colGateNames = defaultGateNames;
        }
        else if (sortType == "mostEntriesRow")
        {
            rowGateNames = mostEntriesGateNames;
            colGateNames = defaultGateNames;
        }
        else if (sortType == "mostEntriesCol")
        {
            rowGateNames = defaultGateNames;
            colGateNames = mostEntriesGateNames;
        }
        else if (sortType == "mostEntriesBoth")
        {
            rowGateNames = mostEntriesGateNames;
            colGateNames = mostEntriesGateNames;
        }

        self.createRouteMatrix(routeMatrix);
    }

    // If array is fine delete this...
    function sortByEntries()
    {
        var totalKeys = [];
        for (var fromLocation in routeMatrix)
        {
            var totalToLocation = 0;
            for (var toLocation in routeMatrix[fromLocation])
            {
                totalToLocation += routeMatrix[fromLocation][toLocation].NumEntries
            }
            totalKeys.push([fromLocation, totalToLocation]);
        }

        totalKeys.sort(function(a, b)
        {
            if (a[1] < b[1])
                return 1;
            else if (a[1] > b[1])
                return -1
            else
                return 0;
        })

        for (var i = 0; i < rowGateNames.length; i++)
        {
            colGateNames[i] = totalKeys[i][0]
            rowGateNames[i] = totalKeys[i][0]
        }
    }

    var publiclyAvailable = 
    {
        initialize: function(gNames, rMatrix)
        {
            defaultGateNames = gNames.slice();
            rowGateNames = gNames.slice();
            colGateNames = gNames.slice();
            routeMatrix = rMatrix;

            self.createSVGs();
            self.createRouteMatrix();
            self.createTitles();
        },
    };

    return publiclyAvailable;
}