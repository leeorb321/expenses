function updateChartParams(aggregatedData, categories, persons, chartObject) {
    console.log(chartObject);

    var chartSelector = $("select[name=chart_type]")[0];
    if (chartSelector.value === '')
        chartType = 'pie';
    else
        chartType = chartSelector.value;

    var dateFromSelector = $("input[name=date_from]")[0];
    if (dateFromSelector.value === '')
        dateFrom = 'None';
    else
        dateFrom = dateFromSelector.value;

    var dateToSelector = $("input[name=date_to]")[0];
    if (dateToSelector.value === '')
        dateTo = 'None';
    else
        dateTo = (dateToSelector.value === '');

    var categorySelector = $("select[name=categories_chosen]")[0];
    if (categorySelector.value === '')
        categoriesChosen = categories;
    else {
        categoriesChosen = [];
        for (var i = 0; i < categorySelector.options.length; i++) {
            if (categorySelector.options[i].selected)
                categoriesChosen.push(categorySelector.options[i].value);
        }
    }

    var displaySelector = $("select[name=display]")[0];
    if (displaySelector.value === '')
        display = 'category';
    else
        display = displaySelector.value;

    var personsSelector = $("select[name=persons_chosen]")[0];
    if (personsSelector.value === '')
        personsChosen = persons;
    else {
        personsChosen = [];
        for (var i = 0; i < personsSelector.options.length; i++) {
            if (personsSelector.options[i].selected)
                personsChosen.push(personsSelector.options[i].value);
        }
    }

    drawCharts(aggregatedData, chartType, dateFrom, dateTo, categoriesChosen, personsChosen, display, chartObject);

}

function drawCharts(aggregatedData, chartType, dateFrom, dateTo, categoriesSelected, personsSelected, display, chartObject) {

    if (dateFrom === "None") {
        dateFrom = moment(aggregatedData[0].date);
    }
    else {
        dateFrom = moment(new Date(dateFrom));
    }

    if (dateTo === "None") {
        dateTo = moment(aggregatedData[aggregatedData.length - 1].date);
    }
    else {
        dateTo = moment(new Date(dateTo));
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

        incrementedDate.startOf("year");

        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push(incrementedDate.format("YYYY"));
            incrementedDate.add(1, "y");
        }
    }
    else if (display == "month") {

        incrementedDate.startOf("month");

        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push(incrementedDate.format("MMM YYYY"));
            incrementedDate.add(1, "M");
        }
    }
    else if (display == "week") {

        incrementedDate.startOf("week");

        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push("Week of " + incrementedDate.format("MMM Do, YYYY"));
            incrementedDate.add(1, "w");
        }
    }
    else if (display == "day") {

        while (incrementedDate.isSameOrBefore(dateTo)) {
            displayBins.push(incrementedDate.format("MMM Do, YYYY"));
            incrementedDate.add(1, "d");
        }
    }


    var amounts = {};
    for (var i = 0; i < displayBins.length; i++) {
        amounts[displayBins[i]] = 0;
    }

    for (i = 0; i < aggregatedData.length; i++) {

        var checkDateFrom = moment(aggregatedData[i].date).isSameOrAfter(dateFrom);
        var checkDateTo = moment(aggregatedData[i].date).isSameOrBefore(dateTo);
        var checkPersons = personsSelected.indexOf(aggregatedData[i].person.toLowerCase()) > -1;
        var checkCategories = categoriesSelected.indexOf(aggregatedData[i].category.toLowerCase()) > -1;
        var dateGroups = ["year", "month", "week", "day"];

        if (checkDateFrom && checkDateTo && checkCategories && checkPersons) {

            if (display == "category") {
                amounts[aggregatedData[i].category.toLowerCase()] += aggregatedData[i].amount;
            }
            else if (display == "person") {
                amounts[aggregatedData[i].person.toLowerCase()] += aggregatedData[i].amount;
            }
            else if (dateGroups.indexOf(display) >= 0) {
                groupbyDate(display, aggregatedData[i], amounts);
            }
        }
    }

    for (i = 0; i < displayBins.length; i++) {
      amounts[displayBins[i]] = parseFloat(Math.round(amounts[displayBins[i]] * 100) / 100).toFixed(2);
    }

    var chartLabels = Object.keys(displayBins).map(function(k) {
        return displayBins[k].charAt(0).toUpperCase() + displayBins[k].slice(1);
    });

    var amountsData = [];
    var chartColors = [];
    for (var i = 0; i < displayBins.length; i++) {
      amountsData.push(amounts[displayBins[i]]);
      chartColors.push("#"+Math.floor(Math.random()*16777215).toString(16));
    }

    var chartData = {
        labels: chartLabels,
        datasets: [
            {
                backgroundColor: chartColors,
                data: amountsData
            }
        ]
    };

    if (chartObject != null) {
        chartObject.destroy();
    }

    if (chartType == "pie") {
        var dataChart = new Chart(canvas, {
                    type: 'pie',
                    data: chartData
                });

    } else if (chartType == "line") {
        var dataChart = new Chart(canvas, {
            type: 'line',
            data: chartData
        });

    } else if (chartType == "bar") {
        var dataChart = new Chart(canvas, {
            type: 'bar',
            data: chartData
        });
    }

    return dataChart;
}

function groupbyDate(period, row, amounts) {
    var dateWrapper = moment(new Date(row.date)).startOf("year");
    if (period == "year") {
        amounts[dateWrapper.format("YYYY")] += row.amount;
    } else if (period == "month") {
        dateWrapper = moment(new Date(row.date)).startOf("month");
        amounts[dateWrapper.format("MMM YYYY")] += row.amount;
    }
    else if (period == "week") {
        dateWrapper = moment(new Date(row.date)).startOf("week");
        amounts["Week of " + dateWrapper.format("MMM Do, YYYY")] += row.amount;
    }
    else if (period == "day") {
        dateWrapper = moment(new Date(row.date));
        amounts[dateWrapper.format("MMM Do, YYYY")] += row.amount;
    }
}
