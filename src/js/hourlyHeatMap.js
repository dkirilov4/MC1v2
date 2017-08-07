"use strict"

var App = App || {};

var HourlyHeatMap = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //
    var svgContainer;
    var gContainer;

    var hourlyHeatMap;
    var rowLabels;
    var colLabels;
    var dateLabel;

    var gateNames;
    var dailyData;
    var filteredDailyData;
    var hourOrder = [];
    var hourLabels = [];
    var date;

    const cellSize = 10;

    var width;
    var height;
    var margin = {left: cellSize * 10, right: cellSize, top: cellSize * 10, bottom: cellSize * 4}
    var textPadding = 4;


    self.createSVGs = function()
    {
        width = (cellSize * 24) + margin.left + margin.right + 150;
        height = (cellSize * 40) + margin.top + margin.bottom;

        svgContainer = d3.select(".hourlyHeatMapDiv").append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .attr("viewBox", "0 0 " + width + " " + height);

        gContainer = svgContainer.append("g")
                            .attr("class", "hourlyHeatMap")
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
                for (var hour in dailyData[day].SensorData[sensor].HourlyData)
                {
                    var numEntries = dailyData[day].SensorData[sensor].HourlyData[hour].NumEntries;

                    if (numEntries < minEntries)
                        minEntries = numEntries;

                    if (numEntries > maxEntries)
                        maxEntries = numEntries;
                }
            }
        }

        return {MinEntries: minEntries, MaxEntries: maxEntries}
    }

    self.createHourlyHeatMap = function()
    {
        date = "2015-07-04";
        var MinMax = self.getMinMaxEntries();

        var minEntries = MinMax.MinEntries;
        var maxEntries = MinMax.MaxEntries;

        var colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/8), maxEntries * (2/8), maxEntries * (3/8), maxEntries * (4/8), maxEntries * (5/8), maxEntries * (6/8), maxEntries * (7/8), maxEntries])
                .range(["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]);

        var sensorData = dailyData[date].SensorData;
        var sensorDataKeys = Object.keys(dailyData[date].SensorData);
        hourlyHeatMap = gContainer.selectAll("gateGroup")
                            .data(sensorDataKeys)
                            .enter()
                            .append("g")
                            .attr("class", function(sensor) {return "gateGroup" })
                            .attr("transform", function(sensor) { return "translate(0, " + sensorDataKeys.indexOf(sensor) * cellSize + ")" })
                            .each(function(sensor)
                            {
                                var hourlyData = sensorData[sensor].HourlyData;
                                d3.select(this).selectAll("hourlyBin")
                                    .data(Object.keys(sensorData[sensor].HourlyData))
                                    .enter()
                                    .append("rect")
                                    .attr("class", function(hour) { return "hourlyBin" + " " + "hourly" + hour + " " + "hourly" + sensor })
                                    .attr("transform", function(hour) { return "translate(" + hourOrder.indexOf(hour) * cellSize + ", 0)"})
                                    .attr("width", cellSize)
                                    .attr("height", cellSize)
                                    .attr("fill", function(hour) { return (colorScale(hourlyData[hour].NumEntries)) })
                                    .on("mouseenter", function(hour)
                                    {
                                        d3.selectAll(".hourly" + hour).attr("stroke", "seagreen").attr("stroke-width", "1px");
                                        d3.selectAll(".hourly" + sensor).attr("stroke", "seagreen").attr("stroke-width", "1px");
                                    })
                                    .on("mouseleave", function(hour)
                                    {
                                        d3.selectAll(".hourly" + hour).attr("stroke-width", "0px");
                                        d3.selectAll(".hourly" + sensor).attr("stroke-width", "0px");
                                    })
                                    .append("title")
                                    .text(function(hour) { return "Date: " + date + "\nHour: " + hour + "\nEntries: " + hourlyData[hour].NumEntries})
                            });

        rowLabels = svgContainer.append("g")
                                    .attr("class", "hourlyHeatMapRowLabels")
                                    .attr("width", margin.left)
                                    .attr("height", height - margin.top)
                                    .attr("transform", "translate(" + (margin.left - textPadding) + ",0) rotate(0)")
                                    .selectAll("hourlyHeatMapRowLabel")
                                    .data(gateNames)
                                    .enter()
                                    .append("text")
                                    .text(function(d) { return d })
                                    .attr("transform", function(d, i) { return "transform", "translate(" + 0 + "," + (margin.top + ((i+1) * cellSize - 1)) + ")"})
                                    .attr("fill", "lightgrey")
                                    .attr("font-size", function() { return cellSize })
                                    .attr("text-anchor", "end")

        colLabels = svgContainer.append("g")
                                    .attr("class", "hourlyHeatMapColLabels")
                                    .attr("width", margin.left)
                                    .attr("height", height - margin.top)
                                    .attr("transform", "translate(0," + (margin.top - textPadding) + ") rotate(-90)")
                                    .selectAll("hourlyHeatMapColLabel")
                                    .data(hourLabels)
                                    .enter()
                                    .append("text")
                                    .text(function(d) { return d })
                                    .attr("transform", function(d, i) { return "transform", "translate(" + 0 + "," + (margin.top + ((i+1) * cellSize - 1)) + ")"})
                                    .attr("fill", "lightgrey")
                                    .attr("font-size", function() { return cellSize })

        dateLabel = svgContainer.append("text")
                                    .text(function(d)
                                    {
                                        var weekDayFormat = d3.timeFormat("%A");
                                        var weekDay = new Date(date);
                                        return date + "(" + weekDayFormat(weekDay) + ")";
                                    })
                                    .attr("fill", "lightgrey")
                                    .attr("font-size", cellSize * 2)
                                    .attr("transform", function() { return "translate(" + (width / 3) + "," + ( height - cellSize * 2) + ")" })

          //Append a defs (for definition) element to your SVG
          var defs = gContainer.append("defs");

          //Append a linearGradient element to the defs and give it a unique id
          var linearGradient = defs.append("linearGradient")
               .attr("id", "linear-gradient");

          linearGradient.selectAll("stop")
                .data( colorScale.range() )
                .enter().append("stop")
                .attr("offset", function(d,i) {return i/(colorScale.range().length-1); })
                .attr("stop-color", function(d) { return d; });

          // create the rectangle which will hold our gradient
         var gradientMain =
           gContainer.append("rect")
        	.attr("width", 400)
        	.attr("height", 20)
          .attr("transform", "rotate(270,0,0)")
          .attr("x", -400)
          .attr("y", 250)
          .style("fill", "url(#linear-gradient)");

            //Append multiple color stops by using D3's data/enter step
          linearGradient.selectAll("stop")
              .data( colorScale.range() )
              .enter().append("stop")
              .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
              .attr("stop-color", function(d) { return d; });

              var scale = d3.scaleLinear()  // v4
                                    .domain([0, maxEntries])
                                    .range([0, 400]); // clipped
                      var axisGroup = gContainer.append("g");
                      var axis = d3.axisRight()
                                   .scale(scale)
                      axisGroup.call(axis)
                                    .attr("transform","translate(270,0)");
    }

    var publiclyAvailable =
    {
        initialize: function(gNames, dData, fData)
        {
            gateNames = gNames;
            dailyData = dData;
            filteredDailyData = fData;

            for (var i = 0; i < 24; i++)
            {
                var hour = i.toString();

                if (i < 10)
                    hour = "0" + hour;

                hourOrder.push(hour);

                hour = hour + ":00";
                hourLabels.push(hour)
            }

            self.createSVGs();
            self.createHourlyHeatMap();
        }
    }

    return publiclyAvailable;
}
