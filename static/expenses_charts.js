function randRGB() {
    return Math.floor(Math.random() * (255 + 1));
}

function updateCharts(aggregatedData, categories, persons, chartObject) {
    var chartSelector = $("select[name=chart_type]")[0];
    if (chartSelector.value === '')
        chartType = 'pie';
    else
        chartType = chartSelector.value;

    var displaySelector = $("select[name=display]")[0];
    if (displaySelector.value === '')
        display = 'category';
    else
        display = displaySelector.value;

    var categoriesChosen = [];
    var personsChosen = [];
    var dateTo = [];
    var dateFrom = [];

    for (var i = 0; i < 5; i++) {
        if ($("#filters-" + (i + 1)).is(":visible")) {

            var dateFromSelector = $("input[name=date_from_" + (i + 1) + "]")[0];
            if (dateFromSelector.value === '')
                dateFrom.push('None');
            else
                dateFrom.push(dateFromSelector.value);

            var dateToSelector = $("input[name=date_to_" + (i + 1) + "]")[0];
            if (dateToSelector.value === '')
                dateTo.push('None');
            else
                dateTo.push(dateToSelector.value);


            var selectorString = "select[name=categories_chosen_" + (i + 1) + "]";
            var categorySelector = $(selectorString)[0];
            if (categorySelector.value === '')
                categoriesChosen.push(categories);
            else {
                categoriesChosen.push([]);
                for (var j = 0; j < categorySelector.options.length; j++) {
                    if (categorySelector.options[j].selected)
                        categoriesChosen[i].push(categorySelector.options[j].value);
                }
            }

            var selectorString = "select[name=persons_chosen_" + (i + 1) + "]";
            var personsSelector = $(selectorString)[0];
            if (personsSelector.value === '')
                personsChosen.push(persons);
            else {
                personsChosen.push([]);
                for (var j = 0; j < personsSelector.options.length; j++) {
                    if (personsSelector.options[j].selected)
                        personsChosen[i].push(personsSelector.options[j].value);
                }
            }
        }
    }

    drawCharts(aggregatedData, chartType, dateFrom[0], dateTo[0], categoriesChosen[0], personsChosen[0], display, chartObject);
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

    var total,
        newBins = [];
    for (i = 0; i < displayBins.length; i++) {
        total = parseFloat(Math.round(amounts[displayBins[i]] * 100) / 100).toFixed(2);
        if (total !== '0.00') {
            amounts[displayBins[i]] = total;
            newBins.push(displayBins[i]);
        }
        else {
            delete amounts[displayBins[i]];
        }
    }
    displayBins = newBins;

    var chartLabels = Object.keys(amounts).map(function(k) {
        return k.charAt(0).toUpperCase() + k.slice(1);
    });

    var amountsData = [];
    let chartColors = [];
    for (var i = 0; i < displayBins.length; i++) {
      amountsData.push(amounts[displayBins[i]]);
      chartColors.push("rgba(" + randRGB() + ", " + randRGB() + ", " + randRGB() + ", 1)");
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
        var dataChart = chartObject;
    }
    else {
        var dataChart;
    }

    if (chartType == "pie") {
        dataChart = new Chart(canvas, {
                    type: 'pie',
                    data: chartData
                });

    } else if (chartType == "line") {
        dataChart = new Chart(canvas, {
            type: 'line',
            data: chartData
        });

    } else if (chartType == "bar") {
        dataChart = new Chart(canvas, {
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
