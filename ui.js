console.log("UI is here");
var ui = {
    init : function (variantNumber, variantName, data, axis, horizontalAxisDefaultSize, verticalAxisDefaultSize) {
        console.info("UI initializing...");
        ui.drawDataTable(variantNumber, variantName, data, axis, horizontalAxisDefaultSize, verticalAxisDefaultSize);
    },
    drawDataTable : function (variantNumber, variantName, data, axis, horizontalAxisDefaultSize, verticalAxisDefaultSize) {
        ui.writeTexts(variantNumber, variantName);
        ui.initTable(data, axis, horizontalAxisDefaultSize, verticalAxisDefaultSize);
    },
    writeTexts : function (variantNumber, variantName) {

    },
    initTable : function (d, x, l, s) {
        var q = x.length < l ? x.length : l;
        var w = d.length < s ? d.length : s;
        $("#parametersLength").attr("max", x.length).val(q);
        $("#recordsLength").attr("max", d.length).val(w);
        ui.redrawTables(d, x, q, w);
    },
    redrawTables : function (d, x, l, s) {
        console.log("Redrawing table", d, x, l, s);
        $("#bottomContainer").html("");
        $("#initialMatrixContentsTable").html("<thead><tr></tr></thead><tbody></tbody>");
        var h = [];
        var v = [];
        var a = [];
        for(var i=0; i < l; i++) {
            $("#initialMatrixContentsTable thead tr").append("<td>"+x[i]+"</td>");
            h.push(x[i]);
        }
        for(i=0; i < s; i++) {
            var c = "";
            var r = [];
            for(var j=0; j < l; j++) {
                c += "<td>"+d[i][j]+"</td>";
                if(j === 0) {
                    v.push(d[i][j]);
                } else {
                    r.push(d[i][j]);
                }
            }
            a.push(r);
            $("#initialMatrixContentsTable tbody").append("<tr>"+c+"</tr>");
        }
        ui.redrawAnalysis(a, h, v);
    },
    redrawAnalysis : function (data, horizontalAxis, verticalAxis) {
        console.log("Redrawing analysis", data, horizontalAxis, verticalAxis);

        for(var i=1; i < horizontalAxis.length; i++) {

            console.log("Redrawing analysis for "+horizontalAxis[i]);

            var dataColumn = [];
            for(var i2=0; i2<data.length; i2++) {
                dataColumn.push(data[i2][i-1]);
            }

            console.log("Column data for "+horizontalAxis[i], dataColumn);

            var rawString, i3;
            var distancesTableContents = "";
            var preparedData = processor.prepareData(dataColumn);

            var encodedData = preparedData[0];
            var encoders = preparedData[1];

            var distancesMatrix = processor.countDistances(encodedData);

            for(i2 = 0; i2 < distancesMatrix.length; i2++) {

                rawString = "<tr><td class='naming'>"+verticalAxis[i2]+"</td>";

                for(i3 = 0; i3 < distancesMatrix[i2].length; i3++) {
                    rawString += "<td>"+distancesMatrix[i2][i3]+"</td>";
                }

                rawString += "</tr>";

                distancesTableContents += rawString;
            }

            var spanningTreeContents = "";
            var spanningTree = processor.countSpanningTree(distancesMatrix);

            for(i2 = 0; i2 < spanningTree.length; i2++) {

                rawString = "<tr><td class='naming'>"+verticalAxis[i2]+"</td>";

                for(i3 = 0; i3 < spanningTree[i2].length; i3++) {
                    rawString += "<td>"+spanningTree[i2][i3]+"</td>";
                }

                rawString += "</tr>";

                spanningTreeContents += rawString;
            }

            $("#bottomContainer").append("<div class='analysisProccessBoxContainer'><div class='analysisProccessBox'><h1>Кластерный анализ для \""+horizontalAxis[i]+"\"</h1><div class='contents'><div class='section distances'><h2>Матрица расстояний</h2><table><thead><tr><td></td><td>"+verticalAxis.join("</td><td>")+"</td></tr></thead><tbody>"+distancesTableContents+"</tbody></table></div><div class='section spanningTree'><h2>Матрица остовного дерева</h2><table><thead><tr><td></td><td>"+verticalAxis.join("</td><td>")+"</td></tr></thead><tbody>"+spanningTreeContents+"</tbody></table></div><div class='section'></div></div><div class='visualization'><div id='vis"+i+"'></div></div></div></div>")

            this.drawSpanningTree(distancesMatrix, spanningTree, verticalAxis, i);

        }
    },
    showWindowWithMatrix : function (d) {
        $("#windowOverlay").removeClass("hidden");
        var s = JSON.stringify(d, null, 2);
        $("#windowOverlay .window textarea").val(s);
    },
    applyMatrixFromWindow : function (s, f) {
        $("#windowOverlay").addClass("hidden");
        if(s !== null) {
            var d = null;
            try {
                d = JSON.parse(s);
            } catch (e) {
                console.log("Error occurred");
            }
            if (d !== null) {
                f (d);
            }

        }
    },
    drawSpanningTree : function (d, t, a, k) {

        var links = [], nodes = {};

        for(var i = 0; i < d.length; i++) {
            for(var j = 0; j < d[i].length; j++) {
                links.push({
                    target : a[i],
                    source : a[j],
                    value : d[i][j] / 50, // !!!! fix that
                    type : t[i][j] !== 0
                });
            }
        }

        // Compute the distinct nodes from the links.
        links.forEach(function(link) {
            link.source = nodes[link.source] ||
                (nodes[link.source] = {name: link.source});
            link.target = nodes[link.target] ||
                (nodes[link.target] = {name: link.target});
            link.value = +link.value;
            link.type  = +link.type;
        });

        var width  = $(".analysisProccessBox .visualization").width(),
            height = $(".analysisProccessBox .visualization").height();

        var factor = 200;
        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([width, height])
            .linkDistance(function(d) { return d.value*factor; })  //sort of works
            .linkStrength(function(d) { return d.value/factor; })  //sort of works
            .charge(-1000)
            .on("tick", tick)
            .start();

        // Set the range
        var  v = d3.scale.linear().range([0, 1]);

        // Scale the range of the data
        v.domain([0, d3.max(links, function(d) { return d.value; })]);

        var svg = d3.select("#vis"+k).append("svg")
            .attr("width", width)
            .attr("height", height);

        // add the links and the arrows
        var path = svg.append("svg:g").selectAll("path")
            .data(force.links())
            .enter().append("svg:path")
            .attr("class", function(d) { return "link " + d.opacity; })
            .style("stroke-width", function(d) { return d.value*30; });

        var path2 = svg.append("svg:g").selectAll("path")
            .data(force.links())
            .enter().append("svg:path")
            .attr("class", function(d) { return "link " + d.opacity; })
            .style("stroke-width", function(d) { return d.value*30; });

        // define the nodes
        var node = svg.selectAll(".node")
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            /*.on("click", click)
            .on("dblclick", dblclick)*/
            .call(force.drag);

        // add the nodes
        node.append("circle")
            .attr("r", 5);

        // add the text
        node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

        // add the lines
        function tick() {
            path.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y;

                return "M" +
                    d.source.x + "," +
                    d.source.y + "L" +
                    d.target.x + "," +
                    d.target.y;
            });

            path.style("opacity", function(d) { return d.value/1.3; });

            path2.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y;

                return "M" +
                    d.source.x + "," +
                    d.source.y + "L" +
                    d.target.x + "," +
                    d.target.y;
            });


            path2.style("opacity", function(d) {
                if (d.type === 1) {
                    return 1;
                } else {
                    return 0;
                }
            });
            path2.style("stroke", "white")
                .style("stroke-width", function(d) { return d.value*10; });

            node
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")"; });
        }

// action to take on mouse click
        function click() {
            d3.select(this).select("text").transition()
                .duration(750)
                .attr("x", 22)
                .style("fill", "steelblue")
                .style("stroke", "lightsteelblue")
                .style("stroke-width", ".5px")
                .style("font", "20px sans-serif");
            d3.select(this).select("circle").transition()
                .duration(750)
                .attr("r", 16)
                .style("fill", "red");
        }

// action to take on mouse double click
        function dblclick() {
            d3.select(this).select("circle").transition()
                .duration(750)
                .attr("r", 6)
                .style("fill", "#ccc");
            d3.select(this).select("text").transition()
                .duration(750)
                .attr("x", 12)
                .style("stroke", "none")
                .style("fill", "black")
                .style("stroke", "none")
                .style("font", "10px sans-serif");
        }
    }
};