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
        $("#parametersLength").attr("max", x.length).val(l);
        $("#recordsLength").attr("max", d.length).val(s);
        ui.redrawTables(d, x, l, s);
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

            $("#bottomContainer").append("<div class='analysisProccessBoxContainer'><div class='analysisProccessBox'><h1>Кластерный анализ для \""+horizontalAxis[i]+"\"</h1><div class='contents'><div class='section distances'><h2>Матрица расстояний</h2><table><thead><tr><td></td><td>"+verticalAxis.join("</td><td>")+"</td></tr></thead><tbody>"+distancesTableContents+"</tbody></table></div><div class='section spanningTree'><h2>Матрица остовного дерева</h2><table><thead><tr><td></td><td>"+verticalAxis.join("</td><td>")+"</td></tr></thead><tbody>"+spanningTreeContents+"</tbody></table></div><div class='section'></div></div></div></div>")


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
    }
};