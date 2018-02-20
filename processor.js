console.log("Processor is here");
var processor = {
    prepareData : function (d) {
        if (d.length > 0 && typeof d[0] === "string") {
            return this.encodeData(d);
        }
        return [d, null];
    },
    encodeData : function (d) {
        console.log("Encoding non-numeric data", d);
        var e = [];
        for (var i = 0; i < d.length; i++) {
            var f = null;
            for (var j = 0; j < e.length; j++) {
                if(e[j][0] === d[i]) {
                    console.log("Encoder for "+d[i]+" already used as "+e[j][1]);
                    f = e[j][1];
                    j = e.length;
                }
            }
            if (f == null) {
                console.log("Encoder "+d[i]+" is not used. Allocating as "+e.length);
                f = e.length;
                e.push([d[i], e.length]);
            }
            d[i] = f;
        }
        console.log("Encoded data", d);
        console.log("Used encoders", e);
        return [d, e];
    },
    countDistances : function (d) {
        console.log("Proceeding distances for matrix", d);
        var m = [];
        for (var i = 0; i < d.length; i++) {
            var r = [];
            for (var j = 0; j < d.length; j++) {
                r.push(this.countDistance(d[i], d[j]));
            }
            m.push(r);
        }
        console.log("Distances matrix result", m);
        return m;
    },
    countDistance : function (x1, x2) {
        return Math.sqrt(
            Math.pow(
                (x1-x2),
                2
            )
        );
    },
    countSpanningTree : function (d) {

        function c (a, x, y) {
            var t = [];
            console.log("----- Соединение "+x+" с "+y+" в пуле "+JSON.stringify(a)+" и сброшенным временным пулом "+JSON.stringify(t));
            for (var i = 0; i < a.length; i++) { // this is a dirty hack to copy array to memory
                console.log("Помещаем во временнный пул значение "+JSON.stringify(a[i]));
                var m = [];
                for (var j = 0; j < a[i].length; j++) { // this is a dirty hack too
                    m.push(a[i][j]);
                }
                t.push([m, 0]);
            }
            console.log("Временный пул до изменнения "+JSON.stringify(t));
            if (t[x][0].indexOf(y) === -1) t[x][0].push(y);
            if (t[y][0].indexOf(x) === -1) t[y][0].push(x); // has we to do this?
            console.log("----- Временный пул "+JSON.stringify(t));
            return kruskala (t, x, null);
        }

        console.log("Counting spanning tree with data", d);

        var s = this.makeSpanningSides(d);

        console.log("Counted spanning sides [from, to, weight]", s);
        var m = this.makeFilledMatrix(d, "");

        var x = [];
        var u = 0;
        for(var i = 0; i< d.length; i++) {
            x.push([]);
        }
        for (i = 0; i < s.length; i++) {
            if (c(x, s[i][0], s[i][1])) {
                m[s[i][0]][s[i][1]] = m[s[i][1]][s[i][0]] = s[i][2];
                x[s[i][0]].push(s[i][1]);
                x[s[i][1]].push(s[i][0]);
                if(++u === d.length-1){
                    i = s.length;
                }
            }
        }
        console.log("Spanning tree", m);
        return m;

    },
    makeSpanningSides : function (d) {
        var s = [];
        for (var i = 0; i < d.length; i++) {
            for (var j = 0; j < d.length; j++) {
                if (d[i][j] !== 0) {
                    var f = false;
                    for (var k = 0; k < s.length; k++) {
                        if ((s[k][0] === i && s[k][1] === j) || (s[k][0] === j && s[k][1] === i)) {
                            f = true;
                        }
                    }
                    if (!f) {
                        s.push([i, j, d[i][j]]); // from, to, weight
                    }
                }
            }
        }
        s.sort(function (a, b) {
            if (a[2] < b[2]) {
                return -1;
            }
            if (a[2] > b[2]) {
                return 1;
            }
            return 0;
        });
        return s;
    },
    makeFilledMatrix : function (d, v) {
        var m = [];
        for (var i = 0; i < d.length; i++) {
            var r = [];
            for (var j = 0; j < d[i].length; j++) {
                r.push(v);
            }
            m.push(r);
        }
        return m;
    }
};

function kruskala (a, p, l) {
    console.log("Проверка точки "+p+" (из "+l+") "+JSON.stringify(a[p])+" из пула "+JSON.stringify(a));
    a[p][1]++;
    console.log("Точка имеет вес ", a[p][1]);
    if (a[p][1] > 1) { // DO NOT TOUCH THIS RED BUTTON!
        console.log("Вес превышен");
        return false;
    }
    for (var i = 0; i < a[p][0].length; i++) {
        if (a[p][0][i] !== l) {
            if (!kruskala (a, a[p][0][i], p)) return false;
        }
    }
    return true;
}