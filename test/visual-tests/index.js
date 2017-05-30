function renderTest(d) {
  //console.log("rendering test"+d.index+" - "+d.label)

  //draw title
  d3.select(this).append('h2').text(function(d) {
    return d.label;
  });

  //make a wrapper for the chart
  var chartWrap = d3.select(this).append('div').attr('class', 'chart');

  //show notes (if any)
  var notes = d3.select(this)
    .append('div')
    .attr("class","notes")
    notes.append("div").html("<strong>File: </strong> ")
    .append("a")
    .attr("href",function(d){return "../samples/data/"+d.filename})
    .text(function(d){return d.filename})

    notes.append("div").html(function(d){return d.notes ? "<strong>Notes: </strong>"+d.notes : "" })

    d.tests = d.tests ? d.tests : ["No Tests Specified"]
    var tests =  notes.append("div").html("<strong>Tests: </strong> ")
    tests.append("ul")
    .selectAll("li")
    .data(d.tests)
    .enter()
    .append("li")
    .text(function(d){return d})


  //show settings
  var settingsWrap = d3
    .select(this)
    .append('div')
    .attr("class",'code test' + d.index)

  var settingsHead = settingsWrap.append("a")
  .style({"color":"blue","text-decoration":"underline"})
  .text("+ Settings")
  .on("click",function(){
    var wrap = this.parentNode
    var code = d3.select(wrap).select("pre")
    var status = code.classed("hidden")
    code.classed("hidden",!status)
    d3.select(this).text(status?"- Settings":"+ Settings")
  })

  var code = settingsWrap
    .append("pre")
    .attr("class","hidden")
    .append("code")
    .attr('class', "hljs")
    .html(JSON.stringify(d.settings, null, "  ").trim());

    hljs.highlightBlock(code.node());

    var thisChart = webCharts.createChart('div.test' + d.index + ' .chart', d.settings);
    //console.log(thisChart)
    thisChart.init(d.raw);
}

function drawCharts(path){
  console.log(path)
  d3.json(path,function(error,testConfig){
    console.log(error || testConfig)
    testConfig.forEach(function(d,i){d.index = i})

    var chartDivs = d3
      .select('.charts')
      .selectAll('div.testWrap')
      .data(testConfig)
      .enter()
      .append('div')
      .attr('class', function(d) {
        return 'testWrap test' + d.index;
      })


    //get all test data sets (once each)
    var dataPaths = d3
      .set(
        testConfig.map(function(d) {
          return d.filename;
        })
      )
      .values()
      .map(function(d){return {"filename":d, "path":"../samples/data/"+d}});

    console.log(dataPaths)
    //load the data and render the chart
    dataPaths.forEach(function(file) {
      d3.csv(file.path, function(error, data) {
        file.raw = data;

        var matches = chartDivs
        .filter(function(chart){

          if(chart.filename == file.filename){
            chart.raw = file.raw
          }
          return chart.filename == file.filename
        })
        .each(renderTest)
      });
    });
  })


}

d3.json("../samples/chart-config/testSettingList.json",function(error,allSettings){
  console.log(error||allSettings)
  var settingsSelect = d3.select(".controls").append("select").datum(allSettings)
  var options = settingsSelect
  .selectAll("option")
  .data(function(d){return d})
  .enter()
  .append("option")
  .text(function(d){return d.label})

  settingsSelect.on("change",function(d){
    var label = this.value
    var filename = d3.select(this).datum().filter(function(d){return d.label == label})[0].filename
    var path = "../samples/chart-config/"+filename
    d3.select(".charts").selectAll("*").remove()
    drawCharts("../samples/chart-config/"+filename)
  })

  //initialize the first set of tests on load
  drawCharts("../samples/chart-config/"+allSettings[0].filename)
})
