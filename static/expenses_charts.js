function drawCharts(aggregatedData, chartType, dateFrom, dateTo, categoriesSelected, personsSelected, display) {

    if (dateFrom === "None") {
        var dateFrom = moment(aggregatedData[0].date);
    }
    else {
        var dateFrom = moment(new Date(dateFrom));
    }

    if (dateTo === "None") {
        var dateTo = moment(aggregatedData[aggregatedData.length - 1].date);
    }
    else {
        var dateTo = moment(new Date(dateTo));
    }

    var incrementedDate = moment(dateFrom);

    var displayBins = [];

    if (display == "category") {
        displayBins = categoriesSelected;
    }
    else if (display == "person") {
        displayBins = personsSelected;
    }
    else if (display == "year") {
        incrementedDate.startOf('year');

        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push(incrementedDate.format('YYYY'));
            incrementedDate.add(1, 'y');
        }
    }
    else if (display == "month") {
        incrementedDate.startOf('month');

        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push(incrementedDate.format('MMM YYYY'));
            incrementedDate.add(1, 'M');
        }
    }
    else if (display == "week") {
        incrementedDate.startOf('week');

        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push("Week of " + incrementedDate.format('MMM Do, YYYY'));
            incrementedDate.add(1, 'w');
        }
    }
    else if (display == "day") {
        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push(incrementedDate.format('MMM Do, YYYY'));
            incrementedDate.add(1, 'd');
        }
    }


    var amounts = {};
    for (var i = 0; i < displayBins.length; i++) {
        amounts[displayBins[i]] = 0;
    }

    for (var i = 0; i < aggregatedData.length; i++) {

        var checkDateFrom = moment(aggregatedData[i].date).isSameOrAfter(dateFrom);
        var checkDateTo = moment(aggregatedData[i].date).isSameOrBefore(dateTo);
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
                var dateWrapper = moment(new Date(aggregatedData[i].date)).startOf('year');
                amounts[dateWrapper.format('YYYY')] += aggregatedData[i].amount;
            }
            else if (display == "month") {
                var dateWrapper = moment(new Date(aggregatedData[i].date)).startOf('month');
                amounts[dateWrapper.format('MMM YYYY')] += aggregatedData[i].amount;
            }      
            else if (display == "week") {
                var dateWrapper = moment(new Date(aggregatedData[i].date)).startOf('week');
                amounts["Week of " + dateWrapper.format('MMM Do, YYYY')] += aggregatedData[i].amount;
            }  
            else if (display == "day") {
                var dateWrapper = moment(new Date(aggregatedData[i].date));
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
