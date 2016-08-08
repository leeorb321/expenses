function drawCharts(aggregatedData, chartType, dateFrom, dateTo, categoriesSelected, personsSelected) {

    console.log(personsSelected[0]);

    var amountsByCategory = {};
    for (var i=0; i < categoriesSelected.length; i++) {
      amountsByCategory[categoriesSelected[i]] = 0;
    }

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

    for (var i=0; i < aggregatedData.length; i++) {
        if (personsSelected[0] == "all") {
            if (aggregatedData[i].date >= dateFrom && aggregatedData[i].date <= dateTo) {
                amountsByCategory[aggregatedData[i].category.toLowerCase()] += aggregatedData[i].amount;
            }
        }
        else {
            if (aggregatedData[i].date >= dateFrom && aggregatedData[i].date <= dateTo && personsSelected.indexOf(aggregatedData[i].person.toLowerCase()) > -1) {
                amountsByCategory[aggregatedData[i].category.toLowerCase()] += aggregatedData[i].amount;
            }
        }
    }

    for (var i=0; i < categoriesSelected.length; i++) {
      amountsByCategory[categoriesSelected[i]] = parseFloat(Math.round(amountsByCategory[categoriesSelected[i]] * 100) / 100).toFixed(2);
    }

    if (chartType == "pie"){
        var chartData = [];
        for (var i=0; i < categoriesSelected.length; i++) {
          chartData.push({
            value: amountsByCategory[categoriesSelected[i]],
            label: categoriesSelected[i],
            color: '#'+Math.floor(Math.random()*16777215).toString(16)
          });
        }

        var dataChart = new Chart(canvas).Pie(chartData);

    } else if (chartType == "line") {
        var lineLabels = Object.keys(categoriesSelected).map(function(k) {
            return categoriesSelected[k].charAt(0).toUpperCase() + categoriesSelected[k].slice(1);
        });

        var amountsData = [];
        for (var i=0; i < categoriesSelected.length; i++) {
          amountsData.push(amountsByCategory[categoriesSelected[i]]);
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

        console.log(amountsData);

        var dataChart = new Chart(canvas).Line(chartData);
    }

}