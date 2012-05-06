/**
 * @class Ext.draw.Draw
 * Base Drawing class.  Provides base drawing functions.
 */

Ext.draw.Draw = {

    pathToStringRE: /,?([achlmqrstvxz]),?/gi,
    pathCommandRE: /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
    pathValuesRE: /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
    stopsRE: /^(\d+%?)$/,
    radian: Math.PI / 180,
    pi2: Math.PI * 2,
    snapEndsIntervalWeights: [[0, 15], [20, 4], [30, 2], [40, 4], [50, 9], [60, 4], [70, 2], [80, 4], [100, 15]],

    is: function(o, type) {
        type = String(type).toLowerCase();
        return (type == "object" && o === Object(o)) ||
            (type == "undefined" && typeof o == type) ||
            (type == "null" && o === null) ||
            (type == "array" && Array.isArray && Array.isArray(o)) ||
            (Object.prototype.toString.call(o).toLowerCase().slice(8, -1)) == type;
    },

    ellipsePath: function(sprite) {
        var attr = sprite.attr;
        return Ext.String.format("M{0},{1}A{2},{3},0,1,1,{0},{4}A{2},{3},0,1,1,{0},{1}z", attr.x, attr.y - attr.ry, attr.rx, attr.ry, attr.y + attr.ry);
    },

    rectPath: function(sprite) {
        var attr = sprite.attr;
        if (attr.radius) {
            return Ext.String.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z", attr.x + attr.radius, attr.y, attr.width - attr.radius * 2, attr.radius, -attr.radius, attr.height - attr.radius * 2, attr.radius * 2 - attr.width, attr.radius * 2 - attr.height);
        }
        else {
            return Ext.String.format("M{0},{1}l{2},0,0,{3},{4},0z", attr.x, attr.y, attr.width, attr.height, -attr.width);
        }
    },

    // Convert the passed arrayPath to a proper SVG path string (d attribute)
    pathToString: function(arrayPath) {
        if (Ext.isArray(arrayPath)) {
            arrayPath = arrayPath.join(',');
        }
        return arrayPath.replace(Ext.draw.Draw.pathToStringRE, "$1");
    },

    parsePathString: function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [],
            me = this;
        if (me.is(pathString, "array") && me.is(pathString[0], "array")) { // rough assumption
            data = me.pathClone(pathString);
        }
        if (!data.length) {
            Ext.draw.Draw.pathToString(pathString).replace(me.pathCommandRE, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(me.pathValuesRE, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b].concat(params.splice(0, 2)));
                    name = "l";
                    b = (b == "m") ? "l" : "L";
                }
                while (params.length >= paramCounts[name]) {
                    data.push([b].concat(params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        return data;
    },

    mapPath: function (path, matrix) {
        if (!matrix) {
            return path;
        }
        var x, y, i, ii, j, jj, pathi;
        path = this.path2curve(path);
        for (i = 0, ii = path.length; i < ii; i++) {
            pathi = path[i];
            for (j = 1, jj = pathi.length; j < jj-1; j += 2) {
                x = matrix.x(pathi[j], pathi[j + 1]);
                y = matrix.y(pathi[j], pathi[j + 1]);
                pathi[j] = x;
                pathi[j + 1] = y;
            }
        }
        return path;
    },

    pathClone: function(pathArray) {
        var res = [],
            j, jj, i, ii;
        if (!this.is(pathArray, "array") || !this.is(pathArray && pathArray[0], "array")) { // rough assumption
            pathArray = this.parsePathString(pathArray);
        }
        for (i = 0, ii = pathArray.length; i < ii; i++) {
            res[i] = [];
            for (j = 0, jj = pathArray[i].length; j < jj; j++) {
                res[i][j] = pathArray[i][j];
            }
        }
        return res;
    },

    pathToAbsolute: function (pathArray) {
        if (!this.is(pathArray, "array") || !this.is(pathArray && pathArray[0], "array")) { // rough assumption
            pathArray = this.parsePathString(pathArray);
        }
        var res = [],
            x = 0,
            y = 0,
            mx = 0,
            my = 0,
            i = 0,
            ln = pathArray.length,
            r, pathSegment, j, ln2;
        // MoveTo initial x/y position
        if (pathArray[0][0] == "M") {
            x = +pathArray[0][1];
            y = +pathArray[0][2];
            mx = x;
            my = y;
            i++;
            res[0] = ["M", x, y];
        }
        for (; i < ln; i++) {
            r = res[i] = [];
            pathSegment = pathArray[i];
            if (pathSegment[0] != pathSegment[0].toUpperCase()) {
                r[0] = pathSegment[0].toUpperCase();
                switch (r[0]) {
                    // Elliptical Arc
                    case "A":
                        r[1] = pathSegment[1];
                        r[2] = pathSegment[2];
                        r[3] = pathSegment[3];
                        r[4] = pathSegment[4];
                        r[5] = pathSegment[5];
                        r[6] = +(pathSegment[6] + x);
                        r[7] = +(pathSegment[7] + y);
                        break;
                    // Vertical LineTo
                    case "V":
                        r[1] = +pathSegment[1] + y;
                        break;
                    // Horizontal LineTo
                    case "H":
                        r[1] = +pathSegment[1] + x;
                        break;
                    case "M":
                    // MoveTo
                        mx = +pathSegment[1] + x;
                        my = +pathSegment[2] + y;
                    default:
                        j = 1;
                        ln2 = pathSegment.length;
                        for (; j < ln2; j++) {
                            r[j] = +pathSegment[j] + ((j % 2) ? x : y);
                        }
                }
            }
            else {
                j = 0;
                ln2 = pathSegment.length;
                for (; j < ln2; j++) {
                    res[i][j] = pathSegment[j];
                }
            }
            switch (r[0]) {
                // ClosePath
                case "Z":
                    x = mx;
                    y = my;
                    break;
                // Horizontal LineTo
                case "H":
                    x = r[1];
                    break;
                // Vertical LineTo
                case "V":
                    y = r[1];
                    break;
                // MoveTo
                case "M":
                    pathSegment = res[i];
                    ln2 = pathSegment.length;
                    mx = pathSegment[ln2 - 2];
                    my = pathSegment[ln2 - 1];
                default:
                    pathSegment = res[i];
                    ln2 = pathSegment.length;
                    x = pathSegment[ln2 - 2];
                    y = pathSegment[ln2 - 1];
            }
        }
        return res;
    },

    // Returns a path converted to a set of curveto commands
    path2curve: function (path) {
        var me = this,
            points = me.pathToAbsolute(path),
            ln = points.length,
            attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
            i, seg, segLn, point;

        for (i = 0; i < ln; i++) {
            points[i] = me.command2curve(points[i], attrs);
            if (points[i].length > 7) {
                    points[i].shift();
                    point = points[i];
                    while (point.length) {
                        points.splice(i++, 0, ["C"].concat(point.splice(0, 6)));
                    }
                    points.splice(i, 1);
                    ln = points.length;
                }
            seg = points[i];
            segLn = seg.length;
            attrs.x = seg[segLn - 2];
            attrs.y = seg[segLn - 1];
            attrs.bx = parseFloat(seg[segLn - 4]) || attrs.x;
            attrs.by = parseFloat(seg[segLn - 3]) || attrs.y;
        }
        return points;
    },

    interpolatePaths: function (path, path2) {
        var me = this,
            p = me.pathToAbsolute(path),
            p2 = me.pathToAbsolute(path2),
            attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
            attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
            fixArc = function (pp, i) {
                if (pp[i].length > 7) {
                    pp[i].shift();
                    var pi = pp[i];
                    while (pi.length) {
                        pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
                    }
                    pp.splice(i, 1);
                    ii = Math.max(p.length, p2.length || 0);
                }
            },
            fixM = function (path1, path2, a1, a2, i) {
                if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                    path2.splice(i, 0, ["M", a2.x, a2.y]);
                    a1.bx = 0;
                    a1.by = 0;
                    a1.x = path1[i][1];
                    a1.y = path1[i][2];
                    ii = Math.max(p.length, p2.length || 0);
                }
            };
        for (var i = 0, ii = Math.max(p.length, p2.length || 0); i < ii; i++) {
            p[i] = me.command2curve(p[i], attrs);
            fixArc(p, i);
            (p2[i] = me.command2curve(p2[i], attrs2));
            fixArc(p2, i);
            fixM(p, p2, attrs, attrs2, i);
            fixM(p2, p, attrs2, attrs, i);
            var seg = p[i],
                seg2 = p2[i],
                seglen = seg.length,
                seg2len = seg2.length;
            attrs.x = seg[seglen - 2];
            attrs.y = seg[seglen - 1];
            attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
            attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
            attrs2.bx = (parseFloat(seg2[seg2len - 4]) || attrs2.x);
            attrs2.by = (parseFloat(seg2[seg2len - 3]) || attrs2.y);
            attrs2.x = seg2[seg2len - 2];
            attrs2.y = seg2[seg2len - 1];
        }
        return [p, p2];
    },

    //Returns any path command as a curveto command based on the attrs passed
    command2curve: function (pathCommand, d) {
        var me = this;
        if (!pathCommand) {
            return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
        }
        if (pathCommand[0] != "T" && pathCommand[0] != "Q") {
            d.qx = d.qy = null;
        }
        switch (pathCommand[0]) {
            case "M":
                d.X = pathCommand[1];
                d.Y = pathCommand[2];
                break;
            case "A":
                pathCommand = ["C"].concat(me.arc2curve.apply(me, [d.x, d.y].concat(pathCommand.slice(1))));
                break;
            case "S":
                pathCommand = ["C", d.x + (d.x - (d.bx || d.x)), d.y + (d.y - (d.by || d.y))].concat(pathCommand.slice(1));
                break;
            case "T":
                d.qx = d.x + (d.x - (d.qx || d.x));
                d.qy = d.y + (d.y - (d.qy || d.y));
                pathCommand = ["C"].concat(me.quadratic2curve(d.x, d.y, d.qx, d.qy, pathCommand[1], pathCommand[2]));
                break;
            case "Q":
                d.qx = pathCommand[1];
                d.qy = pathCommand[2];
                pathCommand = ["C"].concat(me.quadratic2curve(d.x, d.y, pathCommand[1], pathCommand[2], pathCommand[3], pathCommand[4]));
                break;
            case "L":
                pathCommand = ["C"].concat(d.x, d.y, pathCommand[1], pathCommand[2], pathCommand[1], pathCommand[2]);
                break;
            case "H":
                pathCommand = ["C"].concat(d.x, d.y, pathCommand[1], d.y, pathCommand[1], d.y);
                break;
            case "V":
                pathCommand = ["C"].concat(d.x, d.y, d.x, pathCommand[1], d.x, pathCommand[1]);
                break;
            case "Z":
                pathCommand = ["C"].concat(d.x, d.y, d.X, d.Y, d.X, d.Y);
                break;
        }
        return pathCommand;
    },

    quadratic2curve: function (x1, y1, ax, ay, x2, y2) {
        var _13 = 1 / 3,
            _23 = 2 / 3;
        return [
                _13 * x1 + _23 * ax,
                _13 * y1 + _23 * ay,
                _13 * x2 + _23 * ax,
                _13 * y2 + _23 * ay,
                x2,
                y2
            ];
    },

    rotate: function (x, y, rad) {
        var cos = Math.cos(rad),
            sin = Math.sin(rad),
            X = x * cos - y * sin,
            Y = x * sin + y * cos;
        return {x: X, y: Y};
    },

    arc2curve: function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
        // for more information of where this Math came from visit:
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        var me = this,
            PI = Math.PI,
            radian = me.radian,
            _120 = PI * 120 / 180,
            rad = radian * (+angle || 0),
            res = [],
            math = Math,
            mcos = math.cos,
            msin = math.sin,
            msqrt = math.sqrt,
            mabs = math.abs,
            masin = math.asin,
            xy, cos, sin, x, y, h, rx2, ry2, k, cx, cy, f1, f2, df, c1, s1, c2, s2,
            t, hx, hy, m1, m2, m3, m4, newres, i, ln, f2old, x2old, y2old;
        if (!recursive) {
            xy = me.rotate(x1, y1, -rad);
            x1 = xy.x;
            y1 = xy.y;
            xy = me.rotate(x2, y2, -rad);
            x2 = xy.x;
            y2 = xy.y;
            cos = mcos(radian * angle);
            sin = msin(radian * angle);
            x = (x1 - x2) / 2;
            y = (y1 - y2) / 2;
            h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
            if (h > 1) {
                h = msqrt(h);
                rx = h * rx;
                ry = h * ry;
            }
            rx2 = rx * rx;
            ry2 = ry * ry;
            k = (large_arc_flag == sweep_flag ? -1 : 1) *
                    msqrt(mabs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)));
            cx = k * rx * y / ry + (x1 + x2) / 2;
            cy = k * -ry * x / rx + (y1 + y2) / 2;
            f1 = masin(((y1 - cy) / ry).toFixed(7));
            f2 = masin(((y2 - cy) / ry).toFixed(7));

            f1 = x1 < cx ? PI - f1 : f1;
            f2 = x2 < cx ? PI - f2 : f2;
            if (f1 < 0) {
                f1 = PI * 2 + f1;
            }
            if (f2 < 0) {
                f2 = PI * 2 + f2;
            }
            if (sweep_flag && f1 > f2) {
                f1 = f1 - PI * 2;
            }
            if (!sweep_flag && f2 > f1) {
                f2 = f2 - PI * 2;
            }
        }
        else {
            f1 = recursive[0];
            f2 = recursive[1];
            cx = recursive[2];
            cy = recursive[3];
        }
        df = f2 - f1;
        if (mabs(df) > _120) {
            f2old = f2;
            x2old = x2;
            y2old = y2;
            f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
            x2 = cx + rx * mcos(f2);
            y2 = cy + ry * msin(f2);
            res = me.arc2curve(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
        }
        df = f2 - f1;
        c1 = mcos(f1);
        s1 = msin(f1);
        c2 = mcos(f2);
        s2 = msin(f2);
        t = math.tan(df / 4);
        hx = 4 / 3 * rx * t;
        hy = 4 / 3 * ry * t;
        m1 = [x1, y1];
        m2 = [x1 + hx * s1, y1 - hy * c1];
        m3 = [x2 + hx * s2, y2 - hy * c2];
        m4 = [x2, y2];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if (recursive) {
            return [m2, m3, m4].concat(res);
        }
        else {
            res = [m2, m3, m4].concat(res).join().split(",");
            newres = [];
            ln = res.length;
            for (i = 0;  i < ln; i++) {
                newres[i] = i % 2 ? me.rotate(res[i - 1], res[i], rad).y : me.rotate(res[i], res[i + 1], rad).x;
            }
            return newres;
        }
    },

    pathDimensions: function (path) {
        if (!path || !path.length) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = this.path2curve(path);
        var x = 0,
            y = 0,
            X = [],
            Y = [],
            i = 0,
            ln = path.length,
            p, xmin, ymin, dim;
        for (; i < ln; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            }
            else {
                dim = this.curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X.concat(dim.min.x, dim.max.x);
                Y = Y.concat(dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        xmin = Math.min.apply(0, X);
        ymin = Math.min.apply(0, Y);
        return {
            x: xmin,
            y: ymin,
            path: path,
            width: Math.max.apply(0, X) - xmin,
            height: Math.max.apply(0, Y) - ymin
        };
    },

    intersectInside: function(path, cp1, cp2) {
        return (cp2[0] - cp1[0]) * (path[1] - cp1[1]) > (cp2[1] - cp1[1]) * (path[0] - cp1[0]);
    },

    intersectIntersection: function(s, e, cp1, cp2) {
        var p = [],
            dcx = cp1[0] - cp2[0],
            dcy = cp1[1] - cp2[1],
            dpx = s[0] - e[0],
            dpy = s[1] - e[1],
            n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0],
            n2 = s[0] * e[1] - s[1] * e[0],
            n3 = 1 / (dcx * dpy - dcy * dpx);

        p[0] = (n1 * dpx - n2 * dcx) * n3;
        p[1] = (n1 * dpy - n2 * dcy) * n3;
        return p;
    },

    intersect: function(subjectPolygon, clipPolygon) {
        var me = this,
            i = 0,
            ln = clipPolygon.length,
            cp1 = clipPolygon[ln - 1],
            outputList = subjectPolygon,
            cp2, s, e, ln2, inputList, j;
        for (; i < ln; ++i) {
            cp2 = clipPolygon[i];
            inputList = outputList;
            outputList = [];
            s = inputList[inputList.length - 1];
            j = 0;
            ln2 = inputList.length;
            for (; j < ln2; j++) {
                e = inputList[j];
                if (me.intersectInside(e, cp1, cp2)) {
                    if (!me.intersectInside(s, cp1, cp2)) {
                        outputList.push(me.intersectIntersection(s, e, cp1, cp2));
                    }
                    outputList.push(e);
                }
                else if (me.intersectInside(s, cp1, cp2)) {
                    outputList.push(me.intersectIntersection(s, e, cp1, cp2));
                }
                s = e;
            }
            cp1 = cp2;
        }
        return outputList;
    },

    curveDim: function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
            b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
            c = p1x - c1x,
            t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a,
            t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a,
            y = [p1y, p2y],
            x = [p1x, p2x],
            dot;
        if (Math.abs(t1) > 1e12) {
            t1 = 0.5;
        }
        if (Math.abs(t2) > 1e12) {
            t2 = 0.5;
        }
        if (t1 > 0 && t1 < 1) {
            dot = this.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
            x.push(dot.x);
            y.push(dot.y);
        }
        if (t2 > 0 && t2 < 1) {
            dot = this.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
            x.push(dot.x);
            y.push(dot.y);
        }
        a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
        b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
        c = p1y - c1y;
        t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a;
        t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a;
        if (Math.abs(t1) > 1e12) {
            t1 = 0.5;
        }
        if (Math.abs(t2) > 1e12) {
            t2 = 0.5;
        }
        if (t1 > 0 && t1 < 1) {
            dot = this.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
            x.push(dot.x);
            y.push(dot.y);
        }
        if (t2 > 0 && t2 < 1) {
            dot = this.findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
            x.push(dot.x);
            y.push(dot.y);
        }
        return {
            min: {x: Math.min.apply(0, x), y: Math.min.apply(0, y)},
            max: {x: Math.max.apply(0, x), y: Math.max.apply(0, y)}
        };
    },

    /**
     * @private
     *
     * Calculates bezier curve control anchor points for a particular point in a path, with a
     * smoothing curve applied. The smoothness of the curve is controlled by the 'value' parameter.
     * Note that this algorithm assumes that the line being smoothed is normalized going from left
     * to right; it makes special adjustments assuming this orientation.
     *
     * @param {Number} prevX X coordinate of the previous point in the path
     * @param {Number} prevY Y coordinate of the previous point in the path
     * @param {Number} curX X coordinate of the current point in the path
     * @param {Number} curY Y coordinate of the current point in the path
     * @param {Number} nextX X coordinate of the next point in the path
     * @param {Number} nextY Y coordinate of the next point in the path
     * @param {Number} value A value to control the smoothness of the curve; this is used to
     *                 divide the distance between points, so a value of 2 corresponds to
     *                 half the distance between points (a very smooth line) while higher values
     *                 result in less smooth curves. Defaults to 4.
     * @return {Object} Object containing x1, y1, x2, y2 bezier control anchor points; x1 and y1
     *                  are the control point for the curve toward the previous path point, and
     *                  x2 and y2 are the control point for the curve toward the next path point.
     */
    getAnchors: function (prevX, prevY, curX, curY, nextX, nextY, value) {
        value = value || 4;
        var math = Math,
            PI = math.PI,
            halfPI = PI / 2,
            abs = math.abs,
            sin = math.sin,
            cos = math.cos,
            atan = math.atan,
            control1Length, control2Length, control1Angle, control2Angle,
            control1X, control1Y, control2X, control2Y, alpha;

        // Find the length of each control anchor line, by dividing the horizontal distance
        // between points by the value parameter.
        control1Length = (curX - prevX) / value;
        control2Length = (nextX - curX) / value;

        // Determine the angle of each control anchor line. If the middle point is a vertical
        // turnaround then we force it to a flat horizontal angle to prevent the curve from
        // dipping above or below the middle point. Otherwise we use an angle that points
        // toward the previous/next target point.
        if ((curY >= prevY && curY >= nextY) || (curY <= prevY && curY <= nextY)) {
            control1Angle = control2Angle = halfPI;
        } else {
            control1Angle = atan((curX - prevX) / abs(curY - prevY));
            if (prevY < curY) {
                control1Angle = PI - control1Angle;
            }
            control2Angle = atan((nextX - curX) / abs(curY - nextY));
            if (nextY < curY) {
                control2Angle = PI - control2Angle;
            }
        }

        // Adjust the calculated angles so they point away from each other on the same line
        alpha = halfPI - ((control1Angle + control2Angle) % (PI * 2)) / 2;
        if (alpha > halfPI) {
            alpha -= PI;
        }
        control1Angle += alpha;
        control2Angle += alpha;

        // Find the control anchor points from the angles and length
        control1X = curX - control1Length * sin(control1Angle);
        control1Y = curY + control1Length * cos(control1Angle);
        control2X = curX + control2Length * sin(control2Angle);
        control2Y = curY + control2Length * cos(control2Angle);

        // One last adjustment, make sure that no control anchor point extends vertically past
        // its target prev/next point, as that results in curves dipping above or below and
        // bending back strangely. If we find this happening we keep the control angle but
        // reduce the length of the control line so it stays within bounds.
        if ((curY > prevY && control1Y < prevY) || (curY < prevY && control1Y > prevY)) {
            control1X += abs(prevY - control1Y) * (control1X - curX) / (control1Y - curY);
            control1Y = prevY;
        }
        if ((curY > nextY && control2Y < nextY) || (curY < nextY && control2Y > nextY)) {
            control2X -= abs(nextY - control2Y) * (control2X - curX) / (control2Y - curY);
            control2Y = nextY;
        }

        return {
            x1: control1X,
            y1: control1Y,
            x2: control2X,
            y2: control2Y
        };
    },

    /* Smoothing function for a path.  Converts a path into cubic beziers.  Value defines the divider of the distance between points.
     * Defaults to a value of 4.
     */
    smooth: function (originalPath, value) {
        var path = this.path2curve(originalPath),
            newp = [path[0]],
            x = path[0][1],
            y = path[0][2],
            j,
            points,
            i = 1,
            ii = path.length,
            beg = 1,
            mx = x,
            my = y,
            cx = 0,
            cy = 0;
        for (; i < ii; i++) {
            var pathi = path[i],
                pathil = pathi.length,
                pathim = path[i - 1],
                pathiml = pathim.length,
                pathip = path[i + 1],
                pathipl = pathip && pathip.length;
            if (pathi[0] == "M") {
                mx = pathi[1];
                my = pathi[2];
                j = i + 1;
                while (path[j][0] != "C") {
                    j++;
                }
                cx = path[j][5];
                cy = path[j][6];
                newp.push(["M", mx, my]);
                beg = newp.length;
                x = mx;
                y = my;
                continue;
            }
            if (pathi[pathil - 2] == mx && pathi[pathil - 1] == my && (!pathip || pathip[0] == "M")) {
                var begl = newp[beg].length;
                points = this.getAnchors(pathim[pathiml - 2], pathim[pathiml - 1], mx, my, newp[beg][begl - 2], newp[beg][begl - 1], value);
                newp[beg][1] = points.x2;
                newp[beg][2] = points.y2;
            }
            else if (!pathip || pathip[0] == "M") {
                points = {
                    x1: pathi[pathil - 2],
                    y1: pathi[pathil - 1]
                };
            } else {
                points = this.getAnchors(pathim[pathiml - 2], pathim[pathiml - 1], pathi[pathil - 2], pathi[pathil - 1], pathip[pathipl - 2], pathip[pathipl - 1], value);
            }
            newp.push(["C", x, y, points.x1, points.y1, pathi[pathil - 2], pathi[pathil - 1]]);
            x = points.x2;
            y = points.y2;
        }
        return newp;
    },

    findDotAtSegment: function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t;
        return {
            x: Math.pow(t1, 3) * p1x + Math.pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + Math.pow(t, 3) * p2x,
            y: Math.pow(t1, 3) * p1y + Math.pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + Math.pow(t, 3) * p2y
        };
    },


    /**
     * snapEnds is a utility function that gives you axis ticks information based on start, end
     * and preferred number of steps. It happens quite often that you have just a dataset and need to
     * build an axis. If you simply take min and max and divide delta to number of steps you could get
     * very ugly numbers. Lets say you have min = 0.532 and max = 0.823 and you want to draw axis
     * across 20 steps. Simple calculation like (max - min) / steps will give us: 0.014549(9), so
     * your axis will look like this:
     *
     *     0.532, 0.5465499, 0.5610998, 0.5756497, etc
     *
     * Not pretty at all. snapEnds will give different set of numbers for the same values:
     *
     *     0.5, 0.52, 0.54, 0.56, 0.58, 0.6, 0.62, ... 0.8, 0.82, 0.84
     *
     * It starts a bit earlier and ends a bit later and trying to find a step which will look nice.
     *
     * @param {Number} from The minimum value in the data
     * @param {Number} to The maximum value in the data
     * @param {Number} stepsMax The maximum number of ticks
     * @param {Number} endsLocked If true, the 'from' and 'to' parameters will be used as fixed end values
     *        and will not be adjusted
     * @return {Object} The calculated step and ends info; properties are:
     *     - from: The result start value, which may be lower than the original start value
     *     - to: The result end value, which may be higher than the original end value
     *     - power: The power of 10 used in the step calculation
     *     - step: The value size of each step
     *     - steps: The number of steps. NOTE: the steps may not divide the from/to range perfectly evenly;
     *              there may be a smaller distance between the last step and the end value than between prior
     *              steps, particularly when the `endsLocked` param is true. Therefore it is best to not use
     *              the `steps` result when finding the axis tick points, instead use the `step`, `to`, and
     *              `from` to find the correct point for each tick.
     */
    snapEnds: function (from, to, stepsMax, endsLocked) {
        var math = Math,
            pow = math.pow,
            floor = math.floor,

            // start with a precise step size
            step = (to - from) / stepsMax,

            // power is a power of 10 of the step. For axis 1, 2, 3 or 10, 20, 30 or
            // 0.1, 0.2, 0.3 power will be 0, 1 and -1 respectively.
            power = floor(math.log(step) / math.LN10) + 1,
            tenToPower = pow(10, power),

            // modulo will translate rounded value of the step to the 0 - 100 range. We will need it later.
            modulo = math.round((step % tenToPower) * pow(10, 2 - power)),

            // interval is an array of value/weight pairs
            interval = Ext.draw.Draw.snapEndsIntervalWeights,
            ln = interval.length,
            stepCount = 0,
            topWeight = 1e9,
            cur, value, weight, i, topValue;

        // round the start value by the power, so e.g. 0.532 will become 0.5.
        if (!endsLocked) {
            from = floor(from / tenToPower) * tenToPower;
        }
        cur = from;

        // find what is our step going to be to be closer to "pretty" numbers. This is done taking into
        // account the interval weights. This way we figure out topValue.
        for (i = 0; i < ln; i++) {
            value = interval[i][0];
            weight = (value - modulo) < 0 ? 1e6 : (value - modulo) / interval[i][1];
            if (weight < topWeight) {
                topValue = value;
                topWeight = weight;
            }
        }

        // with the new topValue, calculate the final step size
        step = floor(step * pow(10, -power)) * pow(10, power) + topValue * pow(10, power - 2);
        while (cur < to) {
            cur += step;
            stepCount++;
        }

        // Cut everything that is after tenth digit after floating point. This is to get rid of
        // rounding errors, i.e. 12.00000000000121212.
        if (!endsLocked) {
            to = +cur.toFixed(10);
        }

        return {
            from: from,
            to: to,
            power: power,
            step: step,
            steps: stepCount
        };
    },

    sorter: function (a, b) {
        return a.offset - b.offset;
    },

    rad: function(degrees) {
        return degrees % 360 * Math.PI / 180;
    },

    degrees: function(radian) {
        return radian * 180 / Math.PI % 360;
    },

    withinBox: function(x, y, bbox) {
        bbox = bbox || {};
        return (x >= bbox.x && x <= (bbox.x + bbox.width) && y >= bbox.y && y <= (bbox.y + bbox.height));
    },

    parseGradient: function(gradient) {
        var me = this,
            type = gradient.type || 'linear',
            angle = gradient.angle || 0,
            radian = me.radian,
            stops = gradient.stops,
            stopsArr = [],
            stop,
            vector,
            max,
            stopObj;

        if (type == 'linear') {
            vector = [0, 0, Math.cos(angle * radian), Math.sin(angle * radian)];
            max = 1 / (Math.max(Math.abs(vector[2]), Math.abs(vector[3])) || 1);
            vector[2] *= max;
            vector[3] *= max;
            if (vector[2] < 0) {
                vector[0] = -vector[2];
                vector[2] = 0;
            }
            if (vector[3] < 0) {
                vector[1] = -vector[3];
                vector[3] = 0;
            }
        }

        for (stop in stops) {
            if (stops.hasOwnProperty(stop) && me.stopsRE.test(stop)) {
                stopObj = {
                    offset: parseInt(stop, 10),
                    color: Ext.draw.Color.toHex(stops[stop].color) || '#ffffff',
                    opacity: stops[stop].opacity || 1
                };
                stopsArr.push(stopObj);
            }
        }
        // Sort by pct property
        stopsArr.sort(me.sorter);
        if (type == 'linear') {
            return {
                id: gradient.id,
                type: type,
                vector: vector,
                stops: stopsArr
            };
        }
        else {
            return {
                id: gradient.id,
                type: type,
                centerX: gradient.centerX,
                centerY: gradient.centerY,
                focalX: gradient.focalX,
                focalY: gradient.focalY,
                radius: gradient.radius,
                vector: vector,
                stops: stopsArr
            };
        }
    }
};
