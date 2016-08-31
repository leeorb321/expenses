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

    drawCharts(aggregatedData, chartType, dateFrom, dateTo, categoriesChosen, personsChosen, display, chartObject);
}

function drawCharts(aggregatedData, chartType, dateFrom, dateTo, categoriesSelected, personsSelected, display, chartObject) {

    var minDate,
        maxDate,
        totalCategories = [],
        totalPersons = [];

    categoriesSelected.forEach(function(bin) {
        bin.forEach(function(element) {
            if (totalCategories.indexOf(element) === -1) {
                totalCategories.push(element);
            }
        });
    });

    personsSelected.forEach(function(bin) {
        bin.forEach(function(element) {
            if (totalPersons.indexOf(element) === -1) {
                totalPersons.push(element);
            }
        });
    });

    if (dateFrom.indexOf("None") > -1) {
        minDate = moment(aggregatedData[0].date);
    }
    else {
        minDate = moment(dateFrom.reduce(function (prev, element) { 
            return moment(element).isSameOrBefore(moment(prev)) ? element : prev;
        }));
    }

    if (dateTo.indexOf("None") > -1) {
        maxDate = moment(aggregatedData[aggregatedData.length - 1].date);
    }
    else {
        maxDate = moment(dateTo.reduce(function (prev, element) { 
            return moment(element).isSameOrAfter(moment(prev)) ? element : prev;
        }));
    }

    var displayBins = [],
        incrementedDate = moment(minDate);


    if (display == "category") {
        displayBins = totalCategories;
    }
    else if (display == "person") {
        displayBins = totalPersons;
    }
    else if (display == "year") {

        incrementedDate.startOf("year");

        while (incrementedDate.isSameOrBefore(maxDate)) {
            displayBins.push(incrementedDate.format("YYYY"));
            incrementedDate.add(1, "y");
        }
    }
    else if (display == "month") {

        incrementedDate.startOf("month");

        while (incrementedDate.isSameOrBefore(maxDate)) {
            displayBins.push(incrementedDate.format("MMM YYYY"));
            incrementedDate.add(1, "M");
        }
    }
    else if (display == "week") {

        incrementedDate.startOf("week");

        while (incrementedDate.isSameOrBefore(maxDate)) {
            displayBins.push("Week of " + incrementedDate.format("MMM Do, YYYY"));
            incrementedDate.add(1, "w");
        }
    }
    else if (display == "day") {

        while (incrementedDate.isSameOrBefore(maxDate)) {
            displayBins.push(incrementedDate.format("MMM Do, YYYY"));
            incrementedDate.add(1, "d");
        }
    }

    var amounts = [];
    // categoriesSelected.length here is an arbitrary choice--could be persons, dates, etc.
    // All will be arrays of length representing the number of filters the user has open
    for (var j = 0; j < categoriesSelected.length; j++) {
        amounts.push({});
        for (var i = 0; i < displayBins.length; i++) {
            amounts[j][displayBins[i]] = 0;
        }
    }

    for (var j = 0; j < amounts.length; j ++) {
        for (i = 0; i < aggregatedData.length; i++) {

            if (dateFrom[j] === "None") {
                var checkDateFrom = moment(aggregatedData[i].date).isSameOrAfter(minDate)
            }
            else {
                var checkDateFrom = moment(aggregatedData[i].date).isSameOrAfter(moment(dateFrom[j]))
            }

            if (dateTo[j] === "None") {
                var checkDateTo = moment(aggregatedData[i].date).isSameOrBefore(maxDate)
            }
            else {
                var checkDateTo = moment(aggregatedData[i].date).isSameOrBefore(moment(dateTo[j]))
            }

            var checkPersons = personsSelected[j].indexOf(aggregatedData[i].person.toLowerCase()) > -1;
            var checkCategories = categoriesSelected[j].indexOf(aggregatedData[i].category.toLowerCase()) > -1;
            var dateGroups = ["year", "month", "week", "day"];

            if (checkDateFrom && checkDateTo && checkCategories && checkPersons) {

                if (display == "category") {
                    amounts[j][aggregatedData[i].category.toLowerCase()] += aggregatedData[i].amount;
                }
                else if (display == "person") {
                    amounts[j][aggregatedData[i].person.toLowerCase()] += aggregatedData[i].amount;
                }
                else if (dateGroups.indexOf(display) >= 0) {
                    groupbyDate(display, aggregatedData[i], amounts[j]);
                }
            }
        }
    }

    var chartLabels = displayBins.map(function(element) {
        return element.charAt(0).toUpperCase() + element.slice(1);
    });

    var amountsData = [];
    for (var j = 0; j < amounts.length; j++) {
        amountsData.push([]);
        for (var i = 0; i < displayBins.length; i++) {
          amountsData[j].push(amounts[j][displayBins[i]]);
        }
    }

    var datasets = [];
    if (amounts.length === 1) {
        var chartColors = [];
            for (var i = 0; i < displayBins.length; i++) {
                chartColors.push("rgba(" + randRGB() + ", " + randRGB() + ", " + randRGB() + ", 1)");
            }
        datasets.push({
            label: "Filter 1",
            backgroundColor: chartColors,
            borderColor: chartColors,
            data: amountsData[0],
            fill: false,
        });
    }
    else {
        for (var i = 0; i < amounts.length; i++) {
            var genColor = "rgba(" + randRGB() + ", " + randRGB() + ", " + randRGB() + ", 1)";
            datasets.push({
                label: "Filter " + (i + 1),
                fill: false,
                backgroundColor: genColor,
                borderColor: genColor,
                data: amountsData[i],
            });
        }
    }

    var chartData = {
        labels: chartLabels,
        datasets: datasets
    };
 
    if (chartObject.length > 0) {
        chartObject[0].destroy();
        canvas.clearRect(0, 0, canvas.width, canvas.height);
        chartObject = [];
    }

    if (chartType == "pie") {
        chartObject.push(new Chart(canvas, {
                    type: 'pie',
                    data: chartData
                }));
    } else if (chartType == "line") {
        chartObject.push(new Chart(canvas, {
            type: 'line',
            data: chartData
        }));
    } else if (chartType == "bar") {
        chartObject.push(new Chart(canvas, {
            type: 'bar',
            data: chartData
        }));
    }
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
