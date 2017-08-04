"use strict";

var App = App || {};

var DataLoader = function()
{
    var self = this;
    
    //
    /* Global Scope Variables: */
    //

    // Data Containers:
    var gateNames = [ "entrance0", "entrance1", "entrance2", "entrance3", "entrance4", "general-gate0", "general-gate1",  "general-gate2", "general-gate3", "general-gate4" , "general-gate5" , "general-gate6" , "general-gate7" , "ranger-stop0" , "ranger-stop1" , "ranger-stop2" , "ranger-stop3" , "ranger-stop4" , "ranger-stop5" , "ranger-stop6" , "ranger-stop7" , "camping0" , "camping1" , "camping2" , "camping3" , "camping4" , "camping5" , "camping6" , "camping7" , "camping8" , "gate0" , "gate1" , "gate2" , "gate3" , "gate4" , "gate5" , "gate6" , "gate7" , "gate8" , "ranger-base" ];

    var dailyData = {};
    var filteredDailyData = { _2AxleCars: {}, _2AxleTrucks: {}, _3AxleTrucks: {}, _4AxleTrucks: {}, _2AxleBuses: {}, _3AxleBuses: {}, _RangerVehicles: {}}

    var hourlyData = {};
    var filteredHourlyData = { _2AxleCars: {}, _2AxleTrucks: {}, _3AxleTrucks: {}, _4AxleTrucks: {}, _2AxleBuses: {}, _3AxleBuses: {}, _RangerVehicles: {}}

    var vehicleData = {};
    var routeMatrix = {};

    self.createVis = function()
    {
        var nodeLinks = {"entrance0": ["general-gate0", "gate0", "general-gate4", "gate6", "entrance3", "general-gate7", "gate7"],
                         "entrance1": ["gate2", "camping2", "camping4", "camping3", "gate1", "camping0", "general-gate7"],
                         "entrance2": ["general-gate3", "gate4", "general-gate6", "gate5", "camping6", "gate8", "entrance4", "camping1", "general-gate2", "general-gate3"],
                         "entrance3": ["gate6", "gate0", "entrance0", "general-gate4", "general-gate1", "general-gate7", "gate7"],
                         "entrance4": ["gate8", "camping6", "gate5", "general-gate6", "general-gate5", "gate4", "entrance2", "general-gate3", "gate3", "camping8", "general-gate2", "camping1", "general-gate0"],
                         "general-gate0": ["general-gate2", "general-gate5", "c2", "g3", "c8", "general-gate3", "e2", "g4", "general-gate6", "g5", "c6", "g8", "e4"],
                         "general-gate1": ["e1", "g0", "rs2", "general-gate4", "g6", "e3", "g7", "general-gate7"],
                         "general-gate2": ["rs0", "general-gate0", "c1", "g3", "c8", "general-gate5", "general-gate3", "e2"],
                         "general-gate3": ["c8", "e2", "g4", "general-gate6", "g5", "g8", "e4", "c6", "general-gate5"],
                         "general-gate4": ["g0", "general-gate1", "e0", "g7", "general-gate7", "g6", "e3"],
                         "general-gate5": ["g4", "e2", "general-gate3", "g3", "c8", "c1", "general-gate0", "general-gate2", "general-gate6", "g5", "c6", "g8", "e4"],
                         "general-gate6": ["c7", "g5", "c6", "g8", "e4", "general-gate5", "g4", "e2", "general-gate3", "g3", "c8", "c1", "general-gate0", "general-gate2"],
                         "general-gate7": ["c5", "rs4", "e1", "g2", "c2", "c4", "c3", "c0", "g1"],
                         "ranger-stop0": ["rs2", "general-gate2"],
                         "ranger-stop1": ["g2"],
                         "ranger-stop2": ["rs0", "general-gate1"],
                         "ranger-stop3": ["g3"],
                         "ranger-stop4": ["c5", "general-gate7"],
                         "ranger-stop5": ["g4"],
                         "ranger-stop6": ["g6", "g5"],
                         "ranger-stop7": ["g7"],
                         "camping0": ["g1", "c3", "c4", "e1", "g2", "c2", "general-gate7"],
                         "camping1": ["general-gate0", "general-gate2", "g3", "c8", "general-gate3", "e2", "general-gate5", "g4", "general-gate6", "g5", "c6", "g8", "e4"],
                         "camping2": ["g2", "e1", "c4", "c3", "c0", "g1", "general-gate7"],
                         "camping3": ["c0", "g1", "c4", "e1", "g2", "c2", "general-gate7"],
                         "camping4": ["c3", "c0", "g1", "e1", "g2", "c2", "general-gate7"],
                         "camping5": ["rs4", "general-gate7"],
                         "camping6": ["g8", "e4", "g5", "general-gate6", "general-gate5", "g4", "e2", "general-gate3", "g3", "c8", "c1", "general-gate2", "general-gate0"],
                         "camping7": ["general-gate6"],
                         "camping8": ["general-gate3", "g3", "c1", "general-gate2", "general-gate0", "general-gate5", "e2", "g4", "general-gate6", "g5", "c6", "g8", "e4"],
                         "gate0": ["e0", "general-gate1", "general-gate4", "g6", "e3", "g7", "general-gate7", "g1",],
                         "gate1": ["g0", "c0", "c3", "c4", "e1", "g2", "c2", "g7"],
                         "gate2": ["rs1", "c2", "e1", "c4", "c3", "c0", "g1", "general-gate7"],
                         "gate3": ["rs3", "c8", "general-gate2", "c1", "general-gate0", "general-gate5", "general-gate3", "e2", "g4", "general-gate6", "g5", "c6", "g8", "e4"],
                         "gate4": ["rs5", "e2", "general-gate3", "general-gate5", "c1", "general-gate2", "general-gate0", "general-gate6", "g5", "c6", "g8", "e4"],
                         "gate5": ["rs6", "general-gate6", "c6", "g8", "e4", "general-gate5", "g4", "e2", "general-gate3", "g3", "c8", "c1", "general-gate2", "general-gate0"],
                         "gate6": ["rs6", "e3", "general-gate4", "general-gate7", "g7", "g0", "general-gate1", "e0"],
                         "gate7": ["rs7", "general-gate7", "general-gate4", "g6", "e3", "g0", "general-gate1", "e0"],
                         "gate8": ["rb", "e4", "c6", "g5", "general-gate6", "general-gate5", "g4", "e2", "general-gate3", "g3", "c8", "c1", "general-gate2", "general-gate0"],
                         "ranger-base": ["g8"]};

        // console.log(nodeLinks["entrance0"].includes("gate0"));
                         
        console.log("NODE LINKS:")
        console.log(nodeLinks);
        var routeHeatMap = new RouteHeatMap();
        routeHeatMap.initialize(gateNames, routeMatrix);

        var dailyHeatMap = new DailyHeatMap();
        dailyHeatMap.initialize(gateNames, dailyData, filteredDailyData);

        var hourlyHeatMap = new HourlyHeatMap();
        hourlyHeatMap.initialize(gateNames, dailyData, filteredDailyData);
    }

    self.getRouteMatrixData = function()
    {
        for (var i = 0; i < gateNames.length; i++)
        {
            routeMatrix[gateNames[i]] = {}

            for (var j = 0; j < gateNames.length; j++)
                routeMatrix[gateNames[i]][gateNames[j]] = {NumEntries: 0}
        }

        // For each vehicle...
        for (var carID in vehicleData)
        {
            // If their route is at least 2 locations...
            var route = vehicleData[carID].Route;
            var routeLength = vehicleData[carID].Route.length;

            if (routeLength >= 2)
            {
                // For each location in the route...
                for (var i = 0; i < routeLength - 1; i++)
                {
                    var fromLocation = route[i].Location;
                    var toLocation   = route[i + 1].Location;

                    routeMatrix[fromLocation][toLocation].NumEntries++;
                }
            }
        }

        // console.log(routeMatrix)
    }

    var createEmptyHoursArray = function()
    {
        var emptyHours = {};

        for (var i = 0; i < 24; i++)
        {
            var hour = i.toString();
            if (i < 10)
                hour = "0" + hour;

            emptyHours[hour] = {NumEntries: 0}
        }
        
        return emptyHours;
    }

    var createEmptyGatesArray = function()
    {
        var emptyGates = {};
        
        for (var i = 0; i < gateNames.length; i++)
            emptyGates[gateNames[i]] = { Vehicles: [], HourlyData: createEmptyHoursArray(), NumEntries: 0}

        return emptyGates;
    }

    self.loadData = function()
    {
        console.log(">> Loading Data...");

        var dateFormat = d3.timeFormat("%Y-%m-%d");

        var fileDir = "data/LekagulSensorData.csv"
        
        d3.csv(fileDir).row(function(d)
        {
            // Data Variables
            var timestamp = d["Timestamp"];
            var date = dateFormat(new Date(timestamp));

            var carID = d["car-id"];
            var carType = d["car-type"];

            var gateName = d["gate-name"];

            // dailyData
            if (!dailyData[date])
            {
                dailyData[date] = { SensorData: createEmptyGatesArray() };
                filteredDailyData._2AxleCars[date] = { SensorData: createEmptyGatesArray() };
                filteredDailyData._2AxleTrucks[date] = { SensorData: createEmptyGatesArray() };
                filteredDailyData._3AxleTrucks[date] = { SensorData: createEmptyGatesArray() };
                filteredDailyData._4AxleTrucks[date] = { SensorData: createEmptyGatesArray() };
                filteredDailyData._2AxleBuses[date] = { SensorData: createEmptyGatesArray() };
                filteredDailyData._3AxleBuses[date] = { SensorData: createEmptyGatesArray() };
                filteredDailyData._RangerVehicles[date] = { SensorData: createEmptyGatesArray() };
            }
                

            dailyData[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
            dailyData[date].SensorData[gateName].NumEntries++;

            var formatHour = d3.timeFormat("%H");
            var hour = formatHour(new Date(timestamp)).toString();

            dailyData[date].SensorData[gateName].HourlyData[hour].NumEntries++;

            switch(carType)
            {
                case "1":
                    filteredDailyData._2AxleCars[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
                    filteredDailyData._2AxleCars[date].SensorData[gateName].NumEntries++;
                    filteredDailyData._2AxleCars[date].SensorData[gateName].HourlyData[hour].NumEntries++;
                    break;
                case "2":
                    filteredDailyData._2AxleTrucks[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
                    filteredDailyData._2AxleTrucks[date].SensorData[gateName].NumEntries++;
                    filteredDailyData._2AxleTrucks[date].SensorData[gateName].HourlyData[hour].NumEntries++;
                    break;
                case "3":
                    filteredDailyData._3AxleTrucks[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
                    filteredDailyData._3AxleTrucks[date].SensorData[gateName].NumEntries++;
                    filteredDailyData._3AxleTrucks[date].SensorData[gateName].HourlyData[hour].NumEntries++;
                    break;
                case "4":
                    filteredDailyData._4AxleTrucks[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
                    filteredDailyData._4AxleTrucks[date].SensorData[gateName].NumEntries++;
                    filteredDailyData._4AxleTrucks[date].SensorData[gateName].HourlyData[hour].NumEntries++;
                    break;
                case "5":
                    filteredDailyData._2AxleBuses[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
                    filteredDailyData._2AxleBuses[date].SensorData[gateName].NumEntries++;
                    filteredDailyData._2AxleBuses[date].SensorData[gateName].HourlyData[hour].NumEntries++;
                    break;
                case "6":
                    filteredDailyData._3AxleBuses[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
                    filteredDailyData._3AxleBuses[date].SensorData[gateName].NumEntries++;
                    filteredDailyData._3AxleBuses[date].SensorData[gateName].HourlyData[hour].NumEntries++;
                    break;
                case "2P":
                    filteredDailyData._RangerVehicles[date].SensorData[gateName].Vehicles.push({Timestamp: timestamp, CarType: carType, CarID: carID})
                    filteredDailyData._RangerVehicles[date].SensorData[gateName].NumEntries++;
                    filteredDailyData._RangerVehicles[date].SensorData[gateName].HourlyData[hour].NumEntries++;
                    break;
            }

            // vehicleData
            if (!vehicleData[carID])
                vehicleData[carID] = { CarType: carType, Route: [] }

            vehicleData[carID].Route.push({ Location: gateName, Timestamp: timestamp})
        })
        .get(function()
        {
            self.getRouteMatrixData();
            console.log(dailyData)
            // console.log(vehicleData)
            self.createVis();
        })
    }

    //
    /* Publicly Available Functions: */
    //

    var publiclyAvailable = 
    {
        initialize: function()
        {
            self.loadData()
        },
    };

    return publiclyAvailable;
}