function drawCharts(aggregatedData, chartType, dateFrom, dateTo, categoriesSelected, personsSelected, display) {

    if (dateFrom === "None") {
        dateFrom = aggregatedData[0].date;
    }
    else {
        dateFrom = new Date(dateFrom);
    }

    if (dateTo === "None") {
        dateTo = aggregatedData[aggregatedData.length - 1].date;
    }
    else {
        dateTo = new Date(dateTo);
    }

    var dateFromWrapper = moment(dateFrom);
    var dateToWrapper = moment(dateTo);

    var displayBins = [];

    if (display == "category") {
        displayBins = categoriesSelected;
    }
    else if (display == "person") {
        displayBins = personsSelected;
    }
    else if (display == "year") {
        var incrementedDate = moment(dateFrom);

        var fromString = incrementedDate.format('YYYY');
        var toString = dateToWrapper.format('YYYY');

        while (moment(fromString).isSameOrBefore(moment(toString))) {
            displayBins.push(incrementedDate.format('YYYY'));
            incrementedDate.add(1, 'y');
            fromString = incrementedDate.format('YYYY');
        }

    }
    else if (display == "month") {
        var incrementedDate = moment(dateFrom).startOf('month');

        while (incrementedDate.isSameOrBefore(dateToWrapper)) {
            displayBins.push(incrementedDate.format('MMM YYYY'));
            incrementedDate.add(1, 'M');
        }

        console.log(displayBins);
    }
    else if (display == "week") {
        var incrementedDate = moment(dateFrom).startOf('week');

        while (incrementedDate.isSameOrBefore(dateToWrapper)) {
            displayBins.push("Week of " + incrementedDate.format('MMM Do, YYYY'));
            incrementedDate.add(1, 'w');
        }

        console.log(displayBins);
    }
    else if (display == "day") {
        var incrementedDate = moment(dateFrom);

        while (incrementedDate.isSameOrBefore(dateToWrapper)) {
            displayBins.push(incrementedDate.format('MMM Do, YYYY'));
            incrementedDate.add(1, 'd');
        }

        console.log(displayBins);
    }


    var amounts = {};
    for (var i = 0; i < displayBins.length; i++) {
        amounts[displayBins[i]] = 0;
    }

    for (var i = 0; i < aggregatedData.length; i++) {

        var checkDateFrom = aggregatedData[i].date >= dateFrom;
        var checkDateTo = aggregatedData[i].date <= dateTo;
        var checkPersons = personsSelected.indexOf(aggregatedData[i].person.toLowerCase()) > -1;
        var checkCategories = categoriesSelected.indexOf(aggregatedData[i].category.toLowerCase()) > -1;
        
        if (checkDateFrom && checkDateTo && checkCategories && checkPersons) {
            if (display == "category") {
                amounts[aggregatedData[i].category.toLowerCase()] += aggregatedData[i].amount;
            }
            else if (display == "person") {
                amounts[aggregatedData[i].person.toLowerCase()] += aggregatedData[i].amount;
            }
            else if (display == "year") {
                var tempDate = new Date(aggregatedData[i].date);
                var dateWrapper = moment(tempDate);
                amounts[dateWrapper.format('YYYY')] += aggregatedData[i].amount;
            }
            else if (display == "month") {
                var tempDate = new Date(aggregatedData[i].date);
                var dateWrapper = moment(tempDate).startOf('month');
                amounts[dateWrapper.format('MMM YYYY')] += aggregatedData[i].amount;
            }      
            else if (display == "week") {
                var tempDate = new Date(aggregatedData[i].date);
                var dateWrapper = moment(tempDate).startOf('week');
                amounts["Week of " + dateWrapper.format('MMM Do, YYYY')] += aggregatedData[i].amount;
            }  
            else if (display == "day") {
                var tempDate = new Date(aggregatedData[i].date);
                var dateWrapper = moment(tempDate);
                amounts[dateWrapper.format('MMM Do, YYYY')] += aggregatedData[i].amount;
            }   
 
        }
    }

    for (var i = 0; i < displayBins.length; i++) {
      amounts[displayBins[i]] = parseFloat(Math.round(amounts[displayBins[i]] * 100) / 100).toFixed(2);
    }

    if (chartType == "pie"){
        var chartData = [];
        for (var i=0; i < displayBins.length; i++) {
          chartData.push({
            value: amounts[displayBins[i]],
            label: displayBins[i],
            color: '#'+Math.floor(Math.random()*16777215).toString(16)
          });
        }

        var dataChart = new Chart(canvas).Pie(chartData);

    } else if (chartType == "line") {
        var lineLabels = Object.keys(displayBins).map(function(k) {
            return displayBins[k].charAt(0).toUpperCase() + displayBins[k].slice(1);
        });

        var amountsData = [];
        for (var i=0; i < displayBins.length; i++) {
          amountsData.push(amounts[displayBins[i]]);
        }

        var chartData = {
            labels: lineLabels,
            datasets: [
                {
                    fillColor : "rgba(172,194,132,0.4)",
                    strokeColor : "#ACC26D",
                    pointColor : "#fff",
                    pointStrokeColor : "#9DB86D",
                    data: amountsData
                }
            ]
        }

        var dataChart = new Chart(canvas).Line(chartData);
    }

}
