function drawCharts(aggregatedData, allCategories, chartType, dateFrom, dateTo) {

    var amountsByCategory = {};
    for (var i=0; i < allCategories.length; i++) {
      amountsByCategory[allCategories[i]] = 0;
    }

    if (dateFrom === "None" && dateTo === "None") {
        for (var i=0; i < aggregatedData.length; i++) {
            amountsByCategory[aggregatedData[i].category.toLowerCase()] += aggregatedData[i].amount;
        }
    }
    else {
        for (var i=0; i < aggregatedData.length; i++) {
            if (aggregatedData[i].date >= dateFrom && aggregatedData[i].date <= dateTo) {
                amountsByCategory[aggregatedData[i].category.toLowerCase()] += aggregatedData[i].amount;
            }
        }
    }

    for (var i=0; i < allCategories.length; i++) {
      amountsByCategory[allCategories[i]] = parseFloat(Math.round(amountsByCategory[allCategories[i]] * 100) / 100).toFixed(2);
    }

    if (chartType == "pie"){
        var chartData = [];
        for (var i=0; i < allCategories.length; i++) {
          chartData.push({
            value: amountsByCategory[allCategories[i]],
            label: allCategories[i],
            color: '#'+Math.floor(Math.random()*16777215).toString(16)
          });
        }

        var dataChart = new Chart(canvas).Pie(chartData);

    } else if (chartType == "line") {
        var lineLabels = Object.keys(allCategories).map(function(k) {
            return allCategories[k].charAt(0).toUpperCase() + allCategories[k].slice(1);
        });

        var amountsData = [];
        for (var i=0; i < allCategories.length; i++) {
          amountsData.push(amountsByCategory[allCategories[i]]);
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