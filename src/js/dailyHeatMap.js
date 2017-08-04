"use strict"

var App = App || {};

var DailyHeatMap = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //
    var svgContainer;
    var gContainer;

    var dailyHeatMap;
    var rowLabels;
    var colLabels;

    var dateOrder;

    const cellSize = 10;

    var width;
    var height;
    var margin = {left: cellSize * 10, right: cellSize, top: cellSize * 10, bottom: cellSize}
    var textPadding = 4;

    // Data Containers:
    var gateNames;
    var allDailyData;
    var dailyData;
    var filteredDailyData;

    self.createSVGs = function()
    {
         width = (cellSize * Object.keys(dailyData).length) + margin.left + margin.right;
         height = (cellSize * 40) + margin.top + margin.bottom;

        svgContainer = d3.select(".dailyHeatMapDiv").append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .attr("viewBox", "0 0 " + width + " " + height);

        gContainer = svgContainer.append("g")
                            .attr("class", "dailyHeatMap")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    }

    self.getMinMaxEntries = function()
    {
        var minEntries = Infinity;
        var maxEntries = 0;

        for (var day in dailyData)
        {
            for (var sensor in dailyData[day].SensorData)
            {
                var numEntries = dailyData[day].SensorData[sensor].NumEntries;

                if (numEntries < minEntries)
                    minEntries = numEntries;
                
                if (numEntries > maxEntries)
                    maxEntries = numEntries;
            }
        }

        return {MinEntries: minEntries, MaxEntries: maxEntries}
    }

    self.createDailyHeatMap = function()
    {
        var MinMax = self.getMinMaxEntries();

        var minEntries = MinMax.MinEntries;
        var maxEntries = MinMax.MaxEntries;

        var colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/8), maxEntries * (2/8), maxEntries * (3/8), maxEntries * (4/8), maxEntries * (5/8), maxEntries * (6/8), maxEntries * (7/8), maxEntries])
                .range(["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]);

        dailyHeatMap = gContainer.selectAll("dailyGroup")
                            .data(dateOrder)
                            .enter()
                            .append("g")
                            .attr("class", "dayGroup")
                            .attr("transform", function(date) { return "translate(" + dateOrder.indexOf(date) * cellSize + "," + 0 + ")" })
                            .each(function(date)
                            {
                                var sensorData = dailyData[date].SensorData;

                                d3.select(this).selectAll("dayCell")
                                .data(gateNames)
                                .enter()
                                .append("rect")
                                .attr("class", function(sensorName) { return "dayCell" + " " + sensorName + " " + "_" + date })
                                .attr("width", cellSize)
                                .attr("height", cellSize)
                                .attr("transform", function(sensorName) { return "translate(" + 0 + "," + gateNames.indexOf(sensorName) * cellSize + ")" })
                                .attr("fill", function(sensorName) 
                                { 
                                    var numEntries = sensorData[sensorName].NumEntries;

                                    if (numEntries == 0)
                                        return "lightgrey"
                                    else
                                        return colorScale(numEntries)
                                })
                                .on("mouseenter", function(sensorName)
                                {
                                    d3.selectAll("." + sensorName).attr("stroke", "seagreen").attr("stroke-width", "1px");
                                    d3.selectAll("._" + date).attr("stroke", "seagreen").attr("stroke-width", "1px");
                                })
                                .on("mouseleave", function(sensorName)
                                {
                                    d3.selectAll("." + sensorName).attr("stroke-width", "0px");
                                    d3.selectAll("._" + date).attr("stroke-width", "0px");
                                })
                                .append("title")
                                .text(function(sensorName) 
                                {
                                    var weekDayName = d3.timeFormat("%A");

                                    return ("Date: " + date + " (" + weekDayName(new Date(date)) + ")" + "\n" + "Entries: " + sensorData[sensorName].NumEntries);
                                })
                            })

            // var zoomG = d3.zoom()
            //                 .scaleExtent([1, 50])
            //                 .on("zoom", function()
            //                 {
            //                     var tx = Math.min(0, Math.max(d3.event.transform.x, width - width * d3.event.transform.k));
            //                     var ty = Math.min(0, Math.max(d3.event.transform.y, height - height * d3.event.transform.k));

            //                     gContainer.attr("transform", d3.event.transform);
            //                 })

            // gContainer.call(zoomG)

            rowLabels = svgContainer.append("g")
                                    .attr("class", "heatMapRowLabels")
                                    .attr("width", margin.left)
                                    .attr("height", height - margin.top)
                                    .attr("transform", "translate(" + (margin.left - textPadding) + ",0) rotate(0)")
                                    .selectAll("heatMapRowLabel")
                                    .data(gateNames)
                                    .enter()
                                    .append("text")
                                    .text(function(d) { return d })
                                    .attr("transform", function(d, i) { return "transform", "translate(" + 0 + "," + (margin.top + ((i+1) * cellSize - 1)) + ")"})
                                    .attr("fill", "lightgrey")
                                    .attr("font-size", function() { return cellSize })
                                    .attr("text-anchor", "end")

            colLabels = svgContainer.append("g")
                                    .attr("class", "heatMapColLabels")
                                    .attr("width", margin.left)
                                    .attr("height", height - margin.top)
                                    .attr("transform", "translate(0," + (margin.top - textPadding) + ") rotate(-90)")
                                    .selectAll("heatMapColLabel")
                                    .data(dateOrder)
                                    .enter()
                                    .append("text")
                                    .text(function(d) { return d })
                                    .attr("transform", function(d, i) { return "transform", "translate(" + 0 + "," + (margin.top + ((i+1) * cellSize)) + ")"})
                                    .attr("fill", "lightgrey")
                                    .attr("font-size", function() { return cellSize })
    }

    self.createTitles = function()
    {
        var rowTitle = svgContainer.append("text")
                                    .attr("class", "heatMapRowTitle")
                                    .text("Sensor Location")
                                    .attr("transform", "translate(" + margin.left / 4 + "," + height / 2 + ") rotate(-90)")
                                    .attr("text-anchor", "middle")
                                    .attr("font-size", function() { return cellSize * 3 })
                                    .attr("fill", "white");

        var colTitle = svgContainer.append("text")
                                    .attr("class", "heatMapColTitle")
                                    .text("Date")
                                    .attr("transform", "translate(" + width / 2 + "," + margin.top / 3 + ") rotate(0)")
                                    .attr("text-anchor", "middle")
                                    .attr("font-size", function() { return cellSize * 3 })
                                    .attr("fill", "white");
    }

    document.getElementById("heatMapOrderMenu").addEventListener("change", sortHeatMap, false)
    function sortHeatMap()
    {
        var sortType = document.getElementById("heatMapOrderMenu").value;

        dailyHeatMap.remove();
        rowLabels.remove();
        colLabels.remove();

        if (sortType == "default")
        {
            dateOrder = Object.keys(dailyData)
        }
        else if (sortType == "busiestDay")
        {
            sortByBusiestDay();
        }
        else if (sortType == "busiestMonth")
        {
            sortByBusiestMonth();
        }
        else if (sortType == "dayOfWeek")
        {
            sortByDayOfWeek();
        }

        self.createDailyHeatMap();
    }

    function sortByBusiestDay()
    {
        dateOrder.sort(function(a, b)
        {
            var dayATotalEntries = 0;
            var dayBTotalEntries = 0;

            for (var sensorName in dailyData[a].SensorData)
                dayATotalEntries += dailyData[a].SensorData[sensorName].NumEntries;

            for (var sensorName in dailyData[b].SensorData)
                dayBTotalEntries += dailyData[b].SensorData[sensorName].NumEntries;

            if (dayATotalEntries > dayBTotalEntries)
                return -1;
            else
                return 1;
        })
    }

    function sortByBusiestMonth()
    {
        // 1 - January ... 12 - December
        var totalMonthCounts = {}

        for (var date in dailyData)
        {
            var totalEntryCount = 0;

            for (var sensorName in dailyData[date].SensorData) {
                totalEntryCount += dailyData[date].SensorData[sensorName].NumEntries;
            }

            var formatMonthYear = d3.timeFormat("%m-%Y")

            var monthYear = formatMonthYear(new Date(date + " 0:00:00"))
            
            if (!totalMonthCounts[monthYear]) {
                totalMonthCounts[monthYear] = { Date: monthYear, NumEntries: 0 }
                console.log(monthYear,date);
            }

            totalMonthCounts[monthYear].NumEntries += totalEntryCount;
        }

        var monthKeys = Object.keys(totalMonthCounts);
        monthKeys.sort(function(a, b)
        {
            return totalMonthCounts[b].NumEntries - totalMonthCounts[a].NumEntries;
        })

        dateOrder.sort(function(a, b)
        {
            var formatMonthYear = d3.timeFormat("%m-%Y")
            var dateFormat = d3.timeFormat("%Y-%m-%d");

            var dateA = new Date(a)
            var dateB = new Date(b)

            var monthYearA = formatMonthYear(new Date(a + " 0:00:00"))
            var monthYearB = formatMonthYear(new Date(b + " 0:00:00"))

            if (monthKeys.indexOf(monthYearA) == monthKeys.indexOf(monthYearB))
            {
                if (dateA.getTime() < dateB.getTime())
                    return -1;
                else if (dateA.getTime() > dateB.getTime())
                    return 1;
            }

            return (monthKeys.indexOf(monthYearA) - monthKeys.indexOf(monthYearB))
        })
    }

    function sortByDayOfWeek()
    {
        dateOrder.sort(function(a, b)
        {
            var formatDay = d3.timeFormat("%w");

            var dateA = new Date(a);
            var dateB = new Date(b);

            var weekDayA = formatDay(dateA)
            var weekDayB = formatDay(dateB)

            if (weekDayA == 0)
                weekDayA = 7;
            if (weekDayB == 0)
                weekDayB = 7;

            if (weekDayA == weekDayB)
            {
            if (dateA.getTime() < dateB.getTime())
                return -1;
            else if (dateA.getTime() > dateB.getTime())
                return 1;
            }

            return weekDayA - weekDayB;
        })
    }

    document.getElementById("heatMapFilterMenu").addEventListener("change", filterHeatMap, false)
    function filterHeatMap()
    {
        var filterType = document.getElementById("heatMapFilterMenu").value;

        dailyHeatMap.remove();
        rowLabels.remove();
        colLabels.remove();

        switch(filterType)
        {
            case "default":          dailyData = allDailyData; break;
            case "2AxleCars":        dailyData = filteredDailyData._2AxleCars; break;
            case "2AxleTrucks":      dailyData = filteredDailyData._2AxleTrucks; break;
            case "3AxleTrucks":      dailyData = filteredDailyData._3AxleTrucks; break;
            case "4AxleTrucks":      dailyData = filteredDailyData._4AxleTrucks; break;
            case "2AxleBuses":       dailyData = filteredDailyData._2AxleBuses; break;
            case "3AxleBuses":       dailyData = filteredDailyData._3AxleBuses; break;
            case "RangerVehicles":   dailyData = filteredDailyData._RangerVehicles; break;
        }

        self.createDailyHeatMap();
    }

    document.getElementById("dailyHeatMapDiv").addEventListener("contextmenu", showUserInfo, false)
    function showUserInfo(e)
    {
        e.preventDefault();

        var textContent = e.target.textContent;
        var gateKey     = e.target.__data__;

        var dateKey = textContent.substring(6, 16)
        
        var list = d3.select("#vehicleInfoSidebar")

        // while (list.hasChildNodes())
        // {
        //     list.removeChild(list.lastChild)
        //     console.log(list.lastChild)
        // }


        var vehicleData = dailyData[dateKey].SensorData[gateKey].Vehicles;
        for (var i = 0; i < vehicleData.length; i++)
        {
            var carID   = vehicleData[i].CarID;
            var carType = vehicleData[i].CarType;

            list.append("li")
                .append("a")
                    .attr("href", "#")
                    .html(function() { return "Car ID: " + carID + "<br/>" +  "Car Type: " + carType})
        }

    }

    var publiclyAvailable =
    {
        initialize: function(gNames, dData, fData)
        {
            gateNames = gNames;
            allDailyData = dData;
            dailyData = dData;
            filteredDailyData = fData;

            dateOrder = Object.keys(dailyData);

            self.createSVGs();
            self.createDailyHeatMap();
            self.createTitles();
        }
    }

    return publiclyAvailable;
}